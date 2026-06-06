import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useCartStore, useThemeStore, useAuthStore, useOrderStore } from '../../store';
import { api } from '../../api/client';
import {
  IcArrowLeft, IcRating, IcRestaurant, IcCart, IcPin, IcCoin, IcChevron,
  IcCatMilli, IcCatPizza, IcCatSushi, IcCatBurger, IcCatFastFood, IcCatSoglom,
} from '../../components/Icons';

const getCategoryBannerIcon = (cat: string, color: string) => {
  const size = rs(64, 78);
  switch ((cat ?? '').toLowerCase()) {
    case 'milliy': return <IcCatMilli color={color} size={size} />;
    case 'pizza':  return <IcCatPizza color={color} size={size} />;
    case 'burger': return <IcCatBurger color={color} size={size} />;
    case 'sushi':  return <IcCatSushi color={color} size={size} />;
    case 'fastfood': return <IcCatFastFood color={color} size={size} />;
    case "sog'lom": return <IcCatSoglom color={color} size={size} />;
    default:       return <IcRestaurant color={color} size={size} />;
  }
};

// ════════════════════════════════════════════
// MENYU
// ════════════════════════════════════════════
export function MenuScreen({ navigation, route }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const cart = useCartStore();
  const restId = route.params?.restId;
  const highlight = route.params?.highlight;
  const [rest, setRest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>(`/restaurants/${restId}`, token)
      .then(data => setRest(data))
      .catch(e => Alert.alert('Xato', e.message))
      .finally(() => setLoading(false));
  }, [restId, token]);

  const cartCnt = cart.count();

  const addItem = (item: any) => {
    const res = cart.addItem({ menuItemId: item.id, name: item.name, price: item.price }, rest.id, rest.name);
    if (res === 'conflict') {
      Alert.alert(
        'Boshqa restoran',
        `Savatda ${cart.restName} dan taomlar bor. Tozalab ${rest.name} dan boshlaysizmi?`,
        [
          { text: "Yo'q", style: 'cancel' },
          { text: 'Ha, tozalash', onPress: () => {
            cart.clearCart();
            cart.addItem({ menuItemId: item.id, name: item.name, price: item.price }, rest.id, rest.name);
          }},
        ]
      );
    }
  };

  if (loading) return (
    <SafeAreaView style={[ms.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[ms.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[ms.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(20, 24)} />
        </TouchableOpacity>
        <Text style={[ms.hdrTitle, { color: T.t1 }]}>Yuklanmoqda...</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.p} />
      </View>
    </SafeAreaView>
  );

  if (!rest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <Text style={{ color: T.t1, fontSize: F.lg }}>Restoran topilmadi</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: S.md, backgroundColor: C.p, borderRadius: R.md, padding: S.md }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>← Orqaga</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const cats = Array.from(new Set((rest.menuItems ?? []).map((m: any) => m.category)));

  return (
    <SafeAreaView style={[ms.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[ms.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[ms.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(20, 24)} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[ms.hdrTitle, { color: T.t1 }]}>{rest.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IcRating color={C.amber} size={rs(12, 14)} />
            <Text style={[ms.hdrSub, { color: T.t3 }]}>{(rest.rating ?? 5).toFixed(1)} · {rest.deliveryTime ?? '30-45 daq'}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: cartCnt > 0 ? rs(90, 110) : S.xl }}>
        {/* Banner */}
        <View style={[ms.banner, { backgroundColor: isDark ? T.bg3 : C.plt }]}>
          {getCategoryBannerIcon(rest.category, isDark ? C.p : C.pdk)}
          {rest.description ? (
            <Text style={{ fontSize: F.sm, color: T.t2, fontWeight: '600', marginTop: S.xs, textAlign: 'center', paddingHorizontal: S.lg }}>
              {rest.description}
            </Text>
          ) : null}
        </View>

        {(rest.menuItems ?? []).length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: rs(40, 50) }}>
            <Text style={{ fontSize: F.md, color: T.t3, fontWeight: '700' }}>Menyu hali qo'shilmagan</Text>
          </View>
        )}

        {cats.map(catId => {
          const items = (rest.menuItems ?? []).filter((m: any) => m.category === catId && m.available !== false);
          if (items.length === 0) return null;
          return (
            <View key={String(catId)}>
              <Text style={[ms.catTitle, { color: T.t1 }]}>{String(catId)}</Text>
              {items.map((item: any) => {
                const isHl = highlight && item.name.toLowerCase().includes(String(highlight).toLowerCase());
                return (
                  <View key={item.id} style={[
                    ms.itemCard,
                    { backgroundColor: T.card, borderColor: isHl ? C.p : T.bd },
                    isHl && { borderWidth: 2 },
                  ]}>
                    <View style={[ms.itemImg, { backgroundColor: isDark ? T.bg3 : C.plt }]}>
                      <IcRestaurant color={isDark ? C.p : C.pdk} size={rs(30, 36)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[ms.itemName, { color: T.t1 }]}>{item.name}</Text>
                      {item.description ? <Text style={[ms.itemDesc, { color: T.t3 }]} numberOfLines={2}>{item.description}</Text> : null}
                      <Text style={[ms.itemPrice, { color: C.p }]}>{fmtPrice(item.price)}</Text>
                    </View>
                    <TouchableOpacity style={[ms.addBtn, { backgroundColor: C.p }]} onPress={() => addItem(item)} activeOpacity={0.85}>
                      <Text style={ms.addBtnTxt}>+</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {cartCnt > 0 && (
        <TouchableOpacity style={[ms.cartFab, { backgroundColor: C.p }]} onPress={() => navigation.navigate('Cart')} activeOpacity={0.9}>
          <View style={ms.cartBadge}><IcCart color="#fff" size={rs(18, 22)} /></View>
          <Text style={ms.cartFabLbl}>Savatga o'tish</Text>
          <Text style={ms.cartFabTotal}>{cartCnt} ta · {fmtPrice(cart.total())}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ════════════════════════════════════════════
// SAVAT
// ════════════════════════════════════════════
export function CartScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token, user, updateUser } = useAuthStore();
  const { setActive: setActiveOrder } = useOrderStore();
  const cart = useCartStore();
  const { items } = cart;
  const [placing, setPlacing] = useState(false);
  const [comment, setComment] = useState('');

  if (items.length === 0) {
    return (
      <SafeAreaView style={[ms.safe, { backgroundColor: T.bg }]} edges={['top']}>
        <View style={[ms.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
          <TouchableOpacity style={[ms.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: rs(20, 24), color: T.t2 }}>←</Text>
          </TouchableOpacity>
          <Text style={[ms.hdrTitle, { color: T.t1 }]}>Savat</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xxl }}>
          <View style={{ marginBottom: S.md }}><IcCart color={T.t4} size={rs(64, 78)} /></View>
          <Text style={{ fontSize: F.xl, fontWeight: '800', color: T.t2, marginBottom: S.sm }}>Savat bo'sh</Text>
          <Text style={{ fontSize: F.md, color: T.t4, textAlign: 'center' }}>Mazali taomlardan tanlang!</Text>
          <TouchableOpacity style={{ marginTop: S.lg, backgroundColor: C.p, borderRadius: R.lg, paddingVertical: rs(14, 18), paddingHorizontal: rs(28, 36) }} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: F.md }}>Menyuga qaytish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const placeOrder = async () => {
    if (!token || !user) {
      Alert.alert('Xato', 'Avval tizimga kiring');
      return;
    }
    if (!user.address) {
      Alert.alert("Manzil yo'q", 'Avval manzilingizni kiriting', [
        { text: 'Bekor', style: 'cancel' },
        { text: 'Manzil kiriting', onPress: () => navigation.navigate('Address') },
      ]);
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map(i => ({
        menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity,
      }));
      const result = await api.post<any>('/orders', {
        restaurantId: cart.restId,
        items: orderItems,
        address: user.address,
        floor: user.floor,
        apartment: user.apartment,
        comment,
      }, token);

      // Update user coins in store
      if (result.coinsEarned) {
        updateUser({ coins: (user.coins ?? 0) + result.coinsEarned });
      }

      setActiveOrder({
        id: result.id,
        orderNumber: result.orderNumber,
        restId: cart.restId ?? '',
        restName: cart.restName ?? '',
        items: items.map(i => i.name).join(', '),
        subtotal: cart.subtotal(),
        deliveryFee: cart.deliveryFee,
        total: result.total,
        coinsEarned: result.coinsEarned ?? 0,
        address: user.address ?? '',
        status: 'pending',
        createdAt: new Date(),
      });

      cart.clearCart();
      navigation.navigate('Tracking', { orderId: result.id, fromCart: true });
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={[ms.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[ms.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[ms.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(20, 24)} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[ms.hdrTitle, { color: T.t1 }]}>Savat</Text>
          <Text style={[ms.hdrSub, { color: T.t3 }]}>{cart.restName}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: S.lg, paddingBottom: rs(220, 260) }}>
        {items.map(item => (
          <View key={item.menuItemId} style={[ms.cartItem, { backgroundColor: T.card, borderColor: T.bd }]}>
            <View style={{ flex: 1 }}>
              <Text style={[ms.itemName, { color: T.t1 }]}>{item.name}</Text>
              <Text style={[ms.itemPrice, { color: C.p }]}>{fmtPrice(item.price)}</Text>
            </View>
            <View style={s2.qtyRow}>
              <TouchableOpacity style={[s2.qtyBtn, { backgroundColor: T.bg3 }]} onPress={() => cart.updateQty(item.menuItemId, item.quantity - 1)}>
                <Text style={[s2.qtySign, { color: T.t1 }]}>−</Text>
              </TouchableOpacity>
              <Text style={[s2.qtyNum, { color: T.t1 }]}>{item.quantity}</Text>
              <TouchableOpacity style={[s2.qtyBtn, { backgroundColor: C.p }]} onPress={() => cart.updateQty(item.menuItemId, item.quantity + 1)}>
                <Text style={[s2.qtySign, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Manzil */}
        <TouchableOpacity
          style={[s2.addrBox, { backgroundColor: T.card, borderColor: user?.address ? T.bd : C.p }]}
          onPress={() => navigation.navigate('Address')}
        >
          <IcPin color={C.p} size={rs(20, 24)} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: F.xs, fontWeight: '700', color: T.t3 }}>Yetkazish manzili</Text>
            <Text style={{ fontSize: F.sm, fontWeight: '700', color: user?.address ? T.t1 : C.p }}>
              {user?.address ?? 'Manzil kiriting'}
            </Text>
          </View>
          <IcChevron color={T.t3} size={rs(16, 20)} />
        </TouchableOpacity>

        {/* Coin info */}
        <View style={[s2.coinInfo, { backgroundColor: isDark ? '#1a1500' : C.ambBg, borderColor: C.gold }]}>
          <IcCoin color={C.gold} size={rs(22, 26)} />
          <Text style={[s2.coinInfoTxt, { color: isDark ? C.gold : '#7A5500' }]}>
            Bu buyurtmadan +{cart.earnCoins()} coin olasiz!
          </Text>
        </View>
      </ScrollView>

      {/* Pastki summa */}
      <View style={[s2.bottom, { backgroundColor: T.hdrBg, borderTopColor: T.bd }]}>
        <View style={s2.sumRow}>
          <Text style={[s2.sumLbl, { color: T.t3 }]}>Taomlar</Text>
          <Text style={[s2.sumVal, { color: T.t2 }]}>{fmtPrice(cart.subtotal())}</Text>
        </View>
        <View style={s2.sumRow}>
          <Text style={[s2.sumLbl, { color: T.t3 }]}>Yetkazib berish</Text>
          <Text style={[s2.sumVal, { color: T.t2 }]}>{fmtPrice(cart.deliveryFee)}</Text>
        </View>
        <View style={[s2.sumRow, { marginTop: S.xs, paddingTop: S.sm, borderTopWidth: 0.5, borderTopColor: T.bd }]}>
          <Text style={[s2.totalLbl, { color: T.t1 }]}>Jami</Text>
          <Text style={[s2.totalVal, { color: C.p }]}>{fmtPrice(cart.total())}</Text>
        </View>
        <TouchableOpacity style={[s2.orderBtn, { backgroundColor: C.p, opacity: placing ? 0.7 : 1 }]} onPress={placeOrder} activeOpacity={0.88} disabled={placing}>
          {placing
            ? <ActivityIndicator color="#fff" />
            : <Text style={s2.orderBtnTxt}>Buyurtma berish</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ms = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.lg, borderBottomWidth: 1 },
  back: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  hdrTitle: { fontSize: rs(17, 21), fontWeight: '800' },
  hdrSub: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  banner: { height: rs(140, 170), alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontSize: rs(16, 19), fontWeight: '900', paddingHorizontal: S.lg, marginTop: S.lg, marginBottom: S.md },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginBottom: S.sm, borderWidth: 1, borderRadius: R.lg, padding: S.md },
  itemImg: { width: rs(60, 72), height: rs(60, 72), borderRadius: rs(16, 20), alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: F.md, fontWeight: '800' },
  itemDesc: { fontSize: F.xs, fontWeight: '500', marginTop: 2, lineHeight: rs(16, 20) },
  itemPrice: { fontSize: F.md, fontWeight: '900', marginTop: 4 },
  addBtn: { width: rs(38, 46), height: rs(38, 46), borderRadius: rs(12, 15), alignItems: 'center', justifyContent: 'center' },
  addBtnTxt: { color: '#fff', fontSize: rs(22, 27), fontWeight: '700', lineHeight: rs(26, 31) },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: S.sm, borderWidth: 1, borderRadius: R.lg, padding: S.md },
  cartFab: { position: 'absolute', bottom: rs(18, 24), left: S.lg, right: S.lg, borderRadius: R.lg, padding: rs(14, 17), flexDirection: 'row', alignItems: 'center' },
  cartBadge: { width: rs(30, 38), height: rs(30, 38), backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: rs(15, 19), alignItems: 'center', justifyContent: 'center', marginRight: S.sm },
  cartBadgeTxt: { fontSize: F.md, fontWeight: '900', color: '#fff' },
  cartFabLbl: { flex: 1, fontSize: F.md, fontWeight: '800', color: '#fff' },
  cartFabTotal: { fontSize: F.md, fontWeight: '900', color: 'rgba(255,255,255,0.9)' },
});

const s2 = StyleSheet.create({
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  qtyBtn: { width: rs(32, 40), height: rs(32, 40), borderRadius: rs(10, 13), alignItems: 'center', justifyContent: 'center' },
  qtySign: { fontSize: rs(18, 22), fontWeight: '800' },
  qtyNum: { fontSize: F.lg, fontWeight: '800', minWidth: rs(24, 30), textAlign: 'center' },
  addrBox: { flexDirection: 'row', alignItems: 'center', gap: S.sm, borderWidth: 1.5, borderRadius: R.lg, padding: S.md, marginTop: S.md, marginBottom: S.sm },
  coinInfo: { flexDirection: 'row', alignItems: 'center', gap: S.sm, borderWidth: 1.5, borderRadius: R.md, padding: S.md, marginTop: S.sm },
  coinInfoTxt: { fontSize: F.sm, fontWeight: '700', flex: 1 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.lg, borderTopWidth: 1 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sumLbl: { fontSize: F.sm, fontWeight: '600' },
  sumVal: { fontSize: F.sm, fontWeight: '700' },
  totalLbl: { fontSize: F.lg, fontWeight: '900' },
  totalVal: { fontSize: rs(20, 24), fontWeight: '900' },
  orderBtn: { borderRadius: R.lg, paddingVertical: rs(15, 19), alignItems: 'center', marginTop: S.md, minHeight: rs(52, 64), justifyContent: 'center' },
  orderBtnTxt: { color: '#fff', fontSize: F.lg, fontWeight: '900' },
});
