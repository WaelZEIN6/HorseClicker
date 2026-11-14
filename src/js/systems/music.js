// Musique de fond : le MP3 (10 Mo) n'est téléchargé qu'au premier démarrage réel.
import { state, save } from '../core/state.js';

let audio = null;
let unlocked = false;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'none';
  audio.loop = true;
  audio.src = './sound/Musicjeu.mp3';
  audio.volume = parseFloat(localStorage.getItem('musicVolume') || '0.5');
  return audio;
}

function play() {
  if (!state.musicEnabled) return;
  ensureAudio().play().then(() => { unlocked = true; }).catch(() => { /* attend un geste utilisateur */ });
}

export function initMusic() {
  const toggle = document.getElementById('music-toggle');
  const slider = document.getElementById('volume-slider');

  if (slider) {
    slider.value = localStorage.getItem('musicVolume') || '0.5';
    slider.addEventListener('input', () => {
      localStorage.setItem('musicVolume', slider.value);
      if (audio) audio.volume = parseFloat(slider.value);
    });
  }
  if (toggle) {
    toggle.checked = !state.musicEnabled; // coché = muet
    toggle.addEventListener('change', () => {
      state.musicEnabled = !toggle.checked;
      save();
      if (state.musicEnabled) play();
      else if (audio) audio.pause();
    });
  }

  const unlock = () => {
    if (!unlocked) play();
    if (unlocked) {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    }
  };
  document.addEventListener('pointerdown', unlock);
  document.addEventListener('keydown', unlock);
}
