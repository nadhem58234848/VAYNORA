// VAYNORA icon set: flat line icons, 24x24, bone stroke + red accent
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { C } from './data';

const P = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const shapes = {
  sword: (c, a) => (<>
    <Path {...P} stroke={c} d="M14.5 3.5L20.5 3.5L20.5 9.5L10 20L4 14Z" />
    <Line {...P} stroke={a} x1="3" y1="21" x2="7" y2="17" />
    <Line {...P} stroke={a} x1="5" y1="13" x2="11" y2="19" />
  </>),
  shield: (c, a) => (<>
    <Path {...P} stroke={c} d="M12 2.5L20 5.5V11.5C20 16.5 16.5 20 12 21.5C7.5 20 4 16.5 4 11.5V5.5Z" />
    <Path {...P} stroke={a} d="M8.5 11.5L11 14L15.5 9" />
  </>),
  knot: (c, a) => (<>
    <Path {...P} stroke={c} d="M3 12C6 12 7 7 10 7C13 7 13 17 16 17C19 17 19 12 21 12" />
    <Path {...P} stroke={a} d="M3 12C6 12 7 17 10 17C13 17 13 7 16 7C19 7 19 12 21 12" />
  </>),
  eye: (c, a) => (<>
    <Path {...P} stroke={c} d="M2.5 12C5 7 8.5 5 12 5C15.5 5 19 7 21.5 12C19 17 15.5 19 12 19C8.5 19 5 17 2.5 12Z" />
    <Line {...P} stroke={a} x1="4" y1="20" x2="20" y2="4" />
  </>),
  mat: (c, a) => (<>
    <Rect {...P} stroke={c} x="6" y="3" width="12" height="18" rx="1.5" />
    <Path {...P} stroke={a} d="M9 9.5C9 7.5 10.5 6.5 12 6.5C13.5 6.5 15 7.5 15 9.5V12H9Z" />
    <Line {...P} stroke={c} x1="9" y1="16" x2="15" y2="16" />
  </>),
  dumbbell: (c, a) => (<>
    <Line {...P} stroke={c} x1="7" y1="12" x2="17" y2="12" />
    <Rect {...P} stroke={a} x="3" y="8" width="4" height="8" rx="1" />
    <Rect {...P} stroke={a} x="17" y="8" width="4" height="8" rx="1" />
  </>),
  hourglass: (c, a) => (<>
    <Path {...P} stroke={c} d="M6 3H18M6 21H18M7 3C7 9 12 10 12 12C12 14 7 15 7 21M17 3C17 9 12 10 12 12C12 14 17 15 17 21" />
    <Path {...P} stroke={a} d="M9.5 18.5H14.5" />
  </>),
  flame: (c, a) => (<>
    <Path {...P} stroke={c} d="M12 21.5C8 21.5 5.5 18.5 5.5 15C5.5 10.5 9.5 8.5 10 3C14 5.5 18.5 9.5 18.5 15C18.5 18.5 16 21.5 12 21.5Z" />
    <Path {...P} stroke={a} d="M12 21C10.3 21 9.5 19.6 9.5 18.2C9.5 16.2 11.3 15.3 12 13C13.5 14.5 14.5 16 14.5 18.2C14.5 19.6 13.7 21 12 21Z" />
  </>),
  book: (c, a) => (<>
    <Path {...P} stroke={c} d="M12 6C10 4.5 7 4 3.5 4.5V19C7 18.5 10 19 12 20.5C14 19 17 18.5 20.5 19V4.5C17 4 14 4.5 12 6Z" />
    <Line {...P} stroke={a} x1="12" y1="6" x2="12" y2="20.5" />
  </>),
  moon: (c, a) => (<>
    <Path {...P} stroke={c} d="M20 14.5A8.5 8.5 0 1 1 9.5 4A7 7 0 0 0 20 14.5Z" />
    <Circle cx="17" cy="5" r="1.3" fill={a} />
  </>),
  sun: (c, a) => (<>
    <Circle {...P} stroke={a} cx="12" cy="12" r="4" />
    <Path {...P} stroke={c} d="M12 2.5V4.5M12 19.5V21.5M2.5 12H4.5M19.5 12H21.5M5.3 5.3L6.7 6.7M17.3 17.3L18.7 18.7M5.3 18.7L6.7 17.3M17.3 6.7L18.7 5.3" />
  </>),
  bell: (c, a) => (<>
    <Path {...P} stroke={c} d="M6 16.5V11C6 7.5 8.5 5 12 5C15.5 5 18 7.5 18 11V16.5L19.5 18H4.5Z" />
    <Path {...P} stroke={a} d="M10 20.5C10.5 21.3 11.2 21.6 12 21.6C12.8 21.6 13.5 21.3 14 20.5M12 2.5V5" />
  </>),
  bag: (c, a) => (<>
    <Path {...P} stroke={c} d="M5 8H19L18 21H6Z" />
    <Path {...P} stroke={a} d="M9 10V6.5C9 4.8 10.3 3.5 12 3.5C13.7 3.5 15 4.8 15 6.5V10" />
  </>),
  chain: (c, a) => (<>
    <Rect {...P} stroke={c} x="2.5" y="8.5" width="10" height="7" rx="3.5" />
    <Rect {...P} stroke={a} x="11.5" y="8.5" width="10" height="7" rx="3.5" />
  </>),
  crown: (c, a) => (<>
    <Path {...P} stroke={a} d="M3.5 7.5L7.5 12L12 4.5L16.5 12L20.5 7.5L19 18H5Z" />
    <Line {...P} stroke={c} x1="5" y1="21" x2="19" y2="21" />
  </>),
  flag: (c, a) => (<>
    <Line {...P} stroke={c} x1="5" y1="21.5" x2="5" y2="3" />
    <Path {...P} stroke={a} d="M5 4H19L16 8.5L19 13H5" />
  </>),
  belt: (c, a) => (<>
    <Line {...P} stroke={c} x1="2.5" y1="10" x2="21.5" y2="10" />
    <Line {...P} stroke={c} x1="2.5" y1="14" x2="21.5" y2="14" />
    <Path {...P} stroke={a} d="M10 9L8 20M14 9L16 20" />
  </>),
  drop: (c, a) => (<>
    <Path {...P} stroke={c} d="M12 3C15 7.5 18 10.5 18 14.5C18 18 15.3 21 12 21C8.7 21 6 18 6 14.5C6 10.5 9 7.5 12 3Z" />
    <Path {...P} stroke={a} d="M9.5 15C9.5 16.7 10.6 18 12 18" />
  </>),
  sos: (c, a) => (<>
    <Circle {...P} stroke={c} cx="12" cy="12" r="9.5" />
    <Path {...P} stroke={a} d="M12 6.5V13M12 16.5V17" />
  </>),
  share: (c, a) => (<>
    <Path {...P} stroke={c} d="M4 12V19.5H20V12" />
    <Path {...P} stroke={a} d="M12 15V3.5M7.5 8L12 3.5L16.5 8" />
  </>),
};

export default function Icon({ name, size = 24, color = C.bone, accent = C.red }) {
  const f = shapes[name];
  if (!f) return null;
  return <Svg width={size} height={size} viewBox="0 0 24 24">{f(color, accent)}</Svg>;
}
