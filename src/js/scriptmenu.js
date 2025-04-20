// src/js/scriptmenu.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function main() {

    // Utilisation de sessionStorage pour verifier l'état du jeu
    const wasInGame = sessionStorage.getItem('inGame') === 'true';

    // Initialisation des éléments UI
    const menuContainer = document.getElementById('menu-container');
    const gameUI = document.getElementById('game-ui');
    const progressContainer = document.querySelector('.progress-bar-container');
    const startBtn = document.getElementById('start-game-btn');
    const titleContainer = document.querySelector('.title-container');

    // Configuration de l'UI en fonction de l'état précédent
    if (wasInGame) {
        menuContainer.style.display = 'none';
        gameUI.style.display = 'block';
        progressContainer.style.display = 'none';
        startBtn.style.display = 'none';
        titleContainer.style.display = 'none'; 
    } else {
        menuContainer.style.display = 'block';
        gameUI.style.display = 'none';
        progressContainer.style.display = 'flex';
        startBtn.style.display = 'block';
        titleContainer.style.display = 'block'; 
    }

    // Initialisation Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    camera.position.set(90, 9, 30);
    camera.lookAt(0, 0, 0);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    menuContainer.appendChild(renderer.domElement);

    // Gestion du chargement avec LoadingManager
    const loadingManager = new THREE.LoadingManager();
    const loadingBar = document.querySelector('.div');

    loadingManager.onStart = () => {
        console.log('Début du chargement');
        if (!wasInGame) {
            progressContainer.style.display = 'flex';
            startBtn.style.display = 'none';
        }
        loadingBar.style.backgroundPosition = '100% 0';
    };

    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        const percentage = (1 - progress) * 100;
        loadingBar.style.backgroundPosition = `${percentage}% 0`;
    };

    loadingManager.onLoad = () => {
        console.log('Chargement terminé');
        loadingBar.style.backgroundPosition = '0% 0';
        progressContainer.style.display = 'none';
        if (!wasInGame) {
            startBtn.style.display = 'block';
        }
    };

    loadingManager.onError = (url) => {
        console.error(`Erreur lors du chargement de : ${url}`);
    };

    // Background avec texture
    const textureLoader = new THREE.TextureLoader(loadingManager);
    textureLoader.load(
        '/src/images/Background/sky_image.jpg',
        (texture) => {
            scene.background = texture;
        },
        undefined,
        (error) => {
            console.error('Erreur lors du chargement du background :', error);
            scene.background = new THREE.Color(0x87ceeb);
        }
    );

    // Éclairage
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Configuration DRACOLoader et GLTFLoader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    const loader = new GLTFLoader(loadingManager);
    loader.setDRACOLoader(dracoLoader);

    // Fonction pour charger le modèle
    const loadModel = (path, scale, position) => {
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(scale.x, scale.y, scale.z);
                model.position.set(position.x, position.y, position.z);
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.name.toLowerCase().includes('water')) {
                            child.material = new THREE.MeshStandardMaterial({
                                transparent: true,
                                opacity: 0.7,
                                color: 0x00efff,
                                side: THREE.DoubleSide
                            });
                        }
                    }
                });
                scene.add(model);
                renderer.render(scene, camera);
            },
            undefined,
            (error) => console.error(`Erreur chargement ${path} :`, error)
        );
    };

    // Charger le modèle
    loadModel('/LowPolyTrees.glb', { x: 20, y: 20, z: 20 }, { x: 0, y: 0, z: 0 });

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Boucle d'animation
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Bouton retour au menu
    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        gameUI.style.display = 'none';
        menuContainer.style.display = 'block';
        startBtn.style.display = 'block';
        document.querySelector('.title-container').style.display = 'block';
        sessionStorage.setItem('inGame', 'false');
    });

    // Bouton Commencer le jeu
    startBtn.addEventListener('click', () => {
        menuContainer.style.display = 'none';
        gameUI.style.display = 'block';
        startBtn.style.display = 'none';
        progressContainer.style.display = 'none';
        document.querySelector('.title-container').style.display = 'none';
        sessionStorage.setItem('inGame', 'true');
        
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
}

main();