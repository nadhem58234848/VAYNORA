#!/bin/bash
# Prepares the Remotion video project (video/) in Claude Code cloud sessions,
# so renders, lint, the SFX script and offline transcription work as soon as
# the session starts.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/video"

# npm install (not ci) so the cached container state is reused between runs.
# onnxruntime-node ships its CPU binary; skip its optional GPU download.
ONNXRUNTIME_NODE_INSTALL_CUDA=skip ONNXRUNTIME_NODE_INSTALL=skip \
  npm install --no-audit --no-fund --loglevel=error

# numpy: scripts/make-sfx.py. OpenCV 4 (bundles the Haar face detector,
# which OpenCV 5 dropped): face-aware caption slots in prepare-talking.py.
python3 -c "import numpy" 2>/dev/null || pip install --quiet numpy
python3 -c "import cv2, os; assert os.path.exists(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')" 2>/dev/null \
  || pip install --quiet "opencv-python-headless<5"

# Whisper small (ONNX q8) for scripts/transcribe.mjs. huggingface.co is not
# reachable from the cloud environment, so the model comes from the npm
# package that bundles it (data files only; fetched with npm pack, no scripts).
MODEL=.models/Xenova/whisper-small
if [ ! -f "$MODEL/onnx/decoder_model_merged_quantized.onnx" ]; then
  tmp=$(mktemp -d)
  (cd "$tmp" && npm pack sts-whisper-small@1.0.0 --ignore-scripts --loglevel=error >/dev/null \
    && tar -xzf sts-whisper-small-1.0.0.tgz)
  mkdir -p .models
  rm -rf "$MODEL"
  cp -r "$tmp/package/models/Xenova" .models/
  rm -rf "$tmp"
fi
