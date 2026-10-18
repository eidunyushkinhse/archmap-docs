// Сервер: читателю — сайт без следов авторского режима; автору — вход по скрытому адресу,
// редактор и API правок с пересборкой и автокоммитом.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { hashPassword } from "./auth.ts";
import { cleanGitEnv } from "./git.ts";
import { THEME_DIR } from "./paths.ts";
import { slugFromTitle, startServer, type DocsServer } from "./server.ts";

const PASSWORD = "very-secret-password";
let root = "";
let srv: DocsServer;
let base = "";
let cookie = "";

function tree(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "archmap-docs-srv-"));
  for (const [rel, text] of Object.entries(files)) {
    const abs = join(dir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, text);
  }
  return dir;
}

const get = (path: string, auth = false) => fetch(base + path, { headers: auth ? { cookie } : {}, redirect: "manual" });
const call = (method: string, path: string, body?: unknown, auth = true) =>
  fetch(base + path, {
    method,
    headers: { ...(auth ? { cookie } : {}), "x-requested-with": "docs", "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });

describe("сервер документации", () => {
  before(async () => {
    root = tree({
      "content/index.md": "---\ntitle: Документация\n---\nглавная\n",
      "content/user/index.md": "---\ntitle: Руководство пользователя\nshort: Пользователь\norder: 1\n---\nвводная\n",
      "content/user/a.md": "---\ntitle: Страница А\norder: 1\n---\n<!--@include: ../_shared/f.md-->\n\nСм. [Б](b.md#тут).\n",
      "content/user/b.md": "---\ntitle: Страница Б\norder: 2\n---\n## Тут\n",
      "content/_shared/f.md": "## Фрагмент\n",
      "content/en/index.md": "---\ntitle: Documentation\n---\nhome\n",
      "content/en/user/index.md": "---\ntitle: User guide\nshort: User\norder: 1\n---\nintro\n",
      "content/en/user/a.md": "---\ntitle: Page A\n---\n::: note\nsee \"Page A\"\n:::\n\n## Here\n",
    });
    srv = await startServer({
      contentDir: join(root, "content"),
      themeDir: THEME_DIR,
      distDir: join(root, "dist"),
      dataDir: join(root, "data"),
      port: 0,
      auth: { passwordHash: hashPassword(PASSWORD), secret: randomBytes(32) },
      quiet: true,
    });
    base = `http://127.0.0.1:${srv.port}`;
  });
  after(async () => {
    await srv.close();
    rmSync(root, { recursive: true, force: true });
  });

  it("читателю: страницы с деревом, без кнопок автора; 404; редактор и API закрыты", async () => {
    const home = await get("/");
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.match(html, /class="tree"/);
    assert.match(html, /Домашняя страница/);
    assert.match(html, /Руководство пользователя/);
    assert.doesNotMatch(html, /Редактировать|\/login/);
    assert.equal((await get("/user/a/")).status, 200);
    assert.equal((await get("/nope/")).status, 404);
    assert.equal((await get("/edit/")).status, 302);
    assert.equal((await get("/api/tree")).status, 401);
    assert.equal((await get("/api/git")).status, 401);
    assert.deepEqual(await (await get("/api/me")).json(), { author: false });
  });

  it("английская версия: адреса /en/, lang, подписи и кавычки, свой поиск и 404", async () => {
    const page = await get("/en/user/a/");
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /<html lang="en">/);
    assert.match(html, /class="nt-name">Home<\/span>/);
    assert.match(html, /placeholder="Search"/);
    assert.match(html, /<a class="brand" href="\/en\/">/);
    assert.match(html, /callout-title">Note<\/p>\s*<p>see “Page A”<\/p>/);
    assert.doesNotMatch(html, /Руководство пользователя/);
    const url = /data-search-url="([^"]+)"/.exec(html)?.[1] ?? "";
    assert.match(url, /^\/assets\/search-en\.json\?v=/);
    const index: { url: string }[] = await (await get(url)).json();
    assert.ok(index.length > 0 && index.every((d) => d.url.startsWith("/en/")));
    const ruHtml = await (await get("/user/a/")).text();
    assert.match(ruHtml, /<html lang="ru">/);
    assert.match(ruHtml, /data-search-url="\/assets\/search\.json\?v=/);
    const nf = await get("/en/nope/");
    assert.equal(nf.status, 404);
    assert.match(await nf.text(), /Page not found/);
    assert.match(await (await get("/nope/")).text(), /Страница не найдена/);
  });

  it("вход: страница без ссылок с сайта, неверный пароль — 401, верный — cookie и редирект", async () => {
    const page = await get("/login?next=/edit/");
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Пароль автора/);
    const bad = await fetch(`${base}/login`, { method: "POST", body: new URLSearchParams({ password: "nope", next: "/edit/" }), redirect: "manual" });
    assert.equal(bad.status, 401);
    const ok = await fetch(`${base}/login`, { method: "POST", body: new URLSearchParams({ password: PASSWORD, next: "/edit/?file=user%2Fa.md" }), redirect: "manual" });
    assert.equal(ok.status, 303);
    assert.equal(ok.headers.get("location"), "/edit/?file=user%2Fa.md");
    const set = ok.headers.getSetCookie();
    assert.equal(set.length, 2);
    assert.match(set[0], /^docs_session=.+; Path=\/; Max-Age=7776000; SameSite=Lax; HttpOnly$/);
    assert.match(set[1], /^docs_author=1; Path=\/; Max-Age=7776000; SameSite=Lax$/);
    cookie = set.map((c) => c.split(";")[0]).join("; ");
    assert.deepEqual(await (await get("/api/me", true)).json(), { author: true });
    assert.equal((await get("/edit/", true)).status, 200);
    // Открытая ссылка на внешний адрес в next не проходит
    const evil = await fetch(`${base}/login`, { method: "POST", body: new URLSearchParams({ password: PASSWORD, next: "//evil.example" }), redirect: "manual" });
    assert.equal(evil.headers.get("location"), "/edit/");
  });

  it("API: дерево и фрагменты, чтение страницы, предпросмотр с проверкой ссылок", async () => {
    const t = await (await get("/api/tree", true)).json();
    assert.deepEqual(t.tree.map((n: { title: string; kind: string }) => [n.title, n.kind]), [["Домашняя страница", "home"], ["Руководство пользователя", "guide"], ["English", "guide"]]);
    assert.deepEqual(t.tree[1].children.map((n: { file: string }) => n.file), ["user/a.md", "user/b.md"]);
    assert.equal(t.tree[2].file, "en/index.md");
    assert.deepEqual(t.tree[2].children.map((n: { file: string }) => n.file), ["en/user/index.md"]);
    assert.deepEqual(t.fragments, [{ file: "_shared/f.md", usedBy: ["user/a.md"] }]);
    const p = await (await get("/api/page?file=user%2Fa.md", true)).json();
    assert.equal(p.title, "Страница А");
    assert.equal(p.order, 1);
    assert.equal(p.url, "/user/a/");
    assert.match(p.body, /@include/);
    const f = await (await get("/api/page?file=_shared%2Ff.md", true)).json();
    assert.equal(f.isFragment, true);
    assert.deepEqual(f.usedBy, ["user/a.md"]);
    assert.equal((await get("/api/page?file=..%2Fetc%2Fpasswd", true)).status, 400);
    const pv = await (await call("POST", "/api/preview", { file: "user/a.md", title: "А", body: "[x](b.md#нет) [y](b.md#тут) [z](zzz.md)" })).json();
    assert.match(pv.html, /href="\/user\/b\/#нет"/);
    assert.deepEqual(pv.errors, ["якорь «#нет» не найден (user/b.md)", "ссылка на несуществующую страницу «zzz.md»"]);
    // Английская страница: подписи блоков по-английски, ссылки проверяются среди английских
    const en = await (await call("POST", "/api/preview", { file: "en/user/a.md", title: "A", body: "::: note\nx\n:::\n\n[ok](index.md) [ru](../../user/b.md)" })).json();
    assert.match(en.html, /callout-title">Note</);
    assert.deepEqual(en.errors, ["ссылка на несуществующую страницу «../../user/b.md»"]);
  });

  it("API: правка сохраняет файл и пересобирает сайт; без заголовка X-Requested-With — 403", async () => {
    const nope = await fetch(`${base}/api/page`, { method: "PUT", headers: { cookie, "content-type": "application/json" }, body: "{}" });
    assert.equal(nope.status, 403);
    const r = await (await call("PUT", "/api/page", { file: "user/b.md", title: "Страница Бэ", description: "Описание", order: 5, body: "## Тут\n\nновый текст" })).json();
    assert.equal(r.url, "/user/b/");
    assert.deepEqual(r.errors, []);
    // Временная папка не в рабочей копии git — автокоммит выключен, ответ это говорит
    assert.equal(r.commit, null);
    assert.equal(r.gitError, null);
    assert.equal(r.git.enabled, false);
    assert.equal(readFileSync(join(root, "content/user/b.md"), "utf8"), "---\ntitle: Страница Бэ\norder: 5\ndescription: Описание\n---\n\n## Тут\n\nновый текст\n");
    assert.match(await (await get("/user/b/")).text(), /Страница Бэ.*новый текст/s);
    // Битая ссылка после правки — ошибка в ответе, но сайт живёт
    const broken = await (await call("PUT", "/api/page", { file: "user/b.md", title: "Страница Бэ", body: "## Тут\n[x](nope.md)" })).json();
    assert.deepEqual(broken.errors, ["user/b.md: ссылка на несуществующую страницу «nope.md»"]);
    assert.equal((await get("/user/b/")).status, 200);
  });

  it("API: создание страницы, раздела и фрагмента; удаление с защитой раздела и главной", async () => {
    const c = await call("POST", "/api/page", { kind: "page", parent: "user/", slug: "new-page", title: "Новая" });
    assert.equal(c.status, 201);
    const created = await c.json();
    assert.equal(created.file, "user/new-page.md");
    assert.equal((await get("/user/new-page/")).status, 200);
    const s = await (await call("POST", "/api/page", { kind: "section", parent: "user/", slug: "sec", title: "Раздел" })).json();
    assert.equal(s.file, "user/sec/index.md");
    const inner = await (await call("POST", "/api/page", { kind: "page", parent: "user/sec/", slug: "inside", title: "Внутри" })).json();
    assert.equal(inner.url, "/user/sec/inside/");
    const fr = await (await call("POST", "/api/page", { kind: "fragment", slug: "note", title: "Заметка" })).json();
    assert.equal(fr.file, "_shared/note.md");
    assert.equal((await call("POST", "/api/page", { kind: "page", parent: "user/", slug: "new-page", title: "Дубль" })).status, 409);
    assert.equal((await call("POST", "/api/page", { kind: "page", parent: "nowhere/", slug: "x", title: "X" })).status, 400);
    assert.equal((await call("POST", "/api/page", { kind: "page", parent: "", slug: "Bad Slug", title: "X" })).status, 400);
    // Удаление
    assert.equal((await call("DELETE", "/api/page?file=index.md")).status, 400);
    assert.equal((await call("DELETE", "/api/page?file=en%2Findex.md")).status, 400);
    assert.equal((await call("DELETE", "/api/page?file=user%2Fsec%2Findex.md")).status, 409);
    assert.equal((await call("DELETE", "/api/page?file=user%2Fsec%2Finside.md")).status, 200);
    assert.equal((await call("DELETE", "/api/page?file=user%2Fsec%2Findex.md")).status, 200);
    assert.equal(existsSync(join(root, "content/user/sec")), false);
    assert.equal((await get("/user/sec/")).status, 404);
  });

  it("API: загрузка картинки — в content/images, отдаётся до появления ссылок", async () => {
    const png = Buffer.from("89504e470d0a1a0a", "hex");
    const up = await fetch(`${base}/api/upload?name=Снимок экрана.PNG`, { method: "POST", headers: { cookie, "x-requested-with": "docs" }, body: png });
    assert.equal(up.status, 201);
    const r = await up.json();
    assert.equal(r.path, "images/snimok-ekrana.png");
    assert.equal(r.markdown, '![Описание картинки](/images/snimok-ekrana.png "Подпись")');
    assert.equal((await get("/images/snimok-ekrana.png")).status, 200);
    assert.equal((await fetch(`${base}/api/upload?name=x.exe`, { method: "POST", headers: { cookie, "x-requested-with": "docs" }, body: png })).status, 400);
  });

  it("выход гасит cookie; адрес из названия — транслит", async () => {
    const out = await fetch(`${base}/logout`, { method: "POST", headers: { cookie, "x-requested-with": "docs" } });
    assert.equal(out.status, 204);
    assert.ok(out.headers.getSetCookie().every((c) => c.includes("Max-Age=0")));
    assert.equal(slugFromTitle("Навигация по проекту"), "navigatsiya-po-proektu");
    assert.equal(slugFromTitle("Docker Compose: установка!"), "docker-compose-ustanovka");
    assert.equal(slugFromTitle("***"), "page");
  });
});

describe("сервер с автокоммитом", () => {
  let root = "";
  let work = "";
  let srv2: DocsServer;
  let base2 = "";
  let cookie2 = "";
  const git = (cwd: string, ...args: string[]): string => execFileSync("git", args, { cwd, encoding: "utf8", env: cleanGitEnv() }).trim();
  const call2 = (method: string, path: string, body?: unknown) =>
    fetch(base2 + path, {
      method,
      headers: { cookie: cookie2, "x-requested-with": "docs", "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  before(async () => {
    root = tree({
      "work/content/index.md": "---\ntitle: Документация\n---\nглавная\n",
      "work/content/user/index.md": "---\ntitle: Руководство\nshort: Пользователь\norder: 1\n---\n",
      "work/content/user/a.md": "---\ntitle: А\n---\nтекст\n",
    });
    work = join(root, "work");
    const remote = join(root, "remote.git");
    git(root, "init", "-q", "--bare", "-b", "main", remote);
    git(work, "init", "-q", "-b", "main");
    git(work, "add", "-A");
    git(work, "-c", "user.name=Тест", "-c", "user.email=t@example.com", "commit", "-q", "-m", "начало");
    git(work, "remote", "add", "origin", remote);
    git(work, "push", "-q", "-u", "origin", "main");
    srv2 = await startServer({
      contentDir: join(work, "content"),
      themeDir: THEME_DIR,
      distDir: join(root, "dist"),
      dataDir: join(root, "data"),
      port: 0,
      auth: { passwordHash: hashPassword(PASSWORD), secret: randomBytes(32) },
      quiet: true,
      git: { dir: join(work, "content"), push: true, authorName: "Автор", authorEmail: "a@example.com" },
    });
    base2 = `http://127.0.0.1:${srv2.port}`;
    const ok = await fetch(`${base2}/login`, { method: "POST", body: new URLSearchParams({ password: PASSWORD }), redirect: "manual" });
    cookie2 = ok.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  });
  after(async () => {
    await srv2.close();
    rmSync(root, { recursive: true, force: true });
  });

  it("правка, раздел, удаление и картинка — по коммиту с понятным сообщением; всё отправлено в remote", async () => {
    const r = await (await call2("PUT", "/api/page", { file: "user/a.md", title: "А-я", body: "новый" })).json();
    assert.equal(r.commit.message, "Правка «А-я» (user/a.md)");
    assert.match(r.commit.hash, /^[0-9a-f]{7,}$/);
    assert.equal(r.gitError, null);
    assert.equal(r.git.enabled, true);
    assert.equal(r.git.push, true);
    const c = await (await call2("POST", "/api/page", { kind: "section", parent: "user/", slug: "sec", title: "Раздел" })).json();
    assert.equal(c.commit.message, "Новый раздел «Раздел» (user/sec/index.md)");
    const d = await (await call2("DELETE", "/api/page?file=user%2Fsec%2Findex.md")).json();
    assert.equal(d.commit.message, "Удалена страница «Раздел» (user/sec/index.md)");
    const up = await fetch(`${base2}/api/upload?name=pic.png`, { method: "POST", headers: { cookie: cookie2, "x-requested-with": "docs" }, body: Buffer.from("89504e47", "hex") });
    assert.equal((await up.json()).commit.message, "Картинка images/pic.png");
    // Повтор без изменений — коммита нет, но и ошибки нет
    const same = await (await call2("PUT", "/api/page", { file: "user/a.md", title: "А-я", body: "новый" })).json();
    assert.equal(same.commit, null);
    assert.equal(same.gitError, null);
    await srv2.git.flush();
    const s = await (await fetch(`${base2}/api/git`, { headers: { cookie: cookie2 } })).json();
    assert.equal(s.pending, 0);
    assert.equal(s.pushError, null);
    assert.equal(s.last.message, "Картинка images/pic.png");
    assert.equal(git(work, "status", "--porcelain"), "");
    assert.equal(git(work, "log", "-1", "--format=%an <%ae>"), "Автор <a@example.com>");
    assert.deepEqual(git(join(root, "remote.git"), "log", "--format=%s").split("\n"), [
      "Картинка images/pic.png",
      "Удалена страница «Раздел» (user/sec/index.md)",
      "Новый раздел «Раздел» (user/sec/index.md)",
      "Правка «А-я» (user/a.md)",
      "начало",
    ]);
  });
});
