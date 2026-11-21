#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
Splošni izrisovalnik mrežnih datotek (ESRI ASCII grid) z RAZPOZNAVANJEM
PROJEKCIJE - razširitev gral_conc_map.py (ta ostaja nespremenjen).

Zna prebrati:
  - klasične GRAL izhode (npr. 00010-101.txt): glava 6 vrstic z NODATA_value,
    koordinate UTM 33N (EPSG:32633),
  - M2 .asc datoteke (npr. M2_emisije_mreza_zdruzeno_PM10.asc): glava z
    vrstico 'crs +proj=tmerc ... +k=0.9999 +y_0=-5000000' (D96/TM,
    EPSG:3794), brez NODATA vrstice.

Določanje koordinatnega sistema (--crs auto, privzeto):
  1. vrstica 'crs' v glavi s k=0.9999 in lon_0=15 -> D96/TM (EPSG:3794),
  2. yllcorner >= 1 000 000 -> UTM 33N (EPSG:32633),
  3. sicer -> D96/TM (EPSG:3794).
Pri D96/TM se y v UTM obliki (>= 1 000 000) samodejno pretvori (y - 5 000 000).

Barvna lestvica: če --vmax/--rdeca nista podana, se izračunata samodejno
(vmax = 95. percentil, rdeča = 0.8 * vmax).

Uporaba:
  py -3.13 conc_map_projekcije.py
      # uporabi DATA_FILE / OUTPUT_FILE iz nastavitev spodaj
  py -3.13 conc_map_projekcije.py D:\...\00010-101.txt --izhod karta.png
  py -3.13 conc_map_projekcije.py M2.asc --vmax 6000 --rdeca 5000 --enota g/leto
"""

import argparse
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import LinearSegmentedColormap
import contextily as ctx
from pyproj import Transformer

# ============================ NASTAVITVE ==================================
DATA_FILE = r'D:\GRAMM_GRAL\GRAMM_GRAL_LJ_2021\emisije\M2_po_gdpr\M2_emisije_mreza_zdruzeno_PM10_asc.txt'
OUTPUT_FILE = r'D:\GRAMM_GRAL\GRAMM_GRAL_LJ_2021\emisije\M2_po_gdpr\M2_emisije_mreza_zdruzeno_PM10_asc_TEST.png'

DPI = 300
FIGURE_SIZE = (16, 14)
MAP_PROVIDER = ctx.providers.OpenTopoMap
ALPHA = 0.6
VMIN = 0.0
MIN_CONCENTRATION = 0.001   # vrednosti pod tem pragom se ne prikažejo
MARGIN_DEGREES = 0.015
SHOW_BOUNDARY = True
BOUNDARY_COLOR = 'black'
BOUNDARY_WIDTH = 2
COLORBAR_LABELSIZE = 14
# ==========================================================================


def preberi_mrezo(pot):
    """Preberi ASCII mrežo s poljubno dolgo glavo (ncols/nrows/xllcorner/
    yllcorner/cellsize + opcijsko NODATA_value in/ali crs)."""
    with open(pot, encoding='utf-8', errors='replace') as f:
        vrstice = f.readlines()

    glava = {}
    zacetek = 0
    for k, vrstica in enumerate(vrstice):
        deli = vrstica.split()
        if len(deli) >= 2 and deli[0].lower() in (
                'ncols', 'nrows', 'xllcorner', 'yllcorner', 'cellsize',
                'nodata_value', 'crs'):
            if deli[0].lower() == 'crs':
                glava['crs'] = ' '.join(deli[1:])
            else:
                glava[deli[0].lower()] = deli[1]
            zacetek = k + 1
        else:
            break  # prva podatkovna vrstica

    glava['ncols'] = int(glava['ncols'])
    glava['nrows'] = int(glava['nrows'])
    glava['xllcorner'] = float(glava['xllcorner'])
    glava['yllcorner'] = float(glava['yllcorner'])
    glava['cellsize'] = float(glava['cellsize'])
    glava['nodata_value'] = float(glava.get('nodata_value', '-9999'))

    podatki = []
    for vrstica in vrstice[zacetek:]:
        deli = vrstica.strip().split()
        if deli:
            podatki.append([float(x) for x in deli])
    glava['data'] = np.array(podatki)
    return glava


def doloci_crs(glava, eksplicitni):
    if eksplicitni == '3794':
        return 'EPSG:3794'
    if eksplicitni == '32633':
        return 'EPSG:32633'
    # 'auto'
    crs_txt = glava.get('crs', '')
    if crs_txt and '0.9999' in crs_txt and '+lon_0=15' in crs_txt:
        return 'EPSG:3794'   # D96/TM
    if glava['yllcorner'] >= 1_000_000:
        return 'EPSG:32633'  # UTM 33N
    return 'EPSG:3794'       # D96/TM z y brez UTM premika


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('vhod', nargs='?', default=None,
                    help='ASCII mreža (.txt/-101.txt/.asc); privzeto DATA_FILE '
                         'iz nastavitev')
    ap.add_argument('--izhod', default=None,
                    help='izhodna PNG pot; privzeto OUTPUT_FILE iz nastavitev')
    ap.add_argument('--crs', choices=['auto', '3794', '32633'], default='auto',
                    help='koordinatni sistem: auto (privzeto), 3794 = D96/TM, '
                         '32633 = UTM 33N')
    ap.add_argument('--vmax', type=float, default=None,
                    help='zgornja meja barvne lestvice (privzeto: 95. percentil)')
    ap.add_argument('--rdeca', type=float, default=None,
                    help='vrednost, pri kateri postane rdeča (privzeto: 0.8 * vmax)')
    ap.add_argument('--vmin', type=float, default=VMIN)
    ap.add_argument('--min-konc', type=float, default=MIN_CONCENTRATION)
    ap.add_argument('--alfa', type=float, default=ALPHA)
    ap.add_argument('--dpi', type=int, default=DPI)
    ap.add_argument('--enota', default='μg/m³', help='napis na barvni lestvici')
    args = ap.parse_args()

    vhod = args.vhod or DATA_FILE
    izhod_pot = args.izhod or OUTPUT_FILE
    print(f'Branje datoteke: {vhod}')
    g = preberi_mrezo(vhod)
    ncols = g['ncols']
    nrows = g['nrows']
    xll = g['xllcorner']
    yll = g['yllcorner']
    cs = g['cellsize']
    nodata = g['nodata_value']
    data = g['data']
    print(f'  Mreža: {ncols} x {nrows}, celica {cs} m, spodnji levi kot: '
          f'{xll}, {yll}')

    src_crs = doloci_crs(g, args.crs)
    print(f'  CRS: {src_crs}')

    # y v UTM obliki pri D96/TM -> nazaj v D96
    yll_orig = yll
    if src_crs == 'EPSG:3794' and yll >= 1_000_000:
        yll -= 5_000_000
        print(f'  y pretvorjen iz UTM oblike: {yll_orig} -> {yll}')

    valid = data[data != nodata]
    print(f'  Razpon vrednosti: {valid.min():.4f} - {valid.max():.4f}')

    vmax = args.vmax
    rdeca = args.rdeca
    if vmax is None:
        vmax = float(np.percentile(valid, 95)) if valid.size else 1.0
        vmax = max(vmax, 1e-9)
    if rdeca is None:
        rdeca = 0.8 * vmax
    print(f'  Barvna lestvica: vmax={vmax:.4g}, rdeča pri={rdeca:.4g}')

    tr = Transformer.from_crs(src_crs, 'EPSG:3857', always_xy=True)
    mzahod, mjug = tr.transform(xll, yll)
    mvzhod, msever = tr.transform(xll + ncols * cs, yll + nrows * cs)
    rob = MARGIN_DEGREES * 111000

    x_sred = np.linspace(xll + cs / 2, xll + ncols * cs - cs / 2, ncols)
    y_sred = np.linspace(yll + cs / 2, yll + nrows * cs - cs / 2, nrows)
    data = np.flipud(data)  # prva vrstica ASCII = sever
    X, Y = np.meshgrid(x_sred, y_sred)
    Xm, Ym = tr.transform(X, Y)

    maskirano = np.ma.masked_where((data == nodata) | (data < args.min_konc),
                                   data)

    postaje = [(0, '#0000FF'), (rdeca * 0.14, '#006400'),
               (rdeca * 0.28, '#00FF00'), (rdeca * 0.42, '#FFFF00'),
               (rdeca * 0.8, '#FFA500'), (rdeca, '#FF0000')]
    barve, pozicije = [], []
    for v, b in postaje:
        if v <= vmax:
            pozicije.append(v / vmax)
            barve.append(b)
    if pozicije[-1] < 1.0:
        pozicije.append(1.0)
        barve.append('#FF0000')
    cmap = LinearSegmentedColormap.from_list('konc',
                                             list(zip(pozicije, barve)),
                                             N=256)

    fig, ax = plt.subplots(figsize=FIGURE_SIZE, dpi=args.dpi)
    ax.set_xlim(mzahod - rob, mvzhod + rob)
    ax.set_ylim(mjug - rob, msever + rob)
    ax.set_aspect('equal')
    print('  Nalagam podlago (OpenTopoMap) ...')
    ctx.add_basemap(ax, crs='EPSG:3857', source=MAP_PROVIDER,
                    zoom='auto', attribution=False)
    im = ax.pcolormesh(Xm, Ym, maskirano, cmap=cmap, alpha=args.alfa,
                       vmin=args.vmin, vmax=vmax, shading='auto')
    cbar = plt.colorbar(im, ax=ax, fraction=0.023, pad=0.04, shrink=0.5)
    cbar.ax.tick_params(labelsize=COLORBAR_LABELSIZE)
    cbar.ax.set_title(args.enota, fontsize=COLORBAR_LABELSIZE + 5, pad=15)
    if SHOW_BOUNDARY:
        ax.add_patch(mpatches.Rectangle((mzahod, mjug), mvzhod - mzahod,
                                        msever - mjug, linewidth=BOUNDARY_WIDTH,
                                        edgecolor=BOUNDARY_COLOR,
                                        facecolor='none', zorder=10))
    ax.set_xticks([])
    ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)
    plt.tight_layout()
    plt.savefig(izhod_pot, dpi=args.dpi, bbox_inches='tight', pad_inches=0.1)
    plt.close(fig)
    print(f'  Shranjeno: {izhod_pot}')


if __name__ == '__main__':
    main()
