/* مشترك بين سكربتات الرسم: إيجاد كروم على أي نظام · إعدادات الإخراج · روابط الملفات · الأصول */
const path=require('path'), fs=require('fs'), url=require('url');

/* puppeteer-core: ينزل مرة وحدة بمجلد ثابت (~/.video-ad-editor) فيشتغل من أي مجلد شغل */
const TOOLS=path.join(require('os').homedir(),'.video-ad-editor');
function resolvePuppeteer(){
  let g=null; try{ g=require('child_process').execSync('npm root -g',{stdio:['ignore','pipe','ignore']}).toString().trim(); }catch(e){}
  for(const p of [process.env.PUPPETEER_PATH,'puppeteer-core','puppeteer',
      path.join(TOOLS,'node_modules/puppeteer-core'),
      path.join(process.cwd(),'node_modules/puppeteer-core'),
      path.join(__dirname,'node_modules/puppeteer-core'),
      path.join(require('os').homedir(),'vedit/node_modules/puppeteer-core'),
      g&&path.join(g,'puppeteer-core')]) {
    if(!p) continue; try{ return require(p); }catch(e){}
  }
  throw new Error('ما لقيت puppeteer-core — شغّل: bash scripts/00_setup.sh --install');
}

/* كروم (أو إيدج/كروميوم) — ماك · ويندوز · لينكس */
function chromePath(){
  const L=process.env.LOCALAPPDATA||'', PF=process.env.PROGRAMFILES||'C:\\Program Files',
        PF86=process.env['PROGRAMFILES(X86)']||'C:\\Program Files (x86)';
  const c=[process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    path.join(PF,'Google/Chrome/Application/chrome.exe'), path.join(PF86,'Google/Chrome/Application/chrome.exe'),
    path.join(L,'Google/Chrome/Application/chrome.exe'),
    path.join(PF86,'Microsoft/Edge/Application/msedge.exe'), path.join(PF,'Microsoft/Edge/Application/msedge.exe'),
    '/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'];
  for(const p of c) if(p&&fs.existsSync(p)) return p;
  throw new Error('ما لقيت كروم ولا إيدج — نزّل كروم من google.com/chrome أو حدّد CHROME_PATH');
}

/* output.json — يكتبه 00b_quality.py. بدونه: 1080 · 30 إطار */
function profile(W){
  const d={w:1080,h:1920,scale:1,fps:30,platform:'instagram'};
  try{ Object.assign(d,JSON.parse(fs.readFileSync(W+'output.json','utf8'))); }catch(e){}
  return d;
}

const fileURL=p=>url.pathToFileURL(p).href;   // ويندوز + مسارات عربية = لازم ترميز صحيح

/* الصور الجاهزة بـ<work>/assets (صور ذكاء اصطناعي، شعارات، لقطات) — تُحمّل مسبقاً باسمها */
function assetList(W){
  try{ return fs.readdirSync(W+'assets').filter(f=>/\.(png|jpe?g|webp)$/i.test(f)); }catch(e){ return []; }
}
/* مقاطع بي-رول مستخرجة فريمات (12_broll.sh) — { name: عدد الفريمات } */
function brollList(W){
  const o={}; try{ for(const d of fs.readdirSync(W+'broll')){
    const p=W+'broll'+path.sep+d; if(!fs.statSync(p).isDirectory()) continue;
    o[d]=fs.readdirSync(p).filter(f=>f.endsWith('.jpg')).length; } }catch(e){}
  return o;
}
function readJSON(f,d){ try{ return JSON.parse(fs.readFileSync(f,'utf8')); }catch(e){ return d; } }

module.exports={resolvePuppeteer,chromePath,profile,fileURL,assetList,brollList,readJSON};
