#!/bin/bash
# ═══ مقطع بي-رول (مثلاً فيديو مولّد بهيقزفيلد) → فريمات جاهزة للرسم ═══
#   ./12_broll.sh <work> <clip.mp4> <name> [fit]
#   fit = cover (الافتراضي: يملأ الشاشة 9:16 ويقص الزوايد) · contain (يحافظ على الكادر كامل)
# يطلّع <work>/broll/<name>/%05d.jpg بدقة وإطارات output.json — وبالـcompose:
#   BROLL.push({name:'<name>', s:12.3, e:16.0});   ثم   clipImg('<name>', R)
set -e
. "$(dirname "$0")/_py.sh"
W="$(cd "$1" && pwd)"; IN="$2"; NAME="$3"; FIT="${4:-cover}"
[ -f "$IN" ] || { echo "❌ ما لقيت $IN"; exit 2; }
FPS=$(prof "$W" fps); OW=$(prof "$W" w); OH=$(prof "$W" h)
if [ "$FIT" = "contain" ]; then VF="scale=$OW:$OH:force_original_aspect_ratio=decrease"
else VF="scale=$OW:$OH:force_original_aspect_ratio=increase:flags=lanczos,crop=$OW:$OH"; fi
D="$W/broll/$NAME"; rm -rf "$D"; mkdir -p "$D"
ffmpeg -v error -i "$IN" -vf "fps=$FPS,$VF,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709" -q:v 3 -y "$D/%05d.jpg"
N=$(ls "$D" | wc -l | tr -d ' ')
echo "✅ broll/$NAME — $N فريم ($("$PY" -c "print(round($N/$FPS,2))") ثانية)"
echo "   بالـcompose: BROLL.push({name:'$NAME', s:<من>, e:<إلى>}); ثم clipImg('$NAME', R)"
