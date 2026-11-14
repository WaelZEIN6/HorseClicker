// Tables de données du jeu : nourritures, bâtiments, paliers du cheval, succès.

export const FOODS = [
  { id: 'carrot', name: 'Carottes',    img: 'Carrot.png',       baseCost: 20,    growth: 1.25, stamina: 20,  clickBonus: 0.02 },
  { id: 'hay',    name: 'Foin',        img: 'hay-roll.png',     baseCost: 120,   growth: 1.25, stamina: 45,  clickBonus: 0.05 },
  { id: 'oats',   name: 'Granulés',    img: 'oats.png',         baseCost: 700,   growth: 1.25, stamina: 90,  clickBonus: 0.12 },
  { id: 'apple',  name: 'Pomme',       img: 'apple.png',        baseCost: 4000,  growth: 1.25, stamina: 150, clickBonus: 0.3 },
  { id: 'golden', name: 'Pomme dorée', img: 'golden-apple.png', baseCost: 25000, growth: 1.3,  stamina: 300, clickBonus: 1 },
];

export const BUILDINGS = [
  { id: 'groom',   name: 'Palefrenier', icon: '🧹', baseCost: 15,      income: 0.1,  desc: 'Brosse le cheval et ramasse quelques pièces.' },
  { id: 'trough',  name: 'Abreuvoir',   icon: '🪣', baseCost: 100,     income: 1,    desc: 'Un cheval bien hydraté travaille mieux.' },
  { id: 'stable',  name: 'Écurie',      icon: '🏠', baseCost: 1100,    income: 8,    desc: 'Un toit, de la paille, et des visiteurs payants.' },
  { id: 'pasture', name: 'Pâturage',    icon: '🌾', baseCost: 12000,   income: 47,   desc: 'De l’herbe à perte de vue.' },
  { id: 'arena',   name: 'Manège',      icon: '🏟️', baseCost: 130000,  income: 260,  desc: 'Des cours d’équitation toute la journée.' },
  { id: 'stud',    name: 'Haras',       icon: '🏆', baseCost: 1.4e6,   income: 1400, desc: 'Les champions de demain naissent ici.' },
];

export const BUILDING_GROWTH = 1.15;

export const STAMINA_MAX = 300;
export const STAMINA_START = 100;
// Paliers de multiplicateur selon la stamina (du plus haut au plus bas).
export const STAMINA_LEVELS = [
  { threshold: 250, value: 3,   color: '#4CAF50' },
  { threshold: 120, value: 2,   color: '#8BC34A' },
  { threshold: 60,  value: 1.5, color: '#FF9800' },
  { threshold: 0,   value: 1,   color: '#F44336' },
];

export const GAUGE_BASE_TARGET = 1500;
export const GAUGE_DECAY_PER_SEC = 4;

export const COMBO_WINDOW = 0.6; // secondes entre deux clics pour garder le combo
export const COMBO_MAX = 100;

export const BONUS_DURATION = 30;      // secondes
export const BONUS_CLICK_MULT = 5;
export const BONUS_INCOME_MULT = 2;

export const OFFLINE_CAP_SEC = 8 * 3600;
export const OFFLINE_RATE = 0.5;

export const PRESTIGE_MIN_EARNED = 1e5;

// Apparence du cheval selon le nombre de trophées.
export const HORSE_TIERS = [
  { min: 0, name: 'Poulain',  scale: 0.85, halo: 0xffff00 },
  { min: 1, name: 'Cheval',   scale: 1,    halo: 0x9be7ff },
  { min: 3, name: 'Étalon',   scale: 1.08, halo: 0xc084fc },
  { min: 6, name: 'Champion', scale: 1.15, halo: 0xffd700 },
];

export const ACHIEVEMENTS = [
  { id: 'click1',     name: 'Premier contact',    desc: 'Cliquer sur le cheval',             test: s => s.totalClicks >= 1 },
  { id: 'click100',   name: 'Main chaude',        desc: '100 clics',                         test: s => s.totalClicks >= 100 },
  { id: 'click1k',    name: 'Marathonien',        desc: '1 000 clics',                       test: s => s.totalClicks >= 1000 },
  { id: 'click10k',   name: 'Tendinite',          desc: '10 000 clics',                      test: s => s.totalClicks >= 10000 },
  { id: 'build1',     name: 'Premier employé',    desc: 'Acheter un bâtiment',               test: s => countBuildings(s) >= 1 },
  { id: 'build25',    name: 'Petite exploitation',desc: '25 bâtiments',                      test: s => countBuildings(s) >= 25 },
  { id: 'build100',   name: 'Empire équestre',    desc: '100 bâtiments',                     test: s => countBuildings(s) >= 100 },
  { id: 'star1',      name: 'Étoile montante',    desc: 'Remplir la jauge une fois',         test: s => s.stars >= 1 },
  { id: 'star5',      name: 'Constellation',      desc: '5 étoiles',                         test: s => s.stars >= 5 },
  { id: 'earn10k',    name: 'Bas de laine',       desc: 'Gagner 10 000 $ au total',          test: s => s.totalEarned >= 1e4 },
  { id: 'earn1m',     name: 'Millionnaire',       desc: 'Gagner 1 000 000 $ au total',       test: s => s.totalEarned >= 1e6 },
  { id: 'combo50',    name: 'Rafale',             desc: 'Atteindre un combo de 50',          test: s => s.bestCombo >= 50 },
  { id: 'stamina',    name: 'Pleine forme',       desc: 'Stamina au maximum',                test: s => s.stamina >= STAMINA_MAX },
  { id: 'trophy1',    name: 'Nouvelle génération',desc: 'Faire un premier prestige',         test: s => s.trophies >= 1 },
  { id: 'missions10', name: 'Employé du mois',    desc: 'Réussir 10 missions',               test: s => s.missionsDone >= 10 },
];

export function countBuildings(s) {
  return Object.values(s.buildings).reduce((a, b) => a + b, 0);
}
