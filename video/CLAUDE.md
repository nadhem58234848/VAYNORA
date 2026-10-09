# Editing style guide — VAYNORA® (Nadhem, @nadhem_elaashek)

This project makes Reels in the owner's editing style. Follow these rules for
every new video unless the owner says otherwise. Add each new rule the owner
teaches to "Rules taught by the owner" at the bottom.

The old gold-and-black VAYNORA clothing-store identity (the website and the
images at the repo root) is retired. Never use gold or those images.

## Brand (from the owner's brand guide)

- **Positioning:** a personal brand about radical change: discipline, faith,
  rebuilding yourself from zero. Nadhem speaks as someone who lived the same
  battle, not as a distant expert. Slogan: «اصنع من الألم قوة» —
  TURN PAIN INTO POWER. Product: the book «معركة الخلوات», link in bio.
- **Audience:** Arab youth 18–34, mostly men from North Africa, struggling with
  distraction, compulsive habits and lack of direction.
- **Colors** (`src/Brand/theme.ts`): background `#0A0A0A`, red accent
  `#C81E1E`, text warm off-white `#F2EFE9`, secondary gray `#8C8C86`. The
  older darker values (`#0B0A08`, `#8B2A1E`) are superseded.
- **Font:** Cairo (bundled in `public/fonts`). ExtraBold 800 for headlines,
  SemiBold 600 for body, Medium 500 for secondary text.
- **Digits:** always Latin digits (1, 2, 3), never Arabic-Indic (١، ٢، ٣).
- **Layout:** 1080px wide; red vertical bar on the **right** edge in every
  design; one dark background everywhere; text side margins ≥ 90px.
- **Language:** Reels in Tunisian Darja (emotional, direct, like talking to
  yourself); carousels in Modern Standard Arabic; stories mixed.
- **Non-negotiable:** every Quran verse or hadith is verified from a reliable
  Islamic source before publishing; no fatwas or rulings without a scholarly
  source; all content original, never copied from other creators.

## Visual language

- Headline: one key word or number in red, the rest off-white.
- `BrandFrame`: spaced-out VAYNORA at the top, slide counter pill (`3/9`),
  red bar on the right edge.
- Short red rule under headlines; gray subline under it.
- **VAY**: the mascot, a black warrior with a red crown-V helmet and red hand
  wraps. VAY art is already on-brand: use it with `grade="none"`.
- VAY carousel format: two stacked panels split by a thin red line, each
  with a caption in a dark rounded box (`CaptionBox`).
- CTA: solid red button «الرابط في البايو», or a red outlined pill.

## Editing style

- **Format:** vertical 1080×1920, 30 fps.
- **Red and black only.** Real footage (gym, running, talking to camera) goes
  through `BRoll` with the red grade; VAY art without the grade.
- **Motion graphics:** headline lines slide up from a mask; captions scale in
  and their text slides up; `Staccato` = one word per beat with the last word
  red; `RedSlash` (red slash + flash) on every cut.
- **Structure:** hook question to the viewer in the first 2–3 s → story beats
  of about 2.8 s each → hope turn ("هناك طريق آخر") → CTA.

## What the account data says (Windsor, Dec 2025 – Oct 2026)

- Best retention: personal story reels («خسرت قرابة 20 مليون»: 25.6 s average
  watch, 27% skip) and calm faith reflections («تأخير النعم»: 28% skip).
- Biggest reach: short, shareable faith reels («اغرس نخلة في الجنة»: 1.5M
  views, 216K shares; «صلاة التوبة»: 278K).
- Reels titled with the bare topic («حل العادة السرية», «حل ابتلاء الإباحية»)
  reach far but 73–77% skip in the first 3 s → the first frame needs a
  stronger hook than the topic name.
- Average watch time is mostly 7–20 s → keep Reels around 15–25 s, put the
  payoff early.

## Working on the videos

- `src/Brand/VayStory.tsx`: VAY carousel → Reel (edit `SLIDES`).
- `src/Brand/BrandReel.tsx`: text-card Reel (edit `SHOTS`).
- Preview: `npm run dev`. Render: `npx remotion render VayStory out/VayStory.mp4`.
- In the cloud container add
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

## Rules taught by the owner

1. Style = red and black, with B-roll and motion graphics.
2. The identity comes from the Instagram account and the brand guide, not
   the old website.
3. Previous brand work to learn from: the VAY carousel, the brand guide, the
   habit guide, the 10 rules sheet, the التوبة النصوحة carousel.
