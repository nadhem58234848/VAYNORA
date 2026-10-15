# -*- coding: utf-8 -*-
import _u8  # ويندوز: UTF-8 للعربي
"""قصّ الشخص من كل فريم + بيانات الوجه — لويندوز ولينكس (ماك يستخدم personmask.swift المدمج).
  python personmask.py <inDir> <outDir> [fast|accurate] [feather]
نفس مخرجات نسخة الماك: <outDir>/<frame>.png (قناع رمادي بدقة الفريم) + meta.json (مكان الوجه).
• كرت NVIDIA: DeepLabV3-ResNet101 (دقيق) · بدون كرت: MobileNet (أسرع). الموديل ينزل مرة وحدة (~٤٠-٢٣٠ ميقا).
• الوجه: OpenCV (مدمج، بلا تنزيل)."""
import glob, json, os, sys
import numpy as np, cv2, torch, torchvision
from torchvision.models import segmentation as S

inD, outD = sys.argv[1], sys.argv[2]
q = sys.argv[3] if len(sys.argv) > 3 else "accurate"
feather = float(sys.argv[4]) if len(sys.argv) > 4 else 2.5
os.makedirs(outD, exist_ok=True)
dev = "cuda" if torch.cuda.is_available() else "cpu"
big = dev == "cuda" and q != "fast"
m = (S.deeplabv3_resnet101(weights="DEFAULT") if big else
     S.deeplabv3_mobilenet_v3_large(weights="DEFAULT")).to(dev).eval()
if dev == "cuda": m = m.half()
MEAN = torch.tensor([0.485, 0.456, 0.406], device=dev).view(3, 1, 1)
STD = torch.tensor([0.229, 0.224, 0.225], device=dev).view(3, 1, 1)
INF = 720 if big else 512                      # القصّ يُحسب على دقة أصغر ثم يتكبّر — أسرع بكثير وبلا فرق يُذكر
face_cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
PERSON = 15                                     # رقم «شخص» بتصنيف الموديل

files = sorted(glob.glob(os.path.join(inD, "*.jpg")))
meta = []
print(f"قصّ {len(files)} فريم بـ{'الكرت' if dev == 'cuda' else 'المعالج'}…")
with torch.no_grad():
    for n, f in enumerate(files):
        im = cv2.imread(f); H, W = im.shape[:2]
        s = INF / min(H, W); sm = cv2.resize(im, (int(W * s) // 8 * 8, int(H * s) // 8 * 8), interpolation=cv2.INTER_AREA)
        x = torch.from_numpy(cv2.cvtColor(sm, cv2.COLOR_BGR2RGB)).to(dev).permute(2, 0, 1).float() / 255
        x = ((x - MEAN) / STD).unsqueeze(0)
        if dev == "cuda": x = x.half()
        p = torch.softmax(m(x)["out"][0].float(), 0)[PERSON].cpu().numpy()
        mk = cv2.resize(p, (W, H), interpolation=cv2.INTER_CUBIC)
        mk = np.clip((mk - 0.35) / 0.3, 0, 1)          # حد ناعم بدل قصّ حاد
        if feather > 0:
            k = int(feather * max(1, W / 1080) * 3) | 1
            mk = cv2.GaussianBlur(mk, (k, k), 0)
        cv2.imwrite(os.path.join(outD, os.path.basename(f)[:-4] + ".png"), (mk * 255).astype(np.uint8))
        row = {"f": os.path.basename(f)}
        g = cv2.cvtColor(cv2.resize(im, (W // 3, H // 3)), cv2.COLOR_BGR2GRAY)
        fs = face_cc.detectMultiScale(g, 1.1, 5, minSize=(40, 40))
        if len(fs):
            fx, fy, fw, fh = max(fs, key=lambda r: r[2] * r[3])
            row["face"] = {"x": float(fx * 3), "y": float(fy * 3), "w": float(fw * 3), "h": float(fh * 3)}
        meta.append(row)
        if (n + 1) % 60 == 0: print(f"  {n + 1}/{len(files)}")
json.dump(meta, open(os.path.join(outD, "meta.json"), "w"))
print(f"masks: {len(meta)}")
