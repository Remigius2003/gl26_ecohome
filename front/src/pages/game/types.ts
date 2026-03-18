import * as THREE from "three";

export interface GameEnemy {
    id:            string;
    mesh:          THREE.Mesh;
    hp:            number;
    speed:         number;
    type:          "melee" | "ranged";
    damage:        number;
    score:         number;
    lastShot:      number;
    shootInterval: number;
    radius:        number;
}

export interface GameProjectile {
    id:       string;
    mesh:     THREE.Mesh;
    dir:      THREE.Vector3;
    speed:    number;
    born:     number;
    lifetime: number;
    damage:   number;
}

export interface GameManaPickup {
    id:   string;
    mesh: THREE.Mesh;
    born: number;
}

export interface StartCubeInfo {
    sceneId:   string;
    mesh:      THREE.Mesh;
    labelId:   string | null;
    labelMesh: THREE.Object3D | null;
}
