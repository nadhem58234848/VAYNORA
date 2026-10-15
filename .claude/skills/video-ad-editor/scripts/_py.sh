# مشترك لسكربتات bash: يلقى بايثون شغّال (ويندوز فيه python3 وهمي يفتح المتجر) + يقرأ output.json
PY=python3; "$PY" -c "import sys" >/dev/null 2>&1 || PY=python
export PYTHONUTF8=1
prof(){ "$PY" -c "import json,os,sys;p=os.path.join(sys.argv[1],'output.json');d={'w':1080,'h':1920,'fps':30,'scale':1,'platform':'instagram'};d.update(json.load(open(p,encoding='utf-8')) if os.path.exists(p) else {});print(d[sys.argv[2]])" "$1" "$2"; }
# مرمّز الفيديو: كرت NVIDIA (أسرع بكثير) أو البرنامج. ENC=x264 يجبر البرنامج.
has_nvenc(){ [ "${ENC:-auto}" != "x264" ] && ffmpeg -hide_banner -v error -f lavfi -i color=s=256x256:d=0.1 -c:v h264_nvenc -f null - >/dev/null 2>&1; }
