import { AbsoluteFill, Sequence } from "remotion";
import { BRoll, EmberBackground } from "./Backgrounds";
import {
  BrandFrame,
  CallToAction,
  Headline,
  RedSlash,
  Staccato,
} from "./MotionGraphics";
import { BG } from "./theme";

type Shot = {
  duration: number;
  // Path inside public/, e.g. "broll/gym.mp4". Without it: ember background.
  broll?: string;
  zoom?: "in" | "out";
  content: React.ReactNode;
};

// Edit decision list for the reel (30fps). Shots play back to back.
const SHOTS: Shot[] = [
  {
    duration: 75,
    content: (
      <Staccato
        words={["ضعتُ.", "سُجنتُ.", "انتكستُ.", "ثم قمتُ."]}
        beat={14}
      />
    ),
  },
  {
    duration: 90,
    content: (
      <Headline
        kicker="التوبة النصوحة"
        lines={["الإقلاع عن الإدمان", "يبدأ من توبة", "لا رجعة فيها"]}
        highlight={["توبة"]}
        sub="التغيير الحقيقي لا يبدأ بقرار عابر"
        size={0.1}
      />
    ),
  },
  {
    duration: 90,
    zoom: "out",
    content: (
      <Headline
        lines={["اترك العادة", "90 يومًا", "وشاهد ما سيحدث لك"]}
        highlight={["90", "يومًا"]}
        sub="يومًا بيوم"
        size={0.1}
      />
    ),
  },
  {
    duration: 90,
    content: (
      <>
        <Headline
          lines={["اصنع من", "الألم قوة"]}
          highlight={["الألم", "قوة"]}
          size={0.14}
        />
        <Sequence from={25}>
          <CallToAction text="تابع @vaynora_" />
        </Sequence>
      </>
    ),
  },
];

const SLASH = 12;

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].duration],
  [],
);

export const BRAND_REEL_DURATION =
  starts[starts.length - 1] + SHOTS[SHOTS.length - 1].duration;

export const BrandReel: React.FC = () => {
  const total = String(SHOTS.length).padStart(2, "0");
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {SHOTS.map((shot, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={shot.duration}>
          {shot.broll ? (
            <BRoll src={shot.broll} zoom={shot.zoom} />
          ) : (
            <EmberBackground />
          )}
          {shot.content}
          <BrandFrame
            counter={`${String(i + 1).padStart(2, "0")} / ${total}`}
          />
        </Sequence>
      ))}
      {starts.slice(1).map((start) => (
        <Sequence
          key={`slash-${start}`}
          from={start - SLASH / 2}
          durationInFrames={SLASH}
        >
          <RedSlash />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
