# voice-reel — ريل «حرب النفس» من تسجيل صوتي فقط
1. `public/voice_raw.wav` ← تسجيل ناظم (ffmpeg -i voice.m4a -ar 48000 -ac 2 public/voice_raw.wav)
2. تفريغ بتوقيت الكلمات (sherpa-onnx Whisper turbo، انظر الذاكرة video-editing-montaj) → `lines` في `src/reel.json` (سطر = 2-4 كلمات، `hot:true` للكلمة القوية)
3. `scenes` في `src/reel.json`: مشهد كل 2-3 ثواني من مكتبة `src/scenes.tsx`:
   stamp · icon(drop/hook/flame/chain/bulb/eye) · gauge · cards · strike · versus · img · broll · end
   حقول عامة: s, e, mood (night|red), tr (whip|zoom|blob|cut). `*كلمة*` في label = أحمر.
4. `./render.sh` → `out/final.mp4` (فيديو + ماستر الصوت -14 LUFS + SFX تلقائية من `build_audio.py`)
Stills للمراجعة: `npx remotion still src/index.ts Reel out/x.png --frame=N --browser-executable=...`

## وضع VAY (ما ثمّاش تسجيل أصلاً): سكريبت → صوت AI → تصاور VAY → مونتاج
1. اكتب `scripts/<name>.json` (انظر `scripts/vay-demo.json`): لكل مشهد `img` (تصويرة VAY 4:5 في public/vay/)، `text` (فصحى، *كلمة* = قوية)، `move` (in/out/left/right)، `tr`، `mood`، `overlay` (plate/chips/versus، `at` = الكلمة).
2. الصوت: ElevenLabs (صوت «Mohamed, Premium Arabic MSA») ملف لكل مشهد في public/el/ و "audio" في المشهد. بلا audio = Edge TTS مجاني للتجربة برك. ثم `python3 tts.py scripts/<name>.json` → توقيت الكلمات + reel.json.
3. `./render.sh` → out/final.mp4. كل مشهد VAY ياخذ لقطة ثانية (زوم) في النص باش التغيير يبقى كل 2-3 ثواني.
تصاور VAY جديدة: برومبت ثابت في /mnt/project-files/vay-system/carousel-01-prompts.md (ChatGPT مجاني مع صورة VAY المرجعية) الأفضل Canva (مفعّل في الـthread)، وChatGPT المجاني كبديل.
