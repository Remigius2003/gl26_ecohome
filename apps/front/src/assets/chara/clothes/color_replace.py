import os
import shutil
from PIL import Image
from pathlib import Path


def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def replace_white_with_color(image_path, output_path, target_color_rgb):
    """Replace pure white pixels with target color while preserving transparency."""
    # Open the image
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get pixel data
    data = img.getdata()
    new_data = []
    
    # Process each pixel
    for pixel in data:
        r, g, b, a = pixel
        # Check if pixel is pure white (and not transparent)
        if r == 255 and g == 255 and b == 255 and a == 255:
            # Replace with target color, keep alpha
            new_data.append((*target_color_rgb, a))
        else:
            # Keep original pixel
            new_data.append(pixel)
    
    # Update image
    img.putdata(new_data)
    
    # Save as PNG
    img.save(output_path, 'PNG')


def duplicate_folder_with_colors(source_folder, colors):
    """
    Duplicate a folder with white replaced by different colors.
    
    Args:
        source_folder (str): Path to the source folder
        colors (list): List of colors as hex codes (e.g., ['#FF0000', '#00FF00'])
    """
    source_path = Path(source_folder)
    
    if not source_path.exists():
        print(f"Error: Source folder '{source_folder}' not found!")
        return
    
    parent_dir = source_path.parent
    folder_name = source_path.name
    
    print(f"Processing folder: {folder_name}")
    print(f"Colors: {colors}\n")
    
    # Process each color
    for i, color in enumerate(colors, 1):
        try:
            # Create new folder name
            new_folder_name = f"{folder_name}_color{i}"
            new_folder_path = parent_dir / new_folder_name
            
            # Create the new folder
            new_folder_path.mkdir(exist_ok=True)
            
            # Convert hex to RGB
            target_rgb = hex_to_rgb(color)
            
            print(f"Creating: {new_folder_name}")
            print(f"  Color: {color} (RGB: {target_rgb})")
            
            # Process files in source folder
            for file_path in source_path.iterdir():
                if file_path.is_file():
                    filename = file_path.name
                    
                    if filename.lower().endswith('.png'):
                        # Process PNG image
                        output_path = new_folder_path / filename
                        replace_white_with_color(str(file_path), str(output_path), target_rgb)
                        print(f"    ✓ {filename} (white → {color})")
                    
                    elif filename.lower().endswith('.json'):
                        # Copy JSON as-is
                        output_path = new_folder_path / filename
                        shutil.copy2(str(file_path), str(output_path))
                        print(f"    ✓ {filename} (copied)")
                    
                    else:
                        # Copy other files as-is
                        output_path = new_folder_path / filename
                        shutil.copy2(str(file_path), str(output_path))
                        print(f"    ✓ {filename} (copied)")
            
            print()
        
        except Exception as e:
            print(f"Error processing color {color}: {e}\n")


if __name__ == "__main__":
    # 12 predefined colors
    colors = [
        "#FF0000",  # Red
        "#00FF00",  # Green
        "#0000FF",  # Blue
        "#FFFF00",  # Yellow
        "#00FFFF",  # Cyan
        "#FF00FF",  # Magenta
        "#FFA500",  # Orange
        "#800080",  # Purple
        "#FFC0CB",  # Pink
        "#32CD32",  # Lime
        "#40E0D0",  # Turquoise
        "#FFD700",  # Gold
    ]
    
    # Get input from user
    source_folder = input("Enter the path to the source folder: ").strip()
    
    if source_folder:
        duplicate_folder_with_colors(source_folder, colors)
        print("Done! ✓")
    else:
        print("No folder path provided.")
