# Illustration sources

The three images one level up are drawn by `thesis.py` with the small kit in `xh.py` (wobbly black lines, a black creature with white dot eyes, orange for the path, red for the key point, blue for side notes). They are hand-authored vector drawings, not AI-generated art.

```bash
python3 thesis.py                                                          # writes 19-sufficient-not-necessary.svg, 20-fluent-not-faithful.svg, 21-confidence-no-shortcut.svg
node render.js 19-sufficient-not-necessary 20-fluent-not-faithful 21-confidence-no-shortcut   # needs playwright with Chromium; writes the PNGs
```

The lettering font is Caveat (SIL Open Font License 1.1), embedded in each SVG from `caveat-latin-600-normal.woff2`.

The drawings show no measured data. The numbers in them (100%, 22%, 60%, 99%, r = 0.009) are the thesis means stated in the main README; the dial positions and the grids are illustrative. The scope is GPT-2 small on indirect object identification only.
