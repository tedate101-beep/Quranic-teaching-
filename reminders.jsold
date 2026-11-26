/* reminders.js — تذكير بالصلاة على النبي ﷺ + تنبيه الورد اليومي */
(function () {
  const J = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const MSG = ['اللهم صلِّ وسلِّم على نبينا محمد ﷺ',
    'قال ﷺ: «من صلّى عليَّ صلاةً صلّى الله عليه بها عشرًا»',
    'صلِّ على النبي ﷺ الآن، ولو مرّة واحدة 🌿',
    'اللهم صلِّ على محمد وعلى آل محمد كما صلّيت على إبراهيم وعلى آل إبراهيم'];
  const pick = n => MSG[(n == null ? Math.floor(Math.random() * MSG.length) : n) % MSG.length];
  const LN = () => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications;
  const $ = id => document.getElementById(id);
  const LABEL = { 15: '15 دقيقة', 30: '30 دقيقة', 60: 'ساعة', 120: 'ساعتين', 240: '4 ساعات' };

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});

  function banner(t) {
    const old = document.getElementById('wmBanner'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 'wmBanner';
    d.style.cssText = 'position:fixed;top:calc(12px + env(safe-area-inset-top));inset-inline:12px;max-width:440px;margin:auto;z-index:99999;background:#0f281e;color:#f6e7b0;border:2px solid #d4af37;border-radius:14px;padding:12px 16px;font:700 15px/1.8 Cairo,sans-serif;text-align:center;direction:rtl;box-shadow:0 8px 30px #0008';
    d.textContent = t; d.onclick = () => d.remove(); document.body.appendChild(d);
    setTimeout(() => d.remove(), 12000);
  }
  async function sys(title, body, tag) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
        if (reg) { await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', tag, dir: 'rtl', lang: 'ar', vibrate: [120, 60, 120] }); return true; }
        new Notification(title, { body, icon: 'icon-192.png', tag }); return true;
      }
    } catch (e) {}
    banner(title + ' — ' + body); return false;
  }
  function show(title, body, tag, force) {
    if (document.visibilityState === 'visible' && !force) { banner(title + ' — ' + body); return; }
    return sys(title, body, tag);
  }
  async function askPermission() {
    const ln = LN();
    if (ln) { try { const r = await ln.requestPermissions(); return r.display; } catch (e) {} }
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    try { return await Notification.requestPermission(); } catch (e) { return Notification.permission; }
  }
  const get = () => J('rem_salawat', { on: false, mins: 60 });

  async function refresh() {            // جدولة أصلية (تعمل والتطبيق مغلق) داخل نسخة Capacitor
    const ln = LN(); if (!ln) return false;
    try {
      const pend = await ln.getPending(); if (pend.notifications.length) await ln.cancel(pend);
      const s = get(), list = [];
      if (s.on) { const n = Math.min(60, Math.floor(48 * 60 / s.mins));
        for (let i = 1; i <= n; i++) list.push({ id: 1000 + i, title: 'صلِّ على النبي ﷺ', body: pick(i), schedule: { at: new Date(Date.now() + i * s.mins * 60000), allowWhileIdle: true } }); }
      const g = J('dailyGoal', null);
      if (g && g.time) { const [h, m] = g.time.split(':').map(Number);
        list.push({ id: 2000, title: 'وردك اليومي 📖', body: 'حان وقت وردك اليوم، هيا نكمله بإذن الله', schedule: { on: { hour: h, minute: m }, allowWhileIdle: true } }); }
      if (list.length) await ln.schedule({ notifications: list });
      return true;
    } catch (e) { return false; }
  }
  function set(on, mins) {
    W('rem_salawat', { on: !!on, mins: +mins || 60 });
    if (on) W('rem_last', Date.now());
    refresh();
  }
  function tick() {
    const s = get(), now = Date.now();
    if (s.on && now - J('rem_last', 0) >= s.mins * 60000) { W('rem_last', now); show('صلِّ على النبي ﷺ', pick(), 'salawat'); }
    const g = J('dailyGoal', null), d = new Date(), day = d.toISOString().slice(0, 10);
    if (g && g.time && J('rem_wird_day', '') !== day) {
      const [h, m] = g.time.split(':').map(Number), diff = d.getHours() * 60 + d.getMinutes() - (h * 60 + m);
      if (diff >= 0 && diff <= 5) { W('rem_wird_day', day); show('وردك اليومي 📖', 'حان وقت وردك اليوم، هيا نكمله بإذن الله', 'wird'); }
    }
  }
  function status() {
    const el = $('remStatus'); if (!el) return;
    const s = get(), ln = LN();
    const p = ln ? 'native' : ('Notification' in window ? Notification.permission : 'unsupported');
    let m;
    if (p === 'unsupported') m = '⚠️ هذا المتصفح لا يدعم الإشعارات، وسيظهر التذكير داخل الصفحة فقط.';
    else if (p === 'denied') m = '⚠️ الإشعارات محظورة. فعّلها من أيقونة القفل 🔒 بجانب الرابط ← الإشعارات ← سماح.';
    else if (p === 'default' && s.on) m = 'لم تسمح بالإشعارات بعد؛ اضغط «تجربة إشعار» ووافق على الإذن.';
    else m = s.on ? '✅ التذكير مفعّل كل ' + (LABEL[s.mins] || s.mins + ' دقيقة') + '.' : 'التذكير متوقف.';
    if (!ln) m += '<br><small style="font-weight:400;color:#666">⏱ في الموقع يعمل التذكير ما دامت الصفحة أو التطبيق مفتوحًا (حتى في الخلفية). للتذكير مع إغلاق التطبيق تمامًا استخدم نسخة التطبيق الأصلية (Capacitor).</small>';
    el.innerHTML = m;
  }
  async function test() { await askPermission(); await show('صلِّ على النبي ﷺ', pick(), 'test', true); status(); }
  function bindUI() {
    const on = $('salOn'), m = $('salMins'); if (!on || !m) return;
    const s = get(); on.checked = s.on; m.value = s.mins;
    const apply = async () => { if (on.checked) await askPermission(); set(on.checked, m.value); status(); };
    on.onchange = apply; m.onchange = apply; status();
  }
  window.WMRem = { get, set, test, askPermission, refresh, status, tick };
  document.addEventListener('DOMContentLoaded', () => { bindUI(); refresh(); });
  setInterval(tick, 20000); document.addEventListener('visibilitychange', tick); setTimeout(tick, 3000);
})();
