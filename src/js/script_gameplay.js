import { addMoney } from './money.js';
import { incrementClickMeter, initClickMeter, MAX_METER } from './jauge.js';
import { getCurrentStaminaMultiplier } from './stamina-bar.js';
import { initMissionSystem } from './mission-system.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser la jauge de clic
  initClickMeter();
  initMissionSystem();
  
  const clickableElement = document.getElementById('Model3D');
  if (!clickableElement) {
    console.error('Could not find clickable element with ID "Model3D"');
    return;
  }

  // Valeur de base par clic
  const BASE_CLICK_VALUE = 1;

  clickableElement.addEventListener('click', (event) => {
      // Récupérer le multiplicateur de stamina
      const staminaMultiplier = getCurrentStaminaMultiplier();
      
      // Calculer la valeur gagnée en combinant les deux multiplicateurs
      const earnedValue = BASE_CLICK_VALUE * staminaMultiplier;
      
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

function playClickAnimation(element) {
  element.style.transition = 'transform 0.1s ease';
  element.style.transform = 'scale(1.1) rotate(2deg)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1) rotate(0deg)';
  }, 100);
}


// Fonction pour créer/mettre à jour l'indicateur de progression
function createProgressIndicator() {
  const progressIndicator = document.querySelector('.click-meter-label');
  
  if (!progressIndicator) {
    console.error("Element .click-meter-label non trouvé");
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

