# CURRICULUM V5.1 — Phase A map layer: per-drill status, what it teaches / requires (tags), par estimate,
# and what it absorbs. Joined with curriculum_v51_data.py by `key`; emitted as dev/curriculum-v5.json.
# Tag vocabulary = v3's 53 tags + the v5 additions listed in NEW_TAGS. Teach-before-require is proven by
# `node dev/check-curriculum-map.js --v5` in catalog order.

NEW_TAGS = {
 'find/replace':'Ctrl+F / Ctrl+H, replace all', 'ctrl-enter':'fill a selection with one entry', 'series':'fill series (years, months, refs)',
 'transpose':'paste special transpose', 'paste-values':'values-only hand-off', 'paste-ops':'paste special multiply / divide / add',
 'custom-fmt(Ctrl+1)':'0.0x · Mmm-yy · (#,##0) · superscript · center across', 'width/wrap':'autofit, set width, wrap, ####',
 'conditional-fmt':'highlight / top-N / data bars rules', 'IF/AND/OR':'logic flags in words', 'IFS/SWITCH':'banded outcomes',
 'COUNTIF/AVERAGEIF':'conditional count and average', 'MAXIFS/MINIFS':'conditional extremes', 'text-fn':'TRIM PROPER LEFT RIGHT MID FIND LEN',
 'concat':'& · CONCAT · TEXTJOIN · TEXT()', 'text-to-columns':'Alt A E', 'date-fn':'EDATE EOMONTH DATEDIF NETWORKDAYS',
 'named-range':'name box, Ctrl+F3, F3', 'XLOOKUP':'XLOOKUP', 'remove-dupes':'Alt A M', 'table(Ctrl+T)':'Excel table + structured refs',
 'validation':'data validation lists and rules', 'pivot':'pivot table by keyboard', 'trace/evaluate':'precedents, dependents, F9',
 'NPV/IRR':'NPV IRR payback', 'PMT':'loan payment', 'data-table':'what-if data table', 'goal-seek':'goal seek',
 'stat-fn(MEDIAN/AVERAGE)':'MEDIAN AVERAGE MAX MIN', 'exponent':'^ discount factors and CAGR', 'freeze':'freeze panes',
 'sheets':'insert / rename / move between sheets, cross-sheet refs', 'protect/print':'unlock inputs, protect sheet, print area, fit to page',
 'subtotal-by-group':'group subtotals and the grand total from them', 'reconcile':'two-list reconciliation to zero',
}

# key: (status, par_s, absorbs, teaches, requires)
#  status ∈ built · keep · recut · new · capstone
M = {
 # ---- c1 Foundations
 'navigation': ('built', 90, [], ['move','jump(ctrl-arrow)','select','select-edge','row/col-select','goto-special','copy/paste','save'], []),
 'repairshop': ('new', 110, ['editfix','rowops','blocksel'], ['enter/edit(F2)','clear/delete','undo','redo','cut','insert/delete row-col','hide/unhide/group','fill(D/R)'], ['move','select','select-edge','row/col-select','copy/paste']),
 'powergrid':  ('new', 100, ['filldr'], ['sum(Alt=)','anchor($/F4)','sign-convention','costs-negative','blue-inputs','margin/ratio'], ['enter/edit(F2)','select','fill(D/R)']),
 'printshop':  ('new', 90, [], ['comma/currency-fmt','percent-fmt','decimals','borders(top/outside/bottom)','autofit','align','bold/italic/color'], ['select','goto-special','blue-inputs']),
 'findgo':     ('new', 95, [], ['find/replace','ctrl-enter'], ['move','goto-special','select','blue-inputs']),
 'pastes':     ('recut', 100, ['drill','signerr'], ['paste-special','transpose','paste-ops','paste-values','align'], ['copy/paste','select-edge','sign-convention']),
 'series':     ('recut', 90, [], ['series','date/TODAY'], ['fill(D/R)','ctrl-enter','copy/paste']),
 'modeltour':  ('capstone', 60, [], [], ['jump(ctrl-arrow)','enter/edit(F2)','fill(D/R)','percent-fmt','comma/currency-fmt','borders(top/outside/bottom)']),
 # ---- c2 Formatting
 'typeset':    ('recut', 75, [], ['date/TODAY'], ['bold/italic/color','align','select']),
 'compspage':  ('new', 110, ['decimals','combo'], ['custom-fmt(Ctrl+1)','parens-negative'], ['decimals','comma/currency-fmt','percent-fmt','select']),
 'ruleaudit':  ('recut', 80, ['ruleoff'], [], ['borders(top/outside/bottom)','goto-special']),
 'printpage':  ('new', 90, ['center','autofit'], ['width/wrap','freeze'], ['autofit','align','hide/unhide/group']),
 'condfmt':    ('new', 85, [], ['conditional-fmt'], ['select','margin/ratio']),
 'housestyle': ('capstone', 80, ['gauntlet'], [], ['bold/italic/color','blue-inputs','comma/currency-fmt','percent-fmt','borders(top/outside/bottom)','custom-fmt(Ctrl+1)','goto-special']),
 # ---- c3 Formulas I
 'anchor':     ('recut', 95, ['percent','fxconvert'], ['mixed-anchor'], ['anchor($/F4)','fill(D/R)','comma/currency-fmt','borders(top/outside/bottom)']),
 'bridge':     ('recut', 100, [], ['point-mode','named-range'], ['anchor($/F4)','fill(D/R)','blue-inputs','ctrl-enter']),
 'ratios':     ('new', 90, ['margin','cagr'], ['growth/CAGR','exponent'], ['margin/ratio','anchor($/F4)','percent-fmt','fill(D/R)']),
 'foot':       ('recut', 85, [], ['tie-out/check-row','subtotal-by-group'], ['sum(Alt=)','borders(top/outside/bottom)']),
 'logic':      ('new', 110, [], ['IF/MIN/MAX','IF/AND/OR','IFS/SWITCH'], ['margin/ratio','fill(D/R)','bold/italic/color']),
 'sumif':      ('recut', 100, [], ['SUMIF(S)','COUNTIF/AVERAGEIF'], ['anchor($/F4)','fill(D/R)','percent-fmt','tie-out/check-row']),
 'textclean':  ('new', 130, [], ['text-fn','concat','text-to-columns'], ['fill(D/R)','paste-values','clear/delete']),
 'dates':      ('new', 110, [], ['date-fn'], ['date/TODAY','custom-fmt(Ctrl+1)','IF/AND/OR','fill(D/R)']),
 'qclose':     ('capstone', 100, [], [], ['point-mode','sum(Alt=)','anchor($/F4)','growth/CAGR','SUMIF(S)','percent-fmt','borders(top/outside/bottom)']),
 # ---- c4 Data & Lookups
 'scrub':      ('recut', 95, ['sort'], ['sort','remove-dupes'], ['row/col-select','clear/delete','select-edge','sum(Alt=)']),
 'filterpass': ('recut', 110, [], ['filter','MAXIFS/MINIFS'], ['COUNTIF/AVERAGEIF','select']),
 'unhide':     ('recut', 85, [], [], ['hide/unhide/group','bold/italic/color']),
 'lookup':     ('recut', 120, [], ['VLOOKUP','INDEX/MATCH','XLOOKUP'], ['fill(D/R)','anchor($/F4)','bold/italic/color']),
 'crosstab':   ('new', 120, ['lookup2','rollup'], [], ['INDEX/MATCH','SUMIF(S)','mixed-anchor','fill(D/R)','tie-out/check-row']),
 'recon':      ('recut', 110, [], ['reconcile'], ['XLOOKUP','COUNTIF/AVERAGEIF','copy/paste','bold/italic/color']),
 'tables':     ('new', 100, [], ['table(Ctrl+T)','validation'], ['sort','select']),
 'pivot':      ('new', 90, [], ['pivot'], ['SUMIF(S)','comma/currency-fmt']),
 'cleanroom':  ('capstone', 120, [], [], ['goto-special','clear/delete','sort','XLOOKUP','SUMIF(S)','hide/unhide/group']),
 # ---- c5 Formulas II
 'wrapfix':    ('recut', 110, ['triage'], ['IFERROR'], ['VLOOKUP','enter/edit(F2)','fill(D/R)','sum(Alt=)']),
 'cases':      ('recut', 100, [], ['CHOOSE'], ['anchor($/F4)','fill(D/R)','paste-values']),
 'audit':      ('recut', 100, ['tieout'], ['show-formulas'], ['goto-special','bold/italic/color','enter/edit(F2)','fill(D/R)','tie-out/check-row']),
 'trace':      ('new', 90, [], ['audit(trace)','trace/evaluate'], ['show-formulas','enter/edit(F2)']),
 'stalelink':  ('recut', 110, ['versionup'], [], ['find/replace','blue-inputs','bold/italic/color','fill(D/R)']),
 'balcheck':   ('recut', 95, ['balance'], ['linkage(cross-statement)'], ['tie-out/check-row','enter/edit(F2)','fill(D/R)']),
 'redflags':   ('capstone', 120, [], [], ['goto-special','IFERROR','show-formulas','sign-convention','anchor($/F4)','tie-out/check-row']),
 # ---- c6 Models I
 'wacc':       ('recut', 110, [], ['stat-fn(MEDIAN/AVERAGE)'], ['anchor($/F4)','fill(D/R)']),
 'dcf':        ('recut', 130, ['fcfbuild','dcfbuild'], [], ['exponent','anchor($/F4)','fill(D/R)','NPV/IRR']),
 'npvirr':     ('new', 110, [], ['NPV/IRR','PMT'], ['IF/AND/OR','percent-fmt','copy/paste']),
 'dcfsens':    ('recut', 110, [], ['data-table','goal-seek'], ['mixed-anchor','fill(D/R)','comma/currency-fmt','borders(top/outside/bottom)']),
 'comps':      ('recut', 120, ['txncomps'], [], ['ctrl-enter','stat-fn(MEDIAN/AVERAGE)','custom-fmt(Ctrl+1)']),
 'accdil':     ('recut', 110, ['liqbridge'], [], ['copy/paste','select-edge','percent-fmt','IF/AND/OR']),
 'pitchpage':  ('capstone', 90, ['football','sourcesuses'], [], ['ctrl-enter','IF/MIN/MAX','borders(top/outside/bottom)']),
 # ---- c7 Models II
 'rollfwd':    ('new', 110, ['schedule'], ['corkscrew(roll-forward)','circularity-avoidance','schedule'], ['fill(D/R)','bold/italic/color']),
 'intsched':   ('recut', 100, [], [], ['corkscrew(roll-forward)','circularity-avoidance','IF/MIN/MAX','fill(D/R)']),
 'revolver':   ('recut', 100, [], [], ['IF/MIN/MAX','corkscrew(roll-forward)','fill(D/R)']),
 'waterfall':  ('recut', 110, [], [], ['IF/MIN/MAX','corkscrew(roll-forward)','copy/paste','tie-out/check-row']),
 'covtable':   ('recut', 95, [], [], ['IF/AND/OR','IF/MIN/MAX','goto-special','bold/italic/color']),
 'wk13':       ('recut', 110, [], [], ['date-fn','fill(D/R)','sum(Alt=)','corkscrew(roll-forward)']),
 'cascade':    ('capstone', 150, [], [], ['IF/MIN/MAX','corkscrew(roll-forward)','tie-out/check-row','fill(D/R)']),
 # ---- c8 Full Builds
 'isbuild':    ('recut', 110, ['opmodel'], [], ['point-mode','margin/ratio','sum(Alt=)','fill(D/R)']),
 'nwcsched':   ('recut', 100, [], [], ['point-mode','schedule','fill(D/R)']),
 'debtblock':  ('recut', 110, ['debtsched'], [], ['corkscrew(roll-forward)','circularity-avoidance','copy/paste','sum(Alt=)']),
 'threestmt':  ('recut', 110, ['bsbuild','cfslink'], [], ['linkage(cross-statement)','corkscrew(roll-forward)','tie-out/check-row','fill(D/R)']),
 'lbobuild':   ('recut', 120, ['lbo','retbridge'], ['bridge'], ['NPV/IRR','exponent','tie-out/check-row']),
 'dashcover':  ('recut', 80, [], [], ['ctrl-enter','concat','comma/currency-fmt','percent-fmt']),
 'handoff':    ('new', 130, [], ['sheets','protect/print'], ['paste-values','blue-inputs','find/replace','hide/unhide/group','goto-special','freeze']),
 'shipit':     ('capstone', 150, [], [], ['point-mode','linkage(cross-statement)','tie-out/check-row','paste-values']),
}

PLACEMENT = ['navigation','printpage','ratios','scrub','dcf']
TRACKS = {'fluency':{'name':'Excel Keyboard Fluency','chapters':['c1','c2']},
          'formulas':{'name':'Spreadsheet Formulas & Data','chapters':['c3','c4','c5']},
          'modeling':{'name':'Financial Modeling Keyboard Mastery','chapters':['c6','c7','c8']}}
UNLOCK = {5:13, 6:16, 7:19, 8:22}

# engine packs (dev/ENGINE_GAP_MATRIX.md) and which drills wait on each
PACKS = [
 ('P1','S · the function pack', ['XLOOKUP','IFS','SWITCH','MAXIFS','MINIFS','AVERAGEIFS','COUNTIFS','TEXTJOIN','TEXT','SUBSTITUTE','SEARCH','DATEDIF','NETWORKDAYS','PMT','SUMIF/COUNTIF comparison criteria (">100", wildcards)','columns past Z parse fix'],
        ['lookup','logic','filterpass','textclean','dates','npvirr','recon','crosstab']),
 ('P2','M · commands with a little UI', ['named ranges (name box, Ctrl+F3, F3)','remove duplicates (Alt A M)','text-to-columns (Alt A E)','sort dialog, two keys (Alt A S S)','trace precedents / dependents (Alt M P / D), F9 evaluate'],
        ['bridge','scrub','textclean','trace']),
 ('P3','L · per-range state painted by render()', ['conditional formatting (Alt H L)','data validation (Alt A V V)','Excel tables (Ctrl+T, total row, structured refs)','freeze panes (Alt W F F)','protect sheet + print area (Alt R P S · Alt P R S · Alt P S C)'],
        ['condfmt','tables','printpage','handoff']),
 ('P4','L · new surfaces', ['multiple sheets (Shift+F11, Ctrl+PgUp/PgDn, Sheet2!A1)','goal seek (Alt A W G) + data table (Alt A W T)','pivot table (Alt N V, keyboard field list, Alt+F5)'],
        ['handoff','dcfsens','pivot']),
]
