from pathlib import Path
from PIL import Image

INPUT_FILE = "glypher/input.png"
OUTPUT_DIR = Path("glypher/output")

TILE_SIZE = 8

OUTPUT_DIR.mkdir(exist_ok=True)

names = ["@"] + [chr(ord("A") + i) for i in range(26)]

image = Image.open(INPUT_FILE).convert("RGBA")

cols = image.width // TILE_SIZE
rows = image.height // TILE_SIZE

index = 0

for row in range(rows):
    for col in range(cols):
        x = col * TILE_SIZE
        y = row * TILE_SIZE

        tile = image.crop((x, y, x + TILE_SIZE, y + TILE_SIZE))

        if index < len(names):
            filename = names[index]
        else:
            filename = str(index)

        tile.save(OUTPUT_DIR / f"{filename}.png")
        index += 1

print(f"Exported {index} tiles.")