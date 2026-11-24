// Скриншоты для документации со стенда archmap_docs (:5173). Учётка — reader (или
// DOCS_USER/DOCS_PASS), окно 1440×900, deviceScaleFactor 2, светлая тема, ru-RU.
//   node shots.mjs projects            → projects-list.png (экран «Проекты»)
//   node shots.mjs home "Маркетплейс «Ярмарка»" → project-home.png (страница проекта)
// Все снимки сайта одной командой, по строке на снимок: all.sh рядом.
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
  // Элемент снимается кадром страницы по его рамке: снимок самого элемента у окон верхнего
  // слоя (<dialog>) съезжал на несколько пикселей и цеплял страницу под окном.
  const clip = el === page ? null : await el.boundingBox();
  await page.screenshot({ path: join(OUT, file), animations: "disabled", caret: "hide", ...(clip ? { clip } : {}), ...opts });
  console.log(file);
}

// Раздел страницы проекта или объекта по заголовку («Схема», «Связи», «Конфигурация»…)
const section = (title) => page.locator(".ds-sec").filter({ has: page.locator("h3.ds-sec-title", { hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }) }).first();

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

// Окно «Токен выпущен»: секрет и адрес стенда в кадре заменяются образцами (репозиторий
// документации публичный, адрес стенда в кадре не нужен)
async function snapIssued(file) {
  const issued = page.locator("dialog[open]");
  await issued.locator('[data-testid="issued-secret"]').waitFor();
  await issued.evaluate((root, origin) => {
    const secret = root.querySelector('[data-testid="issued-secret"]').textContent;
    const fake = "archmap_Ab3dEfGh5JkLmN7pQrStUv9WxYz2aBcDeFgHiJkLmNoP";
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      n.nodeValue = n.nodeValue.split(secret).join(fake).split(origin).join("https://archmap.example.com");
    }
  }, new URL(FRONTEND).origin);
  await page.waitForTimeout(400);
  await page.mouse.move(720, 20);
  await snap(issued, file);
}

// Кадр блока страницы объекта или проекта (раздел, шапка со свойствами): от верха first до
// низа last (по умолчанию тот же блок) с полем pad вокруг. У разделов нового интерфейса нет
// своей рамки, поэтому поле — белый фон страницы. Блок встаёт под верх области прокрутки
// страницы (.np-page): шапку приложения он не задевает. Если блок с полем не помещается в
// окно, окно вытягивается под него. clipH — только верх блока (CSS-пиксели).
async function snapBlock(first, file, { last = first, pad = 24, clipH = 0 } = {}) {
  // Срез clipH встаёт на нижнюю границу последней строки (строки таблицы, записи, свойства),
  // которая уместилась целиком: строка пополам в кадр не идёт.
  const fit = async () => {
    const a = await first.boundingBox(), b = await last.boundingBox();
    let h = b.y + b.height - a.y;
    if (clipH && clipH < h) {
      h = await last.evaluate((e, [y0, lim]) => {
        let best = 0;
        for (const r of e.querySelectorAll("tr, li, .ds-row, .fact-item, .np-prop, .ds-sec-head")) {
          const bot = r.getBoundingClientRect().bottom - y0;
          if (bot <= lim && bot > best) best = bot;
        }
        return best || lim;
      }, [a.y, clipH]);
    }
    return { a, h };
  };
  let { h } = await fit();
  const top = await first.evaluate((e) => e.closest(".np-page")?.getBoundingClientRect().top ?? 0);
  if (top + h + 2 * pad + 8 > 900) {
    await page.setViewportSize({ width: 1440, height: Math.ceil(top + h + 2 * pad + 16) });
    await page.waitForTimeout(400);
  }
  await first.evaluate((e, pad) => {
    const sc = e.closest(".np-page");
    if (sc) sc.scrollTop += e.getBoundingClientRect().top - sc.getBoundingClientRect().top - pad - 8;
  }, pad);
  await page.waitForTimeout(500);
  await page.mouse.move(720, 20);
  await page.evaluate(() => document.activeElement?.blur?.());
  const r = await fit();
  // Конец страницы не даёт блоку подняться под верх — окно добирается вниз
  const vh = page.viewportSize().height;
  if (r.a.y + r.h + pad > vh) {
    await page.setViewportSize({ width: 1440, height: Math.ceil(r.a.y + r.h + pad + 8) });
    await page.waitForTimeout(400);
  }
  const { a } = await fit();
  const b = await last.boundingBox();
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x + a.width, b.x + b.width);
  // Срезанный блок кончается границей строки: поля снизу нет, иначе в него заглянула бы
  // следующая строка
  const cut = clipH && r.h < b.y + b.height - a.y;
  await snap(page, file, { clip: { x: x0 - pad, y: a.y - pad, width: x1 - x0 + 2 * pad, height: r.h + pad + (cut ? 1 : pad) } });
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
  await section("Схема").waitFor();
  await settle();
  await page.mouse.move(720, 20);
  await snap(page, "project-home.png");
} else if (what === "node") {
  // Страница объекта: node "<Проект>" "<Имя объекта>" [expand [<файл.png>]] → object-page.png;
  // с expand — объект раскрыт лупой, кадр — раздел «Схема» (object-page-expanded.png или
  // <файл.png>). Вид схемы — по умолчанию «Переход»: на «Сервисе уведомлений», где
  // SMS-рассыльщик выводится, этот кадр — changes-transition.png.
  const [, , nodeName, expand, file] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const card = section("Схема");
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
    await snapBlock(card, file ?? "object-page-expanded.png");
  }
} else if (what === "search") {
  // Поиск по имени в дереве: search "<Проект>" "<запрос>" → tree-search.png (кадр левой панели)
  const [, , query] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  const box = page.getByPlaceholder("Поиск по имени", { exact: true });
  await box.waitFor();
  await box.fill(query ?? (EN ? "order" : "заказ"));
  await page.locator(".nt-row--clickable").first().waitFor();
  await page.waitForTimeout(600);
  // Кольцо фокуса поля в кадр не идёт: запрос и результаты остаются
  await box.evaluate((e) => e.blur());
  await page.mouse.move(720, 20);
  await page.waitForTimeout(300);
  // Панель высокая и почти пустая под результатами — кадр только её верх
  const b = await page.locator("aside").first().boundingBox();
  await snap(page, "tree-search.png", { clip: { x: b.x, y: b.y, width: b.width, height: 300 } });
} else if (what === "section") {
  // Раздел страницы объекта: section "<Проект>" "<Имя объекта>" "<Заголовок раздела>" <файл.png> [запись]
  // — раздел прокручивается к верху страницы, кадр — он с полем страницы вокруг (snapBlock);
  // с «записью» (имя таблицы или канала) она сначала раскрывается шевроном. Заголовок
  // сравнивается целиком. Одноимённые объекты различаются родителем: "<Родитель> / <Имя
  // объекта>". CLIP_H — только верх раздела (CSS-пиксели, срез по границе строки), если
  // весь он не нужен.
  const [, , nodeName, title, file, item] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const [parentName, ownName] = nodeName.includes(" / ") ? nodeName.split(" / ").slice(-2) : [null, nodeName];
  const node = all.find((n) => n.name === ownName
    && (parentName === null || all.find((x) => x.id === n.parent_id)?.name === parentName));
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const card = section(title);
  await card.waitFor();
  await settle();
  if (item) {
    await card.locator("[data-flip-id]", { has: page.getByText(item, { exact: true }) })
      .locator('button[aria-expanded="false"]').first().click();
    await page.waitForTimeout(600);
  }
  await snapBlock(card, file ?? "section.png", { clipH: Number(process.env.CLIP_H) || 0 });
} else if (what === "head") {
  // Шапка страницы объекта со свойствами: head "<Проект>" "<Имя объекта>" <файл.png> — путь,
  // имя, статус, описание и строки свойств под ним (заголовка «Свойства» в интерфейсе нет).
  const [, , nodeName, file] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const props = page.locator(".np-props");
  await props.waitFor();
  await settle(300);
  await snapBlock(page.locator(".np-header"), file ?? "head.png", { last: props });
} else if (what === "doc") {
  // Окно схемы логики / спеки: doc "<Проект>" "<Имя объекта>" "<Имя схемы>" <файл.png> [spec|spec-open]
  // — кнопка «Открыть схему «…»» (или «Открыть спецификацию «…»») на странице объекта, кадр — окно;
  // схема логики вписана в окно целиком. Своя спека объекта — имя схемы = имя объекта (первая
  // строка раздела OpenAPI); spec-open — в окне раскрыта первая операция.
  const [, , nodeName, docName, file, kind] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const spec = kind?.startsWith("spec");
  const btn = spec && docName === nodeName
    ? section("OpenAPI").locator(".ds-row-main").first()
    : page.locator(`button[title="${spec ? `Открыть спецификацию «${D(docName)}»` : `Открыть схему «${D(docName)}»`}"]`).first();
  await btn.waitFor();
  await settle(300);
  await btn.click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator(spec ? ".opblock-summary" : "svg, pre, .cm-editor").first().waitFor({ timeout: 30000 });
  if (kind === "spec-open") await dlg.locator(".opblock-summary").first().click();
  // Схема логики открывается в масштабе для чтения и не помещается в окно — кадр показывает
  // её целиком: кнопка «Вписать» в правом нижнем углу окна
  if (!spec) {
    await page.waitForTimeout(800);
    await dlg.getByRole("button", { name: "Вписать" }).click();
  }
  await page.waitForTimeout(1500);
  await page.mouse.move(720, 20);
  await snap(dlg, file ?? "doc.png");
} else if (what === "export") {
  // Меню «Действия со схемой» на странице проекта: export "<Проект>" <меню.png> [<окно.png>]
  // — кадр меню (правый верх, с вкладками шапки) и, если названо второе имя, окно «Экспорт схемы».
  const [, , menuFile, dialogFile] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await section("Схема").waitFor();
  await settle(300);
  await page.locator('button[aria-label="Действия со схемой"]').click();
  const menu = page.locator('[role="menu"][aria-label="Действия со схемой"]');
  await menu.waitFor();
  await page.waitForTimeout(300);
  await page.mouse.move(720, 600);
  // Кадр — правый верх окна: кнопка меню, профиль и меню целиком. Левый край кадра — правее
  // названия и описания проекта, чтобы их строки не резались краем.
  const mb = await menu.boundingBox();
  const textRight = await page.evaluate(() => Math.max(...[...document.querySelectorAll(".np-name, .np-desc")].map((e) => {
    const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect().right;
  })));
  const x0 = Math.round(Math.max(textRight + 24, mb.x - 200));
  await snap(page, menuFile ?? "export-menu.png", { clip: { x: x0, y: 0, width: 1440 - x0, height: Math.round(mb.y + mb.height + 24) } });
  if (dialogFile) {
    await menu.getByRole("menuitem", { name: EN ? "Export diagram" : "Экспорт схемы" }).click();
    const dlg = page.locator("dialog[open]");
    await dlg.locator("pre").waitFor({ timeout: 30000 });
    await page.waitForTimeout(500);
    await snap(dlg, dialogFile);
  }
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
} else if (what === "tokens") {
  // Окно «Токены для MCP»: tokens "<Проект>" <окно.png> <выпущен.png> — в списке заранее
  // выпущенный токен «Ноутбук» (только чтение), затем выпуск токена по умолчанию. Вместо имени
  // файла «-» — этот кадр не снимается (по строке на кадр в all.sh). У учётки «Пользователь»
  // поле «Доступ» заперто на «Только чтение». В кадре вместо секрета и адреса стенда — образцы;
  // все токены учётки до и после съёмки отзываются.
  const [, , listFile = "mcp-tokens.png", issuedFile = "mcp-token-issued.png"] = process.argv.slice(2);
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const mine = async () => (await fetch(`${BACKEND}/api/v1/tokens`, { headers: auth })).json();
  const revokeAll = async () => { for (const t of await mine()) await fetch(`${BACKEND}/api/v1/tokens/${t.id}`, { method: "DELETE", headers: auth }); };
  await revokeAll();
  try {
    const pre = await fetch(`${BACKEND}/api/v1/tokens`, { method: "POST", headers: auth, body: JSON.stringify({ name: EN ? "Laptop" : "Ноутбук", read_only: true, lifetime_days: 90 }) });
    if (!pre.ok) throw new Error(`выпуск токена: ${pre.status}`);
    await page.goto(`${FRONTEND}/#/projects`);
    await page.locator('button[aria-label="Профиль"]').click();
    await page.getByText("Токены для MCP", { exact: true }).click();
    const dlg = page.locator("dialog[open]");
    await dlg.locator("#tok-name").waitFor();
    await dlg.locator('[data-testid^="token-"]').first().waitFor();
    // Значение поля domPass не переводит: имя по умолчанию «Агент» — по словарю
    if (EN) await dlg.locator("#tok-name").fill(D("Агент"));
    await page.waitForTimeout(400);
    await page.mouse.move(720, 20);
    if (listFile !== "-") await snap(dlg, listFile);
    if (issuedFile !== "-") {
      await dlg.getByRole("button", { name: D("Выпустить токен") }).click();
      await snapIssued(issuedFile);
    }
  } finally {
    await revokeAll();
  }
} else if (what === "ci-token") {
  // Окно «Токен выпущен» у токена «Только сигнал из CI» (DOCS_USER=architect): ci-token
  // "<Проект>" <файл.png> — меню профиля → «Токены для MCP», «Доступ»: «Только сигнал из CI»,
  // «Выпустить токен»; открыта первая вкладка (GitLab). В кадре вместо секрета и адреса
  // стенда — образцы; выпущенный токен отзывается.
  const [, , file] = process.argv.slice(2);
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const mine = async () => (await fetch(`${BACKEND}/api/v1/tokens`, { headers: auth })).json();
  const before = new Set((await mine()).map((t) => t.id));
  await page.goto(`${FRONTEND}/#/projects`);
  await page.locator('button[aria-label="Профиль"]').click();
  await page.getByText(D("Токены для MCP"), { exact: true }).click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator("#tok-name").waitFor();
  await dlg.locator("#tok-access").selectOption("ci");
  await dlg.getByRole("button", { name: D("Выпустить токен") }).click();
  try {
    await snapIssued(file ?? "ci-token-issued.png");
  } finally {
    for (const t of await mine()) {
      if (!before.has(t.id)) await fetch(`${BACKEND}/api/v1/tokens/${t.id}`, { method: "DELETE", headers: auth });
    }
  }
} else if (what === "code-change") {
  // Строка «Документацию пора обновить» под шапкой проекта (DOCS_USER=architect — строку видит
  // редактор): code-change "<Проект>" <файл.png> [<репозиторий>] — выпускается токен «Только
  // сигнал из CI», от него трижды идёт сигнал о слиянии в main (POST /code-changes), страница
  // проекта открывается со строкой напоминания. Кадр — верх окна во всю ширину (CLIP_H, по
  // умолчанию 360 CSS-пикселей). После кадра напоминание снимается (DELETE /code-changes/{id})
  // и токен отзывается.
  const [, , file, repo = "https://github.com/yarmarka/orders"] = process.argv.slice(2);
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const inProject = { ...auth, "X-Project-Id": project.id };
  const changes = async () => (await (await fetch(`${BACKEND}/api/v1/nodes/alerts`, { headers: inProject })).json()).code_changes ?? [];
  const dismissAll = async () => {
    for (const c of await changes()) {
      const r = await fetch(`${BACKEND}/api/v1/code-changes/${c.id}`, { method: "DELETE", headers: inProject });
      if (!r.ok) throw new Error(`снять напоминание: ${r.status}`);
    }
  };
  // Остаток прошлого прогона снимается: в кадре ровно три слияния
  await dismissAll();
  const issued = await fetch(`${BACKEND}/api/v1/tokens`, { method: "POST", headers: auth, body: JSON.stringify({ name: "CI съёмки", ci_only: true }) });
  if (!issued.ok) throw new Error(`выпуск токена CI: ${issued.status}`);
  const ci = await issued.json();
  try {
    // Хэши коммитов постоянные: кадр от прогона к прогону не меняется
    for (const commit of ["a1b2c3d4e5f60718293a4b5c6d7e8f9012345678", "b2c3d4e5f60718293a4b5c6d7e8f901234567890", "c3d4e5f60718293a4b5c6d7e8f90123456789012"]) {
      const r = await fetch(`${BACKEND}/api/v1/code-changes`, {
        method: "POST", headers: { Authorization: `Bearer ${ci.secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ repo, commit, branch: "main" }),
      });
      if (!r.ok) throw new Error(`сигнал CI: ${r.status}`);
    }
    await page.goto(`${FRONTEND}/#/p/${project.id}`);
    await page.locator('[data-testid="code-change-notice"]').waitFor();
    await section("Схема").waitFor();
    await settle();
    await page.mouse.move(720, 600);
    await page.evaluate(() => document.activeElement?.blur?.());
    await snap(page, file ?? "code-change-notice.png", { clip: { x: 0, y: 0, width: 1440, height: Number(process.env.CLIP_H) || 360 } });
  } finally {
    await dismissAll();
    await fetch(`${BACKEND}/api/v1/tokens/${ci.token.id}`, { method: "DELETE", headers: auth });
  }
} else if (what === "fullscreen") {
  // Схема на всё окно у читателя: fullscreen "<Проект>" <файл.png> "<Объект>" — на странице
  // проекта в строке заголовка «Схема» кнопка «Развернуть», на схеме двойным щелчком выбран
  // объект: справа его панель. Схема вписывается в часть холста, которую панель не закрывает.
  // Кадр — окно целиком.
  const [, , file, nodeName] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  const sec = section("Схема");
  await sec.waitFor();
  await settle(300);
  await sec.getByRole("button", { name: D("Развернуть"), exact: true }).click();
  const el = page.locator(`.react-flow__node[data-id="${node.id}"]`);
  await el.waitFor();
  await settle();
  await el.dblclick();
  await page.waitForTimeout(800);
  await page.locator(".react-flow__controls-fitview").first().click();
  await settle();
  await page.mouse.move(720, 20);
  await snap(page, file ?? "schema-fullscreen-reader.png");
} else if (what === "process") {
  // Режим «Процессы»: process "<Проект>" "<Имя процесса>" <файл.png> — вкладка «Процессы» в
  // шапке проекта, процесс выбирается в списке слева, кадр — окно целиком. STEP="<подпись
  // шага>" — шаг выбран нажатием на подпись, справа открыты его свойства.
  const [, , procName, file] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await section("Схема").waitFor();
  await page.getByRole("button", { name: D("Процессы"), exact: true }).first().click(); // вкладка шапки
  await page.locator(".pr-row", { hasText: D(procName) }).first().click();
  await page.locator('[data-tour="process-diagram"]').waitFor();
  await settle(1200);
  if (process.env.STEP) {
    await page.locator(".seq-text", { hasText: D(process.env.STEP) }).first().click();
    await page.getByText(D("Откуда"), { exact: true }).first().waitFor();
    await page.waitForTimeout(400);
  }
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
  await dlg.locator(".cp-source", { hasText: D(project.name) }).click();
  await dlg.getByPlaceholder("например: Платёжная платформа").fill(title ?? "Черновик");
  await page.waitForTimeout(400);
  await page.mouse.move(720, 20);
  await snap(dlg, file ?? "create-project.png");
} else if (what === "editor") {
  // Редактор схемы (DOCS_USER=architect): editor "<Проект>" "<Уровень>" <файл.png> [node "<Объект>" |
  // edge "<Откуда>" "<Куда>" | hover "<Объект>" ["<Сосед>"]] — уровень контейнера; node — панель
  // объекта (двойной клик), edge — панель связи (двойной клик по её плашке); с панелью схема
  // вписывается в видимую часть холста. hover — стрелки по сторонам объекта под указателем
  // (SIDE=right|left|top|bottom — указатель на стрелке этой стороны: пунктир быстрой связи), с
  // соседом кадр — оба объекта с полем вокруг. Кадр — окно целиком или CLIP="x,y,w,h"
  // (CSS-пиксели). Ничего не сохраняет.
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
  // Правая панель ложится поверх холста и закрывает край схемы: схема вписывается в то, что
  // осталось видно (кнопка «Вписать» в углу холста; вид схемы в базе не меняется)
  if (kind === "node" || kind === "edge") {
    await page.locator(".react-flow__controls-fitview").first().click();
    await settle();
  }
  if (kind !== "hover") await page.mouse.move(720, 20);
  let clip = process.env.CLIP?.split(",").map(Number);
  // hover с объектом «Куда» (b) без CLIP: кадр — оба объекта с полем вокруг (стрелки по
  // сторонам наведённого объекта и пунктир до соседа)
  if (!clip && kind === "hover" && b) {
    const r1 = await page.locator(`.react-flow__node[data-id="${byName(a).id}"]`).boundingBox();
    const r2 = await page.locator(`.react-flow__node[data-id="${byName(b).id}"]`).boundingBox();
    const x0 = Math.min(r1.x, r2.x) - 56, y0 = Math.min(r1.y, r2.y) - 56;
    const x1 = Math.max(r1.x + r1.width, r2.x + r2.width) + 56, y1 = Math.max(r1.y + r1.height, r2.y + r2.height) + 56;
    clip = [x0, y0, x1 - x0, y1 - y0].map(Math.round);
  }
  await snap(page, file ?? "editor.png", clip ? { clip: { x: clip[0], y: clip[1], width: clip[2], height: clip[3] } } : {});
} else if (what === "deploy") {
  // Схема развёртывания всего проекта: deploy "<Проект>" [файл.png] [labels-off] — режим
  // «Развёртывание» (адресом /deploy), дерево слева; с labels-off подписи связей скрыты
  // тумблером «Подписи связей» (зоны площадок читаются целиком); кадр — окно целиком.
  const [, , file, labels] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}/deploy`);
  await page.locator(".dp-stage .react-flow__node").first().waitFor();
  await settle();
  if (labels === "labels-off") {
    const btn = page.locator('button[aria-label="Подписи связей"]');
    if ((await btn.getAttribute("aria-pressed")) !== "true") await btn.click();
    await settle();
  }
  await page.mouse.move(720, 20);
  await snap(page, file ?? "deploy-canvas.png");
} else if (what === "sites") {
  // Окно «Площадки» (DOCS_USER=architect): sites "<Проект>" <файл.png> ["<Площадка>"] — в
  // дереве окна раскрыта названная площадка (по умолчанию «Облако»); кадр — окно.
  const [, , file, open = "Облако"] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}/deploy`);
  await page.locator(".dp-stage .react-flow__node").first().waitFor();
  await settle(300);
  await page.locator('button[aria-label="Площадки"]').click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator(".site-row").first().waitFor();
  await dlg.locator(`button[aria-label="Развернуть «${D(open)}»"]`).click();
  await page.waitForTimeout(500);
  await page.mouse.move(720, 20);
  await snap(dlg, file ?? "deploy-sites.png");
} else if (what === "placing") {
  // Режим размещения щелчком (DOCS_USER=architect): placing "<Проект>" "<Объект>" <файл.png>
  // ["<Контейнер>"] — булавка на строке объекта в дереве (строка контейнера сначала
  // раскрывается шевроном), над схемой строка «Куда поставить …». Кадр — окно целиком или
  // верх CLIP_H (CSS-пиксели); LABELS=off скрывает подписи связей (в режиме размещения они
  // ложатся на блоки и мешают читать полосу и зоны); режим отменяется Escape, ничего не сохраняет.
  const [, , nodeName, file, parentName] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}/deploy`);
  await page.locator(".dp-stage .react-flow__node").first().waitFor();
  await settle();
  if (process.env.LABELS === "off") {
    const btn = page.locator('button[aria-label="Подписи связей"]');
    if ((await btn.getAttribute("aria-pressed")) !== "true") await btn.click();
    await settle();
  }
  const rowOf = (name) => page.locator(".nt-row", { has: page.locator(".nt-name", { hasText: D(name) }) }).first();
  if (parentName) {
    const chev = rowOf(parentName).locator('button[aria-label="Развернуть ветку"]');
    if (await chev.count()) { await chev.click(); await page.waitForTimeout(500); }
  }
  const row = rowOf(nodeName);
  await row.hover();
  await row.locator("button.nt-place").click();
  await page.locator(".dp-placing").waitFor();
  await page.waitForTimeout(600);
  await page.mouse.move(720, 20);
  const clipH = Number(process.env.CLIP_H) || 0;
  await snap(page, file ?? "deploy-placing.png", clipH ? { clip: { x: 0, y: 0, width: 1440, height: clipH } } : {});
  await page.keyboard.press("Escape");
} else if (what === "placement") {
  // Окно «Размещение» для нескольких объектов (DOCS_USER=architect): placement "<Проект>"
  // <файл.png> "<Объект>" "<Объект>"… — карточки выделяются Ctrl-щелчком (первая карточка
  // каждого объекта), кнопка «Указать размещение» на панели выделения; кадр — окно.
  // Ничего не применяет.
  const [, , file, ...names] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  await page.goto(`${FRONTEND}/#/p/${project.id}/deploy`);
  await page.locator(".dp-stage .react-flow__node").first().waitFor();
  await settle();
  for (const name of names) {
    const node = all.find((n) => n.name === name);
    if (!node) throw new Error(`объект «${name}» не найден`);
    await page.locator(`.react-flow__node[data-id^="deploy:${node.id}@"]`).first().click({ modifiers: ["Control"] });
    await page.waitForTimeout(250);
  }
  await page.locator(".dp-selection").getByRole("button", { name: "Указать размещение" }).click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator(".site-row").first().waitFor();
  await page.waitForTimeout(500);
  await page.mouse.move(720, 20);
  await snap(dlg, file ?? "deploy-placement.png");
} else if (what === "status") {
  // Статус страницы (DOCS_USER=architect — у объекта список значений, у системы список
  // вложенных объектов): status "<Проект>" "<Объект>" <файл.png> ["<Согласованный>"…] — статус
  // справа от имени раскрыт; кадр — строка имени со статусом и список. Названные после файла
  // объекты на время кадра получают статус «Согласовано» (PATCH approval), после кадра
  // статус возвращается к «В работе».
  const [, , nodeName, file, ...approved] = process.argv.slice(2);
  const hdr = { Authorization: `Bearer ${token}`, "X-Project-Id": project.id, "Content-Type": "application/json" };
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: hdr })).json();
  const byName = (n) => { const x = all.find((y) => y.name === n); if (!x) throw new Error(`объект «${n}» не найден`); return x; };
  const node = byName(nodeName);
  const setApproval = async (name, approval) => {
    const r = await fetch(`${BACKEND}/api/v1/nodes/${byName(name).id}`, { method: "PATCH", headers: hdr, body: JSON.stringify({ approval }) });
    if (!r.ok) throw new Error(`статус «${name}»: ${r.status}`);
  };
  try {
    for (const n of approved) await setApproval(n, "approved");
    await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
    const pill = page.locator("button.np-approval");
    await pill.waitFor();
    await settle(300);
    await pill.click();
    const menu = page.locator(".np-approval-menu");
    await menu.locator(".np-approval-row").first().waitFor();
    await page.waitForTimeout(400);
    await page.mouse.move(720, 20);
    const boxes = await Promise.all([page.locator(".np-header").first(), pill, menu].map((l) => l.boundingBox()));
    const x0 = Math.min(...boxes.map((b) => b.x)) - 24, y0 = Math.min(...boxes.map((b) => b.y)) - 16;
    const x1 = Math.max(...boxes.map((b) => b.x + b.width)) + 24;
    // Низ кадра — под списком; строка свойств, которую он режет, входит в кадр целиком
    const y1 = await page.evaluate((edge) => {
      let y = edge;
      for (const e of document.querySelectorAll(".np-prop")) {
        const r = e.getBoundingClientRect();
        if (r.top < y && r.bottom > y) y = r.bottom + 8;
      }
      return y;
    }, Math.max(...boxes.slice(1).map((b) => b.y + b.height)) + 12);
    await snap(page, file ?? "status-pill.png", { clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
  } finally {
    for (const n of approved) await setApproval(n, "in_progress");
  }
} else if (what === "versions") {
  // Панель «Версии документации» (DOCS_USER=architect — со строкой «Зафиксировать версию»):
  // versions "<Проект>" "<Объект>" <файл.png> [N [restore]] — ⋯-меню страницы объекта →
  // «Версии документации», кадр — панель; с N открыт экран версии vN; с restore — окно
  // «Восстановить версию N?» (кадр — оно, не подтверждается).
  const [, , nodeName, file, num, restore] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const node = all.find((n) => n.name === nodeName);
  if (!node) throw new Error(`объект «${nodeName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/nodes/${node.id}`);
  const menuBtn = page.locator("button.np-menu-btn");
  await menuBtn.waitFor();
  await settle(300);
  await menuBtn.click();
  await page.locator(".np-dropdown").getByRole("button", { name: "Версии документации" }).click();
  const dlg = page.locator("dialog[open]").first();
  await dlg.locator(".vp-row").first().waitFor();
  await page.waitForTimeout(400);
  if (num) {
    await dlg.locator(".vp-row").filter({ has: page.locator(".vp-row-n", { hasText: new RegExp(`^v${num}$`) }) }).first().click();
    await dlg.locator(".vp-irow").first().waitFor();
    await page.waitForTimeout(500);
  }
  await page.mouse.move(720, 20);
  if (num && restore) {
    await dlg.getByRole("button", { name: "Восстановить эту версию" }).click();
    // Окно подтверждения — соседний <dialog> (вложенных не бывает), последний открытый
    const confirm = page.locator("dialog[open]", { hasText: "Восстановить версию" }).last();
    await confirm.waitFor();
    await page.waitForTimeout(400);
    await snap(confirm, file ?? "versions-restore.png");
    await page.keyboard.press("Escape");
  } else {
    await snap(dlg, file ?? (num ? "versions-diff.png" : "versions-list.png"));
  }
} else if (what === "new-node") {
  // Окно «Новый объект» из дерева редактора (DOCS_USER=architect): new-node "<Проект>" "<Уровень>"
  // "<Объект>" <файл.png> [open] — уровень открыт в редакторе схемы, на строке объекта в дереве
  // нажат «+»; с open раскрыт список поля «Тип» (серые пункты — типы, невозможные здесь). Кадр —
  // окно; окно закрывается без создания.
  const [, , levelName, nodeName, file, open] = process.argv.slice(2);
  const all = await (await fetch(`${BACKEND}/api/v1/nodes/all`, { headers: { Authorization: `Bearer ${token}`, "X-Project-Id": project.id } })).json();
  const level = all.find((n) => n.name === levelName);
  if (!level) throw new Error(`объект «${levelName}» не найден`);
  await page.goto(`${FRONTEND}/#/p/${project.id}/map/${level.id}`);
  await page.locator(".react-flow__node").first().waitFor();
  await settle(300);
  // Строка уровня в дереве свёрнута — ветка раскрывается шевроном, чтобы объект был виден
  const rowOf = (name) => page.locator(".nt-row", { has: page.locator(".nt-name", { hasText: D(name) }) }).first();
  const chev = rowOf(levelName).locator('button[aria-label="Развернуть ветку"]');
  if (await chev.count()) { await chev.click(); await page.waitForTimeout(500); }
  const row = rowOf(nodeName);
  await row.hover();
  await row.locator("button.nt-add-child").click();
  const dlg = page.locator("dialog[open]");
  const field = dlg.locator("button.ts-trigger");
  await field.waitFor();
  if (open) {
    await field.click();
    await dlg.locator(".ts-menu").waitFor();
  }
  await page.waitForTimeout(500);
  await snap(dlg, file ?? "node-new.png");
  if (open) await page.keyboard.press("Escape");
  await dlg.getByRole("button", { name: D("Закрыть") }).first().click();
} else if (what === "legend") {
  // Легенда схемы на странице проекта: legend "<Проект>" <файл.png> — кнопка «Легенда» в углу
  // схемы, кадр — раскрытая панель.
  const [, , file] = process.argv.slice(2);
  await page.goto(`${FRONTEND}/#/p/${project.id}`);
  await section("Схема").waitFor();
  await settle(300);
  await page.locator('button[title="Легенда схемы"]').first().click();
  // Панель рисуется поверх страницы (портал в body) и встаёт в окно целиком
  const panel = page.locator(".sleg-panel").first();
  await panel.waitFor();
  await page.waitForTimeout(400);
  await page.mouse.move(720, 20);
  await snap(panel, file ?? "legend-types.png");
} else {
  throw new Error("что снимать: projects | home | node | search | section | head | doc | process | export | password | tokens | ci-token | code-change | fullscreen | create | editor | deploy | sites | placing | placement | status | versions | new-node | legend");
}
console.log("ошибки страницы:", errors.length ? errors : "нет");
await browser.close();
