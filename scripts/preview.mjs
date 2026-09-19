// Gera dist/prova.html: a versão paginada (Paged.js já executado), estática, sem JS.
import { chromium } from "playwright-core";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync, existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const [, , inputName = "print.html", outputName = "prova.html", title = "Prova de diagramação · A4 · aponte página + trecho para pedir correções"] = process.argv;
const executablePath = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/usr/bin/chromium", "/usr/bin/google-chrome"].filter(Boolean).find(p => existsSync(p));
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.goto(pathToFileURL(join(dist, inputName)).href, { waitUntil: "load" });
await page.waitForFunction(() => window.__pagedDone === true, null, { timeout: 180000 });
await page.waitForTimeout(300);
const html = await page.evaluate((title) => {
  document.querySelectorAll("script").forEach(s => s.remove());
  // Regras inseridas via CSSOM pelo Paged.js (target-counter, string-set, contadores) não aparecem no HTML:
  // serializa todas as folhas de estilo em um único <style>.
  const css = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try { for (const r of Array.from(sheet.cssRules)) css.push(r.cssText); } catch (e) {}
  }
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
  const all = document.createElement("style");
  all.textContent = css.join("\n");
  document.head.appendChild(all);
  const extra = document.createElement("style");
  extra.textContent = `
    html { background:#e9e4ec; }
    body { margin: 0; padding: 12px 0 40px; }
    .pagedjs_pages { display:flex; flex-direction:column; align-items:center; gap:14px; }
    .pagedjs_page { background:#fff; box-shadow:0 4px 18px rgba(43,27,51,.18); }
    .prova-bar { position: sticky; top: 0; z-index: 5; background:#2b1b33; color:#ece2f1; font: 13px/1.4 Inter, system-ui, sans-serif; padding: 10px 16px; margin: -12px 0 14px; text-align:center; }
    @media (max-width: 860px) { .pagedjs_pages { transform-origin: top center; transform: scale(.48); margin-bottom: -52%; } }
  `;
  document.head.appendChild(extra);
  const bar = document.createElement("div");
  bar.className = "prova-bar";
  bar.textContent = title;
  document.body.prepend(bar);
  return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
}, title);
await browser.close();
writeFileSync(join(dist, outputName), html);
console.log(`prova ok: ${(html.length / 1024).toFixed(0)} KB → dist/${outputName}`);
