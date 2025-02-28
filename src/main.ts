import "./style.css";

import debounce from "debounce";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { addChessboard, addDice } from "./setup";
import { preSimulate, simulate } from "./physics";
import { SIMULATE_DT } from "./config";

const root = document.getElementById("root")!;

const scene = new THREE.Scene();

const light1 = new THREE.SpotLight(undefined, Math.PI * 100);
light1.position.set(0, 15, 0);
light1.lookAt(0, 0, 0);
scene.add(light1);

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

// const light2 = light1.clone();
// light2.position.set(-2.5, 5, 5);
// scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  50,
  root.clientWidth / root.clientHeight,
  0.1,
  1000,
);
camera.position.set(0, 16, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(root.clientWidth, root.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

const resizeObserver = new ResizeObserver(
  debounce(() => {
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(root.clientWidth, root.clientHeight);
  }, 200),
);
resizeObserver.observe(root);

renderer.setAnimationLoop(animate);
root.appendChild(renderer.domElement);

addChessboard(scene);
const preResult = preSimulate(8);
console.log(preResult.map((r) => "岩草风万火水雷冰"[r.finalUpFace]));

const dices = Array.from(preResult, () => addDice(scene));
const totalTime = preResult.reduce((acc, r) => Math.max(acc, r.sleepTime), 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.y = 1;

const clock = new THREE.Clock();
let delta = 0;

const simulator = simulate(preResult.map((r) => r.initRotation));
function animate() {
  delta += clock.getDelta();

  if (clock.elapsedTime > totalTime) {
    renderer.setAnimationLoop(null);
    return;
  }
  while (delta > SIMULATE_DT) {
    const transform = simulator.step();
    for (let i = 0; i < dices.length; i++) {
      const dice = dices[i];
      const { translation, rotation } = transform[i];
      dice.position.copy(translation);
      dice.quaternion.copy(rotation);
    }
    delta -= SIMULATE_DT;
  }

  controls.update();
  renderer.render(scene, camera);
}
