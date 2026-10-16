#!/bin/sh
# تحميل SFX من Mixkit (مجاني، بلا مفتاح) إلى sfx/
mkdir -p sfx; for id in 2364 3005 1109 2870 2350 1461 1487 2356 2354 1143 1346 1486 494 1329 1704; do
  [ -f sfx/$id.mp3 ] || curl -sS -f -o sfx/$id.mp3 "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"; done
