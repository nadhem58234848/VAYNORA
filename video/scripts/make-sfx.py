"""Synthesize the brand's sound effects into public/sfx/ (no music, no beats).

Run from the video/ folder:  python3 scripts/make-sfx.py
Every effect is noise or a single falling/rising tone, so none of them is music.
"""

import os
import subprocess
import wave

import numpy as np

RATE = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(7)


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be a per-sample array (Hz)."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / RATE)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def t(seconds):
    return np.arange(int(seconds * RATE)) / RATE


def fade(x, ms_in=5, ms_out=30):
    n_in, n_out = int(RATE * ms_in / 1000), int(RATE * ms_out / 1000)
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def save(name, left, right=None, peak=0.89):
    right = left if right is None else right
    stereo = np.stack([left, right], axis=1)
    stereo = stereo / (np.abs(stereo).max() + 1e-9) * peak
    data = (stereo * 32767).astype("<i2").tobytes()
    with wave.open(os.path.join(OUT, name), "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes(data)


def whoosh(seconds=0.55):
    # Noise through a band that sweeps up then down, panned left to right.
    x = t(seconds)
    p = x / seconds
    noise = rng.standard_normal(len(x))
    cutoff = 300 + 5000 * np.sin(np.pi * p) ** 2
    band = highpass(lowpass(noise, cutoff), 150)
    env = np.sin(np.pi * p) ** 1.5
    sig = fade(band * env)
    return sig * (1 - p * 0.7), sig * (0.3 + p * 0.7)


def impact(seconds=1.4):
    # Sub drop (120 Hz -> 40 Hz) with a short noise transient, saturated.
    x = t(seconds)
    freq = 40 + 80 * np.exp(-x * 9)
    phase = 2 * np.pi * np.cumsum(freq) / RATE
    sub = np.sin(phase) * np.exp(-x * 3.2)
    click = lowpass(rng.standard_normal(len(x)), 2500) * np.exp(-x * 60)
    sig = np.tanh(2.2 * (sub + 0.6 * click))
    return fade(sig, 1, 120), None


def hit(seconds=0.35):
    # Soft low thud for captions appearing.
    x = t(seconds)
    freq = 70 + 110 * np.exp(-x * 25)
    body = np.sin(2 * np.pi * np.cumsum(freq) / RATE) * np.exp(-x * 14)
    tick = highpass(rng.standard_normal(len(x)), 3000) * np.exp(-x * 160)
    return fade(body + 0.25 * tick, 1, 40), None


def riser(seconds=1.6):
    # Filtered noise opening up, getting louder, cut sharply at the end.
    x = t(seconds)
    p = x / seconds
    noise = rng.standard_normal(len(x))
    sig = highpass(lowpass(noise, 400 + 7000 * p**2), 200 + 1500 * p)
    sig *= p**2.2
    return fade(sig, 5, 8), None


def room(seconds=60.5):
    # Very low dark wind bed (noise only, no pitch), 60 s so Reels never loop it.
    x = t(seconds)
    noise = rng.standard_normal(len(x))
    wobble = 180 + 90 * np.sin(2 * np.pi * x / seconds)
    sig = lowpass(lowpass(noise, wobble), 400)
    n = int(RATE * 0.5)
    sig[:n] = sig[:n] * np.linspace(0, 1, n) + sig[-n:] * np.linspace(1, 0, n)
    return sig[: len(sig) - n], None


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [
        ("whoosh.wav", whoosh),
        ("impact.wav", impact),
        ("hit.wav", hit),
        ("riser.wav", riser),
        ("room.wav", room),
    ]:
        save(name, *fn())
        print("wrote", name)
    # The 60 s bed is large as WAV: keep it as a 128k MP3.
    room = os.path.join(OUT, "room.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", room, "-b:a", "128k",
         os.path.join(OUT, "room.mp3")],
        check=True,
    )
    os.remove(room)
    print("wrote room.mp3")
