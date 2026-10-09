import { continueRender, delayRender, staticFile } from "remotion";

// Brand identity taken from the Instagram account. See ../../CLAUDE.md.
export const RED = "#C62828";
export const DEEP_RED = "#4A0606";
export const BG = "#0B0B0B";
export const WHITE = "#F2F2F2";
export const GRAY = "#8A8A8A";

export const TAGLINE = "TURN PAIN INTO POWER";
export const BRAND = "VAYNORA";

// Cairo is bundled in public/fonts so renders never depend on the network.
export const FONT = "Cairo";

const ARABIC_RANGE =
  "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

const handle = delayRender("Loading Cairo");
Promise.all(
  ["400", "700", "900"].flatMap((weight) =>
    (
      [
        ["arabic", ARABIC_RANGE],
        ["latin", LATIN_RANGE],
      ] as const
    ).map(([subset, unicodeRange]) =>
      new FontFace(
        FONT,
        `url(${staticFile(`fonts/cairo-${subset}-${weight}-normal.woff2`)}) format('woff2')`,
        { weight, unicodeRange },
      )
        .load()
        .then((face) => document.fonts.add(face)),
    ),
  ),
).then(() => continueRender(handle));
