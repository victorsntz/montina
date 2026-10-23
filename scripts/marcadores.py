#!/usr/bin/env python3
"""Arruma os marcadores (sumário lateral) do PDF de leitura.
O Chromium tira o texto dos marcadores da página já diagramada: junta palavras onde o título quebrou de linha
("algumaspessoas") e herda as maiúsculas do CSS. Aqui cada marcador volta a ter o texto do título no HTML,
e ficam só capítulos e seções (h1 e h2), para a navegação não virar uma lista de 130 itens.
Uso (depois de `node scripts/pdf.mjs`):  /usr/bin/python3 scripts/marcadores.py"""
import html, os, re
from collections import defaultdict, deque
import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "dist", "cartilha-lupus-df-a4.pdf")
fonte = open(os.path.join(ROOT, "dist", "print.html"), encoding="utf-8").read()

chave = lambda t: re.sub(r"\s", "", t).casefold()
titulos = defaultdict(deque)  # títulos repetidos (ex.: "Por onde começar?" no cap. 4 e no cap. 6) casam pela ordem
for tag, corpo in re.findall(r"<(h[1-6])\b[^>]*>(.*?)</\1>", fonte, flags=re.S):
    texto = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", corpo)).replace("\u00a0", " ").split())
    titulos[chave(texto)].append((tag, texto))

doc = pymupdf.open(PDF)
novos, sem_par = [], 0
for _, titulo, pagina in doc.get_toc():
    fila = titulos.get(chave(titulo))
    if not fila: sem_par += 1; continue
    tag, texto = fila.popleft()
    if tag not in ("h1", "h2"): continue
    if not novos: texto = "Capa"
    elif pagina == 3 and tag == "h1": texto = "Folha de rosto"
    elif texto == "Transformar informação em cuidado": texto = "Prefácio"  # como no sumário
    novos.append([1 if tag == "h1" else 2, texto, pagina])
if not novos or sem_par > 5:
    raise SystemExit(f"marcadores: {sem_par} títulos do PDF sem par no HTML; confira antes de trocar")
# ficha técnica (com o ISBN) também ganha marcador, logo depois da folha de rosto
ficha = next((i + 1 for i, p in enumerate(doc) if "Dados Internacionais de Catalogação" in p.get_text()), None)
if ficha:
    pos = next(i for i, n in enumerate(novos) if n[2] > ficha)
    novos.insert(pos, [1, "Ficha técnica", ficha])
doc.set_toc(novos)
doc.set_pagemode("UseOutlines")  # o painel de marcadores abre junto com o PDF
doc.set_metadata({**doc.metadata, "title": "Manual para o paciente com lúpus do Distrito Federal", "author": "Dra. Paula Cristina Montina",
                  "subject": "Cartilha para pacientes com lúpus no Distrito Federal · ISBN 978-65-02-46030-6",
                  "keywords": "lúpus, reumatologia, SUS, Distrito Federal, cartilha", "creator": "Fortunato Estúdio", "producer": ""})
doc.saveIncr()
print(f"marcadores ok: {len(novos)} ({sum(1 for n in novos if n[0] == 1)} capítulos e partes)")
