import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, Switch, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { C, S, R, F, rs, fmtDate, fmtPrice } from '../../theme';
import { useThemeStore, useNotifStore, useAuthStore, useCartStore, useOrderStore } from '../../store';
import { api } from '../../api/client';
import {
  IcBell, IcMoon, IcSun, IcGlobe, IcCard, IcQuestion, IcInfo, IcChevron,
  IcArrowLeft, IcTarget, IcPin, IcHouse, IcBuilding, IcFloor, IcEntrance,
  IcComment, IcCheck, IcOnline, IcCoin, IcTruck, IcRestaurant, IcGift,
  IcReferral, IcTrophy, IcTime, IcMotorbike, IcPhone, IcShare, IcCopy, IcPromo, IcOrders,
} from '../../components/Icons';

// ════════ HEADER (umumiy) ════════
function Header({ navigation, title, T }: any) {
  return (
    <View style={[h.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
      <TouchableOpacity style={[h.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
        <IcArrowLeft color={T.t2} size={rs(20, 24)} />
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
    const sz = rs(22, 27);
    switch (type) {
      case 'coin_earned':    return { ic: <IcCoin color={C.gold} size={sz} />, bg: isDark?'#2a1500':C.ambBg };
      case 'order_accepted': return { ic: <IcCheck color={C.gn} size={sz} />, bg: isDark?C.gndk:C.gnb };
      case 'order_ready':    return { ic: <IcRestaurant color={C.p} size={sz} />, bg: isDark?'#2a1400':C.plt };
      case 'order_delivered':return { ic: <IcTruck color={C.gn} size={sz} />, bg: isDark?C.gndk:C.gnb };
      case 'level_up':       return { ic: <IcTrophy color="#9C27B0" size={sz} />, bg: isDark?C.pubDk:C.pub };
      case 'referral':       return { ic: <IcReferral color={C.gn} size={sz} />, bg: isDark?C.gndk:C.gnb };
      case 'promo':          return { ic: <IcGift color={C.gold} size={sz} />, bg: isDark?'#1a1500':C.ambBg };
      default:               return { ic: <IcBell color={T.t2} size={sz} />, bg: T.bg3 };
    }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[h.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <TouchableOpacity style={[h.back, { backgroundColor:T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(20, 24)} />
        </TouchableOpacity>
        <Text style={[h.title, { color:T.t1 }]}>Bildirishnomalar</Text>
        {notifs.some(n => !n.read)
          ? <TouchableOpacity onPress={markAllRead}><Text style={{ fontSize:F.sm, color:C.p, fontWeight:'700' }}>O'qildi</Text></TouchableOpacity>
          : <View style={{ width:rs(50,60) }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:S.xxl }}>
        {notifs.length === 0 ? (
          <View style={{ alignItems:'center', paddingVertical:rs(60,80) }}>
            <View style={{ marginBottom: S.md }}><IcBell color={T.t4} size={rs(56, 68)} /></View>
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
                {m.ic}
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
  const { user, updateUser, token } = useAuthStore();
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [floor, setFloor] = useState(user?.floor || '');
  const [apartment, setApartment] = useState(user?.apartment || '');
  const [entrance, setEntrance] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (user?.address) {
      setStreet(user.address);
    }
  }, []);

  const useGps = async () => {
    setGpsLoading(true);
    setGpsAccuracy(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ruxsat rad etildi', 'Joylashuvga ruxsat bering: Sozlamalar > Ilova > Joylashuv');
        return;
      }

      // 1-qadam: tez aniqlash
      const rough = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 2-qadam: to'liq aniqlik (uy raqamigacha)
      const precise = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setGpsAccuracy(Math.round(precise.coords.accuracy ?? 99));

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: precise.coords.latitude,
        longitude: precise.coords.longitude,
      });

      // Ko'cha nomini ajratib olish
      const streetName = geo.street || geo.name || '';
      const hn = geo.streetNumber || '';

      setStreet(
        [geo.district || geo.subregion, streetName]
          .filter(Boolean).join(', ')
      );
      if (hn) setHouseNumber(hn);

    } catch (e: any) {
      Alert.alert('GPS xatosi', "Qurilma GPS'sini yoqing va qayta urining.");
    } finally {
      setGpsLoading(false);
    }
  };

  const fullAddress = [
    street.trim(),
    houseNumber ? `uy ${houseNumber}` : '',
    floor ? `${floor}-qavat` : '',
    apartment ? `kv. ${apartment}` : '',
    entrance ? `${entrance}-kirish` : '',
    comment.trim(),
  ].filter(Boolean).join(', ');

  const onSave = async () => {
    if (!street.trim()) { Alert.alert('Xato', "Ko'cha yoki mahallani kiriting"); return; }
    setSaving(true);
    try {
      await api.patch('/users/me', { address: fullAddress, floor, apartment }, token);
      updateUser({ address: fullAddress, floor, apartment });
      Alert.alert('Saqlandi', 'Manzil muvaffaqiyatli saqlandi', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    { label: "Ko'cha / mahalla", value: street, onChange: setStreet, placeholder: "Mas: Chilonzor, Navruz ko'chasi", icon: <IcPin color={C.p} size={rs(16, 20)} />, keyboardType: 'default' as const },
    { label: 'Uy raqami', value: houseNumber, onChange: setHouseNumber, placeholder: 'Mas: 12A', icon: <IcHouse color={C.p} size={rs(16, 20)} />, keyboardType: 'default' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <Header navigation={navigation} title="Yetkazish manzili" T={T} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>

        {/* GPS tugma */}
        <TouchableOpacity
          style={[as.gpsBtn, { backgroundColor: gpsLoading ? C.p2 : C.p }]}
          onPress={useGps} disabled={gpsLoading} activeOpacity={0.88}
        >
          {gpsLoading
            ? <ActivityIndicator color="#fff" size="small" />
            : <IcTarget color="#fff" size={rs(20, 24)} />}
          <Text style={as.gpsTxt}>{gpsLoading ? 'Aniqlanmoqda...' : 'GPS bilan aniqlash'}</Text>
        </TouchableOpacity>

        {/* GPS aniqlik ko'rsatkichi */}
        {gpsAccuracy !== null && (() => {
          const acc = gpsAccuracy as number;
          const good = acc < 15;
          return (
          <View style={[as.accuracyBadge, { backgroundColor: good ? C.gnb : C.ambBg, borderColor: good ? C.gn : C.amber }]}>
            <IcOnline color={good ? C.gn : C.amber} size={rs(14, 17)} />
            <Text style={{ fontSize: F.xs, fontWeight: '800', color: good ? C.gn : C.amber }}>
              GPS aniqlik: ±{acc}m {good ? '(Yaxshi)' : '(O\'rtacha)'}
            </Text>
          </View>
          );
        })()}

        {/* Ko'cha va uy raqami */}
        {FIELDS.map((f, i) => (
          <View key={i}>
            <Text style={[as.lbl, { color: T.t1 }]}>{f.label}</Text>
            <View style={[as.inputWrap, { backgroundColor: T.bg2, borderColor: f.value ? C.p : T.bd }]}>
              <View style={as.inputIcon}>{f.icon}</View>
              <TextInput
                style={[as.input, { color: T.t1 }]}
                value={f.value} onChangeText={f.onChange}
                placeholder={f.placeholder} placeholderTextColor={T.t4}
                keyboardType={f.keyboardType}
              />
            </View>
          </View>
        ))}

        {/* Qavat, Xonadon, Kirish */}
        <Text style={[as.lbl, { color: T.t1 }]}>Batafsil</Text>
        <View style={{ flexDirection: 'row', gap: S.sm }}>
          {[
            { label: 'Qavat', val: floor, set: setFloor, ph: '3', icon: <IcFloor color={T.t3} size={rs(14, 17)} /> },
            { label: 'Xonadon', val: apartment, set: setApartment, ph: '45', icon: <IcBuilding color={T.t3} size={rs(14, 17)} /> },
            { label: 'Kirish', val: entrance, set: setEntrance, ph: '2', icon: <IcEntrance color={T.t3} size={rs(14, 17)} /> },
          ].map((f, i) => (
            <View key={i} style={{ flex: 1 }}>
              <Text style={[as.sublbl, { color: T.t3 }]}>{f.label}</Text>
              <View style={[as.smallWrap, { backgroundColor: T.bg2, borderColor: T.bd }]}>
                {f.icon}
                <TextInput
                  style={[as.smallInp, { color: T.t1 }]}
                  value={f.val} onChangeText={f.set}
                  placeholder={f.ph} placeholderTextColor={T.t4}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Kuryerga izoh */}
        <Text style={[as.lbl, { color: T.t1, marginTop: S.sm }]}>Kuryerga izoh</Text>
        <View style={[as.inputWrap, { backgroundColor: T.bg2, borderColor: T.bd }]}>
          <View style={as.inputIcon}><IcComment color={T.t3} size={rs(16, 20)} /></View>
          <TextInput
            style={[as.input, { color: T.t1 }]}
            value={comment} onChangeText={setComment}
            placeholder="Mas: Qora eshik, interkom: 45..." placeholderTextColor={T.t4}
          />
        </View>

        {/* To'liq manzil */}
        {fullAddress ? (
          <View style={[as.preview, { backgroundColor: isDark ? '#1a1200' : C.ambBg, borderColor: C.amber }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.xs }}>
              <IcPin color={C.amber} size={rs(14, 17)} />
              <Text style={{ fontSize: F.xs, fontWeight: '800', color: C.amber }}>Kuryer ko'radigan manzil</Text>
            </View>
            <Text style={{ fontSize: F.sm, fontWeight: '700', color: T.t1 }}>{fullAddress}</Text>
          </View>
        ) : null}

        {/* Saqlash */}
        <TouchableOpacity
          style={[as.saveBtn, { backgroundColor: street.trim() ? C.p : T.bg3 }]}
          onPress={onSave} disabled={!street.trim() || saving} activeOpacity={0.87}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <>
              <IcCheck color={street.trim() ? '#fff' : T.t4} size={rs(18, 22)} />
              <Text style={[as.saveTxt, { color: street.trim() ? '#fff' : T.t4 }]}>Manzilni saqlash</Text>
            </>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const as = StyleSheet.create({
  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, borderRadius: R.lg, paddingVertical: rs(15, 19), marginBottom: S.sm },
  gpsTxt: { color: '#fff', fontSize: F.md, fontWeight: '800' },
  accuracyBadge: { flexDirection: 'row', alignItems: 'center', gap: S.xs, borderWidth: 1, borderRadius: R.md, padding: S.sm, marginBottom: S.md },
  lbl: { fontSize: F.sm, fontWeight: '800', marginBottom: S.xs, marginTop: S.sm },
  sublbl: { fontSize: F.xs, fontWeight: '700', marginBottom: S.xs, textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: R.md, marginBottom: S.sm, minHeight: rs(52, 64), paddingRight: S.md },
  inputIcon: { width: rs(48, 58), alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: F.md, fontWeight: '600', padding: 0 },
  smallWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: R.md, height: rs(50, 62), paddingHorizontal: S.sm },
  smallInp: { flex: 1, fontSize: F.md, fontWeight: '700', textAlign: 'center', padding: 0 },
  preview: { borderWidth: 1.5, borderRadius: R.md, padding: S.md, marginBottom: S.md, marginTop: S.xs },
  addrCard: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderWidth: 1.5, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  addrIcon: { width: rs(44, 54), height: rs(44, 54), borderRadius: rs(14, 18), alignItems: 'center', justifyContent: 'center' },
  addrLbl: { fontSize: F.md, fontWeight: '700' },
  addrTxt: { fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  saveBtn: { flexDirection: 'row', gap: S.sm, borderRadius: R.lg, paddingVertical: rs(16, 20), alignItems: 'center', justifyContent: 'center', marginTop: S.lg },
  saveTxt: { fontSize: F.lg, fontWeight: '900' },
});

// ════════ TO'LOV KARTALARI ════════
export function CardsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pan, setPan] = useState('');
  const [expiry, setExpiry] = useState('');
  const [holder, setHolder] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCards = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<any[]>('/cards', token);
      setCards(data);
    } catch (e: any) { Alert.alert('Xato', e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadCards(); }, [loadCards]);

  const onRefresh = async () => { setRefreshing(true); await loadCards(); setRefreshing(false); };

  const formatPan = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const addCard = async () => {
    const rawPan = pan.replace(/\s/g, '');
    if (rawPan.length < 16) { Alert.alert('Xato', '16 ta raqam kiriting'); return; }
    if (expiry.length < 5) { Alert.alert('Xato', "Amal qilish muddatini kiriting (OO/YY)"); return; }
    setSaving(true);
    try {
      const card = await api.post<any>('/cards', { pan: rawPan, expiry, holder }, token);
      setCards(prev => [card, ...prev]);
      setModalVisible(false);
      setPan(''); setExpiry(''); setHolder('');
    } catch (e: any) { Alert.alert('Xato', e.message); }
    finally { setSaving(false); }
  };

  const setDefault = async (id: string) => {
    try {
      await api.patch(`/cards/${id}/default`, {}, token);
      setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    } catch (e: any) { Alert.alert('Xato', e.message); }
  };

  const deleteCard = (id: string) => {
    Alert.alert("O'chirish", "Kartani o'chirmoqchimisiz?", [
      { text: 'Bekor', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/cards/${id}`, token);
          setCards(prev => prev.filter(c => c.id !== id));
        } catch (e: any) { Alert.alert('Xato', e.message); }
      }},
    ]);
  };

  const CARD_COLORS = ['#FF6B1A', '#7C4DFF', '#1DB954', '#378ADD', '#F4A228'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <Header navigation={navigation} title="To'lov kartalari" T={T} />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.p} />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />}
          contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}
        >
          {cards.map((card, i) => (
            <View key={card.id} style={[cd.card, { backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.lg }}>
                <IcCard color="rgba(255,255,255,0.8)" size={rs(28, 34)} />
                {card.isDefault && (
                  <View style={cd.defaultBadge}>
                    <Text style={{ color: '#fff', fontSize: rs(10, 12), fontWeight: '800' }}>ASOSIY</Text>
                  </View>
                )}
              </View>
              <Text style={cd.pan}>{card.pan}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: S.sm }}>
                <Text style={cd.expiry}>{card.expiry}</Text>
                {card.holder ? <Text style={cd.holder}>{card.holder.toUpperCase()}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.md }}>
                {!card.isDefault && (
                  <TouchableOpacity style={cd.actionBtn} onPress={() => setDefault(card.id)}>
                    <Text style={cd.actionTxt}>Asosiy qilish</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[cd.actionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => deleteCard(card.id)}>
                  <Text style={[cd.actionTxt, { color: '#ffcccc' }]}>O'chirish</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {cards.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: rs(40, 50) }}>
              <IcCard color={T.t4} size={rs(48, 60)} />
              <Text style={{ fontSize: F.xl, fontWeight: '800', color: T.t2, marginTop: S.md, marginBottom: S.sm }}>
                Karta qo'shilmagan
              </Text>
              <Text style={{ fontSize: F.md, color: T.t4, textAlign: 'center', lineHeight: rs(20, 24) }}>
                Bank kartangizni biriktirib{'\n'}tez to'lov qiling
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[cd.addBtn, { backgroundColor: C.p }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: F.md }}>+ Karta qo'shish</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={cd.modalOverlay}>
          <View style={[cd.modalBox, { backgroundColor: T.card }]}>
            <Text style={[cd.modalTitle, { color: T.t1 }]}>Yangi karta</Text>
            <Text style={[cd.modalLabel, { color: T.t3 }]}>Karta raqami</Text>
            <TextInput
              style={[cd.inp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={pan} onChangeText={t => setPan(formatPan(t))}
              placeholder="0000 0000 0000 0000" placeholderTextColor={T.t4}
              keyboardType="numeric" maxLength={19}
            />
            <Text style={[cd.modalLabel, { color: T.t3 }]}>Amal qilish muddati</Text>
            <TextInput
              style={[cd.inp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={expiry} onChangeText={t => setExpiry(formatExpiry(t))}
              placeholder="OO/YY" placeholderTextColor={T.t4}
              keyboardType="numeric" maxLength={5}
            />
            <Text style={[cd.modalLabel, { color: T.t3 }]}>Karta egasi (ixtiyoriy)</Text>
            <TextInput
              style={[cd.inp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={holder} onChangeText={setHolder}
              placeholder="ISM FAMILIYA" placeholderTextColor={T.t4}
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.sm }}>
              <TouchableOpacity style={[cd.modalBtn, { backgroundColor: T.bg3, flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: T.t2, fontWeight: '700', textAlign: 'center' }}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[cd.modalBtn, { backgroundColor: C.p, flex: 1 }]} onPress={addCard} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Saqlash</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const cd = StyleSheet.create({
  card: { borderRadius: R.xl, padding: S.lg, marginBottom: S.md },
  pan: { fontSize: rs(18, 22), fontWeight: '900', color: '#fff', letterSpacing: 2 },
  expiry: { fontSize: F.md, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  holder: { fontSize: F.sm, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  defaultBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: R.full, paddingHorizontal: S.sm, paddingVertical: 3 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: R.md, paddingVertical: S.xs, paddingHorizontal: S.sm },
  actionTxt: { color: '#fff', fontWeight: '800', fontSize: F.xs },
  addBtn: { borderRadius: R.lg, paddingVertical: rs(14, 18), alignItems: 'center', marginTop: S.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.xl, paddingBottom: S.xxl },
  modalTitle: { fontSize: F.xl, fontWeight: '900', marginBottom: S.md, textAlign: 'center' },
  modalLabel: { fontSize: F.xs, fontWeight: '800', marginBottom: 4, marginTop: S.xs },
  inp: { borderWidth: 1.5, borderRadius: R.md, paddingHorizontal: S.md, height: rs(50, 60), fontSize: F.md, fontWeight: '700', marginBottom: S.sm },
  modalBtn: { borderRadius: R.lg, paddingVertical: rs(14, 17) },
});

// ════════ DO'STLARNI TAKLIF ════════
export function ReferralScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const code = user?.referralCode ? user.referralCode.toUpperCase().slice(0, 10) : 'DARROV';
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <Header navigation={navigation} title="Do'stlarni taklif qilish" T={T} />
      <ScrollView contentContainerStyle={{ padding:S.lg }}>
        <View style={[rf.hero, { backgroundColor:isDark?C.gndk:C.gnb, borderColor:C.gn }]}>
          <IcGift color={C.gn} size={rs(56, 68)} />
          <Text style={[rf.heroTitle, { color:T.t1 }]}>Do'st taklif qiling</Text>
          <Text style={[rf.heroSub, { color:T.t3 }]}>Har bir do'st uchun +3 coin!</Text>
        </View>
        <Text style={[rf.lbl, { color:T.t1 }]}>Sizning kodingiz</Text>
        <View style={[rf.codeBox, { backgroundColor:T.bg2, borderColor:C.p }]}>
          <Text style={[rf.code, { color:C.p }]}>{code}</Text>
          <TouchableOpacity onPress={() => Alert.alert('✅', 'Kod nusxalandi!')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IcCopy color={C.p} size={rs(22, 26)} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[rf.shareBtn, { backgroundColor:C.gn }]}
          onPress={() => Alert.alert('Ulashish', `Do'stingizga yuboring:\n\nDarrovGo ilovasini yuklab oling va ${code} kodini kiriting — ikkalamiz ham coin olamiz!`)}
        >
          <IcShare color="#fff" size={rs(18, 22)} />
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
    { label:'Qabul qilindi',   done:true,  active:false, ic: (c:string) => <IcCheck color={c} size={rs(16,20)} /> },
    { label:'Tayyorlanmoqda',  done:true,  active:false, ic: (c:string) => <IcRestaurant color={c} size={rs(16,20)} /> },
    { label:"Yo'lda",          done:false, active:true,  ic: (c:string) => <IcMotorbike color={c} size={rs(16,20)} /> },
    { label:'Yetkazildi',      done:false, active:false, ic: (c:string) => <IcHouse color={c} size={rs(16,20)} /> },
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
                  {st.ic(st.done ? '#fff' : st.active ? '#fff' : T.t3)}
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
            <IcMotorbike color={C.p} size={rs(26, 32)} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={[tr.courierName, { color:T.t1 }]}>Kuryer yo'lda</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <IcOnline color={C.gn} size={rs(12, 15)} />
              <Text style={[tr.courierMeta, { color:C.gn }]}>Online</Text>
            </View>
          </View>
          <TouchableOpacity style={[tr.callBtn, { backgroundColor:C.gn }]} onPress={() => Alert.alert('Qo\'ng\'iroq', 'Tez orada kuryer ma\'lumotlari ko\'rsatiladi')}>
            <IcPhone color="#fff" size={rs(20, 24)} />
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
const STATUS_COLOR_M: Record<string, string> = {
  delivered: C.gn, on_the_way: C.p, preparing: C.amber,
  pending: C.amber, cancelled: C.rd, accepted: C.p, ready: C.gn,
};
const STATUS_UZ_M: Record<string, string> = {
  delivered: 'Yetkazildi', on_the_way: "Yo'lda", preparing: 'Tayyorlanmoqda',
  pending: 'Kutilmoqda', cancelled: 'Bekor', accepted: 'Qabul qilindi', ready: 'Tayyor',
};
export function CustomerOrdersScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get<any[]>('/users/me/orders', token);
      setOrders(data);
    } catch {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  const onRefresh = async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <View style={[h.hdr, { backgroundColor:T.hdrBg, borderBottomColor:T.bd }]}>
        <Text style={[{ fontSize:rs(20,24), fontWeight:'900' }, { color:T.t1 }]}>Buyurtmalar</Text>
      </View>
      {loading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size="large" color={C.p} />
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:S.xxl }}>
          <IcOrders color={T.t4} size={rs(56, 68)} />
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
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.p} />}
          contentContainerStyle={{ padding:S.lg, paddingBottom:S.xxl }}
        >
          {orders.map(o => {
            const statusLow = (o.status ?? '').toLowerCase();
            return (
              <TouchableOpacity key={o.id}
                style={[od.card, { backgroundColor:T.card, borderColor:T.bd }]}
                onPress={() => {
                  if (['accepted','preparing','ready','on_the_way'].includes(statusLow))
                    navigation.navigate('Tracking', { orderId: o.id });
                }}
              >
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:S.sm }}>
                  <Text style={[od.rest, { color:T.t1 }]}>{o.restaurant?.name ?? '—'}</Text>
                  <Text style={[od.num, { color:T.t3 }]}>#{o.orderNumber}</Text>
                </View>
                <Text style={[od.items, { color:T.t3 }]} numberOfLines={1}>
                  {Array.isArray(o.items) ? o.items.map((i:any)=>`${i.name} x${i.quantity}`).join(', ') : ''}
                </Text>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:S.sm, paddingTop:S.sm, borderTopWidth:0.5, borderTopColor:T.bd }}>
                  <Text style={[od.total, { color:C.p }]}>{fmtPrice(o.total)}</Text>
                  <View style={{ backgroundColor:(STATUS_COLOR_M[statusLow]||C.amber)+'22', borderRadius:R.full, paddingHorizontal:S.sm, paddingVertical:2 }}>
                    <Text style={[od.status, { color:STATUS_COLOR_M[statusLow]||C.amber }]}>{STATUS_UZ_M[statusLow]||o.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const od = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  rest: { fontSize: F.lg, fontWeight: '800' },
  num: { fontSize: F.xs, fontWeight: '700' },
  items: { fontSize: F.sm, fontWeight: '500' },
  total: { fontSize: F.md, fontWeight: '900' },
  status: { fontSize: F.sm, fontWeight: '700' },
});

// ════════ ILOVA HAQIDA ════════
export function AppInfoScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <Header navigation={navigation} title="Ilova haqida" T={T} />
      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', paddingVertical: S.xl }}>
          <View style={{ width: rs(90, 110), height: rs(90, 110), borderRadius: rs(22, 27), overflow: 'hidden', marginBottom: S.md }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: C.p, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: rs(36, 44), fontWeight: '900', color: '#fff' }}>DG</Text>
            </View>
          </View>
          <Text style={{ fontSize: rs(24, 30), fontWeight: '900', color: T.t1 }}>DarrovGo</Text>
          <Text style={{ fontSize: F.sm, color: T.t3, fontWeight: '600', marginTop: 4 }}>v2.0.0 · Play Store</Text>
        </View>

        {/* Tavsif */}
        <View style={[ai.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[ai.cardTitle, { color: T.t1 }]}>Ilova haqida</Text>
          <Text style={[ai.cardTxt, { color: T.t2 }]}>
            DarrovGo — O'zbekistondagi eng tez va qulay ovqat yetkazib berish ilovasi.
            Mahalliy restoranlardan mazali taomlar buyurtma qiling, real vaqtda kuzating.
          </Text>
        </View>

        {/* Imkoniyatlar */}
        <View style={[ai.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[ai.cardTitle, { color: T.t1 }]}>Imkoniyatlar</Text>
          {[
            '🍽 100+ restoran — har xil taomlar',
            '⚡ 30-45 daqiqada yetkazib berish',
            '🤖 Darrov AI — shaxsiy tavsiyalar',
            '🪙 Coin tizimi — buyurtmadan bonus',
            '📍 Real vaqt kuzatuv',
            '🌙 Tungi va kunduzgi rejim',
          ].map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: S.sm, marginBottom: S.sm }}>
              <Text style={{ fontSize: F.md }}>{f.slice(0, 2)}</Text>
              <Text style={[{ fontSize: F.sm, fontWeight: '600', color: T.t2, flex: 1 }]}>{f.slice(2).trim()}</Text>
            </View>
          ))}
        </View>

        {/* Aloqa */}
        <View style={[ai.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[ai.cardTitle, { color: T.t1 }]}>Aloqa</Text>
          {[
            { label: 'Email', val: 'support@darrovgo.uz' },
            { label: 'Telegram', val: '@darrovgo' },
            { label: 'Veb-sayt', val: 'darrovgo.uz' },
          ].map((c, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: S.xs }}>
              <Text style={[{ fontSize: F.sm, fontWeight: '700', color: T.t3 }]}>{c.label}</Text>
              <Text style={[{ fontSize: F.sm, fontWeight: '700', color: C.p }]}>{c.val}</Text>
            </View>
          ))}
        </View>

        <Text style={{ textAlign: 'center', fontSize: F.xs, color: T.t4, marginTop: S.lg, fontWeight: '600' }}>
          © 2026 DarrovGo. Barcha huquqlar himoyalangan.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const ai = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  cardTitle: { fontSize: F.lg, fontWeight: '900', marginBottom: S.md },
  cardTxt: { fontSize: F.sm, fontWeight: '500', lineHeight: rs(20, 24) },
});

// ════════ SOZLAMALAR ════════
export function SettingsScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { notifs } = useNotifStore();

  const [notifSound, setNotifSound] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  const ToggleRow = ({ label, desc, val, onToggle, icon: Icon, iconBg }: any) => (
    <View style={[st.row, { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}>
      <View style={[st.rowIcon, { backgroundColor: iconBg }]}>
        <Icon color="#fff" size={rs(17, 21)} />
      </View>
      <View style={{ flex: 1, marginRight: S.sm }}>
        <Text style={[st.rowLabel, { color: T.t1 }]}>{label}</Text>
        {desc && <Text style={[st.rowDesc, { color: T.t3 }]}>{desc}</Text>}
      </View>
      <Switch
        value={val}
        onValueChange={onToggle}
        trackColor={{ false: T.bg4, true: C.p }}
        thumbColor="#fff"
      />
    </View>
  );

  const LinkRow = ({ label, val, nav, icon: Icon, iconBg }: any) => (
    <TouchableOpacity
      style={[st.row, { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}
      onPress={() => nav ? navigation.navigate(nav) : Alert.alert(label, 'Tez orada qo\'shiladi!')}
      activeOpacity={0.7}
    >
      <View style={[st.rowIcon, { backgroundColor: iconBg }]}>
        <Icon color="#fff" size={rs(17, 21)} />
      </View>
      <Text style={[st.rowLabel, { color: T.t1, flex: 1 }]}>{label}</Text>
      {val && <Text style={[st.rowVal, { color: T.t3 }]}>{val}</Text>}
      <IcChevron color={T.t4} size={rs(15, 18)} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[h.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[h.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: rs(20, 24), color: T.t2 }}>←</Text>
        </TouchableOpacity>
        <Text style={[h.title, { color: T.t1 }]}>Sozlamalar</Text>
        <View style={{ width: rs(40, 50) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: S.md, paddingBottom: S.xxl }}>

        {/* Ko'rinish */}
        <Text style={[st.sectionTitle, { color: T.t3 }]}>KO'RINISH</Text>
        <View style={[st.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <View style={[st.row]}>
            <View style={[st.rowIcon, { backgroundColor: isDark ? '#1a1a2a' : '#e0e0ff' }]}>
              {isDark
                ? <IcMoon color="#aaf" size={rs(17, 21)} />
                : <IcSun color="#f90" size={rs(17, 21)} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.rowLabel, { color: T.t1 }]}>{isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}</Text>
              <Text style={[st.rowDesc, { color: T.t3 }]}>Ekran yorqinligini sozlang</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: T.bg4, true: C.p }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Til */}
        <Text style={[st.sectionTitle, { color: T.t3 }]}>TIL</Text>
        <View style={[st.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <LinkRow label="Ilova tili" val="O'zbekcha" icon={IcGlobe} iconBg="#1a3a5c" nav={null} />
        </View>

        {/* Bildirishnomalar */}
        <Text style={[st.sectionTitle, { color: T.t3 }]}>BILDIRISHNOMALAR</Text>
        <View style={[st.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <ToggleRow
            label="Push bildirishnomalar"
            desc="Buyurtma holati haqida"
            val={notifPush}
            onToggle={setNotifPush}
            icon={IcBell}
            iconBg={C.p}
          />
          <ToggleRow
            label="Ovozli signal"
            desc="Yangi bildirishnomada ovoz"
            val={notifSound}
            onToggle={setNotifSound}
            icon={IcBell}
            iconBg="#2b6cb0"
          />
          <View style={[st.row]}>
            <View style={[st.rowIcon, { backgroundColor: C.amber }]}>
              <IcBell color="#fff" size={rs(17, 21)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.rowLabel, { color: T.t1 }]}>Aksiya va chegirmalar</Text>
              <Text style={[st.rowDesc, { color: T.t3 }]}>Maxsus takliflar haqida</Text>
            </View>
            <Switch
              value={notifPromo}
              onValueChange={setNotifPromo}
              trackColor={{ false: T.bg4, true: C.amber }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Hisob */}
        <Text style={[st.sectionTitle, { color: T.t3 }]}>HISOB</Text>
        <View style={[st.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <LinkRow label="To'lov usullari" icon={IcCard} iconBg="#2b6cb0" nav="Cards" />
          <LinkRow label="Yetkazib berish manzili" icon={IcInfo} iconBg={C.p} nav="Address" />
        </View>

        {/* Yordam */}
        <Text style={[st.sectionTitle, { color: T.t3 }]}>YORDAM</Text>
        <View style={[st.card, { backgroundColor: T.card, borderColor: T.bd }]}>
          <LinkRow label="Ko'p so'raladigan savollar" icon={IcQuestion} iconBg="#3b82f6" nav={null} />
          <LinkRow label="Ilova haqida" icon={IcInfo} iconBg="#64748b" nav="AppInfo" />
        </View>

        <Text style={{ textAlign: 'center', fontSize: F.xs, color: T.t4, marginTop: S.md, fontWeight: '600' }}>
          DarrovGo v2.0.0 · © 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  sectionTitle: { fontSize: F.xs, fontWeight: '800', letterSpacing: 0.8, marginTop: S.lg, marginBottom: S.xs, marginLeft: S.xs },
  card: { borderRadius: R.lg, borderWidth: 1, overflow: 'hidden', marginBottom: S.xs },
  row: { flexDirection: 'row', alignItems: 'center', padding: S.md, gap: S.sm },
  rowIcon: { width: rs(36, 44), height: rs(36, 44), borderRadius: rs(11, 14), alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: F.md, fontWeight: '700' },
  rowDesc: { fontSize: F.xs, fontWeight: '500', marginTop: 2 },
  rowVal: { fontSize: F.sm, fontWeight: '600', marginRight: S.xs },
});
