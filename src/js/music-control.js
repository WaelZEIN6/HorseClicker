class MusicController {
    constructor() {
        this.musicToggle = document.getElementById('music-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
        this.backgroundMusic = null;
        this.isAudioUnlocked = false;
        
        // Vérifier si la musique était activée précédemment
        this.isMusicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        
        // Initialiser le volume depuis le stockage local
        const savedVolume = localStorage.getItem('musicVolume') || '0.5';
        
        // Initialiser les événements pour le slider de volume
        if (this.volumeSlider) {
            this.volumeSlider.value = savedVolume;
            this.volumeSlider.addEventListener('input', () => this.updateVolume());
        }
        
        // Initialiser l'état du bouton
        if (this.musicToggle) {
            this.musicToggle.checked = !this.isMusicEnabled;
            this.musicToggle.addEventListener('change', () => this.updateMusicState());
        }
        
        // Initialiser la musique
        this.initializeAudio();
        
        // Déverrouiller l'audio à la première interaction
        this.setupAudioUnlock();
    }
    
    updateVolume() {
        const volume = parseFloat(this.volumeSlider.value);
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = volume;
            localStorage.setItem('musicVolume', volume);
        }
        
        // Gestion du mute/unmute en fonction du volume
        if (volume === 0) {
            if (this.musicToggle && !this.musicToggle.checked) {
                this.musicToggle.checked = true;
                this.updateMusicState();
            }
        } else if (this.isMusicEnabled) {
            // Si on remonte le volume et que la musique devrait être activée
            if (this.musicToggle && this.musicToggle.checked) {
                this.musicToggle.checked = false;
                this.updateMusicState();
            } else if (!this.backgroundMusic.playing) {
                this.playMusic();
            }
        }
    }
    
    initializeAudio() {
        // Créer l'élément audio s'il n'existe pas déjà
        if (!window.backgroundMusic) {
            this.backgroundMusic = new Audio('./sound/Musicjeu.mp3');
            this.backgroundMusic.loop = true; // Activer la lecture en boucle
            
            // Appliquer le volume sauvegardé
            const savedVolume = localStorage.getItem('musicVolume');
            this.backgroundMusic.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
            
            // Ajouter un événement de fin pour assurer la lecture en boucle
            this.backgroundMusic.addEventListener('ended', () => {
                // En plus de la propriété loop, on force la relecture au cas où
                if (this.isMusicEnabled) {
                    this.backgroundMusic.currentTime = 0;
                    this.backgroundMusic.play().catch(e => console.log("Problème de relecture automatique:", e));
                }
            });
            
            window.backgroundMusic = this.backgroundMusic;
        } else {
            this.backgroundMusic = window.backgroundMusic;
        }
        
        // Si la musique doit être activée, essayer de la jouer
        if (this.isMusicEnabled) {
            this.playMusic();
        }
    }
    
    playMusic() {
        if (this.backgroundMusic) {
            // Assurez-vous que la propriété loop est activée
            this.backgroundMusic.loop = true;
            
            this.backgroundMusic.play()
                .then(() => {
                    this.isAudioUnlocked = true;
                    this.backgroundMusic.playing = true;
                    console.log("Musique démarrée avec succès");
                })
                .catch(error => {
                    this.backgroundMusic.playing = false;
                    console.log("En attente d'interaction utilisateur pour jouer la musique:", error);
                });
        }
    }
    
    pauseMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.playing = false;
        }
    }
    
    updateMusicState() {
        const isMuted = this.musicToggle.checked;
        localStorage.setItem('musicEnabled', !isMuted);
        this.isMusicEnabled = !isMuted;
        
        if (isMuted) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    setupAudioUnlock() {
        // Fonction qui sera appelée à la première interaction
        const unlockAudio = () => {
            if (!this.isAudioUnlocked && this.isMusicEnabled) {
                this.playMusic();
            }
            // Supprimer les écouteurs une fois l'audio déverrouillé
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        
        // Ajouter des écouteurs pour déverrouiller l'audio
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
    }
}

// Initialiser le contrôleur de musique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.musicController = new MusicController();
});

// Exporter la classe si nécessaire pour d'autres modules
export default MusicController;