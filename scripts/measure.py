#!/usr/bin/env python3
"""Mede o espaço vazio no pé de cada página do PDF (ignora capa, contracapa e aberturas de capítulo)."""
import pymupdf, sys
d=pymupdf.open(sys.argv[1] if len(sys.argv)>1 else 'dist/cartilha-lupus-df-a4.pdf')
bad=[]; tot=0
for i,p in enumerate(d):
    if i in (0,len(d)-1): continue
    t=p.get_text()
    if 'CAPÍTULO' in t.replace(' ','') and 'C A P Í T U L O' in t: continue
    blocks=[b for b in p.get_text('blocks') if b[4].strip() and b[3]<790]  # ignora rodapé (>790pt)
    if not blocks: continue
    bottom=max(b[3] for b in blocks)
    free=(842-62-bottom)/(842-57-62)  # área útil ≈ 20mm topo, 22mm pé
    tot+=free
    if free>0.30: bad.append((i+1, round(free*100)))
print('páginas com >30% vazio:', bad)
print('média de espaço vazio no pé: %.0f%%' % (100*tot/(len(d)-2)))
