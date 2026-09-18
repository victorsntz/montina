import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await browser.newPage();
page.on("console", m => console.log("[console]", m.type(), m.text().slice(0,300)));
page.on("pageerror", e => console.log("[pageerror]", e.message.slice(0,500)));
await page.goto(pathToFileURL("/home/user/montina/dist/print.html").href, { waitUntil: "load" });
for (let i=0;i<20;i++){ await page.waitForTimeout(1000); const n = await page.evaluate(()=>({done: window.__pagedDone, pages: document.querySelectorAll(".pagedjs_page").length, hasPoly: !!window.PagedPolyfill})); console.log(i, JSON.stringify(n)); if(n.done) break; }
await browser.close();
