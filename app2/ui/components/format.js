// app2/ui/components/format.js — the one set of formatters the site pages share (screenplay 3.0,
// rule 10: every fact gets its own place, in tabular numerals). Pure functions, no DOM.
//
//   fmtClock(secs, tenths)   41 → '0:41', 61.24 → '1:01.2' (tenths on)
//   fmtGap(secs)             2.6 → '+2.6'; 0 → ''
//   fmtLength(cls)           a catalog length class → '1 min', '1.5 min', '5 min'
//   fmtMinutes(mins)         5 → '5 min'
//   ordinal(n)               31 → '31st'
//   numberWord(n)            6 → 'six' (1 to 20; else the digits)
//   esc(s)                   HTML-escape
//   fill(s, vars)            '{n} of {m}' with vars

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fill = (s, vars) => String(s == null ? '' : s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));

export function fmtClock(secs, tenths = false) {
  if (!Number.isFinite(secs) || secs < 0) return '';
  const whole = tenths ? Math.floor(secs * 10) / 10 : Math.round(secs);
  const m = Math.floor(whole / 60);
  const s = whole - m * 60;
  const sec = tenths ? s.toFixed(1).padStart(4, '0') : String(Math.round(s)).padStart(2, '0');
  return m + ':' + sec;
}

export function fmtGap(secs) {
  if (!Number.isFinite(secs) || secs <= 0) return '';
  return '+' + (Math.round(secs * 10) / 10).toFixed(1);
}

export function fmtLength(cls) {
  const secs = cls === 'long' ? 300 : Number(cls);
  if (!Number.isFinite(secs) || secs <= 0) return '';
  const mins = secs / 60;
  return (Number.isInteger(mins) ? String(mins) : (Math.round(mins * 10) / 10).toString()) + ' min';
}

export const fmtMinutes = mins => (Number.isFinite(mins) && mins > 0 ? Math.round(mins) + ' min' : '');

export function ordinal(n) {
  const v = Math.abs(Math.round(Number(n)));
  if (!Number.isFinite(v)) return '';
  const r100 = v % 100, r10 = v % 10;
  const suffix = r100 >= 11 && r100 <= 13 ? 'th' : r10 === 1 ? 'st' : r10 === 2 ? 'nd' : r10 === 3 ? 'rd' : 'th';
  return v + suffix;
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export function numberWord(n, { capital = false } = {}) {
  const v = Math.round(Number(n));
  const w = Number.isInteger(v) && v >= 0 && v <= 20 ? WORDS[v] : String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

/** The day as the learner reads it: 'Thu 1 Oct' from 'YYYY-MM-DD'. */
export function prettyDay(d) {
  try { return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { return String(d || ''); }
}
/** The weekday alone: 'Thursday'. */
export function weekdayOf(d) {
  try { return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }); } catch (e) { return ''; }
}
