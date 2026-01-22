import argparse
import json
from collections import deque

import numpy as np
from PIL import Image


def quantize_image(image, colors):
    if colors <= 0:
        return image.convert("RGB")
    palette = image.convert("P", palette=Image.ADAPTIVE, colors=colors)
    return palette.convert("RGB")


def find_components(rgb):
    height, width, _ = rgb.shape
    visited = np.zeros((height, width), dtype=bool)
    components = []
    neighbors = ((1, 0), (-1, 0), (0, 1), (0, -1))
    for y in range(height):
        for x in range(width):
            if visited[y, x]:
                continue
            color = rgb[y, x]
            queue = deque()
            queue.append((y, x))
            visited[y, x] = True
            min_x = x
            max_x = x
            min_y = y
            max_y = y
            count = 0
            while queue:
                cy, cx = queue.popleft()
                count += 1
                if cx < min_x:
                    min_x = cx
                if cx > max_x:
                    max_x = cx
                if cy < min_y:
                    min_y = cy
                if cy > max_y:
                    max_y = cy
                for dy, dx in neighbors:
                    ny = cy + dy
                    nx = cx + dx
                    if ny < 0 or nx < 0 or ny >= height or nx >= width:
                        continue
                    if visited[ny, nx]:
                        continue
                    if (rgb[ny, nx] == color).all():
                        visited[ny, nx] = True
                        queue.append((ny, nx))
            components.append({
                "x": int(min_x),
                "y": int(min_y),
                "width": int(max_x - min_x + 1),
                "height": int(max_y - min_y + 1),
                "color": [int(color[0]), int(color[1]), int(color[2])],
                "pixels": int(count),
            })
    return components


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path")
    parser.add_argument("--colors", type=int, default=64)
    parser.add_argument("--min-pixels", type=int, default=40)
    parser.add_argument("--output", default="elements.json")
    args = parser.parse_args()
    image = Image.open(args.image_path)
    quantized = quantize_image(image, args.colors)
    rgb = np.array(quantized)
    components = find_components(rgb)
    filtered = [c for c in components if c["pixels"] >= args.min_pixels]
    filtered.sort(key=lambda c: (-c["pixels"], c["y"], c["x"]))
    with open(args.output, "w") as handle:
        json.dump(filtered, handle, indent=2)


if __name__ == "__main__":
    main()
