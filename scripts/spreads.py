#!/usr/bin/env python3
"""Visualização do livreto em páginas duplas (como o leitor vê aberto).
Uso: /usr/bin/python3 scripts/spreads.py [entrada.pdf] [saida.pdf]
A capa fica sozinha à direita, depois os pares 2-3, 4-5, … e a contracapa sozinha à esquerda."""
import pymupdf, sys
src = sys.argv[1] if len(sys.argv) > 1 else "dist/cartilha-lupus-df-a4.pdf"
out = sys.argv[2] if len(sys.argv) > 2 else "dist/cartilha-lupus-df-livreto-paginas-duplas.pdf"
d = pymupdf.open(src)
n = len(d)
if n % 4: print(f"ATENÇÃO: {n} páginas não é múltiplo de 4 (livreto grampeado precisa de múltiplo de 4)")
w, h = d[0].rect.width, d[0].rect.height
o = pymupdf.open()
spreads = [(None, 0)] + [(i, i + 1) for i in range(1, n - 1, 2)] + [(n - 1, None)]
for left, right in spreads:
    pg = o.new_page(width=2 * w, height=h)
    pg.draw_rect(pg.rect, color=None, fill=(0.85, 0.83, 0.86))
    if left is not None: pg.show_pdf_page(pymupdf.Rect(0, 0, w, h), d, left)
    if right is not None: pg.show_pdf_page(pymupdf.Rect(w, 0, 2 * w, h), d, right)
    pg.draw_line((w, 0), (w, h), color=(0.6, 0.6, 0.6), width=0.4)
o.save(out, garbage=3, deflate=True)
print(f"páginas duplas ok: {len(spreads)} lâminas → {out}")
