import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK, LIGHT, Theme } from '../theme';
import { COIN } from '../constants';

// ── THEME ──────────────────────────────────────
interface ThemeState {
  isDark: boolean; T: Theme;
  toggle: () => void;
  setDark: (v: boolean) => void;
}
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false, T: LIGHT,
      toggle: () => set(s => ({ isDark: !s.isDark, T: s.isDark ? LIGHT : DARK })),
      setDark: (v) => set({ isDark: v, T: v ? DARK : LIGHT }),
    }),
    {
      name: 'dg-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isDark: s.isDark }),
      onRehydrateStorage: () => (state) => {
        if (state) state.T = state.isDark ? DARK : LIGHT;
      },
    }
  )
);

// ── USER ───────────────────────────────────────
export type UserRole = 'customer'|'restaurant_owner'|'courier'|'admin'|'superadmin';
export interface User {
  id: string; phone: string; name: string; role: UserRole;
  status: 'active'|'pending'|'blocked';
  regionId?: string; regionName?: string; address?: string;
  coins: number; streak: number; lastOrderDate?: string; referralCount: number;
  avatar?: string; floor?: string; apartment?: string; referralCode?: string;
}
interface AuthState {
  user: User|null; token: string|null; hydrated: boolean;
  setAuth: (u: User, t: string) => void;
  updateUser: (u: Partial<User>) => void;
  addCoins: (n: number) => void;
  incrementStreak: () => void;
  logout: () => void;
  setHydrated: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, token: null, hydrated: false,
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
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'dg-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

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
  notifs: [],
  unreadCount: 0,
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
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:[], restId:null, restName:null, deliveryFee:5000,
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
    }),
    {
      name: 'dg-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items, restId: s.restId, restName: s.restName }),
    }
  )
);

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
export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      activeOrder:null, myOrders:[],
      setActive:(o)=>set({activeOrder:o}),
      clearActive:()=>set({activeOrder:null}),
      addOrder:(o)=>set({myOrders:[o,...get().myOrders]}),
      updateStatus:(id,status)=>set({
        myOrders:get().myOrders.map(o=>o.id===id?{...o,status}:o),
        activeOrder:get().activeOrder?.id===id?{...get().activeOrder!,status}:get().activeOrder,
      }),
    }),
    {
      name: 'dg-orders',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ activeOrder: s.activeOrder, myOrders: s.myOrders.slice(0,20) }),
    }
  )
);

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
  orders:[],
  addOrder:(o)=>set(s=>({orders:[o,...s.orders]})),
  acceptOrder:(id)=>set(s=>({orders:s.orders.map(o=>o.id===id?{...o,status:'accepted'}:o)})),
  readyOrder:(id)=>set(s=>({orders:s.orders.map(o=>o.id===id?{...o,status:'ready'}:o)})),
  rejectOrder:(id)=>set(s=>({orders:s.orders.filter(o=>o.id!==id)})),
  tickTimers:()=>set(s=>({orders:s.orders.map(o=>o.status==='new'?{...o,timer:o.timer+1}:o)})),
}));
