import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { C, S, R, F, rs, fmtDate, fmtPrice } from '../../theme';
import { useThemeStore, useNotifStore, useAuthStore, useCartStore, useOrderStore } from '../../store';

// ════════ HEADER (umumiy) ════════
function Header({ navigation, title, T }: any) {
  return (
    <View style={[h.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
      <TouchableOpacity style={[h.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: rs(20, 24), color: T.t2 }}>←</Text>
      </TouchableOpacity>
      <Text style={[h.title, { color: T.t1 }]}>{title}</Text>
      <View style={{ width: rs(40, 50) }} />
    </View>
  );
}
const h = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  back: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: rs(16, 20), fontWeight: '800' },
});

// ════════ BILDIRISHNOMALAR ════════
export function NotificationsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { notifs, markRead, markAllRead } = useNotifStore();

  const meta = (type: string) => {
    switch (type) {
      case 'coin_earned': return { icon:'🪙', bg:isDark?'#2a1500':C.ambBg };
      case 'order_accepted': return { icon:'✅', bg:isDark?C.gndk:C.gnb };
      case 'order_ready': return { icon:'🍽', bg:isDark?'#2a1400':C.plt };
      case 'order_delivered': return { icon:'🎉', bg:isDark?C.gndk:C.gnb };
      case 'level_up': return { icon:'⬆️', bg:isDark?C.pubDk:C.pub };
      case 'referral': return { icon:'👥', bg:isDark?C.gndk:C.gnb };
      case 'promo': return { icon:'🎁', bg:isDark?'#1a1500':C.ambBg };
      default: return { icon:'🔔', bg:T.bg3 };
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[h.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <TouchableOpacity style={[h.back, { backgroundColor:T.bg3 }]} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize:rs(20,24), color:T.t2 }}>←</Text>
        </TouchableOpacity>
        <Text style={[h.title, { color:T.t1 }]}>Bildirishnomalar</Text>
        {notifs.some(n => !n.read)
          ? <TouchableOpacity onPress={markAllRead}><Text style={{ fontSize:F.sm, color:C.p, fontWeight:'700' }}>O'qildi</Text></TouchableOpacity>
          : <View style={{ width:rs(50,60) }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:S.xxl }}>
        {notifs.length === 0 ? (
          <View style={{ alignItems:'center', paddingVertical:rs(60,80) }}>
            <Text style={{ fontSize:rs(52,64), marginBottom:S.md }}>🔔</Text>
            <Text style={{ fontSize:F.xl, fontWeight:'800', color:T.t2 }}>Bildirishnoma yo'q</Text>
          </View>
        ) : notifs.map(n => {
          const m = meta(n.type);
          return (
            <TouchableOpacity key={n.id}
              style={[ns.card, { backgroundColor:n.read?T.card:(isDark?'#1a1200':'#FFF8E8'), borderColor:n.read?T.bd:C.amber }]}
              onPress={() => markRead(n.id)} activeOpacity={0.88}
            >
              <View style={[ns.icon, { backgroundColor:m.bg }]}>
                <Text style={{ fontSize:rs(20,24) }}>{m.icon}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={[ns.title, { color:T.t1 }]}>{n.title}</Text>
                <Text style={[ns.body, { color:T.t3 }]}>{n.body}</Text>
                <Text style={[ns.time, { color:T.t4 }]}>{fmtDate(n.createdAt)}</Text>
              </View>
              {!n.read && <View style={[ns.unread, { backgroundColor:C.p }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
const ns = StyleSheet.create({
  card: { flexDirection:'row', alignItems:'flex-start', gap:S.md, marginHorizontal:S.lg, marginTop:S.sm, borderWidth:1, borderRadius:R.lg, padding:S.md },
  icon: { width:rs(44,54), height:rs(44,54), borderRadius:rs(14,18), alignItems:'center', justifyContent:'center' },
  title: { fontSize:F.md, fontWeight:'700', marginBottom:4 },
  body: { fontSize:F.sm, fontWeight:'500', lineHeight:rs(18,22) },
  time: { fontSize:F.xs, fontWeight:'600', marginTop:5 },
  unread: { width:rs(9,11), height:rs(9,11), borderRadius:rs(5,6), marginTop:5 },
});

// ════════ MANZIL ════════
export function AddressScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const SAVED = [
    { id:1, icon:'🏠', label:'Uy', addr:"Chilonzor, Navruz ko'chasi 12, kv 45" },
    { id:2, icon:'💼', label:'Ish', addr:'Yunusobod, Amir Temur 67, 3-qavat' },
    { id:3, icon:'❤️', label:'Onam', addr:"Mirzo Ulug'bek, Bog'ishamol 24" },
  ];

  const useGps = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ruxsat rad etildi', 'Joylashuvga ruxsat bering: Sozlamalar > Ilova > Joylashuv');
        setGpsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const parts = [geo.district, geo.street, geo.streetNumber].filter(Boolean);
      const formatted = geo.city ? `${geo.city}${parts.length ? ', ' + parts.join(', ') : ''}` : `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`;
      setAddress(formatted);
      Alert.alert('Aniqlandi!', formatted);
    } catch {
      Alert.alert('Xato', "GPS aniqlanmadi. Qo'lda kiriting.");
    } finally {
      setGpsLoading(false);
    }
  };

  const onSave = async () => {
    if (!address.trim()) { Alert.alert('Xato', 'Manzilni kiriting'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateUser({ address: address.trim() });
    setSaving(false);
    Alert.alert('✅', 'Manzil saqlandi!', [{ text:'OK', onPress:() => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <Header navigation={navigation} title="Manzil o'zgartirish" T={T} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding:S.lg, paddingBottom:S.xxl }}>
        {/* GPS tugma */}
        <TouchableOpacity
          style={[as.gpsBtn, { backgroundColor: gpsLoading ? C.p2 : C.p }]}
          onPress={useGps}
          disabled={gpsLoading}
          activeOpacity={0.88}
        >
          {gpsLoading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={{ fontSize: rs(20, 24) }}>📍</Text>}
          <Text style={as.gpsTxt}>{gpsLoading ? 'Aniqlanmoqda...' : 'Joriy joylashuvni aniqlash'}</Text>
        </TouchableOpacity>

        {/* Qo'lda kiritish */}
        <Text style={[as.lbl, { color:T.t1 }]}>Yoki qo'lda kiriting</Text>
        <View style={[as.inputWrap, { backgroundColor:T.bg2, borderColor:T.bd }]}>
          <Text style={{ fontSize:rs(18,22) }}>📍</Text>
          <TextInput
            style={[as.input, { color:T.t1 }]}
            value={address} onChangeText={setAddress}
            placeholder="Mas: Chilonzor, Navruz 12, kv 5" placeholderTextColor={T.t4}
            multiline
          />
        </View>

        {/* Saqlangan manzillar */}
        <Text style={[as.lbl, { color:T.t1 }]}>Saqlangan manzillar</Text>
        {SAVED.map(a => (
          <TouchableOpacity key={a.id}
            style={[as.addrCard, { backgroundColor:T.card, borderColor:address===a.addr?C.p:T.bd }]}
            onPress={() => setAddress(a.addr)} activeOpacity={0.85}
          >
            <View style={[as.addrIcon, { backgroundColor:isDark?'#2a1400':C.plt }]}>
              <Text style={{ fontSize:rs(20,24) }}>{a.icon}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={[as.addrLbl, { color:T.t1 }]}>{a.label}</Text>
              <Text style={[as.addrTxt, { color:T.t3 }]}>{a.addr}</Text>
            </View>
            {address===a.addr && <Text style={{ fontSize:rs(18,22), color:C.gn }}>✓</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[as.saveBtn, { backgroundColor:address.trim()?C.p:T.bg3 }]}
          onPress={onSave} disabled={!address.trim()||saving} activeOpacity={0.87}
        >
          <Text style={[as.saveTxt, { color:address.trim()?'#fff':T.t4 }]}>{saving?'Saqlanmoqda...':'✅ Manzilni saqlash'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const as = StyleSheet.create({
  gpsBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:S.sm, borderRadius:R.lg, paddingVertical:rs(15,19), marginBottom:S.lg },
  gpsTxt: { color:'#fff', fontSize:F.md, fontWeight:'800' },
  lbl: { fontSize:F.sm, fontWeight:'800', marginBottom:S.sm },
  inputWrap: { flexDirection:'row', alignItems:'flex-start', gap:S.md, borderWidth:1.5, borderRadius:R.md, padding:S.md, marginBottom:S.lg, minHeight:rs(56,68) },
  input: { flex:1, fontSize:F.md, fontWeight:'600', padding:0, lineHeight:rs(21,25) },
  addrCard: { flexDirection:'row', alignItems:'center', gap:S.md, borderWidth:1.5, borderRadius:R.lg, padding:S.md, marginBottom:S.sm },
  addrIcon: { width:rs(44,54), height:rs(44,54), borderRadius:rs(14,18), alignItems:'center', justifyContent:'center' },
  addrLbl: { fontSize:F.md, fontWeight:'700' },
  addrTxt: { fontSize:F.sm, fontWeight:'600', marginTop:2 },
  saveBtn: { borderRadius:R.lg, paddingVertical:rs(16,20), alignItems:'center', marginTop:S.lg },
  saveTxt: { fontSize:F.lg, fontWeight:'900' },
});

// ════════ TO'LOV KARTALARI ════════
export function CardsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <Header navigation={navigation} title="To'lov kartalari" T={T} />
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:S.xxl }}>
        <Text style={{ fontSize:rs(56,68), marginBottom:S.md }}>💳</Text>
        <Text style={{ fontSize:F.xl, fontWeight:'800', color:T.t2, marginBottom:S.sm }}>Karta qo'shilmagan</Text>
        <Text style={{ fontSize:F.md, color:T.t4, textAlign:'center', lineHeight:rs(20,24) }}>
          Bank kartangizni biriktirib{'\n'}tez to'lov qiling
        </Text>
        <TouchableOpacity
          style={{ flexDirection:'row', alignItems:'center', gap:S.sm, marginTop:S.lg, backgroundColor:C.p, borderRadius:R.lg, paddingVertical:rs(14,18), paddingHorizontal:rs(28,36) }}
          onPress={() => Alert.alert('Karta qo\'shish', 'Payme va Click integratsiyasi tez orada!')}
        >
          <Text style={{ fontSize:rs(18,22) }}>➕</Text>
          <Text style={{ color:'#fff', fontWeight:'800', fontSize:F.md }}>Karta qo'shish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ════════ DO'STLARNI TAKLIF ════════
export function ReferralScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const code = 'DARROV' + (Math.floor(Math.random()*9000)+1000);
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <Header navigation={navigation} title="Do'stlarni taklif qilish" T={T} />
      <ScrollView contentContainerStyle={{ padding:S.lg }}>
        <View style={[rf.hero, { backgroundColor:isDark?C.gndk:C.gnb, borderColor:C.gn }]}>
          <Text style={{ fontSize:rs(56,68) }}>🎁</Text>
          <Text style={[rf.heroTitle, { color:T.t1 }]}>Do'st taklif qiling</Text>
          <Text style={[rf.heroSub, { color:T.t3 }]}>Har bir do'st uchun +3 coin!</Text>
        </View>
        <Text style={[rf.lbl, { color:T.t1 }]}>Sizning kodingiz</Text>
        <View style={[rf.codeBox, { backgroundColor:T.bg2, borderColor:C.p }]}>
          <Text style={[rf.code, { color:C.p }]}>{code}</Text>
          <TouchableOpacity onPress={() => Alert.alert('✅', 'Kod nusxalandi!')}>
            <Text style={{ fontSize:rs(22,26) }}>📋</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[rf.shareBtn, { backgroundColor:C.gn }]}
          onPress={() => Alert.alert('Ulashish', `Do'stingizga yuboring:\n\nDarrovGo ilovasini yuklab oling va ${code} kodini kiriting — ikkalamiz ham coin olamiz!`)}
        >
          <Text style={{ fontSize:rs(18,22) }}>📤</Text>
          <Text style={rf.shareTxt}>Do'stlarga ulashish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const rf = StyleSheet.create({
  hero: { alignItems:'center', borderWidth:2, borderRadius:R.xl, padding:rs(24,30), marginBottom:S.lg },
  heroTitle: { fontSize:rs(20,24), fontWeight:'900', marginTop:S.sm },
  heroSub: { fontSize:F.md, fontWeight:'600', marginTop:S.xs },
  lbl: { fontSize:F.sm, fontWeight:'800', marginBottom:S.sm },
  codeBox: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:2, borderStyle:'dashed', borderRadius:R.md, padding:S.lg, marginBottom:S.lg },
  code: { fontSize:rs(24,29), fontWeight:'900', letterSpacing:2 },
  shareBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:S.sm, borderRadius:R.lg, paddingVertical:rs(16,20) },
  shareTxt: { color:'#fff', fontSize:F.lg, fontWeight:'900' },
});

// ════════ KUZATISH (TRACKING) ════════
export function TrackingScreen({ navigation, route }: any) {
  const { T, isDark } = useThemeStore();
  const { addCoins, incrementStreak } = useAuthStore();
  const cart = useCartStore();
  const fromCart = route.params?.fromCart;

  React.useEffect(() => {
    if (fromCart) {
      const earned = cart.earnCoins();
      addCoins(earned);
      incrementStreak();
      cart.clearCart();
    }
  }, []);

  const STEPS = [
    { icon:'✓', label:'Qabul qilindi', done:true },
    { icon:'👨‍🍳', label:'Tayyorlanmoqda', done:true },
    { icon:'🛵', label:"Yo'lda", done:false, active:true },
    { icon:'🏠', label:'Yetkazildi', done:false },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <Header navigation={navigation} title="Buyurtma kuzatish" T={T} />
      <ScrollView contentContainerStyle={{ padding:S.lg }}>
        <View style={[tr.etaCard, { backgroundColor:C.p }]}>
          <Text style={tr.etaLbl}>Taxminiy yetkazish</Text>
          <Text style={tr.etaTime}>~25 daqiqa</Text>
          <Text style={tr.etaSub}>Kuryer yo'lda</Text>
        </View>

        <View style={[tr.steps, { backgroundColor:T.card, borderColor:T.bd }]}>
          {STEPS.map((st, i) => (
            <View key={i} style={tr.step}>
              <View style={tr.stepLeft}>
                <View style={[
                  tr.stepDot,
                  st.done ? { backgroundColor:C.gn }
                  : st.active ? { backgroundColor:C.p }
                  : { backgroundColor:T.bg3, borderWidth:1.5, borderColor:T.bd },
                ]}>
                  <Text style={{ fontSize:rs(14,17) }}>{st.icon}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[tr.stepLine, { backgroundColor:st.done?C.gn:T.bg3 }]} />
                )}
              </View>
              <View style={{ flex:1, paddingBottom:S.lg }}>
                <Text style={[tr.stepLbl, { color:st.done||st.active?T.t1:T.t3 }]}>{st.label}</Text>
                {st.active && <Text style={[tr.stepActive, { color:C.p }]}>Hozir</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={[tr.courierCard, { backgroundColor:T.card, borderColor:T.bd }]}>
          <View style={[tr.courierAv, { backgroundColor:isDark?'#2a1400':C.plt }]}>
            <Text style={{ fontSize:rs(24,29) }}>🛵</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={[tr.courierName, { color:T.t1 }]}>Bobur R.</Text>
            <Text style={[tr.courierMeta, { color:T.t3 }]}>⭐ 4.9 · Kuryer</Text>
          </View>
          <TouchableOpacity style={[tr.callBtn, { backgroundColor:C.gn }]} onPress={() => Alert.alert('📞', 'Qo\'ng\'iroq qilinmoqda...')}>
            <Text style={{ fontSize:rs(20,24) }}>📞</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[tr.homeBtn, { backgroundColor:T.bg3 }]}
          onPress={() => navigation.navigate('MBosh')}
        >
          <Text style={[tr.homeTxt, { color:T.t2 }]}>Bosh sahifaga qaytish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const tr = StyleSheet.create({
  etaCard: { borderRadius:R.xl, padding:rs(24,30), alignItems:'center', marginBottom:S.lg },
  etaLbl: { fontSize:F.sm, color:'rgba(255,255,255,0.8)', fontWeight:'600' },
  etaTime: { fontSize:rs(40,48), fontWeight:'900', color:'#fff', marginVertical:4 },
  etaSub: { fontSize:F.sm, color:'rgba(255,255,255,0.85)', fontWeight:'600' },
  steps: { borderWidth:1, borderRadius:R.lg, padding:S.lg, marginBottom:S.lg },
  step: { flexDirection:'row', gap:S.md },
  stepLeft: { alignItems:'center' },
  stepDot: { width:rs(36,44), height:rs(36,44), borderRadius:rs(18,22), alignItems:'center', justifyContent:'center' },
  stepLine: { width:2.5, flex:1, marginVertical:4, minHeight:rs(20,26) },
  stepLbl: { fontSize:F.md, fontWeight:'700', paddingTop:rs(8,11) },
  stepActive: { fontSize:F.xs, fontWeight:'700', marginTop:2 },
  courierCard: { flexDirection:'row', alignItems:'center', gap:S.md, borderWidth:1, borderRadius:R.lg, padding:S.md, marginBottom:S.md },
  courierAv: { width:rs(48,58), height:rs(48,58), borderRadius:rs(16,20), alignItems:'center', justifyContent:'center' },
  courierName: { fontSize:F.lg, fontWeight:'800' },
  courierMeta: { fontSize:F.sm, fontWeight:'600', marginTop:2 },
  callBtn: { width:rs(44,54), height:rs(44,54), borderRadius:rs(14,18), alignItems:'center', justifyContent:'center' },
  homeBtn: { borderRadius:R.lg, paddingVertical:rs(14,18), alignItems:'center' },
  homeTxt: { fontSize:F.md, fontWeight:'700' },
});

// ════════ BUYURTMALAR (mijoz) ════════
export function CustomerOrdersScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { myOrders, activeOrder } = useOrderStore();
  const all = activeOrder ? [activeOrder, ...myOrders] : myOrders;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[h.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <Text style={[{ fontSize:rs(20,24), fontWeight:'900' }, { color:T.t1 }]}>Buyurtmalar</Text>
      </View>
      {all.length === 0 ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:S.xxl }}>
          <Text style={{ fontSize:rs(56,68), marginBottom:S.md }}>📋</Text>
          <Text style={{ fontSize:F.xl, fontWeight:'800', color:T.t2, marginBottom:S.sm }}>Buyurtma yo'q</Text>
          <Text style={{ fontSize:F.md, color:T.t4, textAlign:'center' }}>Birinchi buyurtmangizni bering!</Text>
          <TouchableOpacity
            style={{ marginTop:S.lg, backgroundColor:C.p, borderRadius:R.lg, paddingVertical:rs(14,18), paddingHorizontal:rs(28,36) }}
            onPress={() => navigation.navigate('MBosh')}
          >
            <Text style={{ color:'#fff', fontWeight:'800', fontSize:F.md }}>Restoranlar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding:S.lg }}>
          {all.map(o => (
            <TouchableOpacity key={o.id}
              style={[od.card, { backgroundColor:T.card, borderColor:T.bd }]}
              onPress={() => navigation.navigate('Tracking')}
            >
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:S.sm }}>
                <Text style={[od.rest, { color:T.t1 }]}>{o.restName}</Text>
                <Text style={[od.num, { color:T.t3 }]}>#{o.orderNumber}</Text>
              </View>
              <Text style={[od.items, { color:T.t3 }]}>{o.items}</Text>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:S.sm, paddingTop:S.sm, borderTopWidth:0.5, borderTopColor:T.bd }}>
                <Text style={[od.total, { color:C.p }]}>{fmtPrice(o.total)}</Text>
                <Text style={[od.status, { color:C.amber }]}>Yo'lda</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const od = StyleSheet.create({
  card: { borderWidth:1, borderRadius:R.lg, padding:S.md, marginBottom:S.md },
  rest: { fontSize:F.lg, fontWeight:'800' },
  num: { fontSize:F.xs, fontWeight:'700' },
  items: { fontSize:F.sm, fontWeight:'500' },
  total: { fontSize:F.md, fontWeight:'900' },
  status: { fontSize:F.sm, fontWeight:'700' },
});
