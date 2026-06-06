import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  Switch, TextInput, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useRestOrderStore, useAuthStore, RestOrder } from '../../store';
import { api } from '../../api/client';
import {
  IcArrowLeft, IcPlus, IcEdit, IcTrash, IcCheck, IcX,
  IcToggleOn, IcToggleOff, IcStar, IcChart, IcLogout,
  IcSettings, IcPhone, IcInfo, IcMoon, IcSun, IcChevron,
  IcProfile, IcStore, IcBell, IcPreparing,
} from '../../components/Icons';

// ─── Types ────────────────────────────────────────
interface RestaurantInfo {
  id: string;
  name: string;
  address: string;
  isOpen: boolean;
  rating: number;
  ratingCount: number;
}

interface RestStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  rating: number;
  ratingCount: number;
}

interface BackendOrder {
  id: string;
  orderNumber: number;
  status: string;
  items: string;
  subtotal: number;
  total: number;
  restaurantShare: number;
  platformShare: number;
  address: string;
  floor?: string;
  apartment?: string;
  createdAt: string;
  customer: { name: string; phone: string };
}

interface RMenuItem {
  id: string; name: string; price: number; category: string;
  description: string; available: boolean; emoji: string;
}

// ─── Map backend order to RestOrder ───────────────
const toRestOrder = (o: BackendOrder): RestOrder => ({
  id: o.id,
  orderNumber: o.orderNumber,
  status: (o.status?.toLowerCase() === 'pending' ? 'new'
    : o.status?.toLowerCase() === 'accepted' ? 'accepted'
    : o.status?.toLowerCase() === 'preparing' ? 'preparing'
    : 'ready') as any,
  clientName: o.customer?.name || 'Mijoz',
  address: [o.address, o.floor ? `${o.floor}-qavat` : '', o.apartment ? `${o.apartment}-xona` : '']
    .filter(Boolean).join(', '),
  items: o.items,
  subtotal: o.subtotal,
  myShare: o.restaurantShare || 0,
  platformShare: o.platformShare || 0,
  deliveryFee: 0,
  createdAt: new Date(o.createdAt),
  timer: 0,
});

// ════════ BOSH SAHIFA ════════
export function RestaurantHomeScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user, token } = useAuthStore();
  const { orders, addOrder } = useRestOrderStore();
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [stats, setStats] = useState<RestStats | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get<{ restaurant: RestaurantInfo; stats: RestStats }>('/restaurants/stats/my', token)
      .then(d => { setRestaurant(d.restaurant); setStats(d.stats); setIsOpen(d.restaurant.isOpen); })
      .catch(() => {});
  }, []);

  const handleToggleOpen = async () => {
    if (!restaurant || toggling) return;
    setToggling(true);
    try {
      const updated = await api.patch<RestaurantInfo>(
        `/restaurants/${restaurant.id}`, { isOpen: !isOpen }, token
      );
      setIsOpen(updated.isOpen);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setToggling(false);
    }
  };

  const newCount = orders.filter(o => o.status === 'new').length;
  const prepCount = orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[rs2.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flex: 1 }}>
          <Text style={[rs2.name, { color: T.t1 }]}>{user?.name || 'Restoran'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.xs }}>
            <View style={[rs2.dot, { backgroundColor: isOpen ? C.gn : '#999' }]} />
            <Text style={[rs2.statusTxt, { color: isOpen ? C.gn : T.t4 }]}>
              {toggling ? 'O\'zgarmoqda...' : isOpen ? 'Ochiq' : 'Yopiq'}
            </Text>
            <Switch
              value={isOpen} onValueChange={handleToggleOpen}
              trackColor={{ false: T.bg4, true: C.gn }} thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              disabled={toggling}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg }}>
        <View style={rs2.statGrid}>
          {[
            { n: newCount.toString(), l: 'Yangi buyurtma', c: C.p },
            { n: prepCount.toString(), l: 'Tayyorlanmoqda', c: C.amber },
            { n: fmtPrice(stats?.totalRevenue || 0), l: 'Umumiy daromad', c: C.gn, wide: true },
            { n: `${(stats?.rating || 0).toFixed(1)} ★`, l: 'Reyting', c: C.gold },
          ].map((st, i) => (
            <View key={i} style={[rs2.statCard, { backgroundColor: T.card, borderColor: T.bd }, (st as any).wide && { width: '100%' }]}>
              <Text style={[rs2.statN, { color: st.c }]}>{st.n}</Text>
              <Text style={[rs2.statL, { color: T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[rs2.bigBtn, { backgroundColor: C.p }]}
          onPress={() => navigation.navigate('RBuyurtma')}
          activeOpacity={0.88}
        >
          <View style={rs2.bigBtnIcon}>
            <IcArrowLeft color="#fff" size={rs(20, 24)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={rs2.bigBtnTitle}>Buyurtmalarni boshqarish</Text>
            <Text style={rs2.bigBtnSub}>{newCount} ta yangi buyurtma kutmoqda</Text>
          </View>
          <Text style={{ fontSize: rs(18, 22), color: '#fff' }}>→</Text>
        </TouchableOpacity>

        <View style={[rs2.infoCard, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[rs2.infoTitle, { color: T.t1 }]}>Komissiya tizimi</Text>
          <Text style={[rs2.infoBody, { color: T.t3 }]}>
            Har buyurtmadan 10% komissiya avtomatik ajratiladi. Sizga 90% qoladi.
          </Text>
          <View style={rs2.infoRow}>
            <View style={[rs2.infoPill, { backgroundColor: C.gnb }]}>
              <Text style={[rs2.infoPillTxt, { color: C.gn }]}>90% Sizga</Text>
            </View>
            <View style={[rs2.infoPill, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
              <Text style={[rs2.infoPillTxt, { color: C.p }]}>10% Platforma</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const rs2 = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  name: { fontSize: rs(20, 24), fontWeight: '900' },
  dot: { width: rs(7, 9), height: rs(7, 9), borderRadius: 9 },
  statusTxt: { fontSize: F.sm, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg },
  statCard: { width: '47%', borderWidth: 1, borderRadius: R.lg, padding: S.md },
  statN: { fontSize: rs(20, 24), fontWeight: '900' },
  statL: { fontSize: F.xs, fontWeight: '600', marginTop: 4 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderRadius: R.lg, padding: S.lg, marginBottom: S.md },
  bigBtnIcon: { width: rs(40, 48), height: rs(40, 48), borderRadius: rs(13, 16), backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  bigBtnTitle: { color: '#fff', fontSize: F.lg, fontWeight: '900' },
  bigBtnSub: { color: 'rgba(255,255,255,0.85)', fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  infoCard: { borderWidth: 1, borderRadius: R.lg, padding: S.md },
  infoTitle: { fontSize: F.md, fontWeight: '800', marginBottom: S.sm },
  infoBody: { fontSize: F.sm, fontWeight: '500', lineHeight: rs(18, 22), marginBottom: S.md },
  infoRow: { flexDirection: 'row', gap: S.sm },
  infoPill: { flex: 1, borderRadius: R.full, paddingVertical: rs(8, 10), alignItems: 'center' },
  infoPillTxt: { fontSize: F.sm, fontWeight: '800' },
});

// ════════ BUYURTMALAR ════════
type Filter = 'new' | 'preparing' | 'ready';

export function RestaurantOrdersScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const { orders, addOrder, acceptOrder, readyOrder, rejectOrder, tickTimers } = useRestOrderStore();
  const [filter, setFilter] = useState<Filter>('new');
  const [restId, setRestId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const knownIds = useRef<Set<string>>(new Set());

  const syncOrders = useCallback(async (id: string) => {
    try {
      const raw = await api.get<BackendOrder[]>(`/restaurants/${id}/orders`, token);
      const active = raw.filter(o => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
      for (const o of active) {
        if (!knownIds.current.has(o.id)) {
          knownIds.current.add(o.id);
          addOrder(toRestOrder(o));
        }
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    api.get<{ restaurant: RestaurantInfo }>('/restaurants/stats/my', token)
      .then(d => { setRestId(d.restaurant.id); syncOrders(d.restaurant.id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!restId) return;
    const poll = setInterval(() => syncOrders(restId), 10000);
    const tick = setInterval(tickTimers, 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [restId]);

  const handleAccept = async (orderId: string) => {
    if (processing) return;
    setProcessing(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'accepted' }, token);
      acceptOrder(orderId);
      Alert.alert('Qabul qilindi', `#${orders.find(o => o.id === orderId)?.orderNumber} buyurtma qabul qilindi!`);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (processing) return;
    const order = orders.find(o => o.id === orderId);
    Alert.alert('Rad etish', `#${order?.orderNumber} buyurtmani rad etasizmi?`, [
      { text: 'Bekor', style: 'cancel' },
      {
        text: 'Rad etish', style: 'destructive', onPress: async () => {
          setProcessing(orderId);
          try {
            await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' }, token);
            rejectOrder(orderId);
            knownIds.current.delete(orderId);
          } catch (e: any) {
            Alert.alert('Xato', e.message);
          } finally {
            setProcessing(null);
          }
        },
      },
    ]);
  };

  const handleReady = async (orderId: string) => {
    if (processing) return;
    setProcessing(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'ready' }, token);
      readyOrder(orderId);
      Alert.alert('Tayyor!', 'Kuryer chaqirildi');
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setProcessing(null);
    }
  };

  const filtered = orders.filter(o =>
    filter === 'new' ? o.status === 'new'
    : filter === 'preparing' ? (o.status === 'accepted' || o.status === 'preparing')
    : o.status === 'ready'
  );

  const counts = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  const fmtTimer = (sec: number) => sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'new', label: 'Yangi' },
    { key: 'preparing', label: 'Tayyorlanmoqda' },
    { key: 'ready', label: 'Tayyor' },
  ];

  const EMPTY_ICONS = {
    new: <IcBell color={T.t4} size={rs(48, 60)} />,
    preparing: <IcPreparing color={T.t4} size={rs(48, 60)} />,
    ready: <IcCheck color={T.t4} size={rs(48, 60)} />,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[os.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[os.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(18, 22)} />
        </TouchableOpacity>
        <Text style={[os.hdrTitle, { color: T.t1 }]}>Buyurtmalar</Text>
        <View style={[os.live, { backgroundColor: C.gn }]}>
          <Text style={os.liveTxt}>LIVE</Text>
        </View>
      </View>

      <View style={[os.filters, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key}
            style={[os.chip, { backgroundColor: T.bg3, borderColor: T.bd }, filter === f.key && { backgroundColor: C.p, borderColor: C.p }]}
            onPress={() => setFilter(f.key)} activeOpacity={0.85}
          >
            <Text style={[os.chipTxt, { color: filter === f.key ? '#fff' : T.t2 }]}>{f.label}</Text>
            {counts[f.key] > 0 && (
              <View style={[os.chipBadge, { backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : C.p }]}>
                <Text style={os.chipBadgeTxt}>{counts[f.key]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: rs(60, 80) }}>
            {EMPTY_ICONS[filter]}
            <Text style={{ fontSize: F.xl, fontWeight: '800', color: T.t2, marginTop: S.md }}>
              {filter === 'new' ? "Yangi buyurtma yo'q" : filter === 'preparing' ? "Tayyorlanayotgan yo'q" : "Tayyor buyurtma yo'q"}
            </Text>
          </View>
        ) : filtered.map(order => (
          <OrderCard key={order.id} order={order} isDark={isDark} T={T} fmtTimer={fmtTimer}
            processing={processing}
            onAccept={() => handleAccept(order.id)}
            onReject={() => handleReject(order.id)}
            onReady={() => handleReady(order.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({ order, isDark, T, fmtTimer, onAccept, onReject, onReady, processing }: any) {
  const isNew = order.status === 'new';
  const isPrep = order.status === 'accepted' || order.status === 'preparing';
  const isReady = order.status === 'ready';
  const sColor = isNew ? C.p : isPrep ? C.amber : C.gn;
  const sBg = isNew ? (isDark ? '#2a1400' : C.plt) : isPrep ? (isDark ? '#2a1500' : C.ambBg) : (isDark ? C.gndk : C.gnb);
  const isProcessing = processing === order.id;

  return (
    <View style={[oc.card, { backgroundColor: T.card, borderColor: isNew ? C.p : T.bd }, isNew && { borderWidth: 2 }]}>
      <View style={[oc.top, { backgroundColor: sBg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          <View style={[oc.ping, { backgroundColor: sColor }]} />
          <Text style={[oc.num, { color: sColor }]}>#{order.orderNumber}</Text>
          <Text style={[oc.status, { color: sColor }]}>
            {isNew ? 'Yangi' : isPrep ? 'Tayyorlanmoqda' : 'Tayyor'}
          </Text>
        </View>
        {isNew && (
          <View style={[oc.timer, { backgroundColor: order.timer > 60 ? C.rdb : (isDark ? '#1a0a00' : C.ambBg) }]}>
            <Text style={[oc.timerTxt, { color: order.timer > 60 ? C.rd : C.amber }]}>
              {fmtTimer(order.timer)}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: S.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.md }}>
          <View style={[oc.av, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <IcProfile color={C.p} size={rs(20, 24)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[oc.client, { color: T.t1 }]}>{order.clientName}</Text>
            <Text style={[oc.addr, { color: T.t3 }]}>{order.address}</Text>
          </View>
        </View>
        <Text style={[oc.items, { color: T.t2 }]}>{order.items}</Text>
        <View style={[oc.total, { borderTopColor: T.bd }]}>
          <View>
            <Text style={[oc.totalLbl, { color: T.t3 }]}>Sizga (90%)</Text>
            <Text style={[oc.totalNum, { color: C.gn }]}>{fmtPrice(order.myShare)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[oc.totalLbl, { color: T.t3 }]}>Platforma (10%)</Text>
            <Text style={[{ fontSize: F.sm, fontWeight: '700' }, { color: T.t3 }]}>{fmtPrice(order.platformShare)}</Text>
          </View>
        </View>
      </View>

      <View style={[oc.btns, { borderTopColor: T.bd }]}>
        {isNew && (
          <>
            <TouchableOpacity style={[oc.btn, { backgroundColor: C.gn }]} onPress={onAccept} activeOpacity={0.87} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <IcCheck color="#fff" size={rs(16, 20)} />}
              <Text style={oc.btnTxt}>Qabul</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[oc.btn, { backgroundColor: isDark ? C.rddk : C.rdb, borderWidth: 1, borderColor: C.rd }]} onPress={onReject} activeOpacity={0.87} disabled={isProcessing}>
              <IcX color={C.rd} size={rs(16, 20)} />
              <Text style={[oc.btnTxt, { color: C.rd }]}>Rad</Text>
            </TouchableOpacity>
          </>
        )}
        {isPrep && (
          <TouchableOpacity style={[oc.btn, { flex: 1, backgroundColor: C.amber }]} onPress={onReady} activeOpacity={0.87} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text style={oc.btnTxt}>Tayyor!</Text>
          </TouchableOpacity>
        )}
        {isReady && (
          <View style={[oc.btn, { flex: 1, backgroundColor: isDark ? C.gndk : C.gnb, borderWidth: 1, borderColor: C.gn }]}>
            <IcCheck color={C.gn} size={rs(16, 20)} />
            <Text style={[oc.btnTxt, { color: C.gn }]}>Kuryer kutilmoqda</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const os = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  back: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  hdrTitle: { fontSize: rs(17, 21), fontWeight: '800' },
  live: { flexDirection: 'row', alignItems: 'center', paddingVertical: S.xs, paddingHorizontal: S.sm, borderRadius: R.full },
  liveTxt: { fontSize: F.xs, fontWeight: '900', color: '#fff' },
  filters: { flexDirection: 'row', padding: S.md, gap: S.sm, borderBottomWidth: 1 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, borderWidth: 1, borderRadius: R.full, paddingVertical: rs(8, 10) },
  chipTxt: { fontSize: F.xs, fontWeight: '700' },
  chipBadge: { minWidth: rs(18, 22), height: rs(18, 22), borderRadius: rs(9, 11), alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  chipBadgeTxt: { fontSize: rs(10, 12), fontWeight: '900', color: '#fff' },
});
const oc = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: R.lg, overflow: 'hidden', marginBottom: S.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.md, paddingVertical: S.sm },
  ping: { width: rs(7, 9), height: rs(7, 9), borderRadius: rs(4, 5) },
  num: { fontSize: F.md, fontWeight: '800' },
  status: { fontSize: F.sm, fontWeight: '600' },
  timer: { paddingVertical: 4, paddingHorizontal: S.sm, borderRadius: R.sm },
  timerTxt: { fontSize: F.sm, fontWeight: '800' },
  av: { width: rs(40, 48), height: rs(40, 48), borderRadius: rs(20, 24), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  client: { fontSize: F.md, fontWeight: '700' },
  addr: { fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  items: { fontSize: F.sm, fontWeight: '600', lineHeight: rs(20, 24), marginBottom: S.sm },
  total: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, paddingTop: S.sm },
  totalLbl: { fontSize: F.xs, fontWeight: '600' },
  totalNum: { fontSize: F.lg, fontWeight: '900', marginTop: 2 },
  btns: { flexDirection: 'row', gap: S.sm, padding: S.md, borderTopWidth: 0.5 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, borderRadius: R.md, paddingVertical: rs(11, 14) },
  btnTxt: { fontSize: F.md, fontWeight: '800', color: '#fff' },
});

// ════════ MENYU ════════
const CATEGORIES_R = ['Barchasi', 'Asosiy', 'Snack', 'Ichimlik', 'Yangi'];
const EMOJIS = ['🍽', '🍚', '🥟', '🍲', '🍜', '🍕', '🍔', '🌮', '🥗', '🍣', '🍵', '🥤', '🧃', '🍰', '🫕'];

export function RestaurantMenuScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const [restId, setRestId] = useState<string | null>(null);
  const [items, setItems] = useState<RMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('Barchasi');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<RMenuItem | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'Asosiy', desc: '', emoji: '🍽' });

  const loadMenu = async (id: string) => {
    try {
      const data = await api.get<RMenuItem[]>(`/restaurants/${id}/menu`, token);
      setItems(data.map(i => ({ ...i, description: i.description || '' })));
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get<{ restaurant: RestaurantInfo }>('/restaurants/stats/my', token)
      .then(d => { setRestId(d.restaurant.id); loadMenu(d.restaurant.id); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = catFilter === 'Barchasi' ? items : items.filter(i => i.category === catFilter);
  const availCount = items.filter(i => i.available).length;

  const toggleAvail = async (item: RMenuItem) => {
    if (!restId) return;
    try {
      const updated = await api.patch<RMenuItem>(`/restaurants/${restId}/menu/${item.id}`, { available: !item.available }, token);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: updated.available } : i));
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    }
  };

  const deleteItem = (item: RMenuItem) => {
    if (!restId) return;
    Alert.alert("O'chirish", "Bu taomni menyudan o'chirmoqchimisiz?", [
      { text: 'Bekor', style: 'cancel' },
      {
        text: "O'chirish", style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/restaurants/${restId}/menu/${item.id}`, token);
            setItems(prev => prev.filter(i => i.id !== item.id));
          } catch (e: any) {
            Alert.alert('Xato', e.message);
          }
        },
      },
    ]);
  };

  const openEdit = (item: RMenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, price: item.price.toString(), category: item.category, desc: item.description || '', emoji: item.emoji });
    setShowAdd(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', price: '', category: 'Asosiy', desc: '', emoji: '🍽' });
    setShowAdd(true);
  };

  const saveItem = async () => {
    if (!restId) return;
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Xato', 'Nom va narxni kiriting');
      return;
    }
    const price = parseInt(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Xato', "Narx to'g'ri kiriting");
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        const updated = await api.patch<RMenuItem>(
          `/restaurants/${restId}/menu/${editItem.id}`,
          { name: form.name.trim(), price, category: form.category, description: form.desc.trim(), emoji: form.emoji },
          token,
        );
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...updated, description: updated.description || '' } : i));
      } else {
        const created = await api.post<RMenuItem>(
          `/restaurants/${restId}/menu`,
          { name: form.name.trim(), price, category: form.category, description: form.desc.trim(), emoji: form.emoji },
          token,
        );
        setItems(prev => [...prev, { ...created, description: created.description || '' }]);
      }
      setShowAdd(false);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={C.p} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[mn.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flex: 1 }}>
          <Text style={[mn.title, { color: T.t1 }]}>Menyu</Text>
          <Text style={[mn.sub, { color: T.t3 }]}>{availCount}/{items.length} ta mavjud</Text>
        </View>
        <TouchableOpacity style={[mn.addBtn, { backgroundColor: C.p }]} onPress={openAdd}>
          <IcPlus color="#fff" size={rs(18, 22)} />
          <Text style={mn.addTxt}>Qo'shish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ maxHeight: rs(50, 60), borderBottomWidth: 1, borderBottomColor: T.bd }}
        contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.sm, alignItems: 'center', paddingVertical: S.sm }}
      >
        {CATEGORIES_R.map(cat => (
          <TouchableOpacity key={cat}
            style={[mn.catChip, { backgroundColor: T.bg3, borderColor: T.bd }, catFilter === cat && { backgroundColor: C.p, borderColor: C.p }]}
            onPress={() => setCatFilter(cat)}
          >
            <Text style={[mn.catTxt, { color: catFilter === cat ? '#fff' : T.t2 }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {filtered.map(item => (
          <View key={item.id} style={[mn.itemCard, { backgroundColor: T.card, borderColor: item.available ? T.bd : C.rd + '44' }, !item.available && { opacity: 0.7 }]}>
            <View style={[mn.itemEmoji, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
              <Text style={{ fontSize: rs(22, 27) }}>{item.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.xs }}>
                <Text style={[mn.itemName, { color: T.t1 }]}>{item.name}</Text>
                {!item.available && (
                  <View style={[mn.badge, { backgroundColor: C.rdb }]}>
                    <Text style={[mn.badgeTxt, { color: C.rd }]}>To'xtatilgan</Text>
                  </View>
                )}
              </View>
              <Text style={[mn.itemDesc, { color: T.t3 }]}>{item.description}</Text>
              <Text style={[mn.itemPrice, { color: C.p }]}>{fmtPrice(item.price)}</Text>
              <Text style={[mn.itemCat, { color: T.t4 }]}>{item.category}</Text>
            </View>
            <View style={{ gap: S.sm }}>
              <TouchableOpacity onPress={() => toggleAvail(item)}>
                {item.available
                  ? <IcToggleOn color={C.gn} size={rs(26, 32)} />
                  : <IcToggleOff color="#999" size={rs(26, 32)} />}
              </TouchableOpacity>
              <TouchableOpacity style={[mn.iconBtn, { backgroundColor: isDark ? '#1a1a2a' : '#EEF2FF' }]} onPress={() => openEdit(item)}>
                <IcEdit color={C.blue} size={rs(14, 17)} />
              </TouchableOpacity>
              <TouchableOpacity style={[mn.iconBtn, { backgroundColor: C.rdb }]} onPress={() => deleteItem(item)}>
                <IcTrash color={C.rd} size={rs(14, 17)} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: rs(60, 80) }}>
            <IcStore color={T.t4} size={rs(48, 60)} />
            <Text style={{ fontSize: F.xl, fontWeight: '800', color: T.t2, marginTop: S.md }}>
              Bu kategoriyada taom yo'q
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={mn.overlay}>
          <View style={[mn.modal, { backgroundColor: T.bg }]}>
            <View style={[mn.modalHdr, { borderBottomColor: T.bd }]}>
              <Text style={[mn.modalTitle, { color: T.t1 }]}>{editItem ? 'Taomni tahrirlash' : "Yangi taom qo'shish"}</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <IcX color={T.t2} size={rs(22, 26)} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: S.lg }}>
              <Text style={[mn.lbl, { color: T.t2 }]}>Emoji tanlang</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.md }}>
                <View style={{ flexDirection: 'row', gap: S.sm }}>
                  {EMOJIS.map(e => (
                    <TouchableOpacity key={e}
                      style={[mn.emojiBtn, { backgroundColor: form.emoji === e ? C.plt : T.bg3, borderColor: form.emoji === e ? C.p : T.bd }]}
                      onPress={() => setForm(f => ({ ...f, emoji: e }))}
                    >
                      <Text style={{ fontSize: rs(20, 24) }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {[
                { label: 'Taom nomi *', key: 'name', placeholder: 'Mas: Palov', keyboard: 'default' },
                { label: "Narxi (so'm) *", key: 'price', placeholder: 'Mas: 25000', keyboard: 'numeric' },
                { label: 'Tavsif', key: 'desc', placeholder: "Mas: An'anaviy o'zbek palovi", keyboard: 'default' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: S.md }}>
                  <Text style={[mn.lbl, { color: T.t2 }]}>{f.label}</Text>
                  <TextInput
                    style={[mn.input, { backgroundColor: T.bg2, borderColor: T.bd, color: T.t1 }]}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder} placeholderTextColor={T.t4}
                    keyboardType={f.keyboard as any}
                  />
                </View>
              ))}

              <Text style={[mn.lbl, { color: T.t2 }]}>Kategoriya</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg }}>
                {['Asosiy', 'Snack', 'Ichimlik', 'Desert', 'Yangi'].map(cat => (
                  <TouchableOpacity key={cat}
                    style={[mn.catChip, { backgroundColor: form.category === cat ? C.p : T.bg3, borderColor: form.category === cat ? C.p : T.bd }]}
                    onPress={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[mn.catTxt, { color: form.category === cat ? '#fff' : T.t2 }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[mn.saveBtn, { backgroundColor: saving ? T.bg3 : C.p }]} onPress={saveItem} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={C.p} size="small" />
                  : <IcCheck color="#fff" size={rs(18, 22)} />
                }
                <Text style={[mn.saveTxt, { color: saving ? T.t3 : '#fff' }]}>{editItem ? 'Saqlash' : "Qo'shish"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const mn = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  sub: { fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: S.xs, borderRadius: R.md, paddingVertical: rs(9, 11), paddingHorizontal: rs(14, 18) },
  addTxt: { color: '#fff', fontWeight: '800', fontSize: F.sm },
  catChip: { paddingVertical: rs(7, 9), paddingHorizontal: rs(14, 18), borderRadius: R.full, borderWidth: 1 },
  catTxt: { fontSize: F.xs, fontWeight: '700' },
  itemCard: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  itemEmoji: { width: rs(52, 62), height: rs(52, 62), borderRadius: rs(16, 20), alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: F.md, fontWeight: '800' },
  itemDesc: { fontSize: F.xs, fontWeight: '500', marginTop: 3 },
  itemPrice: { fontSize: F.md, fontWeight: '900', marginTop: S.xs },
  itemCat: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  badge: { paddingVertical: 2, paddingHorizontal: rs(7, 9), borderRadius: R.full },
  badgeTxt: { fontSize: rs(9, 11), fontWeight: '800' },
  iconBtn: { width: rs(28, 34), height: rs(28, 34), borderRadius: rs(9, 11), alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: '85%' },
  modalHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  modalTitle: { fontSize: F.lg, fontWeight: '900' },
  lbl: { fontSize: F.sm, fontWeight: '700', marginBottom: S.xs },
  input: { borderWidth: 1.5, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: rs(11, 14), fontSize: F.md },
  emojiBtn: { width: rs(44, 52), height: rs(44, 52), borderRadius: rs(13, 16), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, borderRadius: R.lg, paddingVertical: rs(15, 19) },
  saveTxt: { fontWeight: '900', fontSize: F.lg },
});

// ════════ STATISTIKA ════════
export function RestaurantStatsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const [stats, setStats] = useState<RestStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ stats: RestStats }>('/restaurants/stats/my', token)
      .then(d => setStats(d.stats))
      .catch(e => Alert.alert('Xato', e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={C.p} size="large" />
      </SafeAreaView>
    );
  }

  const avgOrder = stats && stats.totalOrders > 0
    ? Math.round((stats.totalRevenue / stats.totalOrders) / 0.9)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[stt.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[stt.title, { color: T.t1 }]}>Statistika</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        <View style={stt.grid}>
          {[
            { n: fmtPrice(stats?.totalRevenue || 0), l: 'Umumiy daromad', c: C.gn },
            { n: (stats?.totalOrders || 0).toString(), l: 'Jami buyurtma', c: C.p },
            { n: (stats?.todayOrders || 0).toString(), l: 'Bugungi buyurtma', c: C.amber },
            { n: `${(stats?.rating || 0).toFixed(1)} ★`, l: 'Reyting', c: C.gold },
          ].map((item, i) => (
            <View key={i} style={[stt.card, { backgroundColor: T.card, borderColor: T.bd }]}>
              <Text style={[stt.cardN, { color: item.c }]}>{item.n}</Text>
              <Text style={[stt.cardL, { color: T.t3 }]}>{item.l}</Text>
            </View>
          ))}
        </View>

        <View style={[stt.infoBox, { backgroundColor: C.p }]}>
          <Text style={stt.infoTitle}>Daromad taqsimoti</Text>
          <View style={stt.infoGrid}>
            {[
              { n: fmtPrice(Math.round((stats?.totalRevenue || 0) / 0.9)), l: "Jami buyurtma summa" },
              { n: fmtPrice(stats?.totalRevenue || 0), l: "Sizning ulushingiz (90%)" },
              { n: fmtPrice(Math.round((stats?.totalRevenue || 0) / 9)), l: "Platforma (10%)" },
              { n: fmtPrice(avgOrder), l: "O'rtacha buyurtma" },
            ].map((r, i) => (
              <View key={i} style={stt.infoItem}>
                <Text style={stt.infoN}>{r.n}</Text>
                <Text style={stt.infoL}>{r.l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[stt.ratingBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[stt.sectionTitle, { color: T.t1 }]}>Reyting</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md }}>
            <Text style={{ fontSize: rs(48, 60), fontWeight: '900', color: C.gold }}>
              {(stats?.rating || 0).toFixed(1)}
            </Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: S.xs }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <IcStar key={s} color={s <= Math.round(stats?.rating || 0) ? C.gold : T.bg4} size={rs(20, 24)} />
                ))}
              </View>
              <Text style={{ fontSize: F.sm, color: T.t3, fontWeight: '600' }}>
                {stats?.ratingCount || 0} ta baho
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stt = StyleSheet.create({
  hdr: { padding: S.lg, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.md },
  card: { width: '47%', borderWidth: 1, borderRadius: R.lg, padding: S.md },
  cardN: { fontSize: rs(16, 20), fontWeight: '900' },
  cardL: { fontSize: F.xs, fontWeight: '600', marginTop: 4 },
  infoBox: { borderRadius: R.xl, padding: rs(18, 24), marginBottom: S.md },
  infoTitle: { fontSize: F.lg, fontWeight: '900', color: '#fff', marginBottom: S.md },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  infoItem: { width: '47%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: R.md, padding: S.md, alignItems: 'center' },
  infoN: { fontSize: rs(14, 17), fontWeight: '900', color: '#fff' },
  infoL: { fontSize: F.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 3, textAlign: 'center' },
  ratingBox: { borderWidth: 1, borderRadius: R.lg, overflow: 'hidden' },
  sectionTitle: { fontSize: F.md, fontWeight: '800', padding: S.md, paddingBottom: 0 },
});

// ════════ PROFIL ════════
interface CourierRow { id: string; name: string; phone: string; online: boolean; rating: number; totalDeliveries: number; }

export function RestaurantProfileScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, logout, token } = useAuthStore();
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [stats, setStats] = useState<RestStats | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [couriers, setCouriers] = useState<CourierRow[]>([]);
  const [addPhone, setAddPhone] = useState('');
  const [addingCourier, setAddingCourier] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.get<{ restaurant: RestaurantInfo; stats: RestStats }>('/restaurants/stats/my', token)
      .then(d => {
        setRestaurant(d.restaurant);
        setStats(d.stats);
        setIsOpen(d.restaurant.isOpen);
        return api.get<CourierRow[]>(`/restaurants/${d.restaurant.id}/couriers`, token);
      })
      .then(setCouriers)
      .catch(() => {});
  }, []);

  const handleToggleOpen = async () => {
    if (!restaurant || toggling) return;
    setToggling(true);
    try {
      const updated = await api.patch<RestaurantInfo>(`/restaurants/${restaurant.id}`, { isOpen: !isOpen }, token);
      setIsOpen(updated.isOpen);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  const handleAddCourier = async () => {
    if (addPhone.length < 9 || !restaurant) return;
    setAddingCourier(true);
    try {
      await api.post(`/restaurants/${restaurant.id}/couriers`, { phone: '998' + addPhone }, token);
      const updated = await api.get<CourierRow[]>(`/restaurants/${restaurant.id}/couriers`, token);
      setCouriers(updated);
      setAddPhone('');
      setShowAddModal(false);
      Alert.alert('Qo\'shildi!', 'Kuryer restoranga biriktirildi.');
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setAddingCourier(false);
    }
  };

  const handleRemoveCourier = (courierId: string) => {
    if (!restaurant) return;
    Alert.alert("O'chirish", "Bu kuryerni olib tashlamoqchimisiz?", [
      { text: 'Bekor', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/restaurants/${restaurant.id}/couriers/${courierId}`, token);
          setCouriers(prev => prev.filter(c => c.id !== courierId));
        } catch (e: any) {
          Alert.alert('Xato', e.message);
        }
      }},
    ]);
  };

  const GROUPS = [
    [
      { Icon: IcPhone, label: 'Telefon raqam', val: user?.phone ? '+' + user.phone : '', bg: C.blue, go: () => {} },
      { Icon: IcInfo, label: 'Restoran haqida', val: '', bg: '#7C4DFF', go: () => Alert.alert('Tez orada', "Restoran ma'lumotlarini tahrirlash qo'shiladi") },
    ],
    [
      { Icon: IcSettings, label: 'Ish vaqti', val: '09:00 - 22:00', bg: C.amber, go: () => Alert.alert("Ish vaqti", "Ish vaqtini sozlash qo'shiladi") },
      { Icon: IcChart, label: 'Statistika', val: '', bg: C.gn, go: () => navigation.navigate('RStat') },
    ],
  ];

  return (
    <SafeAreaView style={[pr.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[pr.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[pr.title, { color: T.t1 }]}>Profil</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: S.xxl }}>
        <View style={[pr.top, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
          <View style={[pr.avatar, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <IcStore color={C.p} size={rs(34, 42)} />
          </View>
          <Text style={[pr.name, { color: T.t1 }]}>{user?.name || 'Restoran'}</Text>
          <Text style={[pr.phone, { color: T.t3 }]}>+{user?.phone}</Text>
          {user?.regionName && <Text style={[pr.region, { color: T.t4 }]}>{user.regionName}</Text>}

          <View style={[pr.statusRow, { backgroundColor: isOpen ? C.gnb : C.rdb, borderColor: isOpen ? C.gn : C.rd }]}>
            <View style={[pr.statusDot, { backgroundColor: isOpen ? C.gn : C.rd }]} />
            <Text style={[pr.statusTxt, { color: isOpen ? C.gn : C.rd }]}>
              {toggling ? "O'zgarmoqda..." : isOpen ? 'Hozir ochiq' : 'Hozir yopiq'}
            </Text>
            <Switch
              value={isOpen} onValueChange={handleToggleOpen}
              trackColor={{ false: C.rd + '44', true: C.gn + '44' }} thumbColor={isOpen ? C.gn : C.rd}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              disabled={toggling}
            />
          </View>
        </View>

        <View style={[pr.statsRow, { borderBottomColor: T.bd }]}>
          {[
            { n: (stats?.totalOrders || 0).toString(), l: 'Buyurtma', c: C.p },
            { n: (stats?.rating || 0).toFixed(1), l: 'Reyting', c: C.gold },
            { n: (stats?.ratingCount || 0).toString(), l: 'Baho', c: C.gn },
          ].map((st, i) => (
            <View key={i} style={[pr.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: T.bd }]}>
              <Text style={[pr.statN, { color: st.c }]}>{st.n}</Text>
              <Text style={[pr.statL, { color: T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {GROUPS.map((grp, gi) => (
          <View key={gi} style={[pr.grp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
            {grp.map((item, ii) => (
              <TouchableOpacity key={ii}
                style={[pr.row, ii < grp.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}
                onPress={item.go} activeOpacity={0.7}
              >
                <View style={[pr.rowIcon, { backgroundColor: item.bg }]}>
                  <item.Icon color="#fff" size={rs(17, 21)} />
                </View>
                <Text style={[pr.rowLbl, { color: T.t1 }]}>{item.label}</Text>
                {item.val ? <Text style={[pr.rowVal, { color: T.t3 }]}>{item.val}</Text> : null}
                <IcChevron color={T.t4} size={rs(16, 20)} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={[pr.grp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
          <View style={pr.row}>
            <View style={[pr.rowIcon, { backgroundColor: isDark ? '#1a1a2a' : '#e0e0ff' }]}>
              {isDark ? <IcMoon color="#aaf" size={rs(17, 21)} /> : <IcSun color="#f90" size={rs(17, 21)} />}
            </View>
            <Text style={[pr.rowLbl, { color: T.t1, flex: 1 }]}>{isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}</Text>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ false: T.bg4, true: C.p }} thumbColor="#fff" />
          </View>
        </View>

        {/* Kuryerlar bo'limi */}
        <View style={{ marginHorizontal: S.lg, marginTop: S.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.sm }}>
            <Text style={{ fontSize: F.md, fontWeight: '800', color: T.t1 }}>
              Kuryerlar ({couriers.length}/8)
            </Text>
            {couriers.length < 8 && (
              <TouchableOpacity
                style={{ backgroundColor: C.p, borderRadius: R.md, paddingVertical: rs(5, 7), paddingHorizontal: S.md }}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.87}
              >
                <Text style={{ fontSize: F.xs, fontWeight: '800', color: '#fff' }}>+ Qo'shish</Text>
              </TouchableOpacity>
            )}
          </View>
          {couriers.length === 0 ? (
            <View style={[pr.emptyBox, { backgroundColor: T.bg2, borderColor: T.bd }]}>
              <Text style={{ fontSize: F.sm, color: T.t4, fontWeight: '600', textAlign: 'center' }}>
                Hali kuryer yo'q. Telefon raqami orqali qo'shing.
              </Text>
            </View>
          ) : (
            couriers.map((c, i) => (
              <View key={c.id} style={[pr.courierRow, { backgroundColor: T.bg2, borderColor: T.bd }]}>
                <View style={[pr.courierDot, { backgroundColor: c.online ? C.gn : T.t4 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: F.sm, fontWeight: '800', color: T.t1 }}>{c.name}</Text>
                  <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600' }}>+{c.phone} · {c.totalDeliveries} yetkazish</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveCourier(c.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <IcX color={C.rd} size={rs(16, 20)} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Kuryer qo'shish modal */}
        <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={[pr.modal, { backgroundColor: T.bg }]}>
              <Text style={{ fontSize: F.lg, fontWeight: '900', color: T.t1, marginBottom: S.md }}>Kuryer qo'shish</Text>
              <Text style={{ fontSize: F.sm, color: T.t3, fontWeight: '600', marginBottom: S.sm }}>Kuryer telefon raqami</Text>
              <View style={[pr.phoneRow, { backgroundColor: T.bg2, borderColor: T.bd }]}>
                <Text style={{ fontSize: F.md, fontWeight: '800', color: T.t2 }}>+998</Text>
                <TextInput
                  style={{ flex: 1, fontSize: F.md, fontWeight: '700', color: T.t1, padding: 0 }}
                  value={addPhone}
                  onChangeText={t => setAddPhone(t.replace(/\D/g, '').slice(0, 9))}
                  placeholder="90 000 00 00"
                  placeholderTextColor={T.t4}
                  keyboardType="phone-pad"
                  maxLength={9}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.md }}>
                <TouchableOpacity style={[pr.modalBtn, { backgroundColor: T.bg3, flex: 1 }]} onPress={() => { setShowAddModal(false); setAddPhone(''); }}>
                  <Text style={{ fontSize: F.md, fontWeight: '800', color: T.t2 }}>Bekor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[pr.modalBtn, { backgroundColor: addPhone.length === 9 ? C.p : T.bg3, flex: 1 }]} onPress={handleAddCourier} disabled={addPhone.length !== 9 || addingCourier}>
                  {addingCourier ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: F.md, fontWeight: '800', color: addPhone.length === 9 ? '#fff' : T.t4 }}>Qo'shish</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={[pr.logoutBtn, { backgroundColor: isDark ? C.rddk : C.rdb, borderColor: C.rd, marginTop: S.md }]} onPress={handleLogout}>
          <IcLogout color={C.rd} size={rs(18, 22)} />
          <Text style={[pr.logoutTxt, { color: C.rd }]}>Tizimdan chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const pr = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { padding: S.lg, paddingBottom: S.md, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  top: { alignItems: 'center', paddingVertical: S.xl, paddingHorizontal: S.lg, borderBottomWidth: 1 },
  avatar: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(26, 32), borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  name: { fontSize: rs(20, 25), fontWeight: '900' },
  phone: { fontSize: F.md, fontWeight: '600', marginTop: 4 },
  region: { fontSize: F.sm, fontWeight: '600', marginTop: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.md, borderWidth: 1.5, borderRadius: R.full, paddingVertical: S.sm, paddingHorizontal: S.md },
  statusDot: { width: rs(7, 9), height: rs(7, 9), borderRadius: 9 },
  statusTxt: { fontSize: F.sm, fontWeight: '800', flex: 1 },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  statItem: { flex: 1, paddingVertical: rs(16, 20), alignItems: 'center' },
  statN: { fontSize: rs(22, 27), fontWeight: '900' },
  statL: { fontSize: F.xs, fontWeight: '700', marginTop: 3, textTransform: 'uppercase' },
  grp: { marginHorizontal: S.lg, marginTop: S.md, borderWidth: 1, borderRadius: R.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  rowIcon: { width: rs(38, 46), height: rs(38, 46), borderRadius: rs(12, 15), alignItems: 'center', justifyContent: 'center' },
  rowLbl: { flex: 1, fontSize: F.md, fontWeight: '700' },
  rowVal: { fontSize: F.sm, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.lg, borderWidth: 1.5, borderRadius: R.lg, paddingVertical: S.md },
  logoutTxt: { fontSize: F.lg, fontWeight: '900' },
  emptyBox: { borderWidth: 1, borderRadius: R.md, padding: S.md, alignItems: 'center' },
  courierRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, borderWidth: 1, borderRadius: R.md, padding: S.sm, marginBottom: S.xs },
  courierDot: { width: rs(8, 10), height: rs(8, 10), borderRadius: rs(4, 5) },
  modal: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.lg, paddingBottom: S.xxl },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: R.md, paddingHorizontal: S.md, height: rs(52, 64), gap: S.sm },
  modalBtn: { borderRadius: R.md, paddingVertical: rs(13, 16), alignItems: 'center' },
});
