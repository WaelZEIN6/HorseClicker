// Fer à cheval doré : apparaît de temps en temps, x5 au clic et x2 revenu pendant 30 s.
import { BONUS_DURATION } from '../core/data.js';
import { sfx } from '../ui/sfx.js';
import { toast } from '../ui/fx.js';

let remaining = 0;
let spawnTimer = 20;
let bubble = null;
let banner = null;

export const bonus = {
  active: () => remaining > 0,
  remaining: () => remaining,
};

function spawn() {
  bubble = document.createElement('div');
  bubble.className = 'bonus-bubble';
  bubble.innerHTML = '🧲 <b>BONUS ×5</b>';
  bubble.style.left = `${Math.random() * 70 + 15}%`;
  document.body.appendChild(bubble);
  bubble.addEventListener('click', activate, { once: true });
  bubble.addEventListener('animationend', () => { if (bubble) { bubble.remove(); bubble = null; } }, { once: true });
}

function activate() {
  if (bubble) { bubble.remove(); bubble = null; }
  remaining = BONUS_DURATION;
  sfx.bonus();
  toast('Bonus activé !', 'Clics ×5 et revenus ×2 pendant 30 s', '🧲');
  document.body.classList.add('bonus-active');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'bonus-banner';
    document.body.appendChild(banner);
  }
}

export function tickBonus(dt, inGame) {
  if (remaining > 0) {
    remaining -= dt;
    if (banner) banner.textContent = `Bonus ×5 actif — ${Math.ceil(remaining)} s`;
    if (remaining <= 0) {
      remaining = 0;
      document.body.classList.remove('bonus-active');
      if (banner) { banner.remove(); banner = null; }
    }
    return;
  }
  if (!inGame || bubble) return;
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnTimer = 25 + Math.random() * 35;
    spawn();
  }
}

export function resetBonus() {
  remaining = 0;
  document.body.classList.remove('bonus-active');
  if (banner) { banner.remove(); banner = null; }
  if (bubble) { bubble.remove(); bubble = null; }
}
