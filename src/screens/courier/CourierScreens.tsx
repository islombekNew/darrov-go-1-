import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
  ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore, useNotifStore } from '../../store';
import { api } from '../../api/client';
import {
  IcCheck, IcLogout, IcSettings,
  IcPhone, IcStar, IcMotorbike, IcPin, IcTime,
  IcChevron, IcMoon, IcSun, IcX,
} from '../../components/Icons';

// ─── Types ────────────────────────────────────────
interface CourierProfile {
  id: string;
  online: boolean;
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  vehicle: string;
  restaurantId: string | null;
  restaurantName: string | null;
  user: { name: string; phone: string; avatar?: string };
}

interface RestaurantItem {
  id: string;
  name: string;
  address: string;
  regionName: string;
  courierCount: number;
  isFull: boolean;
}

interface AvailableOrder {
  id: string;
  orderNumber: number;
  items: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  distance?: number | null;
  courierEarning?: number | null;
  restaurant: { name: string; address: string };
  customer: { name: string };
  createdAt: string;
}

interface Delivery {
  id: string;
  orderNumber: number;
  status: string;
  address: string;
  distance?: number | null;
  courierEarning?: number | null;
  restaurant: { name: string; address: string };
  customer: { name: string; phone: string };
  createdAt: string;
}

interface CourierStats {
  totalDeliveries: number;
  rating: number;
  ratingCount: number;
  online: boolean;
  todayDeliveries: number;
  weekDeliveries: number;
  totalEarnings: number;
  weekEarnings: number;
}

// ─── Helpers ──────────────────────────────────────
const DAY_NAMES = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Bugun';
  if (d.toDateString() === yest.toDateString()) return 'Kecha';
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff < 7) return `${diff} kun oldin`;
  return d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
};

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const groupByDate = (deliveries: Delivery[]) => {
  const groups: Record<string, Delivery[]> = {};
  for (const d of deliveries) {
    const key = new Date(d.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  }
  return Object.entries(groups).map(([, items]) => ({
    date: fmtDate(items[0].createdAt),
    items,
    total: items.reduce((s, d) => s + (d.courierEarning || 0), 0),
  }));
};

const buildWeekChart = (deliveries: Delivery[]) => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const dayDels = deliveries.filter(
      del => del.status === 'delivered' && new Date(del.createdAt).toDateString() === dayStr,
    );
    return {
      day: DAY_NAMES[d.getDay()],
      earn: dayDels.reduce((s, d) => s + (d.courierEarning || 0), 0),
      deliveries: dayDels.length,
      isToday: i === 6,
    };
  });
};

const EARN_TABLE = [
  { label: '0–1 km', fee: 5000, earn: 3500 },
  { label: '1–2 km', fee: 6500, earn: 4550 },
  { label: '2–3 km', fee: 7500, earn: 5250 },
  { label: '3–5 km', fee: 9000, earn: 6300 },
];

// ════════ BOSH SAHIFA ════════
export function CourierHomeScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user, token } = useAuthStore();
  const { add: addNotif } = useNotifStore();
  const [online, setOnline] = useState(false);
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [restLoading, setRestLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<Location.LocationSubscription | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, ordersData, profileData] = await Promise.all([
        api.get<CourierStats>('/couriers/me/stats', token),
        api.get<AvailableOrder[]>('/orders/available/courier', token),
        api.get<CourierProfile>('/couriers/me', token),
      ]);
      setStats(statsData);
      setOnline(statsData.online);
      setOrders(ordersData);
      setProfile(profileData);
    } catch {
      // silent fail on poll
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRestaurants = useCallback(async () => {
    setRestLoading(true);
    try {
      const data = await api.get<RestaurantItem[]>('/couriers/restaurants', token);
      setRestaurants(data);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setRestLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchData]);

  useEffect(() => {
    if (profile && !profile.restaurantId) fetchRestaurants();
  }, [profile?.restaurantId]);

  // GPS joylashuvni yuborish — online bo'lganda har 5 soniyada
  useEffect(() => {
    if (!online || !token) {
      locationRef.current?.remove();
      locationRef.current = null;
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || !mounted) return;
        locationRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 15 },
          async (loc) => {
            try {
              await api.patch('/couriers/me/location', {
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
              }, token);
            } catch {}
          },
        );
      } catch {}
    })();
    return () => {
      mounted = false;
      locationRef.current?.remove();
      locationRef.current = null;
    };
  }, [online, token]);

  const handleToggleOnline = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await api.patch<{ online: boolean }>('/couriers/me/toggle', {}, token);
      setOnline(res.online);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setToggling(false);
    }
  };

  const handleLeaveRestaurant = () => {
    Alert.alert(
      'Restorandan chiqish',
      `${profile?.restaurantName ?? 'Restoran'}dan chiqmoqchimisiz?\n\nChiqqaningizda, kutayotgan kuryerlarga bo'sh joy haqida xabar ketadi.`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: async () => {
            setLeaving(true);
            try {
              await api.post('/couriers/me/leave-restaurant', {}, token);
              addNotif({
                type: 'courier_left',
                title: 'Restorandan chiqdingiz',
                body: `${profile?.restaurantName ?? 'Restoran'}dan muvaffaqiyatli chiqdingiz.`,
              });
              setProfile(prev => prev ? { ...prev, restaurantId: null, restaurantName: null } : prev);
              fetchRestaurants();
            } catch (e: any) {
              Alert.alert('Xato', e.message || "Chiqib bo'lmadi, qayta urining");
            } finally {
              setLeaving(false);
            }
          },
        },
      ],
    );
  };

  const handleJoinRestaurant = async (restaurantId: string) => {
    setJoiningId(restaurantId);
    try {
      const res = await api.post<{ ok: boolean; restaurantName: string }>(
        '/couriers/me/join-restaurant', { restaurantId }, token,
      );
      setProfile(prev => prev ? { ...prev, restaurantId, restaurantName: res.restaurantName } : prev);
      Alert.alert("Qo'shildingiz!", `Siz ${res.restaurantName} restoraniga qo'shildingiz.`);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setJoiningId(null);
    }
  };

  const handleAccept = async (orderId: string) => {
    if (accepting) return;
    setAccepting(orderId);
    try {
      await api.post<any>(`/couriers/me/accept/${orderId}`, {}, token);
      Alert.alert('Qabul qilindi!', "Manzilga yo'l oling.");
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setAccepting(null);
    }
  };

  const handleSkip = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={C.p} size="large" />
      </SafeAreaView>
    );
  }

  // Restoran tanlanmagan — tanlash ekrani
  if (!profile?.restaurantId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
        <View style={[k.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
          <View style={{ flex: 1 }}>
            <Text style={[k.name, { color: T.t1 }]}>{user?.name || 'Kuryer'}</Text>
            <Text style={{ fontSize: F.xs, color: C.amber, fontWeight: '700', marginTop: 3 }}>
              Restoran tanlanmagan
            </Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: S.lg }}>
          <View style={[k.earnCard, { backgroundColor: isDark ? '#2a1000' : C.plt, marginBottom: S.md }]}>
            <Text style={{ fontSize: F.lg, fontWeight: '900', color: C.pdk, marginBottom: S.xs }}>
              Ishlamoqchi bo'lgan restoranni tanlang
            </Text>
            <Text style={{ fontSize: F.sm, color: T.t3, fontWeight: '600' }}>
              Har restoranda max 8 ta kuryer ishlaydi
            </Text>
          </View>

          {restLoading ? (
            <ActivityIndicator color={C.p} style={{ marginTop: S.xl }} />
          ) : restaurants.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: rs(40, 56) }}>
              <IcMotorbike color={T.t4} size={rs(48, 60)} />
              <Text style={{ fontSize: F.lg, fontWeight: '800', color: T.t2, marginTop: S.md, textAlign: 'center' }}>
                Hozircha hech qanday restoran yo'q
              </Text>
              <Text style={{ fontSize: F.sm, color: T.t4, marginTop: S.sm, textAlign: 'center' }}>
                Administrator restoran qo'shgandan keyin bu yerda ko'rinadi
              </Text>
            </View>
          ) : (
            restaurants.map(r => (
              <View key={r.id} style={[k.restCard, { backgroundColor: T.card, borderColor: r.isFull ? T.bd : T.bd, opacity: r.isFull ? 0.6 : 1 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: F.md, fontWeight: '900', color: T.t1 }}>{r.name}</Text>
                  <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600', marginTop: 2 }}>{r.address}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.xs }}>
                    <View style={[k.restBadge, { backgroundColor: r.isFull ? C.rdb : (isDark ? '#1a2a1a' : '#e8f5e9') }]}>
                      <Text style={{ fontSize: rs(10, 12), fontWeight: '800', color: r.isFull ? C.rd : C.gn }}>
                        {r.courierCount}/8 {r.isFull ? 'Band' : 'Bo\'sh'}
                      </Text>
                    </View>
                    {r.regionName ? (
                      <Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '600' }}>{r.regionName}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  style={[k.joinBtn, { backgroundColor: r.isFull ? T.bg3 : C.p }]}
                  onPress={() => !r.isFull && handleJoinRestaurant(r.id)}
                  disabled={r.isFull || joiningId === r.id}
                  activeOpacity={0.87}
                >
                  {joiningId === r.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={{ fontSize: F.sm, fontWeight: '800', color: r.isFull ? T.t4 : '#fff' }}>
                        {r.isFull ? 'Band' : "Qo'shilish"}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentOrder = orders[0] || null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[k.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flex: 1 }}>
          <Text style={[k.name, { color: T.t1 }]}>{user?.name || 'Kuryer'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <View style={[k.dot, { backgroundColor: online ? C.gn : T.t4 }]} />
            <Text style={[k.statusTxt, { color: online ? C.gn : T.t4 }]}>
              {toggling ? 'O\'zgarmoqda...' : online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <Switch
          value={online}
          onValueChange={handleToggleOnline}
          trackColor={{ false: T.bg4, true: C.gn }}
          thumbColor="#fff"
          disabled={toggling}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: S.lg }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} colors={[C.p]} />}
      >
        {/* Daromad kartasi */}
        <View style={[k.earnCard, { backgroundColor: C.p }]}>
          <Text style={k.earnLbl}>Haftalik daromad</Text>
          <Text style={k.earnNum}>{fmtPrice(stats?.weekEarnings || 0)}</Text>
          <View style={k.earnStats}>
            {[
              { n: stats?.todayDeliveries?.toString() || '0', l: 'Bugun' },
              { n: (stats?.rating || 0).toFixed(1), l: 'Reyting' },
              { n: stats?.weekDeliveries?.toString() || '0', l: 'Bu hafta' },
            ].map((st, i) => (
              <View key={i} style={k.earnStat}>
                <Text style={k.earnStatN}>{st.n}</Text>
                <Text style={k.earnStatL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daromad jadvali */}
        <View style={[k.tableBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[k.tableTitle, { color: T.t1 }]}>Masofa bo'yicha haq</Text>
          <View style={[k.tableHdr, { borderBottomColor: T.bd }]}>
            <Text style={[k.tableHdrTxt, { color: T.t3, flex: 1 }]}>Masofa</Text>
            <Text style={[k.tableHdrTxt, { color: T.t3, width: 80, textAlign: 'center' }]}>Narx</Text>
            <Text style={[k.tableHdrTxt, { color: C.gn, width: 80, textAlign: 'right' }]}>Sizga</Text>
          </View>
          {EARN_TABLE.map((row, i) => (
            <View key={i} style={[k.tableRow, i < EARN_TABLE.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}>
              <Text style={[k.tableCell, { color: T.t2, flex: 1 }]}>{row.label}</Text>
              <Text style={[k.tableCell, { color: T.t3, width: 80, textAlign: 'center' }]}>{fmtPrice(row.fee)}</Text>
              <Text style={[k.tableCell, { color: C.gn, width: 80, textAlign: 'right', fontWeight: '800' }]}>+{fmtPrice(row.earn)}</Text>
            </View>
          ))}
        </View>

        {/* Restoran */}
        {profile?.restaurantName ? (
          <View style={[k.restInfoCard, { backgroundColor: isDark ? '#1a2a1a' : '#f0faf0', borderColor: C.gn }]}>
            <IcMotorbike color={C.gn} size={rs(18, 22)} />
            <Text style={{ fontSize: F.sm, fontWeight: '700', color: C.gn, flex: 1 }}>
              {profile.restaurantName}
            </Text>
            <TouchableOpacity
              onPress={handleLeaveRestaurant}
              disabled={leaving}
              style={{ padding: 4 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {leaving
                ? <ActivityIndicator size="small" color={C.rd} />
                : <IcX color={C.rd} size={rs(16, 20)} />
              }
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Yangi buyurtma yoki bo'sh holat */}
        {online && currentOrder ? (() => {
          const earning = currentOrder.courierEarning || 0;
          const km = currentOrder.distance || 0;
          const eta = Math.round(km * 5 + 3);
          return (
            <View style={[k.orderCard, { backgroundColor: T.card, borderColor: C.p }]}>
              <View style={[k.orderTop, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                  <View style={[k.ping, { backgroundColor: C.p }]} />
                  <Text style={[k.orderLbl, { color: C.pdk }]}>YANGI BUYURTMA</Text>
                </View>
                <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '700' }}>#{currentOrder.orderNumber}</Text>
              </View>
              <View style={{ padding: S.md }}>
                <Text style={[k.restName, { color: T.t1 }]}>{currentOrder.restaurant.name}</Text>
                <View style={{ marginTop: S.sm, gap: S.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                    <View style={[k.routeDot, { backgroundColor: C.p }]} />
                    <Text style={[k.routeTxt, { color: T.t2 }]}>{currentOrder.restaurant.address}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                    <View style={[k.routeDot, { backgroundColor: C.gn }]} />
                    <Text style={[k.routeTxt, { color: T.t2 }]}>{currentOrder.address}</Text>
                  </View>
                </View>
                <View style={{ borderRadius: R.md, padding: S.sm, marginTop: S.sm, backgroundColor: isDark ? '#1a1a00' : '#fffbe6' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600' }}>Yetkazish narxi</Text>
                    <Text style={{ fontSize: F.xs, color: T.t2, fontWeight: '700' }}>{fmtPrice(currentOrder.deliveryFee)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    <Text style={{ fontSize: F.xs, color: C.gn, fontWeight: '600' }}>Sizning ulushingiz</Text>
                    <Text style={{ fontSize: F.xs, color: C.gn, fontWeight: '800' }}>+{fmtPrice(earning)}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: S.sm }}>
                  <Text style={[k.earn, { color: C.gn }]}>+{fmtPrice(earning)}</Text>
                  <Text style={[k.dist, { color: T.t3 }]}>
                    {km > 0 ? `${km.toFixed(1)} km · ~${eta} daq` : 'Masofa hisoblanmoqda'}
                  </Text>
                </View>
              </View>
              <View style={[k.btns, { borderTopColor: T.bd }]}>
                <TouchableOpacity
                  style={[k.btn, { backgroundColor: C.gn }]}
                  onPress={() => handleAccept(currentOrder.id)}
                  activeOpacity={0.87}
                  disabled={!!accepting}
                >
                  {accepting === currentOrder.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <IcCheck color="#fff" size={rs(16, 20)} />
                  }
                  <Text style={k.btnTxt}>Qabul qilish</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[k.btn, { backgroundColor: T.bg3 }]}
                  onPress={() => handleSkip(currentOrder.id)}
                  activeOpacity={0.87}
                >
                  <Text style={[k.btnTxt, { color: T.t2 }]}>O'tkazish</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })() : (
          <View style={{ alignItems: 'center', paddingVertical: rs(40, 56) }}>
            <View style={[k.emptyIcon, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
              <IcMotorbike color={online ? C.p : T.t4} size={rs(36, 44)} />
            </View>
            <Text style={{ fontSize: F.lg, fontWeight: '800', color: T.t2, marginTop: S.md }}>
              {online ? 'Buyurtma kutilmoqda...' : 'Siz offlinesiz'}
            </Text>
            {!online && (
              <Text style={{ fontSize: F.sm, color: T.t4, marginTop: S.sm, textAlign: 'center' }}>
                Buyurtma olish uchun online bo'ling
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const k = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  name: { fontSize: rs(20, 24), fontWeight: '900' },
  dot: { width: rs(7, 9), height: rs(7, 9), borderRadius: rs(4, 5) },
  statusTxt: { fontSize: F.sm, fontWeight: '700' },
  earnCard: { borderRadius: R.xl, padding: rs(20, 26), marginBottom: S.lg },
  earnLbl: { fontSize: F.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  earnNum: { fontSize: rs(32, 40), fontWeight: '900', color: '#fff', marginVertical: 4 },
  earnStats: { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  earnStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: R.md, padding: S.sm, alignItems: 'center' },
  earnStatN: { fontSize: F.lg, fontWeight: '900', color: '#fff' },
  earnStatL: { fontSize: rs(9, 11), color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 3 },
  orderCard: { borderWidth: 2, borderRadius: R.lg, overflow: 'hidden' },
  orderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.md, paddingVertical: S.sm },
  ping: { width: rs(7, 9), height: rs(7, 9), borderRadius: rs(4, 5) },
  orderLbl: { fontSize: F.xs, fontWeight: '900', letterSpacing: 0.5 },
  restName: { fontSize: F.lg, fontWeight: '900' },
  routeDot: { width: rs(8, 10), height: rs(8, 10), borderRadius: rs(4, 5) },
  routeTxt: { fontSize: F.sm, fontWeight: '600', flex: 1 },
  earn: { fontSize: rs(20, 24), fontWeight: '900' },
  dist: { fontSize: F.xs, fontWeight: '600' },
  btns: { flexDirection: 'row', gap: S.sm, padding: S.md, borderTopWidth: 0.5 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, borderRadius: R.md, paddingVertical: rs(11, 14) },
  btnTxt: { fontSize: F.md, fontWeight: '800', color: '#fff' },
  emptyIcon: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(40, 48), alignItems: 'center', justifyContent: 'center' },
  tableBox: { borderWidth: 1, borderRadius: R.lg, marginBottom: S.md, overflow: 'hidden' },
  tableTitle: { fontSize: F.md, fontWeight: '800', padding: S.md, paddingBottom: S.sm },
  tableHdr: { flexDirection: 'row', paddingHorizontal: S.md, paddingBottom: S.sm, borderBottomWidth: 1 },
  tableHdrTxt: { fontSize: F.xs, fontWeight: '700', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.md, paddingVertical: rs(8, 10) },
  tableCell: { fontSize: F.sm, fontWeight: '700' },
  restCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  restBadge: { borderRadius: R.full, paddingVertical: 3, paddingHorizontal: S.sm },
  joinBtn: { borderRadius: R.md, paddingVertical: rs(8, 10), paddingHorizontal: S.md, alignItems: 'center', minWidth: rs(80, 96) },
  restInfoCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, borderWidth: 1, borderRadius: R.md, padding: S.sm, marginBottom: S.md },
});

// ════════ TARIX ════════
export function CourierHistoryScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveries = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.get<Delivery[]>('/couriers/me/deliveries', token);
      setDeliveries(data);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={C.p} size="large" />
      </SafeAreaView>
    );
  }

  const done = deliveries.filter(d => d.status === 'delivered');
  const groups = groupByDate(done);
  const totalEarnings = done.reduce((s, d) => s + (d.courierEarning || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[ht.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[ht.title, { color: T.t1 }]}>Yetkazish tarixi</Text>
      </View>

      <View style={[ht.summary, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
        <View style={ht.summaryItem}>
          <Text style={[ht.summaryN, { color: C.gn }]}>{fmtPrice(totalEarnings)}</Text>
          <Text style={[ht.summaryL, { color: T.t3 }]}>Umumiy daromad</Text>
        </View>
        <View style={[ht.summaryDiv, { backgroundColor: T.bd }]} />
        <View style={ht.summaryItem}>
          <Text style={[ht.summaryN, { color: C.p }]}>{done.length}</Text>
          <Text style={[ht.summaryL, { color: T.t3 }]}>Yetkazish</Text>
        </View>
      </View>

      {groups.length === 0 ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <IcMotorbike color={T.t4} size={rs(48, 60)} />
          <Text style={{ fontSize: F.lg, fontWeight: '800', color: T.t3, marginTop: S.md }}>
            Hali yetkazma yo'q
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: S.xxl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDeliveries(true)} colors={[C.p]} />}
        >
          {groups.map((group, gi) => (
            <View key={gi}>
              <View style={[ht.groupHdr, { backgroundColor: T.bg3 }]}>
                <Text style={[ht.groupDate, { color: T.t2 }]}>{group.date}</Text>
                <Text style={[ht.groupTotal, { color: C.gn }]}>{fmtPrice(group.total)}</Text>
              </View>
              {group.items.map((item, ii) => (
                <View key={item.id} style={[ht.item, { backgroundColor: T.card, borderColor: T.bd }, ii < group.items.length - 1 && { borderBottomWidth: 0.5 }]}>
                  <View style={[ht.itemLeft, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
                    <IcMotorbike color={C.p} size={rs(20, 24)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[ht.restName, { color: T.t1 }]}>{item.restaurant.name}</Text>
                      <Text style={[ht.earn, { color: C.gn }]}>+{fmtPrice(item.courierEarning || 0)}</Text>
                    </View>
                    <Text style={[ht.addr, { color: T.t3 }]}>{item.address}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, marginTop: 4 }}>
                      {item.distance != null && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <IcPin color={T.t4} size={rs(11, 13)} />
                          <Text style={[ht.meta, { color: T.t4 }]}>{(item.distance as number).toFixed(1)} km</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <IcTime color={T.t4} size={rs(11, 13)} />
                        <Text style={[ht.meta, { color: T.t4 }]}>{fmtTime(item.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[ht.numBadge, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
                    <Text style={[ht.num, { color: T.t3 }]}>#{item.orderNumber}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const ht = StyleSheet.create({
  hdr: { padding: S.lg, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  summary: { flexDirection: 'row', paddingVertical: S.md, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryN: { fontSize: rs(18, 22), fontWeight: '900' },
  summaryL: { fontSize: F.xs, fontWeight: '600', marginTop: 3 },
  summaryDiv: { width: 1, marginVertical: S.xs },
  groupHdr: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingVertical: rs(8, 10) },
  groupDate: { fontSize: F.sm, fontWeight: '800' },
  groupTotal: { fontSize: F.sm, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, padding: S.md, marginHorizontal: S.lg, marginBottom: 1, borderWidth: 1, borderRadius: R.md, marginTop: S.xs },
  itemLeft: { width: rs(42, 50), height: rs(42, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  restName: { fontSize: F.sm, fontWeight: '800' },
  earn: { fontSize: F.sm, fontWeight: '900' },
  addr: { fontSize: F.xs, fontWeight: '500', marginTop: 2 },
  meta: { fontSize: rs(10, 12), fontWeight: '600' },
  numBadge: { paddingVertical: 3, paddingHorizontal: S.sm, borderRadius: R.full, alignSelf: 'flex-start' },
  num: { fontSize: rs(10, 12), fontWeight: '700' },
});

// ════════ STATISTIKA ════════
export function CourierStatsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const [stats, setStats] = useState<CourierStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CourierStats>('/couriers/me/stats', token),
      api.get<Delivery[]>('/couriers/me/deliveries', token),
    ]).then(([s, d]) => {
      setStats(s);
      setDeliveries(d);
    }).catch(e => Alert.alert('Xato', e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={C.p} size="large" />
      </SafeAreaView>
    );
  }

  const weekChart = buildWeekChart(deliveries);
  const maxEarn = Math.max(...weekChart.map(d => d.earn), 1);
  const avgDailyEarn = stats ? Math.round((stats.weekEarnings || 0) / 7) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[cs.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[cs.title, { color: T.t1 }]}>Statistika</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {/* Top kartalar */}
        <View style={cs.grid}>
          {[
            { n: fmtPrice(stats?.weekEarnings || 0), l: 'Haftalik daromad', c: C.gn },
            { n: (stats?.weekDeliveries || 0).toString(), l: 'Bu hafta', c: C.p },
            { n: fmtPrice(avgDailyEarn), l: "Kunlik o'rtacha", c: C.amber },
            { n: `${(stats?.rating || 0).toFixed(1)} ★`, l: 'Reyting', c: C.gold },
          ].map((item, i) => (
            <View key={i} style={[cs.card, { backgroundColor: T.card, borderColor: T.bd }]}>
              <Text style={[cs.cardN, { color: item.c }]}>{item.n}</Text>
              <Text style={[cs.cardL, { color: T.t3 }]}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* Umumiy rekordlar */}
        <View style={[cs.recordBox, { backgroundColor: C.p }]}>
          <Text style={cs.recordTitle}>Umumiy rekordlar</Text>
          <View style={cs.recordGrid}>
            {[
              { n: (stats?.totalDeliveries || 0).toString(), l: 'Jami yetkazish' },
              { n: fmtPrice(stats?.totalEarnings || 0), l: 'Jami daromad' },
              { n: (stats?.todayDeliveries || 0).toString(), l: 'Bugun' },
              { n: (stats?.ratingCount || 0).toString(), l: 'Baholashlar' },
            ].map((r, i) => (
              <View key={i} style={cs.recordItem}>
                <Text style={cs.recordN}>{r.n}</Text>
                <Text style={cs.recordL}>{r.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Haftalik grafik */}
        <View style={[cs.chartBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[cs.chartTitle, { color: T.t1 }]}>Haftalik daromad</Text>
          <View style={cs.chart}>
            {weekChart.map((d, i) => {
              const height = Math.max((d.earn / maxEarn) * rs(100, 130), 4);
              return (
                <View key={i} style={cs.bar}>
                  <Text style={[cs.barVal, { color: T.t3 }]}>
                    {d.earn > 0 ? `${Math.round(d.earn / 1000)}k` : ''}
                  </Text>
                  <View style={[cs.barFill, {
                    height,
                    backgroundColor: d.isToday ? C.p : (isDark ? '#3a2a1a' : C.plt),
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                  }]} />
                  <Text style={[cs.barDay, { color: d.isToday ? C.p : T.t3 }]}>{d.day}</Text>
                  <Text style={[cs.barDel, { color: T.t4 }]}>{d.deliveries > 0 ? d.deliveries : ''}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[cs.chartNote, { color: T.t4 }]}>Ustundagi raqamlar — yetkazish soni</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cs = StyleSheet.create({
  hdr: { padding: S.lg, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.md },
  card: { width: '47%', borderWidth: 1, borderRadius: R.lg, padding: S.md },
  cardN: { fontSize: rs(16, 20), fontWeight: '900' },
  cardL: { fontSize: F.xs, fontWeight: '600', marginTop: 4 },
  recordBox: { borderRadius: R.xl, padding: rs(18, 24), marginBottom: S.md },
  recordTitle: { fontSize: F.lg, fontWeight: '900', color: '#fff', marginBottom: S.md },
  recordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  recordItem: { width: '47%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: R.md, padding: S.md, alignItems: 'center' },
  recordN: { fontSize: rs(18, 22), fontWeight: '900', color: '#fff' },
  recordL: { fontSize: F.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 3, textAlign: 'center' },
  chartBox: { borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  chartTitle: { fontSize: F.md, fontWeight: '800', marginBottom: S.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: rs(140, 170) },
  bar: { flex: 1, alignItems: 'center', gap: 3, justifyContent: 'flex-end' },
  barFill: { width: '100%' },
  barVal: { fontSize: rs(8, 10), fontWeight: '700' },
  barDay: { fontSize: rs(9, 11), fontWeight: '700' },
  barDel: { fontSize: rs(8, 10), fontWeight: '600' },
  chartNote: { fontSize: F.xs, fontWeight: '600', marginTop: S.sm },
});

// ════════ PROFIL ════════
export function CourierProfileScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, logout, token } = useAuthStore();
  const [courierData, setCourierData] = useState<CourierProfile | null>(null);
  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get<CourierProfile>('/couriers/me', token)
      .then(d => { setCourierData(d); setOnline(d.online); })
      .catch(() => {});
  }, []);

  const handleToggleOnline = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await api.patch<{ online: boolean }>('/couriers/me/toggle', {}, token);
      setOnline(res.online);
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

  const GROUPS = [
    [
      { Icon: IcPhone, label: 'Telefon', val: user?.phone ? '+' + user.phone : '', bg: C.blue },
      { Icon: IcPin, label: 'Hudud', val: user?.regionName || 'Toshkent', bg: C.p },
    ],
    [
      { Icon: IcMotorbike, label: 'Transport', val: courierData?.vehicle || 'Mototsikl', bg: C.amber },
      { Icon: IcStar, label: 'Restoran', val: courierData?.restaurantName || 'Tanlanmagan', bg: C.gn },
    ],
  ];

  return (
    <SafeAreaView style={[kp.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[kp.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[kp.title, { color: T.t1 }]}>Profil</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: S.xxl }}>
        {/* Top */}
        <View style={[kp.top, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
          <View style={[kp.avatar, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <IcMotorbike color={C.p} size={rs(36, 44)} />
          </View>
          <Text style={[kp.name, { color: T.t1 }]}>{user?.name || 'Kuryer'}</Text>
          <Text style={[kp.phone, { color: T.t3 }]}>+{user?.phone}</Text>

          <View style={[kp.statusRow, { backgroundColor: online ? C.gnb : (isDark ? '#1a1a1a' : '#f5f5f5'), borderColor: online ? C.gn : T.bd }]}>
            <View style={[kp.statusDot, { backgroundColor: online ? C.gn : '#999' }]} />
            <Text style={[kp.statusTxt, { color: online ? C.gn : T.t3 }]}>
              {online ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={online}
              onValueChange={handleToggleOnline}
              trackColor={{ false: T.bg4, true: C.gn }}
              thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              disabled={toggling}
            />
          </View>
        </View>

        {/* Statistika */}
        <View style={[kp.statsRow, { borderBottomColor: T.bd }]}>
          {[
            { n: (courierData?.totalDeliveries || 0).toString(), l: 'Yetkazish', c: C.p },
            { n: (courierData?.rating || 0).toFixed(1), l: 'Reyting', c: C.gold },
            { n: (courierData?.ratingCount || 0).toString(), l: 'Baho', c: C.gn },
          ].map((st, i) => (
            <View key={i} style={[kp.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: T.bd }]}>
              <Text style={[kp.statN, { color: st.c }]}>{st.n}</Text>
              <Text style={[kp.statL, { color: T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Menu guruhlari */}
        {GROUPS.map((grp, gi) => (
          <View key={gi} style={[kp.grp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
            {grp.map((item, ii) => (
              <TouchableOpacity key={ii}
                style={[kp.row, ii < grp.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}
                onPress={() => Alert.alert(item.label, item.val || "Tez orada qo'shiladi!")}
                activeOpacity={0.7}
              >
                <View style={[kp.rowIcon, { backgroundColor: item.bg }]}>
                  <item.Icon color="#fff" size={rs(17, 21)} />
                </View>
                <Text style={[kp.rowLbl, { color: T.t1 }]}>{item.label}</Text>
                {item.val ? <Text style={[kp.rowVal, { color: T.t3 }]}>{item.val}</Text> : null}
                <IcChevron color={T.t4} size={rs(16, 20)} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Rejim */}
        <View style={[kp.grp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
          <View style={kp.row}>
            <View style={[kp.rowIcon, { backgroundColor: isDark ? '#1a1a2a' : '#e0e0ff' }]}>
              {isDark ? <IcMoon color="#aaf" size={rs(17, 21)} /> : <IcSun color="#f90" size={rs(17, 21)} />}
            </View>
            <Text style={[kp.rowLbl, { color: T.t1, flex: 1 }]}>{isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}</Text>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ false: T.bg4, true: C.p }} thumbColor="#fff" />
          </View>
        </View>

        <TouchableOpacity style={[kp.logoutBtn, { backgroundColor: isDark ? C.rddk : C.rdb, borderColor: C.rd }]} onPress={handleLogout}>
          <IcLogout color={C.rd} size={rs(18, 22)} />
          <Text style={[kp.logoutTxt, { color: C.rd }]}>Tizimdan chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const kp = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { padding: S.lg, paddingBottom: S.md, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  top: { alignItems: 'center', paddingVertical: S.xl, paddingHorizontal: S.lg, borderBottomWidth: 1 },
  avatar: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(40, 48), borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  name: { fontSize: rs(20, 25), fontWeight: '900' },
  phone: { fontSize: F.md, fontWeight: '600', marginTop: 4 },
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
});
