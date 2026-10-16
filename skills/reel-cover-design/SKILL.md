---
name: reel-cover-design
description: Design the cover (thumbnail) of every reel Claude edits for nadhem_elaashek in the «حرب النفس» identity, from a clean frame of the video. Use after any montage, or when asked for a reel cover, thumbnail or غلاف.
---

# Reel cover design (غلاف الريل بهويتنا)

## Why it matters
The cover is what people see on the profile grid and in Explore/shares before tapping. A clear, consistent cover turns a profile into a "series" people binge, and helps new visitors understand in 1 second who Nadhem is.

## Approved style (Nadhem chose it 2026-10-16: "style B", example https://nadhem58234848.github.io/VAYNORA/video/shahwa-cover-b.png)
- Real frame from the raw clip (his room is fine), face big and centered, an expressive moment (hand gesture OK), punch-in ~1.25x.
- Dark brand grade (desaturated, red-tinted shadows, vignette).
- TOP: red plate (Red 500, rounded, tilted -2°) with 1-2 words = the topic, e.g. «الشهوة؟», ~150px, same as the plate he uses inside his edits.
- BOTTOM: the hook in 2 lines (~85-95px, Bone), one keyword in Red 400; dark gradient behind it; emblem + @nadhem_elaashek under it.
- Rejected by Nadhem: plain frame with small title and no plate (v1), cutout on red glow (not chosen).

## Rules (brand guide v1.0: https://nadhem58234848.github.io/VAYNORA/brand/)
1. **Clean frame only.** Use the raw talking-head source (no burned-in captions or motion graphics), e.g. the cut file before captions (`cutz.mp4` in the «منتج» project). Never use a frame from the finished edit.
2. **Pick the frame:** Nadhem's face big and sharp, eyes open, mouth closed or neutral, serious/intense look, hands not covering the face. Make a candidate sheet first, then choose.
3. **Dark brand grade:** desaturated, contrasty, red-tinted shadows + vignette (built into the tool). Colorful rooms must turn into the black/red mood.
4. **Title = the hook in 2-7 words**, max 3 lines, Cairo ExtraBold, Bone #F4F1EC, ONE keyword in Red 400 #E0262B, a short Red 500 bar above it. Same words as the hook or a sharper version; never clickbait the reel doesn't deliver.
5. **Layout:** title lower-middle, signature (emblem + @nadhem_elaashek) under it, optional red badge top-right for series ("حلقة 3", "اليوم 12"). Everything important sits inside the **3:4 grid crop** (y 240-1680 of 1080x1920) so the profile grid shows it; the tool exports that crop as a check.
6. **Consistency:** same position, size and style on every cover. Variety comes from the face and the words, not from new fonts or colors.
7. No women, no suggestive imagery, no other colors, no emoji in the title.

## Tool
`/mnt/project-files/brand/src/reel_cover.py` (also in repo brand/src). Needs ffmpeg + playwright (`NODE_PATH=/opt/node22/lib/node_modules`), fonts in /mnt/project-files/brand/fonts.
```
# 1) candidates sheet (times printed on each frame)
python3 reel_cover.py --video RAW.mp4 --title x --candidates 12 --out out/cover.png
# 2) final cover
python3 reel_cover.py --video RAW.mp4 --time 0.8 --pill "الشهوة؟" --title "علاش ربي حطّها فيك|ويحبك *طاهر*؟" [--yoff 0.23] [--zoom 1.25] --out out/cover.png
```
`|` = new line, `*word*` = red keyword. Outputs cover.png (1080x1920), cover-grid.png (3:4 check), cover-frame.jpg. Always look at both PNGs before delivering; if the title covers the mouth/eyes, change `--time`, `--zoom` or shorten the title.

## Delivery
- Save in /mnt/project-files/videos/ next to the reel (`<reel>-cover.png`).
- For Nadhem's phone, commit to repo nadhem58234848/VAYNORA under video/ and send the github.io link (he saves it from Safari).
- Tell him how to use it: Instagram upload → Edit cover → "Add from camera roll". Or in CapCut, put the cover image as the first 0.1s frame.
