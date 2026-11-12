// 作曲家烂梗机 · the page: one draw, the show, history, the drawer, the note trail.
// Loaded last, after settings.js (window.SETTINGS: her tuned timings), words.js (LISTS), clips/clips.js (CLIPS),
// effects.js (FX, animate) and sound.js (Sound). One draw: one() → Sound.onDraw(pause) → present(s, pause).

// ---- the draw: 情景 + A + 和 + B + 怎么样地 + 做什么 + 。 with A ≠ B (the same logic as draw.py) ----
const pick = a => a[Math.floor(Math.random() * a.length)];
function roll() {
  const a = pick(LISTS['音乐家']); let b = pick(LISTS['音乐家']);
  while (b === a) b = pick(LISTS['音乐家']);
  return { scene: pick(LISTS['情景']), a, b, how: pick(LISTS['怎么样地']), act: pick(LISTS['做什么']) };
}
const text = s => s.scene + s.a + '和' + s.b + s.how + s.act + '。';
const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
// the whole sentence in one steady style; the parts stay separate only for the 四面八方 animation, and for the
// character-by-character effects every character is its own plain span from the start (see SPLIT in effects.js)
const part = (s, split) => `<span class="anim"><span class="part">${split ? [...s].map(c => `<span>${esc(c)}</span>`).join('') : esc(s)}</span></span>`;
const render = (s, split) => [s.scene, s.a, '和', s.b, s.how, s.act + '。'].map(x => part(x, split)).join('');   // 。 stays with the last word

// ---- every timing in the show (ms): her tuned values from settings.js over these defaults ----
const P_DEFAULTS = {
  '按下后停顿': 500,                     // only the title and the hall, before the portraits come
  '画像浮现': 1400, '两幅画像间隔': 300,
  '画像后句子开始': 1500,
  '四面八方·每块飞行': 1500, '四面八方·块间隔': 450, '打字机·每字间隔': 110, '逐字弹跳·每字间隔': 90, '逐字飞入·每字间隔': 70,
  '动画后按钮出现': 200, '按钮淡入': 500,
};
const FX_DEFAULTS = Object.fromEntries(NAMES.map(n => [n, FX[n][1]]));
const over = (defaults, saved) => Object.fromEntries(Object.keys(defaults).map(k => [k, saved && k in saved ? saved[k] : defaults[k]]));
const SPEED = (s => ({ master: s.master ?? 1, fx: over(FX_DEFAULTS, s.fx), p: over(P_DEFAULTS, s.p) }))((window.SETTINGS || {}).speed || {});
const ms = v => v * SPEED.master;          // every timing goes through the master knob
const fxDur = n => ms(SPEED.fx[n]);
const P = k => ms(SPEED.p[k]);
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// the tuning tools: ../调整页.html (saves to its .data.json), or this page with ?tune (saves in this browser only)
const TUNE = !!window.TUNE || new URLSearchParams(location.search).has('tune');

// ---- the portraits (public domain, from Wikimedia Commons; see portraits/sources.json); others get an empty frame ----
const PORTRAIT = { 莫扎特: 'mozart', 巴赫: 'bach', 贝多芬: 'beethoven', 肖邦: 'chopin', 李斯特: 'liszt', 柴可夫斯基: 'tchaikovsky',
                   亨德尔: 'handel', 海顿: 'haydn', 维瓦尔第: 'vivaldi', 帕格尼尼: 'paganini', 萨列里: 'salieri', 车尔尼: 'czerny',
                   舒伯特: 'schubert', 柏辽兹: 'berlioz', 门德尔松: 'mendelssohn', 舒曼: 'schumann', 勃拉姆斯: 'brahms', 马勒: 'mahler',
                   斯特拉文斯基: 'stravinsky', 普罗科菲耶夫: 'prokofiev', 肖斯塔科维奇: 'shostakovich', 拉赫玛尼诺夫: 'rachmaninoff',
                   德彪西: 'debussy', 拉威尔: 'ravel', 西贝柳斯: 'sibelius', 瓦格纳: 'wagner', 圣桑: 'saint-saens' };
// where each face is, as x% / y% of its picture (OpenCV face detection, checked by eye). Each panel's crop is moved so
// the face sits in the middle of the panel, and in its upper part when the picture is taller than the panel.
const FACE = { bach: [52, 24], beethoven: [51, 31], berlioz: [57, 23], brahms: [44, 29], chopin: [55, 21], czerny: [47, 31],
               debussy: [58, 32], handel: [51, 27], haydn: [51, 35], liszt: [40, 21], mahler: [59, 28], mendelssohn: [49, 29],
               mozart: [54, 37], paganini: [54, 35], prokofiev: [41, 30], rachmaninoff: [55, 39], ravel: [38, 36], 'saint-saens': [36, 20],
               salieri: [46, 32], schubert: [49, 31], schumann: [42, 25], shostakovich: [52, 37], sibelius: [50, 23], stravinsky: [51, 25],
               tchaikovsky: [45, 37], vivaldi: [49, 33], wagner: [48, 37] };
const hall = document.getElementById('hall'), sentEl = hall.querySelector('[data-sent]'), bigs = hall.querySelectorAll('.big');
function aim(el) {           // background-position for a cover crop, from the panel's size and the picture's
  const img = el.pic, face = img && FACE[el.face]; if (!face || !img.naturalWidth) return;
  const W = el.offsetWidth, H = el.offsetHeight, s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const at = (box, size, f, want) => size - box < 1 ? 50 : Math.min(100, Math.max(0, (f * size - want * box) / (size - box) * 100));
  el.style.backgroundPosition = `${at(W, img.naturalWidth * s, face[0] / 100, .5).toFixed(2)}% ${at(H, img.naturalHeight * s, face[1] / 100, .25).toFixed(2)}%`;
}
function hang(s) {
  bigs.forEach(el => {
    const f = PORTRAIT[s[el.dataset.p]];
    el.style.backgroundImage = f ? `url("portraits/${f}.jpg")` : 'none';
    el.classList.add('shown');
    el.textContent = f ? '' : '（此处应有画像）';
    if (el.face === f) return;                  // the same portrait as last time: already aimed
    el.face = f; el.pic = null; el.style.backgroundPosition = '';
    if (f && FACE[f]) {
      const img = new Image(); img.src = `portraits/${f}.jpg`;
      // already loaded once: aim at once, before the first frame; otherwise as soon as it arrives
      if (img.complete && img.naturalWidth) { el.pic = img; aim(el); }
      else img.onload = () => { if (el.face === f) { el.pic = img; aim(el); } };
    }
  });
}
addEventListener('resize', () => bigs.forEach(aim));

// ---- present one sentence with a little ceremony: the quiet pause, portraits, the sentence, and only then the buttons ----
let current = null, busy = false, btnTimer = 0;    // busy: a sentence is being presented; input waits
const waiters = document.querySelectorAll('.btns, .drawer-btn');
function present(s, pause) {
  busy = true;
  document.body.classList.remove('cover');
  hang(s);
  const fx = chooseFx();
  sentEl.innerHTML = render(s, SPLIT.has(fx));
  waiters.forEach(b => b.classList.add('waiting'));
  fit();
  const total = animate(sentEl, pause, fx);
  clearTimeout(btnTimer);
  btnTimer = setTimeout(() => {
    waiters.forEach(b => {
      b.classList.remove('waiting');
      if (!reduceMotion()) b.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: P('按钮淡入'), easing: 'ease-out' });
    });
    busy = false;
  }, total + P('动画后按钮出现'));
}

// ---- history: the last 200, kept across refreshes (the tuning page keeps its own) ----
const HIST_KEY = TUNE ? 'zuoqujia-langeng-ji.tuning-history.v1' : 'zuoqujia-langeng-ji.history.v2';
const past = [];
try { past.push(...(JSON.parse(localStorage.getItem(HIST_KEY)) || []).slice(0, 200)); } catch {}
function showHistory() {
  document.getElementById('dlist').innerHTML = past.slice(0, 200).map(s => `<li>${esc(text(s))}</li>`).join('');
  document.getElementById('dcount').textContent = past.length ? `共 ${past.length} 条` : '';
}
function one() {
  if (busy) return;
  current = roll(); past.unshift(current); past.length = Math.min(past.length, 200);
  try { localStorage.setItem(HIST_KEY, JSON.stringify(past)); } catch {}
  // the sound effect, the stretched pause and the music's muted start, all inside this tap (phones need that)
  present(current, Sound.onDraw(reduceMotion() ? 0 : P('按下后停顿')));
  showHistory();
}
showHistory();
document.querySelector('[data-go]').addEventListener('click', one);
const COPY_ICON = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8.5"/><path d="M3.5 10.5H2V2h8v1.5"/></svg>';
const DONE_ICON = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';
document.querySelector('[data-copy]').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(text(current)); b.innerHTML = DONE_ICON; b.title = '复制好了'; setTimeout(() => { b.innerHTML = COPY_ICON; b.title = '复制这句'; }, 1200); } catch {}
});
document.addEventListener('keydown', e => { if (e.key === ' ' && !e.target.closest('select')) { e.preventDefault(); one(); } });
document.addEventListener('keyup', e => { if (e.key === ' ') e.preventDefault(); });

// ---- shrink the sentence until the whole design fits on one screen (no scrolling) ----
function fit() {
  if (!sentEl.offsetParent) return;   // nothing to fit on the cover
  // shrink the sentence until it neither runs into the buttons nor pushes them off the screen
  const go = hall.querySelector('.btns');
  sentEl.style.fontSize = '';
  let size = parseFloat(getComputedStyle(sentEl).fontSize);
  const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  // layout box of the sentence, ignoring any animation transform (offset* are untransformed layout values)
  const layoutRect = () => {
    const op = sentEl.offsetParent.getBoundingClientRect();
    const left = op.left + sentEl.offsetLeft, top = op.top + sentEl.offsetTop;
    return { left, top, right: left + sentEl.offsetWidth, bottom: top + sentEl.offsetHeight };
  };
  const tooBig = () => {
    const s = layoutRect(), g = go.getBoundingClientRect();
    const lowest = Math.max(g.bottom, ...[...go.children].map(b => b.getBoundingClientRect().bottom));
    // the sentence's box may fill the line up to the 16px gutter; only shrink when it would cross it
    return lowest > innerHeight - 4 || hit(s, g) || s.right > innerWidth - 15.5 || s.left < 15.5;
  };
  while (tooBig() && size > 12) { size *= 0.93; sentEl.style.fontSize = size + 'px'; }
}
addEventListener('resize', fit);

// ---- drawer: hidden until asked for; closes on ✕, a tap on the dark veil, a sideways swipe, or Esc ----
const drawer = document.getElementById('drawer'), veil = document.getElementById('veil'), dbtn = document.getElementById('drawerBtn');
function setDrawer(open) {
  drawer.hidden = false; veil.hidden = !open;
  requestAnimationFrame(() => drawer.classList.toggle('open', open));
  dbtn.setAttribute('aria-expanded', open);
  if (!open) setTimeout(() => { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 380);
}
dbtn.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
document.getElementById('drawerClose').addEventListener('click', () => setDrawer(false));
veil.addEventListener('click', () => setDrawer(false));
addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
// a sideways swipe on the open drawer or the veil closes it (either direction); vertical drags still scroll the list
let swipe = null;
[drawer, veil].forEach(el => {
  // touch events, not pointer events: the browser cancels a pointer as soon as it starts scrolling the list
  el.addEventListener('touchstart', e => { const p = e.touches[0]; swipe = e.touches.length === 1 ? { x: p.clientX, y: p.clientY } : null; }, { passive: true });
  el.addEventListener('touchend', e => {
    if (!swipe) return; const p = e.changedTouches[0], dx = p.clientX - swipe.x, dy = p.clientY - swipe.y; swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) setDrawer(false);
  }, { passive: true });
  el.addEventListener('touchcancel', () => { swipe = null; }, { passive: true });
});

// ---- a trail of little notes behind the pointer: mouse, and fingers or pens on phones and tablets ----
// The notes follow the title's fill (style.css gives the title a --trail list): rainbow notes, in order, for a rainbow title.
const NOTES = ['♪', '♫', '♩', '♬', '𝄞', '✦'], HALL_COLOURS = ['#f6dc8c', '#fff3cf', '#ffffff', '#d9b45a'];
let trailColours = HALL_COLOURS, lastNote = 0, trailStep = 0;
function readTrail() {
  const v = getComputedStyle(hall.querySelector('.d-title')).getPropertyValue('--trail').trim();
  trailColours = v ? v.split(',').map(c => c.trim()) : HALL_COLOURS;
}
addEventListener('pointermove', e => {
  if (reduceMotion()) return;
  const now = performance.now(); if (now - lastNote < 40) return; lastNote = now;
  const t = document.createElement('span'); t.className = 'trail'; t.textContent = pick(NOTES);
  t.style.left = e.clientX + 'px'; t.style.top = e.clientY + 'px';
  const col = trailColours[trailStep++ % trailColours.length];
  t.style.color = col; t.style.textShadow = `0 0 9px ${col}`;
  t.style.fontFamily = '"Segoe UI Symbol", "Noto Music", "Apple Symbols", serif';
  document.body.appendChild(t); setTimeout(() => t.remove(), 900);
});

// ---- start: on the cover (body.cover in the markup), with her sentence colour; the tuning page adds its tools ----
document.body.classList.toggle('white-sent', !!(window.SETTINGS || {}).white);
readTrail();
Sound.mount(TUNE);
if (TUNE) document.body.appendChild(Object.assign(document.createElement('script'), { src: 'tune.js' }));
requestAnimationFrame(fit);
