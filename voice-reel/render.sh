#!/bin/sh
# ريل بالصوت فقط: public/voice_raw.wav + src/reel.json → out/final.mp4
set -e; cd "$(dirname "$0")"
[ -d node_modules ] || npm install --silent
./fetch_sfx.sh
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/*/headless_shell | head -1)
npx remotion render src/index.ts Reel out/video.mp4 --browser-executable=$B --concurrency=4 --muted --crf=16 --log=error
python3 build_audio.py
ffmpeg -v error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v 3000k -maxrate 4500k -bufsize 8000k \
  -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart -shortest out/final.mp4
ls -la out/final.mp4
