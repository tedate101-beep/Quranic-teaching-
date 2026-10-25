/* theme.js — ألوان التطبيق (متاحة للجميع) + الثيم الذهبي للمتصدرين */
(function () {
  const A = {
    green:  { n: 'أخضر',   bar: '#124a38', frame: '#1b6b52' },
    blue:   { n: 'أزرق',   bar: '#17406b', frame: '#2b6cb0' },
    purple: { n: 'بنفسجي', bar: '#47296a', frame: '#6b46a0' },
    brown:  { n: 'بني',    bar: '#5b3a1e', frame: '#8a5a2b' },
    rose:   { n: 'وردي',   bar: '#7a2748', frame: '#b03a69' },
    dark:   { n: 'أسود',   bar: '#151515', frame: '#4a4a4a' },
    gold:   { n: 'ذهبي',   bar: '#7a5a08', frame: '#c9a227', gold: true }
  };
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const leader = () => raw('lb_leader') === 'true';
  function cur() { let c = raw('mq_accent') || 'green'; if (!A[c]) c = 'green'; if (A[c].gold && !leader()) c = 'green'; return c; }
  function apply() {
    const c = cur(), a = A[c], r = document.documentElement;
    r.dataset.accent = c;
    [['--bar', a.bar], ['--frame', a.frame], ['--primary-color', a.bar], ['--accent-color', a.frame], ['--g', a.bar], ['--a', a.frame]]
      .forEach(([k, v]) => r.style.setProperty(k, v));
  }
  function set(c) { if (!A[c]) return false; if (A[c].gold && !leader()) return false; try { localStorage.setItem('mq_accent', c); } catch (e) {} apply(); return true; }
  window.WMTheme = { ACCENTS: A, cur, set, apply, leader };
  apply();
})();
