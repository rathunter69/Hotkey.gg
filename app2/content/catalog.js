// app2/content/catalog.js — the drill catalog's fields (screenplay 3.0 "Get these right now", 2;
// 6.0; M97). Each drill carries its length class, the lesson it's taught in, its tags (stretch,
// long, benchmark), its mode, its pars and its reference route, so the set picker (app/set-picker.js)
// and the Practice catalog never need a schema change. One normalised entry per drill, derived
// from the drill module's own fields; a drill can state any of them outright (`length`, `lesson`,
// `tags`, `mode`) and the catalog keeps what it says.
//
//   LENGTH_CLASSES   60, 90, 120, 150, 180 (seconds) or 'long' (about five minutes; listed with the challenges)
//   TAGS             stretch (no lesson teaches it; Pro; never the Daily's), long (never the Daily's), benchmark (a board that feeds the profile)
//   MODES            drill, daily, rapid, challenge
//   catalogEntry(drill, lessons)  → the entry
//   validateCatalogEntry(entry)   → [] or the problems
//   CATALOG, catalogById          → every built drill as an entry
import { DRILLS } from './drills.js';
import { LESSONS } from './index.js';

export const LENGTH_CLASSES = [60, 90, 120, 150, 180, 'long'];
export const TAGS = ['stretch', 'long', 'benchmark'];
export const MODES = ['drill', 'daily', 'rapid', 'challenge'];
export const LONG_FROM = 181;   // a Pass par past three minutes is a long drill (6.0: long drills run about five minutes)

/** The length class a Pass par falls in: the smallest class the par fits, or 'long'. */
export function lengthClassOf(passSecs) {
  if (!Number.isFinite(passSecs) || passSecs <= 0) return 60;
  if (passSecs >= LONG_FROM) return 'long';
  for (const c of LENGTH_CLASSES) if (typeof c === 'number' && passSecs <= c) return c;
  return 'long';
}
/** The seconds a length class stands for, for a set's budget. */
export const lengthSecs = cls => (cls === 'long' ? 300 : Number(cls) || 60);

/**
 * The lesson a drill is taught in: the drill's own `lesson`, else the challenge's lesson itself,
 * else the last lesson of the drill's module (the module's challenge is after every lesson),
 * else null. `lessons` is the catalog to look in (content/index.js LESSONS by default).
 */
export function taughtIn(drill, lessons = LESSONS) {
  if (typeof drill.lesson === 'string') return drill.lesson;
  if (drill.kind === 'challenge') return drill.id;
  if (typeof drill.module === 'string') {
    const inModule = lessons.filter(l => l.module === drill.module && l.kind !== 'challenge');
    if (inModule.length) return inModule[inModule.length - 1].id;
  }
  return null;
}

/** One catalog entry from a drill module (content/drills/*.js) or a challenge drill record (content/drills.js). */
export function catalogEntry(drill, lessons = LESSONS) {
  const tags = new Set(Array.isArray(drill.tags) ? drill.tags.filter(t => TAGS.includes(t)) : []);
  if (drill.benchmark) tags.add('benchmark');
  if (drill.stretch) tags.add('stretch');
  const pars = drill.pars || { pass: 0, pro: 0, legendary: 0 };
  let length = LENGTH_CLASSES.includes(drill.length) ? drill.length : lengthClassOf(pars.pass);
  if (tags.has('long')) length = 'long';
  if (length === 'long') tags.add('long');
  const mode = MODES.includes(drill.mode) ? drill.mode : drill.kind === 'challenge' ? 'challenge' : 'drill';
  return {
    id: drill.id, title: drill.title, chapter: drill.chapter, module: typeof drill.module === 'string' ? drill.module : null,
    lesson: taughtIn(drill, lessons),
    length, lengthSecs: lengthSecs(length), tags: [...tags],
    mode, access: drill.access === 'paid' ? 'paid' : 'free',
    pars: { pass: pars.pass, pro: pars.pro, legendary: pars.legendary },
    route: { secs: Number.isFinite(drill.route) ? drill.route : null, keys: drill.optimalKeys || null, solution: drill.solution || (drill.lesson && drill.lesson.solution) || null },
    goals: Array.isArray(drill.goals) ? drill.goals.length : (drill.lesson && Array.isArray(drill.lesson.goals) ? drill.lesson.goals.length : 0),
    dailyEligible: !tags.has('stretch') && !tags.has('long') && mode === 'drill',
    ruleLine: typeof drill.ruleLine === 'string' ? drill.ruleLine : null,   // a stretch drill's one rule, on its card (M85)
    pickers: hasPickers(drill),
  };
}

/** The lesson that teaches drop-downs (4.2.4): a drill with pickers says so on its Ready beat until it is done (M85). */
export const PICKER_LESSON = 'data-validation-dropdowns';
/** Does a drill's start sheet carry validated-list cells (pickers, M85)? */
export function hasPickers(drill) {
  const sheets = [drill && drill.sheet, ...((drill && drill.sheets) || [])].filter(Boolean);
  return sheets.some(sh => sh.validation && Object.values(sh.validation).some(v => v && v.allow === 'list'));
}

export function validateCatalogEntry(e) {
  const errs = [];
  const need = (c, m) => { if (!c) errs.push(m); };
  if (!e || typeof e !== 'object') return ['entry must be an object'];
  need(typeof e.id === 'string' && /^[a-z0-9-]+$/.test(e.id), 'id must be kebab-case');
  need(typeof e.title === 'string' && e.title.trim(), 'title missing');
  need(typeof e.chapter === 'string' && e.chapter, 'chapter missing');
  need(LENGTH_CLASSES.includes(e.length), 'length must be 60, 90, 120, 150, 180 or long');
  need(Array.isArray(e.tags) && e.tags.every(t => TAGS.includes(t)), 'tags must be stretch, long or benchmark');
  need(MODES.includes(e.mode), 'mode must be drill, daily, rapid or challenge');
  need(e.access === 'free' || e.access === 'paid', 'access must be free or paid');
  need(e.pars && ['pass', 'pro', 'legendary'].every(k => Number.isFinite(e.pars[k]) && e.pars[k] > 0), 'pars must give pass, pro and legendary');
  if (e.pars) need(e.pars.pass > e.pars.pro && e.pars.pro > e.pars.legendary, 'pars must fall: pass > pro > legendary');
  if (e.mode !== 'challenge') need(e.route && Number.isInteger(e.route.keys) && e.route.keys > 0, 'route.keys (the reference route\'s key count) missing');   // a challenge's count rides on its lesson, which may still be writing it
  need(e.route && typeof e.route.solution === 'string' && e.route.solution.trim(), 'route.solution (the reference route) missing');
  need(e.lesson === null || typeof e.lesson === 'string', 'lesson must be a lesson id or null');
  if (Array.isArray(e.tags) && e.tags.includes('stretch')) need(e.access === 'paid', 'a stretch drill is Pro');
  if (Array.isArray(e.tags) && e.tags.includes('long')) need(e.length === 'long', 'a long drill has the long length');
  return errs;
}

export const CATALOG = DRILLS.map(d => catalogEntry(d));
export const CATALOG_BY_ID = Object.fromEntries(CATALOG.map(e => [e.id, e]));
export const catalogById = id => CATALOG_BY_ID[id] || null;
