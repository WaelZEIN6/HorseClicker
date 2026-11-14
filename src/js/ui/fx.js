// Effets visuels : nombres flottants, toasts, confettis, modales.
import { fmt } from './format.js';

const MAX_FLOATERS = 40;
let floaters = 0;

/** Affiche "+12" qui flotte vers le haut depuis (x, y) en pixels écran. */
export function floatNumber(x, y, value, cls = '') {
  if (floaters >= MAX_FLOATERS) return;
  floaters++;
  const el = document.createElement('div');
  el.className = 'float-number ' + cls;
  el.textContent = '+' + fmt(value);
  el.style.left = x + (Math.random() * 40 - 20) + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => { el.remove(); floaters--; }, { once: true });
}

const toastHost = () => {
  let h = document.getElementById('toast-host');
  if (!h) {
    h = document.createElement('div');
    h.id = 'toast-host';
    document.body.appendChild(h);
  }
  return h;
};

export function toast(title, text = '', icon = '✨', duration = 3500) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-icon">${icon}</span><div><div class="toast-title"></div><div class="toast-text"></div></div>`;
  el.querySelector('.toast-title').textContent = title;
  el.querySelector('.toast-text').textContent = text;
  toastHost().appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

export function confetti(count = 50) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * window.innerWidth + 'px';
      c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 55%)`;
      c.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(c);
      c.addEventListener('animationend', () => c.remove(), { once: true });
    }, Math.random() * 800);
  }
}

/**
 * Modale générique. buttons = [{label, cls, onClick}]. Renvoie une fonction de fermeture.
 */
export function modal({ title, html, buttons = [{ label: 'OK' }] }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2 class="modal-title"></h2>
      <div class="modal-body"></div>
      <div class="modal-buttons"></div>
    </div>`;
  overlay.querySelector('.modal-title').textContent = title;
  overlay.querySelector('.modal-body').innerHTML = html;
  const close = () => overlay.remove();
  const btnHost = overlay.querySelector('.modal-buttons');
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.className = 'modal-btn ' + (b.cls || '');
    btn.textContent = b.label;
    btn.addEventListener('click', () => { close(); if (b.onClick) b.onClick(); });
    btnHost.appendChild(btn);
  }
  document.body.appendChild(overlay);
  return close;
}

/** Flash court sur un élément (ex. achat réussi). */
export function pulse(el, cls = 'pulse') {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // relance l'animation
  el.classList.add(cls);
}
