# Content templates v1.1: Nadhem carousels, posts, stories, VAY carousels. One shared system.
import os, re, json
B = '/home/user/vaynora/brand'
OUT = '/tmp/claude-0/brand/tpl/html'; os.makedirs(OUT, exist_ok=True)
CR, SG, NI, BO, KW = '#8E1D20', '#C81E1E', '#0D0D0D', '#F4F1EC', '#E0262B'
E = open('/mnt/project-files/brand/src/emblem_path.txt').read().strip()
def emb(col, w): return f'<svg viewBox="0 0 1246 1418" style="width:{w}px;display:block"><path fill="{col}" fill-rule="evenodd" d="{E}"/></svg>'
def svgfile(name, w, style=''):
    s = open(f'{B}/v1.1/svg/{name}.svg').read()
    s = re.sub(r'width="[\d.]+" height="[\d.]+"', '', s, count=1)
    return f'<div style="width:{w}px;{style}">' + s.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ', 1) + '</div>'
def kw(t): return re.sub(r'\*(.+?)\*', r'<b class="k">\1</b>', t).replace('|', '<br>')

CSS = f'''@font-face{{font-family:C;src:url(file://{B}/fonts/Cairo-800.ttf);font-weight:800}}
@font-face{{font-family:C;src:url(file://{B}/fonts/Cairo-600.ttf);font-weight:600}}
*{{margin:0;padding:0;box-sizing:border-box}}body{{background:#000}}
#c{{position:relative;width:1080px;height:1350px;overflow:hidden;background:{NI};color:{BO};font-family:C;direction:rtl}}
#c.st{{height:1920px}}
.k{{color:{KW};font-weight:800}}
.bg{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.55) contrast(1.12) brightness(.82)}}
.ember{{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,#49080D 0%,#160606 45%,{NI} 80%)}}
.shade-t{{position:absolute;left:0;right:0;top:0;height:42%;background:linear-gradient({NI}EE,transparent)}}
.shade-b{{position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(transparent,{NI}F2 55%,{NI})}}
.hdr{{position:absolute;top:56px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:center}}
.brand{{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px;letter-spacing:.5px}}
.cnt{{direction:ltr;font-weight:600;font-size:24px;color:{BO};background:#ffffff14;border:1px solid #ffffff22;border-radius:999px;padding:4px 18px}}
.plate{{display:inline-block;background:{CR};color:{BO};font-weight:800;border-radius:10px;padding:2px 30px 10px;box-shadow:0 14px 40px #0008}}
.rule{{height:6px;background:{CR};border-radius:3px}}
.ftr{{position:absolute;bottom:52px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:26px;color:#B3B3B3}}
.ftr .h{{direction:ltr}}
.box{{width:46px;height:46px;border-radius:10px;background:{CR};display:flex;align-items:center;justify-content:center;flex:none}}
.box svg{{width:28px}}
.ttl{{font-weight:800;line-height:1.28}}
'''
CHECK = f'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="{BO}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def page(body, story=False):
    return f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div id="c" class="{"st" if story else ""}">{body}</div></body></html>'

def hdr_n(n=None):  # Nadhem / «حرب النفس» header
    c = f'<div class="cnt">{n}</div>' if n else '<div></div>'
    return f'<div class="hdr"><div class="brand">{emb(SG,38)}<span>حرب النفس</span></div>{c}</div>'
def ftr_n(swipe=True):
    return f'<div class="ftr"><span>{"اسحب ←" if swipe else ""}</span><span class="h">@nadhem_elaashek</span></div>'
def hdr_v(n=None):  # VAY header: serif wordmark
    c = f'<div class="cnt">{n}</div>' if n else '<div></div>'
    return f'<div class="hdr">{svgfile("wordmark-rule-bone",250)}{c}</div>'
def ftr_v(swipe=True):
    return f'<div class="ftr"><span>{"اسحب ←" if swipe else ""}</span><span class="h">@vaynora_</span></div>'
def vstrip():  # vertical serif wordmark strip (VAY signature)
    return f'<div style="position:absolute;left:30px;top:50%;transform:translateY(-50%) rotate(-90deg);transform-origin:center;width:0;height:0"><div style="position:absolute;left:-300px;top:-20px;width:600px;opacity:.55">{svgfile("wordmark-bone",600)}</div></div>'

T = {}
NAD = '/tmp/claude-0/brand/cv2/tool/cover-frame.jpg'
VAY = '/mnt/project-files/vay-system/carousel-02/src/{}.png'

# ---------- Nadhem carousel ----------
T['n1-cover-photo'] = page(f'''<img class="bg" src="file://{NAD}" style="object-position:50% 22%"><div class="shade-t"></div><div class="shade-b"></div>{hdr_n("1/7")}
<div style="position:absolute;right:64px;left:64px;bottom:190px;text-align:center"><div class="plate" style="font-size:54px;transform:rotate(-2deg);margin-bottom:34px">قصتي · الحلقة الأولى</div>
<div class="ttl" style="font-size:96px">{kw("قبل الحبس|كنت *ضايع*")}</div></div>{ftr_n()}''')
T['n2-cover-text'] = page(f'''<div class="ember"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);opacity:.07">{emb(SG,760)}</div>{hdr_n("1/7")}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px">
<div class="ttl" style="font-size:250px;line-height:1;color:{SG}">90</div><div class="ttl" style="font-size:92px;margin-top:-6px">يوم بلاش إباحية</div>
<div class="rule" style="width:220px;margin:40px 0 30px"></div><div style="font-weight:600;font-size:40px;color:#B3B3B3">شنوة يصير لمخك كل مرحلة</div></div>{ftr_n()}''')
T['n3-inner'] = page(f'''<div class="ember" style="opacity:.6"></div>{hdr_n("3/7")}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 96px">
<div class="ttl" style="font-size:150px;color:{CR};line-height:1">02</div><div class="rule" style="width:140px;margin:22px 0 40px"></div>
<div class="ttl" style="font-size:78px">{kw("الأسبوع الأول|*أصعب* حاجة")}</div>
<div style="font-weight:600;font-size:44px;line-height:1.6;color:#D6D6D6;margin-top:30px">مخك يطلب العادة القديمة. هذا مش ضعف، هذا مخك يتعلم من جديد. اصبر 7 أيام.</div></div>{ftr_n()}''')
items = ['صليت الفجر في وقتها', 'قريت صفحة قرآن', 'تمرين 20 دقيقة', 'نمت قبل 23:00', 'تليفون برا البيت قبل النوم']
lst = ''.join(f'<div style="display:flex;align-items:center;gap:26px;margin:22px 0"><div class="box">{CHECK}</div><span style="font-size:52px;font-weight:800">{i}</span></div>' for i in items)
T['n4-checklist'] = page(f'''<div class="ember" style="opacity:.5"></div>{hdr_n("4/7")}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 96px">
<div class="plate" style="font-size:56px;align-self:flex-start;margin-bottom:46px">روتين المحارب اليومي</div>{lst}</div>{ftr_n()}''')
T['n5-cta'] = page(f'''<div class="ember"></div>{hdr_n("7/7")}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 90px">
{emb(SG,170)}<div class="ttl" style="font-size:84px;margin-top:50px">{kw("تحب تبدا *معانا*؟")}</div>
<div style="font-weight:600;font-size:42px;color:#B3B3B3;margin:26px 0 54px">تحدي «حرب النفس» 21 يوم، مجاني، يبدا 1 نوفمبر</div>
<div class="plate" style="font-size:58px;padding:10px 50px 20px">اكتب «حرب» في التعليقات</div></div>{ftr_n(False)}''')

# ---------- Posts (single image, collab-ready) ----------
items2 = ['لا إباحية', 'لا سهر بلا فايدة', 'الصلاة في وقتها', 'النوم بكري', 'تمرين كل يوم', 'نص ساعة قرآن', 'لا تدخين']
lst2 = ''.join(f'<div style="display:flex;align-items:center;gap:20px;margin:13px 0"><div class="box" style="width:40px;height:40px">{CHECK}</div><span style="font-size:42px;font-weight:800">{i}</span></div>' for i in items2)
T['p1-challenge-post'] = page(f'''<img class="bg" src="file://{NAD}" style="object-position:30% 20%;width:70%;left:auto;right:0"><div style="position:absolute;inset:0;background:linear-gradient(270deg,transparent 20%,{NI}E8 52%,{NI} 70%)"></div>
<div style="position:absolute;top:70px;right:64px;left:64px;text-align:center"><div class="plate" style="font-size:62px">هل أنت مستعد لهذا التحدي؟</div></div>
<div style="position:absolute;left:70px;top:290px">{lst2}</div>
<div class="ftr"><div style="display:flex;gap:12px;align-items:center">{emb(SG,30)}<span>حرب النفس</span></div><span class="h">@nadhem_elaashek × @vaynora_</span></div>''')
T['p2-quote-post'] = page(f'''<div class="ember"></div><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 100px">
<div style="font-size:200px;line-height:.6;color:{CR};font-weight:800">"</div>
<div class="ttl" style="font-size:86px;margin-top:20px">{kw("الألم اللي ما|يكسرك، *يبنيك*")}</div>
<div class="rule" style="width:180px;margin:50px 0 34px"></div><div style="font-weight:600;font-size:36px;color:#B3B3B3">ناظم · اصنع من الألم قوة</div></div>
<div class="ftr" style="justify-content:center;gap:16px">{emb(SG,30)}<span class="h">@nadhem_elaashek</span></div>''')

# ---------- Stories (1080x1920) ----------
T['s1-story-tip'] = page(f'''<div class="ember"></div><div class="hdr" style="top:200px">{''}<div class="brand">{emb(SG,40)}<span>حرب النفس</span></div><div class="cnt">نصيحة اليوم</div></div>
<div style="position:absolute;top:470px;left:80px;right:80px"><div class="ttl" style="font-size:150px;color:{CR};line-height:1">07</div><div class="rule" style="width:140px;margin:24px 0 46px"></div>
<div class="ttl" style="font-size:84px">{kw("التليفون يبات|*برا* البيت")}</div>
<div style="font-weight:600;font-size:46px;line-height:1.6;color:#D6D6D6;margin-top:34px">أغلب السقطات تصير بعد نص الليل في الفرش. خرّج السبب، تخرج التجربة.</div></div>
<div style="position:absolute;left:80px;right:80px;top:1250px;height:230px;border:3px dashed #ffffff30;border-radius:18px;display:flex;align-items:center;justify-content:center;color:#5C5C5C;font-size:32px;font-weight:600">مكان الـ poll / سؤال</div>
<div style="position:absolute;bottom:240px;left:0;right:0;text-align:center"><div class="plate" style="font-size:52px">الرابط في البايو ↑</div><div style="margin-top:26px;font-weight:600;font-size:28px;color:#8A8A8A">من كتاب «معركة الخلوات»</div></div>''', story=True)
T['s2-story-day'] = page(f'''<img class="bg" src="file://{NAD}" style="object-position:50% 30%"><div class="shade-t" style="height:30%"></div><div class="shade-b" style="height:55%"></div>
<div class="hdr" style="top:200px"><div class="brand">{emb(SG,40)}<span>حرب النفس</span></div><div class="cnt">تحدي 21 يوم</div></div>
<div style="position:absolute;left:80px;right:80px;bottom:300px">
<div style="display:flex;align-items:baseline;gap:20px;direction:ltr;justify-content:flex-end"><span class="ttl" style="font-size:210px;line-height:1;color:{SG}">12</span><span class="ttl" style="font-size:70px;color:#B3B3B3">/ 21</span></div>
<div class="rule" style="margin:24px 0 30px"></div>
<div style="display:flex;justify-content:space-between;font-weight:800;font-size:46px;text-align:center">
<div>الفجر<div style="color:{KW}">✓</div></div><div>قرآن<div style="color:{KW}">صفحتين</div></div><div>تمرين<div style="color:{KW}">25 دقيقة</div></div><div>نظيف<div style="color:{KW}">12 يوم</div></div></div></div>
<div class="ftr" style="bottom:200px;justify-content:center"><span class="h">@nadhem_elaashek</span></div>''', story=True)

# ---------- VAY carousel ----------
T['v1-cover'] = page(f'''<img class="bg" src="file://{VAY.format(1)}" style="filter:none"><div class="shade-t"></div><div class="shade-b" style="height:48%"></div>{hdr_v("1/8")}{vstrip()}
<div style="position:absolute;left:90px;right:64px;bottom:170px;text-align:center"><div class="ttl" style="font-size:92px">{kw("لا أحد يسقط|*فجأة*")}</div>
<div style="font-weight:600;font-size:40px;color:#D6D6D6;margin-top:18px">السقوط سلّم من 7 درجات</div></div>{ftr_v()}''')
T['v2-inner'] = page(f'''<img src="file://{VAY.format(3)}" style="position:absolute;top:0;left:0;width:100%;height:62%;object-fit:cover"><div style="position:absolute;left:0;right:0;top:40%;height:22%;background:linear-gradient(transparent,{NI})"></div>{hdr_v("3/8")}
<div style="position:absolute;left:0;right:0;top:62%;height:5px;background:{CR}"></div>
<div style="position:absolute;top:66%;left:80px;right:80px;text-align:center"><div class="plate" style="font-size:40px;margin-bottom:24px">الدرجة 2</div>
<div class="ttl" style="font-size:72px">{kw("«غير نظرة وحدة»|*تفتح* الباب")}</div></div>{ftr_v()}''')
T['v3-cta'] = page(f'''<div class="ember"></div>{hdr_v("8/8")}
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 90px">
{svgfile("lockup-transparent-dark",420)}<div class="ttl" style="font-size:74px;margin-top:56px">{kw("الخطة الكاملة|في «معركة *الخلوات*»")}</div>
<div style="font-weight:600;font-size:40px;color:#B3B3B3;margin:24px 0 50px">90 يوم، خطوة بخطوة</div><div class="plate" style="font-size:54px;padding:10px 50px 20px">الرابط في البايو</div></div>{ftr_v(False)}''')

for k, v in T.items(): open(f'{OUT}/{k}.html', 'w').write(v)
print(list(T))
