import {
    setShowPlayerCustomisation,
    setShowHomeCustomisation,
    setShowFriends,
    openQuizz,
    setShowMusic,
} from "../../store/gameStore";

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
        onInteract: () => setShowMusic(true),
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
        onInteract: () => openQuizz("alimentation"),
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
        onInteract: () => setShowFriends(true),
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

    S: {
        width: 2,
        height: 1,
        texture: "house/furniture/Sofa/SofaBack.png",
        solid: true,
    },
    V: {
        width: 1,
        height: 1,
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

    B: { width: 4, height: 4, texture: "house/furniture/lit.png", solid: true },
    D: {
        width: 2,
        height: 2,
        texture: "house/furniture/armoire.png",
        solid: true,
        areaOfInteraction: 1,
        onInteract: () => setShowPlayerCustomisation(true),
    },
    J: {
        width: 3,
        height: 2,
        texture: "house/furniture/chemine.png",
        solid: true,
        areaOfInteraction: 1,
        onInteract: () => openQuizz("logement"),
    },
    b: {
        width: 3,
        height: 2,
        texture: "house/furniture/ordi_pour_defi_social_freind.png",
        solid: true,
    },

    U: {
        width: 2,
        height: 3,
        texture: "house/furniture/bath.png",
        solid: true,
    },

    E: {
        width: 8,
        height: 2,
        texture: "house/furniture/esc.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 1,
        onInteract: () => {
            import("@scene").then((s) => s.switchScene("home2"));
        },
    },
    R: {
        width: 2,
        height: 2,
        texture: "house/furniture/tapi.png",
        solid: false,
        areaOfInteraction: 0,
        priority: 1,
        onInteract: () => openQuizz("transport"),
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
        areaOfInteraction: 1,
        priority: 2,
        onInteract: () => {
            window.location.href = "/lobby/lightshadow";
        },
        solid: true,
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

    I: {
        width: 1,
        height: 1,
        texture: "house/furniture/painting.png",
        solid: true,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => setShowHomeCustomisation(true),
    },

    A: {
        width: 2,
        height: 2,
        texture: "house/furniture/chair_conf.png",
        solid: false,
        areaOfInteraction: 1,
        priority: 0,
        onInteract: () => openQuizz("consommation"),
    },
};
