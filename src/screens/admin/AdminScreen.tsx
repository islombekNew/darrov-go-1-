import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice, fmtDate } from '../../theme';
import { useThemeStore, useAuthStore, useRestOrderStore } from '../../store';
import { COMMISSION_RATE, REGIONS } from '../../constants';
import {
  IcChart, IcOrders, IcStore, IcUsers, IcLogout, IcCheck, IcX,
  IcCoin, IcCrown,
} from '../../components/Icons';

// ─── DEMO DATA (backenddan kelguncha) ───────────────────────────────
const DEMO_ORDERS = [
  { id:'o1', num:4835, rest:'Navruz Osh', client:'Anvar S.', addr:'Yunusobod', total:77000, commission:7700, status:'delivered', createdAt:new Date() },
  { id:'o2', num:4834, rest:'Burger House', client:'Dilnoza M.', addr:'Chilonzor', total:54000, commission:5400, status:'on_the_way', createdAt:new Date(Date.now()-300000) },
  { id:'o3', num:4833, rest:'Green Bowl', client:'Bobur T.', addr:"Mirzo Ulug'bek", total:43000, commission:4300, status:'preparing', createdAt:new Date(Date.now()-600000) },
  { id:'o4', num:4832, rest:'Tokyo Roll', client:'Zulfiya K.', addr:'Shayhontohur', total:92000, commission:9200, status:'delivered', createdAt:new Date(Date.now()-3600000) },
  { id:'o5', num:4831, rest:'Pizza Planet', client:'Sherzod N.', addr:'Yunusobod', total:68000, commission:6800, status:'cancelled', createdAt:new Date(Date.now()-7200000) },
];

const DEMO_RESTAURANTS = [
  { id:'r1', name:'Navruz Osh', owner:'Mansur B.', region:'Yunusobod', orders:87, revenue:2175000, rating:4.8, status:'active' },
  { id:'r2', name:'Burger House', owner:'Kamol R.', region:'Chilonzor', orders:124, revenue:4340000, rating:4.9, status:'active' },
  { id:'r3', name:'Green Bowl', owner:'Nilufar A.', region:"Mirzo Ulug'bek", orders:56, revenue:1120000, rating:4.7, status:'active' },
  { id:'r4', name:'Tokyo Roll', owner:'Jasur M.', region:'Yunusobod', orders:43, revenue:1935000, rating:4.6, status:'active' },
  { id:'r5', name:'Pizza Planet', owner:'Husan T.', region:'Shayhontohur', orders:98, revenue:3332000, rating:4.5, status:'pending' },
];

const DEMO_USERS = [
  { id:'u1', name:'Anvar Sobirov', phone:'998901234567', role:'customer', orders:14, coins:340, status:'active' },
  { id:'u2', name:'Dilnoza Mirzayeva', phone:'998907654321', role:'customer', orders:8, coins:190, status:'active' },
  { id:'u3', name:'Bobur Toshmatov', phone:'998935551234', role:'courier', orders:487, coins:0, status:'active' },
  { id:'u4', name:'Zulfiya Karimova', phone:'998991112233', role:'customer', orders:22, coins:580, status:'active' },
  { id:'u5', name:'Sherzod Nazarov', phone:'998971234567', role:'restaurant_owner', orders:0, coins:0, status:'active' },
];

const STATUS_COLOR: Record<string, string> = {
  delivered: C.gn, on_the_way: C.p, preparing: C.amber,
  pending: C.amber, cancelled: C.rd, active: C.gn, blocked: C.rd,
};
const STATUS_UZ: Record<string, string> = {
  delivered: 'Yetkazildi', on_the_way: "Yo'lda", preparing: 'Tayyorlanmoqda',
  pending: 'Kutilmoqda', cancelled: 'Bekor', active: 'Aktiv', blocked: 'Bloklangan',
};
const ROLE_UZ: Record<string, string> = {
  customer: 'Mijoz', restaurant_owner: 'Restoran', courier: 'Kuryer',
  admin: 'Admin', superadmin: 'Superadmin',
};

export function AdminScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { orders: restOrders } = useRestOrderStore();
  const [tab, setTab] = useState('dashboard');
  const [commModal, setCommModal] = useState(false);
  const [commInput, setCommInput] = useState('10');
  const isSuperadmin = user?.role === 'superadmin';

  const totalRevenue = DEMO_ORDERS.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  const totalCommission = DEMO_ORDERS.filter(o => o.status === 'delivered').reduce((s, o) => s + o.commission, 0);
  const totalOrders = DEMO_ORDERS.length;
  const deliveredOrders = DEMO_ORDERS.filter(o => o.status === 'delivered').length;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', Icon: IcChart },
    { id: 'orders', label: 'Buyurtmalar', Icon: IcOrders },
    { id: 'restaurants', label: 'Restoranlar', Icon: IcStore },
    { id: 'users', label: 'Foydalanuvchilar', Icon: IcUsers },
    ...(isSuperadmin ? [{ id: 'finance', label: 'Moliya', Icon: IcCoin }] : []),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      {/* Header */}
      <View style={[a.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          {isSuperadmin
            ? <IcCrown color={C.gold} size={rs(24, 30)} />
            : <IcCoin color={C.p} size={rs(24, 30)} />}
          <View>
            <Text style={[a.title, { color: T.t1 }]}>{isSuperadmin ? 'Superadmin' : 'Admin'} Panel</Text>
            <Text style={[a.sub, { color: T.t3 }]}>DarrovGo boshqaruv</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[a.logoutBtn, { backgroundColor: isDark ? C.rddk : C.rdb }]}
          onPress={() => Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
            { text: 'Bekor', style: 'cancel' },
            { text: 'Chiqish', style: 'destructive', onPress: logout },
          ])}
        >
          <IcLogout color={C.rd} size={rs(18, 22)} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[a.tabBar, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.sm }}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[a.tabBtn, tab === t.id && { borderBottomColor: C.p }]}
              onPress={() => setTab(t.id)}
              activeOpacity={0.8}
            >
              <t.Icon color={tab === t.id ? C.p : T.t3} size={rs(14, 17)} />
              <Text style={[a.tabTxt, { color: tab === t.id ? C.p : T.t3 }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }} showsVerticalScrollIndicator={false}>
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            {/* Admin card */}
            <View style={[a.heroCard, { backgroundColor: C.pdk }]}>
              <View style={[a.heroIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                {isSuperadmin ? <IcCrown color={C.gold} size={rs(28, 34)} /> : <IcCoin color="#fff" size={rs(28, 34)} />}
              </View>
              <View>
                <Text style={a.heroRole}>{isSuperadmin ? 'Superadmin' : 'Admin'} · DarrovGo</Text>
                <Text style={a.heroName}>{user?.name}</Text>
                <Text style={a.heroPhone}>+{user?.phone}</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={a.grid}>
              {[
                { n: totalOrders.toString(), l: 'Jami buyurtma', c: C.p, Icon: IcOrders },
                { n: fmtPrice(totalRevenue), l: 'Umumiy aylanma', c: C.gold, Icon: IcCoin },
                { n: fmtPrice(totalCommission), l: `${Math.round(COMMISSION_RATE * 100)}% Komissiya`, c: C.gn, Icon: IcChart },
                { n: DEMO_RESTAURANTS.filter(r => r.status === 'active').length.toString(), l: 'Aktiv restoran', c: C.p, Icon: IcStore },
              ].map((st, i) => (
                <View key={i} style={[a.statCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                  <st.Icon color={st.c} size={rs(18, 22)} />
                  <Text style={[a.statN, { color: st.c }]}>{st.n}</Text>
                  <Text style={[a.statL, { color: T.t3 }]}>{st.l}</Text>
                </View>
              ))}
            </View>

            {/* Komissia info */}
            <View style={[a.commBox, { backgroundColor: T.card, borderColor: T.bd }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md }}>
                <Text style={[a.boxTitle, { color: T.t1 }]}>Komissia taqsimoti</Text>
                {isSuperadmin && (
                  <TouchableOpacity style={[a.editBtn, { backgroundColor: isDark ? '#1a1400' : C.ambBg }]} onPress={() => setCommModal(true)}>
                    <Text style={[{ fontSize: F.xs, color: C.amber, fontWeight: '700' }]}>Tahrirlash</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[a.commDesc, { color: T.t3 }]}>
                Har buyurtmadan {Math.round(COMMISSION_RATE * 100)}% komissiya avtomatik olinadi
              </Text>
              <View style={a.commRow}>
                <View style={[a.commItem, { backgroundColor: isDark ? '#0d2d0d' : C.gnb, borderColor: C.gn }]}>
                  <Text style={[a.commPct, { color: C.gn }]}>{100 - Math.round(COMMISSION_RATE * 100)}%</Text>
                  <Text style={[a.commLbl, { color: C.gn }]}>Restoranga</Text>
                </View>
                <View style={[a.commItem, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                  <Text style={[a.commPct, { color: C.p }]}>{Math.round(COMMISSION_RATE * 100)}%</Text>
                  <Text style={[a.commLbl, { color: C.p }]}>Platformaga</Text>
                </View>
              </View>
            </View>

            {isSuperadmin && (
              <View style={[a.superBox, { backgroundColor: isDark ? '#1a0a3d' : C.pub, borderColor: C.pu }]}>
                <IcCrown color={C.pu} size={rs(16, 20)} />
                <Text style={[a.superTxt, { color: C.pu }]}>
                  Superadmin: adminlarni boshqarish, komissiya o'zgartirish, barcha hududlarni ko'rish
                </Text>
              </View>
            )}

            {/* So'nggi buyurtmalar */}
            <Text style={[a.secTitle, { color: T.t1 }]}>So'nggi buyurtmalar</Text>
            {DEMO_ORDERS.slice(0, 3).map(o => (
              <View key={o.id} style={[a.miniCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: S.sm }}>
                    <Text style={[a.miniNum, { color: T.t3 }]}>#{o.num}</Text>
                    <Text style={[a.miniName, { color: T.t1 }]}>{o.rest}</Text>
                  </View>
                  <Text style={[{ fontSize: F.xs, color: T.t3, marginTop: 2 }]}>{o.client} · {o.addr}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[{ fontSize: F.sm, fontWeight: '800', color: C.p }]}>{fmtPrice(o.total)}</Text>
                  <View style={[a.statusBadge, { backgroundColor: (STATUS_COLOR[o.status] || T.bg3) + '22' }]}>
                    <Text style={[{ fontSize: rs(9, 11), fontWeight: '700', color: STATUS_COLOR[o.status] || T.t3 }]}>{STATUS_UZ[o.status]}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── BUYURTMALAR ── */}
        {tab === 'orders' && (
          <>
            <View style={[a.filterRow, { backgroundColor: T.bg2, borderColor: T.bd }]}>
              <Text style={[{ fontSize: F.sm, fontWeight: '700', color: T.t2 }]}>Jami: {DEMO_ORDERS.length} ta · Yetkazildi: {deliveredOrders} ta</Text>
            </View>
            {DEMO_ORDERS.map(o => (
              <View key={o.id} style={[a.orderCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: 4 }}>
                      <Text style={[a.orderNum, { color: T.t3 }]}>#{o.num}</Text>
                      <View style={[a.statusBadge, { backgroundColor: (STATUS_COLOR[o.status] || T.bg3) + '22' }]}>
                        <Text style={[{ fontSize: rs(9, 11), fontWeight: '700', color: STATUS_COLOR[o.status] || T.t3 }]}>{STATUS_UZ[o.status]}</Text>
                      </View>
                    </View>
                    <Text style={[{ fontSize: F.md, fontWeight: '800', color: T.t1 }]}>{o.rest}</Text>
                    <Text style={[{ fontSize: F.sm, color: T.t3, marginTop: 2 }]}>{o.client} · {o.addr}</Text>
                    <Text style={[{ fontSize: F.xs, color: T.t4, marginTop: 2 }]}>{fmtDate(o.createdAt)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[{ fontSize: F.md, fontWeight: '900', color: C.p }]}>{fmtPrice(o.total)}</Text>
                    <Text style={[{ fontSize: F.xs, color: C.gn, fontWeight: '700', marginTop: 3 }]}>+{fmtPrice(o.commission)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── RESTORANLAR ── */}
        {tab === 'restaurants' && (
          <>
            <View style={[a.filterRow, { backgroundColor: T.bg2, borderColor: T.bd }]}>
              <Text style={[{ fontSize: F.sm, fontWeight: '700', color: T.t2 }]}>
                Jami: {DEMO_RESTAURANTS.length} ta · Aktiv: {DEMO_RESTAURANTS.filter(r => r.status === 'active').length} ta
              </Text>
            </View>
            {DEMO_RESTAURANTS.map(r => (
              <View key={r.id} style={[a.restCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                <View style={[a.restAv, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
                  <IcStore color={C.p} size={rs(20, 24)} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[{ fontSize: F.md, fontWeight: '800', color: T.t1 }]}>{r.name}</Text>
                    <View style={[a.statusBadge, { backgroundColor: (STATUS_COLOR[r.status] || T.bg3) + '22' }]}>
                      <Text style={[{ fontSize: rs(9, 11), fontWeight: '700', color: STATUS_COLOR[r.status] }]}>{STATUS_UZ[r.status]}</Text>
                    </View>
                  </View>
                  <Text style={[{ fontSize: F.xs, color: T.t3, marginTop: 2 }]}>{r.owner} · {r.region}</Text>
                  <View style={{ flexDirection: 'row', gap: S.md, marginTop: S.xs }}>
                    <Text style={[{ fontSize: F.xs, color: C.amber, fontWeight: '700' }]}>★ {r.rating}</Text>
                    <Text style={[{ fontSize: F.xs, color: T.t3, fontWeight: '600' }]}>{r.orders} buyurtma</Text>
                    <Text style={[{ fontSize: F.xs, color: C.gn, fontWeight: '700' }]}>{fmtPrice(r.revenue)}</Text>
                  </View>
                </View>
                {r.status === 'pending' && isSuperadmin && (
                  <View style={{ gap: 4 }}>
                    <TouchableOpacity style={[a.actBtn, { backgroundColor: C.gn }]}
                      onPress={() => Alert.alert('Tasdiqlandi', `${r.name} aktivlashtirildi`)}>
                      <IcCheck color="#fff" size={rs(14, 17)} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[a.actBtn, { backgroundColor: C.rd }]}
                      onPress={() => Alert.alert('Rad etildi', `${r.name} rad etildi`)}>
                      <IcX color="#fff" size={rs(14, 17)} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* ── FOYDALANUVCHILAR ── */}
        {tab === 'users' && (
          <>
            <View style={[a.filterRow, { backgroundColor: T.bg2, borderColor: T.bd }]}>
              <Text style={[{ fontSize: F.sm, fontWeight: '700', color: T.t2 }]}>
                Jami: {DEMO_USERS.length} ta foydalanuvchi
              </Text>
            </View>
            {DEMO_USERS.map(u => (
              <View key={u.id} style={[a.userCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                <View style={[a.userAv, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
                  <IcUsers color={T.t3} size={rs(18, 22)} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[{ fontSize: F.sm, fontWeight: '800', color: T.t1 }]}>{u.name}</Text>
                    <View style={[a.statusBadge, { backgroundColor: (STATUS_COLOR[u.status] || T.bg3) + '22' }]}>
                      <Text style={[{ fontSize: rs(9, 11), fontWeight: '700', color: STATUS_COLOR[u.status] }]}>{STATUS_UZ[u.status]}</Text>
                    </View>
                  </View>
                  <Text style={[{ fontSize: F.xs, color: T.t3, marginTop: 2 }]}>+{u.phone}</Text>
                  <View style={{ flexDirection: 'row', gap: S.md, marginTop: S.xs }}>
                    <View style={[a.roleBadge, { backgroundColor: isDark ? '#1a1a2a' : '#f0f0ff' }]}>
                      <Text style={[{ fontSize: rs(9, 11), color: C.pu, fontWeight: '700' }]}>{ROLE_UZ[u.role]}</Text>
                    </View>
                    {u.orders > 0 && <Text style={[{ fontSize: F.xs, color: T.t3, fontWeight: '600' }]}>{u.orders} buyurtma</Text>}
                    {u.coins > 0 && <Text style={[{ fontSize: F.xs, color: C.amber, fontWeight: '700' }]}>{u.coins} coin</Text>}
                  </View>
                </View>
                {isSuperadmin && (
                  <TouchableOpacity
                    style={[a.blockBtn, { backgroundColor: isDark ? '#2a0000' : '#fff0f0' }]}
                    onPress={() => Alert.alert('Bloklash', `${u.name} bloklansinmi?`, [
                      { text: 'Yo\'q', style: 'cancel' },
                      { text: 'Blokla', style: 'destructive', onPress: () => {} },
                    ])}
                  >
                    <IcX color={C.rd} size={rs(14, 17)} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {/* ── MOLIYA (superadmin only) ── */}
        {tab === 'finance' && isSuperadmin && (
          <>
            <View style={[a.finCard, { backgroundColor: C.p }]}>
              <Text style={a.finLbl}>Umumiy aylanma (oylik)</Text>
              <Text style={a.finNum}>{fmtPrice(totalRevenue)}</Text>
              <View style={a.finRow}>
                <View style={a.finItem}>
                  <Text style={a.finItemN}>{fmtPrice(totalRevenue * 0.9)}</Text>
                  <Text style={a.finItemL}>Restoranlarga</Text>
                </View>
                <View style={a.finItem}>
                  <Text style={a.finItemN}>{fmtPrice(totalCommission)}</Text>
                  <Text style={a.finItemL}>Platform daromadi</Text>
                </View>
              </View>
            </View>

            {/* Restoran daromaadlari */}
            <Text style={[a.secTitle, { color: T.t1 }]}>Restoran daromadlari</Text>
            {DEMO_RESTAURANTS.map(r => (
              <View key={r.id} style={[a.finRestCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                <Text style={[{ fontSize: F.sm, fontWeight: '800', flex: 1, color: T.t1 }]}>{r.name}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[{ fontSize: F.sm, fontWeight: '900', color: C.gn }]}>{fmtPrice(r.revenue * 0.9)}</Text>
                  <Text style={[{ fontSize: F.xs, color: T.t4 }]}>Komissiya: {fmtPrice(r.revenue * 0.1)}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Komissia tahrirlash modali */}
      <Modal visible={commModal} transparent animationType="slide" onRequestClose={() => setCommModal(false)}>
        <View style={a.modalOverlay}>
          <View style={[a.modalBox, { backgroundColor: T.card }]}>
            <Text style={[a.modalTitle, { color: T.t1 }]}>Komissiya o'zgartirish</Text>
            <Text style={[{ fontSize: F.sm, color: T.t3, marginBottom: S.md }]}>Hozirgi: {Math.round(COMMISSION_RATE * 100)}%</Text>
            <TextInput
              style={[a.modalInp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={commInput} onChangeText={setCommInput}
              keyboardType="numeric" placeholder="Yangi komissia (%)"
              placeholderTextColor={T.t4}
            />
            <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.md }}>
              <TouchableOpacity style={[a.modalBtn, { backgroundColor: T.bg3, flex: 1 }]} onPress={() => setCommModal(false)}>
                <Text style={[{ color: T.t2, fontWeight: '700' }]}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[a.modalBtn, { backgroundColor: C.p, flex: 1 }]} onPress={() => {
                setCommModal(false);
                Alert.alert('Saqlandi', `Komissiya ${commInput}% qilib o'zgartirildi`);
              }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Saqlash</Text>
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
  title: { fontSize: rs(17, 21), fontWeight: '900' },
  sub: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  logoutBtn: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  tabBar: { borderBottomWidth: 1, paddingTop: S.xs },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: S.xs, paddingVertical: S.sm, paddingHorizontal: S.md, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabTxt: { fontSize: rs(11, 13), fontWeight: '700' },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  heroIcon: { width: rs(52, 62), height: rs(52, 62), borderRadius: rs(16, 20), alignItems: 'center', justifyContent: 'center' },
  heroRole: { fontSize: F.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  heroName: { fontSize: F.lg, fontWeight: '900', color: '#fff' },
  heroPhone: { fontSize: F.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.md },
  statCard: { width: '47%', borderWidth: 1, borderRadius: R.lg, padding: S.md, gap: S.xs },
  statN: { fontSize: rs(14, 18), fontWeight: '900' },
  statL: { fontSize: rs(10, 12), fontWeight: '600' },
  commBox: { borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  boxTitle: { fontSize: F.md, fontWeight: '800' },
  editBtn: { paddingVertical: S.xs, paddingHorizontal: S.sm, borderRadius: R.md },
  commDesc: { fontSize: F.sm, fontWeight: '600', marginBottom: S.md },
  commRow: { flexDirection: 'row', gap: S.sm },
  commItem: { flex: 1, borderWidth: 1.5, borderRadius: R.md, padding: S.md, alignItems: 'center' },
  commPct: { fontSize: rs(20, 24), fontWeight: '900' },
  commLbl: { fontSize: F.xs, fontWeight: '700', marginTop: 3 },
  superBox: { flexDirection: 'row', gap: S.sm, alignItems: 'center', borderWidth: 1.5, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  superTxt: { fontSize: F.sm, fontWeight: '600', flex: 1, lineHeight: rs(18, 22) },
  secTitle: { fontSize: F.lg, fontWeight: '900', marginBottom: S.md, marginTop: S.sm },
  miniCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, borderWidth: 1, borderRadius: R.md, padding: S.md, marginBottom: S.xs },
  miniNum: { fontSize: F.xs, fontWeight: '700' },
  miniName: { fontSize: F.sm, fontWeight: '700' },
  filterRow: { borderWidth: 1, borderRadius: R.md, padding: S.md, marginBottom: S.sm },
  orderCard: { borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  orderNum: { fontSize: F.xs, fontWeight: '700' },
  statusBadge: { paddingVertical: 2, paddingHorizontal: S.sm, borderRadius: R.full },
  restCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  restAv: { width: rs(44, 52), height: rs(44, 52), borderRadius: rs(14, 17), alignItems: 'center', justifyContent: 'center' },
  actBtn: { width: rs(30, 36), height: rs(30, 36), borderRadius: rs(9, 11), alignItems: 'center', justifyContent: 'center' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  userAv: { width: rs(42, 50), height: rs(42, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  roleBadge: { paddingVertical: 2, paddingHorizontal: S.sm, borderRadius: R.full },
  blockBtn: { width: rs(32, 38), height: rs(32, 38), borderRadius: rs(10, 12), alignItems: 'center', justifyContent: 'center' },
  finCard: { borderRadius: R.xl, padding: rs(20, 26), marginBottom: S.lg },
  finLbl: { fontSize: F.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  finNum: { fontSize: rs(28, 34), fontWeight: '900', color: '#fff', marginVertical: S.xs },
  finRow: { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  finItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: R.md, padding: S.md },
  finItemN: { fontSize: F.md, fontWeight: '900', color: '#fff' },
  finItemL: { fontSize: rs(10, 12), color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  finRestCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: R.md, padding: S.md, marginBottom: S.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.xl },
  modalTitle: { fontSize: F.xl, fontWeight: '900', marginBottom: S.sm },
  modalInp: { borderWidth: 1.5, borderRadius: R.md, padding: S.md, fontSize: F.lg, fontWeight: '700', marginTop: S.sm },
  modalBtn: { borderRadius: R.md, paddingVertical: S.md, alignItems: 'center' },
});
