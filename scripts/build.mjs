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
// QR Codes também clicáveis no PDF de leitura e na web (os endereços são os que os códigos leem)
const QR_URL = { ubs: "https://info.saude.df.gov.br/busca-saude-ubs/", "ceaf-digital": "https://ceafdigital.saude.df.gov.br/",
  "farmacia-estoque": "https://info.saude.df.gov.br/saude-do-cidadao/painel-infosaude-farmacias-de-alto-custo/",
  "instagram-anplupus": "https://www.instagram.com/anplupus", "instagram-amaviraras": "https://www.instagram.com/amaviraras",
  "site-amaviraras": "https://www.amaviraras.org/" };
function inlineQr(name) {
  const svg = readFileSync(join(root, "assets/qr", `${name}.svg`), "utf8").replace(/<\?xml[^>]*>\s*/, "");
  return QR_URL[name] ? `<a class="qr-link" href="${QR_URL[name]}">${svg}</a>` : svg;
}
// texto alternativo dos logos (leitor de tela na web e no PDF com tags)
const LOGO_ALT = { srb: "Sociedade de Reumatologia de Brasília", "srb-branco": "Sociedade de Reumatologia de Brasília", anplupus: "ANPLúpus",
  "anplupus-horizontal": "ANPLúpus", "anplupus-horizontal-branco": "ANPLúpus", amaviraras: "AMAVI Raras" };
function logoTag(name) {
  for (const ext of ["svg", "png", "jpg", "jpeg"]) {
    if (existsSync(join(root, "assets/logos", `${name}.${ext}`))) return `<img src="assets/logos/${name}.${ext}" alt="${LOGO_ALT[name] || name}">`;
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
<li class="l1 front roman"><a href="#prefacio"><span class="n"></span><span class="tt">Prefácio</span></a></li>
${tocItems.map(c => `<li class="l1"><a href="#${c.id}"><span class="n">${String(c.num).padStart(2, "0")}</span><span class="tt">${c.title}</span></a>
${c.subs.map(s => `<li class="l2"><a href="#${s.id}"><span></span><span class="tt">${s.title}</span></a></li>`).join("\n")}</li>`).join("\n")}
<li class="l1 front"><a href="#referencias"><span class="n"></span><span class="tt">Referências bibliográficas</span></a></li>
<li class="l1 front"><a href="#borboleta"><span class="n"></span><span class="tt">Por que a borboleta?</span></a></li>
</ol>
</section>`;
body = body.replace("<!--TOC-->", toc);

// ---- fluxo editorial por capítulo ----
// 1) um único parágrafo de destaque (lead) por capítulo, o de abertura
// 2) cada h2/h3 fica colado ao primeiro bloco seguinte; seções curtas não se partem
// 3) ornamento de fim de capítulo
const chapterEndFor = (n) => `<div class="chapter-end" data-num="${n}"><span></span>${inlineSvg("mark-borboleta")}<span></span></div>`;
const KEEP_WHOLE = 500; // caracteres de texto ≈ um terço de página: seção curta não se parte
function keepTogether(html) {
  // divide em segmentos a partir de h2 "de topo" (os h2 dentro de .spot têm margin-top:0 e ficam de fora)
  const parts = html.split(/(?=<h2 (?![^>]*margin-top:0))/);
  return parts.map((seg, idx) => {
    if (idx === 0) return seg;
    const textLen = strip(seg).length;
    if (textLen <= KEEP_WHOLE) return `<div class="keep">${seg}</div>`;
    return keepHead(seg);
  }).join("");
}
// título + o texto que vem logo depois, até somar umas duas linhas (≈160 caracteres): um título nunca fica no pé
// da página só com uma frase curta. Lista curta (até 3 itens) vai inteira; lista longa leva só os 2 primeiros itens.
function keepHead(seg) {
  const bl = topBlocks(seg);
  if (!bl.length) return seg;
  let inner = seg.slice(0, bl[0].end), consumed = bl[0].end, text = 0, extra = "";
  for (let i = 1; i < bl.length && text < 160; i++) {
    const html = seg.slice(bl[i].start, bl[i].end);
    if (i > 1 && !/^<(p|ul)\b/.test(html)) break;
    const gap = seg.slice(consumed, bl[i].start);
    if (/^<ul\b/.test(html)) {
      const [a, b] = splitList(html);
      inner += gap + a; consumed = bl[i].end;
      if (b) { extra = b; break; }
    } else { inner += gap + html; consumed = bl[i].end; }
    text += strip(html).length;
  }
  return `<div class="keep">${inner}</div>${extra}${seg.slice(consumed)}`;
}
// lista com até 3 itens vai inteira; maior que isso, os 2 primeiros itens ficam presos ao título e o resto continua numa lista colada
function splitList(list) {
  const lead = list.match(/^\s*/)[0];
  const open = list.match(/<ul[^>]*>/)[0];
  const items = list.match(/<li\b[\s\S]*?<\/li>/g) || [];
  if (items.length <= 3) return [list, ""];
  const cls = (extra) => open.includes('class="') ? open.replace('class="', `class="${extra} `) : open.replace("<ul", `<ul class="${extra}"`);
  return [`${lead}${cls("keep-head")}${items.slice(0, 2).join("")}</ul>`, `${cls("cont")}${items.slice(2).join("")}</ul>`];
}
function keepH3(html) {
  // só os h3 de topo (recuo de 2 espaços); os h3 dentro de cartões (.spot) já viajam com o cartão inteiro
  return html.replace(/(\n  )(<h3[^>]*>[\s\S]*?<\/h3>(?:\s*(?:<p[^>]*>[\s\S]*?<\/p>|<ul[^>]*>[\s\S]*?<\/ul>)){0,3})/g, (m, lead, seg) => lead + keepHead(seg));
}
// blocos de topo de um trecho de HTML (contagem de profundidade das tags; ignora void e auto-fechadas)
const VOID_TAGS = new Set(["br", "img", "hr", "meta", "link", "input", "source", "wbr"]);
function topBlocks(html) {
  const out = []; let depth = 0, start = -1;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g)) {
    const [, close, tag, self] = m;
    if (self || VOID_TAGS.has(tag.toLowerCase())) { if (depth === 0) out.push({ start: m.index, end: m.index + m[0].length }); continue; }
    if (!close) { if (depth === 0) start = m.index; depth++; }
    else { depth--; if (depth === 0) out.push({ start, end: m.index + m[0].length }); }
  }
  return out;
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
  // o ornamento de fim de capítulo viaja junto com o último bloco (nunca sozinho numa página);
  // uma caixa (Importante, Dica, Lembre-se) também nunca fecha o capítulo sozinha: leva junto o bloco anterior
  const blocks = topBlocks(rest);
  const last = blocks[blocks.length - 1];
  let from = last.start;
  const prev = blocks[blocks.length - 2];
  if (prev && /^<div class="box\b/.test(rest.slice(last.start)) && strip(rest.slice(prev.start, prev.end)).length <= 1200) from = prev.start;
  rest = rest.slice(0, from) + `<div class="keep">${rest.slice(from, last.end)}${chapterEnd}</div>` + rest.slice(last.end);
  return `${head}${rest}\n</section>`;
});

// ---- sem viúvas: cola as duas últimas palavras de cada bloco de texto ----
// Troca o último espaço (antes da última palavra, ignorando tags de fechamento) por espaço inquebrável.
function noWidows(html) {
  return html.replace(/(<(p|li|h1|h2|h3|h4|dd|dt|td|div class="tp-quote"|span class="tt"|p class="[^"]*")[^>]*>)([\s\S]*?)(<\/(?:p|li|h1|h2|h3|h4|dd|dt|td|div|span)>)/g, (m, open, tag, inner, close) => {
    if (inner.includes("<ul") || inner.includes("<div class=") || inner.includes("<p")) return m; // blocos aninhados: deixa para os filhos
    const fixed = inner.replace(/[ \t\n]+(?=(?:<[^>]+>)*[^\s<>]+(?:<\/[a-z]+>[^\s<>]*)*[ \t\n]*$)/, "\u00a0");
    return open + fixed + close;
  });
}
// ---- acabamento tipográfico ----
// aspas tipográficas nos nós de texto (abre depois de espaço, início ou parêntese; fecha nos demais casos)
function smartQuotes(html) {
  let prev = " ";
  return html.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, text) => {
    if (tag) return tag;
    let out = "";
    for (const ch of text) {
      if (ch === '"') out += /[\s(\[{ —–-]/.test(prev) ? "“" : "”";
      else out += ch;
      prev = ch;
    }
    return out;
  });
}
body = smartQuotes(body);
// tratamentos e nome próprio não se separam no fim da linha
body = body.replace(/\b(Dra?\.) (?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g, "$1 ").replace(/Cristina Montina/g, "Cristina Montina");
// expressões que não se partem no fim da linha
body = body.replace(/QR Code/g, "QR\u00a0Code").replace(/Distrito Federal/g, "Distrito\u00a0Federal").replace(/Alto Custo/g, "Alto\u00a0Custo").replace(/São Paulo/g, "São\u00a0Paulo");
// versão digital: endereços, e-mails, sites e telefones viram links (PDF de leitura e web; no papel não muda nada)
body = body.replace(/<p class="url">([^<]+)<\/p>/g, (m, t) =>
  `<p class="url"><a href="${t.startsWith("@") ? "https://www.instagram.com/" + t.slice(1) : "https://" + t}">${t}</a></p>`);
body = body.replace(/<dd>([^<]+)<\/dd>/g, (m, t) => {
  if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(t)) return `<dd><a href="mailto:${t}">${t}</a></dd>`;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t)) return `<dd><a href="https://${t}">${t}</a></dd>`;
  return m;
});
body = body.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => tag || txt.replace(/\(61\) \d{4,5}-\d{4}/g, n => `<a href="tel:+55${n.replace(/\D/g, "")}">${n}</a>`));
// URL dos QR Codes: quebra só depois de barra; cada trecho fica inteiro (só nos nós de texto, para não tocar no link)
body = body.replace(/(<p class="url">)([\s\S]*?)(<\/p>)/g, (m, a, t, b) =>
  a + t.replace(/(<[^>]+>)|([^<]+)/g, (mm, tag, txt) => tag || txt.split("/").map(s => s && `<span class="url-seg">${s}</span>`).join("/<wbr>")) + b);
// referências: volume, página e intervalos não se separam
body = body.replace(/(<ol class="refs-list">)([\s\S]*?)(<\/ol>)/, (m, a, t, b) =>
  a + t.replace(/\b(v|p|n|supl)\. (?=\d)/g, "$1. ").replace(/(\d+)([–-])(\d+)/g, '<span class="nw">$1$2$3</span>') + b);
// fluxos em pílulas: o separador (+ ou →) viaja com a etapa seguinte, nunca fica pendurado no fim da linha
body = body.replace(/<span class="arrow">([\s\S]*?)<\/span>\s*(<span class="step">[\s\S]*?<\/span>)/g, '<span class="pair"><span class="arrow">$1</span>$2</span>');
body = noWidows(body);

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
  // Topo da mancha alinhado: o primeiro bloco de cada página de texto não carrega margem superior.
  class TopoAlinhado extends Paged.Handler {
    afterPageLayout(pageEl) {
      const area = pageEl.querySelector(".pagedjs_page_content");
      if (!area || !area.querySelector("section.chapter") || area.querySelector(".chapter-opener")) return;
      let el = area.firstElementChild;
      for (let i = 0; el && i < 8; i++) {
        if (el.matches(".spot .icon")) break;
        el.style.marginTop = "0";
        el = el.firstElementChild;
      }
    }
  }
  // Sumário: o Prefácio fica nas páginas iniciais (romanas), então o número dele sai em romano, lido da página real.
  class SumarioRomano extends Paged.Handler {
    afterRendered(pages) {
      const alvo = document.querySelector(".pagedjs_page #prefacio");
      const link = document.querySelector(".toc li.roman > a");
      if (!alvo || !link) return;
      let n = Number(alvo.closest(".pagedjs_page").dataset.pageNumber), r = "";
      for (const [v, k] of [[10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]]) while (n >= v) { r += k; n -= v; }
      link.setAttribute("data-pg", r);
    }
  }
  // Aberturas de capítulo, referências e bônus: só o fólio no rodapé, sem repetir o título que já está na página.
  class AberturaDeCapitulo extends Paged.Handler {
    afterPageLayout(pageEl) { if (pageEl.querySelector(".chapter-opener, section.bonus > h1")) pageEl.classList.add("chapter-first"); }
  }
  Paged.registerHandlers(FimDeCapitulo, TopoAlinhado, SumarioRomano, AberturaDeCapitulo);
  window.PagedPolyfill.preview().then(() => { window.__pagedDone = true; });
</script>`);
writeFileSync(join(dist, "print.html"), print);

// ---- versão para gráfica: sangria de 3 mm (as marcas de corte entram no livreto.py, fora da sangria) ----
const cssGrafica = readFileSync(join(root, "src/styles.css"), "utf8")
  .replace("size: A4;\n  margin: 20mm 18mm 22mm 22mm;", "size: A4;\n  bleed: 3mm;\n  margin: 20mm 18mm 22mm 22mm;");
if (!cssGrafica.includes("bleed: 3mm")) throw new Error("não achei o bloco @page para inserir a sangria");
writeFileSync(join(dist, "styles-grafica.css"), cssGrafica);
const grafica = print.replace('href="styles.css"', 'href="styles-grafica.css"').replace("</head>", `<style>
  /* fundo das páginas de capa e da faixa de fim de capítulo avança na sangria */
  .pagedjs_page.pagedjs_cover_page { background: #2b1b33; }
  .pagedjs_page.chapter-last { background: #fff; box-shadow: inset 0 -20mm 0 #f5f0f8; } /* cor chapada em vetor (degradê virava bitmap no CMYK) */
  /* a arte da capa avança na sangria (antes era cortada no refile) */
  .pagedjs_cover_page .cover { overflow: visible; } .cover .art svg { overflow: visible; }
  /* texto corrido, negrito e QR Codes em preto puro: o preto100k.py leva para 100% K (sem franja de registro no corpo de 10,5 pt) */
  :root { --ink: #000; } strong { color: #000; } .qr .code { color: #000; }
  .pagedjs_page.chapter-last .chapter-last-band { border-top: 0; }
  .pagedjs_page.chapter-last .chapter-last-band::before { content: ""; position: absolute; left: -3mm; right: -3mm; top: 0; height: 2.5px; background: #7a4e93; }
  @media screen { .pagedjs_page { background: white; } }
</style></head>`);
writeFileSync(join(dist, "print-grafica.html"), grafica);

console.log(`build ok: ${files.length} arquivos de conteúdo, ${tocItems.length} capítulos`);
