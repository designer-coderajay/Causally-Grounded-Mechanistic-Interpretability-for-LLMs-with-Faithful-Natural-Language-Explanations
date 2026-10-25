// The model behind the figure. Pure functions: the geometry, the motion and the readout all read from here.
// Real, from the thesis numbers in the README (IOI on GPT-2 small, n = 50 and n = 30): six cited heads, sufficiency
// 100.0%, comprehensiveness 22.0%, explanation quality 60% for the template generator and 99% for the LLM generator.
// Illustrative: the slips and which rack pegs light in which order.

export const SUFF = 1.0;
export const COMP = 0.22;
export const Q_TEMPLATE = 0.6;
export const Q_LLM = 0.99;
export const CYCLE = 30;
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const seg = (u, a, b) => clamp((u - a) / (b - a));
export const ease = (t) => t * t * (3 - 2 * t);
export const wave = (u, a, b) => Math.sin(Math.PI * seg(u, a, b));

export const X = { start: -128, press: -36, slot: 56 };
export const YT = -34; // template lane
export const YL = 8; // LLM lane
export const T = {
  rack: [0.02, 0.16],
  tIn: [0.16, 0.24],
  tPress: [0.24, 0.32],
  tOut: [0.32, 0.4],
  tRead: [0.4, 0.5],
  lIn: [0.5, 0.57],
  lPress: [0.57, 0.65],
  lOut: [0.65, 0.73],
  lRead: [0.73, 0.83],
  same: [0.83, 0.92],
  fade: [0.985, 1.0],
};

export function pose(u) {
  const fade = 1 - seg(u, T.fade[0], T.fade[1]);
  const lit = Array.from({ length: 6 }, (_, i) => ease(clamp(seg(u, ...T.rack) * 7 - i, 0, 1)));
  const tx = u < T.tIn[1] ? X.start + (X.press - X.start) * ease(seg(u, ...T.tIn)) : u < T.tOut[0] ? X.press : X.press + (X.slot - X.press) * ease(seg(u, ...T.tOut));
  const lx = u < T.lIn[1] ? X.start + (X.press - X.start) * ease(seg(u, ...T.lIn)) : u < T.lOut[0] ? X.press : X.press + (X.slot - X.press) * ease(seg(u, ...T.lOut));
  const q = u < T.lRead[0] ? Q_TEMPLATE * ease(seg(u, ...T.tRead)) : Q_TEMPLATE + (Q_LLM - Q_TEMPLATE) * ease(seg(u, ...T.lRead));
  const faith = ease(seg(u, ...T.tRead));
  return {
    u,
    fade,
    lit,
    t: { shown: u >= T.tIn[0], x: tx },
    l: { shown: u >= T.lIn[0], x: lx },
    pressT: wave(u, ...T.tPress),
    pressL: wave(u, ...T.lPress),
    quality: q,
    suff: SUFF * faith,
    comp: COMP * faith,
    same: seg(u, T.same[0], T.same[0] + 0.03) * (1 - seg(u, T.same[1] - 0.02, T.same[1])),
  };
}

export function describe(u) {
  const p = pose(u);
  if (u < T.tIn[0]) return "the cited heads: six of them, the same for every generator";
  if (u < T.lIn[0]) return `template explanation: quality ${(p.quality * 100).toFixed(0)}%, comprehensiveness ${(p.comp * 100).toFixed(0)}%`;
  if (u < T.same[0]) return `LLM explanation: quality ${(p.quality * 100).toFixed(0)}%`;
  if (u < T.fade[0]) return "quality moved from 60% to 99%; sufficiency and comprehensiveness did not";
  return "ready for the next prompt";
}
