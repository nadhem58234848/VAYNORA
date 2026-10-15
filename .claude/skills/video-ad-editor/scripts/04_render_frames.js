/* يركّب الفيديو + الموشن قرافيكس ويطلع فريمات — بالدقة والإطارات من output.json.
   node 04_render_frames.js <workdir> all                       ← يكمّل من وين وقف (يتخطّى الموجود)
   node 04_render_frames.js <workdir> all --force               ← يعيد الرسم من الصفر
   node 04_render_frames.js <workdir> range 12.0 18.5           ← يعيد رسم نافذة وحدة بس (بعد تعديل مشهد)
   node 04_render_frames.js <workdir> preview 4.6 12.3 31.0
   --workers 4   ← عدد الرسّامين بالتوازي (الافتراضي حسب المعالج — 4K 60 يستفيد منه كثير) */
const path=require('path'), fs=require('fs'), os=require('os');
const C=require('./_common.js');
const W=path.resolve(process.argv[2])+path.sep;
const P=C.profile(W), FPS=P.fps, SCALE=P.scale||1;
const CFG=JSON.parse(fs.readFileSync(W+'sfx.json','utf8'));       // فيه outro
const THEME=C.readJSON(W+'theme.json',{});
const BEHIND=C.readJSON(W+'behind.json',null);                    // الكلام ورا الشخص
const OUT_D=CFG.outro;
const argv=process.argv, wi=argv.indexOf('--workers');
const WORKERS=Math.max(1, wi>0?parseInt(argv[wi+1],10):Math.min(6,Math.max(1,Math.floor(os.cpus().length/3))));

(async()=>{
  const puppeteer=C.resolvePuppeteer();
  const mode=argv[3]||'all';
  const caps=JSON.parse(fs.readFileSync(W+'caps.json','utf8'));
  const NVF=fs.readdirSync(W+'vfr').filter(f=>f.endsWith('.jpg')).length;
  const dur=caps.total+OUT_D;
  const b=await puppeteer.launch({executablePath:C.chromePath(),headless:'new',protocolTimeout:600000,
    args:['--no-sandbox','--allow-file-access-from-files','--font-render-hinting=none','--force-color-profile=srgb']});
  const data={cards:caps.cards,total:caps.total,outro:OUT_D,theme:THEME,behind:BEHIND,
              scale:SCALE,fps:FPS,assets:C.assetList(W),broll:C.brollList(W),events:C.readJSON(W+'events.json',null)};
  const FF=THEME.font||'Cairo';

  async function page(){
    const p=await b.newPage();
    p.on('pageerror',e=>console.log('PAGEERR',e.message));
    await p.setViewport({width:1080,height:1920,deviceScaleFactor:1});
    await p.setCacheEnabled(false);   // لا تقرأ نسخة مخبّأة من compose.html
    await p.goto(C.fileURL(W+'compose.html'),{waitUntil:'networkidle0',timeout:120000});
    await p.evaluate(f=>Promise.all([document.fonts.load('900 100px '+f),
      document.fonts.load('700 40px '+f),document.fonts.load('800 55px '+f)]).then(()=>document.fonts.ready),FF);
    await p.evaluate(()=>new Promise(r=>{const l=document.getElementById('LOGO');if(!l||l.complete)return r();l.onload=l.onerror=r;}));
    await p.evaluate(d=>window.init(d),data);
    return p;
  }
  const grab=async(p,t,file,q)=>{
    const i=Math.min(NVF,Math.max(1,Math.round(t*FPS)+1));
    const id=String(i).padStart(5,'0');
    const a={t,q,vf:C.fileURL(W+'vfr/'+id+'.jpg'),behind:!!BEHIND,ps:null,face:null};
    if(BEHIND){                                   // صورة الشخص المقصوص لهالفريم (إن وُجدت)
      const inR=BEHIND.ranges.some(r=>i>=r[0]&&i<=r[1]);
      const pf=W+'bt/person/'+id+'.png';
      if(inR&&fs.existsSync(pf)) a.ps=C.fileURL(pf);
      a.face=(BEHIND.faces&&BEHIND.faces[i])||null;
    }
    const d=await p.evaluate(async a=>{
      await window.setFrame(a.vf);
      if(a.behind&&window.setPerson) await window.setPerson(a.ps,a.face);
      if(window.needs&&window.loadDyn) await window.loadDyn(window.needs(a.t));   // فريمات بي-رول لهاللحظة
      window.draw(a.t); return window.shot(a.q);
    },a);
    fs.writeFileSync(file,Buffer.from(d.split(',')[1],'base64'));
  };
  console.log(`الرسم: ${P.w}×${P.h} · ${FPS} إطار · ${WORKERS} رسّام`);

  if(mode==='preview'){
    const p=await page();
    fs.mkdirSync(W+'prev',{recursive:true});
    for(const t of argv.slice(4).filter(x=>!isNaN(parseFloat(x))).map(Number)){
      await grab(p,t,W+'prev/t'+t.toFixed(2)+'.jpg',0.9);console.log('معاينة',t);}
  }else{
    fs.mkdirSync(W+'out',{recursive:true});
    const n=Math.round(dur*FPS);
    const force=argv.includes('--force');
    let i0=0,i1=n;                       // نافذة زمنية اختيارية — تُعاد كتابتها دائماً
    if(mode==='range'){
      const a=Number(argv[4]), c=Number(argv[5]);
      if(!isFinite(a)||!isFinite(c)) throw new Error('range يحتاج وقتين: <من> <إلى>');
      i0=Math.max(0,Math.floor(a*FPS)); i1=Math.min(n,Math.ceil(c*FPS)+1);
    }
    const done=f=>{try{return fs.statSync(f).size>2000;}catch(e){return false;}};
    const todo=[];let skipped=0;
    for(let i=i0;i<i1;i++){
      const f=W+'out/'+String(i).padStart(5,'0')+'.jpg';
      if(mode==='all'&&!force&&done(f)){skipped++;continue;}
      todo.push(i);
    }
    const t0=Date.now();let drawn=0,next=0;
    const nw=Math.min(WORKERS,Math.max(1,todo.length));
    await Promise.all(Array.from({length:nw},async()=>{
      const p=await page();
      while(next<todo.length){
        const i=todo[next++];
        await grab(p,i/FPS,W+'out/'+String(i).padStart(5,'0')+'.jpg',0.95); drawn++;
        if(drawn%300===0){const s=(Date.now()-t0)/1000, left=(todo.length-drawn)*s/drawn;
          console.log(`فريم ${drawn}/${todo.length} — باقي تقريباً ${Math.ceil(left/60)} دقيقة`);}
      }
      await p.close();
    }));
    if(skipped)console.log('تخطّى',skipped,'فريماً جاهزاً (استئناف) — --force يعيد الكل');
    console.log('تم',drawn,'فريم مرسوم من',n,'— المدة',dur.toFixed(3),`— ${Math.round((Date.now()-t0)/1000)} ثانية`);
    if(mode!=='range'){                  // ناقص فريم = تجميع مكسور، لازم ينكشف الحين
      let miss=0; for(let i=0;i<n;i++) if(!done(W+'out/'+String(i).padStart(5,'0')+'.jpg')) miss++;
      if(miss)console.log('⚠️ ناقص',miss,'فريماً — أعد التشغيل قبل 06_encode.sh');
    }
  }
  await b.close();
})().catch(e=>{console.error('❌',e.message);process.exit(1);});
