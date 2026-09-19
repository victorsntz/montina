#!/usr/bin/env python3
"""Gera as ilustrações vetoriais da cartilha (src/illustrations/*.svg).

Estilo: formas geométricas suaves, sem contorno, paleta reduzida
(ameixa, lilás, terracota, dourado, creme). Tudo em SVG puro para
imprimir nítido em qualquer tamanho (A5, A4, A3)."""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "illustrations"
OUT.mkdir(parents=True, exist_ok=True)

P9 = "#2b1b33"  # ameixa escura
P7 = "#4b2a5e"  # ameixa
P5 = "#7a4e93"  # ameixa média
P3 = "#b592c7"  # lilás forte
L2 = "#d9c7e3"  # lilás
L1 = "#ece2f1"  # lilás claro
L0 = "#f5f0f8"  # lilás quase branco
CR = "#fbf7f1"  # creme
SD = "#efe6d8"  # areia
TC = "#d4674a"  # terracota
TL = "#f0b39f"  # terracota clara
GD = "#d9a441"  # dourado
GL = "#f2d58a"  # dourado claro
WH = "#ffffff"


def svg(vb, body, extra=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" {extra}>{body}</svg>\n'


def write(name, content):
    (OUT / f"{name}.svg").write_text(content, encoding="utf8")


# ---------------------------------------------------------------------
# Elementos reutilizáveis
# ---------------------------------------------------------------------
def blob_bg(cx=100, cy=100):
    """Fundo orgânico das aberturas de capítulo (viewBox 200)."""
    return (
        f'<path d="M{cx-88},{cy-6} C{cx-92},{cy-58} {cx-46},{cy-92} {cx+8},{cy-88} '
        f'C{cx+62},{cy-84} {cx+90},{cy-44} {cx+86},{cy+8} C{cx+82},{cy+60} {cx+40},{cy+92} '
        f'{cx-12},{cy+88} C{cx-64},{cy+84} {cx-84},{cy+46} {cx-88},{cy-6} Z" fill="{L0}"/>'
        f'<circle cx="{cx+52}" cy="{cy-52}" r="22" fill="{L1}"/>'
        f'<circle cx="{cx-66}" cy="{cy+58}" r="9" fill="{L1}"/>'
    )


def butterfly(cx, cy, s=1.0, upper=P5, lower=TC, body=P7, spots=L1, rot=0):
    """Borboleta geométrica (símbolo do lúpus)."""
    return f'''<g transform="translate({cx} {cy}) rotate({rot}) scale({s})">
  <ellipse cx="-30" cy="-16" rx="30" ry="22" transform="rotate(-25 -30 -16)" fill="{upper}"/>
  <ellipse cx="30" cy="-16" rx="30" ry="22" transform="rotate(25 30 -16)" fill="{upper}"/>
  <ellipse cx="-22" cy="20" rx="20" ry="16" transform="rotate(20 -22 20)" fill="{lower}"/>
  <ellipse cx="22" cy="20" rx="20" ry="16" transform="rotate(-20 22 20)" fill="{lower}"/>
  <circle cx="-34" cy="-18" r="7" fill="{spots}" opacity=".9"/>
  <circle cx="34" cy="-18" r="7" fill="{spots}" opacity=".9"/>
  <circle cx="-24" cy="22" r="4" fill="{spots}" opacity=".8"/>
  <circle cx="24" cy="22" r="4" fill="{spots}" opacity=".8"/>
  <rect x="-4" y="-30" width="8" height="60" rx="4" fill="{body}"/>
  <circle cx="0" cy="-32" r="6" fill="{body}"/>
  <path d="M-3,-36 C-8,-46 -16,-48 -20,-50" stroke="{body}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M3,-36 C8,-46 16,-48 20,-50" stroke="{body}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>'''


def person(x, y, s=1.0, color=P5):
    return f'<g transform="translate({x} {y}) scale({s})"><circle cx="0" cy="-7" r="5.5" fill="{color}"/><path d="M-9,12 V8 A9,9 0 0 1 9,8 V12 Z" fill="{color}"/></g>'


# ---------------------------------------------------------------------
# CAPA (viewBox 210 x 297, mesma proporção da página A4)
# ---------------------------------------------------------------------
capa = f'''
<defs>
  <radialGradient id="glow" cx="0.55" cy="0.62" r="0.55">
    <stop offset="0" stop-color="{P5}" stop-opacity=".55"/>
    <stop offset="1" stop-color="{P9}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="210" height="297" fill="{P9}"/>
<rect width="210" height="297" fill="url(#glow)"/>
<!-- arco solar -->
<circle cx="182" cy="52" r="46" fill="none" stroke="{GD}" stroke-width="1.2" opacity=".55"/>
<circle cx="182" cy="52" r="30" fill="{GD}" opacity=".18"/>
<circle cx="182" cy="52" r="16" fill="{GD}" opacity=".9"/>
<!-- pétalas / asas translúcidas ao fundo -->
<g opacity=".28">
  <ellipse cx="57" cy="191" rx="70" ry="44" transform="rotate(-35 57 191)" fill="{P5}"/>
  <ellipse cx="153" cy="191" rx="70" ry="44" transform="rotate(35 153 191)" fill="{P5}"/>
</g>
<g opacity=".16">
  <ellipse cx="50" cy="222" rx="52" ry="30" transform="rotate(25 50 222)" fill="{L2}"/>
  <ellipse cx="160" cy="222" rx="52" ry="30" transform="rotate(-25 160 222)" fill="{L2}"/>
</g>
<!-- borboleta principal -->
{butterfly(105, 188, s=1.15, upper=P3, lower=TC, body=L1, spots=L0)}
<!-- pontos de luz -->
<circle cx="34" cy="128" r="2.2" fill="{L2}" opacity=".8"/>
<circle cx="52" cy="108" r="1.3" fill="{L2}" opacity=".6"/>
<circle cx="196" cy="130" r="1.6" fill="{GD}" opacity=".7"/>

<!-- linha de horizonte sutil -->
<path d="M0,268 C60,258 150,258 210,268" stroke="{P5}" stroke-width=".8" fill="none" opacity=".5"/>
'''
write("capa", svg("0 0 210 297", capa, 'preserveAspectRatio="xMidYMax slice"'))

# borboleta menor para a contracapa
write("capa-verso", svg("0 0 160 130", butterfly(80, 66, s=0.9, upper=P3, lower=TC, body=L1, spots=L0)))

# ---------------------------------------------------------------------
# ABERTURAS DE CAPÍTULO (viewBox 200)
# ---------------------------------------------------------------------
chap = {}

chap["cap-entendendo"] = blob_bg() + butterfly(100, 104, s=1.05) + f'''
<circle cx="150" cy="48" r="3" fill="{GD}"/>
<circle cx="42" cy="150" r="2.4" fill="{GD}"/>
<circle cx="156" cy="152" r="2" fill="{P3}"/>'''

chap["cap-tratamento"] = blob_bg() + f'''
<g transform="rotate(-35 100 100)">
  <rect x="52" y="82" width="96" height="36" rx="18" fill="{CR}" stroke="{P7}" stroke-width="3"/>
  <path d="M100,82 h30 a18,18 0 0 1 0,36 h-30 Z" fill="{P5}"/>
  <line x1="100" y1="82" x2="100" y2="118" stroke="{P7}" stroke-width="3"/>
</g>
<circle cx="150" cy="140" r="15" fill="{TC}"/>
<line x1="139" y1="140" x2="161" y2="140" stroke="{CR}" stroke-width="3" stroke-linecap="round"/>
<circle cx="54" cy="60" r="11" fill="{GD}"/>
<line x1="54" y1="52" x2="54" y2="68" stroke="{CR}" stroke-width="2.6" stroke-linecap="round"/>
<path d="M40,150 C42,132 56,124 72,126 C70,144 58,154 40,150 Z" fill="{P3}"/>
<path d="M44,148 C52,140 60,134 68,128" stroke="{L0}" stroke-width="1.6" fill="none" stroke-linecap="round"/>'''

chap["cap-habitos"] = blob_bg() + f'''
<circle cx="132" cy="62" r="26" fill="{GD}"/>
<g stroke="{GD}" stroke-width="5" stroke-linecap="round">
  <line x1="132" y1="20" x2="132" y2="28"/><line x1="162" y1="32" x2="156" y2="38"/>
  <line x1="174" y1="62" x2="166" y2="62"/><line x1="162" y1="92" x2="156" y2="86"/>
  <line x1="102" y1="32" x2="108" y2="38"/><line x1="90" y1="62" x2="98" y2="62"/>
</g>
<!-- guarda-sol -->
<path d="M18,110 A58,58 0 0 1 134,110 Z" fill="{P5}"/>
<path d="M18,110 A58,58 0 0 1 76,52 V110 Z" fill="{P7}"/>
<path d="M18,110 C26,104 34,104 42,110 C50,104 58,104 66,110 C74,104 82,104 90,110 C98,104 106,104 114,110 C122,104 130,104 134,110" fill="{L0}"/>
<path d="M76,52 V166" stroke="{P9}" stroke-width="4" stroke-linecap="round"/>
<path d="M76,166 C76,176 92,176 92,166" stroke="{P9}" stroke-width="4" fill="none" stroke-linecap="round"/>
<!-- protetor solar -->
<rect x="140" y="118" width="24" height="48" rx="6" fill="{CR}" stroke="{P7}" stroke-width="3"/>
<rect x="146" y="110" width="12" height="10" rx="2" fill="{P7}"/>
<rect x="145" y="134" width="14" height="14" rx="2" fill="{TC}"/>'''

chap["cap-vacinacao"] = blob_bg() + f'''
<path d="M100,36 L152,54 V104 C152,138 124,158 100,166 C76,158 48,138 48,104 V54 Z" fill="{P5}"/>
<path d="M100,50 L140,64 V104 C140,128 120,146 100,153 C80,146 60,128 60,104 V64 Z" fill="{L1}"/>
<path d="M80,104 L94,118 L122,86" stroke="{P7}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="rotate(45 150 60)">
  <rect x="134" y="52" width="46" height="16" rx="3" fill="{CR}" stroke="{P7}" stroke-width="3"/>
  <rect x="180" y="55" width="12" height="10" rx="2" fill="{P7}"/>
  <rect x="192" y="58" width="12" height="4" rx="2" fill="{P7}"/>
  <rect x="120" y="58" width="14" height="4" rx="2" fill="{P7}"/>
  <rect x="138" y="56" width="20" height="8" rx="1" fill="{TC}"/>
</g>'''

chap["cap-gravidez"] = blob_bg() + f'''
<circle cx="86" cy="46" r="20" fill="{P5}"/>
<path d="M70,40 C72,24 96,20 106,32 C100,36 84,40 70,40 Z" fill="{P7}"/>
<path d="M74,66 H98 C100,74 108,82 118,84 C140,88 148,108 140,130 C136,142 134,154 134,168 H70 V150 C70,132 64,112 66,92 C67,80 70,70 74,66 Z" fill="{P5}"/>
<path d="M126,104 C122,98 114,96 112,104 C110,110 118,116 126,122 C134,116 142,110 140,104 C138,96 130,98 126,104 Z" fill="{TC}"/>
<path d="M150,44 A16,16 0 1 1 156,76 A12,12 0 1 0 150,44 Z" fill="{GD}"/>
<circle cx="44" cy="138" r="3" fill="{GD}"/>
<circle cx="150" cy="150" r="2.4" fill="{P3}"/>'''

chap["cap-consulta"] = blob_bg() + f'''
<!-- casa -->
<path d="M30,116 L54,94 L78,116 V146 H30 Z" fill="{L2}"/>
<path d="M26,118 L54,90 L82,118" stroke="{TC}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="48" y="126" width="12" height="20" rx="2" fill="{P7}"/>
<!-- caminho -->
<path d="M80,140 C100,140 104,120 120,120 C136,120 136,100 152,96" stroke="{P5}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>
<!-- pino de mapa com UBS -->
<path d="M150,32 C124,32 108,52 108,74 C108,104 150,136 150,136 C150,136 192,104 192,74 C192,52 176,32 150,32 Z" fill="{P5}"/>
<circle cx="150" cy="72" r="24" fill="{CR}"/>
<rect x="144" y="58" width="12" height="28" rx="2" fill="{TC}"/>
<rect x="136" y="66" width="28" height="12" rx="2" fill="{TC}"/>'''

chap["cap-farmacia"] = blob_bg() + f'''
<rect x="52" y="60" width="64" height="104" rx="12" fill="{P5}"/>
<rect x="60" y="44" width="48" height="22" rx="5" fill="{TC}"/>
<rect x="62" y="84" width="44" height="52" rx="6" fill="{CR}"/>
<rect x="80" y="94" width="8" height="32" rx="2" fill="{P5}"/>
<rect x="68" y="106" width="32" height="8" rx="2" fill="{P5}"/>
<!-- comprimidos -->
<g transform="rotate(-30 146 132)"><rect x="126" y="122" width="40" height="18" rx="9" fill="{CR}" stroke="{P7}" stroke-width="3"/><path d="M146,122 h11 a9,9 0 0 1 0,18 h-11 Z" fill="{GD}"/></g>
<circle cx="150" cy="70" r="12" fill="{P3}"/>
<line x1="142" y1="70" x2="158" y2="70" stroke="{L0}" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="168" cy="96" r="8" fill="{TC}"/>'''

chap["cap-direitos"] = blob_bg() + f'''
<rect x="97" y="42" width="6" height="112" rx="3" fill="{P7}"/>
<rect x="72" y="150" width="56" height="8" rx="4" fill="{P7}"/>
<rect x="40" y="58" width="120" height="6" rx="3" fill="{P7}"/>
<line x1="56" y1="62" x2="40" y2="102" stroke="{P5}" stroke-width="2.5"/>
<line x1="56" y1="62" x2="72" y2="102" stroke="{P5}" stroke-width="2.5"/>
<path d="M32,102 H80 A24,24 0 0 1 32,102 Z" fill="{TC}"/>
<line x1="144" y1="62" x2="128" y2="96" stroke="{P5}" stroke-width="2.5"/>
<line x1="144" y1="62" x2="160" y2="96" stroke="{P5}" stroke-width="2.5"/>
<path d="M120,96 H168 A24,24 0 0 1 120,96 Z" fill="{P3}"/>
<circle cx="100" cy="42" r="8" fill="{GD}"/>'''

chap["cap-ajuda"] = blob_bg() + f'''
<!-- balões de conversa -->
<path d="M44,60 H120 A14,14 0 0 1 134,74 V104 A14,14 0 0 1 120,118 H78 L56,136 V118 H44 A14,14 0 0 1 30,104 V74 A14,14 0 0 1 44,60 Z" fill="{P5}"/>
<circle cx="60" cy="90" r="5" fill="{L1}"/><circle cx="82" cy="90" r="5" fill="{L1}"/><circle cx="104" cy="90" r="5" fill="{L1}"/>
<path d="M104,108 H160 A12,12 0 0 1 172,120 V144 A12,12 0 0 1 160,156 H150 V172 L132,156 H104 A12,12 0 0 1 92,144 V120 A12,12 0 0 1 104,108 Z" fill="{TC}"/>
<rect x="110" y="126" width="46" height="5" rx="2.5" fill="{CR}"/>
<rect x="110" y="137" width="30" height="5" rx="2.5" fill="{CR}"/>
<!-- fone -->
<path d="M150,40 C160,38 170,44 170,54 L166,62 C160,60 156,58 152,54 L150,40 Z" fill="{P7}"/>
<path d="M136,50 c-8,24 4,44 24,52" stroke="{P7}" stroke-width="8" fill="none" stroke-linecap="round"/>'''

chap["cap-anplupus"] = blob_bg() + f'''
<circle cx="100" cy="100" r="38" fill="{L1}"/>
<path d="M100,118 C90,108 78,100 80,88 C82,80 94,78 100,86 C106,78 118,80 120,88 C122,100 110,108 100,118 Z" fill="{TC}"/>
{person(100, 40, 1.4, P5)}
{person(154, 74, 1.4, P7)}
{person(154, 130, 1.4, P5)}
{person(100, 164, 1.4, P7)}
{person(46, 130, 1.4, P5)}
{person(46, 74, 1.4, P7)}
<circle cx="100" cy="100" r="54" fill="none" stroke="{P3}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>'''

chap["cap-amavi"] = blob_bg() + f'''
<path d="M40,104 L100,52 L160,104 V160 A8,8 0 0 1 152,168 H48 A8,8 0 0 1 40,160 Z" fill="{P5}"/>
<path d="M30,108 L100,46 L170,108" stroke="{P7}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="128" y="60" width="14" height="28" rx="2" fill="{P7}"/>
<path d="M100,146 C88,134 70,124 74,108 C78,96 94,96 100,108 C106,96 122,96 126,108 C130,124 112,134 100,146 Z" fill="{TC}"/>
<circle cx="100" cy="128" r="0" fill="{CR}"/>
<rect x="88" y="148" width="24" height="20" rx="3" fill="{L1}"/>'''

for name, body in chap.items():
    write(name, svg("0 0 200 200", body))

# ---------------------------------------------------------------------
# SPOTS (viewBox 100) — ícones para destaques no corpo do texto
# ---------------------------------------------------------------------
def spot(body, bg=L0):
    return svg("0 0 100 100", f'<rect width="100" height="100" rx="24" fill="{bg}"/>' + body)

spots = {}

# 9 em 10 mulheres
row = ""
for i in range(10):
    x = 18 + (i % 5) * 16
    y = 34 if i < 5 else 64
    row += person(x, y, 1.1, TC if i == 9 else P5)
spots["spot-nove-em-dez"] = row

spots["spot-pele"] = f'''
<circle cx="50" cy="52" r="30" fill="{CR}" stroke="{P7}" stroke-width="3"/>
<ellipse cx="37" cy="55" rx="9" ry="6.5" transform="rotate(-18 37 55)" fill="{TL}"/>
<ellipse cx="63" cy="55" rx="9" ry="6.5" transform="rotate(18 63 55)" fill="{TL}"/>
<path d="M44,52 C47,50 53,50 56,52 C53,54 47,54 44,52 Z" fill="{TL}"/>
<circle cx="40" cy="44" r="3" fill="{P7}"/><circle cx="60" cy="44" r="3" fill="{P7}"/>
<path d="M44,68 C47,71 53,71 56,68" stroke="{P7}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'''

spots["spot-atencao-sol"] = f'''
<circle cx="70" cy="30" r="11" fill="{GD}"/>
<g stroke="{GD}" stroke-width="2.5" stroke-linecap="round"><line x1="70" y1="12" x2="70" y2="16"/><line x1="83" y1="17" x2="80" y2="20"/><line x1="88" y1="30" x2="84" y2="30"/><line x1="57" y1="17" x2="60" y2="20"/><line x1="52" y1="30" x2="56" y2="30"/></g>
<path d="M44,28 L78,86 H10 Z" fill="{TC}" stroke="{TC}" stroke-width="6" stroke-linejoin="round"/>
<rect x="41" y="46" width="6" height="20" rx="3" fill="{CR}"/>
<circle cx="44" cy="75" r="3.5" fill="{CR}"/>'''

spots["spot-articulacoes"] = f'''
<g transform="rotate(-40 50 50)">
  <rect x="14" y="43" width="72" height="14" rx="7" fill="{L2}"/>
  <circle cx="18" cy="42" r="8" fill="{L2}"/><circle cx="18" cy="58" r="8" fill="{L2}"/>
  <circle cx="82" cy="42" r="8" fill="{L2}"/><circle cx="82" cy="58" r="8" fill="{L2}"/>
</g>
<circle cx="50" cy="50" r="13" fill="{TC}"/>
<circle cx="50" cy="50" r="6" fill="{CR}"/>'''

spots["spot-rins"] = f'''
<path d="M34,26 C20,26 14,40 14,52 C14,66 22,78 34,78 C42,78 44,70 40,66 C36,62 34,58 36,52 C38,46 42,44 42,38 C42,30 40,26 34,26 Z" fill="{P5}"/>
<path d="M66,26 C80,26 86,40 86,52 C86,66 78,78 66,78 C58,78 56,70 60,66 C64,62 66,58 64,52 C62,46 58,44 58,38 C58,30 60,26 66,26 Z" fill="{P5}"/>
<path d="M42,40 C46,44 46,60 42,64" stroke="{TC}" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M58,40 C54,44 54,60 58,64" stroke="{TC}" stroke-width="4" fill="none" stroke-linecap="round"/>'''

spots["spot-sangue"] = f'''
<path d="M50,18 C50,18 26,46 26,62 A24,24 0 0 0 74,62 C74,46 50,18 50,18 Z" fill="{TC}"/>
<circle cx="44" cy="62" r="6" fill="{TL}"/><circle cx="58" cy="56" r="4" fill="{TL}"/><circle cx="56" cy="70" r="3" fill="{TL}"/>'''

spots["spot-coracao-pulmao"] = f'''
<path d="M40,30 C30,30 24,40 24,54 C24,68 30,78 40,78 C46,78 46,70 46,62 V36 C46,32 44,30 40,30 Z" fill="{P3}"/>
<path d="M60,30 C70,30 76,40 76,54 C76,68 70,78 60,78 C54,78 54,70 54,62 V36 C54,32 56,30 60,30 Z" fill="{P3}"/>
<rect x="47" y="22" width="6" height="30" rx="3" fill="{P7}"/>
<path d="M50,84 C42,76 30,68 32,58 C34,50 44,50 50,58 C56,50 66,50 68,58 C70,68 58,76 50,84 Z" fill="{TC}"/>'''

spots["spot-nervoso"] = f'''
<path d="M50,22 C34,22 26,34 26,46 C22,50 22,58 26,62 C26,72 34,80 46,78 L46,84 H54 L54,78 C66,80 74,72 74,62 C78,58 78,50 74,46 C74,34 66,22 50,22 Z" fill="{P5}"/>
<path d="M50,26 V78" stroke="{L1}" stroke-width="2.5"/>
<path d="M36,40 C44,40 44,50 38,52 M62,40 C56,42 58,52 64,52 M34,62 C42,60 44,68 40,72 M66,62 C58,60 56,68 60,72" stroke="{L1}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'''

spots["spot-circulacao"] = f'''
<rect x="32" y="52" width="40" height="34" rx="12" fill="{P5}"/>
<rect x="34" y="30" width="9" height="30" rx="4.5" fill="{P5}"/>
<rect x="45" y="22" width="9" height="38" rx="4.5" fill="{P5}"/>
<rect x="56" y="26" width="9" height="34" rx="4.5" fill="{P5}"/>
<rect x="67" y="34" width="8" height="28" rx="4" fill="{P5}"/>
<rect x="20" y="58" width="9" height="22" rx="4.5" transform="rotate(-35 24 69)" fill="{P5}"/>
<circle cx="38.5" cy="31" r="4" fill="{TC}"/><circle cx="49.5" cy="23" r="4" fill="{TC}"/><circle cx="60.5" cy="27" r="4" fill="{TL}"/><circle cx="71" cy="35" r="3.5" fill="{TL}"/>'''

spots["spot-hidroxicloroquina"] = f'''
<circle cx="50" cy="52" r="26" fill="{CR}" stroke="{P7}" stroke-width="3"/>
<line x1="30" y1="52" x2="70" y2="52" stroke="{P7}" stroke-width="3" stroke-linecap="round"/>
<circle cx="76" cy="26" r="10" fill="{GD}"/>'''

spots["spot-corticoide"] = f'''
<rect x="30" y="34" width="40" height="46" rx="8" fill="{P5}"/>
<rect x="36" y="22" width="28" height="14" rx="3" fill="{P7}"/>
<rect x="36" y="48" width="28" height="22" rx="3" fill="{CR}"/>
<circle cx="74" cy="72" r="14" fill="{GD}"/>
<path d="M74,64 V72 L79,76" stroke="{P9}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'''

spots["spot-imunossupressor"] = f'''
<path d="M50,18 L78,28 V50 C78,68 64,80 50,86 C36,80 22,68 22,50 V28 Z" fill="{P5}"/>
<g transform="rotate(-40 50 52)"><rect x="30" y="44" width="40" height="16" rx="8" fill="{CR}"/><path d="M50,44 h12 a8,8 0 0 1 0,16 h-12 Z" fill="{TC}"/></g>'''

spots["spot-biologico"] = f'''
<path d="M36,18 H64 V50 A14,14 0 0 1 36,50 Z" fill="{L2}" stroke="{P7}" stroke-width="3" stroke-linejoin="round"/>
<rect x="40" y="36" width="20" height="14" rx="2" fill="{P5}"/>
<rect x="44" y="12" width="12" height="8" rx="2" fill="{P7}"/>
<line x1="50" y1="64" x2="50" y2="76" stroke="{P7}" stroke-width="3"/>
<path d="M50,88 C50,88 43,80 43,76 A7,7 0 0 1 57,76 C57,80 50,88 50,88 Z" fill="{TC}"/>'''

spots["spot-roupa-uv"] = f'''
<path d="M36,24 L26,30 L18,46 L30,52 L30,80 H70 V52 L82,46 L74,30 L64,24 C60,30 40,30 36,24 Z" fill="{P5}"/>
<circle cx="50" cy="56" r="9" fill="{GD}"/>
<g stroke="{GD}" stroke-width="2.5" stroke-linecap="round"><line x1="50" y1="40" x2="50" y2="43"/><line x1="50" y1="69" x2="50" y2="72"/><line x1="34" y1="56" x2="37" y2="56"/><line x1="63" y1="56" x2="66" y2="56"/></g>'''

spots["spot-alimentacao"] = f'''
<path d="M50,36 C38,26 20,32 20,52 C20,68 32,84 42,84 C46,84 48,82 50,82 C52,82 54,84 58,84 C68,84 80,68 80,52 C80,32 62,26 50,36 Z" fill="{TC}"/>
<rect x="48" y="22" width="4" height="14" rx="2" fill="{P7}"/>
<path d="M52,30 C56,20 66,18 72,20 C70,28 62,34 52,30 Z" fill="{P3}"/>'''

spots["spot-nao-fume"] = f'''
<rect x="26" y="46" width="48" height="10" rx="2" fill="{CR}" stroke="{P7}" stroke-width="2.5"/>
<rect x="64" y="46" width="10" height="10" fill="{TC}"/>
<circle cx="50" cy="50" r="30" fill="none" stroke="{TC}" stroke-width="5"/>
<line x1="29" y1="29" x2="71" y2="71" stroke="{TC}" stroke-width="5" stroke-linecap="round"/>'''

spots["spot-sono"] = f'''
<path d="M40,22 A28,28 0 1 0 74,64 A22,22 0 0 1 40,22 Z" fill="{GD}"/>
<circle cx="70" cy="30" r="3" fill="{P3}"/><circle cx="80" cy="44" r="2" fill="{P3}"/><circle cx="62" cy="20" r="1.8" fill="{P3}"/>'''

spots["spot-coracao"] = f'''
<path d="M50,84 C40,74 20,62 22,44 C24,32 40,30 50,42 C60,30 76,32 78,44 C80,62 60,74 50,84 Z" fill="{TC}"/>
<path d="M28,56 H40 L45,48 L52,64 L58,52 L62,56 H72" stroke="{CR}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'''

spots["spot-ossos"] = f'''
<g transform="rotate(-45 50 50)">
  <rect x="22" y="44" width="56" height="12" rx="6" fill="{CR}" stroke="{P7}" stroke-width="3"/>
  <circle cx="24" cy="42" r="8" fill="{CR}" stroke="{P7}" stroke-width="3"/><circle cx="24" cy="58" r="8" fill="{CR}" stroke="{P7}" stroke-width="3"/>
  <circle cx="76" cy="42" r="8" fill="{CR}" stroke="{P7}" stroke-width="3"/><circle cx="76" cy="58" r="8" fill="{CR}" stroke="{P7}" stroke-width="3"/>
</g>'''

spots["spot-acompanhamento"] = f'''
<rect x="22" y="28" width="56" height="52" rx="6" fill="{CR}" stroke="{P7}" stroke-width="3"/>
<rect x="22" y="28" width="56" height="14" rx="6" fill="{P5}"/>
<rect x="32" y="20" width="5" height="14" rx="2.5" fill="{P7}"/><rect x="63" y="20" width="5" height="14" rx="2.5" fill="{P7}"/>
<path d="M38,60 L47,69 L64,50" stroke="{TC}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'''

spots["spot-pasta"] = f'''
<path d="M18,34 A6,6 0 0 1 24,28 H40 L48,36 H76 A6,6 0 0 1 82,42 V74 A6,6 0 0 1 76,80 H24 A6,6 0 0 1 18,74 Z" fill="{P5}"/>
<rect x="30" y="44" width="40" height="30" rx="3" fill="{CR}"/>
<rect x="36" y="52" width="24" height="3" rx="1.5" fill="{P3}"/><rect x="36" y="60" width="18" height="3" rx="1.5" fill="{P3}"/>'''

spots["spot-telefone"] = f'''
<path d="M34,22 C40,20 46,26 46,32 L44,40 C40,42 36,42 32,40 L30,30 C30,26 32,23 34,22 Z" fill="{P5}"/>
<path d="M26,44 c-6,20 8,40 30,44 c6,0 10,-6 10,-10 l-8,-6 c-4,-2 -8,-2 -10,2 c-8,-4 -14,-12 -16,-20 c4,-2 4,-6 2,-10 Z" fill="{P5}"/>
<path d="M60,30 a14,14 0 0 1 12,12 M60,20 a24,24 0 0 1 22,22" stroke="{TC}" stroke-width="4" fill="none" stroke-linecap="round"/>'''

spots["spot-ouvidoria"] = f'''
<path d="M22,44 H36 L66,26 V74 L36,56 H22 Z" fill="{P5}"/>
<rect x="28" y="56" width="12" height="20" rx="3" fill="{P7}"/>
<path d="M72,40 a12,12 0 0 1 0,20 M76,30 a22,22 0 0 1 0,40" stroke="{TC}" stroke-width="4" fill="none" stroke-linecap="round"/>'''

spots["spot-justica"] = f'''
<rect x="48" y="24" width="4" height="54" rx="2" fill="{P7}"/>
<rect x="34" y="76" width="32" height="5" rx="2.5" fill="{P7}"/>
<rect x="22" y="32" width="56" height="4" rx="2" fill="{P7}"/>
<path d="M18,54 H42 A12,12 0 0 1 18,54 Z" fill="{TC}"/>
<path d="M58,54 H82 A12,12 0 0 1 58,54 Z" fill="{P3}"/>
<line x1="30" y1="34" x2="22" y2="54" stroke="{P5}" stroke-width="2"/><line x1="30" y1="34" x2="38" y2="54" stroke="{P5}" stroke-width="2"/>
<line x1="70" y1="34" x2="62" y2="54" stroke="{P5}" stroke-width="2"/><line x1="70" y1="34" x2="78" y2="54" stroke="{P5}" stroke-width="2"/>
<circle cx="50" cy="24" r="5" fill="{GD}"/>'''

for name, body in spots.items():
    write(name, spot(body))

# ---------------------------------------------------------------------
# ÍCONES DE RÓTULO (24x24, traço em currentColor)
# ---------------------------------------------------------------------
def ico(body):
    return svg("0 0 24 24", body, 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')

write("ico-alerta", ico('<path d="M12 3 2.5 20h19L12 3Z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'))
write("ico-lembrete", ico('<path d="M6 3h12v18l-6-4-6 4V3Z"/>'))
write("ico-dica", ico('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3Z"/>'))
write("ico-sol", ico('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'))

print(f"ok: {len(list(OUT.glob('*.svg')))} ilustrações em {OUT}")
