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
  // شارة التوثيق بجوار اسم الحساب (المطوّر: أزرق، المتصدر: ذهبي)
  const OWNERS = ['tedate101@gmail.com'];
  const seal = c => `<svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:-3px;margin-inline-start:3px"><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="${c}"/><rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="${c}" transform="rotate(45 12 12)"/><path d="M7.6 12.4l3 3 5.8-6.2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const st = document.createElement('style');
  st.textContent = '.owner-name{background:linear-gradient(90deg,#1d9bf0,#d4af37,#1d9bf0);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800;animation:shn 3s linear infinite}@keyframes shn{to{background-position:200% center}}';
  document.head.appendChild(st);
  let tries = 0;
  const deco = setInterval(() => {
    if (++tries > 40) return clearInterval(deco);
    const c = document.querySelector('#quranAuthTop .auth-name'), F = window.QuranFirebase;
    if (!c || !F || !F.user || c.dataset.dec) return;
    c.dataset.dec = 1; clearInterval(deco);
    const owner = F.user.email && OWNERS.includes(F.user.email.toLowerCase());
    c.style.maxWidth = 'none';
    if (owner) c.innerHTML = '<span class="owner-name">وائل محمد</span>' + seal('#1d9bf0') + '<small style="opacity:.8;margin-inline-start:6px">مطوّر التطبيق</small>';
    else if (leader()) c.innerHTML = c.textContent + seal('#d4a017');
  }, 700);
  window.WMTheme = { ACCENTS: A, cur, set, apply, leader };
  apply();
})();
