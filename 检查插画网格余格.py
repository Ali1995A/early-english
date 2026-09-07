import json
import subprocess
from math import ceil
from pathlib import Path

import numpy as np
from PIL import Image

root = Path(__file__).parent
source_dir = root / '02_工作成果' / '全量插画网格'
payload = subprocess.check_output(
    ['node', '-e', "const d=require('./data.js');console.log(JSON.stringify(d.phases.flatMap(p=>p.scenes).map(s=>({id:s.id,count:s.sentences.length}))))"],
    cwd=root, text=True, encoding='utf-8',
)

def infer_grid(width, height, count):
    aspect = width / height
    candidates = []
    for columns in range(4, 9):
        rows = ceil(count / columns)
        capacity = columns * rows
        candidates.append((abs(columns / rows - aspect) + (capacity - count) * 0.012, columns, rows))
    _, columns, rows = min(candidates)
    return columns, rows

for scene in json.loads(payload):
    image = Image.open(source_dir / f"scene-{scene['id']}.png").convert('RGB')
    pixels = np.array(image)
    height, width = pixels.shape[:2]
    columns, rows = infer_grid(width, height, scene['count'])
    capacity = columns * rows
    if capacity == scene['count']:
        continue
    occupancies = []
    for cell in range(scene['count'], capacity):
        col, row = cell % columns, cell // columns
        left, top = round(width * col / columns), round(height * row / rows)
        right, bottom = round(width * (col + 1) / columns), round(height * (row + 1) / rows)
        # Percentage of non-near-white pixels in an otherwise-unused grid cell.
        occupancy = float((pixels[top:bottom, left:right].min(axis=2) < 245).mean())
        occupancies.append(round(occupancy, 4))
    status = '异常：需人工核对' if max(occupancies) > 0.01 else '正常：余格为空'
    print(f"场景{scene['id']} {columns}×{rows}，余格占用率 {occupancies}，{status}")
