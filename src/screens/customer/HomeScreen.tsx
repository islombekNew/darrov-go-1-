import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { CATEGORIES, getLevelByCoins } from '../../constants';
import { useAuthStore, useCartStore, useOrderStore, useNotifStore, useThemeStore } from '../../store';
import { api } from '../../api/client';
import {
  IcPin, IcSearch, IcMoon, IcSun, IcNotifBell, IcRobot, IcRating, IcTime, IcMotorbike, IcRestaurant,
  IcCatAll, IcCatMilli, IcCatFastFood, IcCatPizza, IcCatBurger, IcCatSushi, IcCatSoglom, IcCatIchimlik,
  IcCoin, IcWallet, IcMedal, IcTrophy, IcDiamond, IcCrown, IcCart,
} from '../../components/Icons';

const CAT_ICONS: Record<string, React.ReactNode> = {};
const getCatIcon = (id: string, color: string, size: number) => {
  const p = { color, size };
  switch (id) {
    case 'all':       return <IcCatAll {...p} />;
    case 'milliy':    return <IcCatMilli {...p} />;
    case 'fastfood':  return <IcCatFastFood {...p} />;
    case 'pizza':     return <IcCatPizza {...p} />;
    case 'burger':    return <IcCatBurger {...p} />;
    case 'sushi':     return <IcCatSushi {...p} />;
    case 'soglom':    return <IcCatSoglom {...p} />;
    case 'ichimlik':  return <IcCatIchimlik {...p} />;
    default:          return <IcCatAll {...p} />;
  }
};

const getLevelIcon = (icon: string, color: string, size: number) => {
  const p = { color, size };
  switch (icon) {
    case '🪙': return <IcCoin {...p} />;
    case '👝': return <IcWallet {...p} />;
    case '🧰': return <IcMedal {...p} />;
    case '💰': return <IcTrophy {...p} />;
    case '💎': return <IcDiamond {...p} />;
    case '👑': return <IcCrown {...p} />;
    default:   return <IcCoin {...p} />;
  }
};

export function CustomerHomeScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, token } = useAuthStore();
  const cart = useCartStore();
  const { activeOrder } = useOrderStore();
  const { unreadCount } = useNotifStore();
  const [cat, setCat] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loadingRests, setLoadingRests] = useState(true);

  const coins = user?.coins ?? 0;
  const level = getLevelByCoins(coins);
  const cartCnt = cart.count();

  const filtered = cat === 'all' ? restaurants : restaurants.filter(r => r.category === cat);

  const loadRestaurants = useCallback(async () => {
    try {
      const data = await api.get<any[]>('/restaurants', token);
      setRestaurants(data);
    } catch {}
    finally { setLoadingRests(false); }
  }, [token]);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  const onRefresh = async () => { setRefreshing(true); await loadRestaurants(); setRefreshing(false); };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: T.bg }]} edges={['top']}>
      {/* HEADER */}
      <View style={[s.header, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={s.hdrTop}>
          <TouchableOpacity onPress={() => navigation.navigate('Address')} style={{ flex: 1 }}>
            <View style={[s.locSub, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <IcPin color={C.p} size={rs(12, 15)} />
              <Text style={[{ fontSize: F.xs, fontWeight: '700', color: T.t3 }]}>Joylashuv</Text>
            </View>
            <View style={s.locRow}>
              <Text style={[s.locCity, { color: T.t1 }]} numberOfLines={1}>
                {user?.address || 'Manzilni tanlang'}
              </Text>
              <Text style={{ fontSize: rs(12, 15), color: T.t3 }}> ▾</Text>
            </View>
          </TouchableOpacity>
          <View style={s.hdrRight}>
            <TouchableOpacity
              style={[s.coinChip, { backgroundColor: isDark ? level.bgColor : C.ambBg, borderColor: C.gold }]}
              onPress={() => navigation.navigate('Marra')}
            >
              {getLevelIcon(level.icon, isDark ? C.gold : '#7A5500', rs(14, 17))}
              <Text style={[s.coinTxt, { color: isDark ? C.gold : '#7A5500' }]}>{coins}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.bg3 }]} onPress={() => navigation.navigate('Notifications')}>
              <IcNotifBell color={T.t2} size={rs(20, 24)} hasUnread={unreadCount > 0} />
              {unreadCount > 0 && <View style={[s.badge, { backgroundColor: C.rd }]}><Text style={s.badgeTxt}>{unreadCount}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: T.bg3 }]} onPress={toggle}>
              {isDark ? <IcSun color={T.t2} size={rs(18, 22)} /> : <IcMoon color={T.t2} size={rs(18, 22)} />}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={[s.search, { backgroundColor: isDark ? T.bg3 : '#fff' }]} activeOpacity={0.9}>
          <IcSearch color={T.t4} size={rs(16, 20)} />
          <Text style={[s.searchHint, { color: T.t4 }]}>Restoran yoki taom izlang...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCnt > 0 ? rs(90, 110) : rs(20, 30) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.p]} tintColor={C.p} />}
      >
        {/* FAOL BUYURTMA */}
        {activeOrder && (
          <TouchableOpacity
            style={[s.activeOrder, { backgroundColor: T.card, borderColor: C.p }]}
            onPress={() => navigation.navigate('Tracking')}
            activeOpacity={0.9}
          >
            <View style={s.aoTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
                <View style={[s.ping, { backgroundColor: C.p }]} />
                <Text style={[s.aoLbl, { color: C.pdk }]}>FAOL BUYURTMA</Text>
              </View>
              <Text style={{ fontSize: F.xs, color: T.t3, fontWeight: '700' }}>#{activeOrder.orderNumber}</Text>
            </View>
            <Text style={[s.aoRest, { color: T.t1 }]}>{activeOrder.restName}</Text>
            <View style={s.aoBottom}>
              <Text style={[s.aoEta, { color: C.p }]}>~25 daqiqa</Text>
              <Text style={{ fontSize: F.sm, fontWeight: '700', color: C.p }}>Kuzatish →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* PROMO */}
        <View style={[s.promo, { backgroundColor: isDark ? '#2a1000' : C.p, borderColor: isDark ? C.p + '44' : 'transparent' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.promoTitle, { color: '#fff' }]}>Birinchi buyurtmaga</Text>
            <Text style={[s.promoSub, { color: 'rgba(255,255,255,0.8)' }]}>Promo: YANGI20 — 20% chegirma</Text>
          </View>
          <View style={[s.promoChip, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
            <Text style={[s.promoPct, { color: '#fff' }]}>20%</Text>
          </View>
        </View>

        {/* KATEGORIYALAR */}
        <Text style={[s.secTitle, { color: T.t1 }]}>Kategoriyalar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.lg, gap: rs(8, 12) }}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.id} style={s.catItem} onPress={() => setCat(c.id)} activeOpacity={0.85}>
              <View style={[
                s.catIcon,
                { backgroundColor: cat === c.id ? (isDark ? '#2a1400' : C.plt) : T.bg3 },
                cat === c.id && { borderColor: C.p, borderWidth: 2 },
              ]}>
                {getCatIcon(c.id, cat === c.id ? C.p : T.t3, rs(26, 32))}
              </View>
              <Text style={[s.catLbl, { color: cat === c.id ? C.p : T.t3 }, cat === c.id && { fontWeight: '900' }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RESTORANLAR */}
        <Text style={[s.secTitle, { color: T.t1 }]}>
          {loadingRests ? 'Yuklanmoqda...' : `${filtered.length} ta restoran`}
        </Text>
        {loadingRests && (
          <View style={{ alignItems: 'center', paddingVertical: rs(30, 40) }}>
            <ActivityIndicator size="large" color={C.p} />
          </View>
        )}
        {!loadingRests && filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: rs(30, 40) }}>
            <IcRestaurant color={T.t4} size={rs(48, 60)} />
            <Text style={{ fontSize: F.md, fontWeight: '700', color: T.t3, marginTop: S.sm }}>Restoranlar topilmadi</Text>
          </View>
        )}
        {filtered.map(rest => (
          <TouchableOpacity
            key={rest.id}
            style={[s.restCard, { backgroundColor: T.card, borderColor: T.bd }]}
            onPress={() => navigation.navigate('Menu', { restId: rest.id })}
            activeOpacity={0.9}
          >
            <View style={[s.restImg, { backgroundColor: isDark ? T.bg3 : C.plt }]}>
              {rest.category === 'milliy'
                ? <IcCatMilli color={isDark ? C.p : C.pdk} size={rs(44, 54)} />
                : <IcRestaurant color={isDark ? C.p : C.pdk} size={rs(44, 54)} />}
              {!rest.isOpen && (
                <View style={s.closedOverlay}>
                  <Text style={s.closedTxt}>Yopiq</Text>
                </View>
              )}
            </View>
            <View style={s.restInfo}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[s.restName, { color: T.t1 }]}>{rest.name}</Text>
                <View style={[s.ratingPill, { backgroundColor: isDark ? '#1a1500' : C.ambBg }]}>
                  <IcRating color={C.amber} size={rs(13, 16)} />
                  <Text style={[s.ratingTxt, { color: C.amber }]}>{(rest.rating ?? 5).toFixed(1)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: 4 }}>
                <IcTime color={T.t4} size={rs(12, 14)} />
                <Text style={[s.restMeta, { color: T.t3 }]}>{rest.deliveryTime ?? '30-45 daq'}</Text>
                <IcMotorbike color={T.t4} size={rs(12, 14)} />
                <Text style={[s.restMeta, { color: T.t3 }]}>{fmtPrice(rest.minOrder ?? 20000)}dan</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* AI BANNER */}
        <TouchableOpacity
          style={[s.aiBanner, { backgroundColor: T.bg2, borderColor: T.bd }]}
          onPress={() => navigation.navigate('AiChat')}
          activeOpacity={0.88}
        >
          <View style={[s.aiIcon, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <IcRobot color={C.p} size={rs(24, 29)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.aiTitle, { color: T.t1 }]}>Darrov AI Maslahatchi</Text>
            <Text style={[s.aiSub, { color: T.t3 }]}>Ovqat va sog'liq bo'yicha maslahat</Text>
          </View>
          <Text style={{ fontSize: rs(18, 22), color: C.p }}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SAVAT FAB */}
      {cartCnt > 0 && (
        <TouchableOpacity style={[s.cartFab, { backgroundColor: C.p }]} onPress={() => navigation.navigate('Cart')} activeOpacity={0.9}>
          <View style={s.cartBadge}>
            <IcCart color="#fff" size={rs(18, 22)} />
          </View>
          <Text style={s.cartFabLbl}>Savatni ko'rish</Text>
          <Text style={s.cartFabTotal}>{cartCnt} ta · {fmtPrice(cart.total())}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: S.lg, paddingTop: S.sm, paddingBottom: S.md, borderBottomWidth: 1 },
  hdrTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: S.md, gap: S.sm },
  locSub: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  locCity: { fontSize: F.lg, fontWeight: '800', maxWidth: rs(160, 220) },
  hdrRight: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  coinChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: R.full, paddingVertical: 5, paddingHorizontal: S.sm },
  coinTxt: { fontSize: F.sm, fontWeight: '800' },
  iconBtn: { width: rs(38, 46), height: rs(38, 46), borderRadius: rs(12, 15), alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 4, right: 4, minWidth: rs(16, 20), height: rs(16, 20), borderRadius: rs(8, 10), alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeTxt: { color: '#fff', fontSize: rs(9, 11), fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', borderRadius: R.md, paddingHorizontal: S.md, height: rs(46, 56), gap: S.sm },
  searchHint: { fontSize: F.md, fontWeight: '600' },

  activeOrder: { marginHorizontal: S.lg, marginTop: S.md, borderWidth: 2, borderRadius: R.lg, padding: S.md },
  aoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.sm },
  ping: { width: rs(7, 9), height: rs(7, 9), borderRadius: rs(4, 5) },
  aoLbl: { fontSize: F.xs, fontWeight: '900', letterSpacing: 0.5 },
  aoRest: { fontSize: F.lg, fontWeight: '800', marginBottom: S.sm },
  aoBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aoEta: { fontSize: rs(20, 24), fontWeight: '900' },

  promo: { marginHorizontal: S.lg, marginTop: S.md, borderWidth: 1, borderRadius: R.lg, padding: rs(14, 18), flexDirection: 'row', alignItems: 'center' },
  promoTitle: { fontSize: F.md, fontWeight: '800' },
  promoSub: { fontSize: F.xs, fontWeight: '600', marginTop: 3 },
  promoChip: { borderRadius: R.md, paddingVertical: rs(9, 11), paddingHorizontal: rs(14, 18) },
  promoPct: { fontSize: rs(16, 20), fontWeight: '900', color: '#5A3A00' },

  secTitle: { fontSize: rs(16, 19), fontWeight: '900', paddingHorizontal: S.lg, marginTop: S.lg, marginBottom: S.md },
  catItem: { alignItems: 'center', gap: 5, width: rs(66, 80) },
  catIcon: { width: rs(60, 72), height: rs(60, 72), borderRadius: rs(19, 23), alignItems: 'center', justifyContent: 'center' },
  catLbl: { fontSize: F.xs, fontWeight: '700', textAlign: 'center' },

  restCard: { flexDirection: 'row', marginHorizontal: S.lg, marginBottom: S.md, borderWidth: 1, borderRadius: R.lg, overflow: 'hidden' },
  restImg: { width: rs(90, 110), height: rs(90, 110), alignItems: 'center', justifyContent: 'center', position: 'relative' },
  closedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  closedTxt: { color: '#fff', fontSize: F.sm, fontWeight: '800' },
  restInfo: { flex: 1, padding: S.md, justifyContent: 'center' },
  restName: { fontSize: F.lg, fontWeight: '800', flex: 1 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 3, paddingHorizontal: S.sm, borderRadius: R.full },
  ratingTxt: { fontSize: F.xs, fontWeight: '800' },
  restMeta: { fontSize: F.xs, fontWeight: '600' },

  aiBanner: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginTop: S.sm, borderWidth: 1, borderRadius: R.lg, padding: S.md },
  aiIcon: { width: rs(48, 58), height: rs(48, 58), borderRadius: rs(16, 20), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: F.md, fontWeight: '800' },
  aiSub: { fontSize: F.xs, fontWeight: '600', marginTop: 3 },

  cartFab: { position: 'absolute', bottom: rs(18, 24), left: S.lg, right: S.lg, borderRadius: R.lg, padding: rs(14, 17), flexDirection: 'row', alignItems: 'center' },
  cartBadge: { width: rs(30, 38), height: rs(30, 38), backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: rs(15, 19), alignItems: 'center', justifyContent: 'center', marginRight: S.sm },
  cartBadgeTxt: { fontSize: F.md, fontWeight: '900', color: '#fff' },
  cartFabLbl: { flex: 1, fontSize: F.md, fontWeight: '800', color: '#fff' },
  cartFabTotal: { fontSize: F.md, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },
});
