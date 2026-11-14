// Missions générées dynamiquement et adaptées au niveau du joueur.
import { state, emit } from '../core/state.js';
import { BUILDINGS, STAMINA_MAX } from '../core/data.js';
import { incomePerSec, clickValue, addMoney, addStamina } from '../core/economy.js';
import { fmt } from '../ui/format.js';
import { sfx } from '../ui/sfx.js';
import { confetti } from '../ui/fx.js';

const UNLOCK_CLICKS = 10;
const COOLDOWN_SUCCESS = 20;
const COOLDOWN_FAIL = 30;

let els = null;
let mission = null;      // mission active
let timeLeft = 0;
let cooldown = 0;
let resultTimer = 0;     // secondes d'affichage du résultat
let clicksInMission = 0;
let startSnapshot = {};

function countBuildings() {
  return Object.values(state.buildings).reduce((a, b) => a + b, 0);
}

// Chaque générateur renvoie {name, desc, time, target, progress(), reward}
const GENERATORS = [
  () => {
    const n = Math.min(400, 40 + Math.floor(state.missionsDone * 12));
    const t = Math.round(n / 6) + 5;
    return { name: 'Cadence', desc: `Effectue ${n} clics en ${t} s`, time: t, target: n, progress: () => clicksInMission };
  },
  () => {
    const x = Math.ceil(clickValue() * 60 + incomePerSec() * 45);
    return { name: 'Récolte', desc: `Gagne ${fmt(x)} $ en 30 s`, time: 30, target: x, progress: () => state.totalEarned - startSnapshot.earned };
  },
  () => {
    const k = 2 + Math.floor(state.missionsDone / 3);
    return { name: 'Expansion', desc: `Achète ${k} bâtiments en 45 s`, time: 45, target: k, progress: () => countBuildings() - startSnapshot.buildings };
  },
  () => ({
    name: 'Pleine forme', desc: 'Monte la stamina à 250 en 40 s', time: 40, target: 250,
    progress: () => state.stamina,
  }),
  () => {
    const g = Math.min(800, 150 + state.missionsDone * 30);
    return { name: 'Jauge', desc: `Remplis la jauge de ${g} points en 30 s`, time: 30, target: g, progress: () => state.gauge - startSnapshot.gauge };
  },
  () => {
    const b = BUILDINGS[Math.min(BUILDINGS.length - 1, Math.floor(state.missionsDone / 4))];
    const target = (state.buildings[b.id] || 0) + 1;
    return { name: 'Recrutement', desc: `Possède ${target} × ${b.name} en 60 s`, time: 60, target, progress: () => state.buildings[b.id] || 0 };
  },
];

function pickMission() {
  const gen = GENERATORS[Math.floor(Math.random() * GENERATORS.length)]();
  const reward = {
    money: Math.ceil(50 + incomePerSec() * 25 + clickValue() * 40),
    stamina: 30,
  };
  return { ...gen, reward };
}

export function initMissions() {
  els = {
    box: document.querySelector('.mission-container'),
    title: document.getElementById('mission-title'),
    desc: document.getElementById('mission-description'),
    fill: document.getElementById('mission-progress-fill'),
    progress: document.getElementById('mission-progress'),
    time: document.getElementById('mission-time'),
    bar: document.querySelector('.mission-progress-bar'),
    info: document.querySelector('.mission-info'),
    result: document.getElementById('mission-result'),
    reward: document.getElementById('mission-reward'),
    resultBox: document.getElementById('mission-result-container'),
    delayBox: document.getElementById('mission-delay-container'),
    delay: document.getElementById('mission-delay-counter'),
  };
  els.box.style.display = 'none';
  cooldown = 0;
}

export function onClickForMission() {
  if (mission) clicksInMission++;
}

function startMission() {
  mission = pickMission();
  clicksInMission = 0;
  timeLeft = mission.time;
  startSnapshot = { earned: state.totalEarned, buildings: countBuildings(), gauge: state.gauge };
  els.box.style.display = 'block';
  els.box.style.animation = 'missionAppear 0.4s ease-out';
  els.resultBox.style.display = 'none';
  els.delayBox.style.display = 'none';
  els.bar.style.display = 'block';
  els.info.style.display = 'flex';
  els.title.textContent = mission.name;
  els.desc.textContent = mission.desc;
  render();
}

function render() {
  const p = Math.max(0, mission.progress());
  els.progress.textContent = `${fmt(Math.min(p, mission.target))}/${fmt(mission.target)}`;
  els.fill.style.width = Math.min(100, (p / mission.target) * 100) + '%';
  els.time.textContent = `Temps : ${Math.ceil(timeLeft)} s`;
}

function endMission(success) {
  els.resultBox.style.display = 'block';
  els.bar.style.display = 'none';
  els.info.style.display = 'none';
  els.result.textContent = success ? 'Mission réussie !' : 'Mission échouée';
  els.result.className = 'mission-result ' + (success ? 'success' : 'failure');
  if (success) {
    addMoney(mission.reward.money);
    addStamina(mission.reward.stamina);
    state.missionsDone++;
    els.reward.textContent = `+${fmt(mission.reward.money)} $ et +${mission.reward.stamina} stamina`;
    confetti(25);
    emit('money');
  } else {
    els.reward.textContent = 'La prochaine sera plus clémente…';
  }
  sfx.mission(success);
  mission = null;
  resultTimer = 3;
  cooldown = success ? COOLDOWN_SUCCESS : COOLDOWN_FAIL;
}

/** Appelé par la boucle principale à chaque frame. */
export function tickMissions(dt) {
  if (!els) return;
  if (mission) {
    timeLeft -= dt;
    render();
    if (mission.progress() >= mission.target) endMission(true);
    else if (timeLeft <= 0) endMission(false);
    return;
  }
  if (resultTimer > 0) {
    resultTimer -= dt;
    if (resultTimer <= 0) {
      els.resultBox.style.display = 'none';
      els.delayBox.style.display = 'block';
      els.title.textContent = 'Prochaine mission';
      els.desc.textContent = 'Prépare-toi…';
    }
    return;
  }
  if (state.totalClicks < UNLOCK_CLICKS) return;
  cooldown -= dt;
  if (els.box.style.display !== 'none') els.delay.textContent = `${Math.max(0, Math.ceil(cooldown))} s`;
  if (cooldown <= 0) startMission();
}

export function hideMissions() {
  if (els) els.box.style.display = 'none';
}
