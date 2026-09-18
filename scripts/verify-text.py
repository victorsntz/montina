#!/usr/bin/env python3
"""Confere se todo o texto do PDF original da Dra. Paula está presente no conteúdo diagramado.
Compara sentença a sentença (normalizadas) e lista o que ficou de fora."""
import re, sys, html, glob, unicodedata

ORIG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/-home-user-montina/b2697468-3f64-57cd-a11e-a76124271b9c/scratchpad/cartilha.txt"

def norm(s):
    s = html.unescape(s)
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"[‘’“”\"'“”‘’]", "", s)
    s = re.sub(r"[^\w\s]", " ", s.lower())
    s = re.sub(r"\s+", " ", s).strip()
    return s

# texto original: junta linhas, remove marcadores de página e bullets
orig = open(ORIG, encoding="utf8").read()
orig = re.sub(r"=== PAGE \d+ ===", " ", orig)
orig = re.sub(r"[•●▪]", " ", orig)
orig = re.sub(r"\s+", " ", orig)
sentences = [norm(x) for x in re.split(r"(?<=[.;:!?])\s+", orig)]
sentences = [s for s in sentences if len(s.split()) >= 4]

# conteúdo diagramado: tira tags
body = ""
for f in sorted(glob.glob("content/*.html")):
    t = open(f, encoding="utf8").read()
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    body += " " + t
body_n = norm(body)

missing = []
for s in sentences:
    if s not in body_n:
        # tolera pequenas diferenças: testa 80% das palavras em janelas
        words = s.split()
        if len(words) >= 6:
            head = " ".join(words[:5]); tail = " ".join(words[-4:])
            if head in body_n and tail in body_n:
                continue
        missing.append(s)

print(f"sentenças no original: {len(sentences)} | possivelmente ausentes: {len(missing)}")
for m in missing:
    print(" -", m[:160])
