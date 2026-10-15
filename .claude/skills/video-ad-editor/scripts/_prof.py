# -*- coding: utf-8 -*-
"""إعدادات الإخراج المشتركة — تُقرأ من <work>/output.json (يكتبه 00b_quality.py).
بدون الملف: 1080×1920 · 30 إطار · انستقرام (نفس سلوك النسخة الأولى)."""
import json, os

DEF = {"w": 1080, "h": 1920, "scale": 1, "fps": 30, "platform": "instagram", "label": "1080p · 30 إطار"}

def load(work):
    p = os.path.join(work, "output.json")
    d = dict(DEF)
    if os.path.exists(p):
        d.update(json.load(open(p, encoding="utf-8")))
    return d
