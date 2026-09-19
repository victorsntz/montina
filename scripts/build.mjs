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
<li class="l1 front"><a href="#borboleta"><span class="n"></span><span>Por que a borboleta?</span></a></li>
</ol>
</section>`;
body = body.replace("<!--TOC-->", toc);

// ---- fluxo editorial por capítulo ----
// 1) um único parágrafo de destaque (lead) por capítulo, o de abertura
// 2) cada h2/h3 fica colado ao primeiro bloco seguinte; seções curtas não se partem
// 3) ornamento de fim de capítulo
const chapterEndFor = (n) => `<div class="chapter-end" data-num="${n}"><span></span>${inlineSvg("mark-borboleta")}<span></span></div>`;
const KEEP_WHOLE = 700; // caracteres de texto ≈ meia página
function keepTogether(html) {
  // divide em segmentos a partir de h2 "de topo" (os h2 dentro de .spot têm margin-top:0 e ficam de fora)
  const parts = html.split(/(?=<h2 (?![^>]*margin-top:0))/);
  return parts.map((seg, idx) => {
    if (idx === 0) return seg;
    const textLen = strip(seg).length;
    if (textLen <= KEEP_WHOLE) return `<div class="keep">${seg}</div>`;
    // título + primeiro bloco simples (p ou ul)
    // título + primeiro bloco (p ou ul) + uma lista curta logo em seguida
    return seg.replace(/^(<h2[^>]*>[\s\S]*?<\/h2>\s*)(<p[^>]*>[\s\S]*?<\/p>|<ul[^>]*>[\s\S]*?<\/ul>)?(\s*<ul[^>]*>[\s\S]*?<\/ul>)?/, (m, h, first, list) => `<div class="keep">${h}${first || ""}${shortList(list)}</div>`);
  }).join("");
}
function shortList(list) {
  if (!list) return "";
  return (list.match(/<li/g) || []).length <= 9 ? list : "";
}
function keepH3(html) {
  return html.replace(/(<h3[^>]*>[\s\S]*?<\/h3>\s*)(<p[^>]*>[\s\S]*?<\/p>|<ul[^>]*>[\s\S]*?<\/ul>)(\s*<ul[^>]*>[\s\S]*?<\/ul>)?/g, (m, h, first, list) => `<div class="keep">${h}${first}${shortList(list)}</div>`);
}
let chapterIndex = 0;
body = body.replace(/<section class="chapter"[\s\S]*?<\/section>/g, chapter => {
  const chapterEnd = chapterEndFor(++chapterIndex);
  const cut = chapter.indexOf("</div>", chapter.indexOf('class="chapter-opener"')); // fim do opener é o último </div> do bloco; usamos o marcador seguro abaixo
  const openerEnd = chapter.indexOf('</div>\n\n', chapter.indexOf('class="chapter-opener"')) + '</div>'.length;
  let head = chapter.slice(0, openerEnd);
  let rest = chapter.slice(openerEnd);
  // só o primeiro lead do corpo permanece
  let leadSeen = false;
  rest = rest.replace(/<p class="lead">/g, () => { if (leadSeen) return "<p>"; leadSeen = true; return '<p class="lead">'; });
  rest = rest.replace(/<\/section>\s*$/, "").replace(/\s+$/, "");
  rest = keepH3(keepTogether(rest));
  // o ornamento de fim de capítulo viaja junto com o último bloco (nunca sozinho numa página)
  const idx = rest.lastIndexOf("\n  <");
  const tail = rest.slice(idx);
  if (tail.startsWith('\n  <div class="keep">')) {
    rest = rest.slice(0, idx) + tail.replace(/<\/div>\s*$/, `${chapterEnd}</div>`);
  } else {
    rest = rest.slice(0, idx) + `\n  <div class="keep">${tail.trim()}${chapterEnd}</div>`;
  }
  return `${head}${rest}\n</section>`;
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
  .replace("<!--SCRIPTS-->", `<script>window.PagedConfig = { auto: false };</script><script src="paged.polyfill.js"></script>
<script>
  // Última página de cada capítulo: faixa de encerramento no rodapé (substitui número e título de rodapé).
  class FimDeCapitulo extends Paged.Handler {
    afterPageLayout(pageEl, page) {
      const end = pageEl.querySelector(".chapter-end");
      if (!end) return;
      pageEl.classList.add("chapter-last");
      const band = document.createElement("div");
      band.className = "chapter-last-band";
      band.innerHTML = '<span class="rule"></span>' + end.querySelector("svg").outerHTML +
        '<span class="rule"></span><span class="pg">' + (page.position + 1) + '</span>';
      pageEl.querySelector(".pagedjs_pagebox").appendChild(band);
    }
  }
  Paged.registerHandlers(FimDeCapitulo);
  window.PagedPolyfill.preview().then(() => { window.__pagedDone = true; });
</script>`);
writeFileSync(join(dist, "print.html"), print);

console.log(`build ok: ${files.length} arquivos de conteúdo, ${tocItems.length} capítulos`);
