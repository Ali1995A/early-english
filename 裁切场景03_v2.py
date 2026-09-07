from pathlib import Path
from PIL import Image

root = Path(__file__).parent
grid_dir = root / '02_工作成果' / '全量插画网格'
output_dirs = [
    root / '02_工作成果' / '全量句式插画',
    root / 'assets' / 'sentence-illustrations',
]

sources = [
    ('scene-03-v2-part1.png', 5, 5, 1, 25),
    ('scene-03-v2-part2.png', 5, 2, 26, 35),
]

for directory in output_dirs:
    directory.mkdir(parents=True, exist_ok=True)

for name, columns, rows, first_sentence, last_sentence in sources:
    image = Image.open(grid_dir / name).convert('RGB')
    width, height = image.size
    expected = columns * rows
    count = last_sentence - first_sentence + 1
    if count > expected:
        raise ValueError(f'{name} does not have enough cells for its sentence range.')
    for offset in range(count):
        col, row = offset % columns, offset // columns
        left, top = round(width * col / columns), round(height * row / rows)
        right, bottom = round(width * (col + 1) / columns), round(height * (row + 1) / rows)
        # A small, symmetric inset avoids neighbour bleed; cell positions are
        # fixed and auditable because both source sheets use strict 5-column grids.
        inset_x = round((right - left) * 0.035)
        inset_y = round((bottom - top) * 0.035)
        crop = image.crop((left + inset_x, top + inset_y, right - inset_x, bottom - inset_y))
        filename = f'scene-03-{first_sentence + offset:02d}.png'
        for directory in output_dirs:
            crop.save(directory / filename, quality=92)

print('场景03重新裁切完成：35 张，源网格为固定 5×5 与 5×2。')
