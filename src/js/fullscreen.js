class FullscreenManager {
    constructor() {
        this.addEventListeners();
    }

    addEventListeners() {
        const fullscreenCheckbox = document.getElementById('fullscreen-toggle');
        
        if (fullscreenCheckbox) {
            fullscreenCheckbox.addEventListener('change', () => {
                if (fullscreenCheckbox.checked) {
                    this.enterFullscreen();
                } else {
                    this.exitFullscreen();  
                }
            });
        } else {
            console.error("Élément fullscreen-toggle non trouvé");
        }

        // Écouter les changements d'état de plein écran
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButtonState();
        });
    }

    enterFullscreen() {
        const element = document.documentElement; // Tout l'écran

        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // Internet Explorer/Edge
            element.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // Internet Explorer/Edge
            document.msExitFullscreen();
        }
    }

    updateFullscreenButtonState() {
        const fullscreenCheckbox = document.getElementById('fullscreen-toggle');
        if (fullscreenCheckbox) {
            fullscreenCheckbox.checked = !!document.fullscreenElement;
        }
    }
}

// Initialisation du gestionnaire de plein écran
document.addEventListener('DOMContentLoaded', () => {
    window.fullscreenManager = new FullscreenManager();
});