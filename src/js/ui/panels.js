// Rendu des panneaux : argent, stamina, jauge, nourriture, bâtiments, combo, prestige.
import { state } from '../core/state.js';
import { FOODS, BUILDINGS, STAMINA_MAX, HORSE_TIERS } from '../core/data.js';
import {
  foodCost, buildingCost, buyFood, buyBuilding, staminaLevel, incomePerSec,
  gaugeTarget, prestigeAvailableTrophies, horseTier, clickValue,
} from '../core/economy.js';
import { fmt, fmtMoney } from './format.js';
import { sfx } from './sfx.js';
import { pulse } from './fx.js';

const $ = (sel) => document.querySelector(sel);
const refs = {};
let game = null; // injecté par main.js : { comboCount(), bonusActive() }

export function initPanels(gameApi) {
  game = gameApi;
  refs.money = $('#money-value');
  refs.income = $('#income-value');
  refs.stars = $('#stars-count');
  refs.trophies = $('#trophies-count');
  refs.stFill = $('.stamina-bar-fill');
  refs.stGlow = $('.stamina-bar-glow');
  refs.stValue = $('.stamina-value');
  refs.gaugeFill = $('.click-meter-fill');
  refs.gaugeLabel = $('.click-meter-label');
  refs.combo = $('#combo-indicator');
  refs.horseTitle = $('#horse-title');
  refs.prestigeBtn = $('#prestige-btn');
  refs.clickValue = $('#click-value');

  buildList($('#food-list'), FOODS, 'food');
  buildList($('#building-list'), BUILDINGS, 'building');
  refreshAll();
}

function buildList(host, items, kind) {
  host.innerHTML = '';
  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'Foods item-row ' + (kind === 'building' ? 'Building' : '');
    row.id = `${kind}-${item.id}`;
    row.dataset.kind = kind;
    const icon = kind === 'food'
      ? `<img class="UpgradeImage" src="./images/upgradefood/${item.img}" alt="">`
      : `<span class="UpgradeImage ItemIcon">${item.icon}</span>`;
    row.innerHTML = `
      ${icon}
      <div class="Name"></div>
      <div class="Number"></div>
      <div class="Price"></div>
      <button class="UpgradeButton">Acheter</button>`;
    row.title = kind === 'food'
      ? `+${item.stamina} stamina, +${Math.round(item.clickBonus * 100)} % par clic et par niveau`
      : `${item.desc} (+${fmt(item.income)} $/s chacun)`;
    row.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      const ok = kind === 'food' ? buyFood(item) : buyBuilding(item);
      if (ok) { sfx.buy(); pulse(row, 'bought'); refreshAll(); }
      else { sfx.denied(); pulse(refs.money, 'not-enough-money'); }
    });
    host.appendChild(row);
  }
}

// --- Rafraîchissements ---------------------------------------------------------
export function refreshAll() {
  refreshMoney();
  refreshStamina();
  refreshGauge();
  refreshShop();
  refreshPrestige();
  refreshHorseTitle();
}

export function refreshMoney() {
  refs.money.textContent = fmt(state.money);
  const inc = incomePerSec(game && game.bonusActive());
  refs.income.textContent = inc > 0 ? `+${fmt(inc)} $/s` : '';
  refs.stars.textContent = state.stars;
  refs.trophies.textContent = state.trophies;
  if (refs.clickValue) refs.clickValue.textContent = `${fmt(clickValue(game ? game.comboCount() : 0, game && game.bonusActive()))} $ / clic`;
}

let lastStaminaColor = '';
export function refreshStamina() {
  const pct = (state.stamina / STAMINA_MAX) * 100 + '%';
  refs.stFill.style.width = pct;
  refs.stGlow.style.width = pct;
  const lvl = staminaLevel();
  if (lvl.color !== lastStaminaColor) {
    lastStaminaColor = lvl.color;
    refs.stFill.style.background = `linear-gradient(to right, ${lvl.color}, ${lvl.color}dd)`;
    refs.stGlow.style.background = lvl.color;
    refs.stValue.style.color = lvl.color;
    refs.stValue.innerHTML = `<span>x${lvl.value}</span>`;
  }
}

export function refreshGauge() {
  const target = gaugeTarget();
  refs.gaugeFill.style.height = (state.gauge / target) * 100 + '%';
  refs.gaugeLabel.textContent = `Objectif : ${Math.floor(state.gauge)}/${target}`;
}

/** Met à jour prix, niveaux et état "abordable" des deux boutiques (10 fois/s max). */
export function refreshShop() {
  for (const f of FOODS) {
    const row = document.getElementById(`food-${f.id}`);
    const lvl = state.foods[f.id] || 0;
    const cost = foodCost(f);
    row.querySelector('.Name').textContent = `${f.name} (+${f.stamina + (lvl + 1) * 3})`;
    row.querySelector('.Number').textContent = `Nv ${lvl}`;
    row.querySelector('.Price').textContent = fmtMoney(cost);
    row.classList.toggle('affordable', state.money >= cost);
  }
  for (const b of BUILDINGS) {
    const row = document.getElementById(`building-${b.id}`);
    const n = state.buildings[b.id] || 0;
    const cost = buildingCost(b);
    row.querySelector('.Name').textContent = b.name;
    row.querySelector('.Number').textContent = `×${n} · ${fmt(b.income * n)} $/s`;
    row.querySelector('.Price').textContent = fmtMoney(cost);
    row.classList.toggle('affordable', state.money >= cost);
  }
}

export function refreshCombo(combo) {
  if (!refs.combo) return;
  if (combo >= 5) {
    refs.combo.textContent = `Combo ×${combo}`;
    refs.combo.classList.add('visible');
    refs.combo.classList.toggle('hot', combo >= 50);
  } else {
    refs.combo.classList.remove('visible', 'hot');
  }
}

export function refreshPrestige() {
  const t = prestigeAvailableTrophies();
  refs.prestigeBtn.classList.toggle('ready', t > 0);
  refs.prestigeBtn.textContent = t > 0
    ? `Nouvelle génération (+${t} 🏆)`
    : 'Nouvelle génération (100k $ gagnés requis)';
}

export function refreshHorseTitle() {
  const tier = horseTier();
  const next = HORSE_TIERS.find(t => t.min > state.trophies);
  refs.horseTitle.textContent = next
    ? `${tier.name} · prochain palier : ${next.min} 🏆`
    : `${tier.name} · palier maximal`;
}
