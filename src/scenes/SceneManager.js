import {scenesData} from "./scenesData.js";
import * as THREE from "three";


export class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.currentMesh = null;
        this.hotspots = [];
    }

    loadScene(name) {
        const data = scenesData[name];

        if (!data) {
            console.log(`Cena ${name} não existe`);
            return;
        }

        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
        }
        // limpa os hotspots
        this.hotspots.forEach(hotspot => this.scene.remove(hotspot));
        this.hotspots = [];

        // criaçao do panorama
        const texture = new THREE.TextureLoader().load(data.image);
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Inverter a esfera
        const material = new THREE.MeshBasicMaterial({map: texture});
        const mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        this.currentMesh = mesh;

        if (data.hotspots) {
            data.hotspots.forEach(hotspot => {
                const spriteMaterial = new THREE.SpriteMaterial({
                    map: new THREE.TextureLoader().load('/images/icon_hotspot.png'),
                    transparent: true
                });

                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.position.set(
                    hotspot.position.x,
                    hotspot.position.y,
                    hotspot.position.z
                );
                sprite.scale.set(10, 10, 1); // Tamanho do botão
                sprite.userData = {target: hotspot.target};
                this.scene.add(sprite);
                this.hotspots.push(sprite);
            });
        }
    }

    checkHotspotIntersections(mouse, camera) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(this.hotspots);

        if (intersects.length > 0) {
            const target = intersects[0].object.userData.target;
            if (target) {
                this.loadScene(target);
            }
        }
    }

    checkHotspotIntersectionsVR(controller){
        const tempMatrix = new THREE.Matrix4();
        const raycaster = new THREE.Raycaster();

        // Cria um raio a partir do controle
        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObjects(this.hotspots);

        if (intersects.length > 0) {
            const target = intersects[0].object.userData.target;
            return target;
        }
        return null;
    }
    update() {

    }
}