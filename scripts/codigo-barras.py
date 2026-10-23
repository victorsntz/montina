#!/usr/bin/env python3
"""Desenha em vetor o código de barras EAN-13 do ISBN da cartilha (4ª capa).
O número vem da CBL; o desenho segue o padrão EAN-13 (módulo de 0,33 mm a 100%, zonas de silêncio de 11 e 7 módulos).
Uso:  /usr/bin/python3 scripts/codigo-barras.py   →  src/illustrations/isbn-codigo-barras.svg"""
import os

ISBN = "978-65-02-46030-6"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "illustrations", "isbn-codigo-barras.svg")

d = ISBN.replace("-", "")
assert len(d) == 13 and d.isdigit()
assert (10 - sum(int(c) * (3 if i % 2 else 1) for i, c in enumerate(d[:12])) % 10) % 10 == int(d[12]), "dígito verificador não confere"

L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"]
R = ["".join("1" if b == "0" else "0" for b in c) for c in L]
G = [c[::-1] for c in R]
PARIDADE = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"][int(d[0])]

# módulos e se cada um é barra de guarda (desce mais)
mods = [("101", True)]
mods += [((L if p == "L" else G)[int(c)], False) for p, c in zip(PARIDADE, d[1:7])]
mods += [("01010", True)]
mods += [(R[int(c)], False) for c in d[7:13]]
mods += [("101", True)]

PAD, QZ_E, QZ_D = 4, 11, 7                 # respiro do selo e zonas de silêncio (em módulos)
X0 = PAD + QZ_E                            # início das barras
W = X0 + 95 + QZ_D + PAD                   # 121 módulos
TOPO, ALT, GUARDA = 15, 62, 5              # barras normais e prolongamento das guardas
H = TOPO + ALT + GUARDA + 6 + PAD - 3      # 89 módulos

rects, x = [], X0
for padrao, guarda in mods:
    for bit in padrao:
        if bit == "1":
            h = ALT + (GUARDA if guarda else 0)
            if rects and rects[-1][0] + rects[-1][1] == x and rects[-1][2] == h:
                rects[-1][1] += 1              # junta módulos vizinhos numa barra só
            else:
                rects.append([x, 1, h])
        x += 1
assert x == X0 + 95

fonte = 'font-family="Inter, Helvetica, Arial, sans-serif"'
txt = [f'<text x="{X0 - 6}" y="{TOPO + ALT + GUARDA + 3}" font-size="9" text-anchor="middle" {fonte}>{d[0]}</text>']
for i, c in enumerate(d[1:7]):
    txt.append(f'<text x="{X0 + 3 + 7 * i + 3.5}" y="{TOPO + ALT + GUARDA + 3}" font-size="9" text-anchor="middle" {fonte}>{c}</text>')
for i, c in enumerate(d[7:13]):
    txt.append(f'<text x="{X0 + 50 + 7 * i + 3.5}" y="{TOPO + ALT + GUARDA + 3}" font-size="9" text-anchor="middle" {fonte}>{c}</text>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Código de barras do ISBN {ISBN}">
<rect width="{W}" height="{H}" rx="3" fill="#fff"/>
<text x="{X0 + 47.5}" y="{TOPO - 4}" font-size="7.6" font-weight="500" letter-spacing=".4" text-anchor="middle" {fonte}>ISBN {ISBN}</text>
<g fill="#000">{"".join(f'<rect x="{a}" y="{TOPO}" width="{w}" height="{h}"/>' for a, w, h in rects)}</g>
<g fill="#000">{"".join(txt)}</g>
</svg>
'''
open(OUT, "w", encoding="utf-8").write(svg)
print(f"código de barras ok: {d} → {os.path.relpath(OUT, ROOT)} ({W} × {H} módulos = {W * 0.33:.1f} × {H * 0.33:.1f} mm a 100%)")
