import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useRestOrderStore, useAuthStore, RestOrder } from '../../store';

// ════════ BOSH SAHIFA ════════
export function RestaurantHomeScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const { orders } = useRestOrderStore();
  const [isOpen, setIsOpen] = useState(true);

  const newCount = orders.filter(o => o.status === 'new').length;
  const prepCount = orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length;
  const todayRevenue = orders.reduce((s, o) => s + o.myShare, 0);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[rs2.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <View>
          <Text style={[rs2.name, { color:T.t1 }]}>{user?.name || 'Restoran'}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm, marginTop:S.sm }}>
            <Text style={[rs2.statusLbl, { color:T.t2 }]}>Holat:</Text>
            <Switch value={isOpen} onValueChange={setIsOpen} trackColor={{ false:T.bg4, true:C.gn }} thumbColor="#fff" />
            <Text style={[rs2.statusTxt, { color:isOpen?C.gn:C.rd }]}>{isOpen?'Ochiq':'Yopiq'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding:S.lg }}>
        {/* Statistika */}
        <View style={rs2.statGrid}>
          {[
            { n:newCount.toString(), l:'Yangi buyurtma', c:C.p },
            { n:prepCount.toString(), l:'Tayyorlanmoqda', c:C.amber },
            { n:fmtPrice(todayRevenue), l:'Bugungi daromad', c:C.gn, wide:true },
            { n:'4.8', l:'Reyting ⭐', c:C.gold },
          ].map((st, i) => (
            <View key={i} style={[rs2.statCard, { backgroundColor:T.card, borderColor:T.bd }, st.wide && { width:'100%' }]}>
              <Text style={[rs2.statN, { color:st.c }]}>{st.n}</Text>
              <Text style={[rs2.statL, { color:T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Buyurtmalar tugma */}
        <TouchableOpacity
          style={[rs2.bigBtn, { backgroundColor:C.p }]}
          onPress={() => navigation.navigate('RBuyurtma')}
          activeOpacity={0.88}
        >
          <Text style={{ fontSize:rs(24,29) }}>📋</Text>
          <View style={{ flex:1 }}>
            <Text style={rs2.bigBtnTitle}>Buyurtmalarni boshqarish</Text>
            <Text style={rs2.bigBtnSub}>{newCount} ta yangi buyurtma kutmoqda</Text>
          </View>
          <Text style={{ fontSize:rs(20,24), color:'#fff' }}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const rs2 = StyleSheet.create({
  hdr: { padding:S.lg, borderBottomWidth:1 },
  name: { fontSize:rs(20,24), fontWeight:'900' },
  statusLbl: { fontSize:F.sm, fontWeight:'600' },
  statusTxt: { fontSize:F.sm, fontWeight:'800' },
  statGrid: { flexDirection:'row', flexWrap:'wrap', gap:S.sm, marginBottom:S.lg },
  statCard: { width:'47%', borderWidth:1, borderRadius:R.lg, padding:S.md },
  statN: { fontSize:rs(20,24), fontWeight:'900' },
  statL: { fontSize:F.xs, fontWeight:'600', marginTop:4 },
  bigBtn: { flexDirection:'row', alignItems:'center', gap:S.md, borderRadius:R.lg, padding:S.lg },
  bigBtnTitle: { color:'#fff', fontSize:F.lg, fontWeight:'900' },
  bigBtnSub: { color:'rgba(255,255,255,0.85)', fontSize:F.sm, fontWeight:'600', marginTop:2 },
});

// ════════ BUYURTMALAR (alohida sahifa) ════════
type Filter = 'new' | 'preparing' | 'ready';
export function RestaurantOrdersScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { orders, acceptOrder, readyOrder, rejectOrder, tickTimers } = useRestOrderStore();
  const [filter, setFilter] = useState<Filter>('new');

  useEffect(() => { const iv = setInterval(tickTimers, 1000); return () => clearInterval(iv); }, []);

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

  const fmtTimer = (sec: number) => sec < 60 ? `${sec}s` : `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

  const FILTERS: { key:Filter; label:string }[] = [
    { key:'new', label:'Yangi' },
    { key:'preparing', label:'Tayyorlanmoqda' },
    { key:'ready', label:'Tayyor' },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[os.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <TouchableOpacity style={[os.back, { backgroundColor:T.bg3 }]} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize:rs(20,24), color:T.t2 }}>←</Text>
        </TouchableOpacity>
        <Text style={[os.hdrTitle, { color:T.t1 }]}>Buyurtmalar</Text>
        <View style={[os.live, { backgroundColor:C.gn }]}><Text style={os.liveTxt}>LIVE</Text></View>
      </View>

      {/* Filterlar */}
      <View style={[os.filters, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key}
            style={[os.chip, { backgroundColor:T.bg3, borderColor:T.bd }, filter===f.key && { backgroundColor:C.p, borderColor:C.p }]}
            onPress={() => setFilter(f.key)} activeOpacity={0.85}
          >
            <Text style={[os.chipTxt, { color:filter===f.key?'#fff':T.t2 }]}>{f.label}</Text>
            {counts[f.key] > 0 && (
              <View style={[os.chipBadge, { backgroundColor:filter===f.key?'rgba(255,255,255,0.25)':C.p }]}>
                <Text style={os.chipBadgeTxt}>{counts[f.key]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding:S.lg, paddingBottom:S.xxl }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems:'center', paddingVertical:rs(60,80) }}>
            <Text style={{ fontSize:rs(52,64), marginBottom:S.md }}>{filter==='new'?'📭':filter==='preparing'?'👨‍🍳':'🎁'}</Text>
            <Text style={{ fontSize:F.xl, fontWeight:'800', color:T.t2 }}>
              {filter==='new'?'Yangi buyurtma yo\'q':filter==='preparing'?'Tayyorlanayotgan yo\'q':'Tayyor buyurtma yo\'q'}
            </Text>
          </View>
        ) : filtered.map(order => (
          <OrderCard key={order.id} order={order} isDark={isDark} T={T} fmtTimer={fmtTimer}
            onAccept={() => { acceptOrder(order.id); Alert.alert('✅','Qabul qilindi!'); }}
            onReject={() => Alert.alert('Rad etish', `#${order.orderNumber}?`, [{ text:'Bekor', style:'cancel' }, { text:'Rad', style:'destructive', onPress:() => rejectOrder(order.id) }])}
            onReady={() => { readyOrder(order.id); Alert.alert('✅','Tayyor!'); }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({ order, isDark, T, fmtTimer, onAccept, onReject, onReady }: any) {
  const isNew = order.status === 'new';
  const isPrep = order.status === 'accepted' || order.status === 'preparing';
  const isReady = order.status === 'ready';
  const sColor = isNew ? C.p : isPrep ? C.amber : C.gn;
  const sBg = isNew ? (isDark?'#2a1400':C.plt) : isPrep ? (isDark?'#2a1500':C.ambBg) : (isDark?C.gndk:C.gnb);

  return (
    <View style={[oc.card, { backgroundColor:T.card, borderColor:isNew?C.p:T.bd }, isNew && { borderWidth:2 }]}>
      <View style={[oc.top, { backgroundColor:sBg }]}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm }}>
          <View style={[oc.ping, { backgroundColor:sColor }]} />
          <Text style={[oc.num, { color:sColor }]}>#{order.orderNumber}</Text>
          <Text style={[oc.status, { color:sColor }]}>{isNew?'Yangi':isPrep?'Tayyorlanmoqda':'Tayyor'}</Text>
        </View>
        {isNew && (
          <View style={[oc.timer, { backgroundColor:order.timer>60?C.rdb:(isDark?'#1a0a00':C.ambBg) }]}>
            <Text style={[oc.timerTxt, { color:order.timer>60?C.rd:C.amber }]}>⏱ {fmtTimer(order.timer)}</Text>
          </View>
        )}
      </View>

      <View style={{ padding:S.md }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm, marginBottom:S.md }}>
          <View style={[oc.av, { backgroundColor:isDark?'#2a1400':C.plt, borderColor:C.p }]}>
            <Text style={{ fontSize:rs(16,20) }}>👤</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={[oc.client, { color:T.t1 }]}>{order.clientName}</Text>
            <Text style={[oc.addr, { color:T.t3 }]}>📍 {order.address}</Text>
          </View>
        </View>
        <Text style={[oc.items, { color:T.t2 }]}>{order.items}</Text>
        <View style={[oc.total, { borderTopColor:T.bd }]}>
          <View>
            <Text style={[oc.totalLbl, { color:T.t3 }]}>Sizga (90%)</Text>
            <Text style={[oc.totalNum, { color:C.gn }]}>{fmtPrice(order.myShare)}</Text>
          </View>
          <View style={{ alignItems:'flex-end' }}>
            <Text style={[oc.totalLbl, { color:T.t3 }]}>Platforma (10%)</Text>
            <Text style={[{ fontSize:F.sm, fontWeight:'700' }, { color:T.t3 }]}>{fmtPrice(order.platformShare)}</Text>
          </View>
        </View>
      </View>

      <View style={[oc.btns, { borderTopColor:T.bd }]}>
        {isNew && (
          <>
            <TouchableOpacity style={[oc.btn, { backgroundColor:C.gn }]} onPress={onAccept} activeOpacity={0.87}>
              <Text style={oc.btnTxt}>✓ Qabul</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[oc.btn, { backgroundColor:isDark?C.rddk:C.rdb, borderWidth:1, borderColor:C.rd }]} onPress={onReject} activeOpacity={0.87}>
              <Text style={[oc.btnTxt, { color:C.rd }]}>✕ Rad</Text>
            </TouchableOpacity>
          </>
        )}
        {isPrep && (
          <TouchableOpacity style={[oc.btn, { flex:1, backgroundColor:C.amber }]} onPress={onReady} activeOpacity={0.87}>
            <Text style={oc.btnTxt}>🍽 Tayyor!</Text>
          </TouchableOpacity>
        )}
        {isReady && (
          <View style={[oc.btn, { flex:1, backgroundColor:isDark?C.gndk:C.gnb, borderWidth:1, borderColor:C.gn }]}>
            <Text style={[oc.btnTxt, { color:C.gn }]}>✅ Kuryer kutilmoqda</Text>
          </View>
        )}
      </View>
    </View>
  );
}
const os = StyleSheet.create({
  hdr: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:S.lg, borderBottomWidth:1 },
  back: { width:rs(40,50), height:rs(40,50), borderRadius:rs(13,16), alignItems:'center', justifyContent:'center' },
  hdrTitle: { fontSize:rs(17,21), fontWeight:'800' },
  live: { flexDirection:'row', alignItems:'center', paddingVertical:S.xs, paddingHorizontal:S.sm, borderRadius:R.full },
  liveTxt: { fontSize:F.xs, fontWeight:'900', color:'#fff' },
  filters: { flexDirection:'row', padding:S.md, gap:S.sm, borderBottomWidth:1 },
  chip: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:S.xs, borderWidth:1, borderRadius:R.full, paddingVertical:rs(8,10) },
  chipTxt: { fontSize:F.xs, fontWeight:'700' },
  chipBadge: { minWidth:rs(18,22), height:rs(18,22), borderRadius:rs(9,11), alignItems:'center', justifyContent:'center', paddingHorizontal:3 },
  chipBadgeTxt: { fontSize:rs(10,12), fontWeight:'900', color:'#fff' },
});
const oc = StyleSheet.create({
  card: { borderWidth:1, borderRadius:R.lg, overflow:'hidden', marginBottom:S.md },
  top: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:S.md, paddingVertical:S.sm },
  ping: { width:rs(7,9), height:rs(7,9), borderRadius:rs(4,5) },
  num: { fontSize:F.md, fontWeight:'800' },
  status: { fontSize:F.sm, fontWeight:'600' },
  timer: { paddingVertical:4, paddingHorizontal:S.sm, borderRadius:R.sm },
  timerTxt: { fontSize:F.sm, fontWeight:'800' },
  av: { width:rs(40,48), height:rs(40,48), borderRadius:rs(20,24), borderWidth:2, alignItems:'center', justifyContent:'center' },
  client: { fontSize:F.md, fontWeight:'700' },
  addr: { fontSize:F.sm, fontWeight:'600', marginTop:2 },
  items: { fontSize:F.sm, fontWeight:'600', lineHeight:rs(20,24), marginBottom:S.sm },
  total: { flexDirection:'row', justifyContent:'space-between', borderTopWidth:0.5, paddingTop:S.sm },
  totalLbl: { fontSize:F.xs, fontWeight:'600' },
  totalNum: { fontSize:F.lg, fontWeight:'900', marginTop:2 },
  btns: { flexDirection:'row', gap:S.sm, padding:S.md, borderTopWidth:0.5 },
  btn: { flex:1, borderRadius:R.md, paddingVertical:rs(11,14), alignItems:'center' },
  btnTxt: { fontSize:F.md, fontWeight:'800', color:'#fff' },
});

// ════════ STUB ekranlar (Menu, Stats, Profil) ════════
function Stub({ navigation, title, emoji, T }: any) {
  const { logout } = useAuthStore();
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:32 }}>
        <Text style={{ fontSize:rs(52,64), marginBottom:S.md }}>{emoji}</Text>
        <Text style={{ fontSize:F.xl, fontWeight:'900', color:T.t1 }}>{title}</Text>
        <Text style={{ fontSize:F.sm, color:T.t3, marginTop:S.sm }}>Tez orada to'liq</Text>
        {title === 'Profil' && (
          <TouchableOpacity style={{ marginTop:S.lg, backgroundColor:C.rd, borderRadius:R.lg, paddingVertical:rs(14,18), paddingHorizontal:rs(28,36) }} onPress={logout}>
            <Text style={{ color:'#fff', fontWeight:'800' }}>🚪 Chiqish</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
export function RestaurantMenuScreen({ navigation }: any) { const { T } = useThemeStore(); return <Stub navigation={navigation} title="Menyu" emoji="🍽" T={T} />; }
export function RestaurantStatsScreen({ navigation }: any) { const { T } = useThemeStore(); return <Stub navigation={navigation} title="Statistika" emoji="📊" T={T} />; }
export function RestaurantProfileScreen({ navigation }: any) { const { T } = useThemeStore(); return <Stub navigation={navigation} title="Profil" emoji="👤" T={T} />; }
