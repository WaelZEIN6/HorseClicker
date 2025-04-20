class MusicController {
    constructor() {
        this.musicToggle = document.getElementById('music-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeSlider.addEventListener('input', () => {
            const volume = parseFloat(this.volumeSlider.value);
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = volume;
                localStorage.setItem('musicVolume', volume);
            }

            // Si volume est 0, on active mute
            if (volume === 0) {
                if (this.musicToggle && !this.musicToggle.checked) {
                    this.musicToggle.checked = true;
                    this.updateMusicState();
                }
            } else {
                // Si on remonte le volume, on réactive la musique si elle était mutée
                if (this.musicToggle && this.musicToggle.checked) {
                    this.musicToggle.checked = false;
                    this.updateMusicState();
                }
            }
        });

        // Dans le constructeur
        const savedVolume = localStorage.getItem('musicVolume');
        if (savedVolume !== null && this.volumeSlider) {
            this.volumeSlider.value = savedVolume;
        }

        // Dans l'écouteur d'événement
        this.volumeSlider.addEventListener('input', () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = this.volumeSlider.value;
                localStorage.setItem('musicVolume', this.volumeSlider.value);
            }
        });

        this.backgroundMusic = null;
        this.isAudioUnlocked = false;

        // Vérifier si la musique était activée précédemment
        this.isMusicEnabled = localStorage.getItem('musicEnabled') !== 'false';

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

    initializeAudio() {
        // Créer l'élément audio s'il n'existe pas déjà
        if (!window.backgroundMusic) {
            this.backgroundMusic = new Audio('/src/sound/Musicjeu.mp3');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.5;
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
            this.backgroundMusic.play()
                .then(() => {
                    this.isAudioUnlocked = true;
                    console.log("Musique démarrée avec succès");
                })
                .catch(error => {
                    console.log("En attente d'interaction utilisateur pour jouer la musique:", error);
                });
        }
    }

    pauseMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
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