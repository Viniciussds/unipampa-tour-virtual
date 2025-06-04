import * as THREE from 'three';
import {SceneManager} from './scenes/SceneManager.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {VRButton} from "three/addons";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.getElementById('app').appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));

// Controles da câmera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // Desativa zoom (opcional)
controls.enablePan = false;  // Desativa arrastar (opcional)
controls.rotateSpeed = 0.4;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.1;
controls.maxDistance = 0.1;
// Permite olhar em todos os ângulos
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

const sceneManager = new SceneManager(scene);
sceneManager.loadScene('panorama1');

// Controle de mouse para detectar clique em hotspots
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    sceneManager.checkHotspotIntersections(mouse, camera);
});

// controle de vr para detecar cliques em hotspots
const controller = renderer.xr.getController(0);
scene.add(controller);

const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
]);

const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({color: 0xffffff})
);
line.name = 'line';
line.scale.z = 100; // Comprimento do laser
controller.add(line)

controller.addEventListener('selectstart', () => {
    const target = sceneManager.checkHotspotIntersectionsVR(controller);
    if (target) {
        sceneManager.loadScene(target);
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // Atualiza os controles
    sceneManager.update();
    renderer.render(scene, camera);
};

animate();
