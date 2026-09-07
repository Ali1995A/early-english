from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
# Match the largest in-page illustration size exactly.  This keeps the website
# crisp at its 128px display size without carrying print-resolution payloads.
TARGET = (128, 128)
DIRECTORIES = [
    ROOT / 'assets' / 'sentence-illustrations',
    ROOT / '02_工作成果' / '全量句式插画',
]

for directory in DIRECTORIES:
    count = 0
    before = after = 0
    for path in directory.glob('*.png'):
        before += path.stat().st_size
        with Image.open(path) as image:
            image = image.convert('RGB')
            if image.size != TARGET:
                image = image.resize(TARGET, Image.Resampling.LANCZOS)
            image.save(path, format='PNG', optimize=True, compress_level=9)
        after += path.stat().st_size
        count += 1
    print(f'{directory}: {count} 张，{before / 1024 / 1024:.1f} MB -> {after / 1024 / 1024:.1f} MB')
