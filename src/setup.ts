import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";
import {
  BOUNDARY_HEIGHT,
  BOUNDARY_THICKNESS,
  CHESSBOARD_LENGTH,
  CHESSBOARD_WIDTH,
  DICE_INIT_HEIGHT,
  DICE_MASS,
  DICE_RESTITUTION,
  DICE_SIZE,
} from "./config";

export function setupChessboard(scene: THREE.Scene, world: RAPIER.World) {
  const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      CHESSBOARD_LENGTH,
      BOUNDARY_THICKNESS,
      CHESSBOARD_WIDTH,
    ),
    new THREE.MeshStandardMaterial(),
  );
  floorMesh.receiveShadow = true;
  floorMesh.position.y = -BOUNDARY_THICKNESS / 2;
  scene.add(floorMesh);
  const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  const floorShape = RAPIER.ColliderDesc.cuboid(
    CHESSBOARD_LENGTH / 2,
    BOUNDARY_THICKNESS / 2,
    CHESSBOARD_WIDTH / 2,
  );
  world.createCollider(floorShape, floorBody);
}

export function setupBoundary(world: RAPIER.World) {
  const boundaryBody1 = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(
      CHESSBOARD_LENGTH / 2 + BOUNDARY_THICKNESS / 2,
      BOUNDARY_HEIGHT / 2,
      0,
    ),
  );
  const boundaryBody2 = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(
      -CHESSBOARD_LENGTH / 2 + BOUNDARY_THICKNESS / 2,
      BOUNDARY_HEIGHT / 2,
      0,
    ),
  );
  const boundaryShapeX = RAPIER.ColliderDesc.cuboid(
    BOUNDARY_THICKNESS / 2,
    BOUNDARY_HEIGHT / 2,
    CHESSBOARD_WIDTH / 2,
  );
  world.createCollider(boundaryShapeX, boundaryBody1);
  world.createCollider(boundaryShapeX, boundaryBody2);

  const boundaryBody3 = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(
      0,
      BOUNDARY_HEIGHT / 2,
      CHESSBOARD_WIDTH / 2 + BOUNDARY_THICKNESS / 2,
    ),
  );
  const boundaryBody4 = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(
      0,
      BOUNDARY_HEIGHT / 2,
      -CHESSBOARD_WIDTH / 2 + BOUNDARY_THICKNESS / 2,
    ),
  );
  const boundaryShapeZ = RAPIER.ColliderDesc.cuboid(
    CHESSBOARD_LENGTH / 2,
    BOUNDARY_HEIGHT / 2,
    BOUNDARY_THICKNESS / 2,
  );
  world.createCollider(boundaryShapeZ, boundaryBody3);
  world.createCollider(boundaryShapeZ, boundaryBody4);
}

const diceMaterials = [
  "#b380ff",
  "#ff9955",
  "#a5c83b",
  "#55ddff",
  "#ffcc00",
  "#3e99ff",
  "#80ffe6",
  "#dcd4c2",
].map((hex) => new THREE.MeshStandardMaterial({ color: hex }));

const diceGeometry = new THREE.OctahedronGeometry(DICE_SIZE);
diceGeometry.addGroup(0, 3, 0);
diceGeometry.addGroup(3, 3, 1);
diceGeometry.addGroup(6, 3, 2);
diceGeometry.addGroup(9, 3, 3);
diceGeometry.addGroup(12, 3, 4);
diceGeometry.addGroup(15, 3, 5);
diceGeometry.addGroup(18, 3, 6);
diceGeometry.addGroup(21, 3, 7);
const dicePoints = new Float32Array(diceGeometry.attributes.position.array);

const diceMesh = new THREE.Mesh(diceGeometry, diceMaterials);

export function setupDice(
  x: number,
  z: number,
  rotation: RAPIER.Rotation,
  scene: THREE.Scene,
  world: RAPIER.World,
): [THREE.Mesh, RAPIER.RigidBody] {
  const mesh = diceMesh.clone();
  scene.add(mesh);
  const diceBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, DICE_INIT_HEIGHT, z)
      .setRotation(rotation),
  );
  const diceShape = RAPIER.ColliderDesc.convexHull(dicePoints)!
    .setMass(DICE_MASS)
    .setRestitution(DICE_RESTITUTION);
  world.createCollider(diceShape, diceBody);
  return [mesh, diceBody];
}
