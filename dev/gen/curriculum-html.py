# Generates dev/curriculum-v5.html from dev/CURRICULUM_V5.md + the hand-written FN/LAY tables below.
import re, html, json
src=open('dev/CURRICULUM_V5.md').read()
chap_re=re.compile(r'(?m)^## Chapter (\d+) · ([^\n—]+) — ([^\n]+)$')
chapters=[(m.group(1),m.group(2).strip(),m.group(3).strip(),m.start()) for m in chap_re.finditer(src)]
end=src.find('\n## 9 ·')
blocks={}
for i,(n,name,sub,st) in enumerate(chapters):
    en = chapters[i+1][3] if i+1<len(chapters) else end
    body=src[st:en]
    for m in re.finditer(r'(?ms)^### (\d+\.\d+) ([^\n]+)\n(.*?)(?=^### |\Z)', body):
        blocks[m.group(1)]=(m.group(2).strip(), m.group(3))
def field(b, name):
    m=re.search(r'\*\*'+re.escape(name)+r'\.?\*\*\s*(.*?)(?=\n- \*\*|\n- \*|\n\n|\Z)', b, re.S)
    return re.sub(r'\s+',' ',m.group(1)).strip() if m else ''
def star(b):
    m=re.search(r'\*\*☆\*\*\s*(.*?)(?=\n- |\n\n|\Z)', b, re.S); return re.sub(r'\s+',' ',m.group(1)).strip() if m else ''
def steps(b):
    s=field(b,'Steps')
    if not s: return []
    parts=re.split(r'\s(?=\d+ )', ' '+s)
    out=[]
    for p in parts:
        p=p.strip(); m=re.match(r'(\d+)\s+(.*)', p)
        if m: out.append(m.group(2).rstrip('.'))
    return out
# functions/keys tested + plain-English layout, per drill
FN={
'1.1':['Ctrl+arrow','Shift+arrow','Ctrl+Shift+arrow','Ctrl+Space','Shift+Space','Ctrl+A','F5 → Special','Ctrl+C / Ctrl+V','Ctrl+S'],
'1.2':['F2','Delete','Ctrl+Z / Ctrl+Y','Ctrl+X / Ctrl+V','Ctrl++ / Ctrl+−','Shift+Space','Alt+Shift+→ (group)','Ctrl+D'],
'1.3':['= formulas','SUM','Alt+= (AutoSum)','F4 anchors','Ctrl+R / Ctrl+D','minus signs on costs'],
'1.4':['Alt H K (comma)','Ctrl+Shift+%','Alt H F C (font colour)','Alt H B P (top border)','Alt H O I (autofit)','F5 → Special → Constants'],
'1.5':['F5 (Go To)','F5 → Special → Blanks / Constants / Formulas','Ctrl+F','Ctrl+Enter','Ctrl+Home / Ctrl+End','the name box'],
'1.6':['Ctrl+Alt+V (Paste Special)','values','formats','transpose','multiply / divide','add'],
'1.7':['Ctrl+D','Ctrl+R','Alt H F I S (fill series)','Ctrl+Enter','Ctrl+; (today)','Alt+Enter'],
'1.8':['everything in chapter 1','#REF! repair','Ctrl+Home'],
'2.1':['Ctrl+B','Ctrl+I','Alt H F C','TODAY()'],
'2.2':['Alt H 9 / Alt H 0 (decimals)','Alt H K','Ctrl+Shift+$','Alt H A N (accounting)','Ctrl+1'],
'2.3':['Ctrl+1 → Custom','0.0x','Mmm-yy','#,##0;(#,##0)','superscript','Ctrl+1 → Center across selection'],
'2.4':['Alt H B P (top)','Alt H B O (bottom)','Alt H B S (outside)','Alt H B T (thick)','Alt H B D (double)','H B S vs H B A'],
'2.5':['Alt H A L / C / R','Alt H 6 / 5 (indent)','Alt H W (wrap)','Alt H O I (autofit)','Alt H O W (width)','####'],
'2.6':['Alt H L (conditional formatting)','highlight rules','top-N','data bars','clear rules'],
'2.7':['Ctrl+B','Alt H F C','Alt H K','Ctrl+Shift+%','Alt H B P','Alt H O W','Ctrl+1','F5 → Special'],
'3.1':['F4 (cycle $A$1 / A$1 / $A1)','Ctrl+D','Ctrl+R','Ctrl+Shift+$','Alt H B S'],
'3.2':['point mode (arrow keys inside =)','yellow assumption cells','Ctrl+R','Ctrl+Enter','Alt H F C'],
'3.3':['margin ÷','growth ÷ − 1','^(1/n) CAGR','Ctrl+Shift+%','Alt H 9','Ctrl+B'],
'3.4':['Alt+= (AutoSum)','SUM across / down','the corner total','tie check = 0','Alt H B P'],
'3.5':['Ctrl+F3 (Name Manager)','the name box','=Revenue*Margin','F3 (paste name)'],
'3.6':['IF','AND','OR','Alt H F C (red)','COUNTIF'],
'3.7':['SUMIF','COUNTIF','anchored range ($)','Ctrl+D','Ctrl+Shift+%'],
'3.8':['TRIM','PROPER','UPPER / LOWER','helper column','paste values','delete column'],
'3.9':['LEFT','RIGHT','MID','FIND / SEARCH','LEN','Alt A E (text to columns)'],
'3.10':['& (ampersand)','CONCAT','TEXTJOIN','TEXT()','VLOOKUP / XLOOKUP on the key'],
'3.11':['TODAY','EDATE','EOMONTH','DATEDIF','NETWORKDAYS','Mmm-yy format','IF on a date'],
'3.12':['point mode','Alt+=','anchored %','growth','SUMIF','format as you go'],
'4.1':['Shift+Space / Ctrl+−','Ctrl+Shift+↓','Alt A S D (sort)','Alt A S S (sort dialog, two keys)','Alt+=','Ctrl+B'],
'4.2':['Ctrl+Shift+L (AutoFilter)','Alt+↓ (picker)','filtered SUBTOTAL','Alt A C (clear)'],
'4.3':['Alt A M (remove duplicates)','Alt A E (text to columns)','COUNTA'],
'4.4':['Ctrl+9 / Ctrl+0 (hide)','Ctrl+Shift+9 / 0 (unhide)','Alt+Shift+→ (group)','Alt+Shift+← (ungroup)','outline levels 1/2'],
'4.5':['VLOOKUP','INDEX','MATCH','XLOOKUP','Alt H F C (green links)'],
'4.6':['INDEX(range, MATCH, MATCH)','anchored ranges','Alt H B P'],
'4.7':['SUMIFS','mixed anchors ($B3, C$2)','Ctrl+R / Ctrl+D','Alt H B S','reconciliation check'],
'4.8':['MAXIFS','MINIFS','AVERAGEIFS','Ctrl+R'],
'4.9':['VLOOKUP / XLOOKUP','difference column','SUM to zero','Ctrl+C / Ctrl+V'],
'4.10':['Ctrl+T (table)','total row','structured references [@Amount]','auto-expanding ranges'],
'4.11':['Alt N V (pivot)','field list by keyboard','rows / columns / values','Alt+F5 (refresh)'],
'4.12':['Alt A V V (data validation)','list source','date rule','error alert'],
'4.13':['F5 → Special → Blanks','Ctrl+−','Alt A S D','XLOOKUP','SUMIFS','Alt+Shift+→'],
'5.1':['MIN','MAX','IFS','SWITCH','Alt+='],
'5.2':['IFERROR','IFNA','VLOOKUP repair','Ctrl+D'],
'5.3':['#REF!','#DIV/0!','#VALUE!','SUM rebuild','IF guard','F2'],
'5.4':['CHOOSE','INDEX on a case cell','Ctrl+Alt+V values','F4'],
'5.5':['F5 → Special → Constants / Formulas','Ctrl+` (show formulas)','Alt H F C (audit colours)','F2'],
'5.6':['Alt M P (trace precedents)','Alt M D (trace dependents)','F9 (evaluate a selection)','Ctrl+[ (go to precedent)','F5 (back)'],
'5.7':['re-point references','Alt H F C (green)','Delete','Ctrl+R'],
'5.8':['check row = assets − L&E','SUM','F2','re-point','Ctrl+R'],
'5.9':['Ctrl+H (replace all)','F2','Alt H F C (blue)','Ctrl+R'],
'5.10':['everything in chapter 5','error meter (7 planted)','F5 → Special'],
'6.1':['MEDIAN','AVERAGE','MAX / MIN','unlever / relever formulas','F4','Ctrl+D'],
'6.2':['^ (exponent)','1/(1+r)^n','SUMPRODUCT','Ctrl+R','F4'],
'6.3':['NPV','IRR','PMT','cumulative cash (payback)','IF','Ctrl+Shift+%'],
'6.4':['mixed anchors','Ctrl+R / Ctrl+D','Alt A W T (data table)','Alt H K','Alt H B S'],
'6.5':['Alt A W G (goal seek)','set cell / to value / by changing'],
'6.6':['÷ multiples','Ctrl+Enter over a block','MEDIAN / MAX / MIN','Ctrl+1 → 0.0x'],
'6.7':['Ctrl+C / Ctrl+V a block','accretion ÷ − 1','Ctrl+Shift+%','Ctrl+Shift+↓'],
'6.8':['lever formulas','SUM','share ÷ anchored total','check = 0','Ctrl+D'],
'6.9':['references (never retype)','MIN / MAX floor and ceiling','Ctrl+Enter','Alt H B S'],
'7.1':['opening = prior closing','closing = opening + adds − subs','interest × beginning balance','Ctrl+R','Alt H F C (green)'],
'7.2':['corkscrew','depreciation ÷ life','accumulated memo','Ctrl+R'],
'7.3':['beginning-balance interest','MIN / MAX coverage','Ctrl+R','Ctrl+B'],
'7.4':['MAX(0, …) draw','MIN(…) sweep','Ctrl+R'],
'7.5':['MIN cascade','roll-forwards','check: applied = repaid','copy senior → junior'],
'7.6':['ratio lines','headroom MIN / MAX','IF pass / breach','MIN over quarters','Alt H F C (red)','F5 → Special'],
'7.7':['date + 7','Ctrl+R','Alt+=','opening → closing roll','cushion line'],
'7.8':['everything in chapter 7','three facilities × four years','zero check'],
'8.1':['units × price','cost ratios','Alt+=','linked depreciation','margin memo','Ctrl+R'],
'8.2':['days drivers','× / 365','SUM','change line','Ctrl+R'],
'8.3':['cross-block references','cash link','retained earnings roll','check row','Ctrl+R'],
'8.4':['two rolls','beginning-balance interest','SUM','copy term loan → revolver'],
'8.5':['EV / net debt / equity','MOIC','IRR','IRR by hand as a check'],
'8.6':['= references to outputs','Ctrl+Enter','Alt H K / Ctrl+Shift+%','& title from a cell'],
'8.7':['Ctrl+Alt+V values + formats','Alt H F C (blue)','Ctrl+H','Alt+Shift+→','F5 → Special → Formulas','Alt W F F (freeze)'],
'8.8':['Shift+F11 (new sheet)','Alt H O R (rename)','Ctrl+PgUp / PgDn','Sheet2!A1 references'],
'8.9':['Ctrl+1 → Protection (unlock)','Alt R P S (protect sheet)','Alt P R S (print area)','Alt P S C (fit to page)'],
'8.10':['everything in chapter 8','drivers → statements → cash link → zero check','values hand-off'],
}
LAY={
'1.1':'A 20-row grid: a walled corridor snakes from the top-left corner to a sales table (eight regions by four quarters plus a full year) parked in the far corner. A marked home bay sits at A1.',
'1.2':'A headcount roster on the left, three cargo blocks with marked destination bays on the right, and a small quarterly schedule underneath with a quarter and a line missing.',
'1.3':'A department budget: five cost lines by four quarters, a total row and a margin row stripped out, and an empty share-of-total block beside it.',
'1.4':'The same department budget, correct but unformatted: bare black numbers, no borders, a squeezed label column.',
'1.5':'A 300-row vendor cost list: vendor, code, cost. Blanks scattered in the cost column, three codes that changed, one formula hiding among typed values. A summary block far below.',
'1.6':'Left: a fee deck that arrived sideways plus a row in thousands and a row of positive costs. Right: the empty target table and a finished block to copy the look from.',
'1.7':'A long-range plan frame: two years typed in the header, a reference column that stops after two numbers, a formula row, and a monthly calendar strip needing twelve month labels.',
'1.8':'A quarterly P&L with four broken subtotals and two empty margin rows.',
'2.1':'A one-page coverage memo: a header row, six body lines, three notes, a date cell.',
'2.2':'A trading comps page: five peers down, three dollar columns, a multiple column and a margin column across, a median row at the bottom.',
'2.3':'A valuation summary: a multiples column, a date column, a body with negatives, a footnote, a title sitting in one cell.',
'2.4':'Left: a finished schedule with four wrong rulings planted. Right: a raw block with headers, a body and a grand total, no borders at all.',
'2.5':'A regional revenue print page: two label columns, four quarter columns, a total column, headers and sub-lines.',
'2.6':'A budget-vs-actual by department: budget, actual, variance and variance-percent columns, twenty lines.',
'2.7':'A raw P&L fragment: title, period headers, revenue and cost lines, two subtotals, a multiple line, no formatting.',
'3.1':'A 3×3 pricing grid: three tiers down the side, three price points across the top, nine empty cells.',
'3.2':'A five-year operating plan: one year of revenue typed, four empty years, yellow assumption cells above for growth, margin and D&A.',
'3.3':'A peer coverage page: eight peers down; revenue for two years, EBITDA and EV across; three empty ratio columns.',
'3.4':'A segment pack: six segments by four quarters with the totals row, totals column and corner all missing; one tie-check cell.',
'3.5':'A driver block (tax rate, growth) and a five-year build below that refers to it by cell address.',
'3.6':'A budget-vs-actual: twenty lines with budget and actual, an empty variance column, an empty flag column, a tolerance cell.',
'3.7':'A raw booking ledger (date, segment, amount, forty lines) and an empty summary block: segment, total, count, share.',
'3.8':'An HR export: employee code, name, department; codes with trailing spaces, names in capitals; two spare helper columns.',
'3.9':'A contact list: a "LAST, first" name column, a product code column, a full-address column, empty target columns beside each.',
'3.10':'A roster with first name, last name, region and product columns, an empty email column, an empty key column, and a second list to match against.',
'3.11':'A contract list: customer, start date, term in months; empty renewal, month-end, months-remaining and business-days columns; a flag column.',
'3.12':'One quarterly P&L page: revenue and cost lines by quarter, empty totals, margins, growth and a segment memo.',
'4.1':'A deal-blotter export: ten rows of deals with a repeated header, a page-break line, a stale subtotal and a duplicate mixed in; a late deal staged below.',
'4.2':'A coverage pipeline list: deal, sector, status, size, forty lines; two question cards to the right.',
'4.3':'A mailing list with duplicate rows and a combined "city, state" column; a count cell.',
'4.4':'A regional tape: three regions, three detail rows each, a consolidated line; detail rows hidden, one column hidden.',
'4.5':'A peer table (eight peers by six metrics) and a three-line pitch screen that reads one metric by name; the table re-orders its columns between steps.',
'4.6':'A five-segment by five-quarter reporting tape and two read cards naming a segment and a quarter.',
'4.7':'A one-line-per-booking ledger on the left; an empty segment-by-region cross-tab on the right with a reconciliation cell.',
'4.8':'The coverage pipeline list with three question cards: largest in a sector, smallest at a status, average tenure.',
'4.9':'Two lists side by side: the deal blotter and the finance extract; empty "in finance" and difference columns; a total cell.',
'4.10':'A plain transaction list (date, vendor, category, amount) with no total row.',
'4.11':'The booking ledger and an empty area to the right where the pivot lands.',
'4.12':'A project tracker: task, owner, status, due date; the status column accepts anything.',
'4.13':'A dirty data-room export: junk rows, unsorted deals, a sector lookup table to the side, an empty summary block.',
'5.1':'A bonus schedule: name, grade, formula bonus, pool cap, empty paid and clawback columns.',
'5.2':'A board pack panel with five lookup reads into a tape; three reads show #N/A.',
'5.3':'A segment tab: a costs block whose total rows were deleted, a share line dividing by zero, a text value where a number belongs; eight red cells downstream.',
'5.4':'A case block (three columns of growth and margin), a case-number cell, a live driver row, an output table to snapshot.',
'5.5':'A divisional operating review: revenue and cost lines with typed-over cells, a total that stops short, a margin pointing at the wrong row, a check line reading non-zero.',
'5.6':'One wrong output cell at the bottom, five chained formulas above it, one of them wrong.',
'5.7':'An assumptions page with v1 figures in one column and re-issued v2 figures beside them; a build below still pointing at v1.',
'5.8':'A four-year balance sheet, both sides, with zeros pasted over the check row.',
'5.9':'A five-year build with growth and cost rates typed inside its formulas; version tags reading v1 in every header.',
'5.10':'An inherited one-tab model with seven planted errors and a seven-segment meter on the checklist.',
'6.1':'A five-comparable beta set (beta, debt, equity, tax) and an empty WACC block below.',
'6.2':'A five-year free cash flow line, a discount rate cell, empty discount-factor and present-value rows, a terminal value block.',
'6.3':'A capex proposal: an initial outlay, five years of cash flow, a hurdle-rate cell, an empty decision box (NPV, IRR, payback, monthly payment, verdict).',
'6.4':'A 5×3 two-way grid (growth across, margin down) with the corner empty, and a second identical grid for the data-table route.',
'6.5':'A small model with a price input, an NPV output, a growth input and an EBITDA output; two target cells.',
'6.6':'A five-peer trading comps table: EV, revenue, EBITDA; an empty multiples block; median, high and low rows; an implied-price box.',
'6.7':'Three financing structures side by side (all cash, mixed, all stock); the first has its lines built, the other two are empty.',
'6.8':'An entry and exit block for a deal, three empty lever lines, a total, a share column and a check cell.',
'6.9':'A one-page valuation summary: four methods down, low / mid / high across, floor and ceiling cells, a premium column.',
'7.1':'One balance line across five years: opening, additions, reductions, closing, and an interest line that currently points at the closing balance.',
'7.2':'A capex plan row above an empty fixed-asset schedule: opening, capex, depreciation, closing, accumulated depreciation memo.',
'7.3':'A term-loan block: beginning debt, repayment, ending debt, cash interest, EBITDA, coverage; a cap and a floor cell.',
'7.4':'A revolver page: opening balance, cash before revolver, minimum cash, empty draw, sweep, ending balance and post-revolver cash lines.',
'7.5':'Two tranches (senior, junior) across three years: cash available, empty paydown and roll-forward lines for each, a check cell.',
'7.6':'A covenant compliance table: two leverage tests by eight quarters, one test finished, the other empty, a tightest-quarter cell.',
'7.7':'A 13-week cash roll: receipts and disbursement lines by week, week headers missing after week one, opening and closing cash rows.',
'7.8':'Three facilities across four years with seniority, interest and roll-forwards, and a zero check at the bottom.',
'8.1':'A projection page: the actual year in, a driver panel (units, price, cost ratios) set, five forecast years empty, depreciation linked from elsewhere.',
'8.2':'A working-capital schedule: revenue and COGS lines, days assumptions in yellow, empty receivables, inventory, payables, NWC and change lines.',
'8.3':'Three statements side by side (income, cash flow, balance sheet) for three years, none wired to the others, a check row.',
'8.4':'A debt block: term loan and revolver rolls across five years, two rate cells, interest lines, totals.',
'8.5':'A paper LBO page: entry and exit columns, EBITDA and multiple inputs, empty EV, net debt, equity, MOIC and IRR lines.',
'8.6':'An IC pack cover: six headline metrics by two cases, a title cell, a deal-name cell to build the title from.',
'8.7':'A finished outputs page carrying live formulas and the project codename, a detail band below it, a header row.',
'8.8':'A single-sheet model with the inputs block mixed into the build; a second sheet to create and move them to.',
'8.9':'A finished one-page model with yellow input cells, ready to lock and print.',
'8.10':'A mini three-statement model with a driver panel and a headline box; a blank hand-off page beside it.',
}
def keycap_html(items):
    out=[]
    for it in items:
        cls='fn'
        if re.match(r'^(Ctrl|Alt|Shift|F\d|Delete|=|the name box|point mode)', it) or '+' in it and not it.isupper(): cls='key'
        out.append(f'<span class="{cls}">{html.escape(it)}</span>')
    return ''.join(out)
CH_INTRO={
'1':'The four tutorials open the guide panel by default and hold the player\'s hand. Then three drills on the hand skills every later chapter assumes, and the capstone.',
'2':'The wardrobe, one garment per drill: what to bold, how many decimals, where the borders go, what the dialog can do.',
'3':'Live calculations: anchors, pointing, ratios, totals, the first logic, the first conditional sums, and the text and date functions a professional uses weekly.',
'4':'The corporate-day chapter: cleaning an export, sorting and filtering it, reading one table into another, and summarising a ledger with formulas, tables or a pivot.',
'5':'Making a page decide and not break: caps and floors, error handling, scenario switches, and the audit skills for someone else\'s file.',
'6':'Valuation mechanics, one Excel move per drill: statistics, discounting, NPV and IRR, sensitivity, goal seek, multiples.',
'7':'Credit, and the roll-forward as a pattern: every schedule is opening plus adds minus subs equals closing.',
'8':'Assembling and shipping a page: statements, schedules, a cover, the hand-off, sheets, protection and print.',
}
free={'1','2','3','4'}
cards=[]; toc=[]; total=0
for n,name,sub,_ in chapters:
    keys=[k for k in blocks if k.split('.')[0]==n]
    keys.sort(key=lambda k:int(k.split('.')[1]))
    tier='FREE' if n in free else 'PRO'
    toc.append(f'<a href="#ch{n}"><b>{n}</b> {html.escape(name)} <i>{len(keys)}</i></a>')
    cards.append(f'<section class="chapter" id="ch{n}"><header class="ch-head"><div class="ch-num">Chapter {n}</div><h2>{html.escape(name)}</h2><span class="tier {tier.lower()}">{tier}</span><p>{html.escape(CH_INTRO[n])}</p></header>')
    for k in keys:
        title,b=blocks[k]; total+=1
        tag=''
        if 'tutorial' in title: tag='<span class="tag">tutorial</span>'
        if '★' in title: tag='<span class="tag cap">capstone</span>'
        clean_title=re.sub(r'\s*\*\(.*?\)\*|★|`\[engine[^\]]*\]`','',title).strip()
        eng = ' <span class="tag eng">needs engine work</span>' if '[engine' in title or '[engine' in b else ''
        why=field(b,'Why'); taught=field(b,'Taught'); gam=field(b,'Gamified'); st=steps(b); sr=star(b)
        gtxt = gam or (f'{len(st)} outcomes in two or three steps; each lights on the finished state, never on a keypress.' if st else 'Chains everything the chapter taught into one page; one clean run opens the next chapter\'s milestone.')
        gam_html = f'<p>{html.escape(gtxt)}</p>'
        if taught: gam_html += f'<p><b>Taught.</b> {html.escape(taught)}</p>'
        if sr: gam_html += f'<p class="star">★ <b>The pro move:</b> {html.escape(sr)}</p>'
        steps_html = '<ol>'+''.join(f'<li>{html.escape(s)}</li>' for s in st)+'</ol>' if st else ''
        steps_dd = ('<dt>The player&#8217;s steps</dt><dd>'+steps_html+'</dd>') if steps_html else ''
        why_p = ('<p class="why">'+html.escape(why)+'</p>') if why else ''
        cards.append(f'''<article class="drill" id="d{k.replace('.','-')}">
<div class="d-head"><span class="d-num">{k}</span><h3>{html.escape(clean_title)}</h3>{tag}{eng}</div>
{why_p}
<dl>
<dt>Functions &amp; keys tested</dt><dd class="fns">{keycap_html(FN[k])}</dd>
<dt>What is on the grid</dt><dd>{html.escape(LAY[k])}</dd>
<dt>How it is gamified</dt><dd>{gam_html}</dd>
{steps_dd}
</dl></article>''')
    cards.append('</section>')
page=f'''<title>hotkey.gg Curriculum v5</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:#f5f4ef;--surface:#fffdf8;--ink:#1c1f23;--muted:#5d646d;--line:#d9d6cc;--accent:#158f52;--accent-ink:#0e6b3c;--key-bg:#ffffff;--key-line:#c7ccd2;--fn-bg:#e8f5ec;--pro:#8a5a12;--pro-bg:#fbf1df;--star:#a8730d;--eng:#7a4b9c;--eng-bg:#f1e9f7;}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#16181c;--surface:#1e2126;--ink:#e8e6df;--muted:#a3a8b0;--line:#33383f;--accent:#3fbf7a;--accent-ink:#7bd9a3;--key-bg:#262a30;--key-line:#464c55;--fn-bg:#1f3a2b;--pro:#e0b26a;--pro-bg:#3a2f1c;--star:#e2b660;--eng:#c9a6e6;--eng-bg:#31263c;}}}}
:root[data-theme="dark"]{{--bg:#16181c;--surface:#1e2126;--ink:#e8e6df;--muted:#a3a8b0;--line:#33383f;--accent:#3fbf7a;--accent-ink:#7bd9a3;--key-bg:#262a30;--key-line:#464c55;--fn-bg:#1f3a2b;--pro:#e0b26a;--pro-bg:#3a2f1c;--star:#e2b660;--eng:#c9a6e6;--eng-bg:#31263c;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:15px;line-height:1.55}}
a{{color:var(--accent-ink)}}
.wrap{{display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px;max-width:1180px;margin:0 auto;padding:36px 24px 80px}}
@media (max-width:860px){{.wrap{{grid-template-columns:1fr}} nav.toc{{position:static}}}}
nav.toc{{position:sticky;top:24px;align-self:start;display:flex;flex-direction:column;gap:2px;font-size:13.5px}}
nav.toc a{{display:flex;gap:8px;align-items:baseline;padding:6px 8px;border-radius:4px;color:var(--ink);text-decoration:none}}
nav.toc a:hover,nav.toc a:focus-visible{{background:var(--surface);outline:none}}
nav.toc a b{{font-family:"JetBrains Mono",monospace;color:var(--accent-ink);font-weight:500;width:14px}}
nav.toc a i{{margin-left:auto;font-style:normal;color:var(--muted);font-family:"JetBrains Mono",monospace;font-size:12px}}
nav.toc .legend{{margin-top:14px;padding-top:12px;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px;line-height:1.5}}
header.top{{grid-column:1/-1;border-bottom:2px solid var(--ink);padding-bottom:18px;margin-bottom:8px}}
header.top .eyebrow{{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink)}}
header.top h1{{font-family:"IBM Plex Serif",Georgia,serif;font-weight:600;font-size:34px;margin:6px 0 8px;text-wrap:balance;line-height:1.15}}
header.top p{{max-width:68ch;margin:0;color:var(--muted)}}
.stats{{display:flex;flex-wrap:wrap;gap:18px;margin-top:14px;font-family:"JetBrains Mono",monospace;font-size:12.5px;color:var(--muted)}}
.stats b{{color:var(--ink);font-weight:500}}
main{{min-width:0}}
.chapter{{margin:0 0 44px}}
.ch-head{{display:grid;grid-template-columns:auto 1fr auto;gap:6px 14px;align-items:baseline;border-top:2px solid var(--ink);padding-top:14px;margin-bottom:18px}}
.ch-num{{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-ink)}}
.ch-head h2{{font-family:"IBM Plex Serif",Georgia,serif;font-weight:600;font-size:26px;margin:0;grid-column:2}}
.ch-head p{{grid-column:1/-1;margin:4px 0 0;max-width:72ch;color:var(--muted)}}
.tier{{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.1em;padding:3px 8px;border:1px solid var(--accent);color:var(--accent-ink);border-radius:3px;align-self:center}}
.tier.pro{{border-color:var(--pro);color:var(--pro);background:var(--pro-bg)}}
.drill{{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:18px 22px 14px;margin:0 0 14px}}
.d-head{{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin-bottom:6px}}
.d-num{{font-family:"JetBrains Mono",monospace;font-size:12.5px;color:var(--accent-ink);font-weight:500}}
.d-head h3{{margin:0;font-size:19px;font-weight:600}}
.tag{{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:3px;background:var(--fn-bg);color:var(--accent-ink)}}
.tag.cap{{background:var(--pro-bg);color:var(--pro)}}
.tag.eng{{background:var(--eng-bg);color:var(--eng)}}
.why{{margin:0 0 12px;color:var(--muted);max-width:72ch}}
dl{{display:grid;grid-template-columns:150px minmax(0,1fr);gap:8px 18px;margin:0}}
dt{{font-family:"JetBrains Mono",monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:4px}}
dd{{margin:0;max-width:72ch}}
dd p{{margin:0 0 6px}}
dd p:last-child{{margin-bottom:0}}
.fns{{display:flex;flex-wrap:wrap;gap:6px}}
.key,.fn{{font-family:"JetBrains Mono",monospace;font-size:12.5px;padding:2px 8px;border-radius:4px;white-space:nowrap}}
.key{{background:var(--key-bg);border:1px solid var(--key-line);box-shadow:0 1.5px 0 var(--key-line)}}
.fn{{background:var(--fn-bg);color:var(--accent-ink)}}
.star{{color:var(--star)}}
ol{{margin:0;padding-left:22px}}
ol li{{margin:2px 0}}
@media (max-width:640px){{dl{{grid-template-columns:1fr}} dt{{padding-top:6px}}}}
@media (prefers-reduced-motion:no-preference){{html{{scroll-behavior:smooth}}}}
</style>
<div class="wrap">
<header class="top"><div class="eyebrow">hotkey.gg · curriculum v5 · concept for review</div>
<h1>Every drill, in plain English</h1>
<p>Eight chapters, {total} drills. For each one: what it tests, what sits on the grid when the page opens, how the run is scored and rewarded, and the steps the player takes. Nothing here is built yet except drill 1.1; items marked <span class="tag eng">needs engine work</span> wait on the site's spreadsheet learning the feature first.</p>
<div class="stats"><span><b>{total}</b> drills</span><span><b>8</b> chapters</span><span><b>8</b> capstones</span><span>free: chapters 1–4 · PRO: chapters 5–8</span><span>charts excluded</span></div>
</header>
<nav class="toc">{''.join(toc)}<div class="legend"><span class="key">key</span> = a keyboard route &nbsp;·&nbsp; <span class="fn">FN</span> = a function or concept<br>★ the hidden pro move that earns the star</div></nav>
<main>{''.join(cards)}</main>
</div>
'''
open('dev/curriculum-v5.html','w').write(page)
print('drills', total, 'bytes', len(page))
