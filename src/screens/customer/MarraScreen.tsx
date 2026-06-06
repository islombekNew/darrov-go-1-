import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs } from '../../theme';
import { useAuthStore, useThemeStore } from '../../store';
import { getLevelByCoins, getNextLevel, getLevelProgress, LEVELS } from '../../constants';
import { CoinIcon } from '../../components/CoinIcon';
import { IcArrowLeft, IcMotorbike, IcRestaurant, IcReferral, IcGift, IcCheck, IcCrown } from '../../components/Icons';

export function MarraScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();

  const coins = user?.coins ?? 0;
  const level = getLevelByCoins(coins);
  const nextLvl = getNextLevel(coins);
  const progress = getLevelProgress(coins);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: T.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[s.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[s.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(20, 24)} />
        </TouchableOpacity>
        <Text style={[s.hdrTitle, { color: T.t1 }]}>Coinlar va Darajalar</Text>
        <View style={{ width: rs(40, 50) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: S.xxl }}>
        {/* DARAJA HERO */}
        <View style={[s.hero, { backgroundColor: isDark ? level.bgColor : C.ambBg, borderColor: level.color }]}>
          <CoinIcon level={level.level} size={rs(48, 58)} />
          <Text style={[s.heroLevel, { color: level.color }]}>
            {level.level}-daraja · {level.name}
          </Text>
          <Text style={[s.heroCoins, { color: T.t1 }]}>{coins}</Text>
          <Text style={[s.heroLbl, { color: level.color }]}>coin</Text>

          {nextLvl ? (
            <View style={s.progWrap}>
              <View style={[s.progBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]}>
                <View style={[s.progFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: level.color }]} />
              </View>
              <Text style={[s.progTxt, { color: isDark ? 'rgba(255,255,255,0.65)' : '#7A5500' }]}>
                {nextLvl.level}-darajaga {nextLvl.minCoins - coins} coin qoldi
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.xs, marginTop: S.sm }}>
              <IcCrown color={level.color} size={rs(18, 22)} />
              <Text style={[s.progTxt, { color: level.color }]}>Eng yuqori daraja — Legends!</Text>
            </View>
          )}
        </View>

        {/* COIN QANDAY TOPISH */}
        <View style={[s.section, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[s.secTitle, { color: T.t1 }]}>Coin qanday topiladi?</Text>
          {[
            { ic: <IcMotorbike color={C.p} size={rs(22,26)} />, title:"60 000+ so'm buyurtma", sub:'Har bunday buyurtma uchun', coin:5, color:C.p },
            { ic: <IcRestaurant color={C.amber} size={rs(22,26)} />, title:"60 000 so'mdan kam", sub:'Kichik buyurtmalar uchun', coin:3, color:C.amber },
            { ic: <IcReferral color={C.gn} size={rs(22,26)} />, title:"Do'st taklif qilish", sub:'Har bir do\'st uchun', coin:3, color:C.gn },
            { ic: <IcGift color={C.pu} size={rs(22,26)} />, title:"Ro'yxatdan o'tish", sub:'Bir martalik bonus', coin:5, color:C.pu },
          ].map((item, i) => (
            <View key={i} style={[s.coinRow, i < 3 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}>
              <View style={[s.coinIcon, { backgroundColor: isDark ? '#1a1000' : C.ambBg }]}>
                {item.ic}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.coinTitle, { color: T.t1 }]}>{item.title}</Text>
                <Text style={[s.coinSub, { color: T.t3 }]}>{item.sub}</Text>
              </View>
              <View style={[s.coinBadge, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: item.color }]}>
                <Text style={{ fontSize: F.xs, fontWeight: '900', color: item.color }}>+{item.coin}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 15 DARAJA JADVALI */}
        <Text style={[s.listTitle, { color: T.t1 }]}>Barcha darajalar</Text>
        {LEVELS.map(lvl => (
          <View key={lvl.level} style={[
            s.lvlRow,
            { backgroundColor: T.card, borderColor: coins >= lvl.minCoins && lvl.level === level.level ? lvl.color : T.bd },
            lvl.level === level.level && { borderWidth: 2 },
          ]}>
            <View style={[s.lvlIconBox, { backgroundColor: isDark ? lvl.bgColor : '#fff3e0' }]}>
              <CoinIcon level={lvl.level} size={rs(22, 27)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.lvlName, { color: lvl.level === level.level ? lvl.color : T.t1 }]}>
                {lvl.level}-daraja · {lvl.name}
              </Text>
              <Text style={[s.lvlCoins, { color: T.t3 }]}>
                {lvl.minCoins}–{lvl.maxCoins === 99999 ? '∞' : lvl.maxCoins} coin
              </Text>
            </View>
            {lvl.level === level.level && (
              <View style={[s.curBadge, { backgroundColor: lvl.bgColor, borderColor: lvl.color }]}>
                <Text style={{ fontSize: F.xs, fontWeight: '800', color: lvl.color }}>Hozir</Text>
              </View>
            )}
            {coins >= lvl.minCoins && lvl.level < level.level && (
              <IcCheck color={C.gn} size={rs(18, 22)} />
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  back: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  hdrTitle: { fontSize: rs(16, 20), fontWeight: '800' },

  hero: { margin: S.lg, borderRadius: R.xl, padding: rs(24, 30), alignItems: 'center', borderWidth: 2 },
  heroLevel: { fontSize: F.sm, fontWeight: '700', marginTop: S.sm, marginBottom: S.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroCoins: { fontSize: rs(52, 64), fontWeight: '900', lineHeight: rs(58, 72) },
  heroLbl: { fontSize: F.lg, fontWeight: '700' },
  progWrap: { width: '100%', marginTop: S.md },
  progBg: { height: rs(6, 8), borderRadius: R.full, overflow: 'hidden', marginBottom: S.xs },
  progFill: { height: '100%', borderRadius: R.full },
  progTxt: { fontSize: F.xs, fontWeight: '600', textAlign: 'center' },

  section: { marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, padding: S.md, borderWidth: 1 },
  secTitle: { fontSize: F.lg, fontWeight: '800', marginBottom: S.md },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm },
  coinIcon: { width: rs(44, 54), height: rs(44, 54), borderRadius: rs(14, 18), alignItems: 'center', justifyContent: 'center' },
  coinTitle: { fontSize: F.md, fontWeight: '700' },
  coinSub: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  coinBadge: { borderWidth: 1.5, borderRadius: R.sm, paddingVertical: 5, paddingHorizontal: S.sm },

  listTitle: { fontSize: F.lg, fontWeight: '800', paddingHorizontal: S.lg, marginTop: S.lg, marginBottom: S.md },
  lvlRow: { marginHorizontal: S.lg, marginBottom: S.xs, borderWidth: 1, borderRadius: R.md, padding: S.md, flexDirection: 'row', alignItems: 'center', gap: S.sm },
  lvlIconBox: { width: rs(48, 58), height: rs(48, 58), borderRadius: rs(14, 18), alignItems: 'center', justifyContent: 'center' },
  lvlName: { fontSize: F.md, fontWeight: '700' },
  lvlCoins: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  curBadge: { borderWidth: 1.5, borderRadius: R.sm, paddingVertical: 3, paddingHorizontal: S.sm },
});
