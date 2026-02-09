#Run this file to update the manifest

from pathlib import Path

PUBLIC_CHARA_DIR = Path("public/chara")
OUTPUT_FILE = Path("customisationManifest.ts")

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def is_image(file: Path) -> bool:
    return file.suffix.lower() in IMAGE_EXTENSIONS


def generate_manifest():
    manifest = {}

    for category_dir in sorted(PUBLIC_CHARA_DIR.iterdir()):
        if not category_dir.is_dir():
            continue

        icon = category_dir / "icon.png"
        if not icon.exists():
            print(f"⚠️ Skipping '{category_dir.name}' (missing icon.png)")
            continue

        items = [None]

        for file in sorted(category_dir.iterdir()):
            if file.name == "icon.png":
                continue
            if is_image(file):
                items.append(f"/chara/{category_dir.name}/{file.name}")

        manifest[category_dir.name] = {
            "icon": f"/chara/{category_dir.name}/icon.png",
            "items": items,
        }

    write_ts_file(manifest)


def write_ts_file(manifest: dict):
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        f.write("export const customisationManifest = {\n")

        for category, data in manifest.items():
            f.write(f"  {category}: {{\n")
            f.write(f"    icon: \"{data['icon']}\",\n")
            f.write("    items: [\n")

            for item in data["items"]:
                if item is None:
                    f.write("      null,\n")
                else:
                    f.write(f"      \"{item}\",\n")

            f.write("    ],\n")
            f.write("  },\n")

        f.write("} as const;\n")

    print(f"✅ Manifest generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_manifest()
