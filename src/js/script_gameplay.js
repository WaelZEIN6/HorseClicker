import { addMoney } from './money.js';
import { incrementClickMeter, initClickMeter, MAX_METER } from './jauge.js';
import { getCurrentStaminaMultiplier } from './stamina-bar.js';
import { initMissionSystem } from './mission-system.js';

let bonusActive = false;
let bonusMultiplier = 1;
let bonusTimeout = null;


document.addEventListener('DOMContentLoaded', () => {
  // Initialiser la jauge de clic
  initClickMeter();
  initMissionSystem();

  // Bonus bubble qui spawn régulièrement
  setInterval(() => {
    if (!bonusActive && Math.random() < 0.5) {
      spawnBonusBubble();
    }
  }, 30000); // toutes les 30 secondes
  
  const clickableElement = document.getElementById('Model3D');
  if (!clickableElement) {
    //console.error('Could not find clickable element with ID "Model3D"');
    return;
  }

  // Valeur de base par clic
  const BASE_CLICK_VALUE = 1;

  clickableElement.addEventListener('click', (event) => {
      // Récupérer le multiplicateur de stamina
      const staminaMultiplier = getCurrentStaminaMultiplier();
      
      // Calculer la valeur gagnée en combinant les deux multiplicateurs
      const earnedValue = BASE_CLICK_VALUE * staminaMultiplier * bonusMultiplier;
      
      // Ajouter l'argent basé sur la valeur calculée
      addMoney(earnedValue);
      
      // Incrémenter la jauge de clic 
      incrementClickMeter();

      // Joue l'animation visuelle
      playClickAnimation(clickableElement);
  });
  
  
  // Ajouter un indicateur de progression
  createProgressIndicator();
});

let isAnimating = false;

function playClickAnimation(element) {
  if (isAnimating) return;

  isAnimating = true;
  element.style.transition = 'transform 0.1s ease';
  element.style.transform = 'scale(1.1) rotate(2deg)';

  setTimeout(() => {
    element.style.transform = 'scale(1) rotate(0deg)';
  }, 10);

  setTimeout(() => {
    isAnimating = false;
  }, 100); // Durée suffisante pour que l'animation se termine
}
function spawnBonusBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'bonus-bubble';
  bubble.textContent = 'x5 BONUS';

  // Style et position
  bubble.style.position = 'absolute';
  bubble.style.left = `${Math.random() * 80 + 10}%`;
  bubble.style.bottom = '-50px';
  bubble.style.padding = '10px 20px';
  bubble.style.background = 'gold';
  bubble.style.color = '#000';
  bubble.style.borderRadius = '20px';
  bubble.style.cursor = 'pointer';
  bubble.style.fontWeight = 'bold';
  bubble.style.zIndex = '9999';
  bubble.style.transition = 'bottom 5s linear';

  document.body.appendChild(bubble);

  // Animation de montée
  setTimeout(() => {
    bubble.style.bottom = '90%';
  }, 50);

  // Clique pour activer le bonus
  bubble.addEventListener('click', () => {
    activateBonus();
    document.body.removeChild(bubble);
  });

  // Disparition automatique
  setTimeout(() => {
    if (document.body.contains(bubble)) {
      document.body.removeChild(bubble);
    }
  }, 5000);
}

function showBonusBanner(duration) {
  let banner = document.createElement('div');
  banner.id = 'bonus-banner';
  banner.style.position = 'fixed';
  banner.style.top = '100px';
  banner.style.left = '50%';
  banner.style.transform = 'translateX(-50%)';
  banner.style.padding = '10px 20px';
  banner.style.backgroundColor = '#ffdd57';
  banner.style.border = '2px solid #000';
  banner.style.color = '#000';
  banner.style.fontWeight = 'bold';
  banner.style.fontSize = '16px';
  banner.style.borderRadius = '8px';
  banner.style.zIndex = '10000';
  banner.textContent = `Bonus x5 actif ! Temps restant : ${duration}s`;

  document.body.appendChild(banner);

  let secondsLeft = duration;
  const interval = setInterval(() => {
    secondsLeft--;
    if (banner) {
      banner.textContent = `Bonus x5 actif ! Temps restant : ${secondsLeft}s`;
    }

    if (secondsLeft <= 0) {
      clearInterval(interval);
      if (banner && banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }
  }, 1000);
}

function activateBonus() {
  bonusMultiplier = 5;
  bonusActive = true;

  const originalBg = document.body.style.backgroundColor;
  document.body.style.backgroundColor = '#fff8dc';

  showBonusBanner(30); // 🎯 Ajout ici

  if (bonusTimeout) clearTimeout(bonusTimeout);
  bonusTimeout = setTimeout(() => {
    bonusMultiplier = 1;
    bonusActive = false;
    document.body.style.backgroundColor = originalBg;
  }, 30000);
}


// Fonction pour créer/mettre à jour l'indicateur de progression
function createProgressIndicator() {
  const progressIndicator = document.querySelector('.click-meter-label');
  
  if (!progressIndicator) {
    //console.error("Element .click-meter-label non trouvé");
    return;
  }

  // Initialisation
  progressIndicator.textContent = `Objectif: 0/${MAX_METER}`;
  
  // Mettre à jour l'indicateur périodiquement
  setInterval(() => {
    const clickMeterFill = document.querySelector('.click-meter-fill');
    if (clickMeterFill) {
      const currentHeight = parseFloat(clickMeterFill.style.height || '0');
      const currentValue = Math.round((currentHeight / 100) * MAX_METER);
      progressIndicator.textContent = `Objectif: ${currentValue}/${MAX_METER}`;
    }
  }, 100);
}

