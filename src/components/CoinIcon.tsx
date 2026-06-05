import React from 'react';
import Svg, { Circle, Path, Text as SvgText, Defs, RadialGradient, LinearGradient, Stop, G } from 'react-native-svg';

interface Props { level: number; size?: number; }

type Scheme = 'bronze' | 'silver' | 'gold' | 'diamond' | 'crown';

// ── Bitta DG tanga ──
function DGCoin({ x, y, r, scheme }: { x: number; y: number; r: number; scheme: Scheme }) {
  const C = {
    bronze:  { outer:'#B87333', mid:'#CD8500', inner:'#E8A317', text:'#5A3A00', shine:'#F4C430' },
    silver:  { outer:'#9098A1', mid:'#C0C0C0', inner:'#E8E8E8', text:'#404040', shine:'#FFFFFF' },
    gold:    { outer:'#D4AF37', mid:'#FFD700', inner:'#FFED4E', text:'#7A5500', shine:'#FFFACD' },
    diamond: { outer:'#4A90D9', mid:'#60B8FF', inner:'#A0E0FF', text:'#003A6B', shine:'#E0F4FF' },
    crown:   { outer:'#C9A227', mid:'#FFD700', inner:'#FFF0A0', text:'#6B4500', shine:'#FFFFFF' },
  }[scheme];
  const gid = `g_${scheme}_${Math.round(x*7)}_${Math.round(y*7)}`;
  return (
    <G>
      <Defs>
        <RadialGradient id={gid} cx="40%" cy="35%" r="75%">
          <Stop offset="0%" stopColor={C.shine} />
          <Stop offset="45%" stopColor={C.inner} />
          <Stop offset="80%" stopColor={C.mid} />
          <Stop offset="100%" stopColor={C.outer} />
        </RadialGradient>
      </Defs>
      <Circle cx={x} cy={y} r={r} fill={C.outer} />
      <Circle cx={x} cy={y} r={r * 0.92} fill={`url(#${gid})`} />
      <Circle cx={x} cy={y} r={r * 0.92} fill="none" stroke={C.outer} strokeWidth={r * 0.05} />
      <Circle cx={x} cy={y} r={r * 0.76} fill="none" stroke={C.text} strokeWidth={r * 0.03} strokeOpacity={0.3} />
      <SvgText x={x} y={y + r * 0.3} fontSize={r * 0.8} fontWeight="900" fill={C.text} textAnchor="middle" fontFamily="System">DG</SvgText>
    </G>
  );
}

// ── Sandiq ──
function Chest({ cx, cy, size, lvl }: { cx: number; cy: number; size: number; lvl: number }) {
  const s = size;
  const gid = `chest_${lvl}`;
  return (
    <G>
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#6B4423" />
          <Stop offset="100%" stopColor="#3A2512" />
        </LinearGradient>
      </Defs>
      <Path d={`M ${cx-s*0.45} ${cy} L ${cx-s*0.45} ${cy+s*0.38} Q ${cx-s*0.45} ${cy+s*0.43} ${cx-s*0.4} ${cy+s*0.43} L ${cx+s*0.4} ${cy+s*0.43} Q ${cx+s*0.45} ${cy+s*0.43} ${cx+s*0.45} ${cy+s*0.38} L ${cx+s*0.45} ${cy} Z`} fill={`url(#${gid})`} stroke="#2A1A0A" strokeWidth={s*0.025} />
      <Path d={`M ${cx-s*0.48} ${cy} Q ${cx-s*0.48} ${cy-s*0.32} ${cx} ${cy-s*0.32} Q ${cx+s*0.48} ${cy-s*0.32} ${cx+s*0.48} ${cy} Z`} fill="#7B5433" stroke="#2A1A0A" strokeWidth={s*0.025} />
      <Path d={`M ${cx-s*0.45} ${cy} L ${cx+s*0.45} ${cy}`} stroke="#FFD700" strokeWidth={s*0.07} />
      <Circle cx={cx} cy={cy+s*0.02} r={s*0.08} fill="#FFD700" stroke="#B8860B" strokeWidth={s*0.02} />
      <Circle cx={cx-s*0.2} cy={cy-s*0.13} r={s*0.1} fill="#FFD700" stroke="#B8860B" strokeWidth={s*0.015} />
      <Circle cx={cx+s*0.18} cy={cy-s*0.16} r={s*0.1} fill="#FFED4E" stroke="#B8860B" strokeWidth={s*0.015} />
      <SvgText x={cx-s*0.2} y={cy-s*0.09} fontSize={s*0.1} fontWeight="900" fill="#7A5500" textAnchor="middle">DG</SvgText>
    </G>
  );
}

// ── Toj ──
function Crown({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size;
  return (
    <G>
      <Defs>
        <LinearGradient id="crownG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFF0A0" />
          <Stop offset="50%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#D4AF37" />
        </LinearGradient>
      </Defs>
      <Path d={`M ${cx-s*0.45} ${cy+s*0.2} L ${cx+s*0.45} ${cy+s*0.2} L ${cx+s*0.4} ${cy+s*0.4} L ${cx-s*0.4} ${cy+s*0.4} Z`} fill="url(#crownG)" stroke="#B8860B" strokeWidth={s*0.025} />
      <Path d={`M ${cx-s*0.45} ${cy+s*0.2} L ${cx-s*0.45} ${cy-s*0.3} L ${cx-s*0.22} ${cy-s*0.05} L ${cx} ${cy-s*0.35} L ${cx+s*0.22} ${cy-s*0.05} L ${cx+s*0.45} ${cy-s*0.3} L ${cx+s*0.45} ${cy+s*0.2} Z`} fill="url(#crownG)" stroke="#B8860B" strokeWidth={s*0.025} />
      <Circle cx={cx-s*0.45} cy={cy-s*0.3} r={s*0.07} fill="#60B8FF" stroke="#fff" strokeWidth={s*0.012} />
      <Circle cx={cx} cy={cy-s*0.35} r={s*0.08} fill="#E84040" stroke="#fff" strokeWidth={s*0.012} />
      <Circle cx={cx+s*0.45} cy={cy-s*0.3} r={s*0.07} fill="#60B8FF" stroke="#fff" strokeWidth={s*0.012} />
      <Circle cx={cx} cy={cy+s*0.05} r={s*0.1} fill="#E84040" stroke="#FFD700" strokeWidth={s*0.025} />
      <SvgText x={cx} y={cy+s*0.32} fontSize={s*0.16} fontWeight="900" fill="#6B4500" textAnchor="middle">DG</SvgText>
    </G>
  );
}

// ── 15 DARAJAGA MOS ──
export function CoinIcon({ level, size = 48 }: Props) {
  const vb = 100, c = vb / 2;
  let content: React.ReactNode;

  if (level >= 1 && level <= 3) {
    const n = level, r = vb * 0.28;
    if (n === 1) content = <DGCoin x={c} y={c} r={r} scheme="bronze" />;
    else if (n === 2) content = <><DGCoin x={c-r*0.55} y={c} r={r*0.85} scheme="bronze"/><DGCoin x={c+r*0.55} y={c} r={r*0.85} scheme="bronze"/></>;
    else content = <><DGCoin x={c-r*0.7} y={c+r*0.3} r={r*0.7} scheme="bronze"/><DGCoin x={c+r*0.7} y={c+r*0.3} r={r*0.7} scheme="bronze"/><DGCoin x={c} y={c-r*0.4} r={r*0.75} scheme="bronze"/></>;
  } else if (level >= 4 && level <= 6) {
    const n = level - 3, r = vb * 0.28;
    if (n === 1) content = <DGCoin x={c} y={c} r={r} scheme="silver" />;
    else if (n === 2) content = <><DGCoin x={c-r*0.55} y={c} r={r*0.85} scheme="silver"/><DGCoin x={c+r*0.55} y={c} r={r*0.85} scheme="silver"/></>;
    else content = <><DGCoin x={c-r*0.7} y={c+r*0.3} r={r*0.7} scheme="silver"/><DGCoin x={c+r*0.7} y={c+r*0.3} r={r*0.7} scheme="silver"/><DGCoin x={c} y={c-r*0.4} r={r*0.75} scheme="silver"/></>;
  } else if (level >= 7 && level <= 9) {
    const chestSize = vb * (0.55 + (level - 7) * 0.12);
    content = <Chest cx={c} cy={c} size={chestSize} lvl={level} />;
  } else if (level >= 10 && level <= 12) {
    const r = vb * 0.22, extra = level - 10;
    content = (
      <>
        <DGCoin x={c-r*0.8} y={c+r*0.5} r={r*0.75} scheme="gold"/>
        <DGCoin x={c+r*0.8} y={c+r*0.5} r={r*0.75} scheme="gold"/>
        <DGCoin x={c} y={c} r={r*0.9} scheme="gold"/>
        {extra >= 1 && <DGCoin x={c-r*0.5} y={c-r*0.6} r={r*0.7} scheme="gold"/>}
        {extra >= 2 && <DGCoin x={c+r*0.5} y={c-r*0.6} r={r*0.7} scheme="gold"/>}
      </>
    );
  } else if (level >= 13 && level <= 14) {
    const r = vb * 0.24;
    if (level === 13) content = <DGCoin x={c} y={c} r={r*1.1} scheme="diamond" />;
    else content = <><DGCoin x={c-r*0.6} y={c} r={r*0.9} scheme="diamond"/><DGCoin x={c+r*0.6} y={c} r={r*0.9} scheme="diamond"/><DGCoin x={c} y={c-r*0.5} r={r*0.85} scheme="diamond"/></>;
  } else {
    content = <Crown cx={c} cy={c} size={vb * 0.8} />;
  }

  return <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>{content}</Svg>;
}

export function SingleCoin({ size = 24 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 100 100"><DGCoin x={50} y={50} r={42} scheme="gold" /></Svg>;
}
