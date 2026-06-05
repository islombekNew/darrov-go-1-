import { create } from 'zustand';
import { DARK, LIGHT, Theme } from '../theme';
import { COIN } from '../constants';

// ── THEME ──────────────────────────────────────
interface ThemeState {
  isDark: boolean; T: Theme;
  toggle: () => void;
  setDark: (v: boolean) => void;
}
export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false, T: LIGHT,
  toggle: () => set(s => ({ isDark: !s.isDark, T: s.isDark ? LIGHT : DARK })),
  setDark: (v) => set({ isDark: v, T: v ? DARK : LIGHT }),
}));

// ── USER ───────────────────────────────────────
export type UserRole = 'customer'|'restaurant_owner'|'courier'|'admin'|'superadmin';
export interface User {
  id: string; phone: string; name: string; role: UserRole;
  status: 'active'|'pending'|'blocked';
  regionId?: string; regionName?: string; address?: string;
  coins: number; streak: number; lastOrderDate?: string; referralCount: number;
}
interface AuthState {
  user: User|null; token: string|null;
  setAuth: (u: User, t: string) => void;
  updateUser: (u: Partial<User>) => void;
  addCoins: (n: number) => void;
  incrementStreak: () => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, token: null,
  setAuth: (user, token) => set({ user, token }),
  updateUser: (u) => { const c = get().user; if (c) set({ user: { ...c, ...u } }); },
  addCoins: (n) => { const c = get().user; if (c) set({ user: { ...c, coins: c.coins + n } }); },
  incrementStreak: () => {
    const c = get().user; if (!c) return;
    const today = new Date().toDateString();
    if (c.lastOrderDate === today) return;
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const streak = c.lastOrderDate === yest.toDateString() ? c.streak + 1 : 1;
    set({ user: { ...c, streak, lastOrderDate: today } });
  },
  logout: () => set({ user: null, token: null }),
}));

// ── NOTIFICATIONS ──────────────────────────────
export interface Notif {
  id: string;
  type: 'order_accepted'|'order_ready'|'order_delivered'|'coin_earned'|'level_up'|'referral'|'promo';
  title: string; body: string; read: boolean; createdAt: Date;
}
interface NotifState {
  notifs: Notif[]; unreadCount: number;
  add: (n: Omit<Notif,'id'|'read'|'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}
export const useNotifStore = create<NotifState>((set, get) => ({
  notifs: [
    { id:'n1', type:'coin_earned', read:false, createdAt:new Date(),
      title:'Xush kelibsiz!', body:`Ro'yxatdan o'tganingiz uchun +${COIN.WELCOME} coin berildi!` },
    { id:'n2', type:'promo', read:false, createdAt:new Date(Date.now()-86400000),
      title:'Maxsus taklif!', body:'Bugun barcha buyurtmalarda +2 qo\'shimcha coin!' },
  ],
  unreadCount: 2,
  add: (n) => {
    const notif: Notif = { ...n, id:'n_'+Date.now(), read:false, createdAt:new Date() };
    set(s => ({ notifs:[notif,...s.notifs], unreadCount:s.unreadCount+1 }));
  },
  markRead: (id) => set(s => ({
    notifs: s.notifs.map(n => n.id===id ? {...n,read:true} : n),
    unreadCount: Math.max(0, s.unreadCount - (s.notifs.find(n=>n.id===id)?.read ? 0 : 1)),
  })),
  markAllRead: () => set(s => ({ notifs:s.notifs.map(n=>({...n,read:true})), unreadCount:0 })),
}));

// ── CART ───────────────────────────────────────
export interface CartItem {
  menuItemId: string; name: string; price: number; quantity: number;
}
interface CartState {
  items: CartItem[]; restId: string|null; restName: string|null; deliveryFee: number;
  addItem: (i:Omit<CartItem,'quantity'>, restId:string, restName:string) => 'added'|'conflict';
  removeItem: (id:string) => void;
  updateQty: (id:string, qty:number) => void;
  clearCart: () => void;
  subtotal: () => number; total: () => number; count: () => number; earnCoins: () => number;
}
export const useCartStore = create<CartState>((set, get) => ({
  items:[], restId:null, restName:null, deliveryFee:9000,
  addItem: (newItem, restId, restName) => {
    const { items, restId:cur } = get();
    if (cur && cur !== restId) return 'conflict';
    const ex = items.find(i => i.menuItemId === newItem.menuItemId);
    if (ex) set({ items: items.map(i => i.menuItemId===newItem.menuItemId ? {...i,quantity:i.quantity+1} : i) });
    else set({ items:[...items,{...newItem,quantity:1}], restId, restName });
    return 'added';
  },
  removeItem: (id) => { const f=get().items.filter(i=>i.menuItemId!==id); set({items:f,restId:f.length?get().restId:null,restName:f.length?get().restName:null}); },
  updateQty: (id,qty) => { if(qty<=0){get().removeItem(id);return;} set({items:get().items.map(i=>i.menuItemId===id?{...i,quantity:qty}:i)}); },
  clearCart: () => set({items:[],restId:null,restName:null}),
  subtotal: () => get().items.reduce((s,i)=>s+i.price*i.quantity,0),
  total: () => get().subtotal()+get().deliveryFee,
  count: () => get().items.reduce((s,i)=>s+i.quantity,0),
  earnCoins: () => get().subtotal()>=COIN.ORDER_THRESHOLD ? COIN.ORDER_HIGH : COIN.ORDER_LOW,
}));

// ── ORDERS ─────────────────────────────────────
export type OrderStatus = 'pending'|'accepted'|'preparing'|'ready'|'on_the_way'|'delivered'|'cancelled';
export interface Order {
  id:string; orderNumber:number; restId:string; restName:string; status:OrderStatus;
  items:string; subtotal:number; deliveryFee:number; total:number; coinsEarned:number;
  address:string; createdAt:Date;
}
interface OrderState {
  activeOrder:Order|null; myOrders:Order[];
  setActive:(o:Order)=>void; clearActive:()=>void; addOrder:(o:Order)=>void;
  updateStatus:(id:string,s:OrderStatus)=>void;
}
export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrder:null, myOrders:[],
  setActive:(o)=>set({activeOrder:o}),
  clearActive:()=>set({activeOrder:null}),
  addOrder:(o)=>set({myOrders:[o,...get().myOrders]}),
  updateStatus:(id,status)=>set({
    myOrders:get().myOrders.map(o=>o.id===id?{...o,status}:o),
    activeOrder:get().activeOrder?.id===id?{...get().activeOrder!,status}:get().activeOrder,
  }),
}));

// ── RESTAURANT ORDERS ──────────────────────────
export interface RestOrder {
  id:string; orderNumber:number; status:'new'|'accepted'|'preparing'|'ready';
  clientName:string; address:string; items:string;
  subtotal:number; myShare:number; platformShare:number; deliveryFee:number;
  createdAt:Date; timer:number;
}
interface RestOrderState {
  orders:RestOrder[];
  addOrder:(o:RestOrder)=>void; acceptOrder:(id:string)=>void;
  readyOrder:(id:string)=>void; rejectOrder:(id:string)=>void; tickTimers:()=>void;
}
export const useRestOrderStore = create<RestOrderState>((set, get) => ({
  orders:[
    { id:'ro1',orderNumber:4832,status:'new',clientName:'Anvar S.',address:"Yunusobod, Amir Temur 45",
      items:"2× Palov · 1× Somsa",subtotal:68000,myShare:61200,platformShare:6800,deliveryFee:9000,createdAt:new Date(),timer:42 },
    { id:'ro2',orderNumber:4833,status:'new',clientName:'Dilnoza M.',address:'Chilonzor, Navruz 12',
      items:"1× Lag'mon · 1× Mastava",subtotal:45000,myShare:40500,platformShare:4500,deliveryFee:8000,createdAt:new Date(Date.now()-120000),timer:125 },
    { id:'ro3',orderNumber:4829,status:'preparing',clientName:'Bobur T.',address:"Mirzo Ulug'bek, 7",
      items:'3× Kabob · 1× Non',subtotal:72000,myShare:64800,platformShare:7200,deliveryFee:12000,createdAt:new Date(Date.now()-600000),timer:0 },
  ],
  addOrder:(o)=>set(s=>({orders:[o,...s.orders]})),
  acceptOrder:(id)=>set(s=>({orders:s.orders.map(o=>o.id===id?{...o,status:'accepted'}:o)})),
  readyOrder:(id)=>set(s=>({orders:s.orders.map(o=>o.id===id?{...o,status:'ready'}:o)})),
  rejectOrder:(id)=>set(s=>({orders:s.orders.filter(o=>o.id!==id)})),
  tickTimers:()=>set(s=>({orders:s.orders.map(o=>o.status==='new'?{...o,timer:o.timer+1}:o)})),
}));
