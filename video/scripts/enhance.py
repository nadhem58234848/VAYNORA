"""Automatic picture and sound clean-up for raw phone footage.

  python3 scripts/enhance.py <in-video> <out.mp4> [--compare before_after.png]

Picture: measures the brightness of the frame centre (where the speaker is)
on a few frames to set exposure, then applies a warm grade (natural skin on
cold phone footage), light contrast, denoise and sharpening. Sound: rumble cut, noise reduction, de-essing, gentle
compression and loudness normalisation to Instagram's -14 LUFS.
Output: 1080x1920 H.264 high quality, AAC 48 kHz.
"""

import argparse
import json
import os
import subprocess
import tempfile

from PIL import Image, ImageStat


def run(*cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def duration(video):
    out = run("ffprobe", "-v", "error", "-show_entries", "format=duration",
              "-of", "json", video).stdout
    return float(json.loads(out)["format"]["duration"])


def measure(video, tmp):
    """Mean RGB and luma of the frame centre over ~8 frames."""
    d = duration(video)
    sums, n = [0.0, 0.0, 0.0], 0
    for i in range(8):
        path = os.path.join(tmp, f"m{i}.png")
        run("ffmpeg", "-v", "error", "-y", "-ss", f"{d * (i + 0.5) / 8:.2f}",
            "-i", video, "-frames:v", "1", "-vf", "scale=360:-2", path)
        im = Image.open(path).convert("RGB")
        w, h = im.size
        centre = im.crop((int(w * 0.25), int(h * 0.25), int(w * 0.75), int(h * 0.7)))
        for c, v in enumerate(ImageStat.Stat(centre).mean):
            sums[c] += v
        n += 1
    r, g, b = (s / n for s in sums)
    return r, g, b, 0.299 * r + 0.587 * g + 0.114 * b


def picture_filter(luma):
    # Exposure: lift dark footage toward ~120 luma, calm very bright footage.
    gamma = max(0.9, min(1.35, (120 / max(luma, 1)) ** 0.5 * 1.03))
    return ",".join([
        "hqdn3d=1.5:1.5:4:4",
        # Warm grade: phone footage (especially outdoors at dusk) comes out
        # cold and grey-skinned. A neutral grey-world fix makes skin worse,
        # so warm the shadows/mid-tones and keep highlights (sky) mostly blue.
        "colorbalance=rs=0.03:bs=-0.03:rm=0.08:gm=0.01:bm=-0.07:rh=0.03:bh=-0.04",
        f"eq=contrast=1.1:saturation=1.1:gamma={gamma:.3f}",
        "unsharp=5:5:0.45:5:5:0.0",
        "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos",
        "crop=1080:1920",
        "format=yuv420p",
    ])


SOUND = ",".join([
    "highpass=f=80",
    "afftdn=nf=-28",
    "deesser=i=0.4",
    "acompressor=threshold=-20dB:ratio=3:attack=8:release=180:makeup=2",
    "loudnorm=I=-14:TP=-1.5:LRA=9",
    "aresample=48000",
])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--compare", help="write a before/after still here")
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        r, g, b, luma = measure(args.src, tmp)
        vf = picture_filter(luma)
        print(f"centre RGB {r:.0f}/{g:.0f}/{b:.0f}, luma {luma:.0f}")
        print("video:", vf)
        run("ffmpeg", "-v", "error", "-y", "-i", args.src,
            "-vf", vf, "-af", SOUND,
            "-c:v", "libx264", "-preset", "slow", "-crf", "16",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
            args.out)

        if args.compare:
            t = f"{duration(args.src) * 0.3:.2f}"
            a, z = os.path.join(tmp, "a.png"), os.path.join(tmp, "z.png")
            for src, path in ((args.src, a), (args.out, z)):
                run("ffmpeg", "-v", "error", "-y", "-ss", t, "-i", src,
                    "-frames:v", "1", "-vf", "scale=540:960", path)
            before, after = Image.open(a), Image.open(z)
            sheet = Image.new("RGB", (1090, 960), "white")
            sheet.paste(before, (0, 0))
            sheet.paste(after, (550, 0))
            sheet.save(args.compare)


if __name__ == "__main__":
    main()
