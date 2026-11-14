const SUFFIXES = ['', 'k', 'M', 'Md', 'T', 'Qa', 'Qi'];

/** 1234 -> "1.23k", 12 -> "12", 0.5 -> "0.5" */
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  const abs = Math.abs(n);
  if (abs < 1000) return abs < 10 && !Number.isInteger(n) ? n.toFixed(1) : Math.floor(n).toString();
  let i = 0;
  let v = abs;
  while (v >= 1000 && i < SUFFIXES.length - 1) { v /= 1000; i++; }
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return (n < 0 ? '-' : '') + s + SUFFIXES[i];
}

export function fmtMoney(n) { return fmt(n) + ' $'; }

export function fmtDuration(sec) {
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h} h ${m} min`;
  if (m) return `${m} min ${s} s`;
  return `${s} s`;
}
