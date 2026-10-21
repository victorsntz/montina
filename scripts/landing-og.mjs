// Imagem de prévia (1200 × 630) para WhatsApp e redes, a partir da capa já renderizada em landing/dist/img/capa.webp
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const out = process.argv[2];
const exe = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/usr/bin/chromium"].filter(Boolean).find(p => existsSync(p));
const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
const base = pathToFileURL(out).href + "/";
await p.setContent(`<!doctype html><html><head><base href="${base}"><style>
@font-face{font-family:Fraunces;src:url(fonts/fraunces-latin-wght-normal.woff2)}
@font-face{font-family:Fraunces;font-style:italic;src:url(fonts/fraunces-latin-wght-italic.woff2)}
@font-face{font-family:Inter;src:url(fonts/inter-latin-wght-normal.woff2)}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:radial-gradient(60% 80% at 75% 55%,rgba(122,78,147,.6),rgba(43,27,51,0) 70%),#2b1b33;color:#fff;font-family:Inter;position:relative}
.sun{position:absolute;right:-70px;top:-90px;width:300px;height:300px}
.sun i{position:absolute;inset:0;border-radius:50%}
.sun i:nth-child(1){border:2px solid rgba(217,164,65,.5)}.sun i:nth-child(2){inset:18%;background:rgba(217,164,65,.16)}.sun i:nth-child(3){inset:34%;background:#d9a441}
.txt{position:absolute;left:72px;top:96px;width:620px}
.k{font-size:17px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#d9c7e3;margin-bottom:22px}
h1{font-family:Fraunces;font-weight:400;font-size:74px;line-height:1.02;letter-spacing:-.02em;font-variation-settings:"opsz" 144,"SOFT" 100}
h1 em{font-weight:300;color:#d9c7e3}
p{margin-top:22px;font-family:Fraunces;font-size:25px;line-height:1.4;color:#ece2f1}
.who{margin-top:30px;font-size:19px;color:#b592c7}.who b{color:#fff;font-weight:600}
.book{position:absolute;right:120px;top:70px;width:340px;transform:perspective(1600px) rotateY(-22deg) rotateX(4deg);box-shadow:30px 40px 70px -20px rgba(0,0,0,.7);border-radius:2px 5px 5px 2px;overflow:hidden}
.book img{display:block;width:100%}
.book:before{content:"";position:absolute;left:0;top:0;bottom:0;width:7%;background:linear-gradient(to right,rgba(0,0,0,.42),rgba(255,255,255,.14) 38%,rgba(0,0,0,.1) 62%,transparent)}
</style></head><body><div class="sun"><i></i><i></i><i></i></div>
<div class="txt"><div class="k">Cartilha gratuita · Distrito Federal</div><h1>Manual para o paciente com <em>lúpus</em></h1>
<p>Entender a doença, participar do tratamento, conhecer seus direitos e saber onde buscar ajuda.</p>
<div class="who">Dra. Paula Cristina Montina · <b>médica reumatologista</b></div></div>
<div class="book"><img src="img/capa.webp"></div></body></html>`, { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: join(out, "og-cartilha.png") });
await b.close();
