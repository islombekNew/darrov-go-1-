import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs } from '../../theme';
import { useAuthStore, useThemeStore, useNotifStore } from '../../store';
import { getLevelByCoins } from '../../constants';
import { CoinIcon } from '../../components/CoinIcon';

export function CustomerProfileScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifStore();

  const coins = user?.coins ?? 0;
  const level = getLevelByCoins(coins);

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  const soon = (name: string) => Alert.alert(name, 'Bu bo\'lim tez orada qo\'shiladi!');

  const GROUPS = [
    [
      { icon:'📍', label:"Manzil o'zgartirish", bg:C.p, go:() => navigation.navigate('Address') },
      { icon:'💳', label:"To'lov kartalari", bg:'#2b6cb0', go:() => navigation.navigate('Cards') },
      { icon:'❤️', label:'Sevimlilar', bg:C.rd, go:() => soon('Sevimlilar') },
      { icon:'🏷', label:'Promo kodlar', bg:C.amber, go:() => soon('Promo kodlar') },
    ],
    [
      { icon:'👥', label:"Do'stlarni taklif qilish", bg:C.gn, go:() => navigation.navigate('Referral') },
      { icon:'📋', label:'Buyurtmalar tarixi', bg:'#555', go:() => soon('Buyurtmalar tarixi') },
    ],
    [
      { icon:'❓', label:'Yordam', bg:'#3b82f6', go:() => soon('Yordam') },
      { icon:'ℹ️', label:'Ilova haqida', bg:'#64748b', go:() => Alert.alert('DarrovGo v2.0', "Tez, qulay va mazali ovqat yetkazib berish ilovasi.\n\n© 2026 DarrovGo") },
    ],
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[s.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[s.hdrTitle, { color: T.t1 }]}>Sahifam</Text>
        <TouchableOpacity style={[s.bellBtn, { backgroundColor: T.bg3 }]} onPress={() => navigation.navigate('Notifications')}>
          <Text style={{ fontSize: rs(18, 22) }}>🔔</Text>
          {unreadCount > 0 && <View style={[s.bellBadge, { backgroundColor: C.p }]}><Text style={s.bellBadgeTxt}>{unreadCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: S.xxl }}>
        {/* Profil top */}
        <View style={[s.profTop, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
          <View style={[s.avatar, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <Text style={{ fontSize: rs(34, 42) }}>👤</Text>
          </View>
          <Text style={[s.name, { color: T.t1 }]}>{user?.name || 'Foydalanuvchi'}</Text>
          <Text style={[s.phone, { color: T.t3 }]}>+{user?.phone}</Text>
          {user?.regionName && <Text style={[s.region, { color: T.t4 }]}>📍 {user.regionName}</Text>}

          <TouchableOpacity
            style={[s.coinRow, { backgroundColor: isDark ? level.bgColor : C.ambBg, borderColor: level.color }]}
            onPress={() => navigation.navigate('Marra')}
          >
            <CoinIcon level={level.level} size={rs(20, 24)} />
            <Text style={[s.coinNum, { color: level.color }]}>{coins} coin</Text>
            <Text style={[s.coinLvl, { color: level.color }]}>{level.level}-daraja · {level.name}</Text>
            <Text style={{ fontSize: rs(14, 17), color: level.color }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Statistika */}
        <View style={[s.statsRow, { borderBottomColor: T.bd }]}>
          {[
            { n: '0', l: 'Buyurtma', c: C.p },
            { n: coins.toString(), l: 'Coin', c: C.amber },
            { n: (user?.streak ?? 0).toString(), l: 'Streak', c: C.gn },
          ].map((st, i) => (
            <View key={i} style={[s.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: T.bd }]}>
              <Text style={[s.statN, { color: st.c }]}>{st.n}</Text>
              <Text style={[s.statL, { color: T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Menu guruhlar */}
        {GROUPS.map((grp, gi) => (
          <View key={gi} style={[s.menuGrp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
            {grp.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[s.menuRow, ii < grp.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}
                onPress={item.go}
                activeOpacity={0.7}
              >
                <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: rs(17, 21) }}>{item.icon}</Text>
                </View>
                <Text style={[s.menuLbl, { color: T.t1 }]}>{item.label}</Text>
                <Text style={[s.menuArr, { color: T.t4 }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sozlamalar */}
        <View style={[s.menuGrp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
          <View style={[s.menuRow, { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}>
            <View style={[s.menuIcon, { backgroundColor: isDark ? '#1a1a2a' : '#e0e0ff' }]}>
              <Text style={{ fontSize: rs(17, 21) }}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <Text style={[s.menuLbl, { color: T.t1, flex: 1 }]}>{isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}</Text>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ false: T.bg4, true: C.p }} thumbColor="#fff" />
          </View>
          <TouchableOpacity style={s.menuRow} onPress={() => soon('Til')}>
            <View style={[s.menuIcon, { backgroundColor: '#1a3a5c' }]}>
              <Text style={{ fontSize: rs(17, 21) }}>🌐</Text>
            </View>
            <Text style={[s.menuLbl, { color: T.t1 }]}>Ilova tili</Text>
            <Text style={[s.menuVal, { color: T.t3 }]}>O'zbekcha</Text>
            <Text style={[s.menuArr, { color: T.t4 }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Chiqish */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: isDark ? C.rddk : C.rdb, borderColor: C.rd }]}
          onPress={handleLogout}
          activeOpacity={0.87}
        >
          <Text style={{ fontSize: rs(18, 22) }}>🚪</Text>
          <Text style={[s.logoutTxt, { color: C.rd }]}>Tizimdan chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, paddingBottom: S.md, borderBottomWidth: 1 },
  hdrTitle: { fontSize: rs(20, 24), fontWeight: '900' },
  bellBtn: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellBadge: { position: 'absolute', top: 5, right: 5, width: rs(14, 18), height: rs(14, 18), borderRadius: rs(7, 9), alignItems: 'center', justifyContent: 'center' },
  bellBadgeTxt: { fontSize: rs(9, 11), fontWeight: '900', color: '#fff' },

  profTop: { alignItems: 'center', paddingVertical: S.xl, paddingHorizontal: S.lg, borderBottomWidth: 1 },
  avatar: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(40, 48), borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  name: { fontSize: rs(20, 25), fontWeight: '900' },
  phone: { fontSize: F.md, fontWeight: '600', marginTop: 4 },
  region: { fontSize: F.sm, fontWeight: '600', marginTop: 3 },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.md, borderWidth: 1.5, borderRadius: R.full, paddingVertical: S.sm, paddingHorizontal: S.md },
  coinNum: { fontSize: F.lg, fontWeight: '900' },
  coinLvl: { fontSize: F.sm, fontWeight: '700' },

  statsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  statItem: { flex: 1, paddingVertical: rs(16, 20), alignItems: 'center' },
  statN: { fontSize: rs(22, 27), fontWeight: '900' },
  statL: { fontSize: F.xs, fontWeight: '700', marginTop: 3, textTransform: 'uppercase' },

  menuGrp: { marginHorizontal: S.lg, marginTop: S.md, borderWidth: 1, borderRadius: R.lg, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md },
  menuIcon: { width: rs(38, 46), height: rs(38, 46), borderRadius: rs(12, 15), alignItems: 'center', justifyContent: 'center' },
  menuLbl: { flex: 1, fontSize: F.md, fontWeight: '700' },
  menuVal: { fontSize: F.sm, fontWeight: '600' },
  menuArr: { fontSize: rs(18, 22) },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.lg, borderWidth: 1.5, borderRadius: R.lg, paddingVertical: S.md },
  logoutTxt: { fontSize: F.lg, fontWeight: '900' },
});
