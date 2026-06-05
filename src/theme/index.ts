import { Dimensions, Platform } from 'react-native';

const { width: W } = Dimensions.get('window');
export const IS_TABLET = W >= 768;
export const rs = (phone: number, tablet?: number) =>
  IS_TABLET ? (tablet ?? Math.round(phone * 1.3)) : phone;

export const DARK = {
  bg: '#0D0D0D', bg2: '#1A1A1A', bg3: '#242424', bg4: '#2E2E2E',
  bd: '#333333', bd2: '#3D3D3D',
  t1: '#FFFFFF', t2: '#C8C8C8', t3: '#888888', t4: '#555555', t5: '#3A3A3A',
  card: '#1A1A1A', navBg: '#1A1A1A', navBd: '#2A2A2A',
  hdrBg: '#1A1A1A', inputBg: '#242424', inputBd: '#333333',
  statusBar: 'light-content' as 'light-content' | 'dark-content',
};

export const LIGHT = {
  bg: '#FFFBF5', bg2: '#FFF5E9', bg3: '#FDECD8', bg4: '#F5E0C8',
  bd: '#F0DFC8', bd2: '#E8CEB0',
  t1: '#3D1F0D', t2: '#7A4A28', t3: '#B07848', t4: '#D4A878', t5: '#E8C8A0',
  card: '#FFFFFF', navBg: '#FFFBF5', navBd: '#F0DFC8',
  hdrBg: '#FFFBF5', inputBg: '#FFF5E9', inputBd: '#F0DFC8',
  statusBar: 'dark-content' as 'light-content' | 'dark-content',
};

export type Theme = typeof DARK;

export const C = {
  p: '#FF6B1A', p2: '#FF8C42', pdk: '#E85500', plt: '#FFE4CC',
  gold: '#FFD166', amber: '#F4A228', ambBg: '#FFF8E1',
  gn: '#1DB954', gnb: '#E8F8EE', gndk: '#0a3d1a',
  rd: '#E84040', rdb: '#FEE8E8', rddk: '#3d0a0a',
  pu: '#7C4DFF', pub: '#F0EBFF', pubDk: '#1a0a3d',
  blue: '#378ADD', bluBg: '#E6F1FB',
};

export const S = {
  xs: rs(4), sm: rs(8), md: rs(14), lg: rs(20), xl: rs(28), xxl: rs(40),
};

export const R = {
  sm: rs(8), md: rs(14), lg: rs(20), xl: rs(28), full: 999,
};

export const F = {
  xs: rs(10), sm: rs(12), md: rs(14), lg: rs(16), xl: rs(18),
  xxl: rs(22), h2: rs(24), h1: rs(28),
};

export const fmtPrice = (n: number) =>
  Math.round(n).toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";

export const normalizePhone = (p: string): string => {
  const d = p.replace(/\D/g, '');
  if (d.length === 9) return '998' + d;
  if (d.length === 12 && d.startsWith('998')) return d;
  throw new Error("9 ta raqam kiriting");
};

export const fmtDate = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Hozirgina';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' daqiqa oldin';
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('uz-UZ');
};
