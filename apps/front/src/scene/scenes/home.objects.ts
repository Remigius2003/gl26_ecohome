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
};

export const OBJECT_DEFS: Record<string, AsciiObjectDef> = {
    T: {
        width: 3,
        height: 3,
        texture: "house/furniture/table.png",
        solid: true,
    },
    E: {
        width: 1,
        height: 1,
        texture: "house/furniture/esc.png",
        solid: false,
    },
};

export const INTERACTION_DEFS: Record<string, AsciiInteractionDef> = {
    E: {
        width: 1,
        height: 2,
        texture: "house/furniture/esc.png",
        onInteract: () => {
            console.log("Go upstairs");
        },
    },
};
