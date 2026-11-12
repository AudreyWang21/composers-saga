// 作曲家烂梗机 · sound and music.
//  1. every press of 抽 plays a random sound effect, the way the entrance animations are random;
//  2. after the pause that follows 抽 (按下后停顿), a random clip of one of her kept pieces starts.
// The sound effects are synthesised here with Web Audio (no files, nothing to license).
// The clips are 25 s cuts from her anchors in 选曲.html, made by ../cut_clips.py into clips/.
// app.js calls Sound.onDraw(pause) inside the tap, and Sound.mount() once to fill the drawer's 设置 and 出处.
'use strict';

// ---------- settings, kept per browser ----------
const SOUND_KEY = 'zuoqujia-langeng-ji.prototype.v1';   // the old name stays, so friends keep their settings
const SET = { sfx: true, music: true, vol: 0.8 };
try { Object.assign(SET, JSON.parse(localStorage.getItem(SOUND_KEY)) || {}); } catch {}
const saveSet = () => { try { localStorage.setItem(SOUND_KEY, JSON.stringify(SET)); } catch {} };

// ---------- sound effects ----------
let ctx = null, sfxOut = null;
function audio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    // a limiter at the end, so short loud peaks (claps, the shutter) never clip at full volume
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.1;
    lim.connect(ctx.destination);
    sfxOut = ctx.createGain(); sfxOut.connect(lim);
  }
  if (ctx.state !== 'running') ctx.resume();   // 'suspended', or 'interrupted' after a call on iPhones
  sfxOut.gain.value = SET.vol;
  return ctx;
}
let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; return s;
}
// one oscillator note: type, frequency (or [from, to] glide), start, length, peak level, out node
function tone(type, f, t, len, peak, out, glide = 'exp') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  if (Array.isArray(f)) {
    o.frequency.setValueAtTime(f[0], t);
    glide === 'exp' ? o.frequency.exponentialRampToValueAtTime(f[1], t + len) : o.frequency.linearRampToValueAtTime(f[1], t + len);
  } else o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.01, len / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(out); o.start(t); o.stop(t + len + 0.05);
  return o;
}
// a burst of filtered noise
function hiss(t, len, peak, filter, freq, q, attack, out) {
  const s = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = filter; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + len + 0.05);
  return f;
}
// each effect: (start time, out node)
const SFX = {
  '嗖': (t, o) => { const f = hiss(t, 0.55, 0.5, 'bandpass', 300, 2, 0.25, o); f.frequency.exponentialRampToValueAtTime(3500, t + 0.5); },
  '叮': (t, o) => { tone('sine', 1318.5, t, 1.4, 0.35, o); tone('sine', 2637, t, 0.6, 0.12, o); tone('sine', 3951, t, 0.25, 0.05, o); },
  '叮咚': (t, o) => { tone('sine', 659.3, t, 1.1, 0.35, o); tone('sine', 1318.5, t, 0.4, 0.06, o); tone('sine', 523.3, t + 0.45, 1.5, 0.35, o); tone('sine', 1046.5, t + 0.45, 0.5, 0.06, o); },
  '咚嗒嚓': (t, o) => {                         // ba-dum-tss
    tone('sine', [180, 90], t, 0.25, 0.6, o); tone('sine', [140, 70], t + 0.16, 0.3, 0.6, o);
    hiss(t + 0.34, 1.1, 0.35, 'highpass', 7000, 0.7, 0.003, o);
  },
  '弹簧': (t, o) => {                           // boing
    const s = tone('sine', [140, 420], t, 0.7, 0.5, o, 'lin'), l = ctx.createOscillator(), d = ctx.createGain();
    l.frequency.value = 28; d.gain.setValueAtTime(60, t); d.gain.exponentialRampToValueAtTime(1, t + 0.7);
    l.connect(d).connect(s.frequency); l.start(t); l.stop(t + 0.75);
  },
  '滑哨': (t, o) => {                           // slide whistle, up
    const s = tone('sine', [420, 1700], t, 0.75, 0.3, o, 'exp'), l = ctx.createOscillator(), d = ctx.createGain();
    l.frequency.value = 7; d.gain.value = 18; l.connect(d).connect(s.frequency); l.start(t); l.stop(t + 0.8);
  },
  '激光': (t, o) => { tone('square', [1600, 140], t, 0.28, 0.18, o); tone('square', [1600, 140], t + 0.12, 0.28, 0.1, o); },
  '收银机': (t, o) => {                         // ka-ching
    hiss(t, 0.06, 0.4, 'bandpass', 3000, 2, 0.002, o); hiss(t + 0.07, 0.05, 0.3, 'bandpass', 2000, 2, 0.002, o);
    [2093, 2637, 3136, 4186].forEach((f, i) => tone('sine', f, t + 0.12 + i * 0.012, 1.1, 0.12, o));
  },
  '快门': (t, o) => { hiss(t, 0.04, 0.6, 'bandpass', 2500, 1, 0.001, o); hiss(t + 0.09, 0.06, 0.5, 'bandpass', 1500, 1, 0.001, o); },
  '锣': (t, o) => {
    const g = ctx.createGain(); g.gain.value = 0.9; g.connect(o);
    [[98, .35], [147, .2], [211, .22], [293, .14], [403, .1], [557, .06]].forEach(([f, a]) => tone('sine', f, t, 3.5, a, g));
    hiss(t, 1.6, 0.12, 'lowpass', 900, 0.5, 0.02, g);
  },
  '打字机': (t, o) => {
    [0, 0.13, 0.22, 0.36, 0.45].forEach(d => hiss(t + d, 0.03, 0.5, 'bandpass', 3200, 3, 0.001, o));
    tone('sine', 2093, t + 0.6, 0.9, 0.25, o); tone('sine', 4186, t + 0.6, 0.3, 0.06, o);
  },
  '啵': (t, o) => { tone('sine', [700, 180], t, 0.12, 0.6, o); hiss(t, 0.02, 0.2, 'highpass', 4000, 1, 0.001, o); },
  '鼓掌': (t, o) => {
    for (let i = 0; i < 70; i++) {
      const d = Math.random() * 1.6, len = 0.03 + Math.random() * 0.04;
      hiss(t + d, len, 0.05 + Math.random() * 0.12 * (1 - d / 2), 'bandpass', 1200 + Math.random() * 2500, 1.5, 0.002, o);
    }
  },
  '登登登登': (t, o) => {                       // ta-da fanfare
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400; f.connect(o);
    [[523.3, 0, .14], [659.3, .14, .14], [784, .28, .14], [1046.5, .42, .9]].forEach(([n, d, l]) => {
      tone('sawtooth', n, t + d, l, 0.12, f); tone('sawtooth', n * 1.005, t + d, l, 0.08, f);
    });
  },
  '失败长号': (t, o) => {                       // wah wah wah waaah
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6; f.connect(o);
    [[293.7, 0, .42], [277.2, .45, .42], [261.6, .9, .42], [247, 1.35, 1.2]].forEach(([n, d, l]) => {
      tone('sawtooth', n, t + d, l, 0.18, f);
      f.frequency.setValueAtTime(400, t + d); f.frequency.linearRampToValueAtTime(1500, t + d + 0.15); f.frequency.linearRampToValueAtTime(500, t + d + l);
    });
    const l = ctx.createOscillator(), dd = ctx.createGain(); l.frequency.value = 6; dd.gain.value = 300; l.connect(dd).connect(f.frequency); l.start(t + 1.35); l.stop(t + 2.6);
  },
  '风铃': (t, o) => { [1046.5, 1174.7, 1318.5, 1568, 1760, 2093, 2349.3].forEach((f, i) => tone('sine', f, t + i * 0.055, 0.9, 0.12, o)); },
};
const SFX_NAMES = Object.keys(SFX);
// measured peaks differ (嗖 0.10, 鼓掌 0.08 … 锣 0.56); these bring them near 0.35–0.45,
// then the short and noisy ones raised again by loudness (a reviewer measured 鼓掌, 快门, 啵 about 10 LU under the bells)
const LEVEL = { '嗖': 5, '鼓掌': 10, '激光': 2.6, '登登登登': 2.4, '失败长号': 2.1, '快门': 3, '滑哨': 1.6, '风铃': 1.6,
                '打字机': 1.7, '收银机': 1.2, '叮咚': 1.3, '叮': 1.1, '弹簧': 1, '咚嗒嚓': 0.85, '啵': 1.7, '锣': 0.75 };
// how long each effect sounds, in seconds (measured offline, to where it falls below 1% level)
const SFX_LEN = { '嗖': 0.4, '叮': 0.6, '叮咚': 1.13, '咚嗒嚓': 0.83, '弹簧': 0.32, '滑哨': 0.36, '激光': 0.26, '收银机': 0.74,
                  '快门': 0.12, '锣': 1.76, '打字机': 1.02, '啵': 0.07, '鼓掌': 1.61, '登登登登': 0.85, '失败长号': 1.96, '风铃': 0.79 };
let lastSfx = '';
const pickSfx = () => { let n; do n = SFX_NAMES[Math.floor(Math.random() * SFX_NAMES.length)]; while (n === lastSfx && SFX_NAMES.length > 1); return n; };
function playSfx(name) {
  audio();
  if (!name) name = pickSfx();
  lastSfx = name;
  // each effect through its own level, so they come out at about the same loudness
  const lv = ctx.createGain(); lv.gain.value = LEVEL[name] || 1; lv.connect(sfxOut);
  SFX[name](ctx.currentTime + 0.01, lv);
  const el = document.getElementById('pSfxNow'); if (el) el.textContent = name;
}

// ---------- music: one random kept clip, starting after the pause ----------
// Two players: on a press the old clip fades out on one while the new clip starts, muted, on the other.
// The new one's play() happens inside the tap itself (phones only allow sound that a tap starts);
// after the pause it jumps back to 0:00 and is unmuted.
const players = [new Audio(), new Audio()]; players.forEach(a => { a.preload = 'auto'; });
let cur = 0, recent = [], musicTimer = 0, nowClip = null, forcedClip = null;   // forcedClip: the next draw's piece, from the track list
const fades = new Map();
function nextClip() {
  const pool = CLIPS.filter((_, i) => !recent.includes(i));
  const i = CLIPS.indexOf(pool[Math.floor(Math.random() * pool.length)]);
  recent.push(i); if (recent.length > Math.min(10, CLIPS.length - 1)) recent.shift();
  return CLIPS[i];
}
// fade by counting steps, not by reading the volume back: iPhones ignore volume writes (it then just stops after 180 ms)
function fadeOut(a) {
  clearInterval(fades.get(a)); fades.delete(a);
  if (a.paused) return;
  const v0 = a.volume; let k = 0;
  fades.set(a, setInterval(() => {
    if (++k >= 6) { clearInterval(fades.get(a)); fades.delete(a); a.pause(); a.volume = SET.vol; }
    else a.volume = v0 * (1 - k / 6);
  }, 30));
}
function stopMusic() { clearTimeout(musicTimer); players.forEach(fadeOut); markPlaying(null); }
function startMusic(pause) {
  stopMusic();
  if ((!SET.music && !forcedClip) || !CLIPS.length) return;
  const previewing = !!forcedClip;
  const clip = forcedClip || nextClip(); forcedClip = null;
  cur = 1 - cur;
  const a = players[cur];
  clearInterval(fades.get(a)); fades.delete(a);
  a.src = clip.file; a.dataset.clip = ''; a.muted = true; a.volume = SET.vol;
  const p = a.play(); if (p) p.catch(err => console.warn('music: muted start refused', err));
  musicTimer = setTimeout(() => {
    if (!SET.music && !previewing) { a.pause(); return; }
    try { a.currentTime = 0; } catch {}
    a.muted = false; a.volume = SET.vol;
    const q = a.play(); if (q) q.catch(err => console.warn('music: unmute refused', err));
    nowClip = clip; showNow();
    if ('mediaSession' in navigator && window.MediaMetadata)
      navigator.mediaSession.metadata = new MediaMetadata({ title: clip.hit || clip.title, artist: clip.composer, album: '作曲家烂梗机' });
  }, pause);
}
function markPlaying(btn) {
  document.querySelectorAll('[data-clip].on').forEach(x => x.classList.remove('on'));
  if (btn) btn.classList.add('on');
}
// "composer · piece（performer，year）" for the 刚才的音乐 line. The piece is her hit name when there is one, else the
// recording's title with only safe trimming: a track number, the composer's own name at either end, a file extension.
// The performer is the recording's own, or a Commons credit that reads like a name (not an uploader or a note);
// other composers listed among an album's performers are left out.
const LATIN = { 维瓦尔第: 'Vivaldi', 巴赫: 'Bach', 亨德尔: 'Handel', 莫扎特: 'Mozart', 贝多芬: 'Beethoven', 舒伯特: 'Schubert', 帕格尼尼: 'Paganini',
                柏辽兹: 'Berlioz', 马勒: 'Mahler', 柴可夫斯基: 'Tchaikovsky', 门德尔松: 'Mendelssohn', 肖邦: 'Chopin', 李斯特: 'Liszt' };
// a performer entry that is only a composer's name ("Felix Mendelssohn-Bartholdy"), not "Mozarteum Orchestra"
const COMPOSERS = /^(?:[A-Z][\w.]*\s+)*(?:Vivaldi|Bach|Handel|Händel|Mozart|Beethoven|Schubert|Paganini|Berlioz|Mahler|Tchaikovsky|Mendelssohn(?:-Bartholdy)?|Chopin|Liszt|Gounod)$/;
function clipLabel(c) {
  let piece = c.hit;
  if (!piece) {
    const n = LATIN[c.composer], name = n ? `(?:(?:[A-Z][\\w.]*|van)\\s+){0,3}${n}(?:,\\s*[A-Z]\\w*\\s+van)?` : null;
    const lit = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    piece = c.title.replace(/\.(ogg|oga|mp3|flac|wav|webm)$/i, '').replace(/^\d+\s*[-.]\s*/, '');
    if (c.credit) piece = piece.replace(new RegExp(`^${lit(c.credit)}\\s*[-–—]\\s*`), '').replace(new RegExp(`\\s*${lit(c.credit)}$`), '');
    if (name) piece = piece.replace(new RegExp(`^${name}\\s*[-–—,:]?\\s+`), '').replace(new RegExp(`\\s+[-–—]\\s+${name}$`), '').replace(new RegExp(`\\s*\\(${n}\\)$`), '');
    if (!piece.trim()) piece = c.title;
  }
  const credit = c.credit && c.credit.length <= 60 && !/[:\d]|^Music by|^user|Archive$/i.test(c.credit) ? c.credit : '';
  const who = (c.performer || credit).split(/,\s*/).filter(x => !COMPOSERS.test(x)).join(', ');
  return `${c.composer} · ${piece}${who || c.year ? '（' + [who, c.year].filter(Boolean).join('，') + '）' : ''}`;
}
function showNow() {
  const el = document.getElementById('pMusicNow'); if (!el) return;
  el.textContent = nowClip ? clipLabel(nowClip) : '（还没有）';
}
// on iPhones, let effects and music both follow the same rules (both play through the silent switch)
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}

const Sound = {
  // called by app.js inside the tap: picks and plays the effect, starts the next clip muted, and returns the quiet
  // pause before the show. A long effect stretches that pause, so the show and the music start as it is finishing.
  onDraw(base) {
    const name = SET.sfx ? pickSfx() : null;
    const pause = name && !reduceMotion() ? Math.max(base, (SFX_LEN[name] - 0.2) * 1000) : base;
    if (name) playSfx(name);
    if (SET.music || forcedClip) startMusic(pause); else stopMusic();
    return pause;
  },

  // the drawer's 设置 (two switches, the volume, and the piece that just played; the tuning page adds the effect that
  // just played and a preview of every effect and piece), and the music credits at its very bottom
  mount(tools) {
    const box = document.getElementById('soundSettings');
    box.innerHTML = `
    <div class="dsec">设置</div>
    <label class="pRow"><input type="checkbox" id="pSfx"> 每次抽的时候放一个音效</label>
    <label class="pRow"><input type="checkbox" id="pMusic"> 停顿之后放一段音乐</label>
    <label class="pRow">音量 <input type="range" id="pVol" min="0" max="1" step="0.05"></label>` + (!tools ? '' : `
    <div class="pRow pSmall">刚才的音效：<span id="pSfxNow">（还没有）</span></div>`) + `
    <div class="pRow pSmall">刚才的音乐：<span id="pMusicNow">（还没有）</span></div>` + (!tools ? '' : `
    <details class="pRow"><summary>试听每个音效</summary><div class="pChips">${SFX_NAMES.map(n => `<button type="button" data-sfx="${n}">${n}</button>`).join('')}</div></details>
    <details class="pRow"><summary>试听每段音乐（${CLIPS.length}）</summary><ol class="pTracks">${CLIPS.map((c, i) =>
      `<li><button type="button" data-clip="${i}">${String(i + 1).padStart(2, '0')}　${c.composer} · ${esc(c.hit || c.title)}</button></li>`).join('')}</ol></details>`);
    const sfx = box.querySelector('#pSfx'), mus = box.querySelector('#pMusic'), vol = box.querySelector('#pVol');
    sfx.checked = SET.sfx; mus.checked = SET.music; vol.value = SET.vol;
    sfx.onchange = () => { SET.sfx = sfx.checked; saveSet(); };
    mus.onchange = () => { SET.music = mus.checked; saveSet(); if (!SET.music) stopMusic(); };
    vol.oninput = () => { SET.vol = +vol.value; saveSet(); if (sfxOut) sfxOut.gain.value = SET.vol; players.forEach(a => { if (!a.paused && !a.muted && !fades.has(a)) a.volume = SET.vol; }); };
    box.querySelectorAll('[data-sfx]').forEach(b => b.addEventListener('click', () => playSfx(b.dataset.sfx)));
    // a track in the list: close the drawer and do a real draw with that piece as its music
    box.querySelectorAll('[data-clip]').forEach(b => b.addEventListener('click', () => {
      if (busy) return;
      forcedClip = CLIPS[+b.dataset.clip];
      setDrawer(false);
      one();
      markPlaying(b);
    }));
    // space on these controls works the control, not the page's draw key
    ['keydown', 'keyup'].forEach(ev => box.addEventListener(ev, e => { if (e.key === ' ') e.stopPropagation(); }));
    // dragging the volume slider is not a swipe to close the drawer
    vol.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
    vol.addEventListener('touchend', e => e.stopPropagation(), { passive: true });
    showNow();
    document.getElementById('clipCredits').innerHTML = CLIPS.map((c, i) =>
      `<li>${String(i + 1).padStart(2, '0')}　${esc(c.title)}${c.credit ? '，' + esc(c.credit) : ''}${c.year ? '，' + c.year : ''}。<a href="${c.page}" target="_blank" rel="noopener">${/archive\.org/.test(c.page || '') ? 'Internet Archive' : 'Wikimedia Commons'}</a>，${c.licUrl ? `<a href="${c.licUrl}" target="_blank" rel="noopener">${esc(c.lic)}</a>` : esc(c.lic || '')}</li>`).join('');
  },
};
