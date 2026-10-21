#!/usr/bin/env python3
"""Monta landing/dist/: a landing page da cartilha, pronta para subir em qualquer hospedagem.
Uso (depois de `npm run build && npm run pdf`):  /usr/bin/python3 scripts/landing.py
Gera imagens a partir do PDF de leitura, copia fontes, logos, foto e o PDF para download,
expande as ilustrações inline, inclui a versão para ler no celular (ler/) e a imagem de prévia (og-cartilha.jpg)."""
import hashlib, os, re, shutil, subprocess, sys
import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, "landing", "src"), os.path.join(ROOT, "landing", "dist")
PDF = os.path.join(ROOT, "dist", "cartilha-lupus-df-a4.pdf")
PDF_NOME = "Manual-para-o-paciente-com-lupus-DF.pdf"
r = lambda *p: os.path.join(ROOT, *p)

FINAL = OUT
OUT = FINAL + ".novo"  # monta ao lado e troca no fim, para a pasta publicada nunca ficar pela metade
shutil.rmtree(OUT, ignore_errors=True)
for d in ("img", "fonts", "ler"): os.makedirs(os.path.join(OUT, d), exist_ok=True)

# ---- imagens a partir do PDF de leitura ----
doc = pymupdf.open(PDF)
def achar(*trechos, depois=6):
    for i in range(depois, len(doc)):
        t = " ".join(doc[i].get_text().split()).lower()
        if all(x.lower() in t for x in trechos): return i
    sys.exit(f"não achei a página com {trechos}")
def pagina(i, largura):
    pm = doc[i].get_pixmap(matrix=pymupdf.Matrix(largura / doc[i].rect.width, largura / doc[i].rect.width))
    return Image.frombytes("RGB", (pm.width, pm.height), pm.samples)
def dupla(i, nome):
    if i % 2 == 0: i -= 1  # índice 0-based: página par do livreto (esquerda) tem índice ímpar
    a, b = pagina(i, 800), pagina(i + 1, 800)
    sp = Image.new("RGB", (a.width + b.width, a.height), "white"); sp.paste(a, (0, 0)); sp.paste(b, (a.width, 0))
    sp.save(os.path.join(OUT, "img", nome), "WEBP", quality=82, method=6)
pagina(0, 900).save(os.path.join(OUT, "img", "capa.webp"), "WEBP", quality=88, method=6)
pagina(achar("informação para orientar", depois=1), 900).save(os.path.join(OUT, "img", "folha-de-rosto.webp"), "WEBP", quality=86, method=6)
dupla(achar("entendendo o lúpus", "o lúpus eritematoso sistêmico"), "miolo-capitulo-1.webp")
dupla(achar("o tratamento vai além", "medicamentos são importantes"), "miolo-capitulo-3.webp")
dupla(achar("ceaf digital", "aponte a câmera"), "miolo-farmacia.webp")

# ---- foto da autora (retrato 4:5 e avatar redondo) ----
foto = Image.open(r("assets", "photos", "paula.jpg")).convert("RGB")
w, h = foto.size
alt = int(w * 5 / 4); retrato = foto.crop((0, 0, w, min(h, alt))).resize((800, 1000), Image.LANCZOS)
retrato.save(os.path.join(OUT, "img", "paula.webp"), "WEBP", quality=84, method=6)
lado = int(w * 0.45); cx, cy = int(w * 0.512), int(h * 0.28)
foto.crop((cx - lado // 2, cy - lado // 2, cx + lado // 2, cy + lado // 2)).resize((160, 160), Image.LANCZOS) \
    .save(os.path.join(OUT, "img", "paula-avatar.webp"), "WEBP", quality=85, method=6)

# ---- logos ----
def logo_png(src, nome, altura):
    im = Image.open(src).convert("RGBA"); im = im.crop(im.getbbox())
    im.resize((int(im.width * altura / im.height), altura), Image.LANCZOS).save(os.path.join(OUT, "img", nome), optimize=True)
logo_png(r("assets", "logos", "anplupus-horizontal.png"), "anplupus.png", 120)
logo_png(r("assets", "logos", "amaviraras.png"), "amaviraras.png", 200)
shutil.copy(r("assets", "logos", "srb.svg"), os.path.join(OUT, "img", "srb.svg"))
shutil.copy(r("assets", "logos", "srb-branco.svg"), os.path.join(OUT, "img", "srb-branco.svg"))
logo_png(r("assets", "logos", "anplupus-horizontal-branco.png"), "anplupus-branco.png", 80)

# ---- fontes, PDF, favicon, css, js ----
for f in ("fraunces-latin-wght-normal.woff2", "fraunces-latin-wght-italic.woff2", "inter-latin-wght-normal.woff2", "stix-two-text-600.woff2"):
    shutil.copy(r("dist", "fonts", f), os.path.join(OUT, "fonts", f))
shutil.copy(PDF, os.path.join(OUT, PDF_NOME))
shutil.copy(r("src", "illustrations", "mark-borboleta.svg"), os.path.join(OUT, "favicon.svg"))
# borboleta clara para voar sobre o fundo escuro do topo
clara = open(r("src", "illustrations", "mark-borboleta.svg"), encoding="utf-8").read().replace("#7a4e93", "#b592c7").replace("#4b2a5e", "#ece2f1")
open(os.path.join(OUT, "img", "borboleta-clara.svg"), "w", encoding="utf-8").write(clara)
for f in ("landing.css", "landing.js"): shutil.copy(os.path.join(SRC, f), os.path.join(OUT, f))
open(os.path.join(OUT, ".nojekyll"), "w").close()  # GitHub Pages: serve os arquivos como estão

# ---- HTML com ilustrações inline ----
def svg(nome):
    t = open(r("src", "illustrations", nome + ".svg"), encoding="utf-8").read()
    return re.sub(r"<\?xml[^>]*>\s*", "", t).strip()
html = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
html = re.sub(r"<!--svg:([\w-]+)-->", lambda m: svg(m.group(1)), html)
# endereço público (ex.: SITE_URL=https://victorsntz.github.io/montina/): prévia do link com imagem e endereço completos
SITE = os.environ.get("SITE_URL", "").strip()
if SITE:
    SITE = SITE.rstrip("/") + "/"
    html = html.replace('<meta property="og:image" content="og-cartilha.jpg">', f'<meta property="og:url" content="{SITE}">\n<meta property="og:image" content="{SITE}og-cartilha.jpg">\n<link rel="canonical" href="{SITE}">')
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)

# ---- versão para ler no celular (a versão web da cartilha) ----
ler = os.path.join(OUT, "ler")
web = open(r("dist", "index.html"), encoding="utf-8").read()
web = web.replace('href="cartilha-lupus-df-a4.pdf"', f'href="../{PDF_NOME}" download')
web = web.replace('<a href="#sumario">', '<a href="../">← Voltar</a><a href="#sumario">', 1)
open(os.path.join(ler, "index.html"), "w", encoding="utf-8").write(web)
shutil.copy(r("dist", "styles.css"), os.path.join(ler, "styles.css"))
shutil.copytree(r("dist", "fonts"), os.path.join(ler, "fonts"))
shutil.copytree(r("dist", "assets"), os.path.join(ler, "assets"))

# ---- imagem de prévia para WhatsApp e redes (1200 × 630) ----
subprocess.run(["node", r("scripts", "landing-og.mjs"), OUT], check=True)
png = os.path.join(OUT, "og-cartilha.png")
Image.open(png).convert("RGB").save(os.path.join(OUT, "og-cartilha.jpg"), "JPEG", quality=88, optimize=True)
os.remove(png)
# o WhatsApp e as redes guardam a prévia em cache; a versão no endereço da imagem força a leitura da nova
versao = hashlib.md5(open(os.path.join(OUT, "og-cartilha.jpg"), "rb").read()).hexdigest()[:8]
pagina = os.path.join(OUT, "index.html")
html = open(pagina, encoding="utf-8").read().replace('og-cartilha.jpg"', f'og-cartilha.jpg?v={versao}"')
open(pagina, "w", encoding="utf-8").write(html)

total = sum(os.path.getsize(os.path.join(p, f)) for p, _, fs in os.walk(OUT) for f in fs)
n = sum(len(fs) for _, _, fs in os.walk(OUT))
velha = FINAL + ".velha"
shutil.rmtree(velha, ignore_errors=True)
if os.path.exists(FINAL): os.rename(FINAL, velha)
os.rename(OUT, FINAL)
shutil.rmtree(velha, ignore_errors=True)
print(f"landing ok: landing/dist ({total / 1048576:.1f} MB, {n} arquivos)")
