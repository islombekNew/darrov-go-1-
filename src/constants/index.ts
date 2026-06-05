export const SUPERADMIN_PHONE = '998882162882';
export const ADMIN_PHONE      = '998882552882';
export const COMMISSION_RATE  = 0.10;

export const COIN = {
  ORDER_HIGH: 5, ORDER_LOW: 3,
  ORDER_THRESHOLD: 60000,
  REFERRAL: 3, WELCOME: 5,
};

export interface Level {
  level: number; name: string;
  minCoins: number; maxCoins: number;
  icon: string; iconCount: number;
  color: string; bgColor: string;
}

export const LEVELS: Level[] = [
  { level:1,  name:'Yangi',      minCoins:0,    maxCoins:49,   icon:'🪙', iconCount:1, color:'#B07848', bgColor:'#2a1e10' },
  { level:2,  name:"O'suvchi",   minCoins:50,   maxCoins:99,   icon:'🪙', iconCount:2, color:'#B07848', bgColor:'#2a1e10' },
  { level:3,  name:'Faol',       minCoins:100,  maxCoins:149,  icon:'🪙', iconCount:3, color:'#C8941A', bgColor:'#2a2000' },
  { level:4,  name:'Izlanuv',    minCoins:150,  maxCoins:199,  icon:'👝', iconCount:1, color:'#D4840A', bgColor:'#2a1a00' },
  { level:5,  name:'Tajribali',  minCoins:200,  maxCoins:249,  icon:'👝', iconCount:2, color:'#E07800', bgColor:'#2a1400' },
  { level:6,  name:'Usta',       minCoins:250,  maxCoins:299,  icon:'👝', iconCount:3, color:'#E87000', bgColor:'#2a1200' },
  { level:7,  name:'Sandiqchi',  minCoins:300,  maxCoins:399,  icon:'🧰', iconCount:1, color:'#FF6B1A', bgColor:'#2a1000' },
  { level:8,  name:'Boylik',     minCoins:400,  maxCoins:499,  icon:'🧰', iconCount:2, color:'#FF6B1A', bgColor:'#2a0e00' },
  { level:9,  name:'Xazina',     minCoins:500,  maxCoins:599,  icon:'🧰', iconCount:3, color:'#FF5500', bgColor:'#2a0a00' },
  { level:10, name:'Oltin',      minCoins:600,  maxCoins:749,  icon:'💰', iconCount:1, color:'#FFD166', bgColor:'#1a1500' },
  { level:11, name:'Oltin+',     minCoins:750,  maxCoins:899,  icon:'💰', iconCount:2, color:'#FFD166', bgColor:'#1a1400' },
  { level:12, name:'Xazinador',  minCoins:900,  maxCoins:1099, icon:'💰', iconCount:3, color:'#FFC000', bgColor:'#1a1200' },
  { level:13, name:'Olmaz',      minCoins:1100, maxCoins:1349, icon:'💎', iconCount:1, color:'#60b8ff', bgColor:'#001a2a' },
  { level:14, name:'Olmaz+',     minCoins:1350, maxCoins:1649, icon:'💎', iconCount:2, color:'#60b8ff', bgColor:'#00152a' },
  { level:15, name:'Legends',    minCoins:1650, maxCoins:99999,icon:'👑', iconCount:1, color:'#FFD700', bgColor:'#1a1000' },
];

export const getLevelByCoins = (coins: number): Level =>
  LEVELS.slice().reverse().find(l => coins >= l.minCoins) ?? LEVELS[0];

export const getNextLevel = (coins: number): Level | null => {
  const cur = getLevelByCoins(coins);
  return LEVELS.find(l => l.level === cur.level + 1) ?? null;
};

export const getLevelProgress = (coins: number): number => {
  const cur = getLevelByCoins(coins);
  const next = getNextLevel(coins);
  if (!next) return 1;
  return Math.min(1, (coins - cur.minCoins) / (next.minCoins - cur.minCoins));
};

export const STREAK_MILESTONES = [
  { days:1,   coins:2,   label:'1 kun'   },
  { days:3,   coins:5,   label:'3 kun'   },
  { days:7,   coins:10,  label:'1 hafta' },
  { days:14,  coins:20,  label:'2 hafta' },
  { days:30,  coins:40,  label:'1 oy'    },
  { days:60,  coins:80,  label:'2 oy'    },
  { days:100, coins:150, label:'100 kun' },
];

export const CATEGORIES = [
  { id:'all',       label:'Barchasi', emoji:'🍽' },
  { id:'milliy',    label:'Milliy',   emoji:'🥘' },
  { id:'fastfood',  label:'FastFood', emoji:'🍔' },
  { id:'pizza',     label:'Pizza',    emoji:'🍕' },
  { id:'burger',    label:'Burger',   emoji:'🫔' },
  { id:'sushi',     label:'Sushi',    emoji:'🍣' },
  { id:'soglom',    label:"Sog'lom",  emoji:'🥗' },
  { id:'ichimlik',  label:'Ichimlik', emoji:'🧃' },
];

export const REGIONS = [
  { id:'tsh', name:'Toshkent',  active:true  },
  { id:'nam', name:'Namangan',  active:true  },
  { id:'sam', name:'Samarqand', active:false },
  { id:'and', name:'Andijon',   active:false },
];

export const getRoleByPhone = (phone: string): 'superadmin'|'admin'|null => {
  const d = phone.replace(/\D/g, '');
  if (d === SUPERADMIN_PHONE || d === SUPERADMIN_PHONE.slice(3)) return 'superadmin';
  if (d === ADMIN_PHONE      || d === ADMIN_PHONE.slice(3))      return 'admin';
  return null;
};
