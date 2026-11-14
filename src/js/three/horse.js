// Scène 3D du cheval : légère (pas d'ombres temps réel, pixel ratio plafonné),
// rendue uniquement quand le jeu est visible, avec animations de réaction.
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const MAX_PIXEL_RATIO = 1.5;

let container, scene, camera, renderer;
let horse = null;
let mixer = null;
let halo = null;
let baseScale = 0.2;
let tierScale = 1;
let t = 0;
let squash = 0;          // impulsion du clic (0..1)
let visible = false;

export function initHorseScene(el) {
  container = el;
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, 40);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);
  resize();

  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const main = new THREE.DirectionalLight(0xffffff, 0.35);
  main.position.set(5, 10, 7);
  scene.add(main);
  const accent = new THREE.DirectionalLight(0xffffee, 0.2);
  accent.position.set(-5, 5, 3);
  scene.add(accent);

  createBase();
  loadHorse();

  window.addEventListener('resize', resize);
}

function createBase() {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7, 1, 32),
    new THREE.MeshStandardMaterial({ color: 0xb22222, roughness: 0.6, metalness: 0.2 }),
  );
  base.position.y = -12;
  scene.add(base);

  // Fausse ombre : un disque sombre, bien moins coûteux qu'une shadow map.
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -11.45;
  scene.add(shadow);

  halo = new THREE.Mesh(
    new THREE.RingGeometry(7, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -12.5;
  scene.add(halo);
}

function loadHorse() {
  const tl = new THREE.TextureLoader();
  const map = tl.load('./assets/textures/Horse_BaseColor.webp');
  const normalMap = tl.load('./assets/textures/Horse_Normal.webp');
  const roughnessMap = tl.load('./assets/textures/Horse_Roughtness.webp');
  const material = new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap, roughness: 0.7, metalness: 0.1 });

  new FBXLoader().load('./assets/Horse.fbx', (object) => {
    horse = object;
    horse.scale.setScalar(baseScale);
    const box = new THREE.Box3().setFromObject(horse);
    const center = box.getCenter(new THREE.Vector3());
    // Pose les sabots sur le socle (y = -11.5), centré en x/z.
    horse.position.set(-center.x, -11.5 - box.min.y, -center.z);
    horse.userData.restY = horse.position.y;

    horse.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
        child.frustumCulled = false;
      }
    });

    if (object.animations && object.animations.length) {
      mixer = new THREE.AnimationMixer(horse);
      mixer.clipAction(object.animations[0]).play();
    }
    applyTier(tierScale, halo.material.color.getHex());
    scene.add(horse);
  });
}

export function setHorseVisible(v) {
  visible = v;
  if (v) resize();
}

export function resize() {
  if (!container || !renderer) return;
  const w = container.clientWidth, h = container.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/** Réaction visuelle au clic. */
export function horseClick(strength = 1) {
  squash = Math.min(1, squash + 0.6 * strength);
}

/** Apparence selon le palier (prestige). */
export function applyTier(scale, haloColor) {
  tierScale = scale;
  if (halo) halo.material.color.setHex(haloColor);
}

export function updateHorse(dt) {
  if (!visible || !renderer) return;
  t += dt;
  if (mixer) mixer.update(dt);
  if (horse) {
    // Respiration + petit balancement, et écrasement au clic.
    squash = Math.max(0, squash - dt * 4);
    const s = baseScale * tierScale;
    const sq = squash * 0.12;
    horse.scale.set(s * (1 + sq), s * (1 - sq), s * (1 + sq));
    horse.position.y = horse.userData.restY + Math.sin(t * 2) * 0.25 + squash * 1.2;
    horse.rotation.y = Math.sin(t * 0.5) * 0.25 + squash * 0.15;
  }
  if (halo) {
    halo.rotation.z += dt * 0.3;
    halo.material.opacity = 0.35 + Math.sin(t * 3) * 0.1 + squash * 0.3;
  }
  renderer.render(scene, camera);
}
