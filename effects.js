// 作曲家烂梗机 · the PowerPoint entrance effects.
// Usually the whole sentence enters with one effect, at about PowerPoint's "中速" so you can watch it.
// Now and then (about 1 in 6) it's 四面八方: every part flies in from its own direction, one after another.
// The timings come from app.js (P, fxDur: her tuned values in settings.js); each FX entry's number is only the default.
function blinds(p, n = 7) {            // a comb-shaped polygon: n horizontal slats, each open by fraction p
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y0 = (i / n) * 100, y1 = y0 + (p / n) * 100;
    pts.push(`0% ${y0}%`, `100% ${y0}%`, `100% ${y1}%`, `0% ${y1}%`);
  }
  return `polygon(${pts.join(',')})`;
}
const FX = {
  '淡入':        [[{ opacity: 0 }, { opacity: 1 }], 1400, 'ease'],
  '飞入·自右侧':  [[{ transform: 'translateX(110vw)' }, { transform: 'none' }], 1500, 'linear'],
  '飞入·自左侧':  [[{ transform: 'translateX(-110vw)' }, { transform: 'none' }], 1500, 'linear'],
  '飞入·自顶部':  [[{ transform: 'translateY(-100vh)' }, { transform: 'none' }], 1500, 'linear'],
  '飞入·自底部':  [[{ transform: 'translateY(100vh)' }, { transform: 'none' }], 1500, 'linear'],
  '弹跳':        [[{ transform: 'translateY(-90vh)', offset: 0, easing: 'ease-in' }, { transform: 'none', offset: .45, easing: 'ease-out' },
                  { transform: 'translateY(-12vh)', offset: .62, easing: 'ease-in' }, { transform: 'none', offset: .78, easing: 'ease-out' },
                  { transform: 'translateY(-4vh)', offset: .89, easing: 'ease-in' }, { transform: 'none', offset: 1 }], 2000, 'linear'],
  '旋转飞入':     [[{ transform: 'translate(60vw,-40vh) rotate(-720deg) scale(.1)', opacity: 0 }, { transform: 'none', opacity: 1 }], 1800, 'ease-out'],
  '螺旋飞入':     [[{ transform: 'translate(-75vw,30vh) rotate(0) scale(.2)' }, { transform: 'translate(30vw,20vh) rotate(180deg) scale(.5)' },
                  { transform: 'translate(10vw,-20vh) rotate(300deg) scale(.8)' }, { transform: 'none' }], 2000, 'ease-in-out'],
  '缩放':        [[{ transform: 'scale(0)' }, { transform: 'none' }], 1300, 'linear'],
  '百叶窗·横':     [[{ clipPath: blinds(0) }, { clipPath: blinds(1) }], 1500, 'linear'],
  '百叶窗·竖':     [null, 1500, 'linear'],          // every character is its own vertical slat; see animate()
  '擦除·自左':    [[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1500, 'ease-in-out'],
  '擦除·自右':    [[{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }], 1500, 'ease-in-out'],
  '擦除·自上':    [[{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1500, 'ease-in-out'],
  '擦除·自下':    [[{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1500, 'ease-in-out'],
  '擦除·中间向两侧': [[{ clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0 0 0)' }], 1500, 'ease-in-out'],
  // two strips growing in from the edges: left strip 0..x and right strip (100-x)..100, joined along the bottom edge
  '擦除·两侧向中间': [[{ clipPath: 'polygon(0 0, 0 0, 0 100%, 100% 100%, 100% 0, 100% 0, 100% 100%, 0 100%)' },
                     { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 50% 100%, 50% 0, 100% 0, 100% 100%, 0 100%)' }], 1500, 'ease-in-out'],
  '擦除·中心向外': [[{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], 1500, 'ease-in-out'],
  '打字机':       [[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1800, 'steps(14)'],
  '翻转':        [[{ transform: 'perspective(600px) rotateY(90deg)' }, { transform: 'none' }], 1300, 'ease-out'],
  '回旋':        [[{ transform: 'scale(.2) rotate(-360deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 1700, 'linear'],
  // 光速: rushes in leaning back, then the brakes: a quick lean forward and upright (no overshoot in position)
  '光速':        [[{ transform: 'translateX(105vw) skewX(-35deg)', offset: 0 }, { transform: 'translateX(0) skewX(-35deg)', offset: .62 },
                  { transform: 'skewX(14deg)', offset: .8 }, { transform: 'none', offset: 1 }], 1200, 'linear'],
  '玩具风车':     [[{ transform: 'rotate(-1080deg) scale(0)' }, { transform: 'none' }], 2000, 'linear'],
  '轮子·4 辐':    [null, 2000, 'linear'],      // clock wipe with 4 hands; see animate()
  '菱形':        [[{ clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' }, { clipPath: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)' }], 1800, 'linear'],
  '盒状':        [[{ clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0 0 0 0)' }], 1800, 'linear'],
  '十字形扩展':   [[{ clipPath: 'polygon(50% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 50%, 50% 50%, 50% 100%, 50% 100%, 50% 50%, 0% 50%, 0% 50%, 50% 50%)' }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 0%, 0% 0%)' }], 1800, 'linear'],
  '棋盘':        [null, 2000, 'linear'],      // grid mask; see animate()
  '随机线条':     [null, 2000, 'linear'],
  '阶梯状':       [null, 2000, 'linear'],
  '挥鞭式':       [[{ transform: 'translate(-70vw, -35vh) rotate(-70deg) scale(.4)' }, { transform: 'translate(-25vw, 12vh) rotate(-25deg) scale(.8)', offset: .55 }, { transform: 'none' }], 1500, 'linear'],
  '曲线向上':     [[{ transform: 'translate(45vw, 60vh)', opacity: 0 }, { transform: 'translate(-8vw, 22vh)', opacity: 1, offset: .55 }, { transform: 'none' }], 2000, 'linear'],
  '浮动':        [[{ transform: 'translateY(.8em)', opacity: 0 }, { transform: 'none', opacity: 1 }], 2000, 'linear'],
  '升起':        [[{ transform: 'translateY(35vh)', opacity: 0 }, { transform: 'none', opacity: 1 }], 2000, 'linear'],
  '展开':        [[{ transform: 'scaleX(0)' }, { transform: 'none' }], 1500, 'linear'],
  '投掷':        [[{ transform: 'translate(-80vw, 30vh) rotate(-540deg) scale(2.2)', opacity: 0 }, { transform: 'none', opacity: 1 }], 1600, 'linear'],
  '字幕式':       [[{ transform: 'translateY(70vh)' }, { transform: 'none' }], 3000, 'linear'],
  '逐字飞入':     [null, 700, 'linear'],       // each character flies up into place; see animate()
  '溶解':        [null, 2000, 'linear'],      // TV-snow squares; see animate()
  '逐字弹跳':     [null, 900, 'linear'],       // each character drops and bounces; see animate()
};
const NAMES = Object.keys(FX);

// the tuning page (tune.js) can fix one effect and show which one ran; on the site it stays random
const fxChoice = { want: () => 'random', shown: null };
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
let typeTimers = [];

// the four effects that move character by character. For them app.js renders the sentence already split into one
// plain inline span per character (render(s, true)), before fit() measures it, and the spans stay until the next draw:
// the layout is the same before, during and after the effect (WebKit lays split text out a little differently from
// plain text, so splitting or joining mid-show would shift a line). Nothing here adds width or margins.
const SPLIT = new Set(['打字机', '逐字飞入', '逐字弹跳', '百叶窗·竖']);
// each(span, i) sets up one character's span; returns how many characters there are
function eachChar(sent, each) {
  const spans = sent.querySelectorAll('.part > span');
  spans.forEach((c, i) => each(c, i));
  return spans.length;
}
// this draw's effect: a random one (or the tuning page's pick); now and then (1 in 6) 四面八方
function chooseFx() {
  const want = fxChoice.want();
  if (want === '四面八方' || (want === 'random' && Math.random() < 1 / 6)) return '四面八方';
  return want === 'random' ? pick(NAMES) : want;
}

// the whole entrance after a press: the quiet pause (pause ms, with only the title and the hall), the portraits,
// then the sentence with effect `name` (from chooseFx). Returns when it ends, in ms from now.
function animate(sent, pause, name) {
  const reduce = reduceMotion();
  // 1. the portraits: two huge ones fade in behind
  document.querySelectorAll('#hall .big').forEach((el, i) => {
    el.classList.add('shown');
    const rest = parseFloat(getComputedStyle(el).opacity) || .5;
    if (!reduce) el.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: rest, transform: 'none' }], { duration: P('画像浮现'), delay: pause + i * P('两幅画像间隔'), easing: 'ease-out', fill: 'backwards' });
  });
  const lead = pause + P('画像后句子开始');
  if (reduce) return 0;
  sent.getAnimations().forEach(a => a.cancel());
  typeTimers.forEach(clearTimeout); typeTimers = [];
  sent.classList.remove('wheel'); sent.style.webkitMaskImage = sent.style.maskImage = '';
  // 2. the sentence: usually one effect for the whole sentence
  if (fxChoice.shown) fxChoice.shown(name);
  if (name === '四面八方') {
    const dirs = [...DIRS].sort(() => Math.random() - .5);
    const parts = sent.querySelectorAll('.anim');
    parts.forEach((el, i) => {
      const [dx, dy] = dirs[i % dirs.length];
      el.animate([{ transform: `translate(${dx * 100}vw, ${dy * 90}vh) rotate(${dx * 40 + dy * 25}deg)` }, { transform: 'none' }],
                 { duration: P('四面八方·每块飞行'), easing: 'linear', delay: lead + i * P('四面八方·块间隔'), fill: 'backwards' });
    });
    return lead + (parts.length - 1) * P('四面八方·块间隔') + P('四面八方·每块飞行');
  }
  if (name.startsWith('轮子')) {
    // clock wipe: 1, 4 or 8 hands sweep round together from twelve o'clock
    const dur = fxDur(name), n = name.includes('8') ? 8 : name.includes('4') ? 4 : 1;
    sent.style.setProperty('--spokes', n);
    sent.animate([{ '--wheel': '0deg' }, { '--wheel': (360 / n) + 'deg' }], { duration: dur, easing: 'linear', delay: lead, fill: 'backwards' });
    sent.classList.add('wheel');
    typeTimers.push(setTimeout(() => sent.classList.remove('wheel'), lead + dur + 30));
    return lead + dur;
  }
  if (['溶解', '棋盘', '随机线条', '阶梯状'].includes(name)) {
    // a mask made of grid cells, each switching on at its own moment (0..1 of the duration)
    const dur = fxDur(name), fs = parseFloat(getComputedStyle(sent).fontSize);
    const W = sent.offsetWidth, H = sent.offsetHeight;
    let cw, ch, when;
    if (name === '溶解') { cw = ch = Math.max(6, fs * .28); when = () => Math.random(); }
    if (name === '随机线条') { cw = W; ch = Math.max(2, fs * .09); when = () => Math.random(); }
    if (name === '阶梯状') { cw = ch = Math.max(8, fs * .5); }
    if (name === '棋盘') { const sq = fs * 1.1; cw = sq / 8; ch = sq; }          // each square is 8 thin slices
    const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      let w;
      if (name === '阶梯状') w = (c / cols + r / rows) / 2;
      else if (name === '棋盘') w = (((c + (r % 2) * 4) % 8) + Math.random() * .3) / 8.3;   // rows offset by half a square
      else w = when();
      cells.push([c, r, w]);
    }
    const steps = 28;
    const maskAt = k => {
      const lim = k / steps;
      const rects = cells.filter(o => o[2] < lim).map(o => `<rect x='${o[0]}' y='${o[1]}' width='1.03' height='1.03'/>`).join('');
      return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${cols} ${rows}' preserveAspectRatio='none' shape-rendering='crispEdges'>${rects}</svg>`)}")`;
    };
    const set = v => { sent.style.webkitMaskImage = v; sent.style.maskImage = v;
      sent.style.webkitMaskSize = sent.style.maskSize = `${cols * cw}px ${rows * ch}px`; sent.style.webkitMaskRepeat = sent.style.maskRepeat = 'no-repeat'; };
    set(maskAt(0));
    for (let k = 1; k <= steps; k++) typeTimers.push(setTimeout(() => set(maskAt(k)), lead + dur * k / steps));
    typeTimers.push(setTimeout(() => set(''), lead + dur + 30));
    return lead + dur;
  }
  if (name === '逐字飞入') {
    // each character flies up from below into place, one after another (position: relative: no reflow)
    const dur = fxDur(name), gap = P('逐字飞入·每字间隔');
    const n = eachChar(sent, (c, i) => {
      c.style.position = 'relative';
      c.animate([{ top: '45vh', opacity: 0 }, { top: '0', opacity: 1 }], { duration: dur, easing: 'linear', delay: lead + i * gap, fill: 'backwards' });
    });
    return lead + (n - 1) * gap + dur;
  }
  if (name === '逐字弹跳') {
    // each character drops from above and bounces, one after another (position: relative: no reflow)
    const dur = fxDur(name), gap = P('逐字弹跳·每字间隔');
    const n = eachChar(sent, (c, i) => {
      c.style.position = 'relative';
      c.animate([{ top: '-70vh', opacity: 0, offset: 0, easing: 'ease-in' }, { opacity: 1, offset: .05 },
                 { top: '0', offset: .5, easing: 'ease-out' }, { top: '-.6em', offset: .68, easing: 'ease-in' },
                 { top: '0', offset: .84, easing: 'ease-out' }, { top: '-.18em', offset: .92, easing: 'ease-in' }, { top: '0', offset: 1 }],
                { duration: dur, delay: lead + i * gap, fill: 'backwards' });
    });
    return lead + (n - 1) * gap + dur;
  }
  if (name === '百叶窗·竖') {
    // vertical blinds: every character is one slat, and all slats wipe open from left to right at once
    const dur = fxDur(name);
    eachChar(sent, c => c.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: dur, easing: 'linear', delay: lead, fill: 'backwards' }));
    return lead + dur;
  }
  if (name === '打字机') {
    // one character at a time, with a cursor that follows the last typed character and blinks a little at the end
    const gap = P('打字机·每字间隔'), spans = [];
    eachChar(sent, c => { c.style.visibility = 'hidden'; spans.push(c); });
    // the cursor is outside the text: absolutely placed in the sentence box at the typed character's baseline,
    // so it can never change where a line breaks
    const caret = document.createElement('span'); caret.className = 'caret';
    if (spans[0]) caret.style.color = getComputedStyle(spans[0]).color;        // a bar in the text's own colour
    // where the baseline sits below the top of a character's box: measured once in an invisible, absolutely placed
    // copy (a zero-size inline-block sits on the baseline), so nothing is ever added to the line itself
    const m = document.createElement('span'); m.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap; left: 0; top: 0';
    m.innerHTML = '<span>字</span><span style="display: inline-block; width: 0; height: 0"></span>';
    (spans[0] ? spans[0].parentElement : sent).appendChild(m);
    const base = m.lastChild.getBoundingClientRect().top - m.firstChild.getBoundingClientRect().top;
    m.remove();
    const at = (c, after) => {     // in the sentence box's own coordinates (offsetLeft would be relative to each part)
      const r = c.getBoundingClientRect(), s = sent.getBoundingClientRect();
      caret.style.left = ((after ? r.right : r.left) - s.left - sent.clientLeft) + 'px'; caret.style.top = (r.top - s.top - sent.clientTop + base) + 'px';
      sent.appendChild(caret);     // (re)inserting restarts its blink, so it stays solid while typing, as before
    };
    typeTimers.push(setTimeout(() => spans[0] && at(spans[0], false), lead));
    // one timer both shows the character and moves the cursor, so the cursor never lags behind
    spans.forEach((c, k) => typeTimers.push(setTimeout(() => { c.style.visibility = ''; at(c, true); }, lead + k * gap)));
    const end = lead + spans.length * gap;
    typeTimers.push(setTimeout(() => caret.remove(), end + 1600));
    return end;
  }
  const [frames, , easing] = FX[name], duration = fxDur(name);
  sent.animate(frames, { duration, easing, delay: lead, fill: 'backwards' });
  return lead + duration;
}
