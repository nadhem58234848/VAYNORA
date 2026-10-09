# Editing style guide — VAYNORA® (Instagram @vaynora_)

This project produces Reels in the owner's editing style. Follow these rules for
every new video unless the owner says otherwise. Add each new rule they teach
to the "Rules taught by the owner" section at the bottom.

The old gold-and-black VAYNORA website identity is retired: never use gold, the
gold logo, or the images at the repo root.

## Identity (from the Instagram account)

- **Message:** "اصنع من الألم قوة" / "TURN PAIN INTO POWER". Self-discipline,
  quitting addiction, repentance, gym, building a stronger self.
- **Colors** (constants in `src/Brand/theme.ts`):
  - Background near-black `#0B0B0B`; never pure white backgrounds.
  - Accent red `#C62828`; deep red `#4A0606` for glows and gradients.
  - Text white `#F2F2F2`; secondary text gray `#8A8A8A`.
- **Typography:** Arabic, right-to-left, Cairo (bundled in `public/fonts`).
  Headlines in weight 900; the one key word or number of a headline is red,
  everything else white. Subtitles small, gray, weight 400.
- **Frame furniture** (the `BrandFrame` component): small spaced-out labels at
  the top — slide counter like `01 / 04` (or "TURN PAIN INTO POWER") on the
  left, `VAYNORA` on the right — and a thin red vertical bar on the left edge.
- **Red rule:** a short red line under headlines.
- **CTA:** outlined red pill, e.g. "اسحب لتعرف ما ينتظرك" or "تابع @vaynora_".

## Editing style

- **Format:** vertical 1080×1920, 30 fps (Reels).
- **Red and black only.** Everything is graded toward red/black.
- **B-roll:** every B-roll shot goes through `BRoll`: desaturated, high
  contrast, red multiply, dark vignette, bottom fade to black, slow push-in or
  pull-out. Drop footage in `public/broll/` and set `broll` on the shot.
  Typical B-roll: dark red warrior art, gym, training, the owner on camera.
  Without B-roll a shot falls back to `EmberBackground` (red glow + embers).
- **Motion graphics:**
  - `Headline`: lines slide up from a mask one after another, red rule draws in,
    gray subtitle fades up.
  - `Staccato`: one word per beat with a punch-in scale, hard cuts, last word
    red ("ضعتُ. سُجنتُ. انتكستُ. ثم قمتُ.").
  - `RedSlash`: red diagonal slash + short red flash over every cut.
- **Pacing:** hook in the first 2–3 s, 2.5–3 s per text card, end on the
  slogan + CTA.

## Working on the video

- Shots are listed in `SHOTS` in `src/Brand/BrandReel.tsx` (the edit decision
  list). Edit that list to re-cut the video.
- Preview: `npm run dev`. Render: `npx remotion render BrandReel out/BrandReel.mp4`.
- In the cloud container, pass
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
  (Remotion cannot download its own browser there).

## Rules taught by the owner

1. Style = red and black, with B-rolls and motion graphics.
2. Identity comes from the Instagram account @vaynora_, not the old website.
