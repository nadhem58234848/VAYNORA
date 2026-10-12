// Transcribe a video's speech to Arabic words with timestamps, fully offline.
//
//   node scripts/transcribe.mjs <video> <out.json>
//
// Uses Whisper small (ONNX, q8) from .models/ — installed by the session
// start hook from the npm package "sts-whisper-small" (Xenova/whisper-small).
// Output: { words: [{ text, start, end }] } in seconds.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { env, pipeline } from "@huggingface/transformers";

const [video, out] = process.argv.slice(2);
if (!video || !out) {
  console.error("usage: node scripts/transcribe.mjs <video> <out.json>");
  process.exit(1);
}

env.localModelPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".models");
env.allowRemoteModels = false;

// 16 kHz mono float32 PCM, as Whisper expects.
const pcm = execFileSync(
  "ffmpeg",
  ["-v", "error", "-i", video, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
  { maxBuffer: 1 << 30 },
);
const audio = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);

const transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-small",
  { dtype: "q8", device: "cpu" },
);
const result = await transcriber(audio, {
  language: "arabic",
  task: "transcribe",
  return_timestamps: "word",
  chunk_length_s: 30,
  stride_length_s: 5,
});

const words = (result.chunks ?? [])
  .map((c) => ({
    text: c.text.trim(),
    start: c.timestamp[0],
    end: c.timestamp[1] ?? c.timestamp[0] + 0.3,
  }))
  .filter((w) => w.text);
writeFileSync(out, JSON.stringify({ text: result.text, words }, null, 1));
console.log(`${words.length} words`);
