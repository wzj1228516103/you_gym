"""Extract same-canvas transparent muscle overlays from the colored anatomy chart."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageFilter


MODULES = {
    "neck-muscles": ((226, 61, 66), [(220, 170, 325, 250), (970, 125, 1080, 250)]),
    "trapezius": ((255, 197, 26), [(930, 205, 1025, 290), (1025, 205, 1120, 290)]),
    "trapezius-middle": ((255, 197, 26), [(945, 285, 1025, 355), (1025, 285, 1105, 355)]),
    "trapezius-lower": ((255, 197, 26), [(970, 345, 1025, 425), (1025, 345, 1080, 425)]),
    "deltoid-anterior": ((71, 134, 217), [(166, 205, 210, 325), (335, 205, 387, 325)]),
    "deltoid-middle": ((71, 134, 217), [(100, 205, 164, 325), (389, 205, 450, 325)]),
    "deltoid-posterior": ((71, 134, 217), [(860, 210, 965, 330), (1120, 210, 1225, 330)]),
    "pectoralis-major": ((241, 121, 55), [(170, 225, 275, 280), (275, 225, 380, 280)]),
    "pectoralis-major-lower": ((241, 121, 55), [(170, 282, 275, 345), (275, 282, 380, 345)]),
    "serratus-anterior": ((241, 121, 55), [(150, 345, 210, 505), (340, 345, 400, 505)]),
    "biceps-brachii": ((151, 85, 181), [(90, 290, 185, 425), (370, 290, 465, 425)]),
    "triceps-brachii": ((128, 112, 188), [(825, 290, 930, 430), (1145, 290, 1250, 430)]),
    "forearm-muscles": ((59, 176, 185), [(55, 385, 165, 575), (390, 385, 485, 575), (795, 390, 900, 575), (1180, 390, 1280, 575)]),
    "rectus-abdominis": ((136, 170, 60), [(210, 320, 335, 585)]),
    "external-oblique": ((255, 197, 26), [(175, 385, 245, 580), (300, 385, 380, 580)]),
    "hip-flexors": ((203, 83, 155), [(200, 555, 275, 735), (270, 555, 350, 735)]),
    "rectus-femoris": ((203, 83, 155), [(210, 620, 255, 835), (280, 620, 325, 835)]),
    "quadriceps": ((82, 178, 178), [(145, 535, 255, 835), (280, 535, 400, 835)]),
    "adductors": ((128, 111, 188), [(205, 680, 260, 850), (280, 680, 335, 850)]),
    "latissimus-dorsi": ((139, 171, 61), [(910, 245, 1028, 420), (1035, 245, 1155, 420)]),
    "erector-spinae": ((203, 83, 155), [(960, 350, 1100, 570)]),
    "gluteus-maximus": ((241, 122, 57), [(905, 480, 1028, 640), (1010, 480, 1140, 640)]),
    "gluteus-medius": ((255, 197, 26), [(895, 535, 940, 655), (1120, 535, 1160, 655)]),
    "hamstrings": ((128, 111, 188), [(895, 620, 1005, 850), (1045, 620, 1155, 850)]),
    "tibialis-anterior": ((73, 134, 215), [(175, 825, 260, 1080), (270, 825, 355, 1080)]),
    "gastrocnemius": ((73, 134, 215), [(895, 810, 995, 1055), (1040, 810, 1150, 1055)]),
}


def extract_module(source: Image.Image, target: tuple[int, int, int], boxes: list[tuple[int, int, int, int]]) -> Image.Image:
    mask = Image.new("L", source.size, 0)
    source_pixels = source.load()
    mask_pixels = mask.load()

    # Sample only each module's known region to avoid merging identical palette colors.
    for left, top, right, bottom in boxes:
        for y in range(top, bottom):
            for x in range(left, right):
                red, green, blue = source_pixels[x, y]
                distance = ((red - target[0]) ** 2 + (green - target[1]) ** 2 + (blue - target[2]) ** 2) ** 0.5
                if distance < 82:
                    mask_pixels[x, y] = 255

    overlay = Image.new("RGBA", source.size, (255, 255, 255, 0))
    overlay.putalpha(mask.filter(ImageFilter.GaussianBlur(0.55)))
    return overlay


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGB")
    args.output_dir.mkdir(parents=True, exist_ok=True)

    for name, (target, boxes) in MODULES.items():
        extract_module(source, target, boxes).save(args.output_dir / f"{name}.png", optimize=True)


if __name__ == "__main__":
    main()
