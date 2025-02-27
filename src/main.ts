import "./style.css";

import debounce from "debounce";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { setupBoundary, setupChessboard, setupDice } from "./setup";

const root = document.getElementById("root")!;

const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
const world = new RAPIER.World(gravity);
const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = [];

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

function randomQuaternion() {
  const u1 = Math.random();
  const u2 = Math.random();
  const u3 = Math.random();

  const sqrt1MinusU1 = Math.sqrt(1 - u1);
  const sqrtU1 = Math.sqrt(u1);

  const x = sqrt1MinusU1 * Math.sin(2 * Math.PI * u2);
  const y = sqrt1MinusU1 * Math.cos(2 * Math.PI * u2);
  const z = sqrtU1 * Math.sin(2 * Math.PI * u3);
  const w = sqrtU1 * Math.cos(2 * Math.PI * u3);

  return new THREE.Quaternion(x, y, z, w);
}

setupChessboard(scene, world);
setupBoundary(world);

for (let i = 0; i < 8; i++) {
  const rotation = randomQuaternion();
  const body = setupDice(
    (1.5 - (i % 4)) * 3,
    (0.5 - Math.floor(i / 4)) * 4,
    rotation,
    scene,
    world,
  );
  dynamicBodies.push(body);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.y = 1;

const clock = new THREE.Clock();
let delta: number;

const doneDices = new Set<THREE.Object3D>();

function animate() {
  delta = clock.getDelta();
  world.timestep = Math.min(delta, 0.1);
  world.step();

  for (const [object, body] of dynamicBodies) {
    const position = body.translation();
    const rotation = body.rotation();
    object.position.copy(position);
    object.quaternion.copy(rotation);
    if (!doneDices.has(object) && body.isSleeping()) {
      doneDices.add(object);
      console.log(doneDices);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
