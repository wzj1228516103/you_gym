"""Build the female anatomy canvas and precise same-canvas muscle masks.

The supplied chart already uses the application's 1307 x 1203 coordinate space.
Only the two figures are retained; the center legend is deliberately excluded.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


CANVAS_SIZE = (1307, 1203)
BACKGROUND = (17, 18, 22, 255)
FRONT_FIGURE_BOX = (20, 25, 535, 1190)
BACK_FIGURE_BOX = (770, 25, 1290, 1190)

# Palette samples come from the solid legend swatches in the supplied female
# chart. Restricting each color to anatomical boxes keeps repeated colors (for
# example, chest/glutes and core/back) as independent clickable modules.
NECK = (226, 81, 82)
YELLOW = (249, 196, 41)
DELTOID = (71, 138, 221)
PECTORAL = (241, 121, 55)
BICEPS = (147, 96, 187)
TRICEPS = (140, 121, 196)
FOREARM = (64, 182, 188)
RECTUS = (136, 172, 69)
HIP_FLEXORS = (218, 110, 166)
QUADRICEPS = (64, 178, 182)
ADDUCTORS = (146, 119, 196)
HAMSTRINGS = (144, 115, 195)
LOWER_LEG_FRONT = (75, 137, 222)
LOWER_LEG_BACK = (106, 154, 224)
GASTROCNEMIUS = (70, 136, 222)

Box = tuple[int, int, int, int]
Color = tuple[int, int, int]

MODULES: dict[str, tuple[list[Color], list[Box], float]] = {
    "neck-muscles": (
        [NECK],
        [(215, 205, 355, 295), (965, 195, 1095, 295)],
        45,
    ),
    "trapezius": (
        [YELLOW],
        [(915, 260, 1140, 440)],
        50,
    ),
    "deltoid-anterior": (
        [DELTOID],
        [(177, 260, 225, 370), (340, 260, 382, 370)],
        50,
    ),
    "deltoid-middle": (
        [DELTOID],
        [(125, 260, 175, 370), (384, 260, 435, 370)],
        50,
    ),
    "deltoid-posterior": (
        [DELTOID],
        [(860, 260, 965, 370), (1115, 260, 1210, 370)],
        50,
    ),
    "pectoralis-major": (
        [PECTORAL],
        [(175, 275, 375, 332)],
        45,
    ),
    "pectoralis-major-lower": (
        [PECTORAL],
        [(175, 334, 375, 405)],
        45,
    ),
    "biceps-brachii": (
        [BICEPS, TRICEPS],
        [(125, 335, 200, 475), (355, 335, 430, 475)],
        48,
    ),
    "triceps-brachii": (
        [BICEPS, TRICEPS],
        [(870, 335, 940, 475), (1125, 335, 1200, 475)],
        48,
    ),
    "forearm-muscles": (
        [FOREARM],
        [
            (65, 420, 170, 615),
            (380, 420, 490, 615),
            (805, 420, 925, 615),
            (1145, 420, 1250, 615),
        ],
        50,
    ),
    "rectus-abdominis": (
        [RECTUS],
        [(232, 365, 320, 630)],
        50,
    ),
    "external-oblique": (
        [YELLOW],
        [(180, 365, 245, 630), (307, 365, 370, 630)],
        50,
    ),
    "hip-flexors": (
        [HIP_FLEXORS],
        [(185, 515, 275, 745), (280, 515, 370, 745)],
        50,
    ),
    "quadriceps": (
        [QUADRICEPS, FOREARM],
        [(175, 540, 260, 885), (305, 540, 395, 885)],
        50,
    ),
    "adductors": (
        [ADDUCTORS, HAMSTRINGS],
        [(245, 610, 285, 885), (282, 610, 325, 885)],
        48,
    ),
    "latissimus-dorsi": (
        [RECTUS],
        [(925, 310, 1025, 545), (1030, 310, 1140, 545)],
        50,
    ),
    "gluteus-maximus": (
        [PECTORAL],
        [(920, 525, 1035, 685), (1025, 525, 1145, 685)],
        45,
    ),
    "gluteus-medius": (
        [YELLOW],
        [(895, 470, 955, 700), (1110, 470, 1170, 700)],
        50,
    ),
    "hamstrings": (
        [HAMSTRINGS, ADDUCTORS, HIP_FLEXORS],
        [(925, 650, 1028, 890), (1035, 650, 1145, 890)],
        48,
    ),
    "tibialis-anterior": (
        [LOWER_LEG_FRONT, GASTROCNEMIUS],
        [(175, 845, 255, 1100), (310, 845, 390, 1100)],
        50,
    ),
    "gastrocnemius": (
        [GASTROCNEMIUS, LOWER_LEG_BACK, LOWER_LEG_FRONT],
        [(920, 845, 1015, 1105), (1045, 845, 1145, 1105)],
        50,
    ),
}


def color_distance(pixel: Color, target: Color) -> float:
    return sum((channel - target_channel) ** 2 for channel, target_channel in zip(pixel, target)) ** 0.5


def retain_large_components(alpha: Image.Image, minimum_pixels: int) -> Image.Image:
    """Remove small text fragments that share the figure crop with the back view."""

    pixels = alpha.load()
    visited: set[tuple[int, int]] = set()
    result = Image.new("L", alpha.size, 0)
    result_pixels = result.load()

    for y in range(alpha.height):
        for x in range(alpha.width):
            if pixels[x, y] == 0 or (x, y) in visited:
                continue
            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            visited.add((x, y))
            while stack:
                current_x, current_y = stack.pop()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if (
                        0 <= next_x < alpha.width
                        and 0 <= next_y < alpha.height
                        and pixels[next_x, next_y] > 0
                        and (next_x, next_y) not in visited
                    ):
                        visited.add((next_x, next_y))
                        stack.append((next_x, next_y))
            if len(component) >= minimum_pixels:
                for component_x, component_y in component:
                    result_pixels[component_x, component_y] = pixels[component_x, component_y]
    return result


def extract_figure(source: Image.Image, box: Box) -> Image.Image:
    """Extract one figure while dropping the near-black chart background."""

    figure = Image.new("RGBA", source.size, (0, 0, 0, 0))
    alpha_mask = Image.new("L", source.size, 0)
    source_pixels = source.load()
    figure_pixels = figure.load()
    alpha_pixels = alpha_mask.load()
    left, top, right, bottom = box
    for y in range(top, bottom):
        for x in range(left, right):
            red, green, blue = source_pixels[x, y]
            brightest = max(red, green, blue)
            if brightest <= 42:
                continue
            # A short alpha ramp preserves the supplied anti-aliased white edge
            # without carrying the chart's dark vignette into the app canvas.
            opacity = min(255, round((brightest - 42) / 24 * 255))
            figure_pixels[x, y] = (red, green, blue, opacity)
            alpha_pixels[x, y] = opacity
    figure.putalpha(retain_large_components(alpha_mask, minimum_pixels=1000))
    return figure


def extract_module(source: Image.Image, targets: list[Color], boxes: list[Box], threshold: float) -> Image.Image:
    mask = Image.new("L", source.size, 0)
    source_pixels = source.load()
    mask_pixels = mask.load()
    for left, top, right, bottom in boxes:
        for y in range(top, bottom):
            for x in range(left, right):
                pixel = source_pixels[x, y]
                if min(color_distance(pixel, target) for target in targets) <= threshold:
                    mask_pixels[x, y] = 255

    overlay = Image.new("RGBA", source.size, (255, 255, 255, 0))
    overlay.putalpha(mask)
    return overlay


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--base-output", type=Path, required=True)
    parser.add_argument("--module-output-dir", type=Path, required=True)
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGB")
    if source.size != CANVAS_SIZE:
        raise ValueError(f"Expected female chart size {CANVAS_SIZE}, received {source.size}")

    canvas = Image.new("RGBA", CANVAS_SIZE, BACKGROUND)
    canvas.alpha_composite(extract_figure(source, FRONT_FIGURE_BOX))
    canvas.alpha_composite(extract_figure(source, BACK_FIGURE_BOX))

    args.base_output.parent.mkdir(parents=True, exist_ok=True)
    args.module_output_dir.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(args.base_output, optimize=True)

    for name, (targets, boxes, threshold) in MODULES.items():
        extract_module(source, targets, boxes, threshold).save(
            args.module_output_dir / f"{name}.png",
            optimize=True,
        )


if __name__ == "__main__":
    main()
