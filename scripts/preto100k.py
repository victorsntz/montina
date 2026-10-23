#!/usr/bin/env python3
"""Troca o preto de quatro cores (rich black) por 100% K nos PDFs CMYK da gráfica.
O Ghostscript converte o preto RGB (#000) em C72 M67 Y67 K88. No código de barras do ISBN isso é risco:
um registro fora de esquadro borra as barras e o leitor não lê. Aqui todo preenchimento ou traço em
"preto rico" (C, M e Y acima de 60% e K acima de 85%) vira 0 0 0 1. Na versão de gráfica o texto corrido, os
negritos, os QR Codes e o código de barras saem em #000 (build.mjs) justamente para cair aqui; as cores da
cartilha (ameixa, lilás, terracota) não são tocadas.
Também põe as marcas de corte (fora da sangria), TrimBox/BleedBox e os metadados (função acabamento).
Uso:  /usr/bin/python3 scripts/preto100k.py arquivo.pdf [outro.pdf ...]"""
import re, sys, os
import pymupdf

RICO = re.compile(rb"(?<![\d.])(0?\.\d+|1) (0?\.\d+|1) (0?\.\d+|1) (0?\.\d+|1) ([kK])\b")

def preto_100k(caminho):
    doc = pymupdf.open(caminho)
    trocas = 0
    for x in range(1, doc.xref_length()):
        if not doc.xref_is_stream(x) or doc.xref_get_key(x, "Subtype")[1] == "/Image":
            continue
        try:
            s = doc.xref_stream(x)
        except Exception:
            continue
        def troca(m):
            nonlocal trocas
            c, mg, y, k = (float(v) for v in m.groups()[:4])
            if c > .6 and mg > .6 and y > .6 and k > .85:
                trocas += 1
                return b"0 0 0 1 " + m.group(5)
            return m.group(0)
        novo = RICO.sub(troca, s)
        if novo != s:
            doc.update_stream(x, novo)
    tmp = caminho + ".tmp"
    doc.save(tmp, garbage=3, deflate=True)
    doc.close()
    os.replace(tmp, caminho)
    return trocas

# ---- marcas de corte e caixas de refile ----
# O PDF do Chromium tem a página A4 com 3 mm de sangria (612 × 858,96 pt). O refile medido na diagramação fica
# 8,25 pt da borda esquerda e do topo (o Chromium arredonda a largura para 612 pt). Cada página é colocada numa
# folha maior, com 7 mm de margem para as marcas, que ficam FORA da sangria (início 0,3 pt além dela, 5 mm de
# comprimento, 0,25 pt, cor de registro). TrimBox e BleedBox dizem o formato final ao software da gráfica.
MM = 72 / 25.4
REFILE = pymupdf.Rect(8.25, 8.25, 8.25 + 210 * MM, 8.25 + 297 * MM)
FOLGA, COMPRIMENTO = 7 * MM, 5 * MM

def marcas_e_caixas(doc):
    novo = pymupdf.open()
    for i, src in enumerate(doc):
        w, h = src.rect.width, src.rect.height
        pg = novo.new_page(width=w + 2 * FOLGA, height=h + 2 * FOLGA)
        pg.show_pdf_page(pymupdf.Rect(FOLGA, FOLGA, FOLGA + w, FOLGA + h), doc, i)
        t = REFILE + (FOLGA, FOLGA, FOLGA, FOLGA)
        sang = pymupdf.Rect(FOLGA, FOLGA, FOLGA + w, FOLGA + h)
        e, c, d, b = t.x0 - sang.x0 + .3, t.y0 - sang.y0 + .3, sang.x1 - t.x1 + .3, sang.y1 - t.y1 + .3  # distância até sair da sangria
        sh = pg.new_shape()
        for x, lado in ((t.x0, -1), (t.x1, 1)):
            off = e if lado < 0 else d
            for y in (t.y0, t.y1):  # traço horizontal na altura do refile
                sh.draw_line((x + lado * off, y), (x + lado * (off + COMPRIMENTO), y))
        for y, lado in ((t.y0, -1), (t.y1, 1)):
            off = c if lado < 0 else b
            for x in (t.x0, t.x1):  # traço vertical na linha do refile
                sh.draw_line((x, y + lado * off), (x, y + lado * (off + COMPRIMENTO)))
        sh.finish(color=(1, 1, 1, 1), width=0.25)
        sh.commit()
        pg.set_bleedbox(sang)
        pg.set_trimbox(t)
    return novo

META = {"title": "Manual para o paciente com lúpus do Distrito Federal", "author": "Dra. Paula Cristina Montina",
        "subject": "Arquivo de gráfica · ISBN 978-65-02-46030-6", "creator": "Fortunato Estúdio", "producer": ""}

def acabamento(caminho):
    """Preto 100% K, marcas de corte fora da sangria, TrimBox/BleedBox e metadados; grava no mesmo arquivo."""
    n = preto_100k(caminho)
    doc = pymupdf.open(caminho)
    novo = marcas_e_caixas(doc)
    novo.set_metadata(META)
    tmp = caminho + ".tmp"
    novo.save(tmp, garbage=3, deflate=True)
    novo.close(); doc.close()
    os.replace(tmp, caminho)
    return n

if __name__ == "__main__":
    for f in sys.argv[1:]:
        n = acabamento(f)
        print(f"preto 100% K: {n} trocas · marcas de corte e TrimBox em {os.path.basename(f)}")
        if n == 0:
            sys.exit(f"ERRO: nenhum preto rico encontrado em {f} (o código de barras deveria estar lá)")
