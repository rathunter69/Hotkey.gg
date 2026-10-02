// Chapter 5 · 5.4.C Challenge: schedules linked into balanced statements (seeded over B54C)
// The linked model with ten projected lines blank across FY27 to FY31: depreciation, interest and
// tax on the IS, the depreciation add-back and capex on the CF, cash and PP&E on the BS, the
// revolver's draw and repayment, and the balance check. The seed draws fresh inputs (capex per
// site, minimum cash, the term loan rate); the workload never moves. A line is graded on its value
// against the model's own formula in the learner's workbook and on the shared liveness rule.
import { parsFrom } from '../../app/pars.js';
import { challengeSeed } from '../workbooks/clearcoat-model.js';
import { settled, sheetIn, reads, built, liveVia, inputRef, PROJ_COLS } from './lib/model-checks.js';

const ID = 'challenge-linked-statements';
const REF = 'B551';
const activeName = ses => ses.sheets[ses.sheetIndex].name;
const fill = (name, row, f) => `Ctrl+G "${name}!F${row}:J${row}" ↵ "${f}" Ctrl+↵`;
const rows = (name, list) => list.flatMap(r => PROJ_COLS.map(c => c + r));
const lineOk = (ses, name, list) => built(ses, name, rows(name, list), REF);
const live = (ses, name, ref, key) => liveVia(ses, name, ref, [inputRef(key)]);

const CHECK = {
  is: ses => lineOk(ses, 'IS', [26, 28, 30]) && live(ses, 'IS', 'J26', 'capexSite') && live(ses, 'IS', 'J28', 'termRate'),
  cf: ses => lineOk(ses, 'CF', [7, 14]) && live(ses, 'CF', 'J14', 'capexSite'),
  bs: ses => lineOk(ses, 'BS', [6, 9]) && live(ses, 'BS', 'J9', 'capexSite') && live(ses, 'BS', 'J6', 'capexSite'),
  revolver: ses => lineOk(ses, 'Schedules', [101, 102]) && live(ses, 'Schedules', 'J101', 'minCash')
    && PROJ_COLS.every(c => reads(sheetIn(ses, 'Schedules'), `${c}102`, [`${c}98`, `${c}99`, `${c}100`])),
  check: ses => lineOk(ses, 'BS', [28]) && PROJ_COLS.every(c => reads(sheetIn(ses, 'BS'), `${c}28`, [`${c}10`, `${c}25`]) && sheetIn(ses, 'BS').value(c + '28') === 0),
  flag: ses => { const cv = sheetIn(ses, 'Cover'); return !!cv && cv.value('C7') === 'OK'; },
};
const WHY = {
  is: 'depreciation, interest or tax on the IS in F26:J30 does not read its schedule',
  cf: 'the depreciation add-back or capex on the CF in F7:J14 does not read the PP&E schedule',
  bs: 'cash or PP&E on the BS in F6:J9 does not read the CF’s closing cash or the PP&E roll',
  revolver: 'the revolver’s draw or repayment in F101:J102 is not the MAX and MIN of the sweep',
  check: 'the balance check in F28:J28 does not read zero in every projected year',
  flag: 'the checks flag in C7 of Cover does not read OK',
};

const goals = [
  { id: 'is', text: 'On the IS, depreciation in F26:J26, interest in F28:J28 and tax in F30:J30 from their schedules.', convention: 'C4',
    keys: `${fill('IS', 26, '=-Schedules!F64')} ${fill('IS', 28, '=-Schedules!F110')} ${fill('IS', 30, '=-Schedules!F120')}`,
    check: (s, ses) => settled(ses) && CHECK.is(ses) },
  { id: 'cf', text: 'On the CF, depreciation added back in F7:J7 and capex in F14:J14.',
    keys: `${fill('CF', 7, '=Schedules!F64')} ${fill('CF', 14, '=-Schedules!F63')}`,
    check: (s, ses) => settled(ses) && CHECK.cf(ses) },
  { id: 'bs', text: 'On the BS, cash in F6:J6 from the CF’s closing cash and PP&E in F9:J9 from its roll-forward.', convention: 'F2',
    keys: `${fill('BS', 6, '=CF!F30')} ${fill('BS', 9, '=Schedules!F65')}`,
    check: (s, ses) => settled(ses) && CHECK.bs(ses) },
  { id: 'revolver', text: 'The revolver’s draw in F101:J101 and repayment in F102:J102 on Schedules.',
    keys: `${fill('Schedules', 101, '=MAX(F100-F99,0)')} ${fill('Schedules', 102, '=-MIN(MAX(F99-F100,0),F98)')}`,
    check: (s, ses) => settled(ses) && CHECK.revolver(ses) },
  { id: 'check', text: 'The balance check in F28:J28 of BS, reading zero in every year.', convention: 'F1',
    keys: fill('BS', 28, '=ROUND(F10-F25,2)'),
    check: (s, ses) => settled(ses) && CHECK.check(ses) },
  { id: 'flag', text: 'Go to the checks flag in C7 of Cover, reading OK.',
    keys: 'Ctrl+G "Cover!C7" ↵',
    check: (s, ses) => settled(ses) && activeName(ses) === 'Cover' && sheetIn(ses, 'Cover').selectionText() === 'C7' && CHECK.flag(ses) },
];

export default {
  id: ID,
  chapter: 'finance-and-accounting',
  section: 'Linking the statements',
  module: 'linking-the-statements',
  workbook: 'clearcoat-model',
  state: { before: 'B54C' },
  kind: 'challenge',
  title: 'Challenge: schedules linked into balanced statements',
  difficulty: 'hard',
  tags: ['challenge', 'model', 'statements', 'linking'],
  access: 'paid',
  minutes: 3,
  headline: '=',
  conventions: ['C4', 'F2', 'F1'],
  prerequisites: ['when-it-doesnt-balance'],
  brief: 'Schedules done, ten projected links missing across the statements and the revolver, on fresh inputs. Link them, wire the revolver and get the check to zero in every year.',
  timeLimit: 180,
  pars: parsFrom(80, { pass: 170, pro: 110 }),
  seed: rng => challengeSeed(ID, rng),
  goals,
  graders: [
    ses => { for (const id of ['is', 'cf', 'bs']) if (!CHECK[id](ses)) return { ok: false, why: WHY[id] }; return { ok: true }; },
    ses => { for (const id of ['revolver', 'check', 'flag']) if (!CHECK[id](ses)) return { ok: false, why: WHY[id] }; return { ok: true }; },
  ],
  solution: goals.map(g => g.keys).join(' ').replace(/↵/g, 'Enter'),
};
