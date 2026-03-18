import * as THREE from "three";

export type GizmoFace = "top" | "bottom" | "right" | "left" | "front" | "back";

export interface SceneObject {
    id:   string;
    mesh: THREE.Object3D; // Mesh or Group
}

export interface ThreeEngineHandle {
    addObject:        (obj: SceneObject) => void;
    removeObject:     (id: string) => void;
    getScene:         () => THREE.Scene;
    resetCamera:      () => void;
    setFaceLit:       (face: GizmoFace, lit: boolean) => void;
    setFrameCallback: (fn: (() => void) | null) => void;
}

export interface ThreeEngineProps {
    onReady?:       (handle: ThreeEngineHandle) => void;
    onGroundClick?: (point: THREE.Vector3) => void;
    onMeshClick?:   (sceneId: string, point: THREE.Vector3) => void;
    onRightClick?:  (point: THREE.Vector3) => void;
    cameraBounds?:  number;
    style?:         React.CSSProperties;
}
