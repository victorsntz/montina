// Monta dist/index.html (web) e dist/print.html (Paged.js → PDF)
// a partir de content/*.html, src/template.html e src/styles.css.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
mkdirSync(join(dist, "fonts"), { recursive: true });
mkdirSync(join(dist, "assets"), { recursive: true });

// ---- fontes (copiadas do node_modules para o dist) ----
const fonts = {
  "fraunces-latin-wght-normal.woff2": "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  "fraunces-latin-wght-italic.woff2": "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2",
  "inter-latin-wght-normal.woff2": "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  "inter-latin-wght-italic.woff2": "node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2",
};
for (const [name, src] of Object.entries(fonts)) copyFileSync(join(root, src), join(dist, "fonts", name));
copyFileSync(join(root, "src/fonts/stix-two-text-600.woff2"), join(dist, "fonts", "stix-two-text-600.woff2"));

// ---- assets (logos, qr) ----
function copyDir(src, dst) {
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, f.name), d = join(dst, f.name);
    f.isDirectory() ? copyDir(s, d) : copyFileSync(s, d);
  }
}
copyDir(join(root, "assets"), join(dist, "assets"));
copyFileSync(join(root, "src/styles.css"), join(dist, "styles.css"));

// ---- includes: <!--svg:nome--> e <!--qr:nome--> ----
const svgDir = join(root, "src/illustrations");
function inlineSvg(name) {
  const p = join(svgDir, `${name}.svg`);
  if (!existsSync(p)) return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="12" fill="#ece2f1"/><text x="50" y="54" text-anchor="middle" font-size="9" fill="#7a4e93">${name}</text></svg>`;
  return readFileSync(p, "utf8").replace(/<\?xml[^>]*>\s*/, "");
}
function inlineQr(name) {
  return readFileSync(join(root, "assets/qr", `${name}.svg`), "utf8").replace(/<\?xml[^>]*>\s*/, "");
}
function logoTag(name) {
  for (const ext of ["svg", "png", "jpg", "jpeg"]) {
    if (existsSync(join(root, "assets/logos", `${name}.${ext}`))) return `<img src="assets/logos/${name}.${ext}" alt="${name}">`;
  }
  return `<div class="logo-placeholder">${name}</div>`;
}
function photoTag(name) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (existsSync(join(root, "assets/photos", `${name}.${ext}`))) return `<img src="assets/photos/${name}.${ext}" alt="">`;
  }
  return `<div class="photo-placeholder">foto</div>`;
}
function expand(html) {
  return html
    .replace(/<!--svg:([\w-]+)-->/g, (_, n) => inlineSvg(n))
    .replace(/<!--qr:([\w-]+)-->/g, (_, n) => inlineQr(n))
    .replace(/<!--logo:([\w-]+)-->/g, (_, n) => logoTag(n))
    .replace(/<!--photo:([\w-]+)-->/g, (_, n) => photoTag(n));
}

// ---- conteúdo ----
const contentDir = join(root, "content");
const files = readdirSync(contentDir).filter(f => f.endsWith(".html")).sort();
let body = files.map(f => expand(readFileSync(join(contentDir, f), "utf8"))).join("\n");

// ---- sumário automático (h1 dos capítulos + h2) ----
const tocItems = [];
const chapterRe = /<section class="chapter"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/g;
let m;
const sections = [];
while ((m = chapterRe.exec(body))) sections.push({ id: m[1], title: strip(m[2]), start: m.index });
sections.forEach((s, i) => {
  const end = i + 1 < sections.length ? sections[i + 1].start : body.length;
  const chunk = body.slice(s.start, end);
  const subs = [];
  const h2Re = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let h;
  while ((h = h2Re.exec(chunk))) subs.push({ id: h[1], title: strip(h[2].replace(/<span class="num">[\s\S]*?<\/span>/, "")) });
  tocItems.push({ ...s, num: i + 1, subs });
});
function strip(s) { return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }

const toc = `<section class="toc" id="sumario">
<h1>Sumário</h1>
<ol>
<li class="l1 front"><a href="#prefacio"><span class="n"></span><span>Prefácio</span></a></li>
${tocItems.map(c => `<li class="l1"><a href="#${c.id}"><span class="n">${String(c.num).padStart(2, "0")}</span><span>${c.title}</span></a>
${c.subs.map(s => `<li class="l2"><a href="#${s.id}"><span></span><span>${s.title}</span></a></li>`).join("\n")}</li>`).join("\n")}
</ol>
</section>`;
body = body.replace("<!--TOC-->", toc);

// numeração automática nos h2 dentro de cada capítulo (N.M)
sections.forEach((s, i) => {
  const end = i + 1 < sections.length ? sections[i + 1].start : body.length;
});

const template = readFileSync(join(root, "src/template.html"), "utf8");

// ---- versão web ----
const webnav = `<nav class="webnav"><a href="#sumario">Manual para o paciente com lúpus · DF</a><a class="dl" href="cartilha-lupus-df-a4.pdf">Baixar PDF (A4)</a></nav>`;
const web = template
  .replace("<!--BODYCLASS-->", "web")
  .replace("<!--WEBNAV-->", webnav)
  .replace("<!--CONTENT-->", body)
  .replace("<!--HEAD-->", "")
  .replace("<!--SCRIPTS-->", "");
writeFileSync(join(dist, "index.html"), web);

// ---- versão impressa (Paged.js) ----
copyFileSync(join(root, "node_modules/pagedjs/dist/paged.polyfill.js"), join(dist, "paged.polyfill.js"));
const print = template
  .replace("<!--BODYCLASS-->", "print")
  .replace("<!--WEBNAV-->", "")
  .replace("<!--CONTENT-->", body)
  .replace("<!--HEAD-->", `<style>@media screen { body.print { background:#ddd } .pagedjs_page { background:white; margin: 8mm auto; box-shadow: 0 2px 12px rgba(0,0,0,.2);} }</style>`)
  .replace("<!--SCRIPTS-->", `<script>window.PagedConfig = { auto: true, after: () => { window.__pagedDone = true; } };</script><script src="paged.polyfill.js"></script>`);
writeFileSync(join(dist, "print.html"), print);

console.log(`build ok: ${files.length} arquivos de conteúdo, ${tocItems.length} capítulos`);
