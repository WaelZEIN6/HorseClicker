// État central du jeu + sauvegarde localStorage.
import { STAMINA_START, OFFLINE_CAP_SEC } from './data.js';

const SAVE_KEY = 'horseclicker-save-v2';
const SAVE_VERSION = 2;

function defaults() {
  return {
    version: SAVE_VERSION,
    money: 0,
    totalEarned: 0,      // depuis le début (jamais remis à zéro)
    runEarned: 0,        // depuis le dernier prestige
    totalClicks: 0,
    stars: 0,
    trophies: 0,
    stamina: STAMINA_START,
    gauge: 0,
    foods: {},           // id -> niveau
    buildings: {},       // id -> quantité
    achievements: [],    // ids débloqués
    bestCombo: 0,
    missionsDone: 0,
    musicEnabled: true,
    lastTick: Date.now(),
  };
}

export const state = defaults();

// --- Pub/sub minimaliste ---------------------------------------------------
const listeners = new Map();
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event).delete(fn);
}
export function emit(event, payload) {
  const set = listeners.get(event);
  if (set) for (const fn of set) fn(payload);
}

// --- Sauvegarde -------------------------------------------------------------
export function save() {
  try {
    state.lastTick = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
}

/** Charge la sauvegarde. Renvoie le nombre de secondes d'absence (0 si nouvelle partie). */
export function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return 0; }
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== SAVE_VERSION) return 0;
    Object.assign(state, defaults(), data);
    const away = Math.max(0, (Date.now() - (data.lastTick || Date.now())) / 1000);
    return Math.min(away, OFFLINE_CAP_SEC);
  } catch (e) {
    return 0;
  }
}

export function resetAll() {
  Object.assign(state, defaults());
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  emit('reset');
}

/** Prestige : garde étoiles, trophées, succès, stats globales ; remet le reste à zéro. */
export function prestigeReset(trophiesGained) {
  const keep = {
    totalEarned: state.totalEarned,
    totalClicks: state.totalClicks,
    stars: state.stars,
    trophies: state.trophies + trophiesGained,
    achievements: state.achievements,
    bestCombo: state.bestCombo,
    missionsDone: state.missionsDone,
    musicEnabled: state.musicEnabled,
  };
  Object.assign(state, defaults(), keep);
  save();
  emit('prestige');
}
