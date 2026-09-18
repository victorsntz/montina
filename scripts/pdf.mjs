// Renderiza dist/print.html com Chromium (Playwright) → dist/cartilha-lupus-df-a4.pdf
import { chromium } from "playwright-core";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, statSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const out = join(dist, "cartilha-lupus-df-a4.pdf");

const candidates = [
  process.env.CHROMIUM_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean);
const executablePath = candidates.find(p => existsSync(p));

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--allow-file-access-from-files", "--font-render-hinting=none"] });
const page = await browser.newPage();
page.on("console", msg => { if (msg.type() === "error") console.error("[page]", msg.text()); });
await page.goto(pathToFileURL(join(dist, "print.html")).href, { waitUntil: "load" });
// aguarda o Paged.js terminar de paginar
await page.waitForFunction(() => window.__pagedDone === true, null, { timeout: 180000 });
await page.waitForTimeout(500);
await page.evaluate(() => document.fonts.ready);
const pages = await page.evaluate(() => document.querySelectorAll(".pagedjs_page").length);
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
await browser.close();
console.log(`pdf ok: ${pages} páginas → ${out} (${(statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
