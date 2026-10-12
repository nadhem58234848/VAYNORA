import {
  AbsoluteFill,
  CalculateMetadataFunction,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SoundEffect } from "./Sound";
import { BG, FONT, GRAY, HEADLINE, RED, WHITE } from "./theme";

// Talking-head Reel with word-by-word captions that jump between positions
// around the speaker. Data comes from scripts/prepare-talking.py.

type Word = { text: string; start: number; end: number; key: boolean };
type Cue = { start: number; end: number; words: Word[] };
type Slot = { x: number; y: number };
type TalkingData = {
  video: string;
  duration: number;
  cues: Cue[];
  slots?: Slot[]; // face-aware positions from prepare-talking.py
};

export type TalkingReelProps = {
  name: string; // public/talking/<name>.json
  handle: string;
  data?: TalkingData; // filled in by calculateMetadata
};

const FPS = 30;
const END_CARD = 60;

// Caption anchor points (fractions of width/height), chosen around the face.
// A new cue (phrase) moves to the next slot; words of a cue share a slot.
const SLOTS = [
  { x: 0.27, y: 0.5 },
  { x: 0.73, y: 0.5 },
  { x: 0.5, y: 0.74 },
  { x: 0.3, y: 0.15 },
  { x: 0.7, y: 0.15 },
];

export const calculateTalkingMetadata: CalculateMetadataFunction<
  TalkingReelProps
> = async ({ props }) => {
  const res = await fetch(staticFile(`talking/${props.name}.json`));
  const data = (await res.json()) as TalkingData;
  return {
    durationInFrames: Math.ceil(data.duration * FPS) + END_CARD,
    props: { ...props, data },
  };
};

const CaptionWord: React.FC<{ word: Word; slot: Slot }> = ({ word, slot }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { x, y } = slot;
  const base = width * (word.key ? 0.12 : 0.1);
  // Long words shrink so they never leave their half of the screen.
  const fontSize = Math.min(base, (width * 0.44) / (word.text.length * 0.55));
  const pop = interpolate(frame, [0, 4], [word.key ? 1.3 : 1.08, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x * width,
        top: y * height,
        transform: `translate(-50%, -50%) scale(${pop})`,
        direction: "rtl",
        whiteSpace: "nowrap",
        fontFamily: FONT,
        fontWeight: HEADLINE,
        fontSize,
        color: word.key ? RED : WHITE,
        textShadow:
          "0 4px 0 rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6), 0 0 4px rgba(0,0,0,0.9)",
      }}
    >
      {word.text}
    </div>
  );
};

const EndCard: React.FC<{ handle: string }> = ({ handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 10], [0, 0.82], {
    extrapolateRight: "clamp",
  });
  const enter = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: BG, opacity: fade }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          transform: `scale(${enter})`,
        }}
      >
        <div
          style={{
            direction: "rtl",
            fontWeight: HEADLINE,
            fontSize: 64,
            color: WHITE,
            border: `4px solid ${RED}`,
            borderRadius: 80,
            padding: "10px 60px",
          }}
        >
          تابع
        </div>
        <div
          style={{
            marginTop: 30,
            fontWeight: HEADLINE,
            fontSize: 58,
            color: WHITE,
          }}
        >
          {handle}
        </div>
        <div
          style={{ width: 160, height: 6, background: RED, marginTop: 26 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TalkingReel: React.FC<TalkingReelProps> = ({ handle, data }) => {
  const { width, height } = useVideoConfig();
  if (!data) return null;
  const slots = data.slots?.length ? data.slots : SLOTS;
  const end = Math.ceil(data.duration * FPS);
  const f = (seconds: number) => Math.round(seconds * FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <OffthreadVideo
        src={staticFile(data.video)}
        style={{ width, height, objectFit: "cover" }}
      />
      {data.cues.map((cue, c) => (
        <Sequence key={`cue-${c}`} from={f(cue.start)} layout="none">
          {cue.words.map((word, w) => {
            const next = cue.words[w + 1];
            // A word stays until the next word, or briefly past the cue
            // end — but never into the next phrase (no two words at once).
            const nextCue = data.cues[c + 1];
            const until = next
              ? next.start
              : Math.min(cue.end + 0.15, nextCue ? nextCue.start : Infinity);
            return (
              <Sequence
                key={w}
                from={f(word.start - cue.start)}
                durationInFrames={Math.max(1, f(until - word.start))}
                layout="none"
              >
                <CaptionWord word={word} slot={slots[c % slots.length]} />
                {word.key ? <SoundEffect type="hit" at={0} /> : null}
              </Sequence>
            );
          })}
        </Sequence>
      ))}
      {/* Whoosh into every new caption position (not the first one). */}
      {data.cues.slice(1).map((cue, c) => (
        <SoundEffect key={`whoosh-${c}`} type="whoosh" at={f(cue.start) - 6} />
      ))}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: width * 0.008,
          height,
          backgroundColor: RED,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: HEADLINE,
          fontSize: 28,
          color: GRAY,
          textShadow: "0 2px 6px rgba(0,0,0,0.8)",
        }}
      >
        {handle}
      </div>
      <Sequence from={end - 10}>
        <EndCard handle={handle} />
        <SoundEffect type="impact" at={4} />
      </Sequence>
    </AbsoluteFill>
  );
};
