import { AbsoluteFill, Img, staticFile } from "remotion";
import { BG, FONT, GRAY, HEADLINE, RED, SERIF, WHITE } from "./theme";

// Static 1080x1440 carousel slides in the VAY carousel format: two stacked
// panels split by a thin red line, captions in dark rounded boxes, vertical
// VAYNORA on the left edge, counter pill top-right. Images come from ChatGPT
// without text; all Arabic text is set here in Cairo.

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1440;
const DIVIDER_Y = 712;
const DIVIDER = 6;

type Caption = { text: string; highlight?: string[] };
type Panel = Caption & {
  src?: string; // path in public/; missing = placeholder
  position?: string; // CSS object-position, e.g. "center 30%"
  lift?: number; // brightness multiplier for images that come out too dark
};

export type CarouselSlide =
  | { kind: "split"; top: Panel; bottom: Panel }
  | {
      kind: "full";
      src?: string;
      position?: string;
      lift?: number;
      title: Caption;
      sub?: Caption;
    };

const Words: React.FC<Caption> = ({ text, highlight = [] }) => (
  <>
    {text.split(" ").map((word, i) => (
      <span key={i} style={{ color: highlight.includes(word) ? RED : WHITE }}>
        {word}{" "}
      </span>
    ))}
  </>
);

const Picture: React.FC<{
  src?: string;
  position?: string;
  lift?: number;
}> = ({ src, position = "center", lift = 1 }) =>
  src ? (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: position,
        filter: lift === 1 ? undefined : `brightness(${lift})`,
      }}
    />
  ) : (
    <AbsoluteFill
      style={{
        backgroundColor: "#151515",
        justifyContent: "center",
        alignItems: "center",
        color: GRAY,
        fontFamily: FONT,
        fontSize: 36,
      }}
    >
      صورة قادمة
    </AbsoluteFill>
  );

const CaptionBox: React.FC<Caption & { bottom: number; size?: number }> = ({
  bottom,
  size = 66,
  ...caption
}) => (
  <div
    style={{
      position: "absolute",
      left: 90,
      right: 90,
      bottom,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "rgba(10,10,10,0.82)",
        borderRadius: 18,
        padding: "6px 40px 10px",
        direction: "rtl",
        fontFamily: FONT,
        fontWeight: HEADLINE,
        fontSize: size,
        lineHeight: 1.45,
        textAlign: "center",
      }}
    >
      <Words {...caption} />
    </div>
  </div>
);

const SideLabel: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 12,
      top: DIVIDER_Y - 150,
      width: 66,
      height: 306,
      backgroundColor: "rgba(10,10,10,0.75)",
      borderRadius: 10,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        transform: "rotate(-90deg)",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: 38,
        letterSpacing: 14,
        color: RED,
        whiteSpace: "nowrap",
      }}
    >
      VAYNORA
    </div>
  </div>
);

const Counter: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: 36,
      right: 36,
      backgroundColor: "rgba(10,10,10,0.6)",
      borderRadius: 30,
      padding: "4px 24px",
      fontFamily: FONT,
      fontWeight: HEADLINE,
      fontSize: 30,
      color: "rgba(242,239,233,0.85)",
    }}
  >
    {text}
  </div>
);

export const VayCarouselSlide: React.FC<{
  slide: CarouselSlide;
  counter: string;
}> = ({ slide, counter }) => {
  if (slide.kind === "full") {
    return (
      <AbsoluteFill style={{ backgroundColor: BG }}>
        <Picture src={slide.src} position={slide.position} lift={slide.lift} />
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, transparent 45%, ${BG} 92%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            bottom: 150,
            direction: "rtl",
            fontFamily: FONT,
            fontWeight: HEADLINE,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 96, lineHeight: 1.3 }}>
            <Words {...slide.title} />
          </div>
          <div
            style={{
              width: 180,
              height: 6,
              backgroundColor: RED,
              margin: "24px auto",
            }}
          />
          {slide.sub ? (
            <div style={{ fontSize: 50, lineHeight: 1.4 }}>
              <Words {...slide.sub} />
            </div>
          ) : null}
        </div>
        <SideLabel />
        <Counter text={counter} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: SLIDE_WIDTH,
          height: DIVIDER_Y,
          overflow: "hidden",
        }}
      >
        <Picture {...slide.top} />
        <CaptionBox {...slide.top} bottom={36} />
      </div>
      <div
        style={{
          position: "absolute",
          top: DIVIDER_Y,
          left: 0,
          width: SLIDE_WIDTH,
          height: DIVIDER,
          backgroundColor: RED,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: DIVIDER_Y + DIVIDER,
          left: 0,
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT - DIVIDER_Y - DIVIDER,
          overflow: "hidden",
        }}
      >
        <Picture {...slide.bottom} />
        <CaptionBox {...slide.bottom} bottom={48} />
      </div>
      <SideLabel />
      <Counter text={counter} />
    </AbsoluteFill>
  );
};

// «عندما تترك الإباحية تعود إليك 5 أشياء» — prompts in prompts/vay-carousel-5-things.md
const DIR = "carousel/5things";
export const FIVE_THINGS: CarouselSlide[] = [
  {
    kind: "full",
    src: undefined,
    title: { text: "عندما تترك الإباحية", highlight: ["الإباحية"] },
    sub: { text: "تعود إليك 5 أشياء ←", highlight: ["5"] },
  },
  {
    kind: "split",
    top: {
      src: `${DIR}/s2-top.png`,
      position: "center 35%",
      text: "اترك الإباحية",
      highlight: ["الإباحية"],
    },
    bottom: { text: "تعود طاقتك", highlight: ["طاقتك"] },
  },
  {
    kind: "split",
    top: { text: "توقّف عن التمرير", highlight: ["التمرير"] },
    bottom: { text: "يعود تركيزك", highlight: ["تركيزك"] },
  },
  {
    kind: "split",
    top: { text: "ابنِ جسدك", highlight: ["جسدك"] },
    bottom: { text: "تعود ثقتك", highlight: ["ثقتك"] },
  },
  {
    kind: "split",
    top: { text: "أوفِ بوعودك", highlight: ["بوعودك"] },
    bottom: { text: "يعود احترامك لنفسك", highlight: ["احترامك"] },
  },
  {
    kind: "split",
    top: { text: "ابنِ ما له معنى", highlight: ["معنى"] },
    bottom: { text: "يعود هدفك", highlight: ["هدفك"] },
  },
  {
    kind: "full",
    src: undefined,
    title: { text: "ابدأ معركتك اليوم", highlight: ["معركتك"] },
    sub: {
      text: "كتاب «معركة الخلوات» — الرابط في البايو",
      highlight: ["الرابط", "في", "البايو"],
    },
  },
];
