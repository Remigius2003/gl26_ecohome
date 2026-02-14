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
    // Filter images for this category
    const prefix = `/public/chara/${categoryName}/`;
    const categoryFiles = Object.keys(images).filter((p) =>
        p.startsWith(prefix),
    );

    // Map subfolders
    const folders: Record<string, string[]> = {};
    const standaloneImages: string[] = [];

    for (const filePath of categoryFiles) {
        const relativePath = filePath.replace(prefix, ""); // e.g., skinA/frame1.png or frame.png
        const parts = relativePath.split("/");

        if (parts.length === 1) {
            // Top-level image => standalone skin
            if (isImage(parts[0]) && parts[0] !== "icon.png") {
                standaloneImages.push(filePath);
            }
        } else if (parts.length >= 2) {
            // Subfolder => collect frames
            const folderName = parts[0];
            if (!folders[folderName]) folders[folderName] = [];
            folders[folderName].push(filePath);
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

// Main function
export function parseTypes(): Types[] {
    // Import all images eagerly
    const images = import.meta.glob("/public/chara/**/*.{png,jpg,jpeg,webp}", {
        eager: true,
    });

    // Determine category folders
    const categoriesSet = new Set<string>();
    for (const filePath in images) {
        const parts = filePath.split("/").slice(-3); // ["chara", "category", ...]
        if (parts.length >= 2) {
            categoriesSet.add(parts[1]);
        }
    }

    const types: Types[] = [];

    for (const category of categoriesSet) {
        const skins = parseCategory(category, images);
        if (skins.length > 0) types.push(new Types(category, skins));
    }

    return types;
}
