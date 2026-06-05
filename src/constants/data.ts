// ── DEMO MA'LUMOTLAR (keyin backenddan keladi) ──

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
  desc: string;
}

export interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  menu: MenuItem[];
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_no', name: 'Navruz Osh', emoji: '🍚', category: 'milliy',
    rating: 4.8, deliveryTime: '25-35 daq', deliveryFee: 9000, minOrder: 30000, isOpen: true,
    menu: [
      { id:'m1', name:'Palov', price:25000, emoji:'🍚', category:'milliy', desc:"An'anaviy Toshkent palovi" },
      { id:'m2', name:'Somsa', price:8000,  emoji:'🥟', category:'milliy', desc:'Tandirda pishirilgan' },
      { id:'m3', name:'Shurva', price:20000, emoji:'🍲', category:'milliy', desc:"Qo'y go'shtli shurva" },
      { id:'m4', name:'Choy', price:3000, emoji:'🍵', category:'ichimlik', desc:"Ko'k choy" },
    ],
  },
  {
    id: 'rest_bh', name: 'Burger House', emoji: '🍔', category: 'fastfood',
    rating: 4.6, deliveryTime: '20-30 daq', deliveryFee: 12000, minOrder: 35000, isOpen: true,
    menu: [
      { id:'m5', name:'Cheeseburger', price:35000, emoji:'🍔', category:'fastfood', desc:'Ikki qatlamli pishloqli' },
      { id:'m6', name:'Fri kartoshka', price:15000, emoji:'🍟', category:'fastfood', desc:'Tuzli, qarsildoq' },
      { id:'m7', name:'Coca-Cola', price:8000, emoji:'🥤', category:'ichimlik', desc:'0.5L' },
    ],
  },
  {
    id: 'rest_gb', name: 'Green Bowl', emoji: '🥗', category: 'soglom',
    rating: 4.9, deliveryTime: '15-25 daq', deliveryFee: 10000, minOrder: 25000, isOpen: true,
    menu: [
      { id:'m8', name:'Cezar salati', price:32000, emoji:'🥗', category:'soglom', desc:'Tovuq, parmezan, kruton' },
      { id:'m9', name:'Tovuqli salat', price:30000, emoji:'🥗', category:'soglom', desc:"Sog'lom va yengil" },
      { id:'m10', name:'Smuzi', price:18000, emoji:'🥤', category:'ichimlik', desc:'Mevali vitaminli' },
    ],
  },
  {
    id: 'rest_pp', name: 'Pizza Planet', emoji: '🍕', category: 'pizza',
    rating: 4.7, deliveryTime: '30-40 daq', deliveryFee: 12000, minOrder: 40000, isOpen: true,
    menu: [
      { id:'m11', name:'Margarita', price:42000, emoji:'🍕', category:'pizza', desc:'Klassik italyan pizzasi' },
      { id:'m12', name:'Pepperoni', price:52000, emoji:'🍕', category:'pizza', desc:'Achchiq kolbasali' },
    ],
  },
  {
    id: 'rest_tr', name: 'Tokyo Roll', emoji: '🍣', category: 'sushi',
    rating: 4.8, deliveryTime: '35-45 daq', deliveryFee: 15000, minOrder: 50000, isOpen: false,
    menu: [
      { id:'m13', name:'Philadelphia', price:55000, emoji:'🍣', category:'sushi', desc:'8 dona, losos bilan' },
      { id:'m14', name:'California', price:48000, emoji:'🍱', category:'sushi', desc:'8 dona, krab bilan' },
    ],
  },
];

export const getRestaurantById = (id: string) => RESTAURANTS.find(r => r.id === id);
