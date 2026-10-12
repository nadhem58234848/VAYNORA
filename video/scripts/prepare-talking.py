"""Prepare a talking-head Reel for word-by-word captions (TalkingReel).

Usage (from video/):
  python3 scripts/prepare-talking.py <video> <captions.srt|script.txt> <name>

- With an .srt (e.g. CapCut auto-captions export) the cue timings are used.
- With a .txt (one phrase per line) timings are estimated from the speech
  pauses in the audio (ffmpeg silencedetect). Less precise than an SRT.
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


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    video, captions, name = sys.argv[1:]
    os.makedirs(OUT, exist_ok=True)
    duration, width, height = probe(video)
    cues = parse_srt(captions) if captions.lower().endswith(".srt") \
        else align_text(video, duration, captions)
    data = {
        "video": f"talking/{name}.mp4",
        "duration": duration,
        "width": width,
        "height": height,
        "cues": [{"start": c["start"], "end": c["end"], "words": split_words(c)}
                 for c in cues],
    }
    shutil.copyfile(video, os.path.join(OUT, f"{name}.mp4"))
    with open(os.path.join(OUT, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    words = sum(len(c["words"]) for c in data["cues"])
    print(f"{name}: {duration:.1f}s {width}x{height}, {len(cues)} cues, {words} words")


if __name__ == "__main__":
    main()
