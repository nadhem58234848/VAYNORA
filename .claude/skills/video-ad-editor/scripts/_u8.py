# -*- coding: utf-8 -*-
"""ويندوز يفتح الملفات ويطبع بترميز cp1252 — والعربي ينكسر. نعيد تشغيل السكربت بوضع UTF-8 مرة وحدة.
(ماك ولينكس ما يتأثرون.)  الاستخدام: أول سطر بكل سكربت:  import _u8"""
import os, subprocess, sys
if not sys.flags.utf8_mode and os.environ.get("_VAE_U8") != "1":
    os.environ["_VAE_U8"] = "1"
    sys.exit(subprocess.call([sys.executable, "-X", "utf8"] + sys.argv))
