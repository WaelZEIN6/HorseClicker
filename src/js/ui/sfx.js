// Petits effets sonores synthétisés (aucun fichier audio nécessaire).
let ctx = null;
let enabled = true;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, duration, type = 'sine', gain = 0.08, when = 0) {
  const c = getCtx();
  if (!c || !enabled) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + when);
  g.gain.setValueAtTime(0, c.currentTime + when);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + duration);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + when);
  osc.stop(c.currentTime + when + duration + 0.02);
}

export const sfx = {
  setEnabled(v) { enabled = v; },
  unlock() { getCtx(); },
  /** "pop" dont la hauteur monte avec le combo */
  click(combo = 0) {
    const f = 440 + Math.min(combo, 60) * 12;
    tone(f, 0.08, 'triangle', 0.06);
  },
  buy() { tone(520, 0.08, 'square', 0.05); tone(780, 0.12, 'square', 0.05, 0.07); },
  denied() { tone(180, 0.15, 'sawtooth', 0.05); },
  star() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.07, i * 0.09)); },
  bonus() { [392, 523, 659].forEach((f, i) => tone(f, 0.2, 'triangle', 0.07, i * 0.06)); },
  mission(success) {
    if (success) { tone(660, 0.15, 'sine', 0.07); tone(990, 0.25, 'sine', 0.07, 0.12); }
    else { tone(300, 0.2, 'sawtooth', 0.05); tone(220, 0.3, 'sawtooth', 0.05, 0.15); }
  },
};
