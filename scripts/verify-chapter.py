#!/usr/bin/env python3
"""Confere, frase a frase, se todo o texto de um recorte (markdown do DOCX v3) está no HTML do capítulo.
Uso: python3 scripts/verify-chapter.py content/NN-xxx.html recorte.md
Sai com código 1 se faltar alguma frase. Ignora emojis, pontuação e negrito."""
import re, sys, html, unicodedata
def norm(s):
    s=html.unescape(s); s=unicodedata.normalize('NFKC',s).lower()
    s=re.sub(r'[*_\\]','',s); s=re.sub(r'[^\w\s]',' ',s); s=re.sub(r'\s+',' ',s).strip(); return s
def sentences(text, strip_html=False):
    if strip_html:
        text=re.sub(r'<!--.*?-->',' ',text,flags=re.S); text=re.sub(r'</(h1|h2|h3|h4|p|li|dd|dt|div|td|th)>','\n',text); text=re.sub(r'<[^>]+>',' ',text)
    out=[]
    for para in text.split('\n'):
        para=re.sub(r'^\s*(#+|-|\d+\\?\.)\s*','',para)
        for s in re.split(r'(?<=[.;:!?])\s+', para):
            n=norm(s)
            if len(n.split())>=3: out.append(n)
    return out
html_path, slice_path = sys.argv[1], sys.argv[2]
h=' '.join(sentences(open(html_path,encoding='utf8').read(), strip_html=True))
missing=[]
for s in sentences(open(slice_path,encoding='utf8').read()):
    if s in h: continue
    w=s.split()
    if len(w)>=6 and ' '.join(w[:4]) in h and ' '.join(w[-3:]) in h: continue
    missing.append(s)
print(f'frases do recorte: {len(sentences(open(slice_path,encoding="utf8").read()))} | ausentes no HTML: {len(missing)}')
for m in missing: print(' -', m[:170])
sys.exit(1 if missing else 0)
