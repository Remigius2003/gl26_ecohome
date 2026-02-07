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

    E: {
        width: 8,
        height: 2,
        texture: "house/furniture/esc.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 1,
        onInteract: () => {
            console.log("🪜 STAIRS INTERACTION TRIGGERED!");
            console.log("📍 Calling alert...");
            alert("2eme etage");
            console.log("📍 Alert dismissed, calling globalSwitchScene...");
            globalNavigate("/home2");
            console.log("📍 globalNavigate(/home2) called!");
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
