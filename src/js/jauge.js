import { getCurrentStaminaMultiplier } from './stamina-bar.js';
import { addMoney } from './money.js';


let clickMeterValue = 0;
const MAX_METER = 1500;         
const DECAY_RATE = 4;           
const CLICK_VALUE = 1;          


function initClickMeter() {
  setInterval(decayClickMeter, 100);
}

function updateClickMeter() {
  clickMeterValue = Math.max(0, Math.min(MAX_METER, clickMeterValue));
  
  const heightPercentage = (clickMeterValue / MAX_METER) * 100 + '%';
  const fill = document.querySelector('.click-meter-fill');
  const glow = document.querySelector('.click-meter-glow');
  
  if (fill) fill.style.height = heightPercentage;
  if (glow) glow.style.height = heightPercentage;

  if (clickMeterValue >= MAX_METER) {
    achieveGoal();
  }
}

function incrementClickMeter() {
  const staminaMultiplier = getCurrentStaminaMultiplier();
  clickMeterValue += CLICK_VALUE * staminaMultiplier;
  updateClickMeter();
}

function decayClickMeter() {
  if (clickMeterValue > 0) {
    clickMeterValue -= DECAY_RATE / 10;
    updateClickMeter();
  }
}

function achieveGoal() {
  clickMeterValue = 0;
  addMoney(1500);  
  createCelebration();
}

function createCelebration() {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 5000);
    }, Math.random() * 1000);
  }
}

export { incrementClickMeter, initClickMeter, MAX_METER };

