#!/bin/bash
# فحص وتجهيز الأدوات — ماك · ويندوز (Git Bash) · لينكس.
#   ./00_setup.sh          → يفحص ويقول وش ناقص
#   ./00_setup.sh --install → ينزّل الناقص (بعد إذن المستخدم)
INSTALL=0; [ "$1" = "--install" ] && INSTALL=1
. "$(dirname "$0")/_py.sh"
MISS=(); OK=(); NOTE=()
have(){ command -v "$1" >/dev/null 2>&1; }
line(){ printf '%s\n' "$1"; }
OS=mac; case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) OS=win;; Linux) OS=linux;; esac

pup_ok(){ node -e "require('$(dirname "$0")/_common.js').resolvePuppeteer()" >/dev/null 2>&1; }
chrome_ok(){ node -e "require('$(dirname "$0")/_common.js').chromePath()" >/dev/null 2>&1; }
have ffmpeg && OK+=("ffmpeg") || MISS+=("ffmpeg")
have node   && OK+=("node")   || MISS+=("node")
"$PY" -c "import whisper" 2>/dev/null && OK+=("whisper") || MISS+=("whisper")
"$PY" -c "import numpy"  2>/dev/null && OK+=("numpy")   || MISS+=("numpy")
chrome_ok && OK+=("chrome") || MISS+=("chrome")
pup_ok && OK+=("puppeteer-core") || MISS+=("puppeteer-core")

line "النظام: $OS · بايثون: $PY"
line "الجاهز: ${OK[*]:-لا شيء}"
# معلومات تفيد التقدير — مو متطلبات
if "$PY" -c "import torch,sys;sys.exit(0 if torch.cuda.is_available() else 1)" 2>/dev/null; then
  line "⚡ كرت شاشة NVIDIA متاح — التفريغ والتجميع أسرع بكثير"; fi
if [ "$OS" = "mac" ]; then line "✂️ «الكلام ورا الشخص»: بمكتبة ماك المدمجة (يحتاج أدوات Xcode)"
elif "$PY" -c "import torch,torchvision,cv2" 2>/dev/null; then line "✂️ «الكلام ورا الشخص»: متاح"
else line "✂️ «الكلام ورا الشخص»: اختياري — يحتاج torch+torchvision+opencv (~٢ قيقا) لو طلبه"; fi
if have higgsfield; then line "🎨 هيقزفيلد (توليد صور/مقاطع/مؤثرات بالذكاء الاصطناعي): الأداة موجودة — تسجيل الدخول: higgsfield auth login"
else line "🎨 هيقزفيلد: اختياري — ما ننزّله إلا إذا طلبه (npm i -g @higgsfield/cli)"; fi
if have npm; then line "المحرّك الثاني (ريموشن): متاح عند الطلب — 04b_remotion.sh setup ينزّله (~500 ميقا)"
else line "المحرّك الثاني (ريموشن): يحتاج npm — غير متاح، والخفيف يكفي"; fi
if [ ${#MISS[@]} -eq 0 ]; then line "✅ كل شي جاهز — نقدر نبدأ."; exit 0; fi
line "الناقص: ${MISS[*]}"

if [ $INSTALL -eq 0 ]; then line "شغّل: $0 --install"; exit 10; fi

pipi(){ "$PY" -m pip install --quiet "$@" || "$PY" -m pip install --quiet --break-system-packages "$@"; }
for m in "${MISS[@]}"; do
  case "$m" in
    ffmpeg)
      if [ "$OS" = "win" ] && have winget; then line "⏬ ffmpeg…"; winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements >/dev/null || NOTE+=("ffmpeg فشل")
        NOTE+=("ffmpeg انتصب — سكّر الطرفية وافتحها من جديد عشان يبان")
      elif [ "$OS" = "linux" ] && have apt-get; then sudo apt-get install -y ffmpeg || NOTE+=("ffmpeg فشل")
      elif have brew; then line "⏬ ffmpeg…"; brew install ffmpeg || NOTE+=("ffmpeg فشل")
      else NOTE+=("لازم Homebrew أول: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""); fi ;;
    node)
      if [ "$OS" = "win" ] && have winget; then winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements >/dev/null || NOTE+=("node فشل")
      elif have brew; then brew install node || NOTE+=("node فشل")
      else NOTE+=("نزّل Node من nodejs.org"); fi ;;
    whisper) line "⏬ openai-whisper… (الموديل ينزل أول تشغيل، ~1.5-3 قيقا)"
      pipi openai-whisper || NOTE+=("whisper فشل")
      [ "$OS" = "win" ] && "$PY" -c "import torch;assert torch.version.cuda" 2>/dev/null || true ;;
    numpy)   pipi numpy || NOTE+=("numpy فشل") ;;
    puppeteer-core) line "⏬ puppeteer-core…"; mkdir -p "$HOME/.video-ad-editor"; npm i --silent --prefix "$HOME/.video-ad-editor" puppeteer-core || NOTE+=("puppeteer-core فشل") ;;
    chrome)
      if [ "$OS" = "win" ] && have winget; then winget install -e --id Google.Chrome --accept-source-agreements --accept-package-agreements >/dev/null || NOTE+=("كروم فشل")
      else NOTE+=("كروم مو منصّب — نزّله من google.com/chrome أو حدّد CHROME_PATH"); fi ;;
  esac
done

FAIL=0
have ffmpeg || FAIL=1
"$PY" -c "import whisper,numpy" 2>/dev/null || FAIL=1
chrome_ok || FAIL=1
pup_ok || FAIL=1
[ ${#NOTE[@]} -gt 0 ] && printf '⚠️  %s\n' "${NOTE[@]}"
[ $FAIL -eq 0 ] && line "✅ كل شي جاهز الحين." || { line "❌ باقي ناقص — شوف الملاحظات فوق."; exit 11; }
