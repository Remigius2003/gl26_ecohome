import { globalNavigate } from "../../App";
import { buildThingDefs } from "../furniture";
import type { AsciiThingDef } from "../furniture/types";

const resolveInteraction = (interaction?: string) => {
    if (!interaction) return undefined;
    if (interaction.startsWith("nav:")) {
        const path = interaction.slice("nav:".length);
        return () => globalNavigate(path);
    }
    if (interaction.startsWith("log:")) {
        const msg = interaction.slice("log:".length);
        return () => console.log(msg);
    }
    return undefined;
};

export const THING_DEFS: Record<string, AsciiThingDef> = {
    // Bedroom furniture
    B: {
        width: 3,
        height: 3,
        texture: "house/furniture/bed.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            console.log("Interacting with bed");
        },
    },
    T: {
        width: 2,
        height: 2,
        texture: "house/furniture/trilogique.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            globalNavigate("/lobby/trilogique");
        },
    },
    M: {
        width: 1,
        height: 1,
        texture: "house/furniture/mirror.png",
        solid: true,
        areaOfInteraction: 0,
        priority: 2,
        onInteract: () => {
            console.log("Looking in mirror");
        },
    },
    D: {
        width: 1,
        height: 1,
        texture: "house/furniture/dresser.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            console.log("Interacting with dresser");
        },
    },
    W: {
        width: 2,
        height: 2,
        texture: "house/furniture/wardrobe.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            console.log("Interacting with wardrobe");
        },
    },
    G: {
        width: 1,
        height: 2,
        texture: "house/furniture/shelves.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            console.log("Looking at shelves");
        },
    },
    L: {
        width: 2,
        height: 2,
        texture: "house/furniture/lamp.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            console.log("Interacting with lamp");
        },
    },
    // Stairs to go down
    E: {
        width: 8,
        height: 2,
        texture: "house/furniture/esc.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 1,
        onInteract: () => {
            globalNavigate("/home");
        },
    },
    // Study desk/computer
    X: {
        width: 2,
        height: 2,
        texture: "house/furniture/desk.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            console.log("Interacting with desk");
        },
    },
};
