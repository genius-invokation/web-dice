import * as THREE from "three";
import {
  BOUNDARY_THICKNESS,
  CHESSBOARD_LENGTH,
  CHESSBOARD_WIDTH,
} from "./config";
import { DICE_COLORS, getDiceMaterials } from "./textures";
import { diceGeometry } from "./geometries";
import { SimulateResult } from "./physics";

export function addChessboard(scene: THREE.Scene) {
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      CHESSBOARD_LENGTH,
      BOUNDARY_THICKNESS,
      CHESSBOARD_WIDTH,
    ),
    new THREE.MeshStandardMaterial({ color: "#f0fdf4" }),
  );
  floorMesh.receiveShadow = true;
  floorMesh.position.y = -BOUNDARY_THICKNESS / 2;
  scene.add(floorMesh);
}

const diceMaterials = await getDiceMaterials();

function rotate<T>(arr: readonly T[], n: number): T[] {
  return arr.slice(-n).concat(arr.slice(0, -n));
}

export function addDice(
  scene: THREE.Scene,
  targetColor: number,
  preSimulate: SimulateResult,
): THREE.Mesh {
  const { finalUpFace, sleepTime } = preSimulate;
  const d = finalUpFace - targetColor;
  const diceMesh = new THREE.Mesh(diceGeometry, rotate(diceMaterials, d));
  diceMesh.castShadow = true;
  setTimeout(() => {
    const oldMat = diceMesh.material[finalUpFace];
    const mat = oldMat.clone();
    mat.emissive.set(DICE_COLORS[targetColor]);
    mat.needsUpdate = true;
    diceMesh.material[finalUpFace] = mat;
    oldMat.dispose();
  }, sleepTime * 1000 - 2000);
  scene.add(diceMesh);
  return diceMesh;
}
