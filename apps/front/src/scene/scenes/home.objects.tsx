import { globalNavigate } from "../../App";

export type AsciiObjectDef = {
    width: number;
    height: number;
    texture: string;
    solid?: boolean;
};

export type AsciiInteractionDef = {
    width: number;
    height: number;
    onInteract: () => void;
    texture?: string;
    priority: number;
};

export const OBJECT_DEFS: Record<string, AsciiObjectDef> = {
    T: {
        width: 3,
        height: 3,
        texture: "house/furniture/table.png",
        solid: true,
    },
    S: {
        width: 2,
        height: 2,
        texture: "house/furniture/tableSimple.png",
        solid: true,
    },

    V: {
        width: 2,
        height: 2,
        texture: "house/furniture/tv.png",
        solid: true,
    },
    E: {
        width: 8,
        height: 2,
        texture: "house/furniture/esc.png",
        solid: false,
    },
    C: {
        width: 1,
        height: 1,
        texture: "house/furniture/chairFace.png",
        solid: true,
    },
    L: {
        width: 1,
        height: 1,
        texture: "house/furniture/chairtoleft.png",
        solid: true,
    },
    F: {
        width: 1,
        height: 2,
        texture: "house/furniture/frigo.png",
        solid: true,
    },
};

export const INTERACTION_DEFS: Record<string, AsciiInteractionDef> = {
    E: {
        width: 8,
        height: 2,
        texture: "Pay respect to my greatness as I stand above ALL",
        priority: -1,
        onInteract: () => {
            console.log("Go upstairs");
        },
    },
    R: {
        width: 2,
        height: 2,
        texture: "house/furniture/tapi.png",
        priority: 1,
        onInteract: () => {
            globalNavigate("/PreQuizz?type=transport");
        },
    },
    1: {
        width: 1,
        height: 1,
        texture: "Pay respect to my greatness as I stand above ALL",
        priority: -2,
        onInteract: () => {
            globalNavigate("/Defi");
        },
    },
    2: {
        width: 1,
        height: 1,
        texture: "Pay respect to my greatness as I stand above ALL",
        priority: -2,
        onInteract: () => {
            globalNavigate("/PreQuizz?type=alimentation");
        },
    },
    3: {
        width: 1,
        height: 1,
        texture: "Pay respect to my greatness as I stand above ALL",
        priority: -2,
        onInteract: () => {
            globalNavigate("/social");
        },
    },

    4: {
        width: 1,
        height: 1,
        texture: "Pay respect to my greatness as I stand above ALL",
        priority: -2,
        onInteract: () => {
            globalNavigate("/PreQuizz?type=consommation");
        },
    },
};
