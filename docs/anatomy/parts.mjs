// Geometry for the underwriting bench. Every function takes the projection P and returns SVG text.
// The same file is used by build.mjs (first frame) and inlined into the page (live frames).
import * as k from "./kit/iso-kit.mjs";

export const W = {
  PLATE: { x: -200, y: -96, w: 408, d: 180, r: 9 },
  PLATE_H: 12,
  FOOT_H: 5,
  YT: -34,
  YL: 8,
  BM: { x0: -150, x1: 80, w: 20 },
  CARD: { w: 24, d: 15 },
  RACK: { x: -178, y: -58, w: 48, d: 70, r: 3 },
  G: [
    { key: "q", cx: -40, cy: 62, R: 16, z: 15, h: 7, label: "quality" },
    { key: "s", cx: 14, cy: 62, R: 16, z: 15, h: 7, label: "suff" },
    { key: "c", cx: 68, cy: 62, R: 16, z: 15, h: 7, label: "comp" },
  ],
  A0: -0.75 * Math.PI,
  SPAN: 1.5 * Math.PI,
  SAME: [120, 62],
};

const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const at = (P, p) => k.iso(p, P);
const opaque = (svg, op) => (op >= 0.999 ? svg : `<g opacity="${Math.max(0, op).toFixed(3)}">${svg}</g>`);

export function plate(P) {
  const { PLATE, PLATE_H, FOOT_H } = W;
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = [...k.corners(PLATE, 22), [0, PLATE.y + 22], [0, PLATE.y + PLATE.d - 22]];
  for (const [x, y] of [...feet].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const corner = k.corners(PLATE, 10);
  out.push(L(corner.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(corner.map(([x, y]) => at(P, [x, y, 0])), { size: 0.5 }));
  return out.join("");
}

export function belt(P, y, b) {
  const out = [];
  const plan = { x: b.x0, y: y - b.w / 2, w: b.x1 - b.x0, d: b.w, r: 2 };
  out.push(S(k.slabOf(plan, 0, 1.6, P, 4, 0.4), { tone: "mid" }));
  out.push(L(k.lineOnTop([b.x0, y - 6.5], [b.x1, y - 6.5], 1.6, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([b.x0, y + 6.5], [b.x1, y + 6.5], 1.6, P), { tone: "faint" }));
  out.push(L(k.topTicks(b.x0 + 4, b.x1 - 4, 6, 4, y - 9.2, 1.6, [1.2, 2.2], P).minor, { tone: "lo" }));
  out.push(D([at(P, [b.x0 + 2.6, y, 1.6]), at(P, [b.x1 - 2.6, y, 1.6])], { size: 0.45 }));
  return out.join("");
}

// gantry arch over one belt (or several): posts at y0 and y1, beam on top
export function archBack(P, x, y0) { return S(k.slabOf({ x: x - 6, y: y0 - 3, w: 12, d: 6, r: 1.2 }, 0, 24, P, 3, 0.5), { tone: "mid" }); }
export function archFront(P, x, y1) { return S(k.slabOf({ x: x - 6, y: y1 - 3, w: 12, d: 6, r: 1.2 }, 0, 24, P, 3, 0.5), { tone: "mid" }); }
export function archTop(P, x, y0, y1, label) {
  const plan = { x: x - 7, y: y0 - 3, w: 14, d: y1 - y0 + 6, r: 1.8 };
  const out = [S(k.slabOf(plan, 24, 7, P, 4, 0.5), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 2), 31, P, 4), { tone: "faint" }));
  if (label) out.push(k.faceTextSvg(k.topMatrix([x + 1.6, y1 - 1], 31, P, "y"), label, { size: 3, tone: "mid" }));
  return out.join("");
}

export function head(P, x, y, press) {
  const out = [];
  const z = -4 * press;
  out.push(S(k.cylinder(x, y, 2.2, 12 + z, 12 - z, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 6.5, 6 + z, 6, P, 28, 0.5), { tone: "hi", lit: true }));
  out.push(L(k.knurl(x, y, 6.5, 6 + z, 12 + z, 20, P), { tone: "lo" }));
  return out.join("");
}

export function slip(P, x, y, bars, op = 1, z = 1.6, lit = true) {
  if (op <= 0.003) return "";
  const { w, d } = W.CARD;
  const plan = { x: x - w / 2, y: y - d / 2, w, d, r: 1.2 };
  const out = [S(k.slabOf(plan, z, 1.2, P, 4, 0.3), { tone: "hi", lit, crease: "lo" })];
  bars.forEach((f, i) => out.push(L(k.lineOnTop([x - w / 2 + 2.4, y - d / 2 + 3.6 + i * 3.8], [x - w / 2 + 2.4 + (w - 5) * f, y - d / 2 + 3.6 + i * 3.8], z + 1.2, P), { tone: "lo", free: true })));
  return opaque(out.join(""), op);
}

export function gauge(P, g) {
  const { cx: x, cy: y, R, z: Z, h: H } = g;
  const { A0, SPAN } = W;
  const top = Z + H;
  const out = [];
  const foot = { x: x - 13, y: y - 13, w: 26, d: 26, r: 3 };
  out.push(S(k.slabOf(foot, 0, 4, P, 5, 0.6), { tone: "mid" }));
  out.push(D(k.corners(foot, 3).map(([a, b]) => at(P, [a, b, 4])), { size: 0.4 }));
  out.push(S(k.cylinder(x, y, 3.4, 4, Z - 4, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, R, Z, H, P, 48, 0.7), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, R, top - 3, top, 56, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, R - 2, top, P, 48), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, R - 2.6, 40, 5, top, [1.2, 2.5], P, A0, SPAN);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.5, top, P, 16), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 8.2], top, P, "x"), g.label, { size: 3, tone: "mid", anchor: "middle" }));
  return out.join("");
}
export function needleD(P, g, v) {
  const { cx: x, cy: y, R, z: Z, h: H } = g;
  const a = W.A0 + W.SPAN * v;
  return k.lineOnTop([x - Math.sin(a) * 3, y + Math.cos(a) * 3], [x + Math.sin(a) * (R - 4), y - Math.cos(a) * (R - 4)], Z + H + 0.2, P);
}



export const beltT = (P) => belt(P, W.YT, W.BM);
export const beltL = (P) => belt(P, W.YL, W.BM);

// the circuit rack: six pegs in a 2 by 3 grid that light up as each head is cited
export function rack(P, lit) {
  const { RACK } = W;
  const out = [`<path class="iso-halo" d="${k.haloOf(RACK, 0, 6, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.slabOf(RACK, 0, 6, P, 5, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(RACK, 2.4), 6, P, 4), { tone: "faint" }));
  for (let i = 0; i < 6; i++) {
    const x = RACK.x + 12 + (i % 2) * 24;
    const y = RACK.y + 12 + Math.floor(i / 2) * 23;
    const on = lit[i];
    out.push(S(k.cylinder(x, y, 5.2, 6, 3 + 8 * on, P, 18), { tone: on > 0.5 ? "hi" : "mid", lit: on > 0.5 }));
  }
  out.push(k.faceTextSvg(k.topMatrix([RACK.x + 4, RACK.y + RACK.d - 3], 6, P, "x"), "6 heads", { size: 3.6, tone: "mid" }));
  return out.join("");
}
export function same(P, on) {
  const [x, y] = W.SAME;
  const out = [S(k.cylinder(x, y, 4, 0, 2.4 + 2.4 * on, P, 18), { tone: on > 0.5 ? "hi" : "mid", lit: on > 0.5 })];
  out.push(L(k.ring(x, y, 6, 0, P, 18), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([x - 10, y + 14], 0, P, "x"), "unchanged", { size: 3.2, tone: "mid" }));
  return out.join("");
}
