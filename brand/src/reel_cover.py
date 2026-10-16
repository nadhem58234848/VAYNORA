#!/usr/bin/env python3
"""Reel cover generator, «حرب النفس» / VAYNORA identity (brand guide v1.0).
Usage:
  python3 reel_cover.py --video in.mp4 --title "علاش ربي حطّ فيك|*الشهوة*؟" [--time 3.2] [--badge "حلقة 1"] [--out cover.png]
Title: '|' = new line, *word* = red keyword (Red 400). Max ~3 short lines.
Without --time it auto-picks the sharpest, well-lit frame in the first 60% of the video.
Outputs cover.png (1080x1920) + cover-grid.png (the 3:4 center crop the profile grid shows) + cover-frame.jpg.
"""
import argparse, subprocess, os, sys, json, tempfile, html, re
from PIL import Image, ImageFilter, ImageStat
HERE=os.path.dirname(os.path.abspath(__file__)); BRAND=os.path.dirname(HERE)
NODE_PATH='/opt/node22/lib/node_modules'
def dur(v):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',v]).decode().strip())
ZOOM=1.0
GRADE='eq=saturation=0.5:contrast=1.15:brightness=-0.06:gamma=0.92,colorbalance=rs=0.08:gs=-0.03:bs=-0.04:rm=0.04,vignette=angle=PI/3.2'
def grab(v,t,out,grade=False):
    vf=f'scale={int(1080*ZOOM)}:{int(1920*ZOOM)}:force_original_aspect_ratio=increase,crop=1080:1920:(iw-1080)/2:(ih-1920)*0.30'+(','+GRADE if grade else '')
    subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{t:.2f}','-i',v,'-frames:v','1','-vf',vf,'-q:v','2',out],check=True)
def score(p):
    im=Image.open(p).convert('L').resize((270,480))
    center=im.crop((40,80,230,330))  # face area usually upper-middle
    sharp=ImageStat.Stat(center.filter(ImageFilter.FIND_EDGES)).var[0]
    bright=ImageStat.Stat(center).mean[0]
    pen=0 if 40<bright<200 else 400
    return sharp-pen
def pick(v,tmp):
    d=dur(v);best=(-1e9,0.5)
    n=24
    for i in range(n):
        t=0.4+i*(d*0.6-0.4)/n
        p=os.path.join(tmp,f'f{i}.jpg');grab(v,t,p);s=score(p)
        if s>best[0]:best=(s,t)
    return best[1]
def title_html(t):
    out=[]
    for line in t.split('|'):
        line=html.escape(line.strip())
        line=re.sub(r'\*(.+?)\*',r'<span class="r">\1</span>',line)
        out.append(line)
    return '<br>'.join(out)
def main():
    a=argparse.ArgumentParser();a.add_argument('--video',required=True);a.add_argument('--title',required=True)
    a.add_argument('--time',type=float);a.add_argument('--badge',default='');a.add_argument('--out',default='cover.png')
    a.add_argument('--size',type=int,default=0,help='title px (auto if 0)')
    a.add_argument('--zoom',type=float,default=1.12,help='punch-in on the face (1 = none)')
    a.add_argument('--no-grade',action='store_true',help='skip the dark brand color grade')
    a.add_argument('--candidates',type=int,default=0,help='only write a contact sheet of N candidate frames with their times')
    x=a.parse_args();tmp=tempfile.mkdtemp();os.makedirs(os.path.dirname(os.path.abspath(x.out)),exist_ok=True)
    if x.candidates:
        d=dur(x.video);ims=[];n=x.candidates
        from PIL import ImageDraw
        for i in range(n):
            t=0.4+i*(d*0.9-0.4)/max(n-1,1);p=os.path.join(tmp,f'k{i}.jpg');grab(x.video,t,p)
            im=Image.open(p).resize((270,480));ImageDraw.Draw(im).rectangle((0,0,110,40),fill='#C81E1E');ImageDraw.Draw(im).text((8,8),f'{t:.1f}s',fill='white',font_size=24);ims.append(im)
        cols=min(n,6);rows=(n+cols-1)//cols;sh=Image.new('RGB',(cols*280,rows*490),'#0A0A0A')
        for i,im in enumerate(ims):sh.paste(im,((i%cols)*280+5,(i//cols)*490+5))
        o=os.path.splitext(x.out)[0]+'-candidates.jpg';sh.save(o,quality=85);print(json.dumps({'candidates':o}));return
    global ZOOM
    t=x.time if x.time is not None else pick(x.video,tmp)
    ZOOM=x.zoom
    frame=os.path.splitext(x.out)[0]+'-frame.jpg';grab(x.video,t,frame,grade=not x.no_grade)
    lines=x.title.split('|');longest=max(len(re.sub(r'\*','',l)) for l in lines)
    size=x.size or max(84,min(132,int(1750/max(longest,8))))
    emb=open(os.path.join(HERE,'emblem_path.txt')).read()
    fonts=os.path.join(BRAND,'fonts')
    badge=f'<div class="badge">{html.escape(x.badge)}</div>' if x.badge else ''
    page=f'''<html><head><meta charset="utf-8"><style>
@font-face{{font-family:Cairo;font-weight:800;src:url(file://{fonts}/Cairo-800.ttf)}}
@font-face{{font-family:Cairo;font-weight:600;src:url(file://{fonts}/Cairo-600.ttf)}}
body{{margin:0}}#c{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#0A0A0A;font-family:Cairo;direction:rtl;color:#F4F1EC}}
#c img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}
.shade{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,10,.6) 0%,rgba(10,10,10,0) 26%,rgba(10,10,10,0) 42%,rgba(10,10,10,.78) 62%,rgba(10,10,10,.95) 100%)}}
.ember{{position:absolute;inset:0;background:radial-gradient(90% 40% at 50% 100%,rgba(73,8,13,.55),rgba(73,8,13,0) 70%)}}
.title{{position:absolute;right:76px;left:76px;bottom:420px;font-weight:800;font-size:{size}px;line-height:1.2;text-shadow:0 4px 24px rgba(0,0,0,.85),0 0 2px #000}}
.r{{color:#E0262B}}
.bar{{width:110px;height:10px;background:#C81E1E;margin-bottom:34px}}
.badge{{position:absolute;top:300px;right:76px;background:#C81E1E;border-radius:999px;padding:8px 34px;font-weight:800;font-size:42px}}
.sig{{position:absolute;bottom:300px;right:76px;display:flex;align-items:center;gap:20px;font-weight:600;font-size:32px;opacity:.9;direction:ltr}}
</style></head><body><div id="c"><img src="file://{os.path.abspath(frame)}"><div class="shade"></div><div class="ember"></div>{badge}
<div class="title"><div class="bar"></div>{title_html(x.title)}</div>
<div class="sig"><span>@nadhem_elaashek</span><svg viewBox="0 0 1246 1418" style="width:52px"><path fill="#C81E1E" fill-rule="evenodd" d="{emb}"/></svg></div></div></body></html>'''
    hp=os.path.join(tmp,'c.html');open(hp,'w').write(page)
    js=os.path.join(tmp,'r.js');open(js,'w').write('''const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('file://'+process.argv[2]);await p.waitForTimeout(700);await (await p.$('#c')).screenshot({path:process.argv[3]});await b.close();})();''')
    subprocess.run(['node',js,hp,os.path.abspath(x.out)],check=True,env={**os.environ,'NODE_PATH':NODE_PATH})
    im=Image.open(x.out);im.crop((0,240,1080,1680)).save(os.path.splitext(x.out)[0]+'-grid.png')
    print(json.dumps({'time':round(t,2),'out':x.out,'title_px':size}))
main()
