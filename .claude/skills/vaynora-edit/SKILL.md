---
name: vaynora-edit
description: Edit VAYNORA / Nadhem Instagram Reels end to end — talking-head Reels with word-by-word captions and sound effects, and VAY Reels from panel art. Use whenever the owner sends a video, audio, images or a script and asks for montage/editing ("مونتاج", "ركّب", "كابشن", "ريل"). Reels only: carousels are not Claude's job.
---

# VAYNORA editing

Claude's job here is **Reels only**. The owner makes carousels elsewhere: do
not offer carousel work or image prompts for carousels.

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

0. Clean up the raw footage first:
   `python3 scripts/enhance.py <raw> <enhanced.mp4> --compare <before_after.png>`
   (exposure from measured luma, warm grade for natural skin, denoise,
   sharpen; sound: noise reduction, de-ess, compression, -14 LUFS). Look at
   the before/after still; show it to the owner with the Reel.
1. The owner sends the video. Uploads over 30 MB fail in the app: ask for a
   CapCut export at 1080p, 30 fps, bitrate ~5–7 Mbps, smart HDR off, AI
   upscale off. Transcribe the enhanced file:
   `python3 scripts/prepare-talking.py <video> <name>`
   (offline Whisper small, word timings, phrases split at pauses; ~2 s of
   compute per second of video). Writes `public/talking/<name>.{mp4,json}`.
2. Proofread `public/talking/<name>.json` yourself before rendering: Whisper
   mishears dialect (Tunisian Darja especially). Fix misheard words from
   context, keep the speaker's dialect (don't rewrite into MSA), and set
   `"key": true` on 1 keyword per phrase at most. If a word is truly unclear,
   ask the owner rather than guess. Tunisian Darja comes out badly (first
   real Reel: about half the words wrong), so when many words are unclear,
   show the owner the transcript with your guesses and ask for the exact
   text; then use it as a .txt (or fix the JSON words, keeping the timings).
   CapCut's auto-captions ("تعديل الشرح" screenshots) are far better than
   Whisper on Darja: when the owner sends them, fix spelling and pass the
   lines as a .txt — each word is aligned to Whisper's timing (DTW), so
   timing stays exact even where Whisper misheard. CapCut can skip a line;
   fill it from Whisper and tell the owner which words you inferred. Show the owner the corrected text only if
   unsure about several words.
   Optional inputs when the owner has them: an `.srt` or a `.txt` script
   (one phrase per line, `*keyword*`) as the 2nd argument instead.
3. Pick the handle by account: `@nadhem_elaashek` (discipline, journey) or
   `@vaynora_` (addiction niche, VAY).
   The script also detects the face (OpenCV) and writes face-free caption
   slots into the JSON (above the head, below the chin, beside the face when
   there is room). Check a few stills: no word may touch the face.
4. `npx remotion render TalkingReel out/<name>.mp4 --props='{"name":"<name>","handle":"@..."}'`
5. Delivery copy (the chat upload limit is 30 MB; SFX on top of the voice
   can hit 0 dB):
   `ffmpeg -i out/<name>.mp4 -c:v libx264 -preset slow -b:v 7M -maxrate 8M -bufsize 16M -pix_fmt yuv420p -af "alimiter=limit=0.84:attack=2:release=60:level=false" -c:a aac -b:a 192k -movflags +faststart out/<name>-ig.mp4`
   Check peak < -1 dB and size < 30 MB (lower -b:v for Reels over ~30 s).
6. QA (below), then send `out/<name>-ig.mp4` and the before/after still
   with SendUserFile.

## 2. VAY Reel from panel art

`src/Brand/VayStory.tsx`: hook question → split panels with `CaptionBox`
captions → hope turn → CTA. Edit `SLIDES`; images in `public/vay/`. Sound:
`SoundTrack` in the same file (whoosh per cut, hit per caption, riser into
the hope turn, impacts). Optional nasheed: set `NASHEED`.
Render: `npx remotion render VayStory out/VayStory.mp4`.

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
