# Content templates v1.2 (flat style, from Nadhem's reference slides 2026-10-16):
# flat black #0B0B0B with a red edge stripe, or a full red slide with black text. No gradients, no photo backgrounds.
import os, re
B = '/home/user/vaynora/brand'
OUT = '/tmp/claude-0/brand/tpl/html'; os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.remove(f'{OUT}/{f}')
RED, CR, BLK, BO, GR, LN = '#C81E1E', '#8E1D20', '#0B0B0B', '#F4F1EC', '#8A8A8A', '#333333'
E = open('/mnt/project-files/brand/src/emblem_path.txt').read().strip()
def emb(col, w): return f'<svg viewBox="0 0 1246 1418" style="width:{w}px;display:block"><path fill="{col}" fill-rule="evenodd" d="{E}"/></svg>'
def svgfile(name, w):
    s = open(f'{B}/v1.1/svg/{name}.svg').read()
    s = re.sub(r'width="[\d.]+" height="[\d.]+"', '', s, count=1)
    return f'<div style="width:{w}px">' + s.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ', 1) + '</div>'
def kw(t): return re.sub(r'\*(.+?)\*', r'<b class="k">\1</b>', t).replace('|', '<br>')

CSS = f'''@font-face{{font-family:C;src:url(file://{B}/fonts/Cairo-800.ttf);font-weight:800}}
@font-face{{font-family:C;src:url(file://{B}/fonts/Cairo-600.ttf);font-weight:600}}
*{{margin:0;padding:0;box-sizing:border-box}}body{{background:#000}}
#c{{position:relative;width:1080px;height:1350px;overflow:hidden;background:{BLK};color:{BO};font-family:C;direction:rtl}}
#c.st{{height:1920px}} #c.red{{background:{RED};color:{BLK}}}
.stripe{{position:absolute;top:0;bottom:0;right:0;width:12px;background:{RED}}}
.k{{color:{RED}}} .red .k{{color:{BO}}}
.top{{position:absolute;top:96px;left:96px;right:96px;display:flex;justify-content:space-between;align-items:center}}
.st .top{{top:220px}}
.brand{{display:flex;align-items:center;gap:14px;font-weight:800;font-size:40px}}
.cnt{{direction:ltr;font-weight:800;font-size:30px;color:#B3B3B3;border:2px solid #3A3A3A;border-radius:10px;padding:4px 20px}}
.red .cnt{{color:{BLK};border-color:{BLK}}}
.bot{{position:absolute;bottom:110px;left:96px;right:96px;display:flex;justify-content:space-between;align-items:center}}
.st .bot{{bottom:230px}}
.h{{direction:ltr;font-family:Arial,sans-serif;font-style:italic;font-size:32px;color:{GR}}} .red .h{{color:#5A0F0F}}
.dash{{display:flex;gap:10px;direction:ltr}} .dash i{{width:38px;height:5px;background:#3A3A3A;border-radius:2px}} .dash i.on{{background:{RED}}}
.red .dash i{{background:#8E1D20}} .red .dash i.on{{background:{BLK}}}
.mid{{position:absolute;left:110px;right:110px;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}}
.ttl{{font-weight:800;line-height:1.25}}
.body{{font-weight:600;font-size:46px;line-height:1.65;color:#D6D6D6}} .red .body{{color:{BLK}}}
.div{{width:620px;height:2px;background:{LN};margin:56px 0}}
.circ{{width:120px;height:120px;border:4px solid {RED};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:58px;color:{RED};margin-bottom:56px}}
.btn{{background:{BLK};color:{BO};border-radius:14px;padding:30px 54px;font-weight:800;font-size:50px;line-height:1.5}}
.plate{{display:inline-block;background:{RED};color:{BO};font-weight:800;border-radius:10px;padding:4px 30px 12px}}
.box{{width:48px;height:48px;border-radius:10px;background:{RED};display:flex;align-items:center;justify-content:center;flex:none}} .box svg{{width:30px}}
.card{{border-radius:16px;overflow:hidden;border:2px solid #262626}} .card img{{width:100%;height:100%;object-fit:cover;display:block}}
'''
CHECK = f'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="{BO}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
SAVE = f'<svg viewBox="0 0 150 150" style="width:150px;margin-bottom:60px"><circle cx="75" cy="75" r="71" fill="none" stroke="{BLK}" stroke-width="6"/><path d="M53 40h44v70L75 92 53 110z" fill="none" stroke="{BLK}" stroke-width="7" stroke-linejoin="round"/></svg>'

def page(body, story=False, red=False, stripe=True):
    cls = ' '.join(x for x in ['st' if story else '', 'red' if red else ''] if x)
    st = '' if (red or not stripe) else '<div class="stripe"></div>'
    return f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div id="c" class="{cls}">{st}{body}</div></body></html>'
def dashes(i, n): return '<div class="dash">' + ''.join(f'<i class="{"on" if k == i else ""}"></i>' for k in range(1, n + 1)) + '</div>'
def top(brand, cnt=None):
    return f'<div class="top"><div class="brand">{brand}</div>{f"<div class=cnt>{cnt}</div>" if cnt else "<div></div>"}</div>'
def bot(h, i=None, n=None): return f'<div class="bot"><span class="h">{h}</span>{dashes(i, n) if n else "<span></span>"}</div>'
NB = lambda red=False: f'{emb(BLK if red else RED, 44)}<span>حرب النفس</span>'
VB = lambda red=False: svgfile('wordmark-black' if red else 'wordmark-bone', 330)
NH, VH = '@nadhem_elaashek', '@vaynora_'

T = {}
NAD = '/tmp/claude-0/brand/cv2/tool/cover-frame.jpg'
VAY = '/mnt/project-files/vay-system/carousel-02/src/{}.png'

# ---------- Nadhem carousel ----------
T['n1-cover'] = page(f'''{top(NB(), "1/7")}<div class="mid"><div class="plate" style="font-size:44px;margin-bottom:46px">قصتي · الحلقة الأولى</div>
<div class="ttl" style="font-size:120px">{kw("قبل الحبس|كنت *ضايع*")}</div><div class="div" style="width:300px;margin:50px 0 34px"></div>
<div class="body" style="color:{GR}">اسحب ←</div></div>{bot(NH, 1, 7)}''')
T['n2-cover-number'] = page(f'''{top(NB(), "1/7")}<div class="mid"><div class="ttl" style="font-size:300px;line-height:1;color:{RED}">90</div>
<div class="ttl" style="font-size:100px">يوم بلاش إباحية</div><div class="div"></div><div class="body">شنوة يصير لمخك في كل مرحلة</div></div>{bot(NH, 1, 7)}''')
T['n3-inner'] = page(f'''{top(NB(), "3/7")}<div class="mid"><div class="circ">2</div><div class="ttl" style="font-size:110px">{kw("الأسبوع *الأول*")}</div>
<div class="body" style="margin-top:40px">مخك يطلب العادة القديمة.<br>هذا موش ضعف، هذا مخك يتعلم.</div><div class="div"></div>
<div class="ttl" style="font-size:58px;color:{RED}">اصبر 7 أيام… وتوّا تشوف.</div></div>{bot(NH, 3, 7)}''')
items = ['صليت الفجر في وقتها', 'قريت صفحة قرآن', 'تمرين 20 دقيقة', 'نمت قبل 23:00', 'التليفون برا البيت في الليل']
lst = ''.join(f'<div style="display:flex;align-items:center;gap:28px;margin:20px 0"><div class="box">{CHECK}</div><span style="font-size:52px;font-weight:800">{i}</span></div>' for i in items)
T['n4-checklist'] = page(f'''{top(NB(), "4/7")}<div class="mid" style="align-items:flex-start;text-align:right">
<div class="ttl" style="font-size:84px;margin-bottom:20px">{kw("روتين *المحارب*")}</div><div class="div" style="width:100%;margin:20px 0 34px"></div>{lst}</div>{bot(NH, 4, 7)}''')
T['n5-cta-red'] = page(f'''{top(NB(True), "7/7")}<div class="mid">{SAVE}<div class="ttl" style="font-size:92px">احفظ هذا البوست</div>
<div class="body" style="margin:30px 0 60px">وارجعلو كل نهار تحس روحك طحت.<br>الحرب ما تتربحش في نهار.</div>
<div class="btn">اكتب «حرب» في التعليقات<div style="font-size:38px;color:#B3B3B3">تحدي 21 يوم مجاني · 1 نوفمبر</div></div></div>{bot(NH, 7, 7)}''', red=True)

# ---------- Posts ----------
items2 = ['لا إباحية', 'لا سهر بلا فايدة', 'الصلاة في وقتها', 'النوم بكري', 'تمرين كل يوم', 'نص ساعة قرآن', 'لا تدخين']
lst2 = ''.join(f'<div style="display:flex;align-items:center;gap:22px;margin:14px 0"><div class="box" style="width:42px;height:42px">{CHECK}</div><span style="font-size:44px;font-weight:800">{i}</span></div>' for i in items2)
T['p1-challenge-post'] = page(f'''{top(NB())}
<div style="position:absolute;top:200px;left:96px;right:96px;text-align:center"><div class="ttl" style="font-size:80px">{kw("هل أنت *مستعد*|لهذا التحدي؟")}</div></div>
<div style="position:absolute;top:470px;right:96px">{lst2}</div>
<div class="card" style="position:absolute;top:470px;left:96px;width:380px;height:560px"><img src="file://{NAD}" style="object-position:40% 30%"></div>
{bot(NH + " × " + VH)}''')
T['p2-quote-red'] = page(f'''{top(NB(True))}<div class="mid"><div class="ttl" style="font-size:220px;line-height:.5;height:110px">"</div>
<div class="ttl" style="font-size:88px">{kw("الألم اللي ما يكسرك|*يبنيك*")}</div><div class="div" style="background:{BLK};width:240px"></div>
<div class="body" style="font-weight:800">اصنع من الألم قوة</div></div>{bot(NH)}''', red=True)

# ---------- Stories ----------
T['s1-story-tip'] = page(f'''{top(NB(), "نصيحة اليوم")}<div class="mid" style="bottom:260px"><div class="circ">7</div>
<div class="ttl" style="font-size:100px">{kw("التليفون يبات|*برا* البيت")}</div>
<div class="body" style="margin-top:40px">أغلب السقطات تصير بعد نص الليل.<br>خرّج السبب، تخرج التجربة.</div><div class="div"></div>
<div style="width:760px;height:220px;border:3px dashed #3A3A3A;border-radius:18px;display:flex;align-items:center;justify-content:center;color:#5C5C5C;font-size:32px;font-weight:600">مكان الـ poll / السؤال</div></div>
<div style="position:absolute;bottom:400px;left:0;right:0;text-align:center"><div class="plate" style="font-size:50px">الرابط في البايو ↑</div></div>{bot(NH)}''', story=True)
T['s2-story-day-red'] = page(f'''{top(NB(True), "تحدي 21 يوم")}<div class="mid"><div class="body" style="font-weight:800">اليوم</div>
<div style="direction:ltr;display:flex;align-items:baseline;gap:18px"><span class="ttl" style="font-size:340px;line-height:1">12</span><span class="ttl" style="font-size:90px;color:#5A0F0F">/21</span></div>
<div class="div" style="background:{BLK}"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:30px 90px;font-weight:800;font-size:48px;text-align:center">
<div>الفجر<div style="color:{BO}">✓</div></div><div>قرآن<div style="color:{BO}">صفحتين</div></div><div>تمرين<div style="color:{BO}">25 دقيقة</div></div><div>نظيف<div style="color:{BO}">12 يوم</div></div></div></div>{bot(NH)}''', story=True, red=True)

# ---------- VAY carousel ----------
T['v1-cover'] = page(f'''{top(VB(), "1/8")}<div class="card" style="position:absolute;top:210px;left:96px;right:96px;height:640px"><img src="file://{VAY.format(1)}"></div>
<div style="position:absolute;top:900px;left:96px;right:96px;text-align:center"><div class="ttl" style="font-size:92px">{kw("لا أحد يسقط *فجأة*")}</div>
<div class="body" style="color:{GR};margin-top:6px">السقوط سلّم من 7 درجات</div></div>{bot(VH, 1, 8)}''')
T['v2-inner'] = page(f'''{top(VB(), "3/8")}<div class="card" style="position:absolute;top:210px;left:96px;right:96px;height:520px"><img src="file://{VAY.format(3)}"></div>
<div style="position:absolute;top:770px;left:96px;right:96px;display:flex;flex-direction:column;align-items:center;text-align:center">
<div class="circ" style="width:96px;height:96px;font-size:46px;margin-bottom:24px">2</div><div class="ttl" style="font-size:76px">{kw("نظرة واحدة *تفتح* الباب")}</div></div>{bot(VH, 3, 8)}''')
T['v3-text'] = page(f'''{top(VB(), "6/8")}<div class="mid"><div class="circ">5</div><div class="ttl" style="font-size:120px">{kw("حرب *الكسل*")}</div>
<div class="body" style="margin-top:40px">الأحلام لا تحترم من ينام كثيرًا<br>ويتكلم أكثر مما يعمل.</div><div class="div"></div>
<div class="ttl" style="font-size:62px;color:{RED}">ابدأ صغيرًا… لكن ابدأ اليوم.</div></div>{bot(VH, 6, 8)}''')
T['v4-save-red'] = page(f'''{top(VB(True), "8/8")}<div class="mid">{SAVE}<div class="ttl" style="font-size:92px">احفظ هذا المنشور</div>
<div class="body" style="margin:30px 0 60px">وارجع له كل يوم تخسر فيه معركة.<br>الحرب لا تُربح في يوم واحد.</div>
<div class="btn">انضم إلى مجتمع VAYNORA<div style="font-size:40px;direction:ltr">@vaynora_</div></div></div>{bot(VH, 8, 8)}''', red=True)

for k, v in T.items(): open(f'{OUT}/{k}.html', 'w').write(v)
print(list(T))
