// Автокоммит: коммит папки содержимого в рабочей копии, отправка в удалённый репозиторий
// с повтором после pull --rebase, честная ошибка отправки, выключение вне git.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { cleanGitEnv, createAutoCommitter } from "./git.ts";

const AUTHOR = { authorName: "Тест", authorEmail: "test@example.com" };
// Окружение без переменных внешнего git: тесты идут и внутри pre-commit-хука
const git = (cwd: string, ...args: string[]): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", env: cleanGitEnv() }).trim();

// Рабочая копия с папкой content и первым коммитом
function repo(dir: string): string {
  mkdirSync(join(dir, "content"), { recursive: true });
  git(dir, "init", "-q", "-b", "main");
  writeFileSync(join(dir, "content/index.md"), "# Главная\n");
  git(dir, "add", "-A");
  git(dir, "-c", "user.name=Тест", "-c", "user.email=test@example.com", "commit", "-q", "-m", "начало");
  return join(dir, "content");
}

describe("автокоммит", () => {
  let tmp = "";
  before(() => { tmp = mkdtempSync(join(tmpdir(), "archmap-docs-git-")); });
  after(() => rmSync(tmp, { recursive: true, force: true }));

  it("вне рабочей копии git выключен", async () => {
    const dir = join(tmp, "plain");
    mkdirSync(dir);
    const c = await createAutoCommitter({ dir, ...AUTHOR });
    assert.equal(c.status().enabled, false);
    assert.equal(await c.commit("ничего"), null);
  });

  it("коммитит правки папки содержимого с заданным автором; без правок — null", async () => {
    const root = join(tmp, "local");
    mkdirSync(root);
    const content = repo(root);
    const c = await createAutoCommitter({ dir: content, ...AUTHOR });
    assert.deepEqual(c.status(), { enabled: true, branch: "main", push: false, pending: 0, pushError: null, last: null });
    writeFileSync(join(content, "user.md"), "# Пользователь\n");
    writeFileSync(join(root, "outside.txt"), "не содержимое — не коммитится\n");
    const r = await c.commit("Новая страница «Пользователь» (user.md)");
    assert.ok(r && /^[0-9a-f]{7,}$/.test(r.hash));
    assert.equal(git(root, "log", "-1", "--format=%s|%an <%ae>"), "Новая страница «Пользователь» (user.md)|Тест <test@example.com>");
    assert.equal(git(root, "status", "--porcelain"), "?? outside.txt");
    assert.equal(await c.commit("повтор"), null);
    assert.equal(c.status().last?.hash, r.hash);
    // Удаление файла — тоже коммит
    rmSync(join(content, "user.md"));
    const d = await c.commit("Удалена страница user.md");
    assert.ok(d);
    assert.equal(git(root, "show", "--stat", "--format=", "HEAD").includes("user.md"), true);
  });

  it("отправляет коммиты в удалённый репозиторий; чужие коммиты подтягивает rebase", async () => {
    const remote = join(tmp, "remote.git");
    git(tmp, "init", "-q", "--bare", "-b", "main", remote);
    const root = join(tmp, "stand");
    mkdirSync(root);
    const content = repo(root);
    git(root, "remote", "add", "origin", remote);
    git(root, "push", "-q", "-u", "origin", "main");
    const c = await createAutoCommitter({ dir: content, push: true, ...AUTHOR });
    writeFileSync(join(content, "a.md"), "# А\n");
    const a = await c.commit("Новая страница «А» (a.md)");
    assert.ok(a);
    await c.flush();
    assert.deepEqual(c.status(), { enabled: true, branch: "main", push: true, pending: 0, pushError: null, last: a });
    assert.equal(git(remote, "log", "-1", "--format=%s"), "Новая страница «А» (a.md)");
    // Кто-то запушил с другого устройства — отправка отклонена, pull --rebase и повтор
    const other = join(tmp, "laptop");
    git(tmp, "clone", "-q", remote, other);
    writeFileSync(join(other, "content/b.md"), "# Б с ноутбука\n");
    git(other, "add", "-A");
    git(other, "-c", "user.name=Ноутбук", "-c", "user.email=l@example.com", "commit", "-q", "-m", "с ноутбука");
    git(other, "push", "-q", "origin", "main");
    writeFileSync(join(content, "c.md"), "# В со стенда\n");
    const cc = await c.commit("Новая страница «В» (c.md)");
    assert.ok(cc);
    await c.flush();
    assert.equal(c.status().pushError, null);
    assert.deepEqual(git(remote, "log", "--format=%s").split("\n"), ["Новая страница «В» (c.md)", "с ноутбука", "Новая страница «А» (a.md)", "начало"]);
    assert.equal(git(root, "status", "--porcelain"), "");
  });

  it("недоступный удалённый репозиторий — коммит есть, ошибка отправки в статусе", async () => {
    const root = join(tmp, "offline");
    mkdirSync(root);
    const content = repo(root);
    git(root, "remote", "add", "origin", join(tmp, "nowhere.git"));
    const c = await createAutoCommitter({ dir: content, push: true, ...AUTHOR });
    writeFileSync(join(content, "x.md"), "# X\n");
    assert.ok(await c.commit("Правка x.md"));
    await c.flush();
    const s = c.status();
    assert.equal(s.pending, 1);
    assert.match(s.pushError ?? "", /nowhere\.git|does not appear|not found|No such/i);
    assert.equal(git(root, "log", "--format=%s").split("\n").length, 2);
  });
});
