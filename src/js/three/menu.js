// Décor 3D du menu : rendu uniquement quand le menu est affiché, sans ombres,
// avec une lente rotation de caméra pour donner de la vie.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const MAX_PIXEL_RATIO = 1.5;
const RADIUS = 95;

let scene, camera, renderer, container;
let angle = 0.32;
let visible = true;
let loaded = false;

export function initMenuScene(el, { onProgress, onLoad }) {
  container = el;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.shadowMap.enabled = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, done, total) => onProgress && onProgress(done / total);
  manager.onLoad = () => { loaded = true; onLoad && onLoad(); };

  new THREE.TextureLoader(manager).load(
    './images/Background/sky_image.webp',
    (tex) => { tex.encoding = THREE.sRGBEncoding; scene.background = tex; },
    undefined,
    () => { scene.background = new THREE.Color(0x87ceeb); },
  );

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  const draco = new DRACOLoader();
  draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(draco);
  loader.load('./assets/LowPolyTrees.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(20);
    model.traverse((child) => {
      if (child.isMesh && child.name.toLowerCase().includes('water')) {
        child.material = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.7, color: 0x00efff });
      }
    });
    scene.add(model);
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

export function setMenuVisible(v) {
  visible = v;
}

export function updateMenu(dt) {
  if (!visible || !renderer) return;
  angle += dt * 0.04;
  camera.position.set(Math.cos(angle) * RADIUS, 12, Math.sin(angle) * RADIUS);
  camera.lookAt(0, 4, 0);
  renderer.render(scene, camera);
}

export function menuLoaded() { return loaded; }
