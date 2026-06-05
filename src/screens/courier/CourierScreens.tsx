import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';

// ════════════════════════════════════════════
// KURYER BOSH SAHIFA
// ════════════════════════════════════════════
export function CourierHomeScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [online, setOnline] = useState(true);
  const [hasOrder, setHasOrder] = useState(true);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[k.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <View>
          <Text style={[k.name, { color:T.t1 }]}>{user?.name || 'Kuryer'}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:3 }}>
            <View style={[k.dot, { backgroundColor:online?C.gn:T.t4 }]} />
            <Text style={[k.statusTxt, { color:online?C.gn:T.t4 }]}>{online?'Online':'Offline'}</Text>
          </View>
        </View>
        <Switch value={online} onValueChange={setOnline} trackColor={{ false:T.bg4, true:C.gn }} thumbColor="#fff" />
      </View>

      <ScrollView contentContainerStyle={{ padding:S.lg }}>
        {/* Daromad */}
        <View style={[k.earnCard, { backgroundColor:C.p }]}>
          <Text style={k.earnLbl}>Bugungi daromad</Text>
          <Text style={k.earnNum}>{fmtPrice(192000)}</Text>
          <View style={k.earnStats}>
            {[{ n:'13', l:'Yetkazish' }, { n:'4.9', l:'Reyting ⭐' }, { n:'2.1 km', l:"O'rt masofa" }].map((st,i) => (
              <View key={i} style={k.earnStat}>
                <Text style={k.earnStatN}>{st.n}</Text>
                <Text style={k.earnStatL}>{st.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Yangi buyurtma */}
        {online && hasOrder ? (
          <View style={[k.orderCard, { backgroundColor:T.card, borderColor:C.p }]}>
            <View style={[k.orderTop, { backgroundColor:isDark?'#2a1400':C.plt }]}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm }}>
                <View style={[k.ping, { backgroundColor:C.p }]} />
                <Text style={[k.orderLbl, { color:C.pdk }]}>YANGI BUYURTMA</Text>
              </View>
              <Text style={{ fontSize:F.xs, color:T.t3, fontWeight:'700' }}>#4832</Text>
            </View>
            <View style={{ padding:S.md }}>
              <Text style={[k.restName, { color:T.t1 }]}>Navruz Osh</Text>
              <View style={{ marginTop:S.sm, gap:S.sm }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm }}>
                  <View style={[k.routeDot, { backgroundColor:C.p }]} />
                  <Text style={[k.routeTxt, { color:T.t2 }]}>Chilonzor, Navruz 12</Text>
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm }}>
                  <View style={[k.routeDot, { backgroundColor:C.gn }]} />
                  <Text style={[k.routeTxt, { color:T.t2 }]}>Yunusobod, Amir Temur 45</Text>
                </View>
              </View>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:S.md }}>
                <Text style={[k.earn, { color:C.gn }]}>+ {fmtPrice(9000)}</Text>
                <Text style={[k.dist, { color:T.t3 }]}>🗺 1.8 km · ~8 daq</Text>
              </View>
            </View>
            <View style={[k.btns, { borderTopColor:T.bd }]}>
              <TouchableOpacity style={[k.btn, { backgroundColor:C.gn }]} onPress={() => { setHasOrder(false); Alert.alert('✅','Qabul qilindi! Manzilga yo\'l oling.'); }} activeOpacity={0.87}>
                <Text style={k.btnTxt}>✓ Qabul qilish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[k.btn, { backgroundColor:T.bg3 }]} onPress={() => setHasOrder(false)} activeOpacity={0.87}>
                <Text style={[k.btnTxt, { color:T.t2 }]}>O'tkazish</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ alignItems:'center', paddingVertical:rs(40,56) }}>
            <Text style={{ fontSize:rs(52,64), marginBottom:S.md }}>{online?'🔍':'😴'}</Text>
            <Text style={{ fontSize:F.lg, fontWeight:'800', color:T.t2 }}>
              {online?'Buyurtma kutilmoqda...':'Siz offlinesiz'}
            </Text>
            {!online && <Text style={{ fontSize:F.sm, color:T.t4, marginTop:S.sm }}>Buyurtma olish uchun online bo'ling</Text>}
            {online && !hasOrder && (
              <TouchableOpacity style={{ marginTop:S.lg, backgroundColor:C.p, borderRadius:R.lg, paddingVertical:rs(12,15), paddingHorizontal:rs(24,32) }} onPress={() => setHasOrder(true)}>
                <Text style={{ color:'#fff', fontWeight:'800' }}>🔄 Yangilash</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const k = StyleSheet.create({
  hdr: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:S.lg, borderBottomWidth:1 },
  name: { fontSize:rs(20,24), fontWeight:'900' },
  dot: { width:rs(7,9), height:rs(7,9), borderRadius:rs(4,5) },
  statusTxt: { fontSize:F.sm, fontWeight:'700' },
  earnCard: { borderRadius:R.xl, padding:rs(20,26), marginBottom:S.lg },
  earnLbl: { fontSize:F.sm, color:'rgba(255,255,255,0.8)', fontWeight:'600' },
  earnNum: { fontSize:rs(32,40), fontWeight:'900', color:'#fff', marginVertical:4 },
  earnStats: { flexDirection:'row', gap:S.sm, marginTop:S.md },
  earnStat: { flex:1, backgroundColor:'rgba(255,255,255,0.18)', borderRadius:R.md, padding:S.sm, alignItems:'center' },
  earnStatN: { fontSize:F.lg, fontWeight:'900', color:'#fff' },
  earnStatL: { fontSize:rs(9,11), color:'rgba(255,255,255,0.8)', fontWeight:'600', marginTop:3 },
  orderCard: { borderWidth:2, borderRadius:R.lg, overflow:'hidden' },
  orderTop: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:S.md, paddingVertical:S.sm },
  ping: { width:rs(7,9), height:rs(7,9), borderRadius:rs(4,5) },
  orderLbl: { fontSize:F.xs, fontWeight:'900', letterSpacing:0.5 },
  restName: { fontSize:F.lg, fontWeight:'900' },
  routeDot: { width:rs(8,10), height:rs(8,10), borderRadius:rs(4,5) },
  routeTxt: { fontSize:F.sm, fontWeight:'600' },
  earn: { fontSize:rs(20,24), fontWeight:'900' },
  dist: { fontSize:F.xs, fontWeight:'600' },
  btns: { flexDirection:'row', gap:S.sm, padding:S.md, borderTopWidth:0.5 },
  btn: { flex:1, borderRadius:R.md, paddingVertical:rs(11,14), alignItems:'center' },
  btnTxt: { fontSize:F.md, fontWeight:'800', color:'#fff' },
});

// Kuryer stub ekranlar
function KStub({ navigation, title, emoji, T }: any) {
  const { logout } = useAuthStore();
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:32 }}>
        <Text style={{ fontSize:rs(52,64), marginBottom:S.md }}>{emoji}</Text>
        <Text style={{ fontSize:F.xl, fontWeight:'900', color:T.t1 }}>{title}</Text>
        <Text style={{ fontSize:F.sm, color:T.t3, marginTop:S.sm }}>Tez orada</Text>
        {title === 'Profil' && (
          <TouchableOpacity style={{ marginTop:S.lg, backgroundColor:C.rd, borderRadius:R.lg, paddingVertical:rs(14,18), paddingHorizontal:rs(28,36) }} onPress={logout}>
            <Text style={{ color:'#fff', fontWeight:'800' }}>🚪 Chiqish</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
export function CourierHistoryScreen({ navigation }: any) { const { T } = useThemeStore(); return <KStub navigation={navigation} title="Tarix" emoji="📋" T={T} />; }
export function CourierStatsScreen({ navigation }: any) { const { T } = useThemeStore(); return <KStub navigation={navigation} title="Statistika" emoji="📊" T={T} />; }
export function CourierProfileScreen({ navigation }: any) { const { T } = useThemeStore(); return <KStub navigation={navigation} title="Profil" emoji="👤" T={T} />; }

