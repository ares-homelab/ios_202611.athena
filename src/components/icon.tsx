import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

const ICONS = {
  home: <Path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  paths: (
    <>
      <Circle cx="6" cy="18" r="2" />
      <Circle cx="18" cy="6" r="2" />
      <Path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6" />
    </>
  ),
  stats: <Path d="M5 20v-8M12 20V5M19 20v-5" />,
  highlights: <Path d="M6 7h4v4c0 3-1.5 5-4 6M14 7h4v4c0 3-1.5 5-4 6" />,
  issues: (
    <>
      <Rect x="4" y="5" width="13" height="14" rx="1" />
      <Path d="M17 9h3v8.5a1.5 1.5 0 0 1-3 0M7 9h7M7 12.5h7M7 16h4" />
    </>
  ),
  gear: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  next: <Path d="M9 6l6 6-6 6" />,
  back: <Path d="M15 6l-6 6 6 6" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="6" />
      <Path d="M20 20l-4.5-4.5" />
    </>
  ),
  bookmark: <Path d="M7 3h10v18l-5-4-5 4z" />,
  more: (
    <>
      <Circle cx="5" cy="12" r="1.7" />
      <Circle cx="12" cy="12" r="1.7" />
      <Circle cx="19" cy="12" r="1.7" />
    </>
  ),
  kindle: (
    <>
      <Rect x="5" y="3" width="14" height="18" rx="2" />
      <Path d="M9 12l2 2 4-4" />
    </>
  ),
  send: (
    <>
      <Rect x="5" y="3" width="14" height="18" rx="2" />
      <Path d="M12 7v7M9 11l3 3 3-3" />
    </>
  ),
  moon: <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  sun: (
    <>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
    </>
  ),
  phone: (
    <>
      <Rect x="7" y="3" width="10" height="18" rx="2" />
      <Path d="M11 18h2" />
    </>
  ),
  palette: (
    <>
      <Path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1 .2-2.2 1.3-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z" />
      <Circle cx="7.5" cy="11" r="1" />
      <Circle cx="10" cy="7" r="1" />
      <Circle cx="15" cy="7.5" r="1" />
    </>
  ),
  queue: (
    <>
      <Rect x="5" y="3" width="14" height="18" rx="2" />
      <Path d="M8 7h8M8 10.5h8M8 14h5" />
    </>
  ),
  server: (
    <>
      <Rect x="4" y="5" width="16" height="6" rx="1.5" />
      <Rect x="4" y="13" width="16" height="6" rx="1.5" />
      <Path d="M8 8h.01M8 16h.01" />
    </>
  ),
  key: (
    <>
      <Circle cx="8" cy="15" r="4" />
      <Path d="M11 12l8-8M16 7l2 2" />
    </>
  ),
  database: (
    <>
      <Ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <Path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  wrench: <Path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-3-3z" />,
  share: <Path d="M12 4v11M8 8l4-4 4 4M5 14v5h14v-5" />,
  pencil: <Path d="M4 20l4-1 11-11-3-3L5 16z" />,
  clock: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 8v4l3 2" />
    </>
  ),
  offline: <Path d="M3 9a14 14 0 0 1 18 0M6.5 12.5a9 9 0 0 1 11 0M10 16a4 4 0 0 1 4 0M4 4l16 16" />,
};

export type IconName = keyof typeof ICONS;

const FILLED: IconName[] = ['bookmark', 'more'];

export function Icon({ name, size = 22, color, width = 1.8, filled }: { name: IconName; size?: number; color: string; width?: number; filled?: boolean }) {
  const fill = filled || FILLED.includes(name) ? color : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </Svg>
  );
}
