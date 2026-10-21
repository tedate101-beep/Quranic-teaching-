/* certificate.js — شهادة فاخرة + حفظ/مشاركة موثوقة على الموبايل و WebView */
(function () {
  const W = 1800, H = 1272; // A4 أفقي بدقة عالية
  const GOLD = '#b8923a', GOLD2 = '#e6c76a', GREEN = '#0f281e', GREEN2 = '#1b4332';

  async function loadFonts() {
    try {
      await Promise.all([
        document.fonts.load('700 60px "Amiri"'),
        document.fonts.load('400 40px "Amiri"'),
        document.fonts.load('700 40px "Cairo"'),
        document.fonts.load('400 30px "Cairo"'),
        document.fonts.load('400 30px "Reem Kufi"')
      ]);
      await document.fonts.ready;
    } catch (e) {}
  }

  function star(ctx, cx, cy, r, n, inner) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI / n) * i - Math.PI / 2;
      const rr = i % 2 ? r * inner : r;
      ctx.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
    }
    ctx.closePath();
  }

  function pattern(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = GREEN2; ctx.lineWidth = 2;
    const s = 120;
    for (let y = 60; y < H; y += s) for (let x = 60; x < W; x += s) {
      star(ctx, x, y, 48, 8, 0.62); ctx.stroke();
    }
    ctx.restore();
  }

  function corner(ctx, x, y, sx, sy) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(0, 0); ctx.lineTo(150, 0); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(22, 120); ctx.lineTo(22, 22); ctx.lineTo(120, 22); ctx.stroke();
    ctx.fillStyle = GOLD; star(ctx, 22, 22, 26, 8, 0.5); ctx.fill();
    ctx.fillStyle = GREEN; star(ctx, 22, 22, 11, 8, 0.5); ctx.fill();
    ctx.restore();
  }

  function seal(ctx, cx, cy) {
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    g.addColorStop(0, GOLD2); g.addColorStop(1, GOLD);
    ctx.save();
    ctx.fillStyle = g; star(ctx, cx, cy, 124, 16, 0.9); ctx.fill();
    ctx.strokeStyle = '#fff8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 96, 0, 7); ctx.stroke();
    ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(cx, cy, 86, 0, 7); ctx.fill();
    ctx.fillStyle = GOLD2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.font = '700 40px "Reem Kufi","Amiri",serif'; ctx.fillText('المصحف', cx, cy - 18);
    ctx.font = '700 40px "Reem Kufi","Amiri",serif'; ctx.fillText('المعلّم', cx, cy + 28);
    ctx.restore();
  }

  function divider(ctx, y) {
    ctx.save();
    const g = ctx.createLinearGradient(450, 0, 1350, 0);
    g.addColorStop(0, 'transparent'); g.addColorStop(.5, GOLD); g.addColorStop(1, 'transparent');
    ctx.strokeStyle = g; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(450, y); ctx.lineTo(1350, y); ctx.stroke();
    ctx.fillStyle = GOLD; star(ctx, W / 2, y, 16, 8, 0.5); ctx.fill();
    ctx.restore();
  }

  function fit(ctx, text, maxW, size, font) {
    let s = size;
    do { ctx.font = font.replace('{s}', s); s -= 2; } while (ctx.measureText(text).width > maxW && s > 20);
  }

  /**
   * opts: { canvas, title, name, line1, line2, quote, serial, supervisor }
   */
  async function draw(opts) {
    await loadFonts();
    const c = opts.canvas;
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

    // خلفية
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fffdf7'); bg.addColorStop(1, '#f3ead3');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    pattern(ctx);

    // إطارات
    ctx.strokeStyle = GREEN; ctx.lineWidth = 14; ctx.strokeRect(34, 34, W - 68, H - 68);
    const gb = ctx.createLinearGradient(0, 0, W, H);
    gb.addColorStop(0, GOLD2); gb.addColorStop(.5, GOLD); gb.addColorStop(1, GOLD2);
    ctx.strokeStyle = gb; ctx.lineWidth = 5; ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.lineWidth = 2; ctx.strokeRect(74, 74, W - 148, H - 148);
    corner(ctx, 74, 74, 1, 1); corner(ctx, W - 74, 74, -1, 1);
    corner(ctx, 74, H - 74, 1, -1); corner(ctx, W - 74, H - 74, -1, -1);

    // البسملة
    ctx.fillStyle = GREEN2; ctx.font = '700 62px "Amiri",serif';
    ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', W / 2, 190);
    divider(ctx, 225);

    // العنوان
    const tg = ctx.createLinearGradient(600, 0, 1200, 0);
    tg.addColorStop(0, GOLD); tg.addColorStop(.5, '#d9b24c'); tg.addColorStop(1, GOLD);
    ctx.fillStyle = tg; fit(ctx, opts.title, 1200, 110, '700 {s}px "Reem Kufi","Amiri",serif');
    ctx.fillText(opts.title, W / 2, 360);

    ctx.fillStyle = '#3b3b3b'; ctx.font = '400 40px "Cairo",sans-serif';
    ctx.fillText('تشهد منصة «المصحف المعلّم» بأن الطالب / الطالبة', W / 2, 460);

    // الاسم
    ctx.fillStyle = GREEN; fit(ctx, opts.name, 1250, 120, '700 {s}px "Amiri",serif');
    ctx.fillText(opts.name, W / 2, 600);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(480, 635); ctx.lineTo(1320, 635); ctx.stroke();

    ctx.fillStyle = '#2d3748';
    fit(ctx, opts.line1, 1300, 46, '400 {s}px "Cairo",sans-serif');
    ctx.fillText(opts.line1, W / 2, 725);
    if (opts.line2) {
      ctx.fillStyle = '#5a6272';
      fit(ctx, opts.line2, 1300, 36, '400 {s}px "Cairo",sans-serif');
      ctx.fillText(opts.line2, W / 2, 790);
    }

    ctx.fillStyle = GREEN2; ctx.font = '400 48px "Amiri",serif';
    ctx.fillText(opts.quote || '«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»', W / 2, 890);

    // التذييل
    const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.textAlign = 'right'; ctx.fillStyle = '#3b3b3b'; ctx.font = '400 32px "Cairo",sans-serif';
    ctx.fillText('تاريخ الإصدار', W - 190, 1040);
    ctx.fillStyle = GREEN; ctx.font = '700 38px "Cairo",sans-serif';
    ctx.fillText(date, W - 190, 1090);
    ctx.fillStyle = '#8a8f98'; ctx.font = '400 26px "Cairo",sans-serif';
    ctx.fillText('رقم الشهادة: ' + (opts.serial || ''), W - 190, 1140);

    ctx.textAlign = 'left'; ctx.fillStyle = '#3b3b3b'; ctx.font = '400 32px "Cairo",sans-serif';
    ctx.fillText('إشراف وتطوير', 190, 1040);
    ctx.fillStyle = GREEN; ctx.font = '700 52px "Amiri",serif';
    ctx.fillText(opts.supervisor || 'المهندس / وائل محمد', 190, 1100);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(190, 1115); ctx.lineTo(640, 1115); ctx.stroke();

    seal(ctx, W / 2, 1075);
    return c;
  }

  function serial() {
    return 'WM-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function toBlob(canvas) {
    return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob')), 'image/png'));
  }

  function blobToBase64(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1]);
      r.onerror = rej; r.readAsDataURL(blob);
    });
  }

  function overlay(url, fileName) {
    // حل أخير مضمون: صورة تُحفظ بالضغط المطوّل
    let o = document.getElementById('certSaveOverlay');
    if (o) o.remove();
    o = document.createElement('div');
    o.id = 'certSaveOverlay';
    o.style.cssText = 'position:fixed;inset:0;z-index:20000;background:#000d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;direction:rtl;font-family:Cairo,sans-serif';
    o.innerHTML = '<div style="color:#fff;text-align:center;font-weight:700;line-height:1.8">اضغط مطوّلاً على الصورة ثم اختر «حفظ الصورة»</div>' +
      '<img src="' + url + '" alt="' + fileName + '" style="max-width:100%;max-height:68vh;border-radius:10px;box-shadow:0 10px 40px #000">' +
      '<button style="background:#d4af37;border:0;border-radius:12px;padding:12px 28px;font-weight:800;font-size:16px">إغلاق</button>';
    o.querySelector('button').onclick = () => o.remove();
    document.body.appendChild(o);
  }

  /** حفظ الشهادة — يجرّب كل الطرق بالترتيب ولا يُغلق التطبيق أبدًا */
  async function save(canvas, fileName) {
    fileName = (fileName || 'شهادة') .replace(/[\\/:*?"<>|]/g, '_') + '.png';
    let blob;
    try { blob = await toBlob(canvas); } catch (e) { overlay(canvas.toDataURL('image/png'), fileName); return 'overlay'; }

    // 1) تطبيق Capacitor الأصلي (أندرويد/iOS): حفظ في الملفات ثم مشاركة
    try {
      const cap = window.Capacitor;
      if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins.Filesystem) {
        const data = await blobToBase64(blob);
        const f = await cap.Plugins.Filesystem.writeFile({ path: fileName, data, directory: 'CACHE' });
        if (cap.Plugins.Share) { await cap.Plugins.Share.share({ title: 'شهادتي', url: f.uri, dialogTitle: 'حفظ / مشاركة الشهادة' }); return 'native'; }
      }
    } catch (e) { /* ننتقل للطريقة التالية */ }

    // 2) مشاركة الملف عبر نافذة النظام (موبايل)
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'شهادتي' });
        return 'share';
      }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancel'; }

    // 3) تنزيل عادي في المتصفح
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
      const ua = navigator.userAgent;
      if (!/wv\)|Version\/.*Chrome|FBAN|FBAV|Instagram|; wv/.test(ua) && !/iPhone|iPad/.test(ua)) return 'download';
    } catch (e) {}

    // 4) الحل الأخير
    overlay(URL.createObjectURL(blob), fileName);
    return 'overlay';
  }

  window.WMCert = { draw, save, serial };
})();
