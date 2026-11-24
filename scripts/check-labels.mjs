// Сторож подписей: каждая жирная подпись русской версии сайта (**…**) должна встречаться в
// исходниках фронта продукта (.ts и .tsx без тестов и генерата api.gen.ts). Печатает
// подписи, которых там нет, со страницами, где они стоят. Подпись, переехавшую в другое
// место интерфейса, сторож не видит: её ловит только проход по шагам.
//   node scripts/check-labels.mjs <frontend/src продукта> [<content сайта>]
// Остаток законен, если это шаблон с «…» или N, заголовок разбора неполадок или имя не из
// интерфейса (например, состояние пода Kubernetes). В хук и CI не включён: продукта рядом
// с сайтом там нет.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const [front, contentArg] = process.argv.slice(2);
if (!front) {
  console.error("Использование: node scripts/check-labels.mjs <frontend/src продукта> [<content сайта>]");
  process.exit(2);
}
const content = contentArg ?? join(dirname(fileURLToPath(import.meta.url)), "..", "content");

// Пробельные знаки — те же, что у str.isspace в Python (первая версия сторожа была на нём):
// вывод совпадает знак в знак.
const WS = "\\t\\n\\x0b\\x0c\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const wsRun = new RegExp(`[${WS}]+`, "g");
const strip = (s) => s.replace(new RegExp(`^[${WS}]+|[${WS}]+$`, "g"), "");

// Порядок строк — по кодовым точкам, как sorted() в Python.
const byCodePoint = (a, b) => {
  const x = [...a];
  const y = [...b];
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    const d = x[i].codePointAt(0) - y[i].codePointAt(0);
    if (d !== 0) return d;
  }
  return x.length - y.length;
};

// Все файлы под папкой: пути относительно неё, разделитель — «/».
function walk(root) {
  return readdirSync(root, { recursive: true })
    .map((p) => String(p))
    .filter((p) => statSync(join(root, p)).isFile())
    .map((p) => p.split(sep).join("/"));
}

const src = walk(front)
  .filter((p) => /\.tsx?$/.test(p) && !p.split("/").includes("__tests__") && !p.endsWith(".gen.ts"))
  .map((p) => readFileSync(join(front, p), "utf8"))
  .join("\n")
  .replace(wsRun, " ");

const labels = new Map();
for (const page of walk(content).filter((p) => p.endsWith(".md") && !p.split("/").includes("en"))) {
  const text = readFileSync(join(content, page), "utf8");
  for (const m of text.matchAll(/\*\*([^*\n]+)\*\*/g)) {
    const label = strip(m[1]);
    if (!labels.has(label)) labels.set(label, new Set());
    labels.get(label).add(relative(content, join(content, page)).split(sep).join("/"));
  }
}

const missing = [...labels.keys()].filter((k) => !src.includes(k)).sort(byCodePoint);
console.log(`подписей ${labels.size}, нет в исходниках фронта ${missing.length}`);
for (const k of missing) {
  console.log(`  ${k}  ←  ${[...labels.get(k)].sort(byCodePoint).join(", ")}`);
}
