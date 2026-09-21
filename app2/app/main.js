// app2/app/main.js — the shell: hash router over three views.
//   #/               the problem list
//   #/lesson/<id>    a lesson (split pane); #/lesson/<id>?mode=solo|timed
//   #/sandbox        a free sheet
import { mountNav } from '../ui/nav.js';
import { mountProblemList } from './problem-list.js';
import { mountLessonView } from './lesson-view.js';
import { mountSandbox } from './sandbox.js';
import { lessonById } from '../content/index.js';

const LINKS = [{ label: 'Lessons', href: '#/' }, { label: 'Sandbox', href: '#/sandbox' }];

export function startApp({ navEl, rootEl }) {
  let current = null;   // { destroy() }
  const nav = mountNav(navEl, { links: LINKS, active: 'Lessons' });

  function route() {
    const hash = location.hash || '#/';
    const [path, query] = hash.slice(1).split('?');
    const params = new URLSearchParams(query || '');
    if (current && current.destroy) current.destroy();
    rootEl.innerHTML = '';
    document.body.classList.remove('hide-gridlines');
    let m;
    if ((m = /^\/lesson\/([a-z0-9-]+)$/.exec(path))) {
      const lesson = lessonById(m[1]);
      if (lesson) { nav.setActive('Lessons'); current = mountLessonView(rootEl, lesson, { mode: params.get('mode') || 'guided' }); return; }
    }
    if (path === '/sandbox') { nav.setActive('Sandbox'); current = mountSandbox(rootEl); return; }
    nav.setActive('Lessons'); current = mountProblemList(rootEl);
  }
  window.addEventListener('hashchange', route);
  route();
}
