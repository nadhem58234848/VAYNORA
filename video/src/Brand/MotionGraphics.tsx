import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, FONT, GRAY, RED, TAGLINE, WHITE } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Persistent frame like the Instagram posts: tagline top-left, brand
// top-right, slide counter, red edge bar on the left.
export const BrandFrame: React.FC<{ counter?: string }> = ({ counter }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pad = width * 0.06;
  const small = width * 0.022;
  const bar = interpolate(frame, [0, 20], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const label: React.CSSProperties = {
    position: "absolute",
    top: pad,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: small,
    letterSpacing: small * 0.25,
    color: GRAY,
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: width * 0.008,
          height: height * bar,
          backgroundColor: RED,
        }}
      />
      <div style={{ ...label, left: pad }}>{counter ?? TAGLINE}</div>
      <div style={{ ...label, right: pad, color: WHITE }}>{BRAND}</div>
    </AbsoluteFill>
  );
};

// Arabic headline. Each line slides up from a mask; words in `highlight`
// are drawn in red. A short red rule draws in underneath.
export const Headline: React.FC<{
  lines: string[];
  highlight?: string[];
  kicker?: string;
  sub?: string;
  size?: number;
}> = ({ lines, highlight = [], kicker, sub, size = 0.11 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const fontSize = width * size;
  const rule = interpolate(
    frame,
    [12 + lines.length * 4, 30 + lines.length * 4],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );
  const subIn = interpolate(
    frame,
    [20 + lines.length * 4, 32 + lines.length * 4],
    [0, 1],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        fontFamily: FONT,
        padding: width * 0.08,
      }}
    >
      {kicker ? (
        <div
          style={{
            color: RED,
            fontWeight: 700,
            fontSize: fontSize * 0.28,
            marginBottom: fontSize * 0.2,
            opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          }}
        >
          {kicker}
        </div>
      ) : null}
      {lines.map((line, i) => {
        const enter = spring({
          frame: frame - i * 4,
          fps,
          config: { damping: 200 },
        });
        return (
          <div
            key={line}
            style={{ overflow: "hidden", paddingBottom: fontSize * 0.05 }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize,
                lineHeight: 1.25,
                textAlign: "center",
                transform: `translateY(${(1 - enter) * 110}%)`,
              }}
            >
              {line.split(" ").map((word, w) => (
                <span
                  key={w}
                  style={{ color: highlight.includes(word) ? RED : WHITE }}
                >
                  {word}{" "}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      <div
        style={{
          height: fontSize * 0.06,
          width: fontSize * 1.6 * rule,
          backgroundColor: RED,
          marginTop: fontSize * 0.2,
        }}
      />
      {sub ? (
        <div
          style={{
            color: GRAY,
            fontWeight: 400,
            fontSize: fontSize * 0.3,
            marginTop: fontSize * 0.25,
            textAlign: "center",
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 20}px)`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// One word per beat, hard cuts, last word in red ("ضعتُ. سُجنتُ. ... ثم قمتُ.").
export const Staccato: React.FC<{ words: string[]; beat?: number }> = ({
  words,
  beat = 12,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const fontSize = width * 0.16;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        direction: "rtl",
        fontFamily: FONT,
        padding: width * 0.1,
        flexDirection: "column",
      }}
    >
      {words.map((word, i) => {
        const local = frame - i * beat;
        if (local < 0) return null;
        const last = i === words.length - 1;
        const punch = interpolate(local, [0, 4], [1.25, 1], clamp);
        return (
          <div
            key={word}
            style={{
              fontWeight: 900,
              fontSize,
              lineHeight: 1.2,
              color: last ? RED : WHITE,
              transform: `scale(${punch})`,
              transformOrigin: "right center",
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Outlined red pill call-to-action, e.g. "اسحب لتعرف ما ينتظرك".
export const CallToAction: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const fontSize = width * 0.04;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          bottom: height * 0.14,
          direction: "rtl",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize,
          color: WHITE,
          border: `3px solid ${RED}`,
          borderRadius: fontSize * 2,
          padding: `${fontSize * 0.35}px ${fontSize * 1.1}px`,
          transform: `scale(${enter})`,
        }}
      >
        {text} ←
      </div>
    </AbsoluteFill>
  );
};

// Red flash + slash between shots, sits over the cut.
export const RedSlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const x = interpolate(frame, [0, 12], [-1.5, 1.5], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const flash = interpolate(frame, [5, 6, 9], [0, 0.35, 0], clamp);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundColor: RED, opacity: flash }} />
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          width: width * 0.9,
          height: "200%",
          marginLeft: -width * 0.45,
          backgroundColor: RED,
          transform: `translateX(${x * width}px) skewX(-18deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
