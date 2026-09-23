// app2/ui/ring.js — a small SVG progress ring (C2 gap 8): the module's lessons as a filling
// circle in the lesson panel head and on the Learn path's module nodes. Pure string, themed
// through currentColor (the caller sets `color`); no dependencies.

/**
 * @param {number} done   items finished
 * @param {number} total  items in the module (0 → an empty track)
 * @param {object} [o]    size px (default 22), stroke px (default 3), label ('' → none, 'auto' → "d/t")
 * @returns {string} an inline <svg class="ring"> string
 */
export function ring(done, total, o = {}) {
  const size = o.size || 22, stroke = o.stroke || 3;
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
  const dash = (frac * c).toFixed(2);
  const mid = size / 2;
  const label = o.label === 'auto' ? `${done}/${total}` : (o.label || '');
  return `<svg class="ring${frac >= 1 ? ' ring-full' : ''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${done} of ${total} done">` +
    `<circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".18" stroke-width="${stroke}"/>` +
    (frac > 0 ? `<circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dash} ${c.toFixed(2)}" transform="rotate(-90 ${mid} ${mid})"/>` : '') +
    (label ? `<text x="${mid}" y="${mid + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.round(size * 0.34)}" fill="currentColor">${label}</text>` : '') +
    `</svg>`;
}
