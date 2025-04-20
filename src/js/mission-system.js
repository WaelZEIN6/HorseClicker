import { MAX_METER } from './jauge.js';
import { addMoney } from './money.js';
import { addStamina } from './stamina-bar.js';
import { foodUpgrades } from './food-upgrade.js';

// Structure des missions
const missions = [
    {
        id: 1,
        name: "Mission 1",
        description: "Effectuez 60 clics en 15 secondes",
        clickTarget: 60,
        timeLimit: 15,
        reward: { money: 50, stamina: 25 },
        unlockAfterClicks: 10
    },
    {
        id: 2,
        name: "Mission 2",
        description: "Remplissez la jauge à 100 points en 20 secondes",
        gaugeTarget: 100,
        timeLimit: 20,
        reward: { money: 75, stamina: 30 },
        fallbackMission: {
            name: "Mission 2.2",
            description: "Effectuez 40 clics en 15 secondes",
            clickTarget: 40,
            timeLimit: 15,
            reward: { money: 20, stamina: 15 }
        }
    },
    {
        id: 3,
        name: "Mission 3 - Carotte",
        description: "Atteignez le niveau 5 dans la Carotte",
        targetUpgrade: 'FirstFood',
        targetLevel: 4,
        timeLimit: 60,
        reward: { money: 50, stamina: 15 },
        checkProgress: function() {
            const upgrade = foodUpgrades.find(u => u.id === this.targetUpgrade);
            return upgrade && upgrade.level >= this.targetLevel;
        }
    },
    {
        id: 4,
        name: "Mission 4",
        description: "Atteignez 200 clics en 30 secondes",
        clickTarget: 200,
        timeLimit: 30,
        reward: { money: 150, stamina: 40 },
        fallbackMission: {
            name: "Mission 4.2",
            description: "Remplissez la jauge à 250 points en 30 secondes",
            gaugeTarget: 250,
            timeLimit: 30,
            reward: { money: 30, stamina: 25 }
        }
    },
    {
        id: 5,
        name: "Mission 5 - Golden Pomme",
        description: "Atteignez le niveau 2 dans la Golden Pomme",
        targetUpgrade: 'FifthFood',
        targetLevel: 2,
        timeLimit: 120,
        reward: { money: 500, stamina: 100 },
        checkProgress: function() {
            const upgrade = foodUpgrades.find(u => u.id === this.targetUpgrade);
            return upgrade && upgrade.level >= this.targetLevel;
        }
    }
];

// Variables d'état
let currentMissionIndex = -1;
let activeMission = null;
let clickCount = 0;
let totalClickCount = 0;
let missionTimer = null;
let progressCheckInterval = null;
let timeLeft = 0;
let missionActive = false;
let usingFallbackMission = false;
let gaugeStartValue = 0;
let transitionInProgress = false;

// Éléments DOM
let missionContainer;
let missionTitle;
let missionDescription;
let missionProgress;
let missionTime;

function initMissionSystem() {
    createMissionUI();

    const clickableElement = document.getElementById('Model3D');
    if (clickableElement) {
        clickableElement.addEventListener('click', () => {
            totalClickCount++;
            
            if (missionActive) {
                clickCount++;
                updateMissionProgress();
            }
            
            checkMissionUnlock();
        });
    }

    hideMissionUI();
}

function createMissionUI() {
    if (!document.querySelector('.mission-container')) {
        const missionHTML = `
            <div class="mission-container" style="display: none;">
                <div class="mission-header">Mission: <span id="mission-title"></span></div>
                <div class="mission-description" id="mission-description"></div>
                <div class="mission-progress-bar">
                    <div class="mission-progress-fill" id="mission-progress-fill"></div>
                </div>
                <div class="mission-info">
                    <div>Progression: <span id="mission-progress">0/0</span></div>
                    <div class="mission-time" id="mission-time">Temps: 30s</div>
                </div>
                <div id="mission-result-container" style="display: none;">
                    <div class="mission-result" id="mission-result"></div>
                    <div class="mission-reward" id="mission-reward"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', missionHTML);
    }

    missionContainer = document.querySelector('.mission-container');
    missionTitle = document.getElementById('mission-title');
    missionDescription = document.getElementById('mission-description');
    missionProgress = document.getElementById('mission-progress');
    missionTime = document.getElementById('mission-time');
}

function showMissionUI() {
    if (missionContainer) {
        missionContainer.style.display = 'block';
        missionContainer.style.animation = 'missionAppear 0.5s ease-out';
    }
}

function hideMissionUI() {
    if (missionContainer) {
        missionContainer.style.animation = 'missionDisappear 0.5s ease-out';
        setTimeout(() => {
            missionContainer.style.display = 'none';
            transitionInProgress = false;
        }, 500);
    }
}

function checkMissionUnlock() {
    if (missionActive || transitionInProgress) return;
    
    let nextMissionIndex = currentMissionIndex + 1;
    
    if (nextMissionIndex === 0 && totalClickCount < missions[0].unlockAfterClicks) {
        return;
    }
    
    if (nextMissionIndex >= missions.length) {
        console.log("Toutes les missions sont terminées!");
        return;
    }
    
    startMission(nextMissionIndex);
}

// Function to start a mission
function startMission(missionIndex) {
    currentMissionIndex = missionIndex;
    activeMission = missions[missionIndex];
    clickCount = 0;
    usingFallbackMission = false;
    
    if (activeMission.gaugeTarget) {
        const gaugeFill = document.querySelector('.click-meter-fill');
        if (gaugeFill) {
            const currentHeight = parseFloat(gaugeFill.style.height || '0');
            gaugeStartValue = Math.round((currentHeight / 100) * MAX_METER);
        } else {
            gaugeStartValue = 0;
        }
    }

    // Mise à jour de l'interface
    missionTitle.textContent = activeMission.name;
    
    if (activeMission.checkProgress) {
        // Fix: Use find() to get the upgrade by ID
        const upgrade = foodUpgrades.find(u => u.id === activeMission.targetUpgrade);
        const currentLevel = upgrade ? upgrade.level : 0;
        missionDescription.textContent = `${activeMission.description} (Actuel: Nv.${currentLevel})`;
    } else {
        missionDescription.textContent = activeMission.description;
    }

    // Fix for progress display
    if (activeMission.checkProgress) {
        const upgrade = foodUpgrades.find(u => u.id === activeMission.targetUpgrade);
        const currentLevel = upgrade ? upgrade.level : 0;
        missionProgress.textContent = `Niveau ${currentLevel}/${activeMission.targetLevel}`;
    } else {
        const target = activeMission.clickTarget || activeMission.gaugeTarget || 1;
        missionProgress.textContent = `0/${target}`;
    }

    const progressFill = document.getElementById('mission-progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }

    const resultContainer = document.getElementById('mission-result-container');
    if (resultContainer) {
        resultContainer.style.display = 'none';
    }

    timeLeft = activeMission.timeLimit;
    missionTime.textContent = `Temps: ${timeLeft}s`;

    showMissionUI();

    // Démarrer le minuteur principal
    missionActive = true;
    missionTimer = setInterval(() => {
        timeLeft--;
        missionTime.textContent = `Temps: ${timeLeft}s`;

        if (timeLeft <= 0) {
            endMission(false);
        }
    }, 1000);

    // Pour les missions spéciales, vérifier régulièrement la progression
    if (activeMission.checkProgress) {
        progressCheckInterval = setInterval(() => {
            updateMissionProgress();
        }, 1000);
    }
}

function updateMissionProgress() {
    if (!missionActive || !activeMission) return;

    let progress = 0;
    let target = 0;
    let isComplete = false;

    if (activeMission.clickTarget) {
        progress = clickCount;
        target = activeMission.clickTarget;
        isComplete = progress >= target;
    } 
    else if (activeMission.gaugeTarget) {
        const gaugeFill = document.querySelector('.click-meter-fill');
        if (gaugeFill) {
            const currentHeight = parseFloat(gaugeFill.style.height || '0');
            const currentValue = Math.round((currentHeight / 100) * MAX_METER);
            progress = currentValue - gaugeStartValue;
            if (progress < 0) progress = 0;
            target = activeMission.gaugeTarget;
            isComplete = progress >= target;
        }
    }
    else if (activeMission.checkProgress) {
        // Fix: Use find() to get the upgrade by ID
        const upgrade = foodUpgrades.find(u => u.id === activeMission.targetUpgrade);
        const currentLevel = upgrade ? upgrade.level : 0;
        
        // Use the mission's custom checkProgress function to determine completion
        isComplete = activeMission.checkProgress();
        progress = currentLevel;
        target = activeMission.targetLevel;
        
        // Mettre à jour la description avec le niveau actuel
        missionDescription.textContent = `${activeMission.description} (Actuel: Nv.${currentLevel})`;
    }

    // Mise à jour de l'affichage
    if (activeMission.checkProgress) {
        const upgrade = foodUpgrades.find(u => u.id === activeMission.targetUpgrade);
        const currentLevel = upgrade ? upgrade.level : 0;
        missionProgress.textContent = `Niveau ${currentLevel}/${target}`;
    } else {
        missionProgress.textContent = `${progress}/${target}`;
    }

    const progressFill = document.getElementById('mission-progress-fill');
    if (progressFill) {
        const percentage = Math.min(100, (progress / target) * 100);
        progressFill.style.width = `${percentage}%`;
    }

    if (isComplete) {
        endMission(true);
    }
}

function endMission(success) {
    clearInterval(missionTimer);
    clearInterval(progressCheckInterval);
    missionActive = false;
    
    const resultContainer = document.getElementById('mission-result-container');
    const resultElement = document.getElementById('mission-result');
    const rewardElement = document.getElementById('mission-reward');
    
    if (resultContainer && resultElement && rewardElement) {
        resultContainer.style.display = 'block';
        
        if (success) {
            resultElement.textContent = 'Mission Réussie!';
            resultElement.className = 'mission-result success';
            
            const reward = activeMission.reward;
            addMoney(reward.money);
            addStamina(reward.stamina);
            
            rewardElement.textContent = `Récompense: ${reward.money}$ et ${reward.stamina} Stamina`;
            
            transitionInProgress = true;
            setTimeout(() => {
                hideMissionUI();
                setTimeout(() => {
                    checkMissionUnlock();
                }, 1000);
            }, 3000);
        } else {
            resultElement.textContent = 'Mission Échouée!';
            resultElement.className = 'mission-result failure';
            
            if (!usingFallbackMission && activeMission.fallbackMission) {
                rewardElement.textContent = 'Nouvelle mission disponible...';
                setTimeout(() => {
                    startFallbackMission();
                }, 3000);
            } else {
                rewardElement.textContent = 'Réessayez plus tard!';
                transitionInProgress = true;
                setTimeout(() => {
                    hideMissionUI();
                    setTimeout(() => {
                        checkMissionUnlock();
                    }, 5000);
                }, 3000);
            }
        }
    }
}

function startFallbackMission() {
    const fallback = activeMission.fallbackMission;
    if (!fallback) return;

    clearInterval(missionTimer);
    clearInterval(progressCheckInterval);

    missionTitle.textContent = fallback.name;
    missionDescription.textContent = fallback.description;

    clickCount = 0;
    usingFallbackMission = true;

    if (fallback.gaugeTarget) {
        const gaugeFill = document.querySelector('.click-meter-fill');
        if (gaugeFill) {
            const currentHeight = parseFloat(gaugeFill.style.height || '0');
            gaugeStartValue = Math.round((currentHeight / 100) * MAX_METER);
        } else {
            gaugeStartValue = 0;
        }
    }

    const target = fallback.clickTarget || fallback.gaugeTarget;
    missionProgress.textContent = `0/${target}`;

    const progressFill = document.getElementById('mission-progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }

    const resultContainer = document.getElementById('mission-result-container');
    if (resultContainer) {
        resultContainer.style.display = 'none';
    }

    timeLeft = fallback.timeLimit;
    missionTime.textContent = `Temps: ${timeLeft}s`;

    activeMission = {
        ...activeMission,
        name: fallback.name,
        description: fallback.description,
        clickTarget: fallback.clickTarget,
        gaugeTarget: fallback.gaugeTarget,
        timeLimit: fallback.timeLimit,
        reward: fallback.reward,
        fallbackMission: null
    };

    missionActive = true;
    missionTimer = setInterval(() => {
        timeLeft--;
        missionTime.textContent = `Temps: ${timeLeft}s`;

        if (timeLeft <= 0) {
            endMission(false);
        }
    }, 1000);
}

export { initMissionSystem };   