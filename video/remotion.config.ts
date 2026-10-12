// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// In Claude Code cloud sessions Remotion cannot download its own browser,
// so use the Chromium headless shell that ships with the container.
const CLOUD_BROWSER =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(CLOUD_BROWSER)) {
  Config.setBrowserExecutable(CLOUD_BROWSER);
}
