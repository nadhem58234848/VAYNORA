#!/bin/bash
# Prepares the Remotion video project (video/) in Claude Code cloud sessions,
# so renders, lint and the SFX script work as soon as the session starts.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/video"

# npm install (not ci) so the cached container state is reused between runs.
npm install --no-audit --no-fund --loglevel=error

# numpy is needed by scripts/make-sfx.py.
python3 -c "import numpy" 2>/dev/null || pip install --quiet numpy
