// Английские снимки для content/en/images: продукт пока не переведён, поэтому снимается
// «прототип» тех же окон — интерфейс стенда с подменой текстов по словарям ru→en:
//   en/ui.json   — подписи интерфейса (они же — глоссарий английской документации);
//   en/data.json — данные демо-проектов (имена, описания, схемы логики, процессы…).
// Данные переводятся в ответах API до отрисовки (раскладка схем строится по английским
// подписям), подписи интерфейса — на странице перед кадром. Непереведённое собирается:
// перед кадром печатаются остатки кириллицы на экране, MISS_OUT=<файл> дописывает их в JSON.
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadDict() {
  const read = (name) => JSON.parse(readFileSync(join(HERE, "en", name), "utf8"));
  return { ...read("data.json"), ...read("ui.json") };
}

// Перевод строки по словарю. Самодостаточна: её текст исполняется и в браузере.
//  - Однострочная строка без разметки — одна единица перевода.
//  - Иначе по строкам, внутри строки — куски между разделителями разметки (", [ ] { } | < >)
//    и « · »; у строки YAML «ключ: значение» переводится значение.
//  - Единица ищется без краевых пробелов и знаков препинания, они возвращаются на место;
//    «12 объектов» — число отдельно, слова по словарю.
// Ненайденные единицы складываются в miss.
export function translate(s, dict, miss) {
  const CYR = /[А-Яа-яЁё]/;
  if (typeof s !== "string" || !CYR.test(s)) return s;
  const has = (k) => Object.prototype.hasOwnProperty.call(dict, k);
  // Перевод ядра или null: целиком, «число + слова», «пометка: имя» (пишет: orders)
  const look = (core) => {
    if (!CYR.test(core)) return core;
    if (has(core)) return dict[core];
    const num = /^(\d+)\s+(.+)$/.exec(core);
    if (num && has(num[2])) return num[1] + " " + dict[num[2]];
    const colon = core.indexOf(": ");
    if (colon > 0) {
      const head = look(core.slice(0, colon));
      const tail = look(core.slice(colon + 2));
      if (head !== null && tail !== null) return head + ": " + tail;
    }
    return null;
  };
  const unit = (text) => {
    // Ключ с краевыми знаками («17 окт.» → «Oct 17» без точки) важнее разбора
    if (has(text.trim())) return text.replace(text.trim(), dict[text.trim()]);
    const m = /^([\s,.;:·—–!?…']*)([\s\S]*?)([\s,.;:·—–!?…']*)$/.exec(text);
    const pre = m[1], core = m[2], post = m[3];
    const t = look(core);
    if (t !== null) return pre + t + post;
    if (miss) miss.add(core);
    return text;
  };
  const DELIM = /["[\]{}|<>]| · /;
  if (!s.includes("\n") && !DELIM.test(s)) return unit(s);
  return s.split("\n").map((line) => line.split(/(["[\]{}|<>]| · )/).map((seg) => {
    if (!CYR.test(seg)) return seg;
    const kv = /^(\s*(?:- )?[A-Za-z0-9_.-]+:\s+)([\s\S]*)$/.exec(seg);
    return kv ? kv[1] + unit(kv[2]) : unit(seg);
  }).join("")).join("\n");
}

function deep(v, dict, miss) {
  if (typeof v === "string") return translate(v, dict, miss);
  if (Array.isArray(v)) return v.map((x) => deep(x, dict, miss));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x, dict, miss)]));
  return v;
}

// Поиск по дереву идёт на бэкенде по русским именам: английский запрос дополняется
// русскими формами, ответы склеиваются (что нашлось по-английски, остаётся)
const SEARCH = { order: ["заказ"] };

async function searchMerged(route, url) {
  const q = url.searchParams.get("q") ?? "";
  const resp = await route.fetch();
  const found = await resp.json();
  for (const ru of SEARCH[q.toLowerCase()] ?? []) {
    url.searchParams.set("q", ru);
    const more = await (await route.fetch({ url: url.toString() })).json();
    for (const n of more) if (!found.some((f) => f.id === n.id)) found.push(n);
  }
  return { resp, found };
}

// Ответы API (JSON и текст) переводятся до того, как их увидит приложение
export async function installEn(page, frontend, dict, miss) {
  await page.route(`${frontend}/api/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/nodes/search")) {
      const { resp, found } = await searchMerged(route, url);
      const headers = { ...resp.headers() };
      delete headers["content-length"];
      delete headers["content-encoding"];
      return route.fulfill({ response: resp, headers, body: JSON.stringify(deep(found, dict, miss)) });
    }
    const resp = await route.fetch();
    const headers = { ...resp.headers() };
    delete headers["content-length"];
    delete headers["content-encoding"];
    const type = headers["content-type"] ?? "";
    if (type.includes("json")) {
      const body = JSON.stringify(deep(await resp.json(), dict, miss));
      return route.fulfill({ response: resp, headers, body });
    }
    if (type.startsWith("text/") || type.includes("yaml")) {
      return route.fulfill({ response: resp, headers, body: translate(await resp.text(), dict, miss) });
    }
    return route.fulfill({ response: resp });
  });
}

// Подписи интерфейса на странице: текстовые узлы и placeholder; дальше их держит
// MutationObserver (перерисовка React вернула бы русский текст). Возвращает остатки
// кириллицы на экране и ненайденные единицы.
export async function domPass(page, dict) {
  return page.evaluate(([src, d]) => {
    // eslint-disable-next-line no-eval
    const tr = eval(`(${src})`);
    const miss = new Set();
    const CYR = /[А-Яа-яЁё]/;
    const fix = (n) => {
      if (n.nodeType === 3) {
        const t = n.parentElement?.closest("script, style") ? n.nodeValue : tr(n.nodeValue, d, miss);
        if (t !== n.nodeValue) n.nodeValue = t;
      } else if (n.nodeType === 1) {
        for (const a of ["placeholder"]) {
          const v = n.getAttribute?.(a);
          if (v && CYR.test(v)) n.setAttribute(a, tr(v, d, miss));
        }
      }
    };
    const all = (root) => {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let n = w.currentNode; n; n = w.nextNode()) fix(n);
    };
    all(document.body);
    if (!window.__enObs) {
      window.__enObs = new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === "characterData") fix(m.target);
          for (const n of m.addedNodes) (n.nodeType === 1 ? all(n) : fix(n));
        }
      });
      window.__enObs.observe(document.body, { subtree: true, childList: true, characterData: true });
    }
    const left = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!el || !CYR.test(n.nodeValue) || el.closest("script, style")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden") continue;
      left.push(n.nodeValue.trim());
    }
    for (const el of document.querySelectorAll("[placeholder]")) {
      if (CYR.test(el.getAttribute("placeholder"))) left.push(`placeholder: ${el.getAttribute("placeholder")}`);
    }
    return { left: [...new Set(left)], miss: [...miss] };
  }, [translate.toString(), dict]);
}

// Итог одного кадра: остатки — в консоль и (MISS_OUT) в файл для пополнения словарей
export function report(file, apiMiss, pass) {
  const rec = { file, api: [...apiMiss], dom: pass.miss, left: pass.left };
  if (process.env.MISS_OUT) appendFileSync(process.env.MISS_OUT, JSON.stringify(rec) + "\n");
  if (pass.left.length) console.error(`${file}: на экране осталась кириллица (${pass.left.length}): ${pass.left.slice(0, 8).join(" | ")}`);
}
