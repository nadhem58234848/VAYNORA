---
name: vaynora-edit
description: Edit VAYNORA / Nadhem Instagram content end to end — talking-head Reels with word-by-word captions and sound effects, VAY Reels from panel art, and VAY carousels from ChatGPT images. Use whenever the owner sends a video, audio, images or a script and asks for montage/editing ("مونتاج", "ركّب", "كابشن", "ريل", "كاروسيل"), or asks for image prompts for VAY.
---

# VAYNORA editing

Everything lives in `video/` (Remotion). Before any work, read
`video/CLAUDE.md`: brand identity, VAY/N/AURA rules, account split, sound
rules (no music — nasheeds without percussion only), and what the data says.
Reply to the owner in Arabic. Never use gold or AURA in VAY content.

Setup is automatic (`.claude/hooks/session-start.sh` runs `npm install`);
`remotion.config.ts` points Remotion at the container's Chromium. Run every
command below from `video/`.

## 1. Talking-head Reel (Nadhem or VAY speaking)

Word-by-word captions, one word at a time, jumping between positions around
the face per phrase; red keywords punch in with a `hit`; a `whoosh` before
each new phrase; end card «تابع» + handle with an `impact`.

1. Get the video and its words. Best: an `.srt` (CapCut auto-captions →
   export SRT). Otherwise ask for the script as `.txt`, one phrase per line,
   in the order spoken. Mark keywords with `*asterisks*`.
2. `python3 scripts/prepare-talking.py <video> <srt|txt> <name>`
   (writes `public/talking/<name>.{mp4,json}`; the .txt route aligns phrases
   to the speech pauses, so check the printed cue times look plausible).
3. Pick the handle by account: `@nadhem_elaashek` (discipline, journey) or
   `@vaynora_` (addiction niche, VAY).
4. `npx remotion render TalkingReel out/<name>.mp4 --props='{"name":"<name>","handle":"@..."}'`
5. QA (below), then send `out/<name>.mp4` with SendUserFile.

If huggingface.co is ever reachable, word timings can come from Whisper
instead; until then do not promise word-exact sync on the .txt route.

## 2. VAY Reel from panel art

`src/Brand/VayStory.tsx`: hook question → split panels with `CaptionBox`
captions → hope turn → CTA. Edit `SLIDES`; images in `public/vay/`. Sound:
`SoundTrack` in the same file (whoosh per cut, hit per caption, riser into
the hope turn, impacts). Optional nasheed: set `NASHEED`.
Render: `npx remotion render VayStory out/VayStory.mp4`.

## 3. VAY carousel (ChatGPT draws, Claude writes)

1. Write the prompts in English into `video/prompts/<name>.md`, starting from
   the master message in `prompts/vay-carousel-5-things.md` (VAY locked to the
   reference, clean muted backgrounds, red only on VAY, NO TEXT in images,
   calm lower third, 3:2 panels / 2:3 cover and CTA).
2. Arabic text is never drawn by ChatGPT: Claude sets it with
   `VayCarouselSlide` (`src/Brand/VayCarousel.tsx`), Modern Standard Arabic,
   one red keyword per caption, Latin digits.
3. Review each image the owner sends: VAY unchanged (crown, no face, emblem,
   wraps), background calm, matches the prompt, bright enough for a phone.
   Give a one-line fix prompt when it fails.
4. Save images under `public/carousel/<name>/`, set `src` in the slide list,
   render each slide: `npx remotion still <Id>-<n> out/<name>-<n>.png`.

## Sound effects

`python3 scripts/make-sfx.py` regenerates `public/sfx/` (whoosh, hit,
impact, riser, room tone). Place them with `SoundEffect` from
`src/Brand/Sound.tsx`. Never add music or percussion.

## QA before sending anything

- `npm run lint` passes.
- Look at stills: `npx remotion still <Comp> /tmp/x.png --frame=N --scale=0.4`
  for the hook, a middle frame, and the end. Check text is readable, inside
  the 90px margins, not over the face, keyword red.
- Check the audio of renders with
  `ffmpeg -i out/x.mp4 -filter_complex showwavespic=s=1400x150 -frames:v 1 w.png`
  and `-af volumedetect` (peak below 0 dB, effects where expected).
- You cannot hear or watch playback: say so when relevant and ask the owner
  for feedback on feel and timing. Add every correction they give to
  `video/CLAUDE.md` under "Rules taught by the owner".
- Commit and push the source changes (not `out/`, not `public/talking/`).
