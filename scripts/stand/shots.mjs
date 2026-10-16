// Скриншоты для документации со стенда archmap_docs (:5173). Учётка — reader (или
// DOCS_USER/DOCS_PASS), окно 1440×900, deviceScaleFactor 2, светлая тема, ru-RU.
//   node shots.mjs projects            → projects-list.png (экран «Проекты»)
//   node shots.mjs home "Маркетплейс «Ярмарка»" → project-home.png (страница проекта)
// Файлы кладутся в OUT (по умолчанию content/images репозитория документации).
import { chromium } from "/home/eidunyushkin/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";
import { homedir } from "node:os";
import { join } from "node:path";

const FRONTEND = "http://localhost:5173";
const BACKEND = "http://localhost:8000";
const OUT = process.env.OUT ?? "/home/eidunyushkin/archmap-docs/content/images";
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
  await page.screenshot({ path: join(OUT, "projects-list.png"), animations: "disabled", caret: "hide" });
  console.log("projects-list.png");
} else if (what === "home") {
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await page.getByText("Схема системы").waitFor();
  await settle();
  await page.mouse.move(720, 20);
  await page.screenshot({ path: join(OUT, "project-home.png"), animations: "disabled", caret: "hide" });
  console.log("project-home.png");
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
    await page.screenshot({ path: join(OUT, "object-page.png"), animations: "disabled", caret: "hide" });
    console.log("object-page.png");
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
    await card.screenshot({ path: join(OUT, "object-page-expanded.png"), animations: "disabled", caret: "hide" });
    console.log("object-page-expanded.png");
  }
} else if (what === "search") {
  // Поиск по имени в дереве: search "<Проект>" "<запрос>" → tree-search.png (кадр левой панели)
  const [, , query] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  const box = page.getByPlaceholder("Поиск по имени…");
  await box.waitFor();
  await box.fill(query ?? "заказ");
  await page.locator(".nt-row--clickable").first().waitFor();
  await page.waitForTimeout(600);
  // Панель высокая и почти пустая под результатами — кадр только её верх
  const b = await page.locator("aside").first().boundingBox();
  await page.screenshot({ path: join(OUT, "tree-search.png"), animations: "disabled", caret: "hide", clip: { x: b.x, y: b.y, width: b.width, height: 300 } });
  console.log("tree-search.png");
} else {
  throw new Error("что снимать: projects | home | node | search");
}
console.log("ошибки страницы:", errors.length ? errors : "нет");
await browser.close();
