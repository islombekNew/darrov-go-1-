import React from 'react';
import { Text, TextStyle } from 'react-native';

interface IconProps { color?: string; size?: number; style?: TextStyle; }

// SVG ishlatmaymiz - react-native Text bilan emoji/unicode iconlar
const makeIcon = (char: string) =>
  ({ color = '#fff', size = 22, style }: IconProps) => (
    <Text
      style={[{ fontSize: size, color, lineHeight: size * 1.2, textAlign: 'center' }, style]}
      allowFontScaling={false}
    >
      {char}
    </Text>
  );

export const IcHome       = makeIcon('🏠');
export const IcOrders     = makeIcon('📋');
export const IcProfile    = makeIcon('👤');
export const IcAI         = makeIcon('✨');
export const IcBell       = makeIcon('🔔');
export const IcSearch     = makeIcon('🔍');
export const IcPin        = makeIcon('📍');
export const IcArrowLeft  = makeIcon('←');
export const IcArrowRight = makeIcon('→');
export const IcCheck      = makeIcon('✓');
export const IcX          = makeIcon('✕');
export const IcCoin       = makeIcon('🪙');
export const IcStar       = makeIcon('⭐');
export const IcHeart      = makeIcon('❤️');
export const IcMotorbike  = makeIcon('🛵');
export const IcChevron    = makeIcon('›');
export const IcRestaurant = makeIcon('🍽');
export const IcSend       = makeIcon('➤');
export const IcLogout     = makeIcon('🚪');
export const IcCard       = makeIcon('💳');
export const IcUsers      = makeIcon('👥');
export const IcChart      = makeIcon('📊');
export const IcTime       = makeIcon('⏱');
export const IcFire       = makeIcon('🔥');
export const IcLock       = makeIcon('🔒');
export const IcMoon       = makeIcon('🌙');
export const IcSun        = makeIcon('☀️');
export const IcEdit       = makeIcon('✏️');
export const IcDiamond    = makeIcon('💎');
export const IcGlobe      = makeIcon('🌐');
export const IcRoute      = makeIcon('🗺️');
export const IcHistory    = makeIcon('🕐');
export const IcPromo      = makeIcon('🎁');
export const IcCrown      = makeIcon('👑');
export const IcQuestion   = makeIcon('❓');
export const IcRobot      = makeIcon('🤖');
export const IcStore      = makeIcon('🏪');
export const IcSettings   = makeIcon('⚙️');
export const IcPhone      = makeIcon('📱');
export const IcMap        = makeIcon('🗺️');
export const IcWallet     = makeIcon('👛');
export const IcGift       = makeIcon('🎁');
export const IcTrophy     = makeIcon('🏆');
