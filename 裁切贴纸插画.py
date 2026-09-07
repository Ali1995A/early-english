from pathlib import Path
from PIL import Image

root = Path(__file__).parent / '02_工作成果' / '贴纸插画'
for source in sorted(root.glob('scene-??.png')):
    image = Image.open(source).convert('RGB')
    width, height = image.size
    for index in range(3):
        left = round(width * index / 3)
        right = round(width * (index + 1) / 3)
        crop = image.crop((left, 0, right, height))
        crop.save(root / f'{source.stem}-{index + 1}.png', quality=92)
print('裁切完成：', len(list(root.glob('scene-??-?.png'))), '张 PNG')
