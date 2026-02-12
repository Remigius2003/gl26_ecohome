import { Character, Dynamic, Entity, Solid, Texture } from "../core/types";
import {
    ColorTexture,
    ImageTexture,
    SwapTexture,
    TransparentTexture,
} from "../core/texture";
import { withDynamic, withSolid } from "../logic/factory";
import { createEntity } from "../logic/factory";
import { Group } from "@scene/core/group";

export function createFloorTile(
    id: string,
    x: number,
    y: number,
    size: number,
) {
    return createEntity({
        id,
        x,
        y,
        width: size,
        height: size,
        priority: 0,
        text: new ImageTexture("/house/floor/wood.png"),
    });
}

export type EntNode = {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    speed?: number;
    text?: Texture;
    solid?: boolean;
    priority?: number;
    childrens?: Record<string, EntNode>;
};

export function createCharacter(id: string, opts: EntNode): Group & Dynamic {
    let grp = withDynamic(
        new Group(id, opts.x ?? 0, opts.y ?? 0, opts.priority ?? 2),
        { speed: opts.speed },
    );

    const isSolid = (solid: boolean, ent: Entity) =>
        (solid && withSolid(ent)) || ent;

    const InvText = new TransparentTexture();
    const parseNode = (node: EntNode) => {
        if (node.childrens && node.text) {
            console.error(
                "Invalid Node ! Can't have both Text & Childrens at same time",
                node,
            );
            return;
        }

        if (!node.childrens) return;
        for (const [key, child] of Object.entries(node.childrens))
            if (child.childrens) parseNode(child);
            else
                grp.add(
                    isSolid(
                        child.solid ?? false,
                        createEntity({
                            id: id + "_" + key,
                            x: child.x,
                            y: child.y,
                            width: child.w,
                            height: child.h,
                            priority: child.priority,
                            text: child.text ?? InvText,
                        }),
                    ),
                );
    };

    parseNode(opts);
    return grp;
}

export function createPlayer(x: number, y: number, size: number) {
    const playerGroup = createCharacter("player", {
        x,
        y,
        speed: 400,
        childrens: {
            hitbox: {
                x: size / 2,
                y: 0,
                w: size,
                h: 2 * size,
                solid: true,
                priority: 0,
            },
            body: {
                x: 0,
                y: 0,
                w: size * 2,
                h: size * 2,
                priority: 2,
                text: new SwapTexture("/chara/bodyStanding.png", [
                    "/chara/bodyW.png",
                    "/chara/bodyStanding.png",
                    "/chara/bodyW2.png",
                ]),
            },
        },
    });
    return playerGroup;
}
