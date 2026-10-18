// Скриншоты для документации со стенда archmap_docs (:5173). Учётка — reader (или
// DOCS_USER/DOCS_PASS), окно 1440×900, deviceScaleFactor 2, светлая тема, ru-RU.
//   node shots.mjs projects            → projects-list.png (экран «Проекты»)
//   node shots.mjs home "Маркетплейс «Ярмарка»" → project-home.png (страница проекта)
// Файлы кладутся в OUT (по умолчанию content/images репозитория документации).
// DOCS_LANG=en — английский «прототип» тех же окон в content/en/images (см. en.mjs):
// имена из данных в аргументах — по-русски, как в базе стенда.
import { chromium } from "/home/eidunyushkin/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";
import { homedir } from "node:os";
import { join } from "node:path";
import { domPass, installEn, loadDict, report, translate } from "./en.mjs";

// Адреса стенда; второй стенд рядом с основным — FRONTEND=http://localhost:5174 BACKEND=http://localhost:8001
const FRONTEND = process.env.FRONTEND ?? "http://localhost:5173";
const BACKEND = process.env.BACKEND ?? "http://localhost:8000";
const EN = process.env.DOCS_LANG === "en";
const OUT = process.env.OUT ?? `/home/eidunyushkin/archmap-docs/content/${EN ? "en/" : ""}images`;
const USER = process.env.DOCS_USER ?? "reader";
const PASS = process.env.DOCS_PASS ?? "docs-stand-2026";
const [what, projectName = "Маркетплейс «Ярмарка»"] = process.argv.slice(2);

const login = await fetch(`${BACKEND}/api/v1/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ username: USER, password: PASS }),
});
if (!login.ok) throw new Error(`вход ${USER}: ${login.status}`);
const token = (await login.json()).access_token;
const projects = await (await fetch(`${BACKEND}/api/v1/projects`, { headers: { Authorization: `Bearer ${token}` } })).json();
const project = projects.find((p) => p.name === projectName);
if (!project) throw new Error(`проект «${projectName}» не найден`);

const browser = await chromium.launch({
  executablePath: join(homedir(), ".cache/ms-playwright/chromium-1223/chrome-linux64/chrome"),
  env: { ...process.env, LD_LIBRARY_PATH: `${join(homedir(), ".cache/archmap-chrome-libs/usr/lib/x86_64-linux-gnu")}:${process.env.LD_LIBRARY_PATH ?? ""}` },
  headless: true,
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: "light", locale: "ru-RU", timezoneId: "Europe/Moscow" });
await ctx.addInitScript(([t, p]) => { localStorage.setItem("access_token", t); localStorage.setItem("archmap.lastProjectId", p); }, [token, project.id]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dict = EN ? loadDict() : null;
const apiMiss = new Set();
if (EN) await installEn(page, FRONTEND, dict, apiMiss);
// Имя из данных так, как его видит страница (в английском режиме — переведённым)
const D = (name) => (EN ? translate(name, dict) : name);

// Кадр: в английском режиме сначала подписи интерфейса и отчёт об остатках кириллицы
async function snap(target, file, opts = {}) {
  // Локатор ищет по русским подписям — элемент фиксируется до их перевода
  const el = EN && target !== page ? await target.elementHandle() : target;
  if (EN) {
    report(file, apiMiss, await domPass(page, dict));
    await page.waitForTimeout(300);
  }
  await el.screenshot({ path: join(OUT, file), animations: "disabled", caret: "hide", ...opts });
  console.log(file);
}

// Оседание раскладки: как в scripts/landing-shots.mjs — сеть тиха, конвейер не в полёте,
// сигнатура узлов/рёбер стабильна два замера подряд.
async function settle(extra = 800) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  let prev = null, stable = 0;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => {
      const busy = (window.__archmapLayoutInflight ?? 0) + document.querySelectorAll(".lg-busy").length;
      const sig = [...document.querySelectorAll(".react-flow__node")].map((n) => n.getAttribute("data-id") + n.style.transform).join("|")
        + "#" + [...document.querySelectorAll(".react-flow__edge path.react-flow__edge-path")].map((p) => p.getAttribute("d")).join("|");
      return { busy, sig };
    });
    if (s.busy > 0) { prev = null; stable = 0; continue; }
    if (s.sig === prev) { if (++stable >= 2) break; } else { stable = 0; prev = s.sig; }
  }
  await page.waitForTimeout(extra);
}

if (what === "projects") {
  await page.goto(`${FRONTEND}/#/projects`);
  await page.getByRole("heading", { name: "Проекты" }).waitFor();
  await page.locator(".project-card").first().waitFor();
  await settle(600);
  await page.mouse.move(720, 20);
  await snap(page, "projects-list.png");
} else if (what === "home") {
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await page.getByText("Схема системы").waitFor();
  await settle();
  await page.mouse.move(720, 20);
  await snap(page, "project-home.png");
} else if (what === "node") {
  // Страница объекта: node "<Проект>" "<Имя объекта>" [expand] → object-page.png;
  // с expand — объект раскрыт лупой, кадр — карточка «Схема» (object-page-expanded.png).
  const [, , nodeName, expand] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const card = page.locator('.np-card:has(h3:text-is("Схема"))').first();
  await card.waitFor();
  await settle();
  if (!expand) {
    await page.mouse.move(720, 20);
    await snap(page, "object-page.png");
  } else {
    // Схема инертна до клика (оверлей «кликните, чтобы взаимодействовать») — сначала включаем её,
    // затем лупа на фокусе (первая на схеме страницы); карточка «Схема» — к верху, кадр карточки целиком
    await card.scrollIntoViewIfNeeded();
    await card.locator(".esb-activate").click();
    await page.waitForTimeout(300);
    await card.locator('button[title="Раскрыть содержимое"]').first().click();
    await settle();
    await card.evaluate((e) => { const sc = e.closest(".np-page"); if (sc) sc.scrollTop += e.getBoundingClientRect().top - 24; });
    await page.waitForTimeout(500);
    await page.mouse.move(720, 20);
    await snap(card, "object-page-expanded.png");
  }
} else if (what === "search") {
  // Поиск по имени в дереве: search "<Проект>" "<запрос>" → tree-search.png (кадр левой панели)
  const [, , query] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  const box = page.getByPlaceholder("Поиск по имени…");
  await box.waitFor();
  await box.fill(query ?? (EN ? "order" : "заказ"));
  await page.locator(".nt-row--clickable").first().waitFor();
  await page.waitForTimeout(600);
  // Панель высокая и почти пустая под результатами — кадр только её верх
  const b = await page.locator("aside").first().boundingBox();
  await snap(page, "tree-search.png", { clip: { x: b.x, y: b.y, width: b.width, height: 300 } });
} else if (what === "section") {
  // Раздел страницы объекта: section "<Проект>" "<Имя объекта>" "<Заголовок раздела>" <файл.png> [запись]
  // — раздел прокручивается к верху страницы, кадр — только он; с «записью» (имя таблицы
  // или канала) она сначала раскрывается шевроном.
  const [, , nodeName, title, file, item] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const card = page.locator(`.np-card:has(h3:text-is("${title}"))`).first();
  await card.waitFor();
  await settle();
  if (item) {
    await card.locator("[data-flip-id]", { has: page.getByText(item, { exact: true }) })
      .locator('button[aria-expanded="false"]').first().click();
    await page.waitForTimeout(600);
  }
  // Раздел выше окна: шапка страницы закрыла бы его верх, а прокрутка .np-page обрезала
  // бы низ — окно вытягивается под раздел.
  const h = (await card.boundingBox()).height;
  if (h > 800) {
    await page.setViewportSize({ width: 1440, height: Math.ceil(h) + 160 });
    await page.waitForTimeout(400);
  }
  await card.evaluate((e) => { const sc = e.closest(".np-page"); if (sc) sc.scrollTop += e.getBoundingClientRect().top - 24; });
  await page.waitForTimeout(500);
  await page.mouse.move(720, 20);
  await snap(card, file ?? "section.png");
} else if (what === "doc") {
  // Окно схемы логики / спеки: doc "<Проект>" "<Имя объекта>" "<Имя схемы>" <файл.png> [spec|spec-open]
  // — кнопка «Открыть схему «…»» (или «Открыть спецификацию «…»») на странице объекта, кадр — окно.
  // Своя спека объекта — имя схемы = имя объекта (строка «Спецификация» раздела OpenAPI);
  // spec-open — в окне раскрыта первая операция.
  const [, , nodeName, docName, file, kind] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const spec = kind?.startsWith("spec");
  const btn = spec && docName === nodeName
    ? page.locator('.np-card:has(h3:text-is("OpenAPI")) button.np-doc-row').first()
    : page.locator(`button[title="${spec ? `Открыть спецификацию «${D(docName)}»` : `Открыть схему «${D(docName)}»`}"]`).first();
  await btn.waitFor();
  await settle(300);
  await btn.click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator(spec ? ".opblock-summary" : "svg, pre, .cm-editor").first().waitFor({ timeout: 30000 });
  if (kind === "spec-open") await dlg.locator(".opblock-summary").first().click();
  await page.waitForTimeout(1500);
  await page.mouse.move(720, 20);
  await snap(dlg, file ?? "doc.png");
} else if (what === "export") {
  // Меню «Действия со схемой» на странице проекта: export "<Проект>" <меню.png> <окно.png>
  // — кадр меню (правый верх) и окно «Экспорт схемы».
  const [, , menuFile, dialogFile] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await page.getByText("Схема системы").waitFor();
  await settle(300);
  await page.locator('button[aria-label="Действия со схемой"]').click();
  const menu = page.locator('[role="menu"][aria-label="Действия со схемой"]');
  await menu.waitFor();
  await page.waitForTimeout(300);
  const mb = await menu.boundingBox();
  await snap(page, menuFile ?? "export-menu.png", { clip: { x: mb.x - 260, y: 0, width: mb.width + 280, height: mb.y + mb.height + 20 } });
  await menu.getByRole("menuitem", { name: EN ? "Export diagram" : "Экспорт схемы" }).click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator("pre").waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  await snap(dlg, dialogFile ?? "export-dialog.png");
} else if (what === "password") {
  // Окно «Сменить пароль» из меню профиля: password "<Проект>" <файл.png>
  const [, , file] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/projects`);
  await page.locator('button[aria-label="Профиль"]').click();
  await page.getByText("Сменить пароль", { exact: true }).click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator("#cp-old").waitFor();
  await page.waitForTimeout(400);
  await snap(dlg, file ?? "password.png");
} else if (what === "process") {
  // Режим «Процессы»: process "<Проект>" "<Имя процесса>" <файл.png> — переключатель
  // «Процессы» в шапке, процесс выбирается в списке слева, кадр — окно целиком.
  const [, , procName, file] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await page.locator('button[title="Бизнес-процессы"]').click();
  await page.locator(".bp-procrow", { hasText: D(procName) }).first().click();
  await page.locator('[data-tour="process-diagram"]').waitFor();
  await page.waitForTimeout(1200);
  await page.mouse.move(720, 20);
  // CLIP_H — высота кадра сверху (CSS-пиксели), если вся диаграмма не нужна.
  const clipH = Number(process.env.CLIP_H) || 0;
  await snap(page, file ?? "process.png", clipH ? { clip: { x: 0, y: 0, width: 1440, height: clipH } } : {});
} else if (what === "create") {
  // Окно «Новый проект» (DOCS_USER=architect): create "<Проект-источник>" <файл.png> "<Название>"
  // — способ «Копия», источник выбран, название набрано; кадр — окно.
  const [, , file, title] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/projects`);
  await page.locator(".project-card").first().waitFor();
  await page.getByRole("button", { name: "Новый проект" }).click();
  const dlg = page.locator("dialog[open]");
  await dlg.getByRole("button", { name: "Копия", exact: true }).click();
  await dlg.locator(".cp-row", { hasText: project.name }).click();
  await dlg.getByPlaceholder("Например, «Платёжная платформа»").fill(title ?? "Черновик");
  await page.waitForTimeout(400);
  await snap(dlg, file ?? "create-project.png");
} else if (what === "editor") {
  // Редактор схемы (DOCS_USER=architect): editor "<Проект>" "<Уровень>" <файл.png> [node "<Объект>" |
  // edge "<Откуда>" "<Куда>" | hover "<Объект>"] — уровень контейнера; node — панель свойств объекта
  // (двойной клик), edge — панель связи (двойной клик по её плашке), hover — стрелки по сторонам
  // объекта под указателем (SIDE=right|left|top|bottom — указатель на стрелке этой стороны:
  // пунктир быстрой связи). Кадр — окно целиком или CLIP="x,y,w,h" (CSS-пиксели). Ничего не
  // сохраняет.
  const [, , levelName, file, kind, a, b] = process.argv.slice(2);
  const hdr = { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } };
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, hdr)).json();
  const byName = (n) => { const x = all.find((y) => y.name === n); if (!x) throw new Error(`объект «${n}» не найден`); return x; };
  const level = byName(levelName);
  await page.goto(`${FRONTEND}/#/p/${project.id}/map/${level.id}`);
  await page.locator(".react-flow__node").first().waitFor();
  await settle();
  if (kind === "node" || kind === "hover") {
    const el = page.locator(`.react-flow__node[data-id="${byName(a).id}"]`);
    if (kind === "node") await el.dblclick();
    else {
      await el.hover();
      const side = process.env.SIDE;
      if (side) {
        const r = await el.boundingBox();
        const at = { right: [r.x + r.width + 14, r.y + r.height / 2], left: [r.x - 14, r.y + r.height / 2],
          top: [r.x + r.width / 2, r.y - 14], bottom: [r.x + r.width / 2, r.y + r.height + 14] }[side];
        await page.mouse.move(at[0], at[1], { steps: 4 });
      }
    }
  } else if (kind === "edge") {
    const src = byName(a).id, tgt = byName(b).id;
    const edges = await (await fetch(`${BACKEND}/api/v1/edges`, hdr)).json();
    const edge = edges.find((e) => e.source_id === src && e.target_id === tgt);
    if (!edge) throw new Error(`связь «${a}» → «${b}» не найдена`);
    // Плашка связи адресуется data-lg-edge (id ребра холста)
    await page.locator(`[data-lg-edge="${edge.id}"]`).first().dblclick();
  }
  await page.waitForTimeout(800);
  if (kind !== "hover") await page.mouse.move(720, 20);
  const clip = process.env.CLIP?.split(",").map(Number);
  await snap(page, file ?? "editor.png", clip ? { clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3] } } : {});
} else {
  throw new Error("что снимать: projects | home | node | search | section | doc | process | export | password | create | editor");
}
console.log("ошибки страницы:", errors.length ? errors : "нет");
await browser.close();
