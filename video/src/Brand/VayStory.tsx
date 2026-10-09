import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRoll } from "./Backgrounds";
import {
  BrandFrame,
  CallToAction,
  CaptionBox,
  Headline,
  RedSlash,
} from "./MotionGraphics";
import { BG, DETAIL, FONT, GRAY, RED } from "./theme";

// Reel version of the VAY carousel: each slide is two stacked panels split by
// a red line, each panel with its own caption, revealed one after the other.

type Panel = { src: string; caption: string; highlight?: string[] };
type Slide = { top: Panel; bottom: Panel; duration?: number };

const HOOK = 72;
const SLIDE = 84;
const BOTTOM_AT = 34; // frame inside a slide where the bottom panel comes in
const SLASH = 12;

const SLIDES: Slide[] = [
  {
    top: {
      src: "vay/s3a.jpg",
      caption: "عزلة خلف الشاشات",
      highlight: ["الشاشات"],
    },
    bottom: { src: "vay/s3b.jpg", caption: "وبُعد عمّن حولك" },
  },
  {
    top: {
      src: "vay/s4a.jpg",
      caption: "طاقة تُستنزف",
      highlight: ["تُستنزف"],
    },
    bottom: { src: "vay/s4b.jpg", caption: "وطموح يذبل" },
  },
  {
    top: { src: "vay/s5a.jpg", caption: "ذنب يخنقك", highlight: ["يخنقك"] },
    bottom: { src: "vay/s5b.jpg", caption: "وصورة مهزوزة عن نفسك" },
  },
  {
    top: { src: "vay/s6a.jpg", caption: "عقل مشتت", highlight: ["مشتت"] },
    bottom: { src: "vay/s6b.jpg", caption: "وتركيز يضيع" },
  },
  {
    top: { src: "vay/s7a.jpg", caption: "تدور في الحلقة نفسها" },
    bottom: {
      src: "vay/s7b.jpg",
      caption: "حتى تقرر أن تكسرها",
      highlight: ["تكسرها"],
    },
  },
  {
    top: {
      src: "vay/s8a.jpg",
      caption: "تحاول وحدك فتتعب",
      highlight: ["وحدك"],
    },
    bottom: { src: "vay/s8b.jpg", caption: "والانتكاس يترقّبك" },
  },
  {
    top: { src: "vay/s9a.jpg", caption: "هناك طريق آخر", highlight: ["آخر"] },
    bottom: { src: "vay/s9b.jpg", caption: "كتاب «معركة الخلوات»" },
    duration: 110,
  },
];

const starts = SLIDES.reduce<number[]>(
  (acc, s, i) => [
    ...acc,
    i === 0 ? HOOK : acc[i - 1] + (SLIDES[i - 1].duration ?? SLIDE),
  ],
  [],
);

export const VAY_STORY_DURATION =
  starts[starts.length - 1] + (SLIDES[SLIDES.length - 1].duration ?? SLIDE);

// Panel geometry for 1080x1920.
const PANEL_TOP = 170;
const PANEL_HEIGHT = 780;
const DIVIDER = 6;

const PanelView: React.FC<{ panel: Panel; y: number }> = ({ panel, y }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const reveal = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        width,
        height: PANEL_HEIGHT,
        overflow: "hidden",
        clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`,
      }}
    >
      <BRoll src={panel.src} grade="none" />
      <Sequence from={6} layout="none">
        <CaptionBox
          text={panel.caption}
          highlight={panel.highlight}
          style={{ bottom: 40 }}
        />
      </Sequence>
    </div>
  );
};

const SlideView: React.FC<{ slide: Slide; duration: number }> = ({
  slide,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const divider = interpolate(frame, [BOTTOM_AT - 8, BOTTOM_AT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence durationInFrames={duration} layout="none">
        <PanelView panel={slide.top} y={PANEL_TOP} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: PANEL_TOP + PANEL_HEIGHT,
          right: 0,
          width: width * divider,
          height: DIVIDER,
          backgroundColor: RED,
        }}
      />
      <Sequence
        from={BOTTOM_AT}
        durationInFrames={duration - BOTTOM_AT}
        layout="none"
      >
        <PanelView
          panel={slide.bottom}
          y={PANEL_TOP + PANEL_HEIGHT + DIVIDER}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const Handle: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
    <div
      style={{
        fontFamily: FONT,
        fontWeight: DETAIL,
        fontSize: 26,
        color: GRAY,
        marginBottom: 70,
      }}
    >
      @vaynora_
    </div>
  </AbsoluteFill>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.18]);
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Img
        src={staticFile("vay/vay-poster.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          opacity: 0.45,
        }}
      />
      <Headline
        lines={["تعبت من الإباحية", "والعادة السرية؟"]}
        highlight={["الإباحية"]}
        sub="حاولت أكثر من مرة وتعثّرت؟"
        size={0.105}
      />
    </AbsoluteFill>
  );
};

export const VayStory: React.FC = () => {
  const total = SLIDES.length + 1;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence durationInFrames={HOOK}>
        <Hook />
        <BrandFrame counter={`1/${total}`} />
      </Sequence>
      {SLIDES.map((slide, i) => {
        const duration = slide.duration ?? SLIDE;
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={duration}>
            <SlideView slide={slide} duration={duration} />
            <BrandFrame counter={`${i + 2}/${total}`} />
            {i < SLIDES.length - 1 ? <Handle /> : null}
          </Sequence>
        );
      })}
      <Sequence from={starts[starts.length - 1] + BOTTOM_AT + 20}>
        <CallToAction text="الرابط في البايو" variant="solid" bottom={0.028} />
      </Sequence>
      {starts.map((start) => (
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
