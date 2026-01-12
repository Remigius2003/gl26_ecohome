import cv2
import numpy as np
from PIL import Image
import os

def split_image_elements(
    image_path,
    output_dir="elements",
    white_threshold=250,
    min_area=50
):
    os.makedirs(output_dir, exist_ok=True)

    # Charger image avec alpha si présent
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError("Impossible de charger l'image")

    # Détection PNG avec alpha
    has_alpha = img.shape[2] == 4

    if has_alpha:
        # Utiliser directement le canal alpha comme masque
        mask = img[:, :, 3]
    else:
        # Image sans alpha → créer un masque depuis le blanc
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(
            gray,
            white_threshold,
            255,
            cv2.THRESH_BINARY_INV
        )

    # Nettoyage très léger (évite de coller des pixels)
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # Détection des composants
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        mask, connectivity=8
    )

    count = 0

    for i in range(1, num_labels):  # 0 = fond
        x, y, w, h, area = stats[i]

        if area < min_area:
            continue

        # Masque local de l’élément
        local_mask = (labels[y:y+h, x:x+w] == i).astype(np.uint8) * 255

        # Découpe brute (AUCUNE modification couleur)
        element = img[y:y+h, x:x+w].copy()

        # S'assurer que la sortie est en RGBA
        if element.shape[2] == 3:
            element = cv2.cvtColor(element, cv2.COLOR_BGR2BGRA)

        # Appliquer le masque comme alpha
        element[:, :, 3] = local_mask

        # Sauvegarde
        output_path = os.path.join(output_dir, f"element_{count}.png")
        Image.fromarray(element).save(output_path)

        count += 1

    print(f"{count} éléments extraits.")

# Exemple
split_image_elements("upholstery.png")
