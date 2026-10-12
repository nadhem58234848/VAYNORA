import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BG, DEEP_RED, RED } from "./theme";

// B-roll shot (image or video from public/) with a slow push-in and the
// brand grade: desaturated, crushed blacks, red multiply, heavy vignette.
// grade="none" keeps footage that is already on-brand (e.g. the VAY art).
export const BRoll: React.FC<{
  src: string;
  zoom?: "in" | "out";
  grade?: "red" | "none";
}> = ({ src, zoom = "in", grade = "red" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  const scale =
    zoom === "in"
      ? interpolate(p, [0, 1], [1.05, 1.18])
      : interpolate(p, [0, 1], [1.18, 1.05]);
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${scale})`,
    filter:
      grade === "red"
        ? "grayscale(0.85) contrast(1.3) brightness(0.9)"
        : "none",
  };
  const isVideo = /\.(mp4|mov|webm)$/i.test(src);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {isVideo ? (
        <OffthreadVideo src={staticFile(src)} muted style={style} />
      ) : (
        <Img src={staticFile(src)} style={style} />
      )}
      {grade === "red" ? (
        <>
          <AbsoluteFill
            style={{
              backgroundColor: RED,
              mixBlendMode: "multiply",
              opacity: 0.45,
            }}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(to bottom, ${BG}00 30%, ${BG} 95%), radial-gradient(ellipse at center, transparent 45%, ${BG} 100%)`,
            }}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// Rising red embers on a transparent layer (overlay on any shot).
export const Embers: React.FC<{ count?: number; seed?: string }> = ({
  count = 40,
  seed = "e",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {new Array(count).fill(true).map((_, i) => {
        const speed = 2 + random(`${seed}s${i}`) * 4;
        const size = 2 + random(`${seed}z${i}`) * 5;
        const x = random(`${seed}x${i}`) * width;
        const y =
          height -
          ((frame * speed + random(`${seed}y${i}`) * height) % (height * 1.1));
        const drift = Math.sin((frame + i * 13) / 18) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + drift,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: RED,
              boxShadow: `0 0 ${size * 3}px ${RED}`,
              opacity: interpolate(y, [0, height], [0, 0.9]),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Slow red glow breathing in from the bottom of a shot.
export const GlowPulse: React.FC<{ strength?: number }> = ({
  strength = 0.35,
}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 14), [-1, 1], [0.4, 1]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 100%, ${RED} 0%, transparent 60%)`,
        mixBlendMode: "screen",
        opacity: strength * pulse,
        pointerEvents: "none",
      }}
    />
  );
};

// Stand-in when there is no B-roll yet: dark red glow with rising embers.
export const EmberBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.55, 0.85]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 85%, ${DEEP_RED} 0%, ${BG} 65%)`,
          opacity: pulse,
        }}
      />
      <Embers />
    </AbsoluteFill>
  );
};
