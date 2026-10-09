import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BG,
  BODY,
  BRAND,
  DETAIL,
  FONT,
  GRAY,
  HEADLINE,
  MARGIN,
  RED,
  WHITE,
} from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Signature frame from the brand guide: red vertical bar on the right edge,
// spaced-out VAYNORA at the top, slide counter pill top-left.
export const BrandFrame: React.FC<{ counter?: string }> = ({ counter }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const small = width * 0.022;
  const bar = interpolate(frame, [0, 20], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: width * 0.008,
          height: height * bar,
          backgroundColor: RED,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: MARGIN * 0.8,
          width: "100%",
          textAlign: "center",
          fontWeight: HEADLINE,
          fontSize: small,
          letterSpacing: small * 0.45,
          color: GRAY,
        }}
      >
        {BRAND}
      </div>
      {counter ? (
        <div
          style={{
            position: "absolute",
            top: MARGIN * 0.65,
            left: MARGIN * 0.6,
            fontWeight: BODY,
            fontSize: small,
            color: GRAY,
            border: `1px solid rgba(242,239,233,0.14)`,
            borderRadius: 4,
            padding: `${small * 0.15}px ${small * 0.5}px`,
          }}
        >
          {counter}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Words in `highlight` are drawn red, everything else white.
const Words: React.FC<{ text: string; highlight: string[] }> = ({
  text,
  highlight,
}) => (
  <>
    {text.split(" ").map((word, w) => (
      <span key={w} style={{ color: highlight.includes(word) ? RED : WHITE }}>
        {word}{" "}
      </span>
    ))}
  </>
);

// Arabic headline. Each line slides up from a mask; a short red rule draws
// in underneath, then a gray subtitle fades up.
export const Headline: React.FC<{
  lines: string[];
  highlight?: string[];
  kicker?: string;
  sub?: string;
  // Off-white instead of gray when the subline sits on a busy image.
  subColor?: string;
  size?: number;
}> = ({ lines, highlight = [], kicker, sub, subColor = GRAY, size = 0.1 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const fontSize = width * size;
  const after = 12 + lines.length * 4;
  const rule = interpolate(frame, [after, after + 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const subIn = interpolate(frame, [after + 8, after + 20], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        fontFamily: FONT,
        padding: MARGIN,
      }}
    >
      {kicker ? (
        <div
          style={{
            color: RED,
            fontWeight: BODY,
            fontSize: fontSize * 0.3,
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
                fontWeight: HEADLINE,
                fontSize,
                lineHeight: 1.3,
                textAlign: "center",
                transform: `translateY(${(1 - enter) * 110}%)`,
              }}
            >
              <Words text={line} highlight={highlight} />
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
            color: subColor,
            fontWeight: DETAIL,
            fontSize: fontSize * 0.32,
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

// Caption in a dark rounded box, like the captions on the carousel panels.
// The box scales in, then the text slides up inside it.
export const CaptionBox: React.FC<{
  text: string;
  highlight?: string[];
  style?: React.CSSProperties;
}> = ({ text, highlight = [], style }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const box = spring({ frame, fps, config: { damping: 200 } });
  const txt = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const fontSize = width * 0.068;

  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN,
        right: MARGIN,
        display: "flex",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(10,10,10,0.82)",
          borderRadius: fontSize * 0.3,
          padding: `${fontSize * 0.15}px ${fontSize * 0.6}px`,
          overflow: "hidden",
          transform: `scaleX(${box})`,
        }}
      >
        <div
          style={{
            direction: "rtl",
            fontFamily: FONT,
            fontWeight: HEADLINE,
            fontSize,
            lineHeight: 1.45,
            textAlign: "center",
            transform: `translateY(${(1 - txt) * 110}%)`,
          }}
        >
          <Words text={text} highlight={highlight} />
        </div>
      </div>
    </div>
  );
};

// One word per beat, punch-in, last word red ("ضعتُ. سُجنتُ. ... ثم قمتُ.").
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
        padding: MARGIN,
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
              fontWeight: HEADLINE,
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

// Call to action. "solid": red block with black button text (the carousel's
// last slide); "outline": red outlined pill.
export const CallToAction: React.FC<{
  text: string;
  variant?: "outline" | "solid";
  bottom?: number;
}> = ({ text, variant = "outline", bottom = 0.14 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const fontSize = width * 0.045;
  const solid = variant === "solid";

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          bottom: height * bottom,
          direction: "rtl",
          fontFamily: FONT,
          fontWeight: HEADLINE,
          fontSize,
          color: WHITE,
          backgroundColor: solid ? RED : "transparent",
          border: solid ? "none" : `3px solid ${RED}`,
          borderRadius: solid ? 4 : fontSize * 2,
          padding: `${fontSize * 0.35}px ${fontSize * 1.1}px`,
          transform: `scale(${enter})`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Red slash + short red flash over a cut.
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
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          width: width * 0.06,
          height: "200%",
          backgroundColor: BG,
          transform: `translateX(${(x - 0.12) * width}px) skewX(-18deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Camera shake that kicks in at each frame in `hits` and dies out quickly.
// Returns a CSS transform to put on the shaken layer.
export const useShake = (hits: number[], strength = 14) => {
  const frame = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const hit of hits) {
    const local = frame - hit;
    if (local < 0 || local > 12) continue;
    const amp = strength * Math.exp(-local / 3.5);
    x += amp * Math.sin(local * 2.7 + hit);
    y += amp * Math.cos(local * 3.1 + hit);
  }
  return `translate(${x}px, ${y}px)`;
};
