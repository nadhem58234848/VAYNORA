"""Prepare a talking-head Reel for word-by-word captions (TalkingReel).

Usage (from video/):
  python3 scripts/prepare-talking.py <video> <name>                  # automatic
  python3 scripts/prepare-talking.py <video> <captions.srt|script.txt> <name>

- Without captions the speech is transcribed offline (scripts/transcribe.mjs,
  Whisper small) with word timings and split into phrases at pauses. Then
  fix misheard words and set "key": true on keywords in the JSON by hand.
- With an .srt (e.g. CapCut auto-captions export) the cue timings are used.
- With a .txt (one phrase per line, the exact words spoken) each word gets
  Whisper's timing for it (aligned even where Whisper misheard the word).
  Without the Whisper model, timings come from the speech pauses instead.
- Wrap a word in *asterisks* to make it a red keyword: "اترك *الإباحية*".

Writes public/talking/<name>.mp4 and public/talking/<name>.json, then render:
  npx remotion render TalkingReel out/<name>.mp4 --props='{"name":"<name>"}'
"""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "public", "talking")
MODEL = os.path.join(ROOT, ".models", "Xenova", "whisper-small")


def probe(video):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height:format=duration",
         "-of", "json", video],
        check=True, capture_output=True, text=True,
    ).stdout
    info = json.loads(out)
    stream = info["streams"][0]
    return float(info["format"]["duration"]), stream["width"], stream["height"]


def srt_time(stamp):
    h, m, rest = stamp.strip().replace(",", ".").split(":")
    return int(h) * 3600 + int(m) * 60 + float(rest)


def parse_srt(path):
    cues = []
    blocks = re.split(r"\n\s*\n", open(path, encoding="utf-8-sig").read().strip())
    for block in blocks:
        lines = [l for l in block.splitlines() if l.strip()]
        timing = next((l for l in lines if "-->" in l), None)
        if not timing:
            continue
        start, end = (srt_time(t) for t in timing.split("-->"))
        text = " ".join(lines[lines.index(timing) + 1:])
        text = re.sub(r"<[^>]+>", "", text).strip()
        if text:
            cues.append({"start": start, "end": end, "text": text})
    return cues


def speech_segments(video, duration):
    """Spans of speech between silences, from ffmpeg silencedetect."""
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", video, "-af",
         "silencedetect=noise=-32dB:d=0.25", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    segments, cursor = [], 0.0
    for s, e in zip(starts, ends + [duration] * (len(starts) - len(ends))):
        if s - cursor > 0.15:
            segments.append((cursor, s))
        cursor = e
    if duration - cursor > 0.15:
        segments.append((cursor, duration))
    return segments


def align_text(video, duration, path):
    """One cue per line. If the pause count matches, one line per speech
    segment; otherwise spread lines over the speech time by text length."""
    lines = [l.strip() for l in open(path, encoding="utf-8-sig") if l.strip()]
    segments = speech_segments(video, duration)
    if len(segments) == len(lines):
        return [{"start": s, "end": e, "text": t} for (s, e), t in zip(segments, lines)]
    total = sum(e - s for s, e in segments)
    weights = [len(l.replace("*", "")) for l in lines]
    cues, used = [], 0.0
    for line, w in zip(lines, weights):
        span = total * w / sum(weights)
        start = speech_time_to_clock(segments, used)
        end = speech_time_to_clock(segments, used + span)
        cues.append({"start": start, "end": end, "text": line})
        used += span
    return cues


def speech_time_to_clock(segments, t):
    for s, e in segments:
        if t <= e - s:
            return s + t
        t -= e - s
    return segments[-1][1]


def split_words(cue):
    """Spread a cue's time over its words by length (Arabic letters)."""
    raw = cue["text"].split()
    weights = [max(len(w.strip("*")), 2) for w in raw]
    span = cue["end"] - cue["start"]
    words, t = [], cue["start"]
    for w, weight in zip(raw, weights):
        d = span * weight / sum(weights)
        key = w.startswith("*") and w.endswith("*") and len(w) > 2
        words.append({"text": w.strip("*"), "start": round(t, 3),
                      "end": round(t + d, 3), "key": key})
        t += d
    return words


def whisper_words(video):
    """Offline Whisper word timings (scripts/transcribe.mjs)."""
    tmp = os.path.join(OUT, "_words.json")
    subprocess.run(["node", os.path.join(ROOT, "scripts", "transcribe.mjs"),
                    video, tmp], check=True)
    words = json.load(open(tmp, encoding="utf-8"))["words"]
    os.remove(tmp)
    return words


def transcribe(video):
    """Whisper words grouped into phrases at pauses."""
    words = whisper_words(video)
    cues, current = [], []
    for i, w in enumerate(words):
        current.append({"text": w["text"], "start": round(w["start"], 3),
                        "end": round(w["end"], 3), "key": False})
        nxt = words[i + 1] if i + 1 < len(words) else None
        pause = nxt["start"] - w["end"] if nxt else 1
        if pause > 0.35 or len(current) >= 5 or w["text"][-1] in ".!؟?،,":
            cues.append({"start": current[0]["start"], "end": current[-1]["end"],
                         "words": current})
            current = []
    return cues


def norm(word):
    """Loose Arabic spelling key: no diacritics/punctuation, unified letters."""
    word = re.sub(r"[\u064B-\u0652\u0670\u0640*.,!?؟،]", "", word)
    for a, b in (("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ة", "ه"), ("ى", "ي")):
        word = word.replace(a, b)
    return word


def align_to_whisper(lines, wwords):
    """Give the owner's exact text Whisper's word timings.

    Dynamic time warping between the corrected words and Whisper's words
    (cost = spelling difference), so each corrected word takes the time of
    the Whisper word(s) it matches, even where Whisper misheard it."""
    from difflib import SequenceMatcher

    tokens = [(li, w) for li, line in enumerate(lines) for w in line.split()]
    a = [norm(w) for _, w in tokens]
    b = [norm(w["text"]) for w in wwords]
    n, m = len(a), len(b)
    INF = float("inf")
    cost = [[INF] * (m + 1) for _ in range(n + 1)]
    cost[0][0] = 0.0
    move = [[None] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            c = 1 - SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
            best = min((cost[i - 1][j - 1], "d"), (cost[i - 1][j], "u"),
                       (cost[i][j - 1], "l"))
            cost[i][j] = best[0] + c
            move[i][j] = best[1]
    pairs, i, j = [], n, m
    while i > 0 and j > 0:
        pairs.append((i - 1, j - 1))
        step = move[i][j]
        i, j = (i - 1, j - 1) if step == "d" else (i - 1, j) if step == "u" else (i, j - 1)
    matched = {}
    for ti, wj in reversed(pairs):
        matched.setdefault(ti, []).append(wj)
    # Corrected words sharing one Whisper word split its time evenly.
    owners = {}
    for ti, js in matched.items():
        for wj in js:
            owners.setdefault(wj, []).append(ti)
    timed = []
    for ti, (li, text) in enumerate(tokens):
        spans = []
        for wj in matched.get(ti, []):
            share = owners[wj]
            w = wwords[wj]
            k, d = share.index(ti), (w["end"] - w["start"]) / len(share)
            spans.append((w["start"] + k * d, w["start"] + (k + 1) * d))
        start, end = min(s for s, _ in spans), max(e for _, e in spans)
        key = text.startswith("*") and text.endswith("*") and len(text) > 2
        timed.append((li, {"text": text.strip("*"), "start": round(start, 3),
                           "end": round(end, 3), "key": key}))
    cues = []
    for li in range(len(lines)):
        words = [w for l, w in timed if l == li]
        if words:
            cues.append({"start": words[0]["start"], "end": words[-1]["end"],
                         "words": words})
    return cues


def caption_slots(video, duration):
    """Caption anchor points that keep words off the speaker's face.

    Detects the face (OpenCV Haar cascade) on ~10 frames, takes the median
    box, then places slots in the free band above the head and below the
    chin, plus beside the face when there is room. Returns None (use the
    default slots) if no face is found or OpenCV is missing."""
    try:
        import cv2
    except ImportError:
        return None
    cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    cap = cv2.VideoCapture(video)
    boxes = []
    for i in range(10):
        cap.set(cv2.CAP_PROP_POS_MSEC, duration * 1000 * (i + 0.5) / 10)
        ok, frame = cap.read()
        if not ok:
            continue
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = cascade.detectMultiScale(gray, 1.1, 6, minSize=(w // 8, w // 8))
        if len(faces):
            x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
            boxes.append((x / w, y / h, (x + fw) / w, (y + fh) / h))
    cap.release()
    if not boxes:
        return None
    med = lambda k: sorted(b[k] for b in boxes)[len(boxes) // 2]
    left, top, right, bottom = med(0), med(1), med(2), med(3)
    face_h = bottom - top
    head_top = top - 0.35 * face_h          # hair above the detected box
    chin = bottom + 0.15 * face_h           # beard / jaw below it
    slots = []
    if head_top > 0.14:
        yt = max(0.09, head_top - 0.05)
        slots += [{"x": 0.3, "y": round(yt, 3)}, {"x": 0.7, "y": round(yt, 3)}]
    yb = min(0.8, chin + 0.1)
    slots += [{"x": 0.5, "y": round(yb, 3)}, {"x": 0.3, "y": round(min(0.86, yb + 0.07), 3)},
              {"x": 0.7, "y": round(min(0.86, yb + 0.07), 3)}]
    mid = round((top + bottom) / 2, 3)
    if left > 0.3:
        slots.append({"x": round(left / 2, 3), "y": mid})
    if right < 0.7:
        slots.append({"x": round((1 + right) / 2, 3), "y": mid})
    # Alternate between bands so consecutive phrases move visibly.
    top_band = [s for s in slots if s["y"] < top]
    rest = [s for s in slots if s["y"] >= top]
    order = []
    while top_band or rest:
        if rest:
            order.append(rest.pop(0))
        if top_band:
            order.append(top_band.pop(0))
    print(f"face box x {left:.2f}-{right:.2f} y {top:.2f}-{bottom:.2f}; "
          f"{len(order)} caption slots")
    return order


def main():
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    video, name = sys.argv[1], sys.argv[-1]
    captions = sys.argv[2] if len(sys.argv) == 4 else None
    os.makedirs(OUT, exist_ok=True)
    duration, width, height = probe(video)
    if captions is None:
        cues = transcribe(video)
    elif captions.lower().endswith(".txt") and os.path.isdir(MODEL):
        lines = [l.strip() for l in open(captions, encoding="utf-8-sig") if l.strip()]
        cues = align_to_whisper(lines, whisper_words(video))
    else:
        cues = parse_srt(captions) if captions.lower().endswith(".srt") \
            else align_text(video, duration, captions)
        cues = [{"start": c["start"], "end": c["end"], "words": split_words(c)}
                for c in cues]
    data = {
        "video": f"talking/{name}.mp4",
        "duration": duration,
        "width": width,
        "height": height,
        "cues": cues,
    }
    slots = caption_slots(video, duration)
    if slots:
        data["slots"] = slots
    shutil.copyfile(video, os.path.join(OUT, f"{name}.mp4"))
    with open(os.path.join(OUT, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    words = sum(len(c["words"]) for c in data["cues"])
    print(f"{name}: {duration:.1f}s {width}x{height}, {len(cues)} cues, {words} words")


if __name__ == "__main__":
    main()
