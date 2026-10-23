#!/usr/bin/env python3
"""Monta landing/dist/: a landing page da cartilha, pronta para subir em qualquer hospedagem.
Uso (depois de `npm run build && npm run pdf`):  /usr/bin/python3 scripts/landing.py
Gera imagens a partir do PDF de leitura, copia fontes, logos, foto e o PDF para download,
expande as ilustrações inline, inclui a versão para ler no celular (ler/) e a imagem de prévia (og-cartilha.jpg)."""
import hashlib, json, os, re, shutil, subprocess, sys
from urllib.parse import quote
import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ISBN = "978-65-02-46030-6"
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
    # versão leve para a grade e o mockup; a grande fica para o visor
    sp.resize((800, round(sp.height * 800 / sp.width)), Image.LANCZOS).save(os.path.join(OUT, "img", nome.replace(".webp", "-800.webp")), "WEBP", quality=80, method=6)
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
# PDF para download, com autoria e assunto nos metadados (aparecem no leitor de PDF e no Google Drive)
pdf = pymupdf.open(PDF)
pdf.set_metadata({**pdf.metadata, "title": "Manual para o paciente com lúpus do Distrito Federal", "author": "Dra. Paula Cristina Montina",
                  "subject": f"Cartilha para pacientes com lúpus no Distrito Federal · ISBN {ISBN}", "keywords": "lúpus, reumatologia, SUS, Distrito Federal, cartilha",
                  "creator": "Fortunato Estúdio", "producer": ""})
pdf.set_pagemode("UseOutlines")
pdf.save(os.path.join(OUT, PDF_NOME), garbage=0, deflate=False)
PDF_PAGINAS = len(pdf); pdf.close()
PDF_MB = f"{os.path.getsize(os.path.join(OUT, PDF_NOME)) / 1e6:.1f} MB".replace(".", ",")  # MB decimal, como o celular mostra
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
html = html.replace("{{PDF_PAGINAS}}", str(PDF_PAGINAS)).replace("{{PDF_MB}}", PDF_MB)
# endereço público (SITE_URL=https://montinamedicina.com/cartilha/): prévia do link com imagem, canônico e compartilhar com endereço completo
SITE = os.environ.get("SITE_URL", "").strip()
# dados estruturados (schema.org Book): o Google entende que a página é de um livro, com ISBN, autora e formato
livro = {"@context": "https://schema.org", "@type": "Book", "name": "Manual para o paciente com lúpus do Distrito Federal",
         "author": {"@type": "Person", "name": "Paula Cristina Montina", "honorificPrefix": "Dra.", "jobTitle": "Médica Reumatologista"},
         "isbn": ISBN.replace("-", ""), "bookEdition": "1", "numberOfPages": PDF_PAGINAS,
         "inLanguage": "pt-BR", "datePublished": "2026", "isAccessibleForFree": True, "locationCreated": "Brasília, DF",
         "about": "Lúpus eritematoso sistêmico",
         "description": "Cartilha gratuita para pacientes com lúpus, familiares e cuidadores do Distrito Federal: a doença, o tratamento, a vacinação, a gravidez, o acesso ao SUS e à Farmácia de Alto Custo, os direitos do paciente e onde buscar ajuda.",
         "contributor": {"@type": "Organization", "name": "Fortunato Estúdio", "url": "https://fortunatoestudio.com"}}
if SITE:
    livro.update({"url": SITE.rstrip("/") + "/", "image": SITE.rstrip("/") + "/og-cartilha.jpg"})
html = html.replace("<!--dados-estruturados-->", '<script type="application/ld+json">' + json.dumps(livro, ensure_ascii=False) + "</script>")
if SITE:
    SITE = SITE.rstrip("/") + "/"
    html = html.replace('<meta property="og:image" content="og-cartilha.jpg">', f'<meta property="og:url" content="{SITE}">\n<meta property="og:image" content="{SITE}og-cartilha.jpg">\n<link rel="canonical" href="{SITE}">')
    # o botão do WhatsApp já leva o endereço, mesmo sem JavaScript
    html = html.replace("Paula%20Cristina%20Montina\"", "Paula%20Cristina%20Montina%3A%20" + quote(SITE, safe="") + "\"", 1)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)

# ---- versão para ler no celular (a versão web da cartilha) ----
ler = os.path.join(OUT, "ler")
web = open(r("dist", "index.html"), encoding="utf-8").read()
web = web.replace('href="cartilha-lupus-df-a4.pdf"', f'href="../{PDF_NOME}" download')
web = web.replace('<a href="#sumario">', '<a href="../index.html">← Voltar</a><a href="#sumario">', 1)
web = web.replace("</title>", '</title>\n<link rel="icon" href="../favicon.svg" type="image/svg+xml">', 1)
if SITE:  # prévia e endereço canônico também para o link "Ler online" compartilhado
    web = web.replace("</title>", f"""</title>
<meta property="og:type" content="book">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="Manual para o paciente com lúpus do Distrito Federal">
<meta property="og:description" content="Leia online a cartilha gratuita da Dra. Paula Cristina Montina para pacientes com lúpus do DF.">
<meta property="og:url" content="{SITE}ler/index.html">
<meta property="og:image" content="{SITE}og-cartilha.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{SITE}ler/index.html">""", 1)
web = re.sub(r"<img (?![^>]*loading=)", '<img loading="lazy" decoding="async" ', web)
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

# ---- raiz do domínio (landing/raiz): quem abre só o domínio cai na cartilha ----
# A cartilha mora em /cartilha/, para o link compartilhado continuar valendo quando o site da Montina Medicina ocupar a raiz.
# scripts/publicar.sh junta landing/raiz (raiz) e landing/dist (cartilha/) no branch gh-pages, que a Hostinger puxa pelo Git.
if SITE.endswith("/cartilha/"):
    BASE = SITE[: -len("cartilha/")]
    RAIZ = r("landing", "raiz")
    shutil.rmtree(RAIZ, ignore_errors=True); os.makedirs(RAIZ)
    og = f"{SITE}og-cartilha.jpg?v={versao}"
    open(os.path.join(RAIZ, "index.html"), "w", encoding="utf-8").write(f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Manual para o paciente com lúpus do DF · Cartilha gratuita</title>
<meta name="description" content="Cartilha gratuita da Dra. Paula Cristina Montina para pacientes com lúpus do Distrito Federal.">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="Manual para o paciente com lúpus do Distrito Federal">
<meta property="og:description" content="Cartilha gratuita para entender a doença, participar do tratamento, conhecer seus direitos e saber onde buscar ajuda no DF.">
<meta property="og:url" content="{SITE}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2b1b33">
<link rel="canonical" href="{SITE}">
<link rel="icon" href="cartilha/favicon.svg" type="image/svg+xml">
<meta http-equiv="refresh" content="0; url=cartilha/">
<script>location.replace("cartilha/" + location.search + location.hash)</script>
<style>body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#2b1b33;color:#ece2f1;font:16px system-ui,sans-serif}}a{{color:#fff}}</style>
</head>
<body><p><a href="cartilha/">Abrir a cartilha Manual para o paciente com lúpus</a></p></body>
</html>
""")
    open(os.path.join(RAIZ, ".htaccess"), "w").write(f"""# Hostinger (Apache/LiteSpeed). A raiz leva para a cartilha com 302 (temporário):
# quando o site da Montina Medicina ocupar a raiz, é só apagar a linha abaixo.
RedirectMatch 302 ^/$ /cartilha/

AddDefaultCharset UTF-8
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
""")
    open(os.path.join(RAIZ, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n")
    open(os.path.join(RAIZ, "sitemap.xml"), "w").write(f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{SITE}</loc><priority>1.0</priority></url>
  <url><loc>{SITE}ler/index.html</loc><priority>0.8</priority></url>
</urlset>
""")
    open(os.path.join(RAIZ, ".nojekyll"), "w").close()
    # favicon.ico na raiz (navegadores e o Google pedem /favicon.ico mesmo com o SVG declarado)
    marca = pymupdf.open(r("src", "illustrations", "mark-borboleta.svg"))
    pm = marca[0].get_pixmap(matrix=pymupdf.Matrix(256 / marca[0].rect.width, 256 / marca[0].rect.width), alpha=True)
    ic = Image.frombytes("RGBA", (pm.width, pm.height), pm.samples)
    lado = max(ic.size); quad = Image.new("RGBA", (lado, lado), (0, 0, 0, 0)); quad.paste(ic, ((lado - ic.width) // 2, (lado - ic.height) // 2))
    quad.save(os.path.join(RAIZ, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print(f"raiz ok: landing/raiz ({BASE} → {SITE})")

total = sum(os.path.getsize(os.path.join(p, f)) for p, _, fs in os.walk(OUT) for f in fs)
n = sum(len(fs) for _, _, fs in os.walk(OUT))
velha = FINAL + ".velha"
shutil.rmtree(velha, ignore_errors=True)
if os.path.exists(FINAL): os.rename(FINAL, velha)
os.rename(OUT, FINAL)
shutil.rmtree(velha, ignore_errors=True)
print(f"landing ok: landing/dist ({total / 1048576:.1f} MB, {n} arquivos)")
