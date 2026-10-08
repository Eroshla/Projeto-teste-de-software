import base64
import io
import re
import sys
from pathlib import Path
from lxml import html as html_parser
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle

input_html = Path(sys.argv[1])
output_pdf = Path(sys.argv[2])
document = html_parser.fromstring(input_html.read_text(encoding='utf-8'))
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportH1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#342a8c'), spaceBefore=14, spaceAfter=7, keepWithNext=True))
styles.add(ParagraphStyle(name='ReportH2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#493cb0'), spaceBefore=12, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name='ReportH3', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=11.5, leading=14, textColor=colors.HexColor('#342a8c'), spaceBefore=9, spaceAfter=4, keepWithNext=True))
styles.add(ParagraphStyle(name='BodySmall', parent=styles['BodyText'], fontName='Helvetica', fontSize=8.5, leading=11, spaceAfter=5))
styles.add(ParagraphStyle(name='Caption', parent=styles['BodyText'], fontName='Helvetica-Oblique', fontSize=8, leading=10, textColor=colors.HexColor('#5e6474'), alignment=TA_CENTER, spaceAfter=9))
styles.add(ParagraphStyle(name='CoverInstitution', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=12, leading=15, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=24, leading=29, alignment=TA_CENTER, textColor=colors.HexColor('#342a8c'), spaceBefore=25, spaceAfter=12))
styles.add(ParagraphStyle(name='CoverSubtitle', parent=styles['BodyText'], fontSize=12, leading=15, alignment=TA_CENTER, textColor=colors.HexColor('#555b70')))
styles.add(ParagraphStyle(name='CoverMeta', parent=styles['BodyText'], fontSize=10, leading=16, alignment=TA_CENTER, spaceBefore=45))

def inline_markup(node):
    if isinstance(node, str):
        return node
    tag = node.tag if hasattr(node, 'tag') else ''
    text = (node.text or '')
    inner = text + ''.join(inline_markup(child) + (child.tail or '') for child in node)
    if tag == 'strong' or tag == 'b': return f'<b>{inner}</b>'
    if tag == 'em' or tag == 'i': return f'<i>{inner}</i>'
    if tag == 'code': return f'<font name="Courier">{inner}</font>'
    if tag == 'a': return f'<link href="{node.get("href", "")}"><u>{inner}</u></link>'
    if tag == 'br': return '<br/>'
    return inner

def safe_paragraph(node, style='BodySmall'):
    value = inline_markup(node)
    value = value.replace('&nbsp;', ' ')
    return Paragraph(value, styles[style])

def make_image(src):
    if not src.startswith('data:'): return None
    match = re.match(r'data:[^;]+;base64,(.*)', src, re.S)
    if not match: return None
    data = base64.b64decode(match.group(1))
    image = Image(io.BytesIO(data))
    max_width = 165 * mm
    max_height = 118 * mm
    scale = min(max_width / image.imageWidth, max_height / image.imageHeight, 1)
    image.drawWidth = image.imageWidth * scale
    image.drawHeight = image.imageHeight * scale
    return image

def add_table(node, story):
    rows=[]
    for tr in node.xpath('.//tr'):
        cells=[]
        for cell in tr.xpath('./th|./td'):
            cells.append(Paragraph(inline_markup(cell), styles['BodySmall']))
        if cells: rows.append(cells)
    if not rows: return
    columns=max(len(row) for row in rows)
    for row in rows: row.extend(['']*(columns-len(row)))
    table=Table(rows, repeatRows=1, hAlign='LEFT', colWidths=[165*mm/columns]*columns)
    table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e9e7fb')),
        ('TEXTCOLOR',(0,0),(-1,0),colors.HexColor('#26205e')),
        ('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#b9b6d0')),
        ('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)
    ]))
    story.append(table); story.append(Spacer(1,5))

def add_nodes(parent, story):
    for node in parent:
        tag=node.tag if hasattr(node,'tag') else ''
        if tag in ('h1','h2','h3'):
            story.append(safe_paragraph(node, {'h1':'ReportH1','h2':'ReportH2','h3':'ReportH3'}[tag]))
        elif tag == 'p':
            img_nodes=node.xpath('./img')
            if img_nodes:
                image=make_image(img_nodes[0].get('src',''))
                if image:
                    story.append(KeepTogether([image])); story.append(Spacer(1,3))
                if node.text and node.text.strip(): story.append(safe_paragraph(node))
            else:
                story.append(safe_paragraph(node))
        elif tag in ('ul','ol'):
            for index, li in enumerate(node.xpath('./li'), start=1):
                prefix=f'{index}. ' if tag == 'ol' else '• '
                story.append(Paragraph(prefix + inline_markup(li), styles['BodySmall']))
        elif tag == 'pre':
            story.append(Preformatted(node.text_content(), styles['Code']))
            story.append(Spacer(1,4))
        elif tag == 'table':
            add_table(node, story)
        elif tag == 'section' and 'cover' in (node.get('class') or ''):
            story.append(PageBreak())
        elif tag == 'section' and 'toc' in (node.get('class') or ''):
            add_nodes(node, story); story.append(PageBreak())
        elif tag in ('div','section','article','body'):
            add_nodes(node, story)
        elif tag == 'img':
            image=make_image(node.get('src',''))
            if image: story.append(KeepTogether([image])); story.append(Spacer(1,3))

def footer(canvas, doc):
    canvas.saveState(); canvas.setFont('Helvetica', 7.5); canvas.setFillColor(colors.HexColor('#687080'))
    canvas.drawCentredString(A4[0]/2, 9*mm, f'Nexo Store — Testes de Software · Página {doc.page}')
    canvas.restoreState()

story=[]
# Rebuild cover from known HTML nodes.
cover=document.xpath('//section[contains(@class,"cover")]')
if cover:
    c=cover[0]
    story.append(Spacer(1,55*mm)); story.append(Paragraph(c.xpath('string(.//div[contains(@class,"institution")])'), styles['CoverInstitution']))
    story.append(Paragraph(c.xpath('string(.//h1)'), styles['CoverTitle']))
    story.append(Paragraph(c.xpath('string(.//div[contains(@class,"subtitle")])'), styles['CoverSubtitle']))
    meta_node = c.xpath('.//div[contains(@class,"meta")]')[0]
    story.append(Paragraph(inline_markup(meta_node), styles['CoverMeta'])); story.append(PageBreak())
# Render TOC and main content, excluding cover.
for section in document.xpath('//section[contains(@class,"toc")]'):
    add_nodes(section, story)
main=document.xpath('//body')[0]
for node in main:
    if getattr(node,'tag','') in ('section',) and ('cover' in (node.get('class') or '') or 'toc' in (node.get('class') or '')): continue
    add_nodes([node], story)

doc=SimpleDocTemplate(str(output_pdf), pagesize=A4, rightMargin=16*mm, leftMargin=16*mm, topMargin=17*mm, bottomMargin=16*mm, title='Relatório de Testes de Software — Nexo Store', author='Eros Henrique')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
