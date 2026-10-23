#!/usr/bin/env python3
"""Arquivos de gráfica do livreto (grampeado, A4 fechado, total múltiplo de 4).
Entrada: dist/cartilha-lupus-df-a4-grafica-sangria3mm.pdf (gerado por `node scripts/pdf.mjs print-grafica.html …`).
Saídas em dist/:
  cartilha-lupus-df-livreto-curvas-cmyk.pdf      todas as páginas em sequência, CMYK, texto em curvas, sangria 3 mm e marcas
  cartilha-lupus-df-livreto-capa-4pp-curvas.pdf  1ª, 2ª, 3ª e 4ª capa (para imprimir em papel mais encorpado)
  cartilha-lupus-df-livreto-miolo-curvas.pdf     miolo (da folha de rosto até a página antes da 3ª capa)
Confere: total e miolo múltiplos de 4; nenhuma fonte no arquivo final (tudo em curvas); código de barras em 100% K.
Rode com /usr/bin/python3 (onde o pymupdf está instalado)."""
import subprocess, sys, pymupdf
D = "dist/"
src = D + "cartilha-lupus-df-a4-grafica-sangria3mm.pdf"
full = D + "cartilha-lupus-df-livreto-curvas-cmyk.pdf"
subprocess.run(["gs", "-q", "-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/prepress",
                "-sColorConversionStrategy=CMYK", "-dProcessColorModel=/DeviceCMYK", "-dNoOutputFonts",
                "-dCompatibilityLevel=1.4", f"-sOutputFile={full}", src], check=True)
sys.path.insert(0, "scripts"); from preto100k import preto_100k
if not preto_100k(full): sys.exit("ERRO: o código de barras do ISBN não saiu em preto rico para trocar por 100% K")  # barras só em K
d = pymupdf.open(full)
n = len(d)
fonts = sorted({f[3] for p in d for f in p.get_fonts()})
erros = []
if n % 4: erros.append(f"total de {n} páginas não é múltiplo de 4")
if fonts: erros.append(f"ainda há fontes no arquivo: {fonts[:5]}")
capa = pymupdf.open(); [capa.insert_pdf(d, from_page=i, to_page=i) for i in (0, 1, n - 2, n - 1)]
capa.save(D + "cartilha-lupus-df-livreto-capa-4pp-curvas.pdf", garbage=3, deflate=True)
miolo = pymupdf.open(); miolo.insert_pdf(d, from_page=2, to_page=n - 3)
if len(miolo) % 4: erros.append(f"miolo com {len(miolo)} páginas não é múltiplo de 4")
miolo.save(D + "cartilha-lupus-df-livreto-miolo-curvas.pdf", garbage=3, deflate=True)
w, h = d[0].rect.width / 72 * 25.4, d[0].rect.height / 72 * 25.4
print(f"livreto ok: {n} pp ({n // 4} folhas A3 dobradas) · capa 4 pp + miolo {len(miolo)} pp · {w:.0f} × {h:.0f} mm com sangria · fontes no arquivo: {len(fonts)}")
if erros:
    print("ERRO: " + "; ".join(erros)); sys.exit(1)
