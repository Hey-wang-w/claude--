#!/usr/bin/env python3
"""从课本 PDF 页提取标志 / 插图原图（不要自己用代码重画官方标志）。
做法：用 pdftoppm 以 600 dpi 渲染指定区域 → 按非白像素自动找出各个图块 → 裁切、缩放 → 可把菱形外设为透明 → 输出 PNG 和 base64 的 JS 常量。
用法：
  python3 extract_pdf_figure.py 课本.pdf --page 1 --box X,Y,W,H --names boom,gas,solid,self,toxic,corr --cols 2 --size 288 --diamond --js signs.js --var SIGN_SRC
  --box 是 600 dpi 下的像素区域（先用 pdftoppm -r 200 看整页，再按 3 倍换算）；图块按“从上到下、每行从左到右”与 --names 对应。
依赖：poppler-utils（pdftoppm）、Pillow、numpy。"""
import argparse, subprocess, tempfile, os, io, base64
import numpy as np
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('pdf'); ap.add_argument('--page', type=int, default=1); ap.add_argument('--box', required=True)
ap.add_argument('--names', required=True); ap.add_argument('--cols', type=int, default=1); ap.add_argument('--size', type=int, default=288)
ap.add_argument('--diamond', action='store_true', help='菱形标志：菱形外设为透明'); ap.add_argument('--js'); ap.add_argument('--var', default='FIG_SRC'); ap.add_argument('--out', default='.')
a = ap.parse_args(); x, y, w, h = map(int, a.box.split(',')); names = a.names.split(',')
with tempfile.TemporaryDirectory() as d:
    subprocess.run(['pdftoppm', '-r', '600', '-png', '-f', str(a.page), '-l', str(a.page), '-x', str(x), '-y', str(y), '-W', str(w), '-H', str(h), a.pdf, os.path.join(d, 'r')], check=True)
    im = Image.open(os.path.join(d, sorted(os.listdir(d))[0])).convert('RGB')
arr = np.asarray(im).astype(int); ink = np.abs(arr - 255).sum(2) > 40
def runs(v, gap=12):
    out = []; s = None; z = 0
    for i, on in enumerate(v):
        if on: z = 0; s = i if s is None else s
        elif s is not None:
            z += 1
            if z > gap: out.append((s, i - z + 1)); s = None; z = 0
    if s is not None: out.append((s, len(v)))
    return [r for r in out if r[1] - r[0] > 40]
boxes = []
for (y0, y1) in runs(ink.any(1)):
    for (x0, x1) in runs(ink[y0:y1].any(0)): boxes.append((x0, y0, x1, y1))
res = {}
for n, (x0, y0, x1, y1) in zip(names, boxes):
    c = im.crop((x0 - 4, y0 - 4, x1 + 5, y1 + 5)).convert('RGBA').resize((a.size, a.size), Image.LANCZOS)
    if a.diamond:
        t = np.asarray(c).astype(float); H, W = t.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
        dd = np.abs(xx + .5 - W / 2) / (W / 2) + np.abs(yy + .5 - H / 2) / (H / 2); t[:, :, 3] *= np.clip((1 - dd) * W / 3 + 1, 0, 1); c = Image.fromarray(t.astype(np.uint8))
    c.save(os.path.join(a.out, f'{n}.png')); b = io.BytesIO(); c.save(b, 'PNG', optimize=True); res[n] = base64.b64encode(b.getvalue()).decode()
print('找到图块', len(boxes), '个，已输出', list(res))
if a.js:
    open(a.js, 'w').write(f'const {a.var}={{' + ','.join(f"{k}:'data:image/png;base64,{v}'" for k, v in res.items()) + '};\n')
