#!/bin/bash
# Publica o site no branch gh-pages: landing/raiz na raiz e landing/dist em cartilha/.
# A Hostinger (montinamedicina.com) puxa esse branch pelo Git; o GitHub Pages serve o mesmo conteúdo como espelho.
# Uso, depois de montar com SITE_URL=https://montinamedicina.com/cartilha/ e fazer commit:  bash scripts/publicar.sh "mensagem"
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain landing)" ]; then echo "faça commit de landing/ antes de publicar"; exit 1; fi
git fetch -q origin gh-pages
TREE=$( { git ls-tree HEAD:landing/raiz; printf "040000 tree %s\tcartilha\n" "$(git rev-parse HEAD:landing/dist)"; } | git mktree )
C=$(git commit-tree "$TREE" -p FETCH_HEAD -m "${1:-Atualiza o site}")
git push origin "$C:refs/heads/gh-pages"
echo "publicado: $C"
