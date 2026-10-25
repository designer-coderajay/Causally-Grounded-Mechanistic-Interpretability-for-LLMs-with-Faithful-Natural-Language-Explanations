from xh import *
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import os
F = "caveat-latin-600-normal.woff2"

def six(c, x, y, off=False, color=BLACK):
    for i in range(6):
        cx, cy = x + (i % 3) * 56, y + (i // 3) * 56
        if off:
            c.rect(cx, cy, 38, 38, color=ORANGE, fill="#fff", sw=2.4)
        else:
            c.rect(cx, cy, 38, 38, color=RED if color == RED else BLACK, fill="#fbd9cf" if color == RED else "#fff", sw=3)

# 1. sufficient is not necessary
c = Canvas(71, F)
c.text(330, 230, "keep only these six heads", BLACK, 40, "middle")
six(c, 245, 280, color=RED)
c.text(330, 520, "the prediction survives: 100%", BLUE, 38, "middle")
c.xiaohei(690, 560, 1.0, look=0, hands=[(600, 400), (780, 400)])
c.text(1040, 230, "remove those six heads", BLACK, 40, "middle")
six(c, 955, 280, off=True)
c.text(1040, 520, "the prediction drops by only 22%", RED, 40, "middle")
c.text(1040, 575, "backup circuits carry the rest", BLUE, 34, "middle")
c.save("19-sufficient-not-necessary.svg")

# 2. fluent is not faithful
c = Canvas(72, F)
c.rect(190, 280, 280, 190, fill="#fff", rot=-2)
for i in range(3):
    c.line([(220, 330 + i * 44), (440, 332 + i * 44)], BLACK, 2.6)
c.text(330, 250, "template explanation", BLUE, 38, "middle")
c.text(330, 520, "quality 60%", BLACK, 44, "middle")
c.rect(900, 280, 280, 190, fill="#fff", rot=2)
for i in range(5):
    c.line([(930, 320 + i * 30), (1150, 322 + i * 30)], BLACK, 2.6)
c.text(1040, 250, "LLM explanation", BLUE, 38, "middle")
c.text(1040, 520, "quality 99%", BLACK, 44, "middle")
c.xiaohei(690, 540, 0.95, look=0, hands=[(560, 420), (820, 420)])
c.text(690, 650, "same circuit underneath: comprehensiveness still 22%", RED, 44, "middle")
c.text(690, 205, "a beautiful sentence is not a faithful one", BLACK, 40, "middle")
c.save("20-fluent-not-faithful.svg")

# 3. confidence tells you nothing
c = Canvas(73, F)
for x, n in [(380, "model confidence"), (1000, "explanation faithfulness")]:
    c.circle(x, 400, 120, BLACK, "#fff", 3.8)
    for t in range(11):
        a = -2.35 + t * 0.47
        c.line([(x + 98 * math.sin(a), 400 - 98 * math.cos(a)), (x + 114 * math.sin(a), 400 - 114 * math.cos(a))], BLACK, 2.6)
    c.text(x, 600, n, BLUE, 38, "middle")
c.line([(380, 400), (380 + 85 * math.sin(1.2), 400 - 85 * math.cos(1.2))], RED, 7)
c.line([(1000, 400), (1000 + 85 * math.sin(-0.9), 400 - 85 * math.cos(-0.9))], RED, 7)
c.xiaohei(690, 540, 0.9, look=0, hands=[(560, 430), (820, 430)])
c.text(690, 230, "r = 0.009", RED, 70, "middle")
c.text(690, 290, "the two dials move independently", BLACK, 38, "middle")
c.text(690, 690, "GPT-2 small, indirect object identification only", BLUE, 34, "middle")
c.save("21-confidence-no-shortcut.svg")
