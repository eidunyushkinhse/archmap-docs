// Содержимое: обход content/, страницы и руководства, навигация, проверка ссылок и файлов.
//  - Руководство — папка верхнего уровня с index.md (титульная страница); её фронтматтер даёт
//    название, короткое имя (short) и порядок (order).
//  - Страница — любой .md вне папок с «_» в начале; подпапка — раздел навигации (заголовок —
//    из её index.md, если есть). Порядок — order во фронтматтере, затем по названию.
//  - Фрагменты для включений живут в папках с «_» (content/_shared); страницами они не становятся.
//  - Языки: русский сайт — корень content/, английский — content/en/ с той же структурой
//    (главная en/index.md, руководства en/user/…, адреса /en/…). У каждого языка свой сайт:
//    дерево, руководства, поиск; ссылки между языками сборка не пропускает.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fmNumber, fmString, splitFrontMatter } from "./frontmatter.ts";
import { DocsError, pageUrl, type SourceReader } from "./markdown.ts";
import type { Guide, Lang, NavItem, Page, Site } from "./types.ts";

// Папка языка от корня content: «» у русского, «en/» у английского
export const LANG_DIR: Record<Lang, string> = { ru: "", en: "en/" };

export function langOf(file: string): Lang {
  return file.startsWith(LANG_DIR.en) ? "en" : "ru";
}

function isHidden(name: string): boolean {
  return name.startsWith("_") || name.startsWith(".");
}

function walk(root: string, rel: string, hidden: boolean, out: string[]): void {
  const dir = rel ? join(root, rel) : root;
  for (const name of readdirSync(dir).sort()) {
    const relPath = rel ? `${rel}/${name}` : name;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      if (isHidden(name) === hidden || (hidden && isHidden(rel.split("/")[0] ?? ""))) walk(root, relPath, hidden, out);
      continue;
    }
    if (!name.endsWith(".md")) continue;
    const underHidden = relPath.split("/").some((seg, i, arr) => i < arr.length - 1 && isHidden(seg));
    if (underHidden === hidden && !(isHidden(name) && !hidden)) out.push(relPath);
  }
}

// Страницы: .md вне «_»-папок
export function listMarkdown(root: string): string[] {
  const out: string[] = [];
  walk(root, "", false, out);
  return out;
}

// Фрагменты: .md внутри «_»-папок
export function listFragments(root: string): string[] {
  const out: string[] = [];
  walk(root, "", true, out);
  return out.filter((f) => f.split("/").some((seg, i, arr) => i < arr.length - 1 && isHidden(seg)));
}

export function makeReader(root: string): SourceReader {
  return {
    read(file) {
      const abs = join(root, file);
      if (!existsSync(abs) || !statSync(abs).isFile()) return null;
      return readFileSync(abs, "utf8");
    },
  };
}

function loadPage(root: string, file: string, lang: Lang): Page {
  const src = readFileSync(join(root, file), "utf8");
  let fm: Page["fm"];
  let body: string;
  try {
    ({ fm, body } = splitFrontMatter(src));
  } catch (e) {
    throw new DocsError(`${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
  let title = fmString(fm, "title");
  if (title === null) {
    // Без title во фронтматтере — первый «# Заголовок» становится названием и уходит из тела
    const m = /^\s*# (.+)\r?\n/.exec(body);
    if (m) {
      title = m[1].trim();
      body = body.slice(m[0].length);
    } else {
      throw new DocsError(`${file}: нет названия — добавьте «title:» во фронтматтер или «# Заголовок» первой строкой`);
    }
  }
  const rel = file.slice(LANG_DIR[lang].length);
  const slash = rel.indexOf("/");
  return {
    file,
    url: pageUrl(file),
    lang,
    title,
    description: fmString(fm, "description") ?? "",
    order: fmNumber(fm, "order") ?? 1000,
    fm,
    guide: slash < 0 ? null : rel.slice(0, slash),
    body,
    render: null,
  };
}

function navOrder(item: NavItem): number {
  return item.kind === "page" ? item.page.order : item.order;
}

function navTitle(item: NavItem): string {
  return item.kind === "page" ? item.page.title : item.title;
}

// Дерево навигации папки prefix («user/», «user/import/», «en/user/») по страницам руководства
export function buildNav(members: Page[], prefix: string, lang: Lang = "ru"): NavItem[] {
  const items: NavItem[] = [];
  const subdirs = new Set<string>();
  for (const p of members) {
    if (!p.file.startsWith(prefix)) continue;
    const rest = p.file.slice(prefix.length);
    const slash = rest.indexOf("/");
    if (slash < 0) {
      if (rest !== "index.md") items.push({ kind: "page", page: p });
    } else {
      subdirs.add(rest.slice(0, slash));
    }
  }
  for (const d of subdirs) {
    const sub = `${prefix}${d}/`;
    const inside = members.filter((p) => p.file.startsWith(sub));
    const index = inside.find((p) => p.file === `${sub}index.md`) ?? null;
    items.push({ kind: "section", title: index?.title ?? d, order: index?.order ?? 1000, index, items: buildNav(inside, sub, lang) });
  }
  items.sort((a, b) => navOrder(a) - navOrder(b) || navTitle(a).localeCompare(navTitle(b), lang));
  return items;
}

export function flattenNav(items: NavItem[]): Page[] {
  const out: Page[] = [];
  for (const it of items) {
    if (it.kind === "page") out.push(it.page);
    else {
      if (it.index) out.push(it.index);
      out.push(...flattenNav(it.items));
    }
  }
  return out;
}

// Цепочка разделов, в которых лежит страница (для хлебных крошек)
export function navPath(items: NavItem[], page: Page): Extract<NavItem, { kind: "section" }>[] {
  for (const it of items) {
    if (it.kind !== "section") continue;
    if (it.index === page) return [it];
    const deeper = navPath(it.items, page);
    if (deeper.length || it.items.some((x) => x.kind === "page" && x.page === page)) return [it, ...deeper];
  }
  return [];
}

export function loadSite(root: string, lang: Lang = "ru"): Site {
  const dir = LANG_DIR[lang];
  const files = listMarkdown(root).filter((f) => langOf(f) === lang);
  const pages = files.map((f) => loadPage(root, f, lang));
  const byFile = new Map(pages.map((p) => [p.file, p]));
  const home = byFile.get(`${dir}index.md`);
  if (!home) throw new DocsError(`нет content/${dir}index.md — главной страницы документации`);

  const guides: Guide[] = [];
  for (const p of pages) {
    const rel = p.file.slice(dir.length);
    if (!/^[^/]+\/index\.md$/.test(rel)) continue;
    const key = rel.slice(0, rel.indexOf("/"));
    const members = pages.filter((q) => q.guide === key);
    const nav = buildNav(members, `${dir}${key}/`, lang);
    guides.push({
      key,
      title: p.title,
      short: fmString(p.fm, "short") ?? p.title,
      description: p.description,
      order: p.order,
      index: p,
      nav,
      flat: [p, ...flattenNav(nav)],
    });
  }
  guides.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, lang));
  for (const p of pages) {
    if (p.guide !== null && !guides.some((g) => g.key === p.guide)) {
      throw new DocsError(`${p.file}: в папке ${dir}${p.guide}/ нет index.md — руководство без титульной страницы`);
    }
  }
  return { lang, home, guides, pages, byFile };
}

// Сайты всех языков: русский всегда, английский — если есть папка content/en/ и язык не
// исключён списком langs (DOCS_LANGS на стенде: английская версия лежит в репозитории, но на
// сайт не выкладывается, пока не вычитана).
export function loadSites(root: string, langs: readonly Lang[] = ["ru", "en"]): Site[] {
  const sites = [loadSite(root, "ru")];
  if (langs.includes("en") && existsSync(join(root, LANG_DIR.en))) sites.push(loadSite(root, "en"));
  return sites;
}

// Языки сайта из переменной DOCS_LANGS («ru» или «ru,en»); не задана — все, что есть в content/.
export function langsFromEnv(value: string | undefined): Lang[] | undefined {
  if (!value?.trim()) return undefined;
  const wanted = value.split(",").map((s) => s.trim());
  const known: Lang[] = ["ru", "en"];
  return known.filter((l) => wanted.includes(l));
}

export interface Validation {
  errors: string[];
  warnings: string[];
  assets: Set<string>; // файлы для копирования в сборку (пути от корня content)
  included: Set<string>; // фрагменты, включённые в страницы этого сайта
}

// Фрагменты, которые не включены ни в одну страницу ни одного языка
export function unusedFragments(root: string, included: Set<string>): string[] {
  return listFragments(root).filter((f) => !included.has(f)).map((f) => `фрагмент ${f} никуда не включён`);
}

// После рендера всех страниц: ссылки ведут на существующие страницы и якоря, файлы есть,
// фрагменты кем-то включены
export function validateSite(site: Site, root: string): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const assets = new Set<string>();
  const included = new Set<string>();
  for (const p of site.pages) {
    const r = p.render;
    if (!r) continue;
    for (const inc of r.includes) included.add(inc);
    for (const l of r.links) {
      const target = site.byFile.get(l.target);
      if (!target) {
        const hint = l.target.split("/").some((seg) => seg.startsWith("_"))
          ? " (на фрагменты не ссылаются — только на страницы, куда они включены)"
          : langOf(l.target) !== site.lang && existsSync(join(root, l.target))
            ? " (страница другого языка — ссылки между языками не ведутся)"
            : "";
        errors.push(`${l.from}: ссылка на несуществующую страницу «${l.raw}»${hint}`);
        continue;
      }
      if (l.hash && !target.render?.headings.some((h) => h.id === l.hash)) {
        const ids = (target.render?.headings ?? []).map((h) => `#${h.id}`).join(", ") || "нет якорей";
        errors.push(`${l.from}: якорь «#${l.hash}» не найден на странице ${l.target} (есть: ${ids})`);
      }
    }
    for (const a of r.assets) {
      const abs = join(root, a.target);
      if (!existsSync(abs) || !statSync(abs).isFile()) errors.push(`${a.from}: файл не найден — «${a.raw}»`);
      else assets.add(a.target);
    }
  }
  warnings.push(...unusedFragments(root, included));
  return { errors, warnings, assets, included };
}
