# Anatomy module assets

`anatomy-color-front-back.png` is the supplied front/back chart with the center legend removed. The source canvas is kept at 1307 x 1203 so every overlay uses the same coordinate system.

`anatomy-female-front-back.png` is extracted from the supplied female chart (`ChatGPT Image 2026年8月17日 14_06_56.png`). The center legend is removed while the original front/back figures remain on the 1307 x 1203 canvas.

The 21 files in `modules/` are transparent, same-canvas overlays extracted from the colored regions. They cover the major front/back neck, shoulder, chest, arm, core, hip, thigh, glute, and lower-leg groups shown in the chart, including anterior/middle/posterior deltoids and upper/lower chest subdivisions.

The overlays are intentionally white with alpha so the app can recolor the selected module using `tintColor`. Module names, IDs, source colors, and asset paths are kept in `src/data/muscles.json`.

`female-modules/` contains the matching 21 female overlays. `src/data/muscle-hit-areas.json` stores alpha-mask row spans for precise click/touch hit testing instead of rectangular hotspots.

Regenerate the overlays with:

```powershell
python scripts/extract_anatomy_modules.py --input <source.png> --output-dir assets/anatomy/modules
python scripts/extract_female_anatomy.py --input <female-reference.png> --base-output assets/anatomy/anatomy-female-front-back.png --module-output-dir assets/anatomy/female-modules
python scripts/generate_muscle_hit_areas.py --metadata src/data/muscles.json --male-dir assets/anatomy/modules --female-dir assets/anatomy/female-modules --output src/data/muscle-hit-areas.json
```
