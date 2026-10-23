// Подготовка сайта (чтение, рендер, проверка) и запись статики в dist/. Общее для CLI
// сборки (build.ts) и сервера (server.ts): сервер пересобирает dist/ после каждой правки
// автора и при изменении файлов на диске.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { listFragments, loadSites, makeReader, unusedFragments, validateSite } from "./content.ts";
import { createRenderer, DocsError } from "./markdown.ts";
import { renderNotFound, renderPage, type Assets } from "./render.ts";
import type { Lang, Page, Site } from "./types.ts";

export interface Prepared {
  site: Site;    // русский сайт — основной
  sites: Site[]; // сайты всех языков, русский первым
  errors: string[];
  warnings: string[];
  assets: Set<string>; // файлы из content/, на которые есть ссылки (копируются в dist)
}

// Читает content/, рендерит все страницы всех языков, проверяет ссылки. Ошибки содержимого
// собираются в список (страница с ошибкой рендерится плашкой); структурная ошибка (нет
// index.md, страница без названия) — исключение DocsError.
export function prepareSite(contentDir: string, langs?: readonly Lang[]): Prepared {
  const errors: string[] = [];
  const warnings: string[] = [];
  const assets = new Set<string>();
  const included = new Set<string>();
  const sites = loadSites(contentDir, langs);
  for (const site of sites) {
    const renderer = createRenderer(makeReader(contentDir), site.lang);
    for (const p of site.pages) {
      try {
        p.render = renderer.render(p.file, p.body, p.title);
      } catch (e) {
        if (!(e instanceof DocsError)) throw e;
        errors.push(e.message);
        p.render = {
          html: `<div class="callout callout-danger"><p class="callout-title">Ошибка сборки</p><p>${e.message.replace(/</g, "&lt;")}</p></div>`,
          headings: [], sections: [], links: [], assets: [], includes: [],
        };
      }
    }
    const v = validateSite(site, contentDir);
    errors.push(...v.errors);
    for (const a of v.assets) assets.add(a);
    for (const f of v.included) included.add(f);
  }
  // Фрагмент «никуда не включён», только если его не включил ни один язык
  warnings.push(...unusedFragments(contentDir, included));
  return { site: sites[0], sites, errors, warnings, assets };
}

function stamp(buf: Buffer | string): string {
  return createHash("sha1").update(buf).digest("hex").slice(0, 8);
}

function searchIndex(site: Site): string {
  const docs: { id: number; url: string; guide: string; title: string; heading: string; text: string }[] = [];
  for (const p of site.pages) {
    const guide = site.guides.find((g) => g.key === p.guide);
    for (const s of p.render?.sections ?? []) {
      docs.push({
        id: docs.length,
        url: p.url + (s.id ? `#${s.id}` : ""),
        guide: guide?.short ?? "",
        title: p.title,
        heading: s.id ? s.heading : "",
        text: s.text,
      });
    }
  }
  return JSON.stringify(docs);
}

// Индекс поиска языка: search.json у русского, search-en.json у английского
function searchFile(lang: Lang): string {
  return lang === "ru" ? "search.json" : `search-${lang}.json`;
}

// Статика темы с версией в адресе (кэш браузера сбрасывается при любой правке файла)
function writeAssets(outDir: string, themeDir: string, sites: Site[]): Assets {
  const assetsDir = join(outDir, "assets");
  mkdirSync(assetsDir, { recursive: true });
  const put = (name: string, content: Buffer | string): string => {
    writeFileSync(join(assetsDir, name), content);
    return `/assets/${name}?v=${stamp(content)}`;
  };
  const theme = (name: string) => readFileSync(join(themeDir, name));
  const css = put("docs.css", theme("docs.css"));
  const hljs = put("hljs.css", theme("hljs.css"));
  const js = put("docs.js", theme("docs.js"));
  const editorCss = put("editor.css", theme("editor.css"));
  const editorJs = put("editor.js", theme("editor.js"));
  put("minisearch.js", readFileSync(join(themeDir, "..", "node_modules", "minisearch", "dist", "umd", "index.js")));
  const search: Assets["search"] = {};
  for (const s of sites) search[s.lang] = put(searchFile(s.lang), searchIndex(s));
  const favicon = theme("favicon.svg");
  writeFileSync(join(outDir, "favicon.svg"), favicon);
  return { css, hljs, js, editorCss, editorJs, search, favicon: `/favicon.svg?v=${stamp(favicon)}` };
}

function writePage(outDir: string, url: string, html: string): void {
  const dir = join(outDir, url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

// Соседи страницы для «Назад/Дальше»: внутри руководства по порядку навигации
export function neighbours(site: Site, page: Page): { prev: Page | null; next: Page | null } {
  const guide = site.guides.find((g) => g.key === page.guide);
  if (!guide) return { prev: null, next: null };
  const i = guide.flat.indexOf(page);
  return { prev: guide.flat[i - 1] ?? null, next: guide.flat[i + 1] ?? null };
}

// Полная запись dist/: страницы, статика, картинки, индексы поиска, 404 каждого языка
// (404.html у русского, en/404.html у английского)
export function writeStatic(prepared: Prepared, outDir: string, contentDir: string, themeDir: string): Assets {
  if (outDir === "/" || outDir === contentDir || outDir === themeDir || outDir === dirname(contentDir)) {
    throw new Error(`отказ: папка сборки ${outDir} — не для dist`);
  }
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const assets = writeAssets(outDir, themeDir, prepared.sites);
  for (const site of prepared.sites) {
    for (const p of site.pages) {
      const { prev, next } = neighbours(site, p);
      writePage(outDir, p.url, renderPage(site, p, prev, next, assets));
    }
    const notFound = join(outDir, site.home.url, "404.html");
    mkdirSync(dirname(notFound), { recursive: true });
    writeFileSync(notFound, renderNotFound(site, assets));
  }
  for (const rel of prepared.assets) {
    const src = join(contentDir, rel);
    if (!existsSync(src)) continue;
    const dest = join(outDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
  }
  return assets;
}

// Карта «единого источника истины»: фрагмент → страницы всех языков, куда он включён
export function fragmentUsage(sites: Site[], contentDir: string): { file: string; usedBy: string[] }[] {
  const map = new Map<string, string[]>();
  for (const f of listFragments(contentDir)) map.set(f, []);
  for (const p of sites.flatMap((s) => s.pages)) {
    for (const inc of p.render?.includes ?? []) {
      const list = map.get(inc) ?? [];
      list.push(p.file);
      map.set(inc, list);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([file, usedBy]) => ({ file, usedBy }));
}

export function fragmentReport(sites: Site[], contentDir: string): string {
  const rows = fragmentUsage(sites, contentDir);
  if (!rows.length) return "Фрагментов нет.";
  return rows
    .map((r) => `  ${r.file}\n${r.usedBy.length ? r.usedBy.map((p) => `    → ${p}`).join("\n") : "    (никуда не включён)"}`)
    .join("\n");
}
