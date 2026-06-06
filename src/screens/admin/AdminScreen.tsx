import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';
import { api } from '../../api/client';
import {
  IcChart, IcOrders, IcStore, IcUsers, IcLogout, IcCheck, IcX,
  IcCoin, IcCrown, IcMotorbike, IcCard, IcPromo,
} from '../../components/Icons';

const STATUS_COLOR: Record<string, string> = {
  delivered: C.gn, on_the_way: C.p, preparing: C.amber,
  pending: C.amber, cancelled: C.rd, active: C.gn, blocked: C.rd,
  accepted: C.p, ready: C.gn,
};
const STATUS_UZ: Record<string, string> = {
  delivered: 'Yetkazildi', on_the_way: "Yo'lda", preparing: 'Tayyorlanmoqda',
  pending: 'Kutilmoqda', cancelled: 'Bekor', active: 'Aktiv', blocked: 'Bloklangan',
  accepted: 'Qabul', ready: 'Tayyor',
};
const ROLE_UZ: Record<string, string> = {
  customer: 'Mijoz', restaurant_owner: 'Restoran',
  courier: 'Kuryer', admin: 'Admin', superadmin: 'Superadmin',
};

export function AdminScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user, logout, token } = useAuthStore();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [promos, setPromos] = useState<any[]>([]);

  // Modal states
  const [commModal, setCommModal] = useState(false);
  const [commInput, setCommInput] = useState('10');
  const [commRestId, setCommRestId] = useState('');
  const [promoModal, setPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoType, setPromoType] = useState<'percent' | 'fixed'>('percent');
  const [promoMin, setPromoMin] = useState('');

  const isSuperadmin = user?.role === 'superadmin';

  const TABS = [
    { id: 'dashboard',   label: 'Dashboard',         Icon: IcChart },
    { id: 'orders',      label: 'Buyurtmalar',       Icon: IcOrders },
    { id: 'restaurants', label: 'Restoranlar',       Icon: IcStore },
    { id: 'couriers',    label: 'Kuryerlar',         Icon: IcMotorbike },
    { id: 'users',       label: 'Foydalanuvchilar',  Icon: IcUsers },
    ...(isSuperadmin ? [
      { id: 'promos',   label: 'Promo kodlar', Icon: IcPromo },
      { id: 'finance',  label: 'Moliya',       Icon: IcCoin },
    ] : []),
  ];

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, o, r, c, u] = await Promise.all([
        api.get<any>('/admin/stats', token),
        api.get<any[]>('/admin/orders?limit=100', token),
        api.get<any[]>('/admin/restaurants', token),
        api.get<any[]>('/admin/couriers', token),
        api.get<any[]>('/admin/users', token),
      ]);
      setStats(s); setOrders(o); setRestaurants(r); setCouriers(c); setUsers(u);

      if (isSuperadmin) {
        const [fin, prm] = await Promise.all([
          api.get<any>('/admin/finance', token),
          api.get<any[]>('/admin/promos', token),
        ]);
        setFinance(fin); setPromos(prm);
      }
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setLoading(false);
    }
  }, [token, isSuperadmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status }, token);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e: any) { Alert.alert('Xato', e.message); }
  };

  const blockUser = async (id: string) => {
    try {
      const r = await api.patch<{ status: string }>(`/admin/users/${id}/block`, {}, token);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: r.status.toLowerCase() } : u));
    } catch (e: any) { Alert.alert('Xato', e.message); }
  };

  const saveCommission = async () => {
    const val = parseFloat(commInput) / 100;
    if (isNaN(val) || val < 0 || val > 1) { Alert.alert('Xato', '0-100 orasida kiriting'); return; }
    try {
      await api.patch(`/admin/restaurants/${commRestId}/commission`, { commission: val }, token);
      setRestaurants(prev => prev.map(r => r.id === commRestId ? { ...r, commission: val } : r));
      setCommModal(false);
    } catch (e: any) { Alert.alert('Xato', e.message); }
  };

  const createPromo = async () => {
    if (!promoCode || !promoDiscount) { Alert.alert('Xato', 'Kod va chegirma kiriting'); return; }
    try {
      const p = await api.post<any>('/admin/promos', {
        code: promoCode.toUpperCase(),
        discount: parseInt(promoDiscount),
        type: promoType,
        minOrder: parseInt(promoMin) || 0,
      }, token);
      setPromos(prev => [p, ...prev]);
      setPromoModal(false);
      setPromoCode(''); setPromoDiscount(''); setPromoMin('');
    } catch (e: any) { Alert.alert('Xato', e.message); }
  };

  const deletePromo = async (id: string) => {
    Alert.alert('O\'chirish', 'Promo kodni o\'chirmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/admin/promos/${id}`, token);
          setPromos(prev => prev.filter(p => p.id !== id));
        } catch (e: any) { Alert.alert('Xato', e.message); }
      }},
    ]);
  };

  const StatCard = ({ label, value, sub, color = C.p }: any) => (
    <View style={[a.statCard, { backgroundColor: T.card, borderColor: T.bd }]}>
      <Text style={[a.statV, { color }]}>{value ?? '—'}</Text>
      <Text style={[a.statL, { color: T.t2 }]}>{label}</Text>
      {sub && <Text style={[a.statS, { color: T.t4 }]}>{sub}</Text>}
    </View>
  );

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      <View style={[a.hero, { backgroundColor: C.p }]}>
        <Text style={a.heroTitle}>Bugun</Text>
        <Text style={a.heroVal}>{fmtPrice(stats?.todayRevenue ?? 0)}</Text>
        <Text style={a.heroSub}>{stats?.todayOrders ?? 0} ta buyurtma · {stats?.activeOrders ?? 0} ta aktiv</Text>
      </View>
      <View style={a.grid}>
        <StatCard label="Jami foydalanuvchi" value={stats?.totalUsers ?? 0} color={C.p} />
        <StatCard label="Restoranlar" value={stats?.totalRestaurants ?? 0} color={C.amber} />
        <StatCard label="Kuryerlar" value={stats?.totalCouriers ?? 0} color={C.gn} />
        <StatCard label="Jami buyurtma" value={stats?.totalOrders ?? 0} color="#7C4DFF" />
        <StatCard label="Kutilmoqda" value={stats?.pendingOrders ?? 0} color={C.rd} />
        <StatCard label="Jami daromad" value={fmtPrice(stats?.totalRevenue ?? 0)} sub="platforma ulushi" color={C.p} />
      </View>
    </ScrollView>
  );

  // ── BUYURTMALAR ────────────────────────────────────────────────────────────
  const renderOrders = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      {orders.length === 0 && !loading && (
        <View style={a.empty}><Text style={[a.emptyTxt, { color: T.t3 }]}>Buyurtmalar yo'q</Text></View>
      )}
      {orders.map(o => (
        <View key={o.id} style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
            <Text style={[a.cardTitle, { color: T.t1 }]}>#{o.orderNumber}</Text>
            <View style={[a.badge, { backgroundColor: (STATUS_COLOR[o.status] || C.amber) + '22' }]}>
              <Text style={[a.badgeTxt, { color: STATUS_COLOR[o.status] || C.amber }]}>{STATUS_UZ[o.status] || o.status}</Text>
            </View>
          </View>
          <Text style={[{ fontSize: F.sm, color: T.t2, fontWeight: '700', marginBottom: 2 }]}>{o.restaurant?.name ?? '—'}</Text>
          <Text style={[{ fontSize: F.xs, color: T.t3, fontWeight: '600', marginBottom: S.sm }]}>{o.customer?.name ?? '—'} · {o.address}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: F.md, fontWeight: '900', color: C.p }}>{fmtPrice(o.total)}</Text>
            <Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '600' }}>Komissiya: {fmtPrice(o.platformShare ?? 0)}</Text>
          </View>
          {o.status === 'pending' && (
            <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.sm }}>
              <TouchableOpacity style={[a.actBtn, { backgroundColor: C.gnb, flex: 1 }]} onPress={() => updateOrderStatus(o.id, 'accepted')}>
                <IcCheck color={C.gn} size={rs(16, 20)} />
                <Text style={{ color: C.gn, fontWeight: '800', fontSize: F.xs }}>Qabul</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[a.actBtn, { backgroundColor: '#fff1f1', flex: 1 }]} onPress={() => updateOrderStatus(o.id, 'cancelled')}>
                <IcX color={C.rd} size={rs(16, 20)} />
                <Text style={{ color: C.rd, fontWeight: '800', fontSize: F.xs }}>Bekor</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  // ── RESTORANLAR ────────────────────────────────────────────────────────────
  const renderRestaurants = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      {restaurants.length === 0 && !loading && (
        <View style={a.empty}><Text style={[a.emptyTxt, { color: T.t3 }]}>Restoranlar yo'q</Text></View>
      )}
      {restaurants.map(r => (
        <View key={r.id} style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[a.cardTitle, { color: T.t1 }]}>{r.name}</Text>
              <Text style={[{ fontSize: F.xs, color: T.t3, fontWeight: '600' }]}>{r.owner?.name ?? '—'} · {r.regionName ?? '—'}</Text>
            </View>
            <View style={[a.badge, { backgroundColor: r.isOpen ? C.gnb : '#f5f5f5' }]}>
              <Text style={[a.badgeTxt, { color: r.isOpen ? C.gn : T.t3 }]}>{r.isOpen ? 'Ochiq' : 'Yopiq'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: S.lg, marginBottom: S.sm }}>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Buyurtmalar</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: T.t1 }}>{r.orderCount ?? r._count?.orders ?? 0}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Daromad</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.gn }}>{fmtPrice(r.totalRevenue ?? 0)}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Reyting</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.gold }}>⭐ {(r.rating ?? 5).toFixed(1)}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Komissiya</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.amber }}>{Math.round((r.commission ?? 0.1) * 100)}%</Text></View>
          </View>
          {isSuperadmin && (
            <TouchableOpacity style={[a.actBtn, { backgroundColor: isDark ? '#1a1500' : C.ambBg }]}
              onPress={() => { setCommRestId(r.id); setCommInput(Math.round((r.commission ?? 0.1) * 100).toString()); setCommModal(true); }}>
              <IcCard color={C.amber} size={rs(14, 17)} />
              <Text style={{ color: C.amber, fontWeight: '800', fontSize: F.xs }}>Komissiya o'zgartirish</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  // ── KURYERLAR ─────────────────────────────────────────────────────────────
  const renderCouriers = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      {couriers.length === 0 && !loading && (
        <View style={a.empty}><Text style={[a.emptyTxt, { color: T.t3 }]}>Kuryerlar yo'q</Text></View>
      )}
      {couriers.map(c => (
        <View key={c.id} style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[a.cardTitle, { color: T.t1 }]}>{c.user?.name ?? '—'}</Text>
              <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600' }}>+{c.user?.phone ?? '—'}</Text>
            </View>
            <View style={[a.badge, { backgroundColor: c.online ? C.gnb : (isDark ? '#1a1a1a' : '#f5f5f5') }]}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.online ? C.gn : '#999', marginRight: 4 }} />
              <Text style={[a.badgeTxt, { color: c.online ? C.gn : T.t3 }]}>{c.online ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: S.lg }}>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Yetkazmalar</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.p }}>{c.totalDeliveries ?? 0}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Reyting</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.gold }}>⭐ {(c.rating ?? 5).toFixed(1)}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Daromad</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.gn }}>{fmtPrice(c.totalEarnings ?? 0)}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Hudud</Text><Text style={{ fontSize: F.sm, fontWeight: '800', color: T.t2 }}>{c.user?.regionName ?? '—'}</Text></View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ── FOYDALANUVCHILAR ───────────────────────────────────────────────────────
  const renderUsers = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      {users.length === 0 && !loading && (
        <View style={a.empty}><Text style={[a.emptyTxt, { color: T.t3 }]}>Foydalanuvchilar yo'q</Text></View>
      )}
      {users.map(u => (
        <View key={u.id} style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm }}>
            <View style={[a.roleIcon, { backgroundColor: u.role === 'courier' ? C.gnb : u.role === 'restaurant_owner' ? C.ambBg : isDark ? '#1a1a1a' : '#f0f0f0' }]}>
              <Text style={{ fontSize: rs(16, 20) }}>{u.role === 'courier' ? '🛵' : u.role === 'restaurant_owner' ? '🏪' : '👤'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[a.cardTitle, { color: T.t1, fontSize: F.md }]}>{u.name ?? 'Noma\'lum'}</Text>
              <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600' }}>+{u.phone}</Text>
            </View>
            <View style={[a.badge, { backgroundColor: (u.status === 'blocked' ? C.rd : C.gn) + '22' }]}>
              <Text style={[a.badgeTxt, { color: u.status === 'blocked' ? C.rd : C.gn }]}>{STATUS_UZ[u.status] || u.status}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: S.lg }}>
              <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '700' }}>Rol: <Text style={{ color: T.t1 }}>{ROLE_UZ[u.role] ?? u.role}</Text></Text>
              <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '700' }}>Coin: <Text style={{ color: C.amber }}>{u.coins ?? 0}</Text></Text>
            </View>
            <TouchableOpacity style={[a.actBtn, { backgroundColor: u.status === 'blocked' ? C.gnb : '#fff1f1', paddingHorizontal: S.md }]}
              onPress={() => Alert.alert(u.status === 'blocked' ? 'Blokdan chiqarish' : 'Bloklash', `${u.name} ni ${u.status === 'blocked' ? 'blokdan chiqarasizmi' : 'bloklamoqchimisiz'}?`, [
                { text: 'Bekor', style: 'cancel' },
                { text: 'Ha', style: 'destructive', onPress: () => blockUser(u.id) },
              ])}>
              <Text style={{ color: u.status === 'blocked' ? C.gn : C.rd, fontWeight: '800', fontSize: F.xs }}>
                {u.status === 'blocked' ? 'Blokdan chiqar' : 'Bloklash'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ── PROMO KODLAR ───────────────────────────────────────────────────────────
  const renderPromos = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      <TouchableOpacity style={[a.addBtn, { backgroundColor: C.p }]} onPress={() => setPromoModal(true)}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: F.md }}>+ Yangi promo kod</Text>
      </TouchableOpacity>
      {promos.length === 0 && !loading && (
        <View style={a.empty}><Text style={[a.emptyTxt, { color: T.t3 }]}>Promo kodlar yo'q</Text></View>
      )}
      {promos.map(p => (
        <View key={p.id} style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
            <View style={[a.badge, { backgroundColor: isDark ? '#1a1500' : C.ambBg }]}>
              <Text style={[a.badgeTxt, { color: C.amber, fontSize: F.md, fontWeight: '900' }]}>{p.code}</Text>
            </View>
            <View style={[a.badge, { backgroundColor: p.active ? C.gnb : '#f5f5f5' }]}>
              <Text style={[a.badgeTxt, { color: p.active ? C.gn : T.t3 }]}>{p.active ? 'Aktiv' : 'Nofaol'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: S.lg, marginBottom: S.sm }}>
            <Text style={{ fontSize: F.sm, color: T.t2, fontWeight: '700' }}>
              Chegirma: <Text style={{ color: C.p }}>{p.type === 'percent' ? `${p.discount}%` : fmtPrice(p.discount)}</Text>
            </Text>
            <Text style={{ fontSize: F.sm, color: T.t2, fontWeight: '700' }}>
              Ishlatildi: <Text style={{ color: T.t1 }}>{p.usedCount}/{p.usageLimit}</Text>
            </Text>
          </View>
          {p.minOrder > 0 && <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600', marginBottom: S.sm }}>
            Minimal buyurtma: {fmtPrice(p.minOrder)}
          </Text>}
          <TouchableOpacity onPress={() => deletePromo(p.id)} style={[a.actBtn, { backgroundColor: '#fff1f1', alignSelf: 'flex-end' }]}>
            <IcX color={C.rd} size={rs(14, 17)} />
            <Text style={{ color: C.rd, fontWeight: '800', fontSize: F.xs }}>O'chirish</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  // ── MOLIYA ────────────────────────────────────────────────────────────────
  const renderFinance = () => (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>
      <View style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
        <Text style={[a.cardTitle, { color: T.t1, marginBottom: S.md }]}>Jami daromad taqsimoti</Text>
        <View style={{ gap: S.sm }}>
          {[
            { label: 'Platforma ulushi', val: finance?.platform ?? 0, color: C.p },
            { label: 'Kuryer daromadi', val: finance?.courier ?? 0, color: C.gn },
            { label: 'Restoran daromadi', val: finance?.restaurant ?? 0, color: C.amber },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: S.xs, borderBottomWidth: i < 2 ? 0.5 : 0, borderBottomColor: T.bd }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                <Text style={{ fontSize: F.sm, fontWeight: '700', color: T.t2 }}>{item.label}</Text>
              </View>
              <Text style={{ fontSize: F.md, fontWeight: '900', color: item.color }}>{fmtPrice(item.val)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[a.sectionTitle, { color: T.t3 }]}>RESTORANLAR BO'YICHA</Text>
      {(finance?.byRestaurant ?? []).map((r: any) => (
        <View key={r.restaurantId} style={[a.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[a.cardTitle, { color: T.t1, marginBottom: S.sm }]}>{r.restaurantName}</Text>
          <View style={{ flexDirection: 'row', gap: S.lg }}>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Buyurtmalar</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: T.t1 }}>{r.orderCount}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Restoran ulushi</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.amber }}>{fmtPrice(r.restaurantShare)}</Text></View>
            <View><Text style={{ fontSize: F.xs, color: T.t4, fontWeight: '700' }}>Platforma</Text><Text style={{ fontSize: F.md, fontWeight: '900', color: C.p }}>{fmtPrice(r.platformShare)}</Text></View>
          </View>
        </View>
      ))}
      {(finance?.byRestaurant ?? []).length === 0 && (
        <View style={a.empty}><Text style={[a.emptyTxt, { color: T.t3 }]}>Moliyaviy ma'lumotlar yo'q</Text></View>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    if (loading && !refreshing) return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.p} />
      </View>
    );
    switch (tab) {
      case 'dashboard':   return renderDashboard();
      case 'orders':      return renderOrders();
      case 'restaurants': return renderRestaurants();
      case 'couriers':    return renderCouriers();
      case 'users':       return renderUsers();
      case 'promos':      return renderPromos();
      case 'finance':     return renderFinance();
      default:            return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      {/* Header */}
      <View style={[a.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          {isSuperadmin
            ? <IcCrown color={C.gold} size={rs(24, 30)} />
            : <IcChart color={C.p} size={rs(22, 27)} />}
          <View>
            <Text style={[a.hdrTitle, { color: T.t1 }]}>{isSuperadmin ? 'Superadmin' : 'Admin'} Panel</Text>
            <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600' }}>DarrovGo boshqaruv</Text>
          </View>
        </View>
        <TouchableOpacity style={[a.logoutBtn, { backgroundColor: '#fff1f1' }]}
          onPress={() => Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
            { text: 'Bekor', style: 'cancel' },
            { text: 'Chiqish', style: 'destructive', onPress: logout },
          ])}>
          <IcLogout color={C.rd} size={rs(18, 22)} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[a.tabBar, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]} contentContainerStyle={{ paddingHorizontal: S.sm }}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[a.tabItem, tab === t.id && { borderBottomWidth: 2.5, borderBottomColor: C.p }]} onPress={() => setTab(t.id)}>
            <t.Icon color={tab === t.id ? C.p : T.t3} size={rs(16, 20)} />
            <Text style={[a.tabLabel, { color: tab === t.id ? C.p : T.t3 }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Komissiya modali */}
      <Modal visible={commModal} transparent animationType="slide" onRequestClose={() => setCommModal(false)}>
        <View style={a.modalOverlay}>
          <View style={[a.modalBox, { backgroundColor: T.card }]}>
            <Text style={[a.modalTitle, { color: T.t1 }]}>Komissiya foizi</Text>
            <TextInput
              style={[a.modalInp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={commInput} onChangeText={setCommInput}
              keyboardType="numeric" placeholder="10" placeholderTextColor={T.t4}
            />
            <Text style={{ fontSize: F.xs, color: T.t3, textAlign: 'center', marginBottom: S.md }}>0-100 orasida foiz kiriting</Text>
            <View style={{ flexDirection: 'row', gap: S.sm }}>
              <TouchableOpacity style={[a.modalBtn, { backgroundColor: T.bg3, flex: 1 }]} onPress={() => setCommModal(false)}>
                <Text style={{ color: T.t2, fontWeight: '700', textAlign: 'center' }}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[a.modalBtn, { backgroundColor: C.p, flex: 1 }]} onPress={saveCommission}>
                <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Saqlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Promo kod yaratish modali */}
      <Modal visible={promoModal} transparent animationType="slide" onRequestClose={() => setPromoModal(false)}>
        <View style={a.modalOverlay}>
          <View style={[a.modalBox, { backgroundColor: T.card }]}>
            <Text style={[a.modalTitle, { color: T.t1 }]}>Yangi promo kod</Text>
            <TextInput style={[a.modalInp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={promoCode} onChangeText={v => setPromoCode(v.toUpperCase())}
              placeholder="DARROV20" placeholderTextColor={T.t4} autoCapitalize="characters" />
            <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: S.sm }}>
              {(['percent', 'fixed'] as const).map(type => (
                <TouchableOpacity key={type} style={{ flex: 1, borderRadius: R.md, paddingVertical: S.sm, alignItems: 'center', backgroundColor: promoType === type ? C.p : T.bg3 }}
                  onPress={() => setPromoType(type)}>
                  <Text style={{ color: promoType === type ? '#fff' : T.t2, fontWeight: '800', fontSize: F.sm }}>
                    {type === 'percent' ? 'Foiz (%)' : "So'm"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[a.modalInp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={promoDiscount} onChangeText={setPromoDiscount}
              placeholder={promoType === 'percent' ? 'Masalan: 20' : 'Masalan: 5000'} placeholderTextColor={T.t4} keyboardType="numeric" />
            <TextInput style={[a.modalInp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={promoMin} onChangeText={setPromoMin}
              placeholder="Minimal buyurtma (so'm)" placeholderTextColor={T.t4} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: S.sm }}>
              <TouchableOpacity style={[a.modalBtn, { backgroundColor: T.bg3, flex: 1 }]} onPress={() => setPromoModal(false)}>
                <Text style={{ color: T.t2, fontWeight: '700', textAlign: 'center' }}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[a.modalBtn, { backgroundColor: C.p, flex: 1 }]} onPress={createPromo}>
                <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Yaratish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  hdrTitle: { fontSize: rs(17, 21), fontWeight: '900' },
  logoutBtn: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  tabBar: { borderBottomWidth: 1, maxHeight: rs(52, 64), flexGrow: 0 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: S.md, paddingVertical: S.sm, minWidth: rs(70, 85) },
  tabLabel: { fontSize: rs(11, 13), fontWeight: '800' },
  hero: { borderRadius: R.xl, padding: S.xl, marginBottom: S.md },
  heroTitle: { fontSize: F.sm, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginBottom: S.xs },
  heroVal: { fontSize: rs(32, 40), fontWeight: '900', color: '#fff', marginBottom: S.xs },
  heroSub: { fontSize: F.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  statCard: { width: '48%', borderRadius: R.lg, padding: S.md, borderWidth: 1, minHeight: rs(80, 96) },
  statV: { fontSize: rs(22, 27), fontWeight: '900', marginBottom: 2 },
  statL: { fontSize: F.xs, fontWeight: '700' },
  statS: { fontSize: rs(10, 12), fontWeight: '600', marginTop: 2 },
  card: { borderRadius: R.lg, borderWidth: 1, padding: S.md, marginBottom: S.sm },
  cardTitle: { fontSize: F.md, fontWeight: '900', marginBottom: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: R.full, paddingHorizontal: S.sm, paddingVertical: 3 },
  badgeTxt: { fontSize: F.xs, fontWeight: '800' },
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: R.md, paddingVertical: S.xs, paddingHorizontal: S.sm },
  roleIcon: { width: rs(38, 46), height: rs(38, 46), borderRadius: rs(12, 14), alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: F.xs, fontWeight: '800', letterSpacing: 0.8, marginTop: S.lg, marginBottom: S.xs },
  addBtn: { borderRadius: R.lg, paddingVertical: rs(14, 17), alignItems: 'center', marginBottom: S.md },
  empty: { alignItems: 'center', paddingVertical: rs(40, 50) },
  emptyTxt: { fontSize: F.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.xl, paddingBottom: S.xxl },
  modalTitle: { fontSize: F.xl, fontWeight: '900', marginBottom: S.md, textAlign: 'center' },
  modalInp: { borderWidth: 1.5, borderRadius: R.md, paddingHorizontal: S.md, height: rs(50, 60), fontSize: F.md, fontWeight: '700', marginBottom: S.sm },
  modalBtn: { borderRadius: R.lg, paddingVertical: rs(14, 17) },
});
