// Junta o site pronto em dist/ (não compila nada: as páginas já vêm prontas do projeto da cartilha)
import { cpSync, rmSync, mkdirSync } from "node:fs";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const f of ["index.html", ".htaccess", "robots.txt", "sitemap.xml", "favicon.ico", "cartilha"]) cpSync(f, "dist/" + f, { recursive: true });
console.log("site pronto em dist/");
