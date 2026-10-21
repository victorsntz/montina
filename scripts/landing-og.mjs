// Imagem de prévia (1200 × 630) para WhatsApp e redes, a partir das imagens já renderizadas em landing/dist/img
// A página é gravada como arquivo dentro da pasta de saída e aberta por file://, para que fontes e imagens carreguem.
import { chromium } from "playwright-core";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const out = process.argv[2];
const exe = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/usr/bin/chromium"].filter(Boolean).find(p => existsSync(p));
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face{font-family:Fraunces;font-weight:100 900;src:url(fonts/fraunces-latin-wght-normal.woff2)}
@font-face{font-family:Fraunces;font-style:italic;font-weight:100 900;src:url(fonts/fraunces-latin-wght-italic.woff2)}
@font-face{font-family:Inter;font-weight:100 900;src:url(fonts/inter-latin-wght-normal.woff2)}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;color:#fff;font-family:Inter,sans-serif;
  background:radial-gradient(52% 78% at 80% 58%,rgba(122,78,147,.62),rgba(43,27,51,0) 72%),radial-gradient(40% 60% at 6% 100%,rgba(122,78,147,.28),rgba(43,27,51,0) 70%),#2b1b33}
.asas{position:absolute;inset:0}
.sol{position:absolute;right:-64px;top:-78px;width:250px;height:250px;border-radius:50%;border:2px solid rgba(217,164,65,.55);
  background:radial-gradient(closest-side,rgba(217,164,65,.92) 0 38.7%,rgba(217,164,65,.18) 39.5% 67.7%,transparent 68.5%)}
.txt{position:absolute;left:76px;top:66px;width:720px}
.k{display:flex;align-items:center;gap:14px;font-size:16px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#d9c7e3}
.k:before{content:"";width:34px;height:2px;background:#d9a441}
h1{margin-top:26px;font-family:Fraunces,serif;font-weight:400;font-size:78px;line-height:1;letter-spacing:-.025em;font-variation-settings:"opsz" 144,"SOFT" 100}
h1 em{font-weight:300;color:#d9c7e3}
.sub{margin-top:22px;max-width:640px;font-family:Fraunces,serif;font-size:24px;line-height:1.38;color:#ece2f1;font-variation-settings:"opsz" 24,"SOFT" 50}
.pill{margin-top:28px;display:inline-flex;align-items:center;gap:10px;padding:13px 24px 13px 20px;border-radius:999px;background:#d9a441;color:#2b1b33;font-size:19px;font-weight:700;letter-spacing:.01em}
.pill svg{width:20px;height:20px}
.who{position:absolute;left:76px;bottom:52px;display:flex;align-items:center;gap:16px}
.who img{width:62px;height:62px;border-radius:50%;box-shadow:0 0 0 3px #2b1b33,0 0 0 5px rgba(217,164,65,.8)}
.who b{display:block;font-family:Fraunces,serif;font-weight:400;font-size:25px;line-height:1.1;font-variation-settings:"opsz" 72,"SOFT" 100}
.who span{display:block;margin-top:5px;font-size:15px;color:#b592c7;letter-spacing:.02em}
.livro{position:absolute;left:798px;top:74px;width:318px;aspect-ratio:900/1274}
.folha,.capa{position:absolute;inset:0;border-radius:3px 7px 7px 3px;overflow:hidden}
.folha{transform:translate(38px,10px) rotate(5deg);box-shadow:18px 30px 50px -18px rgba(0,0,0,.55);filter:brightness(.92)}
.capa{transform:rotate(-4deg);box-shadow:0 2px 4px rgba(0,0,0,.25),26px 40px 70px -20px rgba(0,0,0,.75)}
.folha img,.capa img{display:block;width:100%;height:100%;object-fit:cover}
.capa:before{content:"";position:absolute;z-index:1;left:0;top:0;bottom:0;width:6%;background:linear-gradient(to right,rgba(0,0,0,.38),rgba(255,255,255,.12) 40%,rgba(0,0,0,.08) 65%,transparent)}
.capa:after{content:"";position:absolute;z-index:1;inset:0;background:linear-gradient(115deg,rgba(255,255,255,0) 35%,rgba(255,255,255,.10) 48%,rgba(255,255,255,0) 62%)}
</style></head><body>
<svg class="asas" viewBox="0 0 1200 630" aria-hidden="true">
  <g opacity=".22" fill="#7a4e93"><ellipse cx="860" cy="470" rx="250" ry="150" transform="rotate(-32 860 470)"/><ellipse cx="1190" cy="470" rx="250" ry="150" transform="rotate(32 1190 470)"/></g>
  <g fill="#d9c7e3"><circle cx="745" cy="150" r="4" opacity=".7"/><circle cx="770" cy="118" r="2.4" opacity=".55"/><circle cx="1150" cy="300" r="3" fill="#d9a441" opacity=".8"/><circle cx="712" cy="560" r="2.6" opacity=".45"/></g>
</svg>
<div class="txt">
  <div class="k">Cartilha gratuita · Distrito Federal</div>
  <h1>Manual para o<br>paciente com <em>lúpus</em></h1>
  <p class="sub">Entender a doença, participar do tratamento, conhecer seus direitos e saber onde buscar ajuda.</p>
  <div class="pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>Baixe grátis em PDF</div>
</div>
<div class="who"><img src="img/paula-avatar.webp" alt=""><div><b>Dra. Paula Cristina Montina</b><span>Médica Reumatologista · CRM-DF 26.523 · RQE 21.843</span></div></div>
<div class="livro"><div class="folha"><img src="img/folha-de-rosto.webp" alt=""></div><div class="capa"><img src="img/capa.webp" alt=""></div></div>
</body></html>`;
const arquivo = join(out, "_og.html");
writeFileSync(arquivo, html);
const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(pathToFileURL(arquivo).href, { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
const faltando = await p.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute("src")));
const fontes = await p.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family + " " + f.style));
if (faltando.length) throw new Error("imagens sem carregar na prévia: " + faltando.join(", "));
if (!fontes.some(f => f.startsWith("Fraunces")) || !fontes.some(f => f.startsWith("Inter"))) throw new Error("fontes sem carregar na prévia: " + fontes.join(", "));
await p.screenshot({ path: join(out, "og-cartilha.png") });
await b.close();
rmSync(arquivo);
