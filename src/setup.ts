import * as THREE from "three";
import {
  BOUNDARY_THICKNESS,
  CHESSBOARD_LENGTH,
  CHESSBOARD_WIDTH,
} from "./config";
import { getDiceMaterials } from "./textures";
import { diceGeometry } from "./geometries";

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

const diceMesh = new THREE.Mesh(diceGeometry, diceMaterials);

export function addDice(scene: THREE.Scene): THREE.Mesh {
  const mesh = diceMesh.clone();
  scene.add(mesh);
  return mesh;
}
