import os
import json
from PIL import Image

# Config
IMG_PATH = "image.png"
OUTPUT_DIR = "tetris_pieces"
os.makedirs(OUTPUT_DIR, exist_ok=True)

img = Image.open(IMG_PATH).convert("RGBA")
W, _ = img.size
CELL_SIZE = W // 12  # 12x12 grid

# 12x12 Tiling Map for 36 pieces (0-35)
# Designed to include I, O, T, L, S, Z shapes
TILING_MAP = [
    [0, 0, 0, 0, 1, 2, 2, 2, 3, 3, 4, 4],
    [5, 5, 5, 5, 1, 1, 2, 6, 3, 3, 4, 4],
    [7, 8, 8, 8, 1, 9, 6, 6, 6, 10, 11, 11],
    [7, 7, 7, 8, 9, 9, 9, 12, 12, 10, 10, 11],
    [13, 13, 14, 14, 15, 15, 16, 16, 12, 12, 10, 11],
    [13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 17, 17],
    [18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 23, 23],
    [18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 22, 23],
    [24, 24, 24, 24, 25, 26, 26, 26, 27, 27, 28, 28],
    [29, 30, 30, 30, 25, 25, 26, 31, 27, 27, 28, 28],
    [29, 29, 29, 30, 25, 31, 31, 31, 32, 32, 33, 33],
    [34, 34, 34, 34, 35, 35, 35, 35, 32, 32, 33, 33]
]

manifest = []

for piece_id in range(36):
    mask = Image.new("L", (W, W), 0)
    for r in range(12):
        for c in range(12):
            if TILING_MAP[r][c] == piece_id:
                l, t = c * CELL_SIZE, r * CELL_SIZE
                mask.paste(255, (l, t, l + CELL_SIZE, t + CELL_SIZE))

    piece_img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    piece_img.paste(img, (0, 0), mask)
    bbox = piece_img.getbbox()


    if bbox:
        trimmed = piece_img.crop(bbox)
        fname = f"piece_{piece_id}.png"
        trimmed.save(os.path.join(OUTPUT_DIR, fname))

        manifest.append({
            "id": piece_id,
            "url": fname,
            "gridX": bbox[0] // CELL_SIZE,
            "gridY": bbox[1] // CELL_SIZE,
            "wCells": (bbox[2] - bbox[0]) // CELL_SIZE,
            "hCells": (bbox[3] - bbox[1]) // CELL_SIZE
        })

with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=4)