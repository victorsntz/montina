#!/usr/bin/env python3
"""Arruma os marcadores (sumário lateral) do PDF de leitura.
O Chromium tira o texto dos marcadores da página já diagramada: junta palavras onde o título quebrou de linha
("algumaspessoas") e herda as maiúsculas do CSS. Aqui cada marcador volta a ter o texto do título no HTML,
e ficam só capítulos e seções (h1 e h2), para a navegação não virar uma lista de 130 itens.
Uso (depois de `node scripts/pdf.mjs`):  /usr/bin/python3 scripts/marcadores.py"""
import html, os, re
import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "dist", "cartilha-lupus-df-a4.pdf")
fonte = open(os.path.join(ROOT, "dist", "print.html"), encoding="utf-8").read()

chave = lambda t: re.sub(r"\s", "", t).casefold()
titulos = {}
for tag, corpo in re.findall(r"<(h[1-6])\b[^>]*>(.*?)</\1>", fonte, flags=re.S):
    texto = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", corpo)).replace(" ", " ").split())
    titulos.setdefault(chave(texto), (tag, texto))

doc = pymupdf.open(PDF)
novos, sem_par = [], 0
for _, titulo, pagina in doc.get_toc():
    achado = titulos.get(chave(titulo))
    if not achado: sem_par += 1; continue
    tag, texto = achado
    if tag not in ("h1", "h2"): continue
    if not novos: texto = "Capa"
    elif pagina == 3 and tag == "h1": texto = "Folha de rosto"
    novos.append([1 if tag == "h1" else 2, texto, pagina])
if not novos or sem_par > 5:
    raise SystemExit(f"marcadores: {sem_par} títulos do PDF sem par no HTML; confira antes de trocar")
doc.set_toc(novos)
doc.saveIncr()
print(f"marcadores ok: {len(novos)} ({sum(1 for n in novos if n[0] == 1)} capítulos e partes)")
