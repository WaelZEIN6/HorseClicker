// Point d'entrée : une seule boucle requestAnimationFrame pour la logique,
// les deux scènes 3D et le rafraîchissement de l'interface.
import { state, load, save, resetAll, prestigeReset, on } from './core/state.js';
import {
  STAMINA_MAX, GAUGE_DECAY_PER_SEC, COMBO_WINDOW, OFFLINE_RATE, ACHIEVEMENTS,
} from './core/data.js';
import {
  clickValue, incomePerSec, addMoney, addStamina, gaugeTarget, gaugeReward,
  checkAchievements, prestigeAvailableTrophies, horseTier, staminaLevel, comboMult,
} from './core/economy.js';
import {
  initPanels, refreshAll, refreshMoney, refreshStamina, refreshGauge, refreshShop,
  refreshCombo, refreshPrestige, refreshHorseTitle,
} from './ui/panels.js';
import { floatNumber, toast, confetti, modal } from './ui/fx.js';
import { fmt, fmtMoney, fmtDuration } from './ui/format.js';
import { sfx } from './ui/sfx.js';
import { initMissions, tickMissions, onClickForMission, hideMissions } from './systems/missions.js';
import { bonus, tickBonus, resetBonus } from './systems/bonus.js';
import { initMusic } from './systems/music.js';
import { initHorseScene, setHorseVisible, updateHorse, horseClick, applyTier, resize as resizeHorse } from './three/horse.js';
import { initMenuScene, setMenuVisible, updateMenu } from './three/menu.js';
import { initFullscreen } from './systems/fullscreen.js';

const $ = (s) => document.querySelector(s);

// --- État de session (non sauvegardé) -----------------------------------------
let inGame = false;
let combo = 0;
let comboTimer = 0;
let uiAcc = 0;
let saveAcc = 0;
let achAcc = 0;
let incomeFloatAcc = 0;

const api = { comboCount: () => combo, bonusActive: () => bonus.active() };

// --- Démarrage ----------------------------------------------------------------
function boot() {
  const away = load();

  initPanels(api);
  initMissions();
  initMusic();
  initFullscreen();
  initHorseScene($('#Model3D'));
  setupMenu();
  setupClicks();
  setupButtons();
  syncHorseTier();

  if (away > 60) grantOffline(away);

  on('buy', () => { refreshShop(); refreshMoney(); refreshPrestige(); });
  on('achievement', (list) => list.forEach(a => toast(`Succès : ${a.name}`, `${a.desc} (+1 % revenus)`, '🏅')));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); lastFrame = 0; }
    else {
      const away = (Date.now() - state.lastTick) / 1000;
      if (away > 5) grantOffline(away, true);
    }
  });
  window.addEventListener('beforeunload', save);

  requestAnimationFrame(frame);
}

function grantOffline(seconds, silent = false) {
  const gain = incomePerSec() * seconds * OFFLINE_RATE;
  if (gain < 1) return;
  addMoney(gain);
  refreshAll();
  if (silent) toast('Bon retour !', `+${fmt(gain)} $ gagnés pendant ton absence`, '💤');
  else modal({
    title: 'Pendant ton absence…',
    html: `<p>Ton cheval a travaillé <b>${fmtDuration(seconds)}</b>.</p>
           <p class="big">+${fmtMoney(gain)}</p>
           <p class="muted">Gains hors-ligne à ${OFFLINE_RATE * 100} % du revenu passif, plafonnés à 8 h.</p>`,
    buttons: [{ label: 'Merci !' }],
  });
}

// --- Menu ↔ jeu -----------------------------------------------------------------
function setupMenu() {
  const menu = $('#main-menu');
  const gameUI = $('#game-ui');
  const progress = $('.progress-bar-container');
  const bar = $('.div');
  const startBtn = $('#start-game-btn');

  initMenuScene($('#menu-container'), {
    onProgress: (p) => { bar.style.backgroundPosition = `${(1 - p) * 100}% 0`; },
    onLoad: () => { progress.style.display = 'none'; startBtn.style.display = 'block'; },
  });

  const showGame = () => {
    inGame = true;
    menu.style.display = 'none';
    gameUI.style.display = 'block';
    setMenuVisible(false);
    setHorseVisible(true);
    resizeHorse();
    refreshAll();
    sessionStorage.setItem('inGame', 'true');
  };
  const showMenu = () => {
    inGame = false;
    gameUI.style.display = 'none';
    menu.style.display = 'flex';
    setMenuVisible(true);
    setHorseVisible(false);
    hideMissions();
    save();
    sessionStorage.setItem('inGame', 'false');
  };

  startBtn.addEventListener('click', () => { sfx.unlock(); showGame(); });
  $('#back-to-menu-btn').addEventListener('click', showMenu);
  startBtn.textContent = state.totalClicks > 0 ? 'Continuer' : 'Commencer';

  if (sessionStorage.getItem('inGame') === 'true') showGame();
}

// --- Clics ---------------------------------------------------------------------
function setupClicks() {
  const target = $('#Model3D');
  target.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    doClick(e.clientX, e.clientY);
  });
  // Barre d'espace = clic (accessibilité / confort)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && inGame && !e.repeat) {
      e.preventDefault();
      const r = target.getBoundingClientRect();
      doClick(r.left + r.width / 2, r.top + r.height / 2);
    }
  });
}

function doClick(x, y) {
  combo = comboTimer > 0 ? combo + 1 : 1;
  comboTimer = COMBO_WINDOW;
  if (combo > state.bestCombo) state.bestCombo = combo;

  const value = clickValue(combo, bonus.active());
  addMoney(value);
  state.totalClicks++;
  state.gauge += staminaLevel().value * comboMult(combo);
  onClickForMission();

  floatNumber(x, y - 10, value, bonus.active() ? 'gold' : combo >= 50 ? 'hot' : '');
  horseClick(Math.min(1, 0.5 + combo / 100));
  sfx.click(combo);
  refreshCombo(combo);

  if (state.gauge >= gaugeTarget()) completeGauge();
}

function completeGauge() {
  const reward = gaugeReward();
  state.gauge = 0;
  state.stars++;
  addMoney(reward);
  sfx.star();
  confetti(60);
  toast('Jauge remplie !', `+1 ⭐ (+10 % revenus permanents) et +${fmt(reward)} $`, '⭐');
  refreshAll();
}

// --- Boutons ------------------------------------------------------------------
function setupButtons() {
  $('#prestige-btn').addEventListener('click', () => {
    const t = prestigeAvailableTrophies();
    if (t <= 0) {
      toast('Pas encore', `Gagne ${fmtMoney(1e5)} au cours de cette génération pour débloquer le prestige.`, '🔒');
      return;
    }
    modal({
      title: 'Nouvelle génération',
      html: `<p>Tu obtiens <b>${t} 🏆</b> (+${t * 25} % revenus permanents).</p>
             <p>Argent, bâtiments et nourriture repartent à zéro. Étoiles, trophées et succès sont conservés.</p>`,
      buttons: [
        { label: 'Lancer la nouvelle génération', cls: 'primary', onClick: () => doPrestige(t) },
        { label: 'Annuler' },
      ],
    });
  });

  $('#reset-btn').addEventListener('click', () => {
    modal({
      title: 'Tout effacer ?',
      html: '<p>La sauvegarde sera supprimée définitivement.</p>',
      buttons: [
        { label: 'Effacer', cls: 'danger', onClick: () => { resetAll(); resetBonus(); combo = 0; syncHorseTier(); refreshAll(); $('#start-game-btn').textContent = 'Commencer'; } },
        { label: 'Annuler' },
      ],
    });
  });

  $('#achievements-btn').addEventListener('click', () => {
    const rows = ACHIEVEMENTS.map(a => {
      const ok = state.achievements.includes(a.id);
      return `<li class="${ok ? 'done' : ''}"><span>${ok ? '🏅' : '🔒'}</span><div><b>${a.name}</b><br><small>${a.desc}</small></div></li>`;
    }).join('');
    modal({
      title: `Succès (${state.achievements.length}/${ACHIEVEMENTS.length})`,
      html: `<ul class="ach-list">${rows}</ul>`,
    });
  });
}

function doPrestige(t) {
  prestigeReset(t);
  resetBonus();
  combo = 0;
  syncHorseTier();
  confetti(80);
  sfx.star();
  toast('Nouvelle génération !', `${horseTier().name} — +${t} 🏆`, '🏆');
  refreshAll();
}

function syncHorseTier() {
  const tier = horseTier();
  applyTier(tier.scale, tier.halo);
  refreshHorseTitle();
}

// --- Boucle principale ----------------------------------------------------------
let lastFrame = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!lastFrame) { lastFrame = now; return; }
  const dt = Math.min(0.25, (now - lastFrame) / 1000);
  lastFrame = now;

  tick(dt);

  if (inGame) updateHorse(dt);
  else updateMenu(dt);
}

function tick(dt) {
  // Revenu passif
  const income = incomePerSec(bonus.active());
  if (income > 0) {
    addMoney(income * dt);
    incomeFloatAcc += dt;
    if (inGame && incomeFloatAcc >= 1) {
      incomeFloatAcc = 0;
      const r = $('#Model3D').getBoundingClientRect();
      floatNumber(r.left + r.width * 0.5, r.top + 20, income, 'passive');
    }
  }

  // Stamina : fond lentement, plus vite quand elle est haute
  const decay = state.stamina > 150 ? 1.2 : 0.6;
  if (inGame) addStamina(-decay * dt);

  // Jauge : décroissance
  if (state.gauge > 0) state.gauge = Math.max(0, state.gauge - GAUGE_DECAY_PER_SEC * dt);

  // Combo
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) { combo = 0; refreshCombo(0); }
  }

  tickBonus(dt, inGame);
  if (inGame) tickMissions(dt);

  // Interface à ~10 Hz
  uiAcc += dt;
  if (uiAcc >= 0.1) {
    uiAcc = 0;
    if (inGame) { refreshMoney(); refreshStamina(); refreshGauge(); refreshShop(); }
  }

  achAcc += dt;
  if (achAcc >= 1) { achAcc = 0; checkAchievements(); refreshPrestige(); }

  saveAcc += dt;
  if (saveAcc >= 10) { saveAcc = 0; save(); }
}

document.addEventListener('DOMContentLoaded', boot);
