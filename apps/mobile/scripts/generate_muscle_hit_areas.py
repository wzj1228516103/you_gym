"""Convert module alpha masks into compact row spans for precise touch hit testing."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


def encode_mask(path: Path) -> dict[str, list[int]]:
    alpha = Image.open(path).convert("RGBA").getchannel("A")
    pixels = alpha.load()
    rows: dict[str, list[int]] = {}
    for y in range(alpha.height):
        spans: list[int] = []
        start: int | None = None
        for x in range(alpha.width):
            opaque = pixels[x, y] >= 80
            if opaque and start is None:
                start = x
            elif not opaque and start is not None:
                spans.extend((start, x - 1))
                start = None
        if start is not None:
            spans.extend((start, alpha.width - 1))
        if spans:
            rows[str(y)] = spans
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--male-dir", type=Path, required=True)
    parser.add_argument("--female-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    metadata = json.loads(args.metadata.read_text(encoding="utf-8"))
    result: dict[str, object] = {"width": 1307, "height": 1203, "male": {}, "female": {}}
    for module in metadata["modules"]:
        filename = Path(module["asset"]).name
        for gender, directory in (("male", args.male_dir), ("female", args.female_dir)):
            result[gender][module["id"]] = encode_mask(directory / filename)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
