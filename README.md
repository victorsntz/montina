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
| `cartilha-lupus-df-a4.pdf` | leitura em tela e impressão caseira (A4, RGB, 60 páginas, mesma paginação do livreto) |
| `cartilha-lupus-df-livreto-curvas-cmyk.pdf` | **arquivo final de gráfica**: livreto grampeado, 60 páginas em sequência, CMYK, texto em curvas, 216 × 303 mm (sangria de 3 mm) com marcas de corte |
| `cartilha-lupus-df-livreto-capa-4pp-curvas.pdf` | só a capa (1ª, 2ª, 3ª e 4ª capa), para imprimir em papel mais encorpado |
| `cartilha-lupus-df-livreto-miolo-curvas.pdf` | só o miolo (56 páginas) |
| `cartilha-lupus-df-livreto-paginas-duplas.pdf` | visualização em páginas duplas, como o leitor vê o livreto aberto |
| `cartilha-lupus-df-a4-grafica-sangria3mm-cmyk.pdf` | gráfica, CMYK, com as fontes embutidas (para gráficas que preferem texto vivo) |
| `prova.html` | prova paginada estática em páginas duplas, para revisão no navegador |
| `memorial-projeto-grafico.pdf` | memorial descritivo do projeto gráfico (`npm run memorial`) |

Arquivos do livreto: `npm run build && npm run livreto` (gera o PDF com sangria, converte para CMYK com o texto em curvas, troca o preto do código de barras por 100% K, separa capa e miolo, confere que o total e o miolo são múltiplos de 4 e gera as páginas duplas; usa `gs` e o Python com `pymupdf`).

### ISBN

- **ISBN 978-65-02-46030-6** (registrado na CBL). Aparece na ficha catalográfica (`content/00-capa.html`) e na 4ª capa, com o código de barras EAN-13.
- O código de barras é desenhado em vetor por `scripts/codigo-barras.py` (gera `src/illustrations/isbn-codigo-barras.svg`, 90% do tamanho nominal na contracapa). Na versão web ele fica escondido.
- `scripts/preto100k.py` troca o preto de quatro cores que o Ghostscript gera por 100% K nos PDFs CMYK, para as barras não borrarem na impressão. O `livreto.py` e o `npm run cmyk` já chamam o script.
- Nova edição, novo formato (impresso e PDF são formatos diferentes) ou mudança de título pedem ISBN novo: troque a constante em `scripts/codigo-barras.py`, a linha da ficha e a constante `ISBN` de `scripts/landing.py`.

### Regras do livreto

- Total múltiplo de 4 (grampo canoa), hoje 60 páginas: capa, 2ª capa (guarda), miolo de 56 páginas, 3ª capa (a página "Por que a borboleta?") e 4ª capa. O `scripts/livreto.py` falha se a conta não fechar depois de uma alteração de texto.
- Margens espelhadas: 22 mm do lado da lombada, 18 mm do lado de fora; número da página sempre na borda externa.
- Folha de rosto e prefácio em página da direita; contracapa sempre na última página da esquerda.

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
| `ceaf-digital` | https://ceafdigital.saude.df.gov.br/ |
| `farmacia-estoque` | https://info.saude.df.gov.br/saude-do-cidadao/painel-infosaude-farmacias-de-alto-custo/ |
| `instagram-anplupus` | https://www.instagram.com/anplupus |
| `instagram-amaviraras` | https://www.instagram.com/amaviraras |

## Landing page para baixar a cartilha

A pasta `landing/dist/` é um site estático pronto: página de download com mockup da cartilha, foto e apresentação da autora, capítulos, páginas de dentro, redes de apoio, botão de compartilhar no WhatsApp e a versão para ler online em `ler/`.

- Fonte: `landing/src/` (`index.html`, `landing.css`, `landing.js`). Todo o CSS fica dentro de `.lp` com prefixo `lp-`, para a página poder entrar depois no site da Montina Medicina sem conflito de estilos.
- Montar: `npm run build && npm run pdf && /usr/bin/python3 scripts/landing.py`. O script gera as imagens a partir do PDF de leitura, copia fontes, logos, foto e PDF, e cria a imagem de prévia `og-cartilha.jpg`.

### Como colocar no ar

**No ar:** https://montinamedicina.com/cartilha/ (Hostinger). Quem abre só `montinamedicina.com` é levado para a cartilha. Espelho: https://victorsntz.github.io/montina/.

O branch `gh-pages` guarda o site pronto: `landing/raiz` na raiz (redirecionamento, `.htaccess`, `robots.txt`, `sitemap.xml`, `favicon.ico`) e `landing/dist` em `cartilha/`. A Hostinger puxa esse branch pelo Git (hPanel → Avançado → GIT, repositório `https://github.com/victorsntz/montina.git`, branch `gh-pages`, diretório em branco = `public_html`).

Para atualizar:

```
SITE_URL=https://montinamedicina.com/cartilha/ /usr/bin/python3 scripts/landing.py
git add landing && git commit -m "Atualiza a landing"
bash scripts/publicar.sh "Atualiza a landing"
```

Depois, no hPanel, **Implantar** de novo (ou ligue o webhook de implantação automática que a Hostinger mostra na tela do Git, em GitHub → Settings → Webhooks).

A cartilha fica em `/cartilha/` de propósito: quando o site da Montina Medicina ocupar a raiz, o link que circulou no WhatsApp continua abrindo a cartilha. Para liberar a raiz, apague a linha `RedirectMatch` do `.htaccess` (o redirecionamento é 302, temporário, então nenhum navegador guarda).

Outra opção, sem Git: suba o conteúdo de `landing/raiz` e uma pasta `cartilha/` com o conteúdo de `landing/dist` para a `public_html` pelo Gerenciador de Arquivos. Todos os caminhos da página são relativos.
