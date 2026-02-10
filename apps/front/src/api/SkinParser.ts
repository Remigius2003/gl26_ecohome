export class Frame {
    constructor(
        public readonly image: string,
        public readonly offsetX: number = 0,
        public readonly offsetY: number = 0,
        public readonly ratio: number = 15,
    ) {}
}

export class Skin {
    constructor(
        public readonly frames: Frame[],
        public readonly icon: Frame,
    ) {}
}

export class Types {
    constructor(
        public readonly name: string,
        public readonly skins: Skin[],
    ) {}
}

// Analyse a single image
function analyseImage(imagePath: string): Skin {
    const frame = new Frame(imagePath);
    return new Skin([frame], frame);
}

type FileAsset = string | SkinConfig;

interface FrameConfig {
    image?: string;
    offsetX?: number;
    offsetY?: number;
    ratio?: number;
}

interface SkinConfig {
    Frame: number;
    AllFrame?: FrameConfig;
    [key: string]: any;
}

function isImage(file: any): file is string {
    if (typeof file !== "string") return false;
    const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp"].some((e) => ext.includes(e));
}

export function analyseFolder(files: FileAsset[]): Skin {
    // 1. Find the Config Object (Vite imports JSON as objects automatically)
    const config = files.find((f) => typeof f === "object" && f !== null) as
        | SkinConfig
        | undefined;

    // Filter out only the image strings
    const imageFiles = files.filter(isImage);

    let frames: Frame[] = [];

    if (config) {
        console.log("JSON Config found:", config);

        try {
            // No need to fetch! 'config' is already the parsed JSON object.
            const totalFrames = config.Frame;
            const globalDefaults = config.AllFrame || {};

            for (let i = 1; i <= totalFrames; i++) {
                const key = i.toString();
                const specificParams = config[key] || {};

                // Merge Logic
                const imageName = specificParams.image ?? globalDefaults.image;

                // We need to find the full URL/Path in our files list that matches this image name
                const fullImagePath = imageFiles.find((f) =>
                    f.includes(imageName),
                );

                const offsetX =
                    specificParams.offsetX ?? globalDefaults.offsetX ?? 0;
                const offsetY =
                    specificParams.offsetY ?? globalDefaults.offsetY ?? 0;
                const ratio =
                    specificParams.ratio ?? globalDefaults.ratio ?? 15;

                if (!fullImagePath) {
                    // Fallback: If image is defined but file not found, we can't create the frame
                    throw new Error(
                        `Image file '${imageName}' defined in JSON not found in folder assets.`,
                    );
                }

                frames.push(new Frame(fullImagePath, offsetX, offsetY, ratio));
            }
        } catch (e) {
            console.error("Error processing Skin Config:", e);
            throw e;
        }
    } else {
        // --- AUTO MODE ---
        frames = imageFiles
            .filter((f) => !f.includes("icon.png"))
            .map((f) => new Frame(f));

        if (frames.length === 0) {
            throw new Error(`No valid images in folder`);
        }
    }

    // 2. Handle the Icon
    const iconFile = imageFiles.find((f) => f.includes("icon.png"));
    const iconPath = iconFile ?? (frames.length > 0 ? frames[0].image : null);

    if (!iconPath) {
        throw new Error("Could not determine an icon for this skin.");
    }

    return new Skin(frames, new Frame(iconPath));
}

async function parseCategory(
    categoryName: string,
    images: Record<string, FileAsset>,
): Promise<Skin[]> {
    const prefix = `/src/assets/chara/${categoryName}/`;

    const categoryKeys = Object.keys(images).filter((p) =>
        p.startsWith(prefix),
    );

    const folders: Record<string, FileAsset[]> = {};
    const standaloneImages: string[] = [];

    for (const filePath of categoryKeys) {
        const asset = images[filePath]; // Can be URL string OR Config Object
        const relativePath = filePath.replace(prefix, "");
        const parts = relativePath.split("/");

        if (parts.length === 1) {
            if (typeof asset === "string" && parts[0] !== "icon.png") {
                standaloneImages.push(asset);
            }
        } else if (parts.length >= 2) {
            const folderName = parts[0];
            if (!folders[folderName]) folders[folderName] = [];
            folders[folderName].push(asset);
        }
    }

    const skins: Skin[] = [];

    for (const folder in folders) {
        // analyseFolder is no longer async because JSON is already loaded
        try {
            skins.push(analyseFolder(folders[folder]));
        } catch (e) {
            console.warn(`Skipping folder ${folder}:`, e);
        }
    }

    for (const img of standaloneImages) {
        skins.push(analyseImage(img));
    }

    return skins;
}

export async function parseTypes(): Promise<Types[]> {
    // 1. Update Glob to include .json
    const images = import.meta.glob(
        "/src/assets/chara/**/*.{png,jpg,jpeg,webp,json}",
        {
            eager: true,
            import: "default",
        },
    ) as Record<string, FileAsset>; // Cast to FileAsset

    const categoriesSet = new Set<string>();
    for (const filePath in images) {
        const parts = filePath.split("/");
        const charaIndex = parts.indexOf("chara");
        if (charaIndex !== -1 && parts[charaIndex + 1]) {
            categoriesSet.add(parts[charaIndex + 1]);
        }
    }

    const types: Types[] = [];
    for (const category of categoriesSet) {
        const skins = await parseCategory(category, images);
        if (skins.length > 0) types.push(new Types(category, skins));
    }

    return types;
}
