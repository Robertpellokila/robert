import { animateScene } from "~/world/animateScene";
import { createInteriors } from "~/world/createInteriors";
import {
  initialPose,
  stepExplorer,
  type ExplorerInput,
  type ExplorerPose,
} from "~/world/roomExplorer";
import { poseCharacter } from "~/world/animateCharacter";
import { clamp01, smoothstep } from "~/utils/cinematicJourney";
import type { ChapterId } from "~/data/portfolio";
import { createCameraDirector } from "~/world/cameraDirector";
import type { CharacterRig } from "~/world/animateCharacter";
import { createChibiAvatar } from "~/world/createChibiAvatar";
import { discoveries } from "~/data/discoveries";
import * as THREE from "three";
import { createLivingWorld } from "~/world/livingWorld";
import type { WorldSettings } from "~/world/livingWorld";
import {
  adaptTier,
  pickInitialTier,
  targetInterval,
  type QualityPreference,
  type RenderQualityTier,
} from "~/utils/renderQuality";

/**
 * This file creates the world with Three.js primitives only.
 * No Blender, models, texture downloads, or external 3D assets are required.
 *
 * IMPORTANT CONCEPTS:
 * Scene   = container for everything we see.
 * Mesh    = Geometry (shape) + Material (appearance).
 * Camera  = point of view; an OrthographicCamera creates a miniature look.
 * Renderer = the thing that paints the scene to a <canvas>.
 * Progress = the current scroll position, between 0 and 1.
 */

const palette = {
  grass: "#d9e6c9",
  grassDark: "#c4d7b4",
  platform: "#bbc9ae",
  platformSide: "#8faa8f",
  road: "#e8e6d5",
  roadLine: "#fcfbef",
  foliage: "#799b75",
  foliageLight: "#9fbc86",
  foliageDark: "#5f8066",
  wood: "#937761",
  cream: "#f4edda",
  white: "#fffdf4",
  ink: "#2f4035",
  rose: "#d99488",
  peach: "#e9b99b",
  sand: "#e6cb92",
  blue: "#9ab5bd",
  blueDark: "#5f8795",
  denim: "#506678",
  purple: "#b9aaca",
  window: "#b7dfe1",
};

// Cache materials, so two objects of the same color share one material.
const materials = new Map<string, THREE.MeshStandardMaterial>();
function material(color: string) {
  if (!materials.has(color)) {
    materials.set(
      color,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.91,
        metalness: 0,
        flatShading: true,
      }),
    );
  }
  return materials.get(color)!;
}

function mesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  color: string,
  x: number,
  y: number,
  z: number,
) {
  const item = new THREE.Mesh(geometry, material(color));
  item.position.set(x, y, z);
  item.castShadow = true;
  item.receiveShadow = true;
  parent.add(item);
  return item;
}
function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  color: string,
  x: number,
  y: number,
  z: number,
) {
  return mesh(parent, new THREE.BoxGeometry(w, h, d), color, x, y, z);
}
function sphere(
  parent: THREE.Object3D,
  radius: number,
  color: string,
  x: number,
  y: number,
  z: number,
  segments = 8,
) {
  return mesh(
    parent,
    new THREE.SphereGeometry(radius, segments, 6),
    color,
    x,
    y,
    z,
  );
}
function cylinder(
  parent: THREE.Object3D,
  top: number,
  bottom: number,
  height: number,
  color: string,
  x: number,
  y: number,
  z: number,
  sides = 8,
) {
  return mesh(
    parent,
    new THREE.CylinderGeometry(top, bottom, height, sides),
    color,
    x,
    y,
    z,
  );
}

function createTree(
  parent: THREE.Object3D,
  x: number,
  z: number,
  scale = 1,
  variant = 0,
) {
  const group = new THREE.Group();
  group.position.set(x, 0.05, z);
  group.scale.setScalar(scale);
  parent.add(group);
  cylinder(group, 0.16, 0.22, 1.35, palette.wood, 0, 0.72, 0, 6);
  if (variant % 3 === 0) {
    const crown = mesh(
      group,
      new THREE.IcosahedronGeometry(1.15, 0),
      palette.foliageLight,
      0,
      2.04,
      0,
    );
    crown.scale.set(1, 1.1, 0.88);
  } else if (variant % 3 === 1) {
    const cone1 = mesh(
      group,
      new THREE.ConeGeometry(1.02, 1.55, 6),
      palette.foliageDark,
      0,
      1.65,
      0,
    );
    const cone2 = mesh(
      group,
      new THREE.ConeGeometry(0.76, 1.36, 6),
      palette.foliage,
      0,
      2.42,
      0,
    );
    cone1.rotation.y = 0.23;
    cone2.rotation.y = 0.23;
  } else {
    sphere(group, 0.78, palette.foliage, -0.48, 1.88, 0.1);
    sphere(group, 0.88, palette.foliageLight, 0.28, 2.23, -0.05);
    sphere(group, 0.63, palette.foliageDark, 0.56, 1.76, 0.16);
  }
  return group;
}

function createFlower(
  parent: THREE.Object3D,
  x: number,
  z: number,
  color: string,
  scale = 1,
) {
  const group = new THREE.Group();
  group.position.set(x, 0.06, z);
  group.scale.setScalar(scale);
  parent.add(group);
  cylinder(group, 0.03, 0.04, 0.42, palette.foliageDark, 0, 0.22, 0, 5);
  sphere(group, 0.16, color, 0, 0.49, 0, 7);
  sphere(group, 0.07, palette.sand, 0, 0.51, 0.13, 7);
}

function createHouse(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.1, z);
  parent.add(group);
  box(group, 5.2, 2.65, 4.05, palette.cream, 0, 1.34, 0);
  const roof = mesh(
    group,
    new THREE.ConeGeometry(3.82, 1.7, 4),
    palette.rose,
    0,
    3.47,
    0,
  );
  roof.rotation.y = Math.PI / 4;
  box(group, 0.95, 1.64, 0.12, palette.wood, 0.3, 0.9, 2.09);
  box(group, 1.2, 0.95, 0.12, palette.window, -1.5, 1.67, 2.09);
  box(group, 1.27, 0.12, 0.25, palette.white, -1.5, 1.15, 2.14);
  sphere(group, 0.065, palette.sand, 0.62, 0.9, 2.17);
  box(group, 6, 0.18, 4.9, "#d2c1a5", 0, -0.07, 0);
  createTree(group, 3.5, -0.8, 0.93, 2);
  return group;
}

function createStudio(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.12, z);
  parent.add(group);
  box(group, 5.5, 3.0, 3.75, palette.white, 0, 1.5, 0);
  box(group, 5.8, 0.36, 4.04, palette.denim, 0, 3.13, 0);
  box(group, 2.65, 1.82, 0.13, palette.window, -0.85, 1.65, 1.96);
  box(group, 1.0, 2.05, 0.17, palette.wood, 1.67, 1.13, 1.96);
  box(group, 0.56, 0.23, 0.39, "#3e5553", -0.78, 0.82, 2.12);
  box(group, 0.44, 0.36, 0.07, palette.white, -0.78, 1.13, 2.12);
  cylinder(group, 0.37, 0.5, 0.73, palette.foliage, 3.3, 0.48, 1.58, 6);
  createTree(group, -3.68, -0.9, 0.77, 1);
  return group;
}

function createCareerHub(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.12, z);
  parent.add(group);
  box(group, 5.1, 3.05, 3.9, palette.cream, 0, 1.54, 0);
  box(group, 5.45, 0.29, 4.22, palette.foliageDark, 0, 3.19, 0);
  // A modern work / school building, consistent with the green pastel palette.
  for (const offset of [-1.45, 0, 1.45]) {
    box(group, 0.95, 1.2, 0.11, palette.window, offset, 1.92, 2.01);
    box(group, 1.02, 0.12, 0.22, palette.white, offset, 1.26, 2.07);
  }
  box(group, 0.94, 1.56, 0.17, palette.wood, 0, 0.86, 2.11);
  box(group, 2.1, 0.35, 0.36, palette.sand, 0, 2.86, 2.17);
  createTree(group, 3.3, -0.5, 0.78, 2);
  return group;
}

function createTechDistrict(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.12, z);
  parent.add(group);
  // Three towers of different heights evoke different technology stacks.
  const towers = [
    { x: -2.7, height: 4.0, color: palette.blue },
    { x: 0, height: 5.7, color: palette.purple },
    { x: 2.65, height: 3.5, color: palette.sand },
  ];
  for (const item of towers) {
    box(group, 2.35, item.height, 3.5, item.color, item.x, item.height / 2, 0);
    box(group, 2.58, 0.23, 3.7, palette.white, item.x, item.height + 0.04, 0);
    for (let row = 0; row < Math.floor(item.height / 1.05); row++) {
      box(
        group,
        1.04,
        0.48,
        0.07,
        palette.window,
        item.x,
        0.89 + row * 1.0,
        1.79,
      );
    }
  }
  cylinder(group, 0.38, 0.5, 0.62, palette.wood, -4.3, 0.33, 2);
  sphere(group, 0.68, palette.foliageLight, -4.3, 0.95, 2);
  return group;
}

function createProjectGallery(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.1, z);
  parent.add(group);
  box(group, 6.8, 3.15, 4.25, "#e7dbc7", 0, 1.6, 0);
  box(group, 7.0, 0.42, 4.58, palette.blueDark, 0, 3.32, 0);
  for (let i = -1; i <= 1; i++) {
    box(group, 1.6, 2.22, 0.12, palette.window, i * 2.02, 1.34, 2.2);
  }
  box(group, 2.2, 0.25, 0.32, palette.sand, 0, 2.78, 2.34);
  const object1 = mesh(
    group,
    new THREE.IcosahedronGeometry(0.62, 0),
    palette.rose,
    -2.3,
    4.0,
    0,
  );
  object1.rotation.z = 0.26;
  const object2 = mesh(
    group,
    new THREE.OctahedronGeometry(0.56, 0),
    palette.foliage,
    2.2,
    3.98,
    0,
  );
  object2.rotation.y = 0.4;
  return group;
}

function createCafe(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.11, z);
  parent.add(group);
  box(group, 4.9, 2.55, 3.35, palette.cream, -0.9, 1.3, 0);
  const roof = mesh(
    group,
    new THREE.ConeGeometry(3.5, 1.45, 4),
    palette.sand,
    -0.9,
    3.21,
    0,
  );
  roof.rotation.y = Math.PI / 4;
  box(group, 2.4, 1.47, 0.13, palette.window, -1.55, 1.55, 1.74);
  box(group, 1.0, 1.8, 0.15, palette.wood, 0.97, 0.99, 1.76);
  cylinder(group, 0.12, 0.12, 1.7, palette.wood, 3.2, 0.97, 0, 6);
  const umbrella = mesh(
    group,
    new THREE.ConeGeometry(2.2, 1.0, 8),
    palette.rose,
    3.2,
    1.96,
    0,
  );
  umbrella.rotation.y = 0.3;
  cylinder(group, 0.9, 0.9, 0.14, palette.wood, 3.2, 0.75, 0, 8);
  cylinder(group, 0.17, 0.2, 0.64, palette.white, 3.2, 1.12, 0, 8);
  createTree(group, -4.1, 0.25, 0.9, 0);
  return group;
}

function createMarker(parent: THREE.Object3D, x: number, z: number) {
  const marker = mesh(
    parent,
    new THREE.TorusGeometry(1.05, 0.085, 5, 20),
    palette.white,
    x,
    0.25,
    z,
  );
  marker.rotation.x = -Math.PI / 2;
}

function createLabel(
  parent: THREE.Object3D,
  text: string,
  x: number,
  y: number,
  z: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f9f4e7";
  ctx.beginPath();
  ctx.roundRect(14, 18, 484, 122, 44);
  ctx.fill();
  ctx.fillStyle = "#466050";
  ctx.font = "bold 49px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 83);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthWrite: false }),
  );
  sprite.scale.set(3.6, 1.12, 1);
  sprite.position.set(x, y, z);
  parent.add(sprite);
}

/**
 * v0.8.2: avatar has moved into createChibiAvatar.ts for easier learning.
 * Its middle-part / curtain hairstyle comes from the user-supplied reference.
 */
function createAvatar(): CharacterRig {
  return createChibiAvatar();
}

function wheel(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  radius = 0.45,
) {
  // Torus lies in the XY plane, convenient for wheels on either side of a vehicle.
  const tire = mesh(
    parent,
    new THREE.TorusGeometry(radius, 0.125, 7, 12),
    palette.ink,
    x,
    y,
    z,
  );
  cylinder(
    parent,
    radius * 0.55,
    radius * 0.55,
    0.055,
    palette.white,
    x,
    y,
    z,
    10,
  ).rotation.x = Math.PI / 2;
  return tire;
}

function createMotorbike() {
  const group = new THREE.Group();
  const wheels = [wheel(group, -0.75, 0.48, 0), wheel(group, 0.7, 0.48, 0)];
  box(group, 1.23, 0.29, 0.45, palette.rose, 0, 0.87, 0);
  box(group, 0.63, 0.15, 0.43, palette.ink, -0.32, 1.12, 0);
  const fork = box(group, 0.09, 0.72, 0.09, palette.ink, 0.65, 1.0, 0);
  fork.rotation.z = 0.27;
  box(group, 0.47, 0.075, 0.08, palette.ink, 0.62, 1.42, 0);
  // The actual 3D avatar is positioned on the saddle by animateScene.ts.
  // No duplicate rider mesh: only ONE character exists during the journey.
  box(group, 0.52, 0.08, 0.42, "#f6e7d4", -0.35, 1.2, 0); // seat accent
  sphere(group, 0.13, "#fff2ce", 0.93, 0.96, 0, 8); // headlight
  box(group, 0.13, 0.16, 0.16, "#a6b6a8", -0.82, 1.0, 0); // taillight
  return { group, wheels };
}

function createBus() {
  const group = new THREE.Group();
  box(group, 4.6, 2.05, 1.78, palette.sand, 0, 1.48, 0);
  box(group, 4.68, 0.2, 1.82, palette.cream, 0, 2.58, 0);
  box(group, 0.13, 0.35, 1.55, palette.white, 2.35, 1.29, 0);
  // Windows on both sides.
  for (let i = -1; i <= 1; i++) {
    for (const side of [-1, 1]) {
      box(
        group,
        0.89,
        0.77,
        0.05,
        palette.window,
        i * 1.14 - 0.2,
        1.9,
        side * 0.92,
      );
    }
  }
  box(group, 0.12, 0.8, 1.35, palette.window, 2.34, 1.9, 0);
  // Visible boarding door on +Z side, with its handle and step.
  box(group, 0.84, 1.49, 0.055, "#d7bea3", 1.15, 1.04, 0.95);
  box(group, 0.64, 0.72, 0.065, palette.window, 1.15, 1.64, 0.986);
  box(group, 0.06, 1.42, 0.08, palette.ink, 0.75, 1.06, 0.998);
  box(group, 0.58, 0.1, 0.47, "#8c937f", 1.15, 0.29, 1.13);
  for (const dz of [-0.56, 0.56])
    sphere(group, 0.14, "#fff2ce", 2.38, 1.08, dz, 8);
  const wheels: THREE.Mesh[] = [];
  for (const x of [-1.55, 1.55]) {
    for (const z of [-0.95, 0.95]) wheels.push(wheel(group, x, 0.52, z, 0.42));
  }
  return { group, wheels };
}

function createRoad(parent: THREE.Object3D, curve: THREE.CatmullRomCurve3) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const count = 150;
  const halfWidth = 1.75;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = point.clone().addScaledVector(normal, halfWidth);
    const right = point.clone().addScaledVector(normal, -halfWidth);
    vertices.push(left.x, 0.19, left.z, right.x, 0.19, right.z);
    if (i < count) {
      const n = i * 2;
      indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const road = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: palette.road,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
  );
  road.receiveShadow = true;
  parent.add(road);
  // Each small white box is a road marking.
  for (let i = 2; i < 130; i += 6) {
    const p = curve.getPointAt(i / count);
    const tangent = curve.getTangentAt(i / count);
    const mark = box(
      parent,
      0.8,
      0.025,
      0.085,
      palette.roadLine,
      p.x,
      0.213,
      p.z,
    );
    mark.rotation.y = -Math.atan2(tangent.z, tangent.x);
    mark.castShadow = false;
  }
}

function addScenery(scene: THREE.Scene, curve: THREE.CatmullRomCurve3) {
  box(scene, 82, 1.42, 23, palette.platformSide, 0, -0.76, 0);
  box(scene, 81.7, 0.25, 22.7, palette.grass, 0, 0.025, 0);
  createRoad(scene, curve);
  const buildings: Record<ChapterId, THREE.Group> = {
    home: createHouse(scene, -29, -5.6),
    about: createStudio(scene, -17.5, -5.8),
    experience: createCareerHub(scene, -6, -6),
    skills: createTechDistrict(scene, 5.5, -6.2),
    projects: createProjectGallery(scene, 17.5, -6),
    contact: createCafe(scene, 29, -5.3),
  };

  // A little landscaping. Deterministic positions produce the same city on every reload.
  const animatedTrees: THREE.Group[] = [];
  const clouds: THREE.Group[] = [];
  const trees: Array<[number, number, number, number]> = [
    [-32, -7.8, 0.85, 1],
    [-22.2, -10.5, 0.85, 0],
    [-17, 8.2, 0.9, 2],
    [-9, -8.9, 0.83, 1],
    [-5, 8.4, 1.1, 0],
    [5.1, -8.4, 0.88, 2],
    [7.4, 8.1, 0.93, 1],
    [19, -8.3, 0.93, 1],
    [22, 8.2, 0.8, 0],
    [31.5, -8.2, 0.9, 2],
    [-30, 7.8, 1.04, 0],
    [-2.2, 9.1, 0.76, 2],
    [32, 8.4, 0.8, 1],
  ];
  for (const [x, z, s, variant] of trees)
    animatedTrees.push(createTree(scene, x, z, s, variant));
  for (let i = 0; i < 42; i++) {
    const x = -33.5 + i * 1.58;
    const z = i % 3 === 0 ? 6.8 : 8.85 + Math.sin(i * 4.1) * 0.5;
    createFlower(
      scene,
      x,
      z,
      [palette.rose, palette.sand, palette.white][i % 3]!,
      0.68 + (i % 4) * 0.12,
    );
  }
  for (const t of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    const p = curve.getPointAt(t);
    createMarker(scene, p.x, p.z);
  }
  createLabel(scene, "WELCOME", -29, 5.8, -5.6);
  createLabel(scene, "ABOUT", -17.5, 5.4, -5.8);
  createLabel(scene, "EXPERIENCE", -6, 5.5, -6.0);
  createLabel(scene, "SKILLS", 5.5, 7.2, -6.2);
  createLabel(scene, "PROJECTS", 17.5, 5.5, -6);
  createLabel(scene, "CONTACT", 29, 5.2, -5.3);

  // Clouds provide scale and depth in the otherwise empty sky.
  for (const [x, z, y, scale] of [
    [-28, -10, 10, 1.1],
    [-4, -13, 12, 1.4],
    [20, -12, 10, 1.0],
  ] as const) {
    const cloud = new THREE.Group();
    cloud.position.set(x, y, z);
    cloud.scale.setScalar(scale);
    scene.add(cloud);
    clouds.push(cloud);
    sphere(cloud, 0.9, palette.white, -0.75, 0, 0);
    sphere(cloud, 1.1, palette.white, 0.1, 0.36, 0);
    sphere(cloud, 0.83, palette.white, 1.03, 0, 0);
  }
  return { buildings, trees: animatedTrees, clouds };
}

/**
 * v0.7: tangible miniatures that invite curiosity. All clickable shapes are
 * rendered in the same scene and selected with a Raycaster (not an overlay).
 * Accessible HTML equivalents live in the mini-map for touch/keyboard users.
 */
function createDiscoveryObjects(scene: THREE.Scene) {
  const stops = [
    [-29, -2.1],
    [-17.5, -2.3],
    [-6, -2.4],
    [5.5, -2.3],
    [17.5, -2.25],
    [29, -1.9],
  ] as const;
  const targets: THREE.Mesh[] = [];
  const display: Array<{ group: THREE.Group; index: number }> = [];
  discoveries.forEach((item, index) => {
    const [x, z] = stops[index]!;
    const group = new THREE.Group();
    group.position.set(x + 2.7, 0.28, z);
    scene.add(group);
    // Small wooden pedestal grounds the collectible in the miniature world.
    cylinder(group, 0.49, 0.56, 0.2, "#d9caaa", 0, 0.1, 0, 10);
    const accent = new THREE.MeshStandardMaterial({
      color: item.accent,
      roughness: 0.43,
      metalness: 0.12,
      emissive: item.accent,
      emissiveIntensity: 0.19,
      flatShading: true,
    });
    let figure: THREE.Mesh;
    if (item.id === "home") {
      figure = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), accent);
    } else if (item.id === "about") {
      figure = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.13, 0.48), accent);
      figure.rotation.z = -0.16;
    } else if (item.id === "experience") {
      figure = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.64, 5), accent);
    } else if (item.id === "skills") {
      figure = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.18), accent);
    } else if (item.id === "projects") {
      figure = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38), accent);
    } else {
      figure = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.25, 0.4, 9),
        accent,
      );
    }
    figure.position.y = 0.65;
    figure.castShadow = true;
    group.add(figure);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.63, 0.037, 6, 24),
      new THREE.MeshBasicMaterial({
        color: item.accent,
        transparent: true,
        opacity: 0.68,
      }),
    );
    ring.position.y = 0.17;
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
    // Invisible but raycastable hit area: easier to select small items.
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.87, 8, 8),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    hit.position.y = 0.63;
    hit.userData.discoveryId = item.id;
    group.add(hit);
    targets.push(hit);
    display.push({ group, index });
  });
  return { targets, display };
}

/** Called by the Vue component once the browser has mounted a real DOM element. */
export function createWorld(
  host: HTMLElement,
  getProgress: () => number,
  onError?: (error: unknown) => void,
  getCinematicMode?: () => boolean,
  getInteriorState?: () => { id: ChapterId | null; progress: number },
  getWorldSettings?: () => WorldSettings,
  onDiscover?: (id: ChapterId) => void,
  onReady?: () => void,
  onPerformance?: (fps: number, tier: RenderQualityTier) => void,
  getQualityPreference?: () => QualityPreference,
  getExplorerInput?: () => ExplorerInput,
  onRoomObject?: (id: ChapterId, objectId: string) => void,
  getGreetingSignal?: () => number,
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#eaf1e9");
  scene.fog = new THREE.Fog("#eaf1e9", 52, 113);
  const hemisphere = new THREE.HemisphereLight("#f7fbf4", "#91a58a", 3);
  scene.add(hemisphere);
  const sunlight = new THREE.DirectionalLight("#fff3df", 3);
  sunlight.position.set(-16, 30, 19);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -42;
  sunlight.shadow.camera.right = 42;
  sunlight.shadow.camera.top = 28;
  sunlight.shadow.camera.bottom = -28;
  sunlight.shadow.camera.near = 0.1;
  sunlight.shadow.camera.far = 90;
  sunlight.shadow.bias = -0.0002;
  scene.add(sunlight);

  // Enam titik dekat enam lokasi chapter; progress 0..1 dibagi lima perjalanan.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-29, 0.26, 2.2),
    new THREE.Vector3(-17.5, 0.26, 1.5),
    new THREE.Vector3(-6, 0.26, 2.2),
    new THREE.Vector3(5.5, 0.26, 1.5),
    new THREE.Vector3(17.5, 0.26, 2.15),
    new THREE.Vector3(29, 0.26, 1.8),
  ]);
  const { buildings, trees, clouds } = addScenery(scene, path);
  const interiors = createInteriors(scene);
  // Cache the joint once. Avoid traversing all room meshes every animation frame.
  const baristaWaveArm = interiors.rooms.contact.getObjectByName(
    "contact-barista-wave-arm",
  );
  const interactive = createDiscoveryObjects(scene);
  const avatar = createAvatar();
  scene.add(avatar.group);
  const motor = createMotorbike();
  const bus = createBus();
  scene.add(motor.group, bus.group);

  const camera = new THREE.OrthographicCamera(-13, 13, 8, -8, 0.1, 200);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const cameraDirector = createCameraDirector(camera, reducedMotion);
  const firstPersonCamera = new THREE.PerspectiveCamera(70, 1, 0.06, 130);
  let indoorPose: ExplorerPose = initialPose();
  let previousRoom: ChapterId | null = null;
  let pointerDown: { x: number; y: number } | null = null;
  let dragged = false;
  let pointerDistance = 0;
  const movingWorld = { path, avatar, motor, bus };

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor("#eaf1e9", 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.7;
  host.appendChild(renderer.domElement);

  // 3D pointer picking; DOM cards and the mini-map remain higher in z-index.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hoverId: ChapterId | null = null;
  function findDiscovery(event: MouseEvent): ChapterId | null {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactive.targets, false);
    return (
      (hits[0]?.object.userData.discoveryId as ChapterId | undefined) ?? null
    );
  }
  function findRoomObject(event: MouseEvent) {
    const room = getInteriorState?.();
    if (!room?.id || room.progress < 0.98) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, firstPersonCamera);
    const hits = raycaster.intersectObjects(interiors.hotspots, false);
    const picked = hits.find((hit) => hit.object.userData.roomId === room.id);
    return picked?.object.userData as
      | { roomId: ChapterId; objectId: string; label: string }
      | undefined;
  }
  function onPointerDown(event: PointerEvent) {
    if (
      getInteriorState?.().id &&
      (getInteriorState?.().progress ?? 0) >= 0.98
    ) {
      pointerDown = { x: event.clientX, y: event.clientY };
      dragged = false;
      pointerDistance = 0;
    }
  }
  function onPointerMove(event: PointerEvent) {
    if (pointerDown && getInteriorState?.().id) {
      const dx = event.clientX - pointerDown.x;
      pointerDistance += Math.hypot(dx, event.clientY - pointerDown.y);
      if (pointerDistance > 5) dragged = true;
      indoorPose.yaw -= dx * 0.004;
      pointerDown = { x: event.clientX, y: event.clientY };
    }
    if (
      getInteriorState?.().id &&
      (getInteriorState?.().progress ?? 0) >= 0.98
    ) {
      const item = findRoomObject(event);
      renderer.domElement.style.cursor = item ? "pointer" : "grab";
      renderer.domElement.title = item?.label ?? "Drag right to look right";
      return;
    }
    const next = getInteriorState?.().id ? null : findDiscovery(event);
    if (hoverId === next) return;
    hoverId = next;
    renderer.domElement.style.cursor = next ? "pointer" : "default";
    renderer.domElement.title = next ? `Discover the ${next} secret` : "";
  }
  function onPointerClick(event: MouseEvent) {
    if (getInteriorState?.().id) {
      if (!dragged) {
        const item = findRoomObject(event);
        if (item) onRoomObject?.(item.roomId, item.objectId);
      }
      dragged = false;
      return;
    }
    const id = findDiscovery(event);
    if (id) onDiscover?.(id);
  }
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  const resetPointer = () => {
    pointerDown = null;
  };
  renderer.domElement.addEventListener("pointerup", resetPointer);
  renderer.domElement.addEventListener("pointercancel", resetPointer);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("click", onPointerClick);
  function onPointerLeave() {
    renderer.domElement.style.cursor = "default";
    hoverId = null;
  }
  renderer.domElement.addEventListener("pointerleave", onPointerLeave);

  // v0.6: Independent living-world system; it does not own scroll or camera.
  const livingWorld = createLivingWorld({
    scene,
    path,
    trees,
    clouds,
    buildings,
    hemisphere,
    sunlight,
    renderer,
  });

  // WebGL errors after initialization should also be visible to the user.
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onError?.(
      new Error(
        "The WebGL context was lost. Reload the page, or check browser GPU acceleration.",
      ),
    );
  };
  renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const ratio = width / height;
    const visibleHeight = width < 760 ? 22 : 17;
    camera.left = (-visibleHeight * ratio) / 2;
    camera.right = (visibleHeight * ratio) / 2;
    camera.top = visibleHeight / 2;
    camera.bottom = -visibleHeight / 2;
    camera.updateProjectionMatrix();
    firstPersonCamera.aspect = ratio;
    firstPersonCamera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  let latestGreetingSignal = 0;
  let greetingStartedAt = -1;
  let lastDraw = 0;
  let sampleStart = 0;
  let sampleFrames = 0;
  let readySent = false;
  let actualQuality: RenderQualityTier = pickInitialTier(
    host.clientWidth,
    reducedMotion,
    navigator.hardwareConcurrency || 4,
  );
  let lastQuality: RenderQualityTier | null = null;
  function announceQuality(fps: number) {
    if (actualQuality !== lastQuality) lastQuality = actualQuality;
    onPerformance?.(Math.round(fps), actualQuality);
  }
  const renderFrame = (time: number) => {
    const preference = getQualityPreference?.() ?? "auto";
    if (preference !== "auto") actualQuality = preference;
    if (lastDraw && time - lastDraw < targetInterval(actualQuality) - 1.2)
      return;
    const deltaSeconds = lastDraw
      ? Math.min(0.05, (time - lastDraw) / 1000)
      : 1 / 60;
    lastDraw = time;
    if (!sampleStart) sampleStart = time;
    sampleFrames++;
    if (time - sampleStart > 3500) {
      const fps = (sampleFrames * 1000) / (time - sampleStart);
      // A low frame-rate target is intentional, not necessarily a slow device.
      if (preference === "auto" && actualQuality !== "low")
        actualQuality = adaptTier(actualQuality, fps);
      announceQuality(fps);
      sampleStart = time;
      sampleFrames = 0;
    }
    const t = Math.max(0, Math.min(1, getProgress()));

    // One scroll value drives all movements: walking, getting on, riding,
    // getting off, body gestures, vehicle wheels and cinematic camera.
    try {
      const frame = animateScene(movingWorld, t);
      // Decorations move only when World Motion is enabled.
      const motion = getWorldSettings?.().motionEnabled !== false;
      // A friendly slow wave (uses the same render loop as the 3D world).
      if (baristaWaveArm) {
        baristaWaveArm.rotation.z = motion
          ? 2.58 + Math.sin(time * 0.004) * 0.28
          : 2.58;
      }
      interactive.display.forEach(({ group, index }) => {
        group.children[1]!.rotation.y = motion
          ? Math.sin(time * 0.00065 + index) * 0.23
          : 0;
        group.children[1]!.position.y =
          0.65 + (motion ? Math.sin(time * 0.0018 + index) * 0.075 : 0);
      });
      livingWorld.update(
        deltaSeconds,
        {
          ...(getWorldSettings?.() ?? {
            timeOfDay: "day",
            motionEnabled: true,
            ecoMode: false,
          }),
          quality: actualQuality,
        },
        frame.actorPosition,
      );
      cameraDirector.update(
        frame.state,
        frame.actorPosition,
        frame.tangent,
        deltaSeconds,
        getCinematicMode?.() ?? true,
        host.clientWidth,
      );

      // Trigger only after a 3D selection; preview renders without a greeting.
      const greetingSignal = getGreetingSignal?.() ?? 0;
      if (greetingSignal !== latestGreetingSignal) {
        latestGreetingSignal = greetingSignal;
        greetingStartedAt = greetingSignal > 0 ? time : -1;
      }
      const greetingElapsed = time - greetingStartedAt;
      const greetingAllowed =
        greetingStartedAt >= 0 && t < 0.025 && !getInteriorState?.().id;
      const greetingActive =
        greetingAllowed &&
        greetingElapsed >= 0 &&
        greetingElapsed < (reducedMotion ? 400 : 3000);
      if (greetingActive) {
        const phase = reducedMotion ? 1 : greetingElapsed / 3000;
        const faceDirection = Math.atan2(
          camera.position.x - avatar.group.position.x,
          camera.position.z - avatar.group.position.z,
        );
        const originalFacing = avatar.group.rotation.y;
        const enter = smoothstep(Math.min(1, phase / 0.16));
        const leave = smoothstep(Math.max(0, (phase - 0.77) / 0.23));
        const facingWeight = enter * (1 - leave);
        avatar.group.rotation.y =
          originalFacing +
          Math.atan2(
            Math.sin(faceDirection - originalFacing),
            Math.cos(faceDirection - originalFacing),
          ) *
            facingWeight;
        if (phase < 0.43) {
          poseCharacter(avatar, "wave", time / 900, 1);
          avatar.rightArm.rotation.z =
            -1.75 + (reducedMotion ? 0 : 0.2 * Math.sin(time * 0.009));
        } else if (phase < 0.83) {
          poseCharacter(avatar, "invite", time / 880, 1);
        } else {
          poseCharacter(avatar, "idle", time / 900);
        }
        if (!reducedMotion) {
          // Brief push-in; return to the existing cinematic camera at the end.
          const cameraWeight = Math.sin(phase * Math.PI) * 0.65;
          const welcomingPosition = new THREE.Vector3(
            avatar.group.position.x + 8,
            avatar.group.position.y + 8,
            avatar.group.position.z + 12,
          );
          const welcomingTarget = avatar.group.position
            .clone()
            .add(new THREE.Vector3(host.clientWidth <= 760 ? 0 : 1.5, 1.4, 0));
          const lookPoint = frame.actorPosition
            .clone()
            .add(new THREE.Vector3(host.clientWidth <= 760 ? 0 : 2, 1, 0));
          camera.position.lerp(welcomingPosition, cameraWeight);
          camera.zoom += (1.25 - camera.zoom) * cameraWeight;
          camera.updateProjectionMatrix();
          camera.lookAt(lookPoint.lerp(welcomingTarget, cameraWeight));
        }
      }

      // Building transitions: tween progress comes from Vue, so the entire
      // visit is explicit, reversible, and never hijacks normal page scroll.
      const visit = getInteriorState?.();
      const roomId = visit?.id ?? null;
      const entry = roomId ? clamp01(visit?.progress ?? 0) : 0;
      if (roomId !== previousRoom) {
        indoorPose = initialPose();
        previousRoom = roomId;
      }
      for (const id of Object.keys(buildings) as ChapterId[]) {
        buildings[id].visible = !(id === roomId && entry >= 0.55);
        interiors.rooms[id].visible = id === roomId && entry >= 0.55;
        interiors.gates[id].visible = id !== roomId || entry < 0.55;
        interiors.doorPivots[id].rotation.y =
          id === roomId ? -1.53 * smoothstep((entry - 0.14) / 0.29) : 0;
      }
      // Outdoor trees live directly under `scene`, not under the About room.
      // Hide all outdoor foliage while a room is shown, then restore on exit.
      // This prevents exterior scenery from clipping through any interior wall.
      const isInteriorVisible = roomId !== null && entry >= 0.55;
      for (const tree of trees) tree.visible = !isInteriorVisible;
      if (roomId && entry > 0) {
        const target = interiors.centers[roomId];
        const door = interiors.doors[roomId];
        // Character approaches the visible front door before the cutaway.
        if (entry <= 0.55) {
          const walk = smoothstep(entry / 0.55);
          const initial = path.getPointAt(
            Object.keys(buildings).indexOf(roomId) / 5,
          );
          avatar.group.position.copy(initial).lerp(door, walk);
          avatar.group.rotation.y = Math.PI;
          poseCharacter(avatar, "walk", entry * 4, 1);
        } else {
          avatar.group.position.set(target.x, 0.25, target.z + 1.25);
          avatar.group.rotation.y = Math.PI;
          poseCharacter(avatar, "idle", entry * 4);
        }
        // Wide establishing shot transitions into miniature cutaway interior.
        const cameraBlend = smoothstep((entry - 0.18) / 0.74);
        // At first the view approaches the door from outside, rather than
        // stopping at a distant cutaway camera angle.
        const finalCamera = new THREE.Vector3(door.x + 1.8, 3.6, door.z + 4.8);
        const finalLook = new THREE.Vector3(door.x, 1.5, door.z - 1.0);
        camera.position.lerp(finalCamera, cameraBlend);
        camera.zoom += (1.78 - camera.zoom) * cameraBlend;
        camera.updateProjectionMatrix();
        const look = frame.actorPosition.clone().lerp(finalLook, cameraBlend);
        camera.lookAt(look);
      }
      // v0.8.5: highly reflective pale rooms otherwise look washed out at outdoor exposure.
      const targetExposure = roomId && entry >= 0.55 ? 1.04 : 1.7;
      renderer.toneMappingExposure +=
        (targetExposure - renderer.toneMappingExposure) *
        Math.min(1, deltaSeconds * 3.5);
      if (roomId && entry >= 0.985) {
        indoorPose = stepExplorer(
          indoorPose,
          getExplorerInput?.() ?? { forward: 0, strafe: 0, turn: 0 },
          deltaSeconds,
        );
        const center = interiors.centers[roomId];
        firstPersonCamera.position.set(
          center.x + indoorPose.x,
          1.72,
          center.z + indoorPose.z,
        );
        firstPersonCamera.rotation.set(0, indoorPose.yaw, 0);
        // User-facing interaction tags: billboard + subtle idle motion.
        for (const hit of interiors.hotspots) {
          if (
            !hit.userData.isInteractionBubble ||
            hit.userData.roomId !== roomId
          )
            continue;
          hit.quaternion.copy(firstPersonCamera.quaternion);
          hit.position.y =
            hit.userData.baseY +
            (motion ? Math.sin(time * 0.0018 + hit.position.x) * 0.025 : 0);
        }
        avatar.group.visible = false; // The visitor IS the camera, no avatar head in view.
        renderer.render(scene, firstPersonCamera);
      } else {
        renderer.render(scene, camera);
      }
      if (!readySent) {
        readySent = true;
        onReady?.();
        announceQuality(0);
      }
    } catch (error) {
      renderer.setAnimationLoop(null);
      onError?.(error);
    }
  };
  function handleVisibility() {
    // Suspend GPU work in hidden tabs; restore on return without a huge delta time.
    if (document.hidden) renderer.setAnimationLoop(null);
    else {
      lastDraw = 0;
      sampleStart = 0;
      sampleFrames = 0;
      renderer.setAnimationLoop(renderFrame);
    }
  }
  document.addEventListener("visibilitychange", handleVisibility);
  if (!document.hidden) renderer.setAnimationLoop(renderFrame);

  /** Release graphics memory when navigating away from the page. */
  return () => {
    renderer.setAnimationLoop(null);
    document.removeEventListener("visibilitychange", handleVisibility);
    observer.disconnect();
    renderer.domElement.removeEventListener(
      "webglcontextlost",
      handleContextLost,
    );
    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointerup", resetPointer);
    renderer.domElement.removeEventListener("pointercancel", resetPointer);
    renderer.domElement.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("click", onPointerClick);
    renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
    const geometries = new Set<THREE.BufferGeometry>();
    const allMaterials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Sprite))
        return;
      if (object instanceof THREE.Mesh) geometries.add(object.geometry);
      const meshMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const m of meshMaterials) {
        allMaterials.add(m);
        const withMap = m as THREE.MeshStandardMaterial;
        if (withMap.map) textures.add(withMap.map);
      }
    });
    for (const g of geometries) g.dispose();
    for (const t of textures) t.dispose();
    for (const m of allMaterials) m.dispose();
    materials.clear();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
