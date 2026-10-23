#!/usr/bin/env python3
"""Troca o preto de quatro cores (rich black) por 100% K nos PDFs CMYK da gráfica.
O Ghostscript converte o preto RGB (#000) em C72 M67 Y67 K88. No código de barras do ISBN isso é risco:
um registro fora de esquadro borra as barras e o leitor não lê. Aqui todo preenchimento ou traço em
"preto rico" (C, M e Y acima de 60% e K acima de 85%) vira 0 0 0 1. Só o código de barras, o texto dele
e as marcas de corte usam esse preto; as cores da cartilha (ameixa, lilás, terracota) não são tocadas.
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

if __name__ == "__main__":
    for f in sys.argv[1:]:
        n = preto_100k(f)
        print(f"preto 100% K: {n} trocas em {os.path.basename(f)}")
        if n == 0:
            sys.exit(f"ERRO: nenhum preto rico encontrado em {f} (o código de barras deveria estar lá)")
