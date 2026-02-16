export interface ImageLogic {
    type: "static" | "scene";
}

export interface StaticImage extends ImageLogic {
    type: "static";
    link: string;
}

export interface SceneImage extends ImageLogic {
    type: "scene";
    sceneId: string;
}

export type AnyImage = StaticImage | SceneImage;

export interface GamePage {
    name: string;
    id: string;
    image: AnyImage;
    description: string;
}

export interface AllGame {
    games: GamePage[];
}

/**
 * Type guards
 */
export function isStaticImage(i: any): i is StaticImage {
    return i && i.type === "static" && typeof i.link === "string";
}
export function isSceneImage(i: any): i is SceneImage {
    return i && i.type === "scene" && typeof i.sceneId === "string";
}

// take a json and load it
export async function loadGames(path: string): Promise<AllGame> {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to load games: ${response.statusText}`);
    }

    const data: AllGame = await response.json();

    if (!data.games || !Array.isArray(data.games)) {
        throw new Error("Invalid JSON structure");
    }

    return data;
}

/**
 * Try a few sensible locations for a given Id.
 * Adjust the attempted paths to match your server layout.
 */
export async function loadGamesById(Id: string): Promise<AllGame> {
    const tryPaths = [
        `/test/instance/friend1.json`,
        `/games/${encodeURIComponent(Id)}/index.json`,
        `/games.json`,
    ];

    let lastError: any = null;
    for (const p of tryPaths) {
        try {
            return await loadGames(p);
        } catch (err) {
            lastError = err;
        }
    }

    throw new Error(
        `Could not load games for id "${Id}". Last error: ${lastError?.message ?? lastError}`,
    );
}
