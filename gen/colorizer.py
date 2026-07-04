from pathlib import Path
from PIL import Image

INPUT_DIR = Path("colorizer/letter")
OUTPUT_DIR = Path("colorizer/letter_output")

COLOR_LIST = [
    {"id": 0, "display": "Black", "color": (0, 0, 0)},
    {"id": 1, "display": "Dark Blue", "color": (0, 0, 170)},
    {"id": 2, "display": "Dark Green", "color": (0, 170, 0)},
    {"id": 3, "display": "Dark Aqua", "color": (0, 170, 170)},
    {"id": 4, "display": "Dark Red", "color": (170, 0, 0)},
    {"id": 5, "display": "Dark Purple", "color": (170, 0, 170)},
    {"id": 6, "display": "Gold", "color": (255, 170, 0)},
    {"id": 7, "display": "Gray", "color": (170, 170, 170)},
    {"id": 8, "display": "Dark Gray", "color": (85, 85, 85)},
    {"id": 9, "display": "Blue", "color": (85, 85, 255)},
    {"id": 10, "display": "Green", "color": (85, 255, 85)},
    {"id": 11, "display": "Aqua", "color": (85, 255, 255)},
    {"id": 12, "display": "Red", "color": (255, 85, 85)},
    {"id": 13, "display": "Light Purple", "color": (255, 85, 255)},
    {"id": 14, "display": "Yellow", "color": (255, 255, 85)},
    {"id": 15, "display": "White", "color": (255, 255, 255)},
]


def recolor(image: Image.Image, target_color):
    image = image.convert("RGBA")
    pixels = image.load()

    tr, tg, tb = target_color

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]

            if a == 0:
                continue

            # Brightness 0..1
            brightness = (r + g + b) / (255 * 3)

            pixels[x, y] = (
                int(tr * brightness),
                int(tg * brightness),
                int(tb * brightness),
                a,
            )

    return image


for png in INPUT_DIR.glob("*.png"):
    image = Image.open(png)

    texture_output = OUTPUT_DIR / png.stem
    texture_output.mkdir(parents=True, exist_ok=True)

    for color in COLOR_LIST:
        recolored = recolor(image.copy(), color["color"])
        recolored.save(texture_output / f"{color['id']}.png")

print("Finished!")