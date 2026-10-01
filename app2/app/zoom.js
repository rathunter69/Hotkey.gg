// app2/app/zoom.js — zoom to fit (screenplay 3.0 "Get these right now", 11; M99). A drill or a
// challenge opens with the sheet zoomed so its used range fills the sheet area, between the
// learner's sheet-zoom setting (the floor: 100, 110 or 125%) and 150%. The zoom itself is a
// sheet property the engine owns (engine/sheet.js zoomToFit / Sheet.fitZoom); this module reads
// the setting and hands the engine its floor, so the engine never knows about preferences.
//
//   fitZoomFor(sheet, { width, height }, settings)  → the zoom (%) set on the sheet
//   fitOptions(settings)                             → { floor, max } for the engine
//   opensFitted(kind)                                → true for a drill, the Daily or a challenge (a lesson opens at the setting)
import { zoomToFit } from '../engine/sheet.js';

export const ZOOM_FLOORS = [100, 110, 125];
export const ZOOM_FIT_MAX = 150;
const FITTED_KINDS = new Set(['drill', 'daily', 'challenge', 'assessment']);

export function fitOptions(settings) {
  const z = settings && Number(settings.sheetZoom);
  return { floor: ZOOM_FLOORS.includes(z) ? z : ZOOM_FLOORS[0], max: ZOOM_FIT_MAX };
}
export const opensFitted = kind => FITTED_KINDS.has(kind);

/** Fit the sheet to its area under the setting's floor and set it on the sheet; returns the zoom. */
export function fitZoomFor(sheet, area, settings) {
  const { floor, max } = fitOptions(settings);
  const z = zoomToFit(sheet, { width: area && area.width, height: area && area.height, floor, max });
  return typeof sheet.setZoom === 'function' ? sheet.setZoom(z) : z;
}
