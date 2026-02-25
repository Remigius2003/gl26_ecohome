import { globalNavigate, globalShowMusic } from "../../App";

/* list of disponnible objects:
[
  "armoire.png",
  "bath.png",
  "bed2.png",
  "bedFace.png",
  "BlueFlower.png",
  "chair1\\back.png",
  "chair1\\face.png",
  "chair1\\left.png",
  "chair1\\right.png",
  "chair2\\back.png",
  "chair2\\front.png",
  "chair2\\left.png",
  "chair2\\right.png",
  "chair_conf.png",
  "chairFace.png",
  "chairtoleft.png",
  "chaise_salon.png",
  "chemine.png",
  "curtain.png",
  "decorativePlant.png",
  "disjoncteur.png",
  "esc.png",
  "flower.png",
  "fontaine.png",
  "four.png",
  "frigo.png",
  "home_phone.png",
  "horloge\\horloge1.png",
  "horloge\\horloge2.png",
  "horloge\\horloge3.png",
  "horloge.png",
  "kitchen.png",
  "lampe.png",
  "lampe2_for_light&shadow.png",
  "lampe_for_light&shadow.png",
  "lit.png",
  "littleTree.png",
  "ordi_pour_defi_social_freind.png",
  "painting.png",
  "panneau_solaire_pour_minijeu.png",
  "PcOnTable.png",
  "poubelle.png",
  "roundTable.png",
  "Sofa\\SofaBack.png",
  "Sofa\\SofaFront.png",
  "sources\\dark-wood.png",
  "sources\\house_inside.png",
  "sources\\lpc-victorian-decoration\\lpc-victorian-decoration\\victorian-garden.png",
  "sources\\lpc-victorian-decoration\\lpc-victorian-decoration\\victorian-market.png",
  "sources\\lpc-victorian-decoration\\lpc-victorian-decoration\\victorian-streets.png",
  "sources\\lpc-walls\\lpc-walls\\walls.png",
  "tab_basse.png",
  "table.png",
  "tableSimple.png",
  "tapi.png",
  "thermostat.png",
  "thermostat_eco.png",
  "trilogique.png",
  "tv.png",
  "TvOnTable.png",
  "Window.png",
  "WoodTable.png"
]*/
export type AsciiThingDef = {
    width: number;
    height: number;
    texture?: string;
    solid?: boolean;
    areaOfInteraction?: number;
    priority?: number;
    onInteract?: () => void;
};

export const THING_DEFS: Record<string, AsciiThingDef> = {
    M: {
        width: 2,
        height: 2,
        texture: "house/furniture/piano1.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => globalShowMusic(true),
    },

    K: {
        width: 6,
        height: 2,
        texture: "house/furniture/kitchen.png",
        solid: true,
    },
    F: {
        width: 2,
        height: 2,
        texture: "house/furniture/frigo.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => globalNavigate("/PreQuizz?type=alimentation"),
    },
    O: {
        width: 2,
        height: 2,
        texture: "house/furniture/four.png",
        solid: true,
    },
    T: {
        width: 3,
        height: 3,
        texture: "house/furniture/WoodTable.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => globalNavigate("/social"),
    },
    C: {
        width: 1,
        height: 1,
        texture: "house/furniture/chair1/face.png",
        solid: true,
    },
    H: {
        width: 2,
        height: 2,
        texture: "house/furniture/horloge.png",
        solid: false,
    },

    // --- LIVING ROOM ---
    S: {
        width: 4,
        height: 2,
        texture: "house/furniture/Sofa/SofaFront.png",
        solid: true,
    },
    V: {
        width: 2,
        height: 2,
        texture: "house/furniture/TvOnTable.png",
        solid: true,
    },
    Y: {
        width: 2,
        height: 1,
        texture: "house/furniture/tab_basse.png",
        solid: true,
    },
    p: {
        width: 1,
        height: 2,
        texture: "house/furniture/decorativePlant.png",
        solid: true,
    },
    o: {
        width: 4,
        height: 3,
        texture: "house/furniture/panneau_solaire_pour_minijeu.png",
        solid: true,
    },

    // --- BEDROOM / OFFICE ---
    B: {
        width: 4,
        height: 4,
        texture: "house/furniture/lit.png",
        solid: true,
    },
    D: {
        width: 2,
        height: 2,
        texture: "house/furniture/armoire.png",
        solid: true,
        areaOfInteraction: 1,
        onInteract: () => globalNavigate("/customisation"),
    },
    J: {
        width: 3,
        height: 2,
        texture: "house/furniture/chemine.png",
        solid: true,
    },
    b: {
        width: 3,
        height: 2,
        texture: "house/furniture/ordi_pour_defi_social_freind.png",
        solid: true,
    },

    // --- BATHROOM ---
    U: {
        width: 2,
        height: 3,
        texture: "house/furniture/bath.png",
        solid: true,
    },

    // --- HALLWAY / UTILITY ---
    E: {
        width: 8,
        height: 2,
        texture: "house/furniture/esc.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 1,
        onInteract: () => globalNavigate("/home2"),
    },
    R: {
        width: 2,
        height: 2,
        texture: "house/furniture/tapi.png",
        solid: false,
        areaOfInteraction: 0,
        priority: 1,
        onInteract: () => globalNavigate("/PreQuizz?type=transport"),
    },
    t: {
        width: 2,
        height: 2,
        texture: "house/furniture/home_phone.png",
        solid: false,
    },
    d: {
        width: 1,
        height: 1,
        texture: "house/furniture/disjoncteur.png",
        solid: true,
        areaOfInteraction: 1,
        onInteract: () => {
            globalNavigate("/lobby/lightshadow");
        },
    },
    g: {
        width: 2,
        height: 2,
        texture: "house/furniture/thermostat_eco.png",
        solid: false,
    },
    l: {
        width: 1,
        height: 1,
        texture: "house/furniture/lampe.png",
        solid: true,
    },
};
