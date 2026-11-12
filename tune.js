// 作曲家烂梗机 · the tuning tools. app.js loads this only on the tuning page: ../调整页.html (which sets window.TUNE and
// saves to 调整页.data.json), or index.html?tune (the same tools, saved in this browser only; useful on a phone).
// A bar on top: pick one effect and replay it, every timing (调速), the title mixer (标题), the sentence colour.
// Everything saves under KEY in localStorage; PageSave (loaded in 调整页.html's head) mirrors it into
// 调整页.data.json beside that page, and ../build.py turns the file into settings.js and the title rule in style.css.
(function () {
const KEY = 'zuoqujia-langeng-ji.tune.v1';

// ---------- the bar and the two panels (neutral, outside the design) ----------
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
.switch { position: relative; flex: none; top: 0; z-index: 50; display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
  padding: 6px max(12px, env(safe-area-inset-left, 0px)); background: #222; color: #ddd; font: 13px/1.4 system-ui, sans-serif; }
.switch button { border: 1px solid #555; background: #333; color: #eee; border-radius: 4px; padding: 3px 10px; font-size: 13px; }
.switch span { opacity: .7; margin-right: 4px; }
.speed { position: fixed; z-index: 80; left: max(8px, env(safe-area-inset-left, 0px)); top: 44px; width: min(460px, calc(100vw - 16px));
  max-height: calc(100vh - 56px); display: flex; flex-direction: column; background: #262626; color: #eee; border: 1px solid #555; border-radius: 6px;
  font: 13px/1.4 system-ui, "Microsoft YaHei", sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,.5); }
.speed[hidden] { display: none; }
.tmix { left: auto; right: max(8px, env(safe-area-inset-right, 0px)); width: min(380px, calc(100vw - 16px)); }
.tm-row { display: grid; grid-template-columns: 4.5em minmax(0, 1fr); gap: 8px; align-items: center; padding: 4px 0; }
.tm-row select { width: 100%; font-size: 13px; }
.tm-checks { display: flex; gap: 16px; padding: 6px 0 2px 5.1em; }
.sp-head { display: flex; gap: 8px; align-items: baseline; padding: 8px 10px; border-bottom: 1px solid #444; }
.sp-head span { opacity: .65; font-size: 12px; }
.sp-head button { margin-left: auto; background: none; border: 0; color: #eee; font-size: 16px; }
.sp-body { overflow: auto; padding: 4px 10px 8px; }
.sp-group { margin: 10px 0 4px; font-weight: 700; color: #ffd86b; }
.sp-row { display: grid; grid-template-columns: 9.5em minmax(0, 1fr) 4.2em auto; gap: 8px; align-items: center; padding: 2px 0; }
.sp-row input[type=range] { width: 100%; }
.sp-row output { font-variant-numeric: tabular-nums; text-align: right; }
.sp-row button, .sp-foot button { background: #3a3a3a; color: #eee; border: 1px solid #666; border-radius: 4px; padding: 2px 8px; font-size: 12px; }
.sp-row.changed output { color: #7fe08a; }
.sp-foot { display: flex; gap: 8px; align-items: center; padding: 8px 10px; border-top: 1px solid #444; flex-wrap: wrap; }
#spMsg { opacity: .75; }` }));
document.body.insertAdjacentHTML('afterbegin', `
<div class="switch" id="switch"><span>调整页</span>
  <label style="margin-left:14px">动画 <select id="fxpick" style="font-size:13px"></select></label>
  <button type="button" id="replay">重播</button>
  <button type="button" id="speedBtn" aria-expanded="false">调速</button>
  <button type="button" id="titleBtn" aria-expanded="false">标题</button>
  <label style="margin-left:8px">句子 <select id="sentpick" style="font-size:13px"><option value="cream">米白</option><option value="white">纯白</option></select></label>
  <span id="fx" style="margin-left:auto;opacity:.85"></span>${window.PageSave ? '' : '<span title="打开 调整页.html，设置才会存进 调整页.data.json">（只存在这个浏览器里）</span>'}
</div>`);
document.body.insertAdjacentHTML('beforeend', `
<div class="speed tmix" id="tmix" hidden>
  <div class="sp-head"><b>标题混搭</b><span>随便组合，自动保存。选「原样」就回到没有样式的标题。</span><button type="button" id="tmixClose" aria-label="关闭">✕</button></div>
  <div class="sp-body" id="tmixBody"></div>
</div>
<div class="speed" id="speed" hidden>
  <div class="sp-head"><b>调速</b><span>单位：毫秒（1000 = 1 秒）。改完马上生效，自动保存。</span><button type="button" id="speedClose" aria-label="关闭">✕</button></div>
  <div class="sp-body" id="spBody"></div>
  <div class="sp-foot"><button type="button" id="spCopy">复制设置</button><span id="spReset"><button type="button" id="spResetBtn">恢复默认</button></span><span id="spMsg"></span></div>
</div>`);
const $ = id => document.getElementById(id);
// the drawer button sits just below the bar
const dbtnEl = $('drawerBtn'), placeBtn = () => { dbtnEl.style.top = ($('switch').offsetHeight + 8) + 'px'; };
placeBtn(); addEventListener('resize', placeBtn);

// ---------- what she has saved here, or else what the site uses now (settings.js) ----------
let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
const start = saved || window.SETTINGS || {};
if (saved && saved.speed) {
  const s = saved.speed;
  SPEED.master = s.master ?? 1; SPEED.fx = over(FX_DEFAULTS, s.fx); SPEED.p = over(P_DEFAULTS, s.p);
}
let tm = { font: '原样', fill: '原样', shadow: '原样', stroke: '原样', bold: false, reflect: false, ...(start.title || {}) };
let white = !!start.white;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ speed: SPEED, title: tm, white, titleCss: titleCss('#hall .d-title.tuned') })); } catch {}
}

// ---------- title style: font × fill × shadow × outline, plus a few old WordArt presets ----------
const TM = {
  font: {
    '原样': null,
    '宋体': '"SimSun", "Songti SC", serif', '黑体': '"SimHei", "Heiti SC", sans-serif', '楷体': '"KaiTi", "STKaiti", "Kaiti SC", serif',
    '仿宋': '"FangSong", "STFangsong", serif', '幼圆': '"YouYuan", "幼圆", "Yuanti SC", sans-serif', '华文彩云': '"STCaiyun", "华文彩云", sans-serif',
    '华文琥珀': '"STHupo", "华文琥珀", sans-serif', '华文行楷': '"STXingkai", "华文行楷", cursive', '华文新魏': '"STXinwei", "华文新魏", serif',
    '华文隶书': '"STLiti", "华文隶书", serif', '隶书': '"LiSu", "隶书", serif', '方正舒体': '"FZShuTi", "方正舒体", cursive',
    '方正姚体': '"FZYaoti", "方正姚体", sans-serif', '华文中宋': '"STZhongsong", "华文中宋", serif',
  },
  fill: {
    '原样': null,
    '白色': 'solid:#ffffff', '黑色': 'solid:#111111', '大红': 'solid:#e60012', '明黄': 'solid:#ffe600', '宝蓝': 'solid:#1f3fd8',
    '彩虹': 'linear-gradient(90deg, #ff2a2a, #ff8c00, #ffe600, #3dff3d, #00d0ff, #2b5bff, #b02bff)',
    '金色': 'linear-gradient(180deg, #fff7c2 0%, #f3c843 35%, #a8740c 52%, #f9dc6a 70%, #fff3b0 100%)',
    '银色': 'linear-gradient(180deg, #ffffff 0%, #c9ced4 40%, #5d646b 52%, #dde2e7 72%, #ffffff 100%)',
    '火焰': 'linear-gradient(0deg, #d40000, #ff6a00 45%, #ffe100 85%)',
    '海洋': 'linear-gradient(180deg, #b8f3ff, #19a7e0 50%, #0a2f9e)',
    '日落': 'linear-gradient(180deg, #ffe07a, #ff7a59 45%, #c2187a 80%, #5b1a8f)',
    '薄荷': 'linear-gradient(90deg, #00c78c, #6ff0c8, #00b4d8)',
    '粉紫': 'linear-gradient(90deg, #ff6ec7, #c86bff, #6b8cff)',
  },
  shadow: {
    '原样': null, '无': 'none',
    '外部阴影': 'drop-shadow(.05em .05em .04em rgba(0,0,0,.75))',
    '硬阴影': 'drop-shadow(.06em .06em 0 #555)',
    '白灰双层': 'drop-shadow(.04em .04em 0 #fff) drop-shadow(.035em .035em 0 #808080)',
    '3D 立体': 'drop-shadow(.012em .012em 0 #7a4a12) drop-shadow(.012em .012em 0 #6e410e) drop-shadow(.012em .012em 0 #61380b) drop-shadow(.012em .012em 0 #542f08) drop-shadow(.012em .012em 0 #472706) drop-shadow(.03em .04em .03em rgba(0,0,0,.5))',
    '发光': 'drop-shadow(0 0 .06em #fff) drop-shadow(0 0 .14em #ffd84a)',
    '霓虹': 'drop-shadow(0 0 .05em #fff) drop-shadow(0 0 .12em #ff2bd6) drop-shadow(0 0 .25em #7a2bff)',
  },
  stroke: {
    '原样': null, '无': [0, 'transparent'],
    '细黑边': [.02, '#000'], '粗黑边': [.045, '#000'], '白边': [.035, '#fff'], '金边': [.03, '#b8860b'], '红边': [.03, '#c00000'],
    '黑白双层': [.02, '#fff', .03, '#000'],
  },
};
// presets in the spirit of the old Word WordArt gallery
const TM_PRESETS = {
  '（自己搭）': null,
  '原样': { font: '原样', fill: '原样', shadow: '原样', stroke: '原样', bold: false, reflect: false },
  '经典彩虹': { font: '黑体', fill: '彩虹', shadow: '硬阴影', stroke: '细黑边', bold: true, reflect: false },
  '金光闪闪': { font: '华文琥珀', fill: '金色', shadow: '外部阴影', stroke: '金边', bold: false, reflect: false },
  '铬银立体': { font: '黑体', fill: '银色', shadow: '3D 立体', stroke: '细黑边', bold: true, reflect: false },
  '海洋之心': { font: '幼圆', fill: '海洋', shadow: '白灰双层', stroke: '无', bold: true, reflect: true },
  '烈焰': { font: '华文行楷', fill: '火焰', shadow: '外部阴影', stroke: '细黑边', bold: false, reflect: false },
  '黄昏': { font: '华文新魏', fill: '日落', shadow: '发光', stroke: '无', bold: false, reflect: true },
  '彩云追月': { font: '华文彩云', fill: '粉紫', shadow: '霓虹', stroke: '无', bold: false, reflect: false },
  '红底金字': { font: '隶书', fill: '明黄', shadow: '硬阴影', stroke: '红边', bold: true, reflect: false },
  '楷体彩虹': { font: '楷体', fill: '彩虹', shadow: '白灰双层', stroke: '无', bold: true, reflect: false },
};
// the CSS rule for the current choice ('' for 原样 everywhere); build.py writes it into style.css with sel '#hall .d-title.tuned'
function titleCss(sel) {
  const f = TM.font[tm.font], fill = TM.fill[tm.fill], sh = TM.shadow[tm.shadow], st = TM.stroke[tm.stroke];
  if (!(f || fill || sh || st || tm.bold || tm.reflect)) return '';
  const rule = ['width: fit-content; margin-left: auto; margin-right: auto; padding-left: .25em; padding-right: 0; letter-spacing: .25em; animation: none; transform: none'];
  if (f) rule.push(`font-family: ${f}`);
  rule.push(tm.bold ? 'font-weight: 900' : 'font-weight: 400');
  if (fill) {
    if (fill.startsWith('solid:')) rule.push(`background: none; color: ${fill.slice(6)}; -webkit-text-fill-color: ${fill.slice(6)}`);
    else rule.push(`background: ${fill}; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent`);
  }
  rule.push('text-shadow: none');
  // outline as a ring of hard shadows around the letters: it never covers the fill, and it doesn't fight with
  // the browser's fake bold (which itself uses text-stroke, so a real stroke turned bold text black)
  const ring = (w, c) => w ? [[w, 0], [-w, 0], [0, w], [0, -w]].map(([x, y]) => `drop-shadow(${x}em ${y}em 0 ${c})`).join(' ') : '';
  const outline = st ? [ring(st[0], st[1]), st[2] ? ring(st[2], st[3]) : ''].join(' ').trim() : '';
  const shadowF = sh && sh !== 'none' ? sh : '';
  if (st || sh) rule.push(`filter: ${(outline + ' ' + shadowF).trim() || 'none'}`);
  rule.push('-webkit-text-stroke: 0');
  rule.push(tm.reflect ? '-webkit-box-reflect: below -.08em linear-gradient(transparent 45%, rgba(255,255,255,.35))'
                       : '-webkit-box-reflect: below 0 linear-gradient(transparent, transparent)');
  // the notes behind the pointer take the fill's colours
  if (fill) rule.push(`--trail: ${fill.startsWith('solid:') ? fill.slice(6) : fill.match(/#[0-9a-f]{3,6}/gi).join(', ')}`);
  return `${sel} {\n  ${rule.join(';\n  ')};\n}`;
}
// the live rule here replaces the baked one from style.css, so 原样 really shows the plain title
const titleEl = document.querySelector('#hall .d-title');
titleEl.classList.remove('tuned');
const tmStyle = document.createElement('style'); document.head.appendChild(tmStyle);
function applyTM(store) {
  tmStyle.textContent = titleCss('#hall .d-title');
  readTrail();
  if (store) save();
  requestAnimationFrame(fit);
}
function buildTM() {
  const body = $('tmixBody'); body.innerHTML = '';
  const sel = (label, key, opts) => {
    const r = document.createElement('div'); r.className = 'tm-row';
    r.innerHTML = `<label for="tm-${key}">${label}</label><select id="tm-${key}"></select>`;
    const s = r.querySelector('select'); Object.keys(opts).forEach(o => s.add(new Option(o, o)));
    if (key !== 'preset') s.value = tm[key];
    s.addEventListener('change', () => {
      if (key === 'preset') { const pz = TM_PRESETS[s.value]; if (pz) { tm = { ...pz }; buildTM(); } }
      else { tm[key] = s.value; $('tm-preset').value = '（自己搭）'; }
      applyTM(true);
    });
    body.appendChild(r);
  };
  sel('预设', 'preset', TM_PRESETS);
  sel('字体', 'font', TM.font); sel('填充', 'fill', TM.fill); sel('阴影', 'shadow', TM.shadow); sel('描边', 'stroke', TM.stroke);
  const c = document.createElement('div'); c.className = 'tm-checks';
  c.innerHTML = `<label><input type="checkbox" id="tm-bold"> 加粗</label><label><input type="checkbox" id="tm-reflect"> 倒影</label>`;
  body.appendChild(c);
  ['bold', 'reflect'].forEach(k => { const x = $('tm-' + k); x.checked = !!tm[k];
    x.addEventListener('change', () => { tm[k] = x.checked; $('tm-preset').value = '（自己搭）'; applyTM(true); }); });
}
buildTM();
applyTM(false);
const tmixEl = $('tmix'), titleBtn = $('titleBtn');
titleBtn.addEventListener('click', () => { tmixEl.hidden = !tmixEl.hidden; titleBtn.setAttribute('aria-expanded', !tmixEl.hidden); });
$('tmixClose').addEventListener('click', () => { tmixEl.hidden = true; titleBtn.setAttribute('aria-expanded', false); });

// ---------- sentence colour: cream or pure white (shadow unchanged) ----------
const sentpick = $('sentpick');
sentpick.value = white ? 'white' : 'cream';
document.body.classList.toggle('white-sent', white);
sentpick.addEventListener('change', () => { white = sentpick.value === 'white'; document.body.classList.toggle('white-sent', white); save(); });

// ---------- look at the effects one by one, and replay the current sentence (without sound) ----------
const fxpick = $('fxpick');
[['random', '随机'], ...NAMES.map(n => [n, n]), ['四面八方', '四面八方']].forEach(([v, l]) => fxpick.add(new Option(l, v)));
fxChoice.want = () => fxpick.value;
fxChoice.shown = n => { $('fx').textContent = '动画：' + n; };
const replay = () => present(current, reduceMotion() ? 0 : P('按下后停顿'));
$('replay').addEventListener('click', () => { if (!busy && current) replay(); });
// space on the bar's controls works the control, not the page's draw key
['keydown', 'keyup'].forEach(ev => $('switch').addEventListener(ev, e => { if (e.key === ' ') e.stopPropagation(); }));

// ---------- 调速 panel ----------
const spBody = $('spBody'), speedEl = $('speed'), speedBtn = $('speedBtn');
function row(label, get, set, min, max, step, def, tryFx) {
  const r = document.createElement('div'); r.className = 'sp-row';
  const id = 'sp-' + label;
  r.innerHTML = `<label for="${esc(id)}">${esc(label)}</label><input type="range" id="${esc(id)}" min="${min}" max="${max}" step="${step}"><output></output>` +
                (tryFx ? '<button type="button">试一下</button>' : '<span></span>');
  const inp = r.querySelector('input'), out = r.querySelector('output');
  const paint = () => { inp.value = get(); out.textContent = step < 1 ? (+get()).toFixed(2) + '×' : get(); r.classList.toggle('changed', +get() !== def); };
  inp.addEventListener('input', () => { set(+inp.value); save(); paint(); });
  if (tryFx) r.querySelector('button').addEventListener('click', () => {
    fxpick.value = tryFx;
    if (!current) one(); else if (!busy) replay();
  });
  paint(); return r;
}
function group(title) { const g = document.createElement('div'); g.className = 'sp-group'; g.textContent = title; spBody.appendChild(g); }
function buildSpeed() {
  spBody.innerHTML = '';
  group('整体');
  spBody.appendChild(row('整体快慢（越大越慢）', () => SPEED.master, v => SPEED.master = v, 0.3, 3, 0.05, 1, null));
  group('各个动画的时长');
  NAMES.forEach(n => spBody.appendChild(row(n, () => SPEED.fx[n], v => SPEED.fx[n] = v, 100, 5000, 50, FX_DEFAULTS[n], n)));
  group('出场顺序');
  Object.keys(P_DEFAULTS).forEach(k => spBody.appendChild(row(k, () => SPEED.p[k], v => SPEED.p[k] = v, 0, k.includes('每字') ? 600 : 5000, k.includes('每字') ? 10 : 50, P_DEFAULTS[k],
    k.startsWith('四面八方') ? '四面八方' : k.startsWith('打字机') ? '打字机' : k.startsWith('逐字弹跳') ? '逐字弹跳' : k.startsWith('逐字飞入') ? '逐字飞入' : null)));
}
buildSpeed();
function setSpeed(open) { speedEl.hidden = !open; speedBtn.setAttribute('aria-expanded', open); }
speedBtn.addEventListener('click', () => setSpeed(speedEl.hidden));
$('speedClose').addEventListener('click', () => setSpeed(false));
$('spCopy').addEventListener('click', async () => {
  const t = decodeURIComponent(location.pathname.replace(/^\//, '')) + '\n调速设置（毫秒；整体快慢是倍数）：\n' + JSON.stringify(SPEED, null, 1);
  try { await navigator.clipboard.writeText(t); $('spMsg').textContent = '已复制'; }
  catch { $('spMsg').textContent = '复制失败'; }
});
const setAll = s => { SPEED.master = s.master; SPEED.fx = s.fx; SPEED.p = s.p; save(); buildSpeed(); };
// reset: asks inline, then offers Undo for a few seconds
$('spReset').addEventListener('click', e => {
  const box = $('spReset'), id = e.target.id;
  if (id === 'spResetBtn') box.innerHTML = '全部恢复默认？<button type="button" id="spYes">恢复</button><button type="button" id="spNo">算了</button>';
  else if (id === 'spNo') box.innerHTML = '<button type="button" id="spResetBtn">恢复默认</button>';
  else if (id === 'spYes') {
    box.dataset.before = JSON.stringify(SPEED);
    setAll({ master: 1, fx: { ...FX_DEFAULTS }, p: { ...P_DEFAULTS } });
    box.innerHTML = '已恢复 <button type="button" id="spUndo">撤销</button>';
    setTimeout(() => { if ($('spUndo')) box.innerHTML = '<button type="button" id="spResetBtn">恢复默认</button>'; }, 6000);
  } else if (id === 'spUndo') {
    setAll(JSON.parse(box.dataset.before));
    box.innerHTML = '<button type="button" id="spResetBtn">恢复默认</button>';
  }
});
})();
