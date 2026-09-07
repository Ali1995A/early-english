import json
import subprocess
from math import ceil
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

root = Path(__file__).parent
source_dir = root / '02_工作成果' / '全量插画网格'
output_dir = root / '02_工作成果' / '全量句式插画'
output_dir.mkdir(parents=True, exist_ok=True)

payload = subprocess.check_output(
    ['node', '-e', "const d=require('./data.js');console.log(JSON.stringify(d.phases.flatMap(p=>p.scenes).map(s=>({id:s.id,count:s.sentences.length}))))"],
    cwd=root,
    text=True,
    encoding='utf-8',
)
scenes = json.loads(payload)
total = 0
layouts = []

# image2 occasionally inserts an extra visual into a contact sheet.  These maps
# are audited, one-based source-cell numbers for each one-based sentence index.
# Scenes not listed use the normal left-to-right, top-to-bottom order.
CROP_CELL_MAP_OVERRIDES = {
    # Scene 03 has an extra back-view drawing in source cell 25.  Sentence 25
    # ("My tummy hurts.") starts at cell 26; cells 25–35 therefore map to
    # source cells 26–36.
    '03': list(range(1, 25)) + list(range(26, 37)),
}

def infer_grid(width, height, count):
    """Pick the dense grid whose aspect ratio best matches the generated sheet."""
    aspect = width / height
    candidates = []
    for columns in range(4, 9):
        rows = ceil(count / columns)
        capacity = columns * rows
        grid_aspect = columns / rows
        # Prefer close geometry; then prefer as few empty cells as possible.
        score = abs(grid_aspect - aspect) + (capacity - count) * 0.012
        candidates.append((score, columns, rows))
    _, columns, rows = min(candidates)
    return columns, rows

for scene in scenes:
    image = Image.open(source_dir / f"scene-{scene['id']}.png").convert('RGB')
    width, height = image.size
    columns, rows = infer_grid(width, height, scene['count'])
    layouts.append(f"场景{scene['id']}: {columns}×{rows}")
    pixels = np.array(image)
    # Non-white pixels form the illustrated foreground.  Connected components let
    # us keep an object in the cell containing its visual centre, even if an arm
    # or a prop crosses a contact-sheet boundary.
    foreground = (pixels.min(axis=2) < 252).astype(np.uint8)
    connected = cv2.dilate(foreground, np.ones((3, 3), np.uint8), iterations=1)
    label_count, labels, stats, centers = cv2.connectedComponentsWithStats(connected, connectivity=8)
    component_cell = {}
    for label in range(1, label_count):
        if stats[label, cv2.CC_STAT_AREA] < 12:
            continue
        center_x, center_y = centers[label]
        column = min(columns - 1, int(center_x / width * columns))
        row = min(rows - 1, int(center_y / height * rows))
        component_cell[label] = (column, row)
    source_cells = CROP_CELL_MAP_OVERRIDES.get(scene['id'], list(range(1, scene['count'] + 1)))
    if len(source_cells) != scene['count']:
        raise ValueError(f"场景{scene['id']}裁切映射数量不等于句子数量。")
    if min(source_cells) < 1 or max(source_cells) > columns * rows:
        raise ValueError(f"场景{scene['id']}裁切映射超出原图网格范围。")
    if len(set(source_cells)) != len(source_cells):
        raise ValueError(f"场景{scene['id']}裁切映射存在重复单元。")

    for index, source_cell in enumerate(source_cells):
        source_index = source_cell - 1
        col, row = source_index % columns, source_index // columns
        left, top = round(width * col / columns), round(height * row / rows)
        right, bottom = round(width * (col + 1) / columns), round(height * (row + 1) / rows)
        # Remove contact-sheet bleed from adjacent cells while retaining the centered drawing.
        horizontal_inset = round((right - left) * (0.10 if columns >= 7 else 0.04))
        cell_height = bottom - top
        # Equal-grid crops are now aligned; retain a small safety band only.
        top_inset = round(cell_height * 0.04)
        bottom_inset = round(cell_height * 0.04)
        left, right = left + horizontal_inset, right - horizontal_inset
        top, bottom = top + top_inset, bottom - bottom_inset
        # The generated grid's cell alignment is reliable after infer_grid().
        # A conservative inset removes boundary bleed without deleting a figure
        # that happens to be drawn off-center within its own cell.
        crop_pixels = pixels[top:bottom, left:right].copy()
        Image.fromarray(crop_pixels).save(
            output_dir / f"scene-{scene['id']}-{index+1:02d}.png",
            quality=90,
        )
        total += 1
print(f'裁切完成：{total} 张单句插画')
print('；'.join(layouts))
print('人工校正映射：' + (', '.join(CROP_CELL_MAP_OVERRIDES) or '无'))
