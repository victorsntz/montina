// Memorial descritivo do projeto gráfico → dist/memorial.html (Paged.js) → PDF via scripts/pdf.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const svgDir = join(root, "src/illustrations");
const svg = (n) => readFileSync(join(svgDir, `${n}.svg`), "utf8").replace(/<\?xml[^>]*>\s*/, "");
const nSvgs = readdirSync(svgDir).filter(f => f.endsWith(".svg") && !f.startsWith("logo-")).length;

const chapters = [
  ["cap-entendendo", "1 · Entendendo o lúpus", "A borboleta geométrica, símbolo da doença e da cartilha. Abre o livro com o sinal mais conhecido do lúpus transformado em imagem de leveza."],
  ["cap-tratamento", "2 · Como é feito o tratamento", "Cápsula aberta, comprimidos e uma folha: o tratamento é medicamento, mas também é cuidado. As cores separam os tipos de remédio sem parecer bula."],
  ["cap-habitos", "3 · O tratamento vai além dos medicamentos", "Guarda-sol e protetor solar diante do sol. A mensagem do capítulo é proteção sem privação: quem tem lúpus não precisa viver longe do sol."],
  ["cap-vacinacao", "4 · Vacinação e lúpus", "Escudo com marca de confirmação e seringa. Vacina como proteção, não como ameaça: o escudo é o protagonista, a seringa é coadjuvante."],
  ["cap-gravidez", "5 · Gravidez, amamentação e anticoncepção", "Silhueta serena de gestante, coração sobre a barriga e uma lua. Planejamento e acompanhamento, com afeto e sem alarme."],
  ["cap-consulta", "6 · Consulta com o reumatologista no DF", "Da casa até o pino no mapa com a cruz: o caminho UBS → regulação → especialista, resumido numa cena que o paciente entende de longe."],
  ["cap-farmacia", "7 · Farmácia de Alto Custo", "Frasco com a cruz da farmácia e comprimidos. Objeto reconhecível na hora, sem a frieza de um balcão institucional."],
  ["cap-direitos", "8 · Direitos e deveres", "A balança, com um prato terracota e outro lilás: direitos e deveres em equilíbrio, nas duas cores de destaque da cartilha."],
  ["cap-ajuda", "9 · Onde buscar ajuda no DF", "Balões de conversa e o fone: os canais 160, 162 e Defensoria representados como diálogo, porque pedir ajuda é conversar."],
  ["cap-anplupus", "10 · ANPLúpus", "Círculo de pessoas ao redor de um coração: a rede de apoio. As figuras alternam dois tons de ameixa, nenhuma é igual à outra."],
  ["cap-amavi", "11 · AMAVI Raras", "Casa com o coração dentro: o Espaço Mundo Raro como lugar de acolhimento. Mesmo coração terracota da ANPLúpus, para ligar as duas redes."],
];

const spots = [
  ["spot-nove-em-dez", "9 em cada 10", "Dez figuras, uma terracota: a estatística vira imagem sem precisar de gráfico."],
  ["spot-pele", "Pele, cabelos e boca", "Rosto com o eritema em asa de borboleta, desenhado com leveza para não assustar."],
  ["spot-atencao-sol", "Atenção ao sol", "Triângulo de atenção com o sol: alerta que entra na sequência dos sintomas."],
  ["spot-articulacoes", "Articulações", "Osso estilizado com a articulação em terracota, o ponto da dor."],
  ["spot-rins", "Rins", "Os dois rins com a inflamação sugerida em terracota."],
  ["spot-sangue", "Sangue", "Gota com células: anemia e plaquetas sem imagem de laboratório."],
  ["spot-coracao-pulmao", "Coração e pulmões", "Pulmões em lilás e coração terracota: pleurite e pericardite."],
  ["spot-nervoso", "Sistema nervoso", "Cérebro em duas metades, traço leve."],
  ["spot-circulacao", "Circulação", "Mão com as pontas dos dedos em dois tons: o fenômeno de Raynaud."],
  ["spot-hidroxicloroquina", "Hidroxicloroquina", "Comprimido com o sol pequeno: o remédio de base e sua relação com a fotossensibilidade."],
  ["spot-corticoide", "Corticoides", "Frasco e relógio: menor dose, menor tempo."],
  ["spot-imunossupressor", "Imunossupressores", "Cápsula dentro do escudo: agem sobre a defesa do corpo."],
  ["spot-biologico", "Biológicos", "Bolsa de infusão com a gota: administrados na veia ou sob a pele."],
  ["spot-roupa-uv", "Roupas com proteção UV", "Camiseta com o sol no peito: a roupa como filtro."],
  ["spot-alimentacao", "Alimentação", "Maçã com folha: variedade e comida de verdade."],
  ["spot-nao-fume", "Não fume", "Cigarro com o sinal de proibido em terracota, a cor de alerta."],
  ["spot-sono", "Sono e saúde emocional", "Lua dourada com estrelas: descanso como parte do tratamento."],
  ["spot-coracao", "Coração", "Coração com a linha de batimento: risco cardiovascular."],
  ["spot-ossos", "Ossos", "Osso em contorno: massa óssea e corticoides."],
  ["spot-acompanhamento", "Acompanhamento", "Calendário com a marca de feito: consulta mesmo quando está tudo bem."],
  ["spot-pasta", "Organize seus documentos", "Pasta com papéis: relatórios, receitas e exames juntos."],
  ["spot-telefone", "Disque Saúde 160", "Fone com as ondas de chamada."],
  ["spot-ouvidoria", "Ouvidoria 162", "Megafone: a reclamação registrada."],
  ["spot-justica", "Defensoria Pública", "Balança pequena, versão de bolso do capítulo 8."],
];

const icons = [
  ["ico-alerta", "Importante / Atenção"],
  ["ico-dica", "Uma dica importante"],
  ["ico-lembrete", "Lembre-se"],
  ["ico-sol", "Sol (reserva)"],
  ["ico-instagram", "Instagram"],
];

const palette = [
  ["#2b1b33", "Ameixa escura", "capa, contracapa, texto de títulos"],
  ["#4b2a5e", "Ameixa", "títulos, corpo das ilustrações"],
  ["#7a4e93", "Ameixa média", "destaques, marcadores, linhas"],
  ["#b592c7", "Lilás forte", "detalhes e sombras das ilustrações"],
  ["#d9c7e3", "Lilás", "fios, bordas, asas da capa"],
  ["#f5f0f8", "Lilás claro", "fundos de caixa e de abertura"],
  ["#d4674a", "Terracota", "alerta, Importante, asas inferiores"],
  ["#d9a441", "Dourado", "dica, sol, luz"],
  ["#fbf7f1", "Creme", "blocos de QR, comprimidos"],
];

const fig = (name, caption) => `<figure class="pg"><img src="memorial/${name}.png" alt=""><figcaption>${caption}</figcaption></figure>`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Memorial descritivo do projeto gráfico</title>
<link rel="stylesheet" href="styles.css">
<style>
  body.print { font-size: 1rem; }
  /* capa e contracapa: cor escura do site da Fortunato (#15140F); o fundo vai na página inteira via handler */
  .m-cover { page: cover; break-after: page; box-sizing: border-box; height: 100%; width: 100%; margin: 0; padding: 22mm 22mm 26mm; color: #F6F5F1; display: flex; flex-direction: column; justify-content: space-between; }
  .m-cover .top { display: flex; justify-content: space-between; align-items: center; }
  .m-cover .top svg { height: 10mm; width: auto; }
  .m-cover .top span { font-size: .74rem; color: #BFBDB5; letter-spacing: .16em; text-transform: uppercase; }
  .m-cover .art { display: flex; justify-content: center; align-items: center; flex: 1; }
  .m-cover .art svg { width: 78mm; height: auto; }
  .m-cover .kicker { font-size: .78rem; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: #BFBDB5; margin-bottom: .9rem; }
  .m-cover h1 { color: #F6F5F1; font-size: 3.6rem; font-weight: 400; line-height: 1.02; letter-spacing: -.02em; max-width: 160mm; font-variation-settings: "opsz" 144, "SOFT" 100; margin: 0; }
  .m-cover .sub { margin-top: 1.3rem; font-family: var(--serif); font-size: 1.25rem; line-height: 1.35; color: #BFBDB5; max-width: 150mm; }
  .m-cover .sub strong { color: #F6F5F1; font-weight: 500; }
  .m-cover .rule { height: 2px; background: #5C5B55; width: 34mm; margin: 1.6rem 0 1.1rem; }
  .m-cover .meta { font-size: .8rem; color: #8f8b82; letter-spacing: .06em; }
  .pagedjs_page.dark-page { background: #15140F; }
  .pagedjs_page.dark-page .pagedjs_margin-bottom-left, .pagedjs_page.dark-page .pagedjs_margin-bottom-right { visibility: hidden; }
  section.m { break-before: page; }
  section.m h1 { font-size: 2.3rem; font-weight: 500; margin: 0 0 .5rem; max-width: 150mm; }
  section.m .num { font-family: var(--sans); font-size: .74rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--plum-500); margin-bottom: .8rem; }
  section.m h2 { font-size: 1.35rem; margin: 1.4rem 0 .5rem; }
  .why { border-left: 5px solid var(--terracotta); padding: .2rem 0 .2rem 1rem; margin: .9rem 0 1.1rem; max-width: var(--measure); }
  .why .lab { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; color: #a6432a; margin-bottom: .25rem; }
  .why p { margin-bottom: .35rem; }
  .capa-grid { display: grid; grid-template-columns: 82mm 1fr; gap: 9mm; align-items: start; margin-top: .6rem; }
  .capa-grid figure.big img { box-shadow: 0 6px 22px rgba(43,27,51,.22); }
  .capa-txt h4 { margin: 0 0 .25rem; font-size: .95rem; }
  .capa-txt p { font-size: .9rem; margin-bottom: .8rem; max-width: none; }
  .pages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; margin: 1rem 0 1.2rem; }
  .pages.three { grid-template-columns: repeat(3, 1fr); }
  .pages.two { grid-template-columns: repeat(2, 1fr); max-width: 150mm; }
  figure.pg { margin: 0; break-inside: avoid; }
  figure.pg img { width: 100%; display: block; border: 1px solid var(--lilac-200); border-radius: 4px; box-shadow: 0 2px 8px rgba(43,27,51,.10); }
  figure.pg figcaption { font-size: .72rem; color: var(--ink-soft); margin-top: .35rem; line-height: 1.3; }
  .swatches { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 1rem 0; }
  .sw { break-inside: avoid; border-radius: 10px; overflow: hidden; border: 1px solid var(--lilac-200); }
  .sw i { display: block; height: 16mm; }
  .sw div { padding: .5rem .7rem .6rem; font-size: .8rem; line-height: 1.35; }
  .sw b { display: block; font-size: .86rem; }
  .sw code { font-family: var(--sans); color: var(--plum-500); font-size: .74rem; }
  .type { border: 1px solid var(--lilac-200); border-radius: 12px; padding: 1rem 1.2rem; margin: .8rem 0; break-inside: avoid; }
  .type .name { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; color: var(--plum-500); font-weight: 700; }
  .type .sample { margin: .3rem 0 .4rem; }
  .type .sample.serif { font-family: var(--serif); font-size: 2rem; line-height: 1.1; font-variation-settings: "opsz" 72, "SOFT" 40; }
  .type .sample.sans { font-family: var(--sans); font-size: 1.05rem; }
  .type .sample.stix { font-family: "STIX Two Text", serif; font-weight: 600; font-size: 1.6rem; letter-spacing: .2em; }
  .type p { font-size: .88rem; color: var(--ink-soft); margin: 0; }
  .gal { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm 6mm; margin: 1rem 0; }
  .gal.four { grid-template-columns: repeat(4, 1fr); gap: 5mm; }
  .gal.five { grid-template-columns: repeat(5, 1fr); gap: 4mm; }
  .gal.six { grid-template-columns: repeat(6, 1fr); gap: 3.5mm; }
  .gal.six .it h4 { font-size: .74rem; margin-top: .35rem; }
  .gal.six .it p { font-size: .66rem; line-height: 1.28; }
  .gal.six .it .im { padding: 1.5mm; border-radius: 9px; }
  .gal.five .it h4 { font-size: .82rem; }
  .gal.five .it p { font-size: .72rem; }
  .keep { break-inside: avoid; }
  .newpage { break-before: page; }
  .gal .it { break-inside: avoid; }
  .gal.four .it .im, .gal.five .it .im { padding: 2mm; }
  .gal .it .im { background: var(--white); border: 1px solid var(--lilac-200); border-radius: 12px; padding: 3mm; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; }
  .gal .it svg { width: 100%; height: auto; max-height: 100%; display: block; }
  .gal .it h4 { margin: .5rem 0 .15rem; font-size: .92rem; }
  .gal .it p { font-size: .76rem; color: var(--ink-soft); line-height: 1.32; margin: 0; }
  .gal.icons .im { padding: 3mm; color: var(--plum-700); max-width: 16mm; }
  .gal.icons .it h4 { font-size: .72rem; }
  .comp { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin: .8rem 0; }
  .comp > div { break-inside: avoid; }
  .comp .box, .comp .card, .comp .qr, .comp .spot { margin: 0 0 .6rem; max-width: none; }
  .comp .qr { grid-template-columns: 22mm 1fr; padding: .7rem; gap: 4mm; }
  .comp .qr .code { width: 22mm; height: 22mm; }
  .comp .box { padding: .7rem .9rem .6rem; }
  .rules li { margin-bottom: .45rem; }
  .cred dl { display: grid; grid-template-columns: max-content 1fr; gap: .4rem 1rem; max-width: var(--measure); }
  .cred dt { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--plum-500); font-weight: 700; padding-top: .15rem; }
  .cred dd { margin: 0; }
  .decl { background: var(--lilac-050); border-radius: 14px; padding: 1.1rem 1.3rem; margin: 1.2rem 0; max-width: var(--measure); font-family: var(--serif); font-size: 1.05rem; line-height: 1.45; color: var(--plum-900); font-variation-settings: "opsz" 24, "SOFT" 50; }
  .m-back { page: cover; break-before: page; box-sizing: border-box; height: 100%; width: 100%; margin: 0; padding: 22mm 22mm 28mm; display: flex; flex-direction: column; justify-content: flex-end; }
  .m-back svg { height: 12mm; width: auto; }
  .m-back p { color: #8f8b82; font-size: .8rem; margin-top: 1rem; max-width: 120mm; }
  .chapter h1 { string-set: none; }
  section.m h1 { string-set: chapter-title content(text); }
  @media screen { body.print { background:#ddd } .pagedjs_page { background:white; margin: 8mm auto; box-shadow: 0 2px 12px rgba(0,0,0,.2);} }
</style>
</head>
<body class="print">

<section class="m-cover">
  <div class="top">${svg("logo-fortunato-dark")}<span>Brasília · setembro de 2026</span></div>
  <div class="art">${svg("capa-verso")}</div>
  <div class="bottom">
    <div class="kicker">Documento de projeto</div>
    <h1>Memorial descritivo do projeto gráfico</h1>
    <p class="sub"><strong>Manual para o paciente com lúpus do Distrito Federal</strong><br>Cartilha da Dra. Paula Cristina Montina, médica reumatologista</p>
    <div class="rule"></div>
    <div class="meta">Conceito · sistema visual · ilustrações autorais · decisões editoriais · produção</div>
  </div>
</section>

<section class="m" id="m1">
  <div class="num">01</div>
  <h1>O ponto de partida</h1>
  <p class="lead">A Dra. Paula Cristina Montina, reumatologista dos ambulatórios de lúpus do IHBDF, escreveu um manual completo para o paciente do Distrito Federal: doença, tratamento, vacinação, gestação, acesso ao SUS, farmácia de alto custo, direitos e redes de apoio.</p>
  <p>O material que existia até então, a cartilha nacional da Sociedade Brasileira de Reumatologia, foi considerado pela autora informal e resumido demais: 19 páginas em A5, tópicos curtos, roxo chapado. O pedido foi claro: uma cartilha nacional de referência, com o texto integral, que respeitasse a inteligência do paciente e tivesse a seriedade de um livro.</p>
  <div class="why">
    <div class="lab">Por que isso importa</div>
    <p>Quem recebe o diagnóstico de lúpus precisa de informação organizada, não de slogans. A diagramação foi tratada como parte do cuidado: hierarquia clara, ritmo de leitura, e nenhum parágrafo cortado ou resumido.</p>
  </div>
  <h2>Compromissos do projeto</h2>
  <ul>
    <li><strong>Texto integral.</strong> As 517 sentenças do original foram conferidas uma a uma no arquivo final. Só foram corrigidos erros de digitação.</li>
    <li><strong>Formato escalável.</strong> A4 como base: reduz para A5 de bolso ou amplia para A3 sem rediagramar, porque a proporção é a mesma.</li>
    <li><strong>Ilustração autoral.</strong> Nenhuma imagem de banco. Todas as ${nSvgs} peças vetoriais foram desenhadas para este projeto, no mesmo sistema de formas e cores.</li>
    <li><strong>Duas saídas, uma fonte.</strong> O mesmo conteúdo gera a versão impressa (PDF com sangria e CMYK) e a versão web responsiva.</li>
  </ul>
  <div class="pages three">
    ${fig("capa", "Capa")}
    ${fig("folha", "Folha de rosto com o índice visual")}
    ${fig("abertura", "Abertura do capítulo 1")}
  </div>
</section>

<section class="m" id="m2">
  <div class="num">02</div>
  <h1>A borboleta</h1>
  <p class="lead">O símbolo da cartilha nasce do sinal mais conhecido da doença e vira uma imagem de transformação.</p>
  <p>A vermelhidão que atravessa as bochechas e o nariz é chamada pela medicina de "asa de borboleta". Com o tempo, a borboleta se tornou o símbolo mundial da luta contra o lúpus, ao lado da cor roxa do Maio Roxo. A cartilha assume o símbolo e o redesenha: asas superiores em lilás, inferiores em terracota, corpo em ameixa, construídas só com elipses e círculos.</p>
  <div class="why">
    <div class="lab">Por que esta borboleta</div>
    <p>Ela é reconhecível para o reumatologista e acolhedora para o paciente. As formas geométricas evitam o desenho infantil e sustentam a frase que fecha o prefácio da autora: "o lúpus faz parte da sua história, mas não define quem você é".</p>
  </div>
  <p>A mesma borboleta aparece em quatro escalas: grande na capa, média na abertura do capítulo 1 e na página "Por que a borboleta?", pequena na contracapa e minúscula na faixa que encerra cada capítulo. Um símbolo, um sistema.</p>
  <div class="gal four" style="margin-top:1.2rem">
    <div class="it"><div class="im" style="background:#2b1b33;padding:6mm">${svg("capa-verso")}</div><h4>Contracapa</h4><p>Versão sobre fundo escuro.</p></div>
    <div class="it"><div class="im" style="padding:4mm">${svg("cap-entendendo")}</div><h4>Abertura do capítulo 1</h4><p>Dentro do fundo orgânico das aberturas.</p></div>
    <div class="it"><div class="im" style="padding:9mm">${svg("mark-borboleta")}</div><h4>Fim de capítulo</h4><p>Marca de 11 mm na faixa do rodapé.</p></div>
    <div class="it"><div class="im" style="padding:6mm">${svg("spot-pele")}</div><h4>No rosto</h4><p>O sinal clínico, no ícone de pele.</p></div>
  </div>
</section>

<section class="m capa-sec" id="m2b">
  <div class="num">03</div>
  <h1>A capa</h1>
  <p class="lead">A capa precisava funcionar em três lugares ao mesmo tempo: na mão do paciente, na mesa do consultório e na foto do lançamento.</p>
  <div class="capa-grid">
    <figure class="pg big"><img src="memorial/capa.png" alt=""><figcaption>Capa final, A4.</figcaption></figure>
    <div class="capa-txt">
      <h4>Fundo escuro</h4>
      <p>Ameixa escura, a cor mais profunda da paleta. Dá peso de livro, destaca a cartilha numa pilha de folhetos claros e faz a borboleta e o título saltarem sem esforço.</p>
      <h4>Um protagonista, um ponto de luz</h4>
      <p>A borboleta é o único desenho; o sol dourado no canto superior direito é o único ponto de luz. Nada compete com os dois. As asas translúcidas ao fundo dão profundidade sem virar "ilustração de fundo".</p>
      <h4>Hierarquia de leitura</h4>
      <p>O olho entra pelo título em Fraunces no terço superior, desce pela borboleta e termina nos créditos da autora na base. "Lúpus" em itálico é a única palavra com tratamento diferente: é o assunto do livro.</p>
      <h4>Créditos no lugar de assinatura</h4>
      <p>Nome, especialidade, CRM e RQE da Dra. Paula ficam na base esquerda, como assinatura. À direita, "1ª edição · 2026". Existe respiro deliberado entre a ilustração e os créditos, para nada encostar em nada.</p>
      <h4>Pensada para a gráfica</h4>
      <p>O fundo avança 3 mm na sangria do arquivo de impressão, então a faca pode desviar sem deixar fio branco na borda. As cores foram convertidas para CMYK mantendo a ameixa fechada e o dourado limpo.</p>
    </div>
  </div>
</section>

<section class="m" id="m3">
  <div class="num">04</div>
  <h1>Cores</h1>
  <p class="lead">Uma família de ameixa e lilás para a identidade, terracota para alerta, dourado para dica. Nada além disso.</p>
  <div class="swatches">
    ${palette.map(([hex, name, use]) => `<div class="sw"><i style="background:${hex}"></i><div><b>${name}</b><code>${hex}</code><br>${use}</div></div>`).join("")}
  </div>
  <div class="why">
    <div class="lab">Por que essas cores</div>
    <p>O roxo é a cor do lúpus no mundo inteiro, então a cartilha não foge dele: ela o aprofunda. A ameixa escura dá peso de livro à capa; o lilás claro faz os fundos respirarem. O terracota foi escolhido para alertas porque contrasta com o roxo sem gritar como um vermelho puro, e o dourado marca as dicas como algo positivo. O paciente aprende o código em duas páginas: terracota é "cuidado", dourado é "vale a pena", lilás é "lembre-se".</p>
  </div>
</section>

<section class="m" id="m5">
  <div class="num">05</div>
  <h1>Estrutura editorial</h1>
  <p class="lead">A cartilha foi organizada como um livro: partes pré-textuais, onze capítulos com abertura própria, uma página de fechamento e a contracapa.</p>
  <div class="why">
    <div class="lab">Por que aberturas de página inteira</div>
    <p>Cada capítulo é uma pergunta diferente do paciente ("posso engravidar?", "meu remédio foi negado, e agora?"). A abertura em página inteira dá uma pausa, avisa a mudança de assunto e deixa o livro fácil de folhear até o ponto certo.</p>
  </div>
  <div class="pages">
    ${fig("folha", "Folha de rosto: índice visual com as onze ilustrações.")}
    ${fig("ficha", "Ficha técnica com créditos, apoio e ficha catalográfica (CIP).")}
    ${fig("sumario", "Sumário automático em duas páginas, com número de página.")}
    ${fig("prefacio", "Prefácio em duas colunas, com retrato e citação, em uma página.")}
    ${fig("abertura", "Abertura de capítulo: ilustração, numeral e a frase da autora.")}
    ${fig("fim", "Faixa de fim de capítulo no rodapé, com a borboleta.")}
    ${fig("bonus", "Página bônus: a história da borboleta e uma palavra da autora.")}
    ${fig("contracapa", "Contracapa: borboleta pequena, frase-síntese e marcas de apoio.")}
  </div>
</section>

<section class="m" id="m6">
  <div class="num">06</div>
  <h1>Componentes</h1>
  <p class="lead">Um conjunto pequeno de peças que se repete do começo ao fim. O leitor aprende o vocabulário nas primeiras páginas e nunca mais precisa pensar nele.</p>
  <div class="comp">
    <div>
      <div class="box important"><div class="label">${svg("ico-alerta")}Importante</div><p>Terracota: informação que evita erro ou risco. Ex.: não suspender medicamentos por conta própria.</p></div>
      <div class="box tip"><div class="label">${svg("ico-dica")}Uma dica importante</div><p>Dourado: orientação prática que facilita a vida. Ex.: o que levar para a consulta.</p></div>
      <div class="box remember"><div class="label">${svg("ico-lembrete")}Lembre-se</div><p>Lilás: a síntese que fecha uma seção, no tom da autora.</p></div>
    </div>
    <div>
      <div class="spot"><div class="icon">${svg("spot-rins")}</div><div><h3 style="margin-top:0">Destaque com ícone</h3><p>Sintomas, remédios e hábitos: ícone à esquerda, título e texto ao lado. Sequências longas ficam escaneáveis.</p></div></div>
      <div class="card"><h4>Cartão de contato</h4><dl><dt>Uso</dt><dd>Endereços, telefones e e-mails com rótulos, separados do texto corrido.</dd></dl></div>
      <div class="qr"><div class="code">${svg("mark-borboleta")}</div><div><h4>Bloco de QR Code</h4><p>Código, título, instrução e endereço legível. Os quatro códigos foram gerados em vetor e testados no PDF final.</p></div></div>
    </div>
  </div>
  <ul class="rules">
    <li><strong>Checklists</strong> com caixinhas para "o que levar" e documentos, porque o paciente usa a cartilha na fila do serviço.</li>
    <li><strong>Fluxos em pílulas</strong> (residência → UBS → regulação → consulta) para o caminho do SUS caber numa linha.</li>
    <li><strong>Tabela</strong> só onde a informação é realmente tabular: as três unidades da Farmácia de Alto Custo.</li>
  </ul>
  <h2>Ícones de rótulo</h2>
  <p>Traço fino, em linha, para os rótulos das caixas e do bloco de Instagram. Herdam a cor do rótulo em que estão.</p>
  <div class="gal five icons" style="margin-top:.4rem">
    ${icons.map(([n, t]) => `<div class="it"><div class="im">${svg(n)}</div><h4>${t}</h4></div>`).join("")}
  </div>
</section>

<section class="m" id="m7">
  <div class="num">07</div>
  <h1>Ilustrações autorais</h1>
  <p class="lead">Todas as ilustrações desta cartilha são autorais, criadas pela Fortunato Estúdio para este projeto. Nenhuma vem de banco de imagens.</p>
  <p>São ${nSvgs} peças vetoriais: a capa, onze aberturas de capítulo, vinte e quatro ícones de destaque, cinco ícones de rótulo, a marca de fim de capítulo e as versões da borboleta. Por serem vetor, imprimem nítidas em qualquer tamanho, do A5 ao cartaz, e funcionam na web sem perda.</p>
  <div class="why">
    <div class="lab">O estilo</div>
    <p>Formas geométricas suaves, sem contorno, construídas só com elipses, círculos e retângulos arredondados. Paleta reduzida à da cartilha. Nenhum rosto realista, nenhuma cena de hospital: o paciente se vê nas imagens sem se ver doente.</p>
  </div>
  <h2 class="newpage" style="margin-top:0">Aberturas de capítulo</h2>
  <div class="gal four">
    ${chapters.map(([n, t, why]) => `<div class="it"><div class="im">${svg(n)}</div><h4>${t}</h4><p>${why}</p></div>`).join("")}
  </div>
</section>

<section class="m" id="m8">
  <div class="num">08</div>
  <h1>Ícones de destaque</h1>
  <p class="lead">Vinte e quatro ícones para os sintomas, os medicamentos, os hábitos e os canais de ajuda. Cada um sobre um quadrado lilás de cantos arredondados, sempre no mesmo tamanho.</p>
  <div class="gal six">
    ${spots.map(([n, t, why]) => `<div class="it"><div class="im" style="padding:2mm">${svg(n)}</div><h4>${t}</h4><p>${why}</p></div>`).join("")}
  </div>
</section>

<section class="m" id="m9">
  <div class="num">09</div>
  <h1>Regras de paginação</h1>
  <p class="lead">O que o leitor não vê, mas sente: as regras que fazem cada página parecer "arrumada".</p>
  <ul class="rules">
    <li><strong>Uma largura só.</strong> Texto, listas, caixas, tabela, cartões e QR Codes têm a mesma largura de 140 mm. A borda direita do miolo é uma linha só.</li>
    <li><strong>Título nunca fica órfão.</strong> Cada título vai colado ao seu primeiro parágrafo (e a uma lista curta, se houver). Seções curtas passam inteiras para a página seguinte quando não cabem.</li>
    <li><strong>Sem viúvas.</strong> As duas últimas palavras de todo parágrafo, item e título são coladas com espaço inquebrável: nunca sobra uma palavra sozinha na última linha.</li>
    <li><strong>Quebras de página protegidas.</strong> No mínimo três linhas de um parágrafo de cada lado de uma quebra.</li>
    <li><strong>Um destaque por capítulo.</strong> Só o parágrafo de abertura fica na serifa maior; o corpo é uniforme.</li>
    <li><strong>Fim de capítulo no rodapé.</strong> A faixa lilás com a borboleta ocupa a base da última página de cada capítulo, com o número da página dentro dela.</li>
    <li><strong>Numeração de livro.</strong> Pré-textuais em algarismos romanos, capítulos em arábicos, rodapé com o nome do capítulo.</li>
  </ul>
  <div class="why">
    <div class="lab">Por que tanta regra</div>
    <p>Porque cartilha de saúde é lida em pedaços, muitas vezes na sala de espera. Cada página precisa fazer sentido sozinha. Regras automáticas garantem que, quando a autora alterar um parágrafo, a cartilha inteira continue arrumada sem retrabalho manual.</p>
  </div>
</section>

<section class="m" id="m10">
  <div class="num">10</div>
  <h1>Legibilidade e letramento em saúde</h1>
  <p class="lead">Decisões tomadas com base nas recomendações para materiais educativos impressos em saúde.</p>
  <ul class="rules">
    <li>Corpo de texto em 10,5 pt e entrelinha generosa, acima do mínimo recomendado para leitores adultos com baixa escolaridade ou dificuldade visual.</li>
    <li>Contraste alto entre texto e fundo; cores nunca são o único código (alertas têm ícone e rótulo, além da cor).</li>
    <li>Títulos em forma de pergunta, como a autora escreveu ("Posso amamentar?"), porque é assim que o paciente procura a informação.</li>
    <li>Ícones apoiam a leitura de sequências longas (sintomas, remédios) sem substituir o texto.</li>
    <li>Linguagem da autora preservada na íntegra: a diagramação organiza, não reescreve.</li>
    <li>QR Codes com margem de silêncio e alto contraste, validados por leitura automática no PDF final.</li>
  </ul>
</section>

<section class="m" id="m11">
  <div class="num">11</div>
  <h1>Produção e entregas</h1>
  <p class="lead">Um único conteúdo-fonte gera todas as versões. Alterações de texto entram uma vez e se propagam.</p>
  <ul class="rules">
    <li><strong>PDF de leitura</strong> (A4, RGB) para tela, e-mail e impressão caseira.</li>
    <li><strong>PDF de gráfica</strong>: 216 × 303 mm, sangria de 3 mm, marcas de corte e registro, cores convertidas para CMYK, fontes embutidas. Capa, contracapa e faixas de fim de capítulo avançam na sangria.</li>
    <li><strong>Versão web</strong> responsiva, com o mesmo texto, navegação pelo sumário e botão de download do PDF.</li>
    <li><strong>Prova comentável</strong> em página HTML paginada, usada nas rodadas de revisão.</li>
    <li><strong>Ficha catalográfica</strong> (CIP) montada com CDD 616.772 e CDU 616.5-002.52; ISBN a preencher após o registro na Câmara Brasileira do Livro.</li>
    <li><strong>Marcas</strong>: Fortunato Estúdio (tipográfica, a partir da identidade do estúdio), Sociedade de Reumatologia de Brasília (vetor oficial, versões colorida e branca), ANPLúpus e AMAVI Raras (arquivos oficiais).</li>
  </ul>
  <div class="why">
    <div class="lab">Por que escalável</div>
    <p>A cartilha vai ter novas edições: telefones mudam, protocolos mudam, o ISBN chega. Todo o projeto foi construído para que a segunda edição custe uma tarde, não um novo projeto.</p>
  </div>
</section>

<section class="m cred" id="m12">
  <div class="num">12</div>
  <h1>Créditos e autoria</h1>
  <dl>
    <dt>Conteúdo</dt><dd>Dra. Paula Cristina Montina, médica reumatologista, CRM-DF 26.523 · RQE 21.843</dd>
    <dt>Projeto gráfico</dt><dd>Fortunato Estúdio · direção de design: Victor Fortunato</dd>
    <dt>Diagramação</dt><dd>Fortunato Estúdio</dd>
    <dt>Ilustrações</dt><dd>Fortunato Estúdio (${nSvgs} peças vetoriais autorais)</dd>
    <dt>Apoio</dt><dd>Sociedade de Reumatologia de Brasília (SRB)</dd>
    <dt>Redes de apoio</dt><dd>ANPLúpus · AMAVI Raras</dd>
    <dt>Formato</dt><dd>A4, 56 páginas, 1ª edição, Brasília, 2026</dd>
  </dl>
  <div class="decl">
    O projeto gráfico, a diagramação e todas as ilustrações desta cartilha são obras autorais da Fortunato Estúdio, criadas especificamente para o Manual para o paciente com lúpus do Distrito Federal. Não foram utilizadas imagens de banco, modelos prontos ou ilustrações de terceiros. O texto é de autoria da Dra. Paula Cristina Montina e foi reproduzido na íntegra.
  </div>
  <p style="font-size:.86rem;color:var(--ink-soft)">Este memorial acompanha a entrega dos arquivos finais e documenta as decisões de projeto para consulta em edições futuras.</p>
</section>

<section class="m-back">
  <div>${svg("logo-fortunato-dark")}<p>Estúdio de design de marcas · fortunatoestudio.com</p></div>
</section>

<script>window.PagedConfig = { auto: false };</script>
<script src="paged.polyfill.js"></script>
<script>
  class PaginaEscura extends Paged.Handler {
    afterPageLayout(pageEl) { if (pageEl.querySelector(".m-cover, .m-back")) pageEl.classList.add("dark-page"); }
  }
  Paged.registerHandlers(PaginaEscura);
  window.PagedPolyfill.preview().then(() => { window.__pagedDone = true; });
</script>
</body>
</html>`;

writeFileSync(join(dist, "memorial.html"), html);
console.log("memorial ok → dist/memorial.html");
