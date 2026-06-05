import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';
import {
  IcCheck, IcLogout, IcSettings,
  IcPhone, IcStar, IcMotorbike, IcPin, IcTime,
  IcChevron, IcMoon, IcSun,
} from '../../components/Icons';

// ─── Km ga asoslangan narx hisoblash ───
// 0-1 km: 6 000 so'm | +1 km qo'shilsa +3 000 so'm
const calcDeliveryFee = (km: number): number => {
  if (km <= 0) return 6000;
  const base = 6000;
  const extra = Math.max(0, Math.ceil(km) - 1) * 3000;
  return base + extra;
};

// Kuryer daromadi (restoran narxidan 70%)
const calcCourierEarning = (km: number): number => {
  return Math.round(calcDeliveryFee(km) * 0.7);
};

// ════════ BOSH SAHIFA ════════
export function CourierHomeScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [online, setOnline] = useState(true);
  const [hasOrder, setHasOrder] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[k.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flex: 1 }}>
          <Text style={[k.name, { color: T.t1 }]}>{user?.name || 'Kuryer'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <View style={[k.dot, { backgroundColor: online ? C.gn : T.t4 }]} />
            <Text style={[k.statusTxt, { color: online ? C.gn : T.t4 }]}>
              {online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <Switch value={online} onValueChange={setOnline} trackColor={{ false: T.bg4, true: C.gn }} thumbColor="#fff" />
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg }}>
        {/* Daromad */}
        <View style={[k.earnCard, { backgroundColor: C.p }]}>
          <Text style={k.earnLbl}>Bugungi daromad</Text>
          <Text style={k.earnNum}>{fmtPrice(192000)}</Text>
          <View style={k.earnStats}>
            {[
              { n: '13', l: 'Yetkazish' },
              { n: '4.9', l: 'Reyting' },
              { n: '2.1 km', l: "O'rt masofa" },
            ].map((st, i) => (
              <View key={i} style={k.earnStat}>
                <Text style={k.earnStatN}>{st.n}</Text>
                <Text style={k.earnStatL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Yangi buyurtma */}
        {online && hasOrder ? (() => {
          const orderKm = 1.8;
          const fee = calcDeliveryFee(orderKm);
          const earning = calcCourierEarning(orderKm);
          const eta = Math.round(orderKm * 5 + 3);
          return (
          <View style={[k.orderCard, { backgroundColor: T.card, borderColor: C.p }]}>
            <View style={[k.orderTop, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                <View style={[k.ping, { backgroundColor: C.p }]} />
                <Text style={[k.orderLbl, { color: C.pdk }]}>YANGI BUYURTMA</Text>
              </View>
              <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '700' }}>#4832</Text>
            </View>
            <View style={{ padding: S.md }}>
              <Text style={[k.restName, { color: T.t1 }]}>Navruz Osh</Text>
              <View style={{ marginTop: S.sm, gap: S.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                  <View style={[k.routeDot, { backgroundColor: C.p }]} />
                  <Text style={[k.routeTxt, { color: T.t2 }]}>Chilonzor, Navruz 12</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                  <View style={[k.routeDot, { backgroundColor: C.gn }]} />
                  <Text style={[k.routeTxt, { color: T.t2 }]}>Yunusobod, Amir Temur 45</Text>
                </View>
              </View>
              {/* Narx breakdown */}
              <View style={[{ borderRadius: R.md, padding: S.sm, marginTop: S.sm, backgroundColor: isDark ? '#1a1a00' : '#fffbe6' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '600' }}>Yetkazish narxi</Text>
                  <Text style={{ fontSize: F.xs, color: T.t2, fontWeight: '700' }}>{fmtPrice(fee)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                  <Text style={{ fontSize: F.xs, color: C.gn, fontWeight: '600' }}>Sizning ulushingiz</Text>
                  <Text style={{ fontSize: F.xs, color: C.gn, fontWeight: '800' }}>+{fmtPrice(earning)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: S.sm }}>
                <Text style={[k.earn, { color: C.gn }]}>+{fmtPrice(earning)}</Text>
                <Text style={[k.dist, { color: T.t3 }]}>{orderKm} km · ~{eta} daq</Text>
              </View>
            </View>
            <View style={[k.btns, { borderTopColor: T.bd }]}>
              <TouchableOpacity
                style={[k.btn, { backgroundColor: C.gn }]}
                onPress={() => { setHasOrder(false); Alert.alert('Qabul qilindi!', 'Manzilga yo\'l oling.'); }}
                activeOpacity={0.87}
              >
                <IcCheck color="#fff" size={rs(16, 20)} />
                <Text style={k.btnTxt}>Qabul qilish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[k.btn, { backgroundColor: T.bg3 }]} onPress={() => setHasOrder(false)} activeOpacity={0.87}>
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
              <Text style={{ fontSize: F.sm, color: T.t4, marginTop: S.sm }}>
                Buyurtma olish uchun online bo'ling
              </Text>
            )}
            {online && !hasOrder && (
              <TouchableOpacity
                style={{ marginTop: S.lg, backgroundColor: C.p, borderRadius: R.lg, paddingVertical: rs(12, 15), paddingHorizontal: rs(24, 32) }}
                onPress={() => setHasOrder(true)}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Yangilash</Text>
              </TouchableOpacity>
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
  routeTxt: { fontSize: F.sm, fontWeight: '600' },
  earn: { fontSize: rs(20, 24), fontWeight: '900' },
  dist: { fontSize: F.xs, fontWeight: '600' },
  btns: { flexDirection: 'row', gap: S.sm, padding: S.md, borderTopWidth: 0.5 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, borderRadius: R.md, paddingVertical: rs(11, 14) },
  btnTxt: { fontSize: F.md, fontWeight: '800', color: '#fff' },
  emptyIcon: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(40, 48), alignItems: 'center', justifyContent: 'center' },
});

// ════════ TARIX ════════
const HISTORY_DATA = [
  {
    date: 'Bugun',
    items: [
      { id: 'h1', num: 4832, rest: 'Navruz Osh', addr: 'Yunusobod, Amir Temur 45', dist: '1.8 km', earn: 9000, time: '13:45', rating: 5 },
      { id: 'h2', num: 4831, rest: 'Burger House', addr: "Chilonzor, Navruz 12", dist: '2.3 km', earn: 11000, time: '12:20', rating: 5 },
      { id: 'h3', num: 4830, rest: 'Green Bowl', addr: "Mirzo Ulug'bek, 7", dist: '1.1 km', earn: 7000, time: '11:05', rating: 4 },
    ],
    total: 27000,
  },
  {
    date: 'Kecha',
    items: [
      { id: 'h4', num: 4821, rest: 'Pizza Planet', addr: "Yunusobod, Navruz 3", dist: '3.2 km', earn: 14000, time: '20:30', rating: 5 },
      { id: 'h5', num: 4818, rest: 'Navruz Osh', addr: 'Chilonzor 15', dist: '1.5 km', earn: 8000, time: '19:15', rating: 4 },
      { id: 'h6', num: 4815, rest: 'Tokyo Roll', addr: "Amir Temur 90", dist: '4.1 km', earn: 18000, time: '18:00', rating: 5 },
      { id: 'h7', num: 4810, rest: 'Burger House', addr: "Mirzo Ulug'bek 22", dist: '2.8 km', earn: 12000, time: '14:30', rating: 5 },
    ],
    total: 52000,
  },
  {
    date: '3 kun oldin',
    items: [
      { id: 'h8', num: 4798, rest: 'Green Bowl', addr: "Yakkasaroy, Pushkin 15", dist: '2.2 km', earn: 10000, time: '21:10', rating: 5 },
      { id: 'h9', num: 4795, rest: 'Navruz Osh', addr: "Shayhontohur, 5", dist: '1.7 km', earn: 8500, time: '19:45', rating: 4 },
    ],
    total: 18500,
  },
];

export function CourierHistoryScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const totalAllTime = HISTORY_DATA.reduce((s, d) => s + d.total, 0);
  const totalDeliveries = HISTORY_DATA.reduce((s, d) => s + d.items.length, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[ht.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[ht.title, { color: T.t1 }]}>Yetkazish tarixi</Text>
      </View>

      {/* Summary */}
      <View style={[ht.summary, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
        <View style={ht.summaryItem}>
          <Text style={[ht.summaryN, { color: C.gn }]}>{fmtPrice(totalAllTime)}</Text>
          <Text style={[ht.summaryL, { color: T.t3 }]}>Umumiy daromad</Text>
        </View>
        <View style={[ht.summaryDiv, { backgroundColor: T.bd }]} />
        <View style={ht.summaryItem}>
          <Text style={[ht.summaryN, { color: C.p }]}>{totalDeliveries}</Text>
          <Text style={[ht.summaryL, { color: T.t3 }]}>Yetkazish</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: S.xxl }}>
        {HISTORY_DATA.map((group, gi) => (
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
                    <Text style={[ht.restName, { color: T.t1 }]}>{item.rest}</Text>
                    <Text style={[ht.earn, { color: C.gn }]}>+{fmtPrice(item.earn)}</Text>
                  </View>
                  <Text style={[ht.addr, { color: T.t3 }]}>{item.addr}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <IcPin color={T.t4} size={rs(11, 13)} />
                      <Text style={[ht.meta, { color: T.t4 }]}>{item.dist}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <IcTime color={T.t4} size={rs(11, 13)} />
                      <Text style={[ht.meta, { color: T.t4 }]}>{item.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <IcStar key={s} color={s <= item.rating ? C.gold : T.bg4} size={rs(10, 13)} />
                      ))}
                    </View>
                  </View>
                </View>
                <View style={[ht.numBadge, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
                  <Text style={[ht.num, { color: T.t3 }]}>#{item.num}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
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
const WEEKLY_EARN = [
  { day: 'Du', earn: 85000, deliveries: 9 },
  { day: 'Se', earn: 120000, deliveries: 13 },
  { day: 'Ch', earn: 95000, deliveries: 10 },
  { day: 'Pa', earn: 145000, deliveries: 16 },
  { day: 'Ju', earn: 175000, deliveries: 19 },
  { day: 'Sh', earn: 192000, deliveries: 21 },
  { day: 'Ya', earn: 110000, deliveries: 12 },
];

export function CourierStatsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const totalEarn = WEEKLY_EARN.reduce((s, d) => s + d.earn, 0);
  const totalDel = WEEKLY_EARN.reduce((s, d) => s + d.deliveries, 0);
  const maxEarn = Math.max(...WEEKLY_EARN.map(d => d.earn));
  const avgEarn = Math.round(totalEarn / 7);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[cs.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[cs.title, { color: T.t1 }]}>Statistika</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {/* Top kartalar */}
        <View style={cs.grid}>
          {[
            { n: fmtPrice(totalEarn), l: 'Haftalik daromad', c: C.gn },
            { n: totalDel.toString(), l: 'Yetkazishlar', c: C.p },
            { n: fmtPrice(avgEarn), l: 'Kunlik o\'rtacha', c: C.amber },
            { n: '4.9 ★', l: 'Reyting', c: C.gold },
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
              { n: '487', l: "Jami yetkazish" },
              { n: '1,240 km', l: "Bosib o'tilgan" },
              { n: '6 oy', l: 'Ishlagan vaqt' },
              { n: '100%', l: 'Qabul darajasi' },
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
            {WEEKLY_EARN.map((d, i) => {
              const height = (d.earn / maxEarn) * rs(100, 130);
              const isToday = i === 5;
              return (
                <View key={i} style={cs.bar}>
                  <Text style={[cs.barVal, { color: T.t3 }]}>{Math.round(d.earn / 1000)}k</Text>
                  <View style={[cs.barFill, { height, backgroundColor: isToday ? C.p : (isDark ? '#3a2a1a' : C.plt), borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <Text style={[cs.barDay, { color: isToday ? C.p : T.t3 }]}>{d.day}</Text>
                  <Text style={[cs.barDel, { color: T.t4 }]}>{d.deliveries}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[cs.chartNote, { color: T.t4 }]}>Ustundagi raqamlar — yetkazish soni</Text>
        </View>

        {/* Reyting */}
        <View style={[cs.ratingBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[cs.sectionTitle, { color: T.t1 }]}>Reyting taqsimoti</Text>
          {[
            { stars: 5, count: 421, pct: 87 },
            { stars: 4, count: 54, pct: 11 },
            { stars: 3, count: 8, pct: 2 },
            { stars: 2, count: 3, pct: 0.6 },
            { stars: 1, count: 1, pct: 0.2 },
          ].map((r) => (
            <View key={r.stars} style={cs.ratingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, width: rs(50, 60) }}>
                <Text style={[cs.starsN, { color: T.t2 }]}>{r.stars}</Text>
                <IcStar color={C.gold} size={rs(11, 14)} />
              </View>
              <View style={[cs.ratingBg, { backgroundColor: T.bg3, flex: 1 }]}>
                <View style={[cs.ratingFill, { width: `${r.pct}%` as any, backgroundColor: r.stars >= 4 ? C.gn : r.stars === 3 ? C.amber : C.rd }]} />
              </View>
              <Text style={[cs.ratingCount, { color: T.t3 }]}>{r.count}</Text>
            </View>
          ))}
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
  ratingBox: { borderWidth: 1, borderRadius: R.lg, padding: S.md },
  sectionTitle: { fontSize: F.md, fontWeight: '800', marginBottom: S.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.xs },
  starsN: { fontSize: F.sm, fontWeight: '700' },
  ratingBg: { height: rs(8, 10), borderRadius: R.full, overflow: 'hidden' },
  ratingFill: { height: '100%', borderRadius: R.full },
  ratingCount: { fontSize: F.xs, fontWeight: '600', width: rs(30, 38), textAlign: 'right' },
});

// ════════ PROFIL ════════
export function CourierProfileScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [online, setOnline] = useState(true);

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
      { Icon: IcMotorbike, label: 'Transport', val: 'Mototsikl', bg: C.amber },
      { Icon: IcSettings, label: 'Sozlamalar', val: '', bg: '#7C4DFF' },
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

          {/* Online tugma */}
          <View style={[kp.statusRow, { backgroundColor: online ? C.gnb : (isDark ? '#1a1a1a' : '#f5f5f5'), borderColor: online ? C.gn : T.bd }]}>
            <View style={[kp.statusDot, { backgroundColor: online ? C.gn : '#999' }]} />
            <Text style={[kp.statusTxt, { color: online ? C.gn : T.t3 }]}>
              {online ? 'Online' : 'Offline'}
            </Text>
            <Switch value={online} onValueChange={setOnline} trackColor={{ false: T.bg4, true: C.gn }} thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Statistika */}
        <View style={[kp.statsRow, { borderBottomColor: T.bd }]}>
          {[
            { n: '487', l: 'Yetkazish', c: C.p },
            { n: '4.9', l: 'Reyting', c: C.gold },
            { n: '6 oy', l: 'Tajriba', c: C.gn },
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
