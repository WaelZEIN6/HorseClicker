import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

function main() {
    const model3D = document.getElementById('Model3D');
    if (!model3D) {
        console.error("L'élément 'Model3D' est introuvable.");
        return;
    }

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(50, model3D.clientWidth / model3D.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(model3D.clientWidth, model3D.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    model3D.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.2);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const accentLight = new THREE.DirectionalLight(0xffffee, 0.2);
    accentLight.position.set(-5, 5, 3);
    scene.add(accentLight);

    const textureLoader = new THREE.TextureLoader();

    const baseColorTexture = textureLoader.load('/src/assets/textures/Horse_BaseColor.png');
    const normalTexture = textureLoader.load('/src/assets/textures/Horse_Normal.png');
    const roughnessTexture = textureLoader.load('/src/assets/textures/Horse_Roughtness.png');

    let horseModel;

    function updateMaterialSettings() {
        if (!horseModel) return;

        horseModel.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setScalar(1); // valeur neutre
                child.material.normalScale.set(1, 1); // valeur par défaut
                child.material.roughness = 0.7; // valeur par défaut
                child.material.needsUpdate = true;
            }
        });
    }

    function createBase() {
        const baseGeometry = new THREE.CylinderGeometry(7, 7, 1, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.6,
            metalness: 0.2
        });

        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -12;
        base.receiveShadow = true;
        scene.add(base);

        const haloGeometry = new THREE.RingGeometry(7, 8, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.4, // corrigé
            side: THREE.DoubleSide
        });

        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = -12.5;
        scene.add(halo);
    }

    const loader = new FBXLoader();

    const loadModel = (path, scale, position) => {
        loader.load(
            path,
            (object) => {
                horseModel = object;

                horseModel.scale.set(scale.x, scale.y, scale.z);
                horseModel.position.set(position.x, position.y, position.z);

                const box = new THREE.Box3().setFromObject(horseModel);
                const center = box.getCenter(new THREE.Vector3());
                horseModel.position.x = position.x - center.x * scale.x;
                horseModel.position.y = position.y - center.y * scale.y;
                horseModel.position.z = position.z - center.z * scale.z;

                horseModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (child.geometry) {
                            child.geometry.computeVertexNormals();
                        }

                        const newMaterial = new THREE.MeshStandardMaterial({
                            map: baseColorTexture,
                            normalMap: normalTexture,
                            roughnessMap: roughnessTexture,
                            roughness: 0.7,
                            metalness: 0.1,
                            side: THREE.DoubleSide
                        });

                        child.material = newMaterial;
                        child.material.needsUpdate = true;
                    }
                });

                createBase();
                scene.add(horseModel);
                console.log("Modèle de cheval chargé avec succès!");

                updateMaterialSettings();
            },
            (xhr) => {
                const progress = Math.floor((xhr.loaded / xhr.total) * 100);
                console.log(`Chargement du modèle: ${progress}%`);
            },
            (error) => {
                console.error(`Erreur chargement ${path}:`, error);
            }
        );
    };

    loadModel('/src/assets/Horse.fbx', { x: 0.2, y: 0.2, z: 0.2 }, { x: 0, y: -15, z: 0 });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            renderer.setSize(model3D.clientWidth, model3D.clientHeight);
            camera.aspect = model3D.clientWidth / model3D.clientHeight;
            camera.updateProjectionMatrix();
        }, 250);
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
