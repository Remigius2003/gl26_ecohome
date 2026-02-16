// SkinParser.ts
export class Frame {
    constructor(
        public readonly image: string,
        public readonly offsetX: number = 0,
        public readonly offsetY: number = 0,
        public readonly ratio: number = 1,
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

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function isImage(file: string) {
    const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

// Analyse a single image
function analyseImage(imagePath: string): Skin {
    const frame = new Frame(imagePath);
    return new Skin([frame], frame);
}

// Analyse a folder with multiple images
function analyseFolder(files: string[]): Skin {
    const frames = files
        .filter((f) => isImage(f) && !f.endsWith("icon.png"))
        .map((f) => new Frame(f));

    if (frames.length === 0) {
        throw new Error(`No valid images in folder`);
    }

    const iconPath =
        files.find((f) => f.endsWith("icon.png")) ?? frames[0].image;
    const icon = new Frame(iconPath);

    return new Skin(frames, icon);
}

// Parse a category folder
function parseCategory(
    categoryName: string,
    images: Record<string, string>,
): Skin[] {
    // 1. Updated prefix to match the src path
    const prefix = `/src/assets/chara/${categoryName}/`;
    const categoryFiles = Object.keys(images).filter((p) =>
        p.startsWith(prefix),
    );

    const folders: Record<string, string[]> = {};
    const standaloneImages: string[] = [];

    for (const filePath of categoryFiles) {
        // Use the resolved URL (the value), not the file path (the key)
        const assetUrl = images[filePath];
        const relativePath = filePath.replace(prefix, "");
        const parts = relativePath.split("/");

        if (parts.length === 1) {
            if (isImage(parts[0]) && parts[0] !== "icon.png") {
                standaloneImages.push(assetUrl); // Store the URL
            }
        } else if (parts.length >= 2) {
            const folderName = parts[0];
            if (!folders[folderName]) folders[folderName] = [];
            folders[folderName].push(assetUrl); // Store the URL
        }
    }

    const skins: Skin[] = [];

    // Create skins from subfolders
    for (const folder in folders) {
        skins.push(analyseFolder(folders[folder]));
    }

    // Create skins from standalone images
    for (const img of standaloneImages) {
        skins.push(analyseImage(img));
    }

    return skins;
}
export function parseTypes(): Types[] {
    const images = import.meta.glob(
        "/src/assets/chara/**/*.{png,jpg,jpeg,webp}",
        {
            eager: true,
            import: "default",
        },
    ) as Record<string, string>;

    const categoriesSet = new Set<string>();
    for (const filePath in images) {
        // Updated slice to handle /src/assets/chara/category/file.png
        // Split results: ["", "src", "assets", "chara", "category", "file.png"]
        const parts = filePath.split("/");
        const charaIndex = parts.indexOf("chara");
        if (charaIndex !== -1 && parts[charaIndex + 1]) {
            categoriesSet.add(parts[charaIndex + 1]);
        }
    }

    const types: Types[] = [];
    for (const category of categoriesSet) {
        const skins = parseCategory(category, images);
        if (skins.length > 0) types.push(new Types(category, skins));
    }

    return types;
}
