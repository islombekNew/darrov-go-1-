import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';
import { COMMISSION_RATE } from '../../constants';

export function AdminScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState('dashboard');
  const isSuperadmin = user?.role === 'superadmin';

  const TABS = ['Dashboard', 'Buyurtmalar', 'Restoranlar', 'Moliya'];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[a.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm }}>
          <Text style={{ fontSize:rs(22,27) }}>{isSuperadmin?'👑':'🛡'}</Text>
          <View>
            <Text style={[a.title, { color:T.t1 }]}>{isSuperadmin?'Superadmin':'Admin'} Panel</Text>
            <Text style={[a.sub, { color:T.t3 }]}>DarrovGo boshqaruv</Text>
          </View>
        </View>
        <TouchableOpacity style={[a.logoutBtn, { backgroundColor:isDark?C.rddk:C.rdb }]} onPress={logout}>
          <Text style={{ fontSize:rs(18,22) }}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={[a.tabs, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:S.sm, paddingHorizontal:S.md }}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[a.tab, tab===t.toLowerCase() && { borderBottomColor:C.p }]} onPress={() => setTab(t.toLowerCase())}>
              <Text style={[a.tabTxt, { color:tab===t.toLowerCase()?C.p:T.t3 }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding:S.lg }}>
        <View style={[a.hero, { backgroundColor:C.pdk }]}>
          <Text style={{ fontSize:rs(32,40) }}>{isSuperadmin?'👑':'🛡'}</Text>
          <View style={{ flex:1, marginLeft:S.md }}>
            <Text style={a.heroRole}>{isSuperadmin?'Superadmin':'Admin'} · DarrovGo</Text>
            <Text style={a.heroName}>{user?.name}</Text>
            <Text style={a.heroPhone}>+{user?.phone}</Text>
          </View>
        </View>

        <View style={a.statGrid}>
          {[
            { n:'0', l:'📦 Buyurtmalar', c:C.p },
            { n:fmtPrice(0), l:'💰 Aylanma', c:C.gold },
            { n:fmtPrice(0), l:'💎 10% Komissiya', c:C.gn },
            { n:'0', l:'🏪 Restoranlar', c:C.p },
          ].map((st,i) => (
            <View key={i} style={[a.statCard, { backgroundColor:T.card, borderColor:T.bd }]}>
              <Text style={[a.statN, { color:st.c }]}>{st.n}</Text>
              <Text style={[a.statL, { color:T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        <View style={[a.commCard, { backgroundColor:T.card, borderColor:T.bd }]}>
          <Text style={[a.commTitle, { color:T.t2 }]}>
            Har buyurtmadan {Math.round(COMMISSION_RATE*100)}% komissiya avtomatik olinadi. Mijoz buni ko'rmaydi.
          </Text>
          <View style={a.commRow}>
            <View style={[a.commItem, { backgroundColor:isDark?'#0d2d0d':C.gnb, borderColor:C.gn }]}>
              <Text style={[a.commPct, { color:C.gn }]}>90%</Text>
              <Text style={[a.commLbl, { color:C.gn }]}>Restoranga</Text>
            </View>
            <View style={[a.commItem, { backgroundColor:isDark?'#2a1400':C.plt, borderColor:C.p }]}>
              <Text style={[a.commPct, { color:C.p }]}>10%</Text>
              <Text style={[a.commLbl, { color:C.p }]}>Platformaga</Text>
            </View>
          </View>
        </View>

        {isSuperadmin && (
          <View style={[a.commCard, { backgroundColor:isDark?'#1a0a3d':C.pub, borderColor:C.pu, marginTop:S.md }]}>
            <Text style={[a.commTitle, { color:C.pu, marginBottom:0 }]}>
              🔐 Superadmin huquqlari: adminlarni boshqarish, komissiya o'zgartirish, barcha hududlarni ko'rish.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  hdr: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:S.lg, borderBottomWidth:1 },
  title: { fontSize:rs(17,21), fontWeight:'900' },
  sub: { fontSize:F.xs, fontWeight:'600', marginTop:2 },
  logoutBtn: { width:rs(40,50), height:rs(40,50), borderRadius:rs(13,16), alignItems:'center', justifyContent:'center' },
  tabs: { borderBottomWidth:1, paddingVertical:S.xs },
  tab: { paddingVertical:S.sm, paddingHorizontal:S.sm, borderBottomWidth:2.5, borderBottomColor:'transparent' },
  tabTxt: { fontSize:F.sm, fontWeight:'700' },
  hero: { flexDirection:'row', alignItems:'center', borderRadius:R.lg, padding:S.md, marginBottom:S.lg },
  heroRole: { fontSize:F.xs, color:'rgba(255,255,255,0.7)', fontWeight:'600' },
  heroName: { fontSize:F.lg, fontWeight:'900', color:'#fff' },
  heroPhone: { fontSize:F.xs, color:'rgba(255,255,255,0.7)', marginTop:2 },
  statGrid: { flexDirection:'row', flexWrap:'wrap', gap:S.sm, marginBottom:S.md },
  statCard: { width:'47%', borderWidth:1, borderRadius:R.lg, padding:S.md },
  statN: { fontSize:rs(18,22), fontWeight:'900' },
  statL: { fontSize:F.xs, fontWeight:'600', marginTop:3 },
  commCard: { borderWidth:1, borderRadius:R.lg, padding:S.md },
  commTitle: { fontSize:F.sm, fontWeight:'600', marginBottom:S.md, lineHeight:rs(18,22) },
  commRow: { flexDirection:'row', gap:S.sm },
  commItem: { flex:1, borderWidth:1.5, borderRadius:R.md, padding:S.md, alignItems:'center' },
  commPct: { fontSize:rs(20,24), fontWeight:'900' },
  commLbl: { fontSize:F.xs, fontWeight:'700', marginTop:3 },
});
