import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { marked } from 'marked';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const reportSource = resolve(repoRoot, 'reports/relatorio.md');
const reportOutput = resolve(repoRoot, 'reports/relatorio.pdf');
const reportHtml = resolve(tmpdir(), `nexo-store-report-${process.pid}.html`);
const markdown = await readFile(reportSource, 'utf8');

function mimeFor(path) {
  const extension = extname(path).toLowerCase();
  return extension === '.png' ? 'image/png' : extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
}

const markdownWithEmbeddedImages = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, source) => {
  if (source.startsWith('data:') || source.startsWith('http://') || source.startsWith('https://')) return _match;
  const imagePath = resolve(dirname(reportSource), source);
  if (!existsSync(imagePath)) return _match;
  const data = readFileSync(imagePath).toString('base64');
  return `![${alt}](data:${mimeFor(imagePath)};base64,${data})`;
});

const renderedMarkdown = await marked.parse(markdownWithEmbeddedImages, { gfm: true, breaks: false });
const externalizedLinks = renderedMarkdown.replace(/href="\.\.\/(docs|evidence|README\.md)([^\"]*)"/g, (_match, area, suffix) => {
  const target = area === 'README.md' ? 'README.md' : `${area}/${suffix.replace(/^\//, '')}`;
  return `href="https://github.com/Eroshla/Projeto-teste-de-software/blob/fix/academic-compliance/${target}"`;
});
const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Relatório de Testes de Software — Nexo Store</title>
<style>
@page { size: A4; margin: 18mm 16mm 19mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #172033; line-height: 1.45; font-size: 10.5pt; }
h1 { font-size: 22pt; color: #342a8c; margin: 18pt 0 9pt; page-break-before: auto; }
h2 { font-size: 16pt; color: #493cb0; margin: 18pt 0 7pt; }
h3 { font-size: 12.5pt; color: #342a8c; margin: 13pt 0 5pt; }
p { margin: 6pt 0; }
a { color: #4338a8; text-decoration: underline; }
ul, ol { margin: 5pt 0 8pt 18pt; padding-left: 12pt; }
li { margin: 3pt 0; }
table { border-collapse: collapse; width: 100%; margin: 9pt 0 13pt; font-size: 8.5pt; page-break-inside: auto; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th { background: #e9e7fb; color: #26205e; font-weight: 700; }
th, td { border: 0.5pt solid #b9b6d0; padding: 5pt 6pt; vertical-align: top; }
pre { background: #202631; color: #e5edf7; padding: 9pt; border-radius: 4pt; white-space: pre-wrap; font: 8pt 'Courier New', monospace; }
code { font-family: 'Courier New', monospace; background: #f0eef8; padding: 1pt 2pt; }
img { display: block; max-width: 100%; height: auto; margin: 5pt auto 2pt; border: 0.5pt solid #d4d1e5; page-break-inside: avoid; }
p:has(> img) { page-break-inside: avoid; }
.cover { height: 245mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-after: always; }
.cover .institution { font-size: 14pt; font-weight: 700; letter-spacing: .02em; }
.cover h1 { font-size: 28pt; margin: 35pt 0 16pt; }
.cover .subtitle { font-size: 14pt; color: #555b70; }
.cover .meta { margin-top: 75pt; font-size: 11pt; line-height: 1.75; }
.toc { page-break-after: always; }
.toc h1 { margin-top: 0; }
.figure-caption { text-align: center; color: #5e6474; font-size: 8.5pt; margin: 1pt 0 12pt; }
blockquote { border-left: 3pt solid #5b4bdb; margin: 8pt 0; padding: 4pt 10pt; color: #555b70; }
</style></head>
<body>
<section class="cover"><div class="institution">INSTITUTO FEDERAL DO PARANÁ — CAMPUS PINHAIS</div><h1>Relatório de Testes de Software</h1><div class="subtitle">Nexo Store — e-commerce acadêmico com cupons</div><div class="meta"><strong>Aluno:</strong> Eros Henrique<br><strong>Disciplina:</strong> Testes de Software<br><strong>Professor:</strong> Gerson Peres<br><strong>Entrega:</strong> 08/10/2026</div></section>
<section class="toc"><h1>Sumário</h1><p>O relatório apresenta a arquitetura, regras de negócio, plano de testes, casos formais, automação, evidências, defeitos controlados e análise crítica.</p><ol><li>Introdução, objetivos e justificativa</li><li>Descrição do sistema</li><li>Arquitetura e regras de negócio</li><li>Conceitos de Testes de Software</li><li>Plano de teste</li><li>Particionamento, valores-limite e tabela de decisão</li><li>Casos formais de teste</li><li>Estratégia de automação</li><li>Evidências unitárias e de integração</li><li>Ciclos TDD retrospectivos</li><li>Execução reproduzida</li><li>Defeitos controlados</li><li>Ferramentas</li><li>Análise crítica, limitações e melhorias</li><li>Conclusão</li><li>Referências e artefatos</li></ol></section>
${externalizedLinks}
</body></html>`;
await writeFile(reportHtml, html, 'utf8');
await mkdir(dirname(reportOutput), { recursive: true });

function runFallback() {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('python3', [resolve(scriptDir, 'report-pdf-fallback.py'), reportHtml, reportOutput], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.stdout.pipe(process.stdout);
    child.on('error', rejectPromise);
    child.on('close', code => code === 0 ? resolvePromise() : rejectPromise(new Error(stderr || `fallback exited with ${code}`)));
  });
}

try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: reportOutput,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#687080">Nexo Store — Testes de Software · Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
    margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
  });
  await browser.close();
  console.log('PDF gerado em reports/relatorio.pdf (renderer Playwright).');
} catch (error) {
  console.warn(`Chromium indisponível; usando renderer ReportLab fallback: ${error.message}`);
  await runFallback();
  console.log('PDF gerado em reports/relatorio.pdf (renderer ReportLab fallback).');
}
