import { globalNavigate } from "../../App";

export type AsciiThingDef = {
    width: number;
    height: number;

    // rendering
    texture?: string;
    solid?: boolean;

    // interaction (optional)
    areaOfInteraction?: number; // default -1
    priority?: number; // default 0
    onInteract?: () => void;
};
export const THING_DEFS: Record<string, AsciiThingDef> = {
    T: {
        width: 3,
        height: 3,
        texture: "house/furniture/table.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => {
            globalNavigate("/social");
        },
    },
    S: {
        width: 2,
        height: 2,
        texture: "house/furniture/tableSimple.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => {
            globalNavigate("/social");
        },
    },
    V: {
        width: 2,
        height: 2,
        texture: "house/furniture/tv.png",
        solid: true,
        priority: 0,
    },
    C: {
        width: 1,
        height: 1,
        texture: "house/furniture/chairFace.png",
        solid: true,
        priority: 0,
    },
    L: {
        width: 1,
        height: 1,
        texture: "house/furniture/chairtoleft.png",
        solid: true,
        areaOfInteraction: 0,
        priority: 0,
        onInteract: () => {
            console.log("S'assoir sur la chaise");
        },
    },
    Q: {
        width: 2,
        height: 2,
        texture: "house/furniture/chair_conf.png",
        solid: true,
    },
    F: {
        width: 1,
        height: 2,
        texture: "house/furniture/frigo.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => {
            globalNavigate("/PreQuizz?type=alimentation");
        },
    },

    W: {
        width: 2,
        height: 2,
        texture: "house/furniture/machine_alaver.png",
        solid: true,
    },

    O: {
        width: 2,
        height: 2,
        texture: "house/furniture/four.png",
        solid: true,
    },

    N: {
        width: 3,
        height: 3,
        texture: "house/furniture/piano.png",
        solid: true,
    },

    K: {
        width: 6,
        height: 2,
        texture: "house/furniture/cuisine.png",
        solid: true,
    },

    A: {
        width: 1,
        height: 1,
        texture: "house/furniture/chaise_salon.png",
        solid: true,
    },

    Z: {
        width: 3,
        height: 3,
        texture: "house/furniture/sofa_oriente.png",
        solid: true,
    },

    B: {
        width: 4,
        height: 4,
        texture: "house/furniture/lit.png",
        solid: true,
    },

    H: {
        width: 2,
        height: 2,
        texture: "house/furniture/horloge.png",
        solid: false,
    },

    Y: {
        width: 2,
        height: 1,
        texture: "house/furniture/tab_basse.png",
        solid: true,
    },

    D: {
        width: 2,
        height: 2,
        texture: "house/furniture/armoire.png",
        solid: true,
        areaOfInteraction: 1,
        onInteract: () => {
            globalNavigate("/customisation");
        },
    },

    G: {
        width: 3,
        height: 2,
        texture: "house/furniture/etagere.png",
        solid: true,
    },

    J: {
        width: 3,
        height: 2,
        texture: "house/furniture/chemine.png",
        solid: true,
    },

    U: {
        width: 1,
        height: 2,
        texture: "house/furniture/bath.png",
        solid: true,
    },
    s: {
        width: 3,
        height: 3,
        texture: "house/furniture/sofa.png",
        solid: false,
    },
    E: {
        width: 8,
        height: 2,
        texture: "house/furniture/esc.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 1,
        onInteract: () => {
            globalNavigate("/home2");
        },
    },
    R: {
        width: 2,
        height: 2,
        texture: "le tapis",
        solid: false,
        areaOfInteraction: 0,
        priority: 1,
        onInteract: () => {
            globalNavigate("/PreQuizz?type=transport");
        },
    },
};
