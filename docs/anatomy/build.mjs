// Builds the interactive thesis bench: node build.mjs [--light]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import { kitScript } from "./scripts/inline-kit.mjs";
import * as rig from "./rig.mjs";
import * as g from "./parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 820;
const HEIGHT = 400;
const { W } = g;
const { X, YT, YL } = rig;
const REST = 0.975;

const P = k.fitProjection(
  [...k.boxCorners(W.PLATE, -17, 0), [-36, YT, 36], [68, 62, 28], [-178, -58, 16]],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 62 },
);

const BARS_T = [0.9, 0.5, 0.7];
const BARS_L = [0.95, 0.9, 0.85];
const val = (p) => ({ q: p.quality, s: p.suff, c: p.comp });
const slips = (p) =>
  (p.t.shown ? g.slip(P, p.t.x, YT, BARS_T, p.fade) : "") + (p.l.shown ? g.slip(P, p.l.x, YL, BARS_L, p.fade) : "");
const heads = (p) => g.head(P, X.press, YT, p.pressT) + g.head(P, X.press, YL, p.pressL);

function scene(u) {
  const p = rig.pose(u);
  const v = val(p);
  return [
    g.plate(P),
    g.beltT(P),
    g.beltL(P),
    `<g data-part="rack">${g.rack(P, p.lit)}</g>`,
    g.archBack(P, X.press, YT - 17),
    g.archBack(P, X.press, YL - 17),
    `<g data-part="slips">${slips(p)}</g>`,
    `<g data-part="heads">${heads(p)}</g>`,
    g.archTop(P, X.press, YT - 17, YT + 17, "template"),
    g.archTop(P, X.press, YL - 17, YL + 17, "LLM"),
    g.archFront(P, X.press, YT + 17),
    g.archFront(P, X.press, YL + 17),
    `<g data-part="same">${g.same(P, p.same)}</g>`,
    ...W.G.flatMap((gg) => [g.gauge(P, gg), `<path data-part="needle-${gg.key}" class="iso-line" data-tone="lit" data-free="start" d="${g.needleD(P, gg, v[gg.key])}" style="stroke-width:1"/>`]),
  ];
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A bench that shows the thesis finding that fluency is not faithfulness. A rack of six pegs stands for the six cited attention heads. A template press and an LLM press each turn the same circuit into an explanation slip. Three dials read the explanation quality, the sufficiency and the comprehensiveness. Quality moves from 60 percent for the template to 99 percent for the LLM, while sufficiency stays at 100 percent and comprehensiveness at 22 percent.",
  body: scene(REST),
});

const strip = (file) => readFileSync(join(HERE, file), "utf8").replace(/^export /gm, "").replace(/^import .*$/gm, "");
const kitNames = Object.keys(k).join(", ");

const live = `
const P = ${JSON.stringify(P)};
const REST = ${REST};
const BARS_T = ${JSON.stringify(BARS_T)}, BARS_L = ${JSON.stringify(BARS_L)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const E = { rack: part("rack"), slips: part("slips"), heads: part("heads"), same: part("same"), needles: Object.fromEntries(W.G.map((gg) => [gg.key, part("needle-" + gg.key)])) };
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const cache = {};
const put = (key, node, html) => { if (cache[key] !== html) { cache[key] = html; node.innerHTML = html; } };
const q4 = (v) => Math.round(v * 4) / 4;
const q20 = (v) => Math.round(v * 20) / 20;
const q8 = (v) => Math.round(v * 8) / 8;
let u = still.matches ? REST : 0, target = u, touring = !still.matches, frame = 0, last = 0, visible = false, idleTimer = 0;

function render() {
  const p = pose(u);
  put("rack", E.rack, rack(P, p.lit.map(q20)));
  put("slips", E.slips, (p.t.shown ? slip(P, q4(p.t.x), YT, BARS_T, q20(p.fade)) : "") + (p.l.shown ? slip(P, q4(p.l.x), YL, BARS_L, q20(p.fade)) : ""));
  put("heads", E.heads, head(P, X.press, YT, q8(p.pressT)) + head(P, X.press, YL, q8(p.pressL)));
  put("same", E.same, same(P, q20(p.same)));
  const v = { q: p.quality, s: p.suff, c: p.comp };
  for (const gg of W.G) E.needles[gg.key].setAttribute("d", needleD(P, gg, v[gg.key]));
  const text = describe(u);
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(u * 100)));
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { u += dt / CYCLE; if (u >= 1) u -= 1; target = u; }
  else { u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.12)); if (Math.abs(target - u) < 0.0004) u = target; }
  render();
  frame = visible && (touring || u !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const hold = () => { touring = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; run(); }, 3600); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => { const box = svg.getBoundingClientRect(); target = clamp(((event.clientX - box.left) / box.width - 0.06) / 0.88, 0, 0.995); hold(); });
stage.addEventListener("pointerleave", () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; run(); }, 1200); });
stage.addEventListener("click", () => { u = target = 0; touring = !still.matches; if (still.matches) u = target = REST; clearTimeout(idleTimer); render(); run(); });
stage.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "ArrowRight" || key === "ArrowUp") target = clamp(target + 0.03, 0, 0.995);
  else if (key === "ArrowLeft" || key === "ArrowDown") target = clamp(target - 0.03, 0, 0.995);
  else if (key === "Home") target = 0;
  else if (key === "End") target = REST;
  else if (key === " " || key === "Enter") { event.preventDefault(); u = target = 0; touring = !still.matches; render(); run(); return; }
  else return;
  event.preventDefault();
  hold();
});
window.__set = (uu) => { u = target = uu; touring = false; render(); };
render();
`;

const phone = `<style>@media (max-width:560px){.iso-plate-corner[data-corner="hint"]{display:none}.iso-plate-corner[data-corner="readout"]{left:0;right:0;white-space:normal;text-align:right;font-size:9.5px;line-height:1.35}}</style>`;
const body = phone + k.plateHtml({
  fig: "Fig 1",
  title: "Thesis bench",
  hint: "Hover to scrub · click to replay",
  readout: rig.describe(REST),
  keys: [
    { mark: "lit", label: "Cited heads, explanation slips and dial needles" },
    { mark: "raised", label: "A rack of six heads, two generators, three dials" },
  ],
  caption:
    "The same six cited heads feed two explanation generators. The template generator scores 60% on explanation quality and the LLM generator scores 99%, but sufficiency (100%) and comprehensiveness (22.0%) do not move: fluency and faithfulness are independent axes. Readings are the thesis means for IOI on GPT-2 small (n = 50 for the main evaluation, n = 30 for the template versus LLM comparison); the slips and the order the heads light up are illustrative.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Thesis bench: hover to scrub, click to replay, arrow keys step" aria-valuemin="0" aria-valuemax="100" aria-valuenow="97">${svg}</div>`,
});

const script = kitScript() + `\nconst k = { ${kitNames} };\n` + strip("rig.mjs") + "\n" + strip("parts.mjs") + "\n" + live;
const file = theme === "light" ? "thesis-bench-light.html" : "thesis-bench.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Thesis bench", theme, body, script, width: 880 }));
console.log("wrote", file);
