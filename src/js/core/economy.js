// Toutes les formules du jeu, sans effet de bord sur le DOM.
import { state, emit } from './state.js';
import {
  FOODS, BUILDINGS, BUILDING_GROWTH, STAMINA_MAX, STAMINA_LEVELS,
  GAUGE_BASE_TARGET, COMBO_MAX, BONUS_CLICK_MULT, BONUS_INCOME_MULT,
  HORSE_TIERS, ACHIEVEMENTS, PRESTIGE_MIN_EARNED,
} from './data.js';

// --- Multiplicateurs ----------------------------------------------------------
export function prestigeMult() {
  return (1 + 0.1 * state.stars) * (1 + 0.25 * state.trophies);
}
export function achievementMult() {
  return 1 + 0.01 * state.achievements.length;
}
export function foodMult() {
  let m = 1;
  for (const f of FOODS) m += (state.foods[f.id] || 0) * f.clickBonus;
  return m;
}
export function staminaLevel() {
  return STAMINA_LEVELS.find(l => state.stamina >= l.threshold) || STAMINA_LEVELS[STAMINA_LEVELS.length - 1];
}
export function comboMult(combo) {
  return 1 + Math.min(combo, COMBO_MAX) / COMBO_MAX; // jusqu'à x2
}

// --- Valeurs -----------------------------------------------------------------
export function clickValue(combo = 0, bonusActive = false) {
  return foodMult() * staminaLevel().value * comboMult(combo)
    * (bonusActive ? BONUS_CLICK_MULT : 1) * prestigeMult() * achievementMult();
}

export function incomePerSec(bonusActive = false) {
  let base = 0;
  for (const b of BUILDINGS) base += (state.buildings[b.id] || 0) * b.income;
  return base * prestigeMult() * achievementMult() * (bonusActive ? BONUS_INCOME_MULT : 1);
}

export function foodCost(food) {
  return Math.ceil(food.baseCost * Math.pow(food.growth, state.foods[food.id] || 0));
}
export function buildingCost(b) {
  return Math.ceil(b.baseCost * Math.pow(BUILDING_GROWTH, state.buildings[b.id] || 0));
}

export function gaugeTarget() {
  return GAUGE_BASE_TARGET + 500 * state.stars;
}
export function gaugeReward() {
  return Math.round(1500 * prestigeMult() + 90 * incomePerSec());
}

// --- Prestige ------------------------------------------------------------------
export function prestigeAvailableTrophies() {
  if (state.runEarned < PRESTIGE_MIN_EARNED) return 0;
  return Math.floor(Math.sqrt(state.runEarned / PRESTIGE_MIN_EARNED));
}
export function horseTier() {
  let tier = HORSE_TIERS[0];
  for (const t of HORSE_TIERS) if (state.trophies >= t.min) tier = t;
  return tier;
}

// --- Actions -----------------------------------------------------------------
export function addMoney(amount) {
  if (amount <= 0) return;
  state.money += amount;
  state.totalEarned += amount;
  state.runEarned += amount;
}

export function spend(amount) {
  if (state.money < amount) return false;
  state.money -= amount;
  return true;
}

export function addStamina(amount) {
  state.stamina = Math.max(0, Math.min(STAMINA_MAX, state.stamina + amount));
}

export function buyFood(food) {
  const cost = foodCost(food);
  if (!spend(cost)) return false;
  state.foods[food.id] = (state.foods[food.id] || 0) + 1;
  addStamina(food.stamina + state.foods[food.id] * 3);
  emit('buy', { kind: 'food', item: food });
  return true;
}

export function buyBuilding(b) {
  const cost = buildingCost(b);
  if (!spend(cost)) return false;
  state.buildings[b.id] = (state.buildings[b.id] || 0) + 1;
  emit('buy', { kind: 'building', item: b });
  return true;
}

/** Vérifie les succès et renvoie ceux qui viennent d'être débloqués. */
export function checkAchievements() {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) continue;
    if (a.test(state)) {
      state.achievements.push(a.id);
      fresh.push(a);
    }
  }
  if (fresh.length) emit('achievement', fresh);
  return fresh;
}
