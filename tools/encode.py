"""MỘT GIỌT: work/ + inbox/ -> assets/img/*.webp

- beans.webp     atlas, 6 rows (green, robusta, arabica, excelsa, catimor, culi) x 9 beans, 160 px cells
- fly-*.webp     single cut-out pieces that float in the ĐẤT / NƯỚC chapters (cherries, leaves, ice)
- <name>.webp    single cut-outs (phin, goi-xe, ly-sua-da, nam-dam, nam-vua), plus -m for phones
- full-bleed photos are cropped so the Gemini corner mark is cut away (healing left smudges)
usage: python -I tools/encode.py   (run from the build folder)
"""
import json
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT, INBOX, OUT = (os.path.join(ROOT, p) for p in ('work/cut', 'inbox', 'assets/img'))
os.makedirs(OUT, exist_ok=True)
report = []


def save(im, name, width=None, q=80):
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, name + '.webp')
    if im.mode == 'RGBA':
        a = np.asarray(im).copy(); a[a[..., 3] < 6] = 0
        Image.fromarray(a, 'RGBA').save(p, 'WEBP', quality=q, alpha_quality=90, method=6)
    else:
        im.convert('RGB').save(p, 'WEBP', quality=q, method=6)
    report.append((name, os.path.getsize(p), im.size))


def components(rgba, n=None, min_frac=0.0015):
    """Split a cut-out into its separate pieces (largest first), dropping specks and the corner mark."""
    a = np.asarray(rgba.getchannel('A')) > 100
    lab, k = ndimage.label(ndimage.binary_closing(a, iterations=2))
    H, W = a.shape
    pieces = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        area = int((lab[sl] == i).sum())
        if area < min_frac * W * H:
            continue
        cy, cx = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
        if cx > W * 0.85 and cy > H * 0.82 and area < 0.01 * W * H:
            continue  # the ✦ in the corner
        m = (lab[sl] == i)
        piece = np.asarray(rgba)[sl].copy(); piece[..., 3] = (piece[..., 3] * m).astype(np.uint8)
        pieces.append((area, cy, cx, Image.fromarray(piece, 'RGBA')))
    pieces.sort(key=lambda t: -t[0])
    return pieces[:n] if n else pieces


def fit(im, cell, pad=0.08):
    s = cell * (1 - 2 * pad) / max(im.size)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    c = Image.new('RGBA', (cell, cell), (0, 0, 0, 0)); c.alpha_composite(im, ((cell - im.width) // 2, (cell - im.height) // 2))
    return c


def bean_atlas():
    sets = ['nhan-xanh', 'robusta', 'arabica', 'excelsa', 'catimor', 'culi']
    cell = 160
    atlas = Image.new('RGBA', (cell * 9, cell * len(sets)), (0, 0, 0, 0))
    for r, s in enumerate(sets):
        ps = components(Image.open(os.path.join(CUT, s + '.png')).convert('RGBA'), 9)
        assert len(ps) == 9, (s, len(ps))
        ps.sort(key=lambda t: (round(t[1] / 300), t[2]))  # reading order
        for c, (_, _, _, im) in enumerate(ps):
            atlas.alpha_composite(fit(im, cell), (c * cell, r * cell))
    save(atlas, 'beans', q=86)
    json.dump({'cell': cell, 'cols': 9, 'rows': sets}, open(os.path.join(ROOT, 'assets', 'beans.json'), 'w'), indent=1)


def backdrop_cut(name):
    """Own segmentation for a shot on flat grey where PhotoCraft dropped pieces: distance from the fitted backdrop."""
    rgb = np.asarray(Image.open(os.path.join(INBOX, name + '.png')).convert('RGB')).astype(np.float32)
    H, W, _ = rgb.shape
    b = int(min(H, W) * 0.05)
    mask = np.zeros((H, W), bool); mask[:b] = mask[-b:] = True; mask[:, :b] = mask[:, -b:] = True
    mask[-int(H * 0.25):, int(W * 0.75):] = False
    ys, xs = np.nonzero(mask); yn, xn = ys / H, xs / W
    A = np.stack([np.ones_like(xn), xn, yn, xn * xn, yn * yn, xn * yn], 1)
    Y, X = np.mgrid[0:H, 0:W]; Yn, Xn = Y / H, X / W
    bg = np.zeros_like(rgb)
    for ch in range(3):
        coef, *_ = np.linalg.lstsq(A, rgb[ys, xs, ch], rcond=None)
        bg[..., ch] = coef[0] + coef[1] * Xn + coef[2] * Yn + coef[3] * Xn * Xn + coef[4] * Yn * Yn + coef[5] * Xn * Yn
    d = rgb - bg
    lum = d.mean(-1)
    chroma = np.abs(d - lum[..., None]).max(-1)
    # objects differ in colour, or are much darker/brighter; soft grey contact shadows are only a bit darker
    obj = chroma > 18   # colourful fruit, twig and leaf; the grey contact shadow has no chroma
    obj = ndimage.binary_opening(obj, iterations=2)
    obj = ndimage.binary_fill_holes(ndimage.binary_closing(obj, iterations=3))
    alpha = np.asarray(Image.fromarray((obj * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))
    return Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), 'RGBA')


def flyers():
    out = {}
    for name, src, n in [('cherry', backdrop_cut('qua-chin'), 6), ('leaf', Image.open(os.path.join(CUT, 'la-ca-phe.png')).convert('RGBA'), 4),
                         ('ice', Image.open(os.path.join(CUT, 'da.png')).convert('RGBA'), 6)]:
        ps = components(src, n)
        for i, (_, _, _, im) in enumerate(ps):
            save(im, f'fly-{name}-{i}', width=420, q=82)
        out[name] = len(ps)
    json.dump(out, open(os.path.join(ROOT, 'assets', 'flyers.json'), 'w'))
    print('flyers', out)


def singles():
    for n, w in [('phin', 760), ('goi-xe', 900), ('ly-sua-da', 760), ('nam-dam', 1100), ('nam-vua', 1100)]:
        im = Image.open(os.path.join(CUT, n + '.png')).convert('RGBA')
        ps = components(im, 1)
        im = ps[0][3]
        save(im, n, w); save(im, n + '-m', w // 2)


def full_bleed():
    # cut away the bottom-right corner that held the mark
    im = Image.open(os.path.join(INBOX, 'dat-do.png')).convert('RGB'); W, H = im.size
    im = im.crop((0, 0, W - 330, H - 0)) if False else im.crop((0, 0, int(W * 0.9), int(H * 0.77)))
    save(im, 'dat-do', 2400, 78); save(im, 'dat-do-m', 1100, 74)
    im = Image.open(os.path.join(INBOX, 'crema.png')).convert('RGB')
    im = im.crop((100, 40, 1800, 1740)); save(im, 'crema', 1024, 84)
    im = Image.open(os.path.join(INBOX, 'phin-giot.png')).convert('RGB'); W, H = im.size
    im = im.crop((0, 0, W, 2440)); save(im, 'phin-giot', 1100, 78); save(im, 'phin-giot-m', 640, 74)
    for n in ['m1996', 'm1998', 'm2003', 'm2018', 'm2026']:
        im = Image.open(os.path.join(INBOX, n + '.png')).convert('RGB'); W, H = im.size
        S = H - 280; x0 = (W - S) // 2
        save(im.crop((x0, 0, x0 + S, S)), n, 640, 80)


if __name__ == '__main__':
    bean_atlas(); flyers(); singles(); full_bleed()
    tot = 0
    for n, b, s in report:
        tot += b; print(f'{n:16s} {b/1024:7.1f} KB {s}')
    print(f'total {tot/1024/1024:.2f} MB')
