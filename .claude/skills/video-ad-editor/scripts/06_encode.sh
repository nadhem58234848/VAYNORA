#!/bin/bash
# ./06_encode.sh <workdir> [اسم_الملف]   → يجمّع الفريمات + الصوت + المؤثرات
# الدقة والإطارات من output.json. 4K يستخدم كرت NVIDIA إن وُجد (ENC=x264 يجبر البرنامج).
set -e
. "$(dirname "$0")/_py.sh"
W="$(cd "$1" && pwd)"; OUT="${2:-$W/ad-final.mp4}"
FPS=$(prof "$W" fps); OH=$(prof "$W" h)
DUR=$("$PY" -c "import json,sys;c=json.load(open(sys.argv[1]+'/caps.json',encoding='utf-8'));s=json.load(open(sys.argv[1]+'/sfx.json'));print(round(c['total']+s['outro'],3))" "$W")
FADE=$("$PY" -c "print(round($DUR-0.6,3))")
if [ "$OH" -ge 3000 ]; then        # 4K: جودة عالية — المنصات تعيد الضغط، فنعطيها أنظف مصدر
  if has_nvenc; then V=(-c:v h264_nvenc -preset p6 -tune hq -rc vbr -cq 19 -b:v 40M -maxrate 60M -bufsize 120M -profile:v high); ENCN="كرت الشاشة"
  else V=(-c:v libx264 -preset medium -crf 18 -maxrate 50M -bufsize 100M -profile:v high -level 5.2); ENCN="البرنامج"; fi
else
  L=4.0; [ "$FPS" -ge 50 ] && L=4.2
  V=(-c:v libx264 -preset slow -crf 20 -maxrate 8M -bufsize 16M -profile:v high -level $L); ENCN="البرنامج"
fi
Q=1080p; [ "$OH" -ge 3000 ] && Q=4K
echo "🎬 تجميع $Q · $FPS إطار · بـ$ENCN"
ffmpeg -v error -stats -framerate $FPS -i "$W/out/%05d.jpg" -i "$W/cutz.mp4" -i "$W/sfx.wav" \
 -filter_complex "[0:v]format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[vo];[1:a]apad=pad_dur=8[a0];[a0][2:a]amix=inputs=2:duration=first:normalize=0[am];[am]atrim=0:$DUR,asetpts=PTS-STARTPTS,afade=t=out:st=$FADE:d=0.6[ao]" \
 -map "[vo]" -map "[ao]" "${V[@]}" -pix_fmt yuv420p -r $FPS -c:a aac -b:a 192k -ar 48000 \
 -movflags +faststart -y "$OUT"
echo "✅ $OUT"
ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,r_frame_rate -of default=nw=1 "$OUT"
