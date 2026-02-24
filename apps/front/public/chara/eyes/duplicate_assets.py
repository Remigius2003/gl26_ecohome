#!/usr/bin/env python3
"""
Asset Duplicator - Create multiple colored variants of JSON + PNG assets
Duplicates a folder containing a JSON and PNG, recoloring the rectangle in each copy.
"""

import os
import shutil
import json
from pathlib import Path
from PIL import Image
import argparse

# Color palette - customize these colors as needed
COLORS = [
    (255, 0, 0),      # Red
    (0, 255, 0),      # Green
    (0, 0, 255),      # Blue
    (255, 255, 0),    # Yellow
    (255, 0, 255),    # Magenta
    (0, 255, 255),    # Cyan
    (255, 128, 0),    # Orange
    (128, 0, 255),    # Purple
    (255, 192, 203),  # Pink
    (128, 128, 0),    # Olive
    (0, 128, 128),    # Teal
    (255, 165, 0),    # Dark Orange
]

COLOR_NAMES = [
    "red",
    "green", 
    "blue",
    "yellow",
    "magenta",
    "cyan",
    "orange",
    "purple",
    "pink",
    "olive",
    "teal",
    "dark_orange",
]


def find_json_and_png(folder_path):
    """Find JSON and PNG files in the given folder."""
    json_file = None
    png_file = None
    
    for file in os.listdir(folder_path):
        if file.lower().endswith('.json'):
            json_file = os.path.join(folder_path, file)
        elif file.lower().endswith('.png'):
            png_file = os.path.join(folder_path, file)
    
    return json_file, png_file


def recolor_image(image_path, old_color, new_color, tolerance=10):
    """
    Replace old_color with new_color in the image.
    
    Args:
        image_path: Path to PNG image
        old_color: Tuple (R, G, B) of color to replace
        new_color: Tuple (R, G, B) of new color
        tolerance: How close colors need to be to match (0-255)
    
    Returns:
        Modified PIL Image object
    """
    img = Image.open(image_path)
    
    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get image data
    pixels = img.load()
    width, height = img.size
    
    # Replace colors
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y][:4]
            
            # Check if pixel is close to old_color
            if (abs(r - old_color[0]) <= tolerance and
                abs(g - old_color[1]) <= tolerance and
                abs(b - old_color[2]) <= tolerance):
                # Replace with new color, keeping alpha
                pixels[x, y] = (new_color[0], new_color[1], new_color[2], a)
    
    return img


def copy_json_file(json_path, output_path, variant_name):
    """Copy JSON file to output location, optionally modifying it."""
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # You can modify JSON here if needed
    # Example: data['variant'] = variant_name
    # For now, we just copy it
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)


def duplicate_assets(source_folder, output_base_folder, num_duplicates=12, 
                    old_color=(255, 0, 0), tolerance=10, 
                    use_color_names=True):
    """
    Duplicate assets with different colors.
    
    Args:
        source_folder: Path to folder containing JSON and PNG
        output_base_folder: Path where to create output folders
        num_duplicates: How many copies to create (default: 12)
        old_color: RGB tuple of color to replace (default: red)
        tolerance: Color matching tolerance (0-255)
        use_color_names: Use color names for folders if True
    """
    
    # Find source files
    json_file, png_file = find_json_and_png(source_folder)
    
    if not json_file or not png_file:
        print("❌ Error: Could not find JSON and PNG files in source folder")
        return False
    
    print(f"✓ Found JSON: {os.path.basename(json_file)}")
    print(f"✓ Found PNG: {os.path.basename(png_file)}")
    
    # Create output base folder if it doesn't exist
    os.makedirs(output_base_folder, exist_ok=True)
    
    # Get original JSON filename without extension
    json_basename = os.path.splitext(os.path.basename(json_file))[0]
    png_basename = os.path.splitext(os.path.basename(png_file))[0]
    
    # Limit to available colors if using color names
    num_to_create = min(num_duplicates, len(COLORS))
    
    print(f"\n🎨 Creating {num_to_create} colored variants...")
    
    for i in range(num_to_create):
        # Determine variant name
        if use_color_names and i < len(COLOR_NAMES):
            variant_name = COLOR_NAMES[i]
            color = COLORS[i]
        else:
            variant_name = f"variant_{i+1:02d}"
            # Cycle through colors if we need more than available
            color = COLORS[i % len(COLORS)]
        
        # Create output folder
        output_folder = os.path.join(output_base_folder, variant_name)
        os.makedirs(output_folder, exist_ok=True)
        
        # Output file paths
        output_json = os.path.join(output_folder, f"{json_basename}_{variant_name}.json")
        output_png = os.path.join(output_folder, f"{png_basename}_{variant_name}.png")
        
        # Copy and modify JSON
        copy_json_file(json_file, output_json, variant_name)
        
        # Recolor and save PNG
        recolored_img = recolor_image(png_file, old_color, color, tolerance)
        recolored_img.save(output_png)
        
        print(f"  ✓ {i+1:2d}. {variant_name:15s} → {os.path.relpath(output_folder, output_base_folder)}/")
    
    print(f"\n✅ Successfully created {num_to_create} asset variants!")
    print(f"📁 Output location: {os.path.abspath(output_base_folder)}")
    
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Duplicate JSON + PNG assets with different rectangle colors",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage - creates 12 variants in 'output' folder
  python duplicate_assets.py /path/to/source
  
  # Create 8 variants in custom output folder
  python duplicate_assets.py /path/to/source -o my_assets -n 8
  
  # Specify old color to replace (RGB values)
  python duplicate_assets.py /path/to/source -o assets -r 255 0 0
  
  # Adjust color matching tolerance (higher = more permissive)
  python duplicate_assets.py /path/to/source -t 20
        """
    )
    
    parser.add_argument(
        'source',
        help='Path to source folder containing JSON and PNG files'
    )
    
    parser.add_argument(
        '-o', '--output',
        default='output_assets',
        help='Output base folder (default: output_assets)'
    )
    
    parser.add_argument(
        '-n', '--number',
        type=int,
        default=12,
        help='Number of variants to create (default: 12, max: 12 with color names)'
    )
    
    parser.add_argument(
        '-r', '--old-color',
        nargs=3,
        type=int,
        metavar=('R', 'G', 'B'),
        default=[255, 0, 0],
        help='Old color to replace in RGB format (default: 255 0 0 for red)'
    )
    
    parser.add_argument(
        '-t', '--tolerance',
        type=int,
        default=10,
        help='Color matching tolerance 0-255 (default: 10, higher = more permissive)'
    )
    
    parser.add_argument(
        '--no-color-names',
        action='store_true',
        help='Use numeric names instead of color names for folders'
    )
    
    args = parser.parse_args()
    
    # Validate source folder
    if not os.path.isdir(args.source):
        print(f"❌ Error: Source folder not found: {args.source}")
        return 1
    
    # Validate tolerance
    if args.tolerance < 0 or args.tolerance > 255:
        print("❌ Error: Tolerance must be between 0 and 255")
        return 1
    
    # Convert old color list to tuple
    old_color = tuple(args.old_color)
    
    # Run duplication
    success = duplicate_assets(
        source_folder=args.source,
        output_base_folder=args.output,
        num_duplicates=args.number,
        old_color=old_color,
        tolerance=args.tolerance,
        use_color_names=not args.no_color_names
    )
    
    return 0 if success else 1


if __name__ == '__main__':
    exit(main())
