// Автокоммит правок автора: после каждой правки через API сервер коммитит папку содержимого
// в рабочей копии git, а при включённой отправке — пушит в удалённый репозиторий. Правки,
// сделанные на диске мимо API (редактор кода, git pull), не трогаются — их коммитит человек.
// Если папка не в рабочей копии git — автокоммит выключен, сервер работает как прежде.
import { execFile } from "node:child_process";
import { relative } from "node:path";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

export interface GitOptions {
  dir: string;              // папка содержимого (внутри рабочей копии)
  push?: boolean;           // отправлять коммиты в удалённый репозиторий
  remote?: string;          // имя remote (по умолчанию origin)
  authorName?: string;      // автор коммитов, если в git config не задан
  authorEmail?: string;
  log?: (msg: string) => void;
}

export interface CommitInfo {
  hash: string;
  message: string;
}

export interface GitStatus {
  enabled: boolean;
  branch: string | null;
  push: boolean;
  pending: number;          // коммитов, ещё не отправленных в удалённый репозиторий
  pushError: string | null; // последняя ошибка отправки (null — всё отправлено)
  last: CommitInfo | null;  // последний коммит сервера
}

export interface AutoCommitter {
  status(): GitStatus;
  // Закоммитить правки папки содержимого; null — автокоммит выключен или нечего коммитить
  commit(message: string): Promise<CommitInfo | null>;
  // Дождаться очереди коммитов и отправок (остановка сервера, тесты)
  flush(): Promise<void>;
}

const DEFAULT_NAME = "Автор документации";
const DEFAULT_EMAIL = "docs@archmap.tech";
const PUSH_TIMEOUT_MS = 60_000;
// Переменные, которыми git управляет своими хуками и автором коммита: сервер, запущенный из
// хука или через `git -c …`, не должен их наследовать — иначе коммиты уйдут в чужой индекс
// и под чужим именем (так упали тесты внутри pre-commit)
const INHERITED_GIT_VARS = /^GIT_(DIR|WORK_TREE|INDEX_FILE|PREFIX|NAMESPACE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|CONFIG_PARAMETERS|AUTHOR_.*|COMMITTER_.*|EDITOR|REFLOG_ACTION)$/;

export function cleanGitEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && !INHERITED_GIT_VARS.test(k)) env[k] = v;
  }
  env.GIT_TERMINAL_PROMPT = "0";
  return env;
}

interface ExecError extends Error {
  code?: number | string;
  stderr?: string;
}

function errText(e: unknown): string {
  const err = e as ExecError;
  const stderr = err.stderr?.trim();
  return stderr || err.message || String(e);
}

export function disabledCommitter(): AutoCommitter {
  return {
    status: () => ({ enabled: false, branch: null, push: false, pending: 0, pushError: null, last: null }),
    commit: async () => null,
    flush: async () => undefined,
  };
}

export async function createAutoCommitter(opts: GitOptions): Promise<AutoCommitter> {
  const log = opts.log ?? (() => undefined);
  const env = { ...cleanGitEnv(), LC_ALL: "C" };
  const git = async (args: string[], timeout = 15_000): Promise<string> => {
    const { stdout } = await execFileP("git", args, { cwd: opts.dir, env, timeout, maxBuffer: 4 * 1024 * 1024 });
    return stdout.trim();
  };

  let root: string;
  try {
    root = await git(["rev-parse", "--show-toplevel"]);
  } catch {
    log("автокоммит выключен: папка содержимого не в рабочей копии git");
    return disabledCommitter();
  }
  const prefix = relative(root, opts.dir) || ".";
  const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]).catch(() => "HEAD");
  const remote = opts.remote ?? "origin";
  const push = opts.push === true;

  // Автор коммитов: явные настройки → git config рабочей копии → имя по умолчанию
  const configured = async (key: string) => git(["config", key]).catch(() => "");
  const name = opts.authorName || (await configured("user.name")) || DEFAULT_NAME;
  const email = opts.authorEmail || (await configured("user.email")) || DEFAULT_EMAIL;
  // Автор и коммиттер — через окружение: оно старше любого git config
  Object.assign(env, { GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email });

  let last: CommitInfo | null = null;
  let pending = 0;
  let pushError: string | null = null;

  // Коммиты — строго по очереди (индекс git один), отправка — отдельной очередью:
  // медленная сеть не должна задерживать ответ редактору
  let commitQueue: Promise<unknown> = Promise.resolve();
  let pushing: Promise<void> | null = null;
  let pushRequested = false;

  const pushOnce = async (): Promise<void> => {
    const args = ["push", "-q", remote, branch === "HEAD" ? "HEAD" : `HEAD:${branch}`];
    try {
      await git(args, PUSH_TIMEOUT_MS);
    } catch (first) {
      // Отклонено (кто-то запушил раньше) — подтянуть чужие коммиты и повторить
      try {
        await git(["pull", "--rebase", "-q", remote, branch], PUSH_TIMEOUT_MS);
      } catch (pull) {
        await git(["rebase", "--abort"]).catch(() => undefined);
        throw new Error(`${errText(first)}; pull --rebase: ${errText(pull)}`);
      }
      await git(args, PUSH_TIMEOUT_MS);
    }
  };

  const pushLoop = async (): Promise<void> => {
    while (pushRequested) {
      pushRequested = false;
      try {
        await pushOnce();
        pending = 0;
        pushError = null;
        log(`git: отправлено в ${remote}/${branch}`);
      } catch (e) {
        pushError = errText(e);
        log(`git: не удалось отправить в ${remote}: ${pushError}`);
      }
    }
    pushing = null;
  };
  const requestPush = (): void => {
    pushRequested = true;
    if (!pushing) pushing = pushLoop();
  };

  const commitNow = async (message: string): Promise<CommitInfo | null> => {
    // Команды идут из папки содержимого, поэтому «.» — ровно она (а не корень рабочей копии)
    await git(["add", "-A", "--", "."]);
    // diff --cached --quiet: код 1 — есть изменения, 0 — нечего коммитить
    const changed = await git(["diff", "--cached", "--quiet", "--", "."]).then(() => false, (e: ExecError) => {
      if (e.code === 1) return true;
      throw e;
    });
    if (!changed) return null;
    // Подключённый pre-commit-хук рабочей копии (сборка с проверкой ссылок) идёт как у
    // обычного коммита: не прошёл — правка остаётся на диске незакоммиченной, автор видит ошибку
    await git(["commit", "-q", "-m", message], 120_000);
    const hash = await git(["rev-parse", "--short", "HEAD"]);
    last = { hash, message };
    log(`git: коммит ${hash} — ${message}`);
    if (push) {
      pending += 1;
      requestPush();
    }
    return last;
  };

  log(`автокоммит включён: ${prefix} в ${root} (${branch})${push ? `, отправка в ${remote}` : ""}`);
  return {
    status: () => ({ enabled: true, branch, push, pending, pushError, last }),
    commit: (message) => {
      const job = commitQueue.then(() => commitNow(message));
      commitQueue = job.catch(() => undefined);
      return job;
    },
    flush: async () => {
      await commitQueue;
      while (pushing) await pushing;
    },
  };
}
