import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

type P = { color?: string; size?: number };

export const IcHome = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10.5L12 3l9 7.5V21H3V10.5z" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
    <Path d="M9 21V13h6v8" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcOrders = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth="2"/>
    <Path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke={color} strokeWidth="2"/>
    <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="9" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

export const IcProfile = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcAI = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l1.6 5.4H19l-4.6 3.3 1.8 5.4L12 13.1l-4.2 3 1.8-5.4L5 7.4h5.4L12 2z" fill={color} opacity="0.9"/>
    <Circle cx="5.5" cy="5.5" r="1.2" fill={color} opacity="0.5"/>
    <Circle cx="19" cy="19" r="1" fill={color} opacity="0.4"/>
    <Circle cx="20" cy="5" r="0.8" fill={color} opacity="0.35"/>
  </Svg>
);

export const IcBell = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 10a6 6 0 0112 0v3.5l2 2.5H4l2-2.5V10z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M10 18.5a2 2 0 004 0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcChart = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Rect x="3.5" y="13" width="4" height="8" rx="1" fill={color} opacity="0.55"/>
    <Rect x="10" y="8" width="4" height="13" rx="1" fill={color}/>
    <Rect x="16.5" y="3" width="4" height="18" rx="1" fill={color} opacity="0.7"/>
  </Svg>
);

export const IcHistory = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Path d="M12 7v5l3.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcRestaurant = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 2v20M7 2C7 6 5 9 7 11v11M17 2v6a3 3 0 01-3 3v9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcStore = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 3h20L20 10H4L2 3z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M4 10a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" stroke={color} strokeWidth="1.8"/>
    <Path d="M4 10v11h16V10" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Rect x="9" y="14" width="6" height="7" rx="1" stroke={color} strokeWidth="1.8"/>
  </Svg>
);

export const IcArrowLeft = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcArrowRight = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcCheck = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcX = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </Svg>
);

export const IcSend = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcLogout = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcCard = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2.5" stroke={color} strokeWidth="2"/>
    <Line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="2"/>
    <Line x1="6" y1="15" x2="9" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="13" y1="15" x2="18" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcUsers = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"/>
    <Path d="M3 21v-2a7 7 0 0112.26-4.6M16 11a4 4 0 010 8M21 21v-2a5 5 0 00-3-4.6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcPlus = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </Svg>
);

export const IcMinus = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </Svg>
);

export const IcTrash = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const IcEdit = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcMoon = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcSun = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2"/>
    <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="2" y1="12" x2="4" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="20" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcGlobe = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.5"/>
    <Path d="M12 3c-3.5 4-3.5 14 0 18M12 3c3.5 4 3.5 14 0 18" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

export const IcMusic = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcHeart = ({ color = '#E84040', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcPromo = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Circle cx="7" cy="7" r="1.5" fill={color}/>
  </Svg>
);

export const IcCrown = ({ color = '#FFD166', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 18l2.5-10L9 12l3-10 3 10 4.5-4L22 18H2z" fill={color} opacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="2" y1="21" x2="22" y2="21" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </Svg>
);

export const IcCoin = ({ color = '#F4A228', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="5.5" stroke={color} strokeWidth="1" opacity="0.35"/>
    <Path d="M11 9h2a1.5 1.5 0 010 3h-2a1.5 1.5 0 000 3h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="12" y1="7.5" x2="12" y2="9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="12" y1="15" x2="12" y2="16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

export const IcPhone = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.13.97.36 1.93.68 2.85a2 2 0 01-.44 2.1L8.09 9.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.44c.92.32 1.88.55 2.85.68A2 2 0 0122 16.9z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcSettings = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcQuestion = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Path d="M9 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="12" cy="17" r="1" fill={color}/>
  </Svg>
);

export const IcInfo = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="8.5" r="0.5" fill={color} stroke={color} strokeWidth="1.5"/>
    <Line x1="12" y1="12" x2="12" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcRobot = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="8" width="16" height="12" rx="3" stroke={color} strokeWidth="2"/>
    <Circle cx="9" cy="13.5" r="1.5" fill={color}/>
    <Circle cx="15" cy="13.5" r="1.5" fill={color}/>
    <Path d="M9.5 17.5a2.5 2.5 0 005 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Line x1="12" y1="4" x2="12" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="12" cy="3.5" r="1.5" stroke={color} strokeWidth="1.5"/>
    <Line x1="1" y1="14" x2="4" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="20" y1="14" x2="23" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcRoute = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5" cy="18" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="19" cy="6" r="3" stroke={color} strokeWidth="2"/>
    <Path d="M8 18h3a4 4 0 004-4v-4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcTrophy = ({ color = '#FFD166', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h12v7a6 6 0 01-12 0V3z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 5h2a2 2 0 012 2v2a4 4 0 01-4 4M6 5H4a2 2 0 00-2 2v2a4 4 0 004 4" stroke={color} strokeWidth="2"/>
    <Path d="M12 17v4M8 21h8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcWallet = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 7H3a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V8a1 1 0 00-1-1z" stroke={color} strokeWidth="2"/>
    <Path d="M16 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2" stroke={color} strokeWidth="2"/>
    <Path d="M22 13h-4a2 2 0 000 4h4" stroke={color} strokeWidth="2"/>
    <Circle cx="18" cy="15" r="1" fill={color}/>
  </Svg>
);

export const IcDiamond = ({ color = '#60b8ff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="2" y1="9" x2="22" y2="9" stroke={color} strokeWidth="1.5"/>
    <Line x1="6" y1="3" x2="10" y2="9" stroke={color} strokeWidth="1.5"/>
    <Line x1="18" y1="3" x2="14" y2="9" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

export const IcLock = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="11" rx="2" stroke={color} strokeWidth="2"/>
    <Path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="16" r="1.5" fill={color}/>
  </Svg>
);

export const IcGift = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12v10H4V12" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M22 7H2v5h20V7z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="12" y1="22" x2="12" y2="7" stroke={color} strokeWidth="2"/>
    <Path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke={color} strokeWidth="2"/>
    <Path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcFire = ({ color = '#FF6B1A', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C8 7 8 13 11 15c0-3 2-4 2-4s-1 5 3 5 4-3 4-5a6 6 0 00-3 2c1-3-1-7-5-11z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <Circle cx="12" cy="18" r="2" fill={color} opacity="0.6"/>
  </Svg>
);

export const IcChevron = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcTime = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Path d="M12 7v5l3.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcCamera = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcMotorbike = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5.5" cy="17" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="18.5" cy="17" r="3" stroke={color} strokeWidth="2"/>
    <Path d="M5.5 17h4l3-9h4l2 4-1.5 3.5H13" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M11 8h4l2-3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const IcSearch = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/>
    <Line x1="17" y1="17" x2="22" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </Svg>
);

export const IcPin = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcMap = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 2L3 5v17l6-3 6 3 6-3V2l-6 3-6-3z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="9" y1="2" x2="9" y2="19" stroke={color} strokeWidth="1.5"/>
    <Line x1="15" y1="5" x2="15" y2="22" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

export const IcStar = ({ color = '#FFD166', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color}/>
  </Svg>
);

export const IcShare = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2"/>
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2"/>
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcCopy = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2"/>
    <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcToggleOn = ({ color = '#1DB954', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="7" width="22" height="10" rx="5" fill={color} opacity="0.25" stroke={color} strokeWidth="2"/>
    <Circle cx="16" cy="12" r="4" fill={color}/>
  </Svg>
);

export const IcToggleOff = ({ color = '#888', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="7" width="22" height="10" rx="5" stroke={color} strokeWidth="2"/>
    <Circle cx="8" cy="12" r="4" fill={color} opacity="0.5"/>
  </Svg>
);

export const IcCart = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2"/>
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcHouse = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10.5L12 3l9 7.5V21H15v-5h-6v5H3V10.5z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="9" y1="21" x2="9" y2="16" stroke={color} strokeWidth="1.5"/>
    <Line x1="15" y1="21" x2="15" y2="16" stroke={color} strokeWidth="1.5"/>
    <Rect x="10" y="11" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

export const IcBuilding = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <Path d="M3 9h18M9 9v12M15 9v12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Rect x="5" y="5" width="3" height="2" rx="0.5" fill={color} opacity="0.6"/>
    <Rect x="11" y="5" width="3" height="2" rx="0.5" fill={color} opacity="0.6"/>
    <Rect x="17" y="5" width="3" height="2" rx="0.5" fill={color} opacity="0.6"/>
  </Svg>
);

export const IcFloor = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="2"/>
    <Line x1="2" y1="8" x2="22" y2="8" stroke={color} strokeWidth="1.5" strokeDasharray="2 2"/>
    <Line x1="2" y1="14" x2="22" y2="14" stroke={color} strokeWidth="1.5" strokeDasharray="2 2"/>
    <Rect x="9" y="15" width="6" height="7" rx="1" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

export const IcNavigate = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l19-9-9 19-2-8-8-2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
  </Svg>
);

export const IcClipboard = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth="2"/>
    <Rect x="9" y="3" width="6" height="4" rx="1" stroke={color} strokeWidth="2"/>
    <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Line x1="9" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

export const IcDelivery = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3h15v13H1z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M16 8h4l3 5v3h-7V8z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2"/>
    <Circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcPercent = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="16" cy="16" r="3" stroke={color} strokeWidth="2"/>
    <Line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcBag = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2"/>
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcDoor = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Circle cx="13" cy="14" r="1" fill={color}/>
  </Svg>
);

export const IcEntrance = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <Rect x="8" y="11" width="8" height="10" rx="1" stroke={color} strokeWidth="2"/>
    <Circle cx="14" cy="16" r="1" fill={color}/>
    <Path d="M8 8h8M12 5v6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const IcComment = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="8" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Line x1="8" y1="14" x2="12" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const IcTarget = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" opacity="0.6"/>
    <Circle cx="12" cy="12" r="2" fill={color}/>
    <Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcReferral = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="2"/>
    <Circle cx="17" cy="9" r="3" stroke={color} strokeWidth="2"/>
    <Path d="M3 20c0-3.5 2.7-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M11 20c0-3 2.2-5.5 6-5.5s6 2.5 6 5.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="11" y1="7" x2="14" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
  </Svg>
);

export const IcTruck = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 3h15v13H1z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M16 8h4l3 5v3h-7V8z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2"/>
    <Circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcPreparing = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3h18v3H3z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M3 6c0 7.18 4.03 13.24 9 15 4.97-1.76 9-7.82 9-15" stroke={color} strokeWidth="2"/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcRating = ({ color = '#FFD166', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={color} opacity="0.9"/>
  </Svg>
);

export const IcMedal = ({ color = '#FFD166', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="14" r="7" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="14" r="4" stroke={color} strokeWidth="1" opacity="0.4"/>
    <Path d="M8 4l-3-3h6l2 6M16 4l3-3h-6l-2 6" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <Line x1="12" y1="12" x2="12" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const IcOnline = ({ color = '#1DB954', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" fill={color}/>
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" opacity="0.4"/>
    <Circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1" opacity="0.2"/>
  </Svg>
);

export const IcEarnings = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 7H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcRefresh = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 4v6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IcSoundOn = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="8" width="5" height="8" rx="1" stroke={color} strokeWidth="2"/>
    <Path d="M7 8L15 4v16L7 16" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 9a5 5 0 010 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M20 6a9 9 0 010 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcSoundOff = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="8" width="5" height="8" rx="1" stroke={color} strokeWidth="2"/>
    <Path d="M7 8L15 4v16L7 16" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="17" y1="9" x2="23" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="23" y1="9" x2="17" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcNotifBell = ({ color = '#fff', size = 22, hasUnread = false }: P & { hasUnread?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 10a6 6 0 0112 0v3.5l2 2.5H4l2-2.5V10z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M10 18.5a2 2 0 004 0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {hasUnread && <Circle cx="18" cy="5" r="4" fill="#E84040"/>}
  </Svg>
);

// ── CATEGORY ICONS ──────────────────────────────
export const IcCatAll = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="20" cy="6" r="2" fill={color}/>
    <Circle cx="20" cy="12" r="2" fill={color}/>
    <Circle cx="20" cy="18" r="2" fill={color}/>
  </Svg>
);

export const IcCatMilli = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10c0-3.3 3.6-6 8-6s8 2.7 8 6v2H4v-2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M3 12h18v2a9 9 0 01-18 0v-2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="12" y1="20" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="8" y1="23" x2="16" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcCatFastFood = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10h16l-1 9H5l-1-9z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M3 10c0-2.2 4-4 9-4s9 1.8 9 4" stroke={color} strokeWidth="2"/>
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcCatPizza = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 20h18L12 2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Circle cx="9" cy="14" r="1.5" fill={color} opacity="0.7"/>
    <Circle cx="14" cy="11" r="1.5" fill={color} opacity="0.7"/>
    <Circle cx="13" cy="17" r="1" fill={color} opacity="0.5"/>
    <Line x1="3" y1="20" x2="21" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const IcCatBurger = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 7.5C5 5.57 8.13 4 12 4s7 1.57 7 3.5" stroke={color} strokeWidth="2"/>
    <Rect x="3" y="7" width="18" height="3" rx="1.5" stroke={color} strokeWidth="2"/>
    <Rect x="3" y="14" width="18" height="3" rx="1.5" stroke={color} strokeWidth="2"/>
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.2" opacity="0.4"/>
    <Path d="M3 17c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcCatSushi = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="9" width="18" height="10" rx="5" stroke={color} strokeWidth="2"/>
    <Rect x="7" y="11" width="10" height="6" rx="2" fill={color} opacity="0.18"/>
    <Circle cx="12" cy="14" r="2.5" fill={color} opacity="0.6"/>
    <Line x1="3" y1="14" x2="21" y2="14" stroke={color} strokeWidth="1.2" opacity="0.35"/>
    <Path d="M9 9V7a3 3 0 016 0v2" stroke={color} strokeWidth="2"/>
  </Svg>
);

export const IcCatSoglom = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C6 22 4 17 4 12a8 8 0 0116 0c0 5-2 10-8 10z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M12 12c-2-3-2-6 0-8 2 2 2 5 0 8z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

export const IcCatIchimlik = ({ color = '#fff', size = 22 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 4h14l-2 14H7L5 4z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <Line x1="5" y1="10" x2="19" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Line x1="14" y1="6" x2="14" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    <Path d="M10 2c0 2-1.5 2-1.5 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Path d="M14 2c0 2-1.5 2-1.5 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);
