import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const markdown = await readFile(new URL('../reports/relatorio.md', import.meta.url), 'utf8');
const html = markdown.replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^\*\*(.*?)\*\*$/gm,'<p><strong>$1</strong></p>').replace(/^\- (.*)$/gm,'<li>$1</li>').replace(/\n\n/g,'<p></p>');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
await page.setContent(`<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;line-height:1.55;color:#172033}h1{font-size:30px}h2{margin-top:28px;color:#493cb0}p{margin:10px 0}li{margin:4px 0}</style></head><body>${html}</body></html>`);
await page.pdf({path:fileURLToPath(new URL('../reports/relatorio.pdf', import.meta.url)),format:'A4',printBackground:true,margin:{top:'18mm',bottom:'18mm',left:'18mm',right:'18mm'}});
await browser.close();
console.log('PDF gerado em reports/relatorio.pdf');
