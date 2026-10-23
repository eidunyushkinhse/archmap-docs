// Содержимое: обход папок, навигация и проверка ссылок на временном дереве content/.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { flattenNav, langsFromEnv, listFragments, listMarkdown, loadSite, loadSites, makeReader, navPath, validateSite } from "./content.ts";
import { createRenderer } from "./markdown.ts";

function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "archmap-docs-"));
  for (const [rel, text] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, text);
  }
  return root;
}

describe("loadSite", () => {
  let root = "";
  before(() => {
    root = tree({
      "index.md": "---\ntitle: Документация\n---\nпривет\n",
      "user/index.md": "---\ntitle: Руководство пользователя\nshort: Пользователь\norder: 1\n---\n",
      "user/b.md": "---\ntitle: Бэ\norder: 2\n---\n",
      "user/a.md": "---\ntitle: А\norder: 1\n---\n[к бэ](b.md#нет) [к фрагменту](../_shared/f.md)\n",
      "user/import/index.md": "---\ntitle: Импорт\norder: 3\n---\n",
      "user/import/yaml.md": "# YAML\n\n![](../../images/missing.png)\n",
      "admin/index.md": "---\ntitle: Руководство администратора\norder: 2\n---\n<!--@include: ../_shared/f.md-->\n",
      "_shared/f.md": "## Фрагмент\n",
      "_shared/unused.md": "никому не нужен\n",
      "images/a.png": "png",
    });
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it("страницы — вне «_»-папок, фрагменты — внутри", () => {
    assert.deepEqual(listMarkdown(root), ["admin/index.md", "index.md", "user/a.md", "user/b.md", "user/import/index.md", "user/import/yaml.md", "user/index.md"]);
    assert.deepEqual(listFragments(root), ["_shared/f.md", "_shared/unused.md"]);
  });

  it("руководства по порядку, навигация по order, раздел из подпапки, плоский список для prev/next", () => {
    const site = loadSite(root);
    assert.deepEqual(site.guides.map((g) => [g.key, g.short]), [["user", "Пользователь"], ["admin", "Руководство администратора"]]);
    const user = site.guides[0];
    assert.deepEqual(user.nav.map((n) => (n.kind === "page" ? n.page.title : `[${n.title}]`)), ["А", "Бэ", "[Импорт]"]);
    assert.deepEqual(flattenNav(user.nav).map((p) => p.url), ["/user/a/", "/user/b/", "/user/import/", "/user/import/yaml/"]);
    const yaml = site.byFile.get("user/import/yaml.md");
    assert.ok(yaml);
    assert.equal(yaml.title, "YAML");
    assert.doesNotMatch(yaml.body, /# YAML/);
    assert.deepEqual(navPath(user.nav, yaml).map((s) => s.title), ["Импорт"]);
  });

  it("проверка после рендера: битый якорь, ссылка на фрагмент, нет файла, неиспользуемый фрагмент", () => {
    const site = loadSite(root);
    const renderer = createRenderer(makeReader(root));
    for (const p of site.pages) p.render = renderer.render(p.file, p.body, p.title);
    const v = validateSite(site, root);
    assert.deepEqual(v.errors, [
      "user/a.md: якорь «#нет» не найден на странице user/b.md (есть: нет якорей)",
      "user/a.md: ссылка на несуществующую страницу «../_shared/f.md» (на фрагменты не ссылаются — только на страницы, куда они включены)",
      "user/import/yaml.md: файл не найден — «../../images/missing.png»",
    ]);
    assert.deepEqual(v.warnings, ["фрагмент _shared/unused.md никуда не включён"]);
    assert.deepEqual([...v.assets], []);
  });

  it("без папки en/ — только русский сайт", () => {
    assert.deepEqual(loadSites(root).map((s) => s.lang), ["ru"]);
  });
});

describe("языки", () => {
  let root = "";
  before(() => {
    root = tree({
      "index.md": "---\ntitle: Документация\n---\n",
      "user/index.md": "---\ntitle: Руководство пользователя\norder: 1\n---\n",
      "user/a.md": "---\ntitle: А\n---\n",
      "en/index.md": "---\ntitle: Documentation\n---\n",
      "en/user/index.md": "---\ntitle: User guide\nshort: User\norder: 1\n---\n",
      "en/user/b.md": "---\ntitle: Bee\norder: 2\n---\n",
      "en/user/a.md": "---\ntitle: Ay\norder: 1\n---\n[bee](b.md) [ru](../../user/a.md)\n",
    });
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it("русский сайт — без en/, английский — из en/ с адресами /en/ и тем же ключом руководства", () => {
    const [ru, en] = loadSites(root);
    assert.equal(ru.lang, "ru");
    assert.deepEqual(ru.pages.map((p) => p.file), ["index.md", "user/a.md", "user/index.md"]);
    assert.equal(en.lang, "en");
    assert.equal(en.home.url, "/en/");
    assert.deepEqual(en.guides.map((g) => [g.key, g.short, g.index.url]), [["user", "User", "/en/user/"]]);
    assert.deepEqual(flattenNav(en.guides[0].nav).map((p) => p.url), ["/en/user/a/", "/en/user/b/"]);
    assert.ok(en.pages.every((p) => p.lang === "en"));
  });

  it("список языков без en — английский сайт не строится, хотя папка en/ есть", () => {
    assert.deepEqual(loadSites(root, ["ru"]).map((s) => s.lang), ["ru"]);
    assert.deepEqual(langsFromEnv("ru"), ["ru"]);
    assert.deepEqual(langsFromEnv(" ru, en "), ["ru", "en"]);
    assert.deepEqual(langsFromEnv("en,xx"), ["en"]);
    assert.equal(langsFromEnv(undefined), undefined);
    assert.equal(langsFromEnv("  "), undefined);
  });

  it("ссылка на страницу другого языка — ошибка с подсказкой", () => {
    const en = loadSite(root, "en");
    const renderer = createRenderer(makeReader(root), "en");
    for (const p of en.pages) p.render = renderer.render(p.file, p.body, p.title);
    assert.deepEqual(validateSite(en, root).errors, [
      "en/user/a.md: ссылка на несуществующую страницу «../../user/a.md» (страница другого языка — ссылки между языками не ведутся)",
    ]);
  });
});
