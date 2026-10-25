# Thesis bench: the interactive figure

An isometric, interactive drawing of the thesis finding that fluency is not faithfulness, built with the [Anatomy](https://github.com/wheresryan22/anatomy) Agent Skill by Ryan (MIT). A rack of six pegs stands for the six cited attention heads. A template press and an LLM press each turn the same circuit into an explanation slip, and three dials read explanation quality, sufficiency and comprehensiveness.

| File | What it is |
|---|---|
| `thesis-bench-light.html` | The figure, light theme. Standalone: open it in a browser. |
| `thesis-bench.html` | The same figure, dark theme. |
| `thesis-bench.gif` | A recording of one full cycle, used in the main README. |
| `thesis-bench.png` | A still of the finished state. |
| `rig.mjs` | The model: the thesis readings and the timeline. |
| `parts.mjs` | The geometry of every part, shared by the build and the live page. |
| `build.mjs` | Writes the HTML pages. |
| `kit/`, `scripts/` | The Anatomy drawing kit and its capture and line-check scripts, copied unchanged. `LICENSE-anatomy` is its licence. |

## Use it

Hover to scrub through the cycle, click or press Space or Enter to replay, arrow keys to step, Home and End to jump. The figure tours by itself when left alone and shows one still frame under reduced motion.

```bash
node build.mjs --light   # writes thesis-bench-light.html  (Node 20.10 or later, nothing to install)
node build.mjs           # writes thesis-bench.html
node scripts/lines.mjs thesis-bench-light.html --reduced   # every drawn line must end on something (needs Chrome; set CHROME_PATH)
```

## What is real and what is drawn

Real, from the thesis numbers in the main README (IOI on GPT-2 small): six cited heads, sufficiency 100.0%, comprehensiveness 22.0%, explanation quality 60% for the template generator and 99% for the LLM generator.

Drawn for the picture: the slips and the order in which the heads light up. The figure makes no new measurement and the scope is the thesis scope: one model, one task.
