import { Types, Skin, parseTypes } from "./SkinParser"; // import your parsing helpers

export class Skins {
    types: Types[] = [];
    equipped: Record<string, Skin> = {};
    constructor() {}

    async init() {
        this.types = await parseTypes();

        const stored = localStorage.getItem("equippedSkins");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                for (const typeName in parsed) {
                    const type = this.types.find((t) => t.name === typeName);
                    if (!type) continue;

                    const skinIndex = parsed[typeName] as number;
                    if (type.skins[skinIndex]) {
                        this.equipped[typeName] = type.skins[skinIndex];
                    }
                }
            } catch (e) {
                console.warn("Failed to parse equippedSkins", e);
            }
        }

        for (const type of this.types) {
            if (!this.equipped[type.name]) {
                const randomSkin =
                    type.skins[Math.floor(Math.random() * type.skins.length)];
                this.equipped[type.name] = randomSkin;
            }
        }

        this.save();
    }

    getSkin(typeName: string): Skin | null {
        return this.equipped[typeName] ?? null;
    }

    getSkins(): Skin[] {
        return Object.values(this.equipped);
    }

    changeSkin(typeName: string, skin: Skin) {
        this.equipped[typeName] = skin;
        this.save();
    }

    private save() {
        // Save as indexes instead of objects to simplify storage
        const toStore: Record<string, number> = {};
        for (const type of this.types) {
            const skin = this.equipped[type.name];
            if (skin) {
                toStore[type.name] = type.skins.indexOf(skin);
            }
        }
        localStorage.setItem("equippedSkins", JSON.stringify(toStore));
    }
}
