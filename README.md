# Manual para o paciente com lúpus do Distrito Federal

Diagramação da cartilha da Dra. Paula Cristina Montina (reumatologista, CRM-DF 26.523 · RQE 21.843).
Um único conteúdo gera duas saídas:

- **Impressa**: PDF em A4 (`dist/cartilha-lupus-df-a4.pdf`). Como o formato é proporcional, a gráfica reduz para A5 ou amplia para A3 sem rediagramar.
- **Web**: página responsiva (`dist/index.html`), com o mesmo texto e um botão para baixar o PDF.

## Como gerar

```bash
npm install
npm run build   # monta dist/index.html (web) e dist/print.html (impressão)
npm run pdf     # renderiza o PDF A4 com Chromium (Playwright)
npm run pdf:grafica  # versão para gráfica: sangria 3 mm + marcas de corte, e conversão para CMYK (precisa do Ghostscript)
```

Saídas em `dist/`:

| Arquivo | Uso |
| --- | --- |
| `cartilha-lupus-df-a4.pdf` | leitura em tela e impressão caseira (A4, RGB) |
| `cartilha-lupus-df-a4-grafica-sangria3mm.pdf` | gráfica, RGB, 216 × 303 mm com marcas |
| `cartilha-lupus-df-a4-grafica-sangria3mm-cmyk.pdf` | gráfica, CMYK, mesmo formato (arquivo final de impressão) |
| `prova.html` | prova paginada estática, para revisão no navegador |
| `memorial-projeto-grafico.pdf` | memorial descritivo do projeto gráfico (`npm run memorial`) |

O script `scripts/pdf.mjs` procura o Chromium em `CHROMIUM_PATH`, `/opt/pw-browsers/...` ou nos caminhos comuns do sistema.

## Estrutura

```
content/          texto integral, um arquivo HTML por capítulo (00 = capa, prefácio e ficha; 99 = contracapa)
src/styles.css    sistema visual: paleta, tipografia (Fraunces + Inter), caixas, tabela, QR, @page A4
src/template.html casca comum das duas versões
src/illustrations ilustrações vetoriais (geradas por scripts/illustrations.py)
assets/qr         QR Codes em SVG/PNG (gerados e validados)
assets/logos      logos de apoio e das associações (colocar aqui: srb, fortunato-estudio, anplupus, amaviraras)
scripts/          build.mjs, pdf.mjs, illustrations.py, verify-text.py
dist/             saída pronta (PDF, HTML, fontes e assets)
```

## Marcadores dentro do conteúdo

- `<!--svg:nome-->` insere `src/illustrations/nome.svg` inline.
- `<!--qr:nome-->` insere `assets/qr/nome.svg`.
- `<!--logo:nome-->` insere `assets/logos/nome.(svg|png|jpg)`; se o arquivo não existir, mostra um espaço reservado.
- `<!--TOC-->` recebe o sumário automático (capítulos e seções, com número de página no PDF).

## Conferência do texto

`python3 scripts/verify-text.py caminho/para/texto-original.txt` compara sentença a sentença o texto original com o conteúdo diagramado e lista o que ficou de fora. Nada é resumido: a cartilha é publicada na íntegra.

## QR Codes

| Arquivo | Destino |
| --- | --- |
| `ubs` | https://info.saude.df.gov.br/busca-saude-ubs/ |
| `farmacia-estoque` | https://info.saude.df.gov.br/saude-do-cidadao/painel-infosaude-farmacias-de-alto-custo/ |
| `instagram-anplupus` | https://www.instagram.com/anplupus |
| `instagram-amaviraras` | https://www.instagram.com/amaviraras |
