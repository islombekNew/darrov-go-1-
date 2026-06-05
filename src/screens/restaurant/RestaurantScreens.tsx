import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  Switch, TextInput, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useRestOrderStore, useAuthStore, RestOrder } from '../../store';
import {
  IcArrowLeft, IcPlus, IcEdit, IcTrash, IcCheck, IcX,
  IcToggleOn, IcToggleOff, IcStar, IcChart, IcLogout,
  IcSettings, IcPhone, IcInfo,
} from '../../components/Icons';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[rs2.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flex: 1 }}>
          <Text style={[rs2.name, { color: T.t1 }]}>{user?.name || 'Restoran'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.xs }}>
            <View style={[rs2.dot, { backgroundColor: isOpen ? C.gn : '#999' }]} />
            <Text style={[rs2.statusTxt, { color: isOpen ? C.gn : T.t4 }]}>
              {isOpen ? 'Ochiq' : 'Yopiq'}
            </Text>
            <Switch
              value={isOpen} onValueChange={setIsOpen}
              trackColor={{ false: T.bg4, true: C.gn }} thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg }}>
        <View style={rs2.statGrid}>
          {[
            { n: newCount.toString(), l: 'Yangi buyurtma', c: C.p },
            { n: prepCount.toString(), l: 'Tayyorlanmoqda', c: C.amber },
            { n: fmtPrice(todayRevenue), l: "Bugungi daromad", c: C.gn, wide: true },
            { n: '4.8', l: 'Reyting', c: C.gold },
          ].map((st, i) => (
            <View key={i} style={[rs2.statCard, { backgroundColor: T.card, borderColor: T.bd }, (st as any).wide && { width: '100%' }]}>
              <Text style={[rs2.statN, { color: st.c }]}>{st.n}</Text>
              <Text style={[rs2.statL, { color: T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[rs2.bigBtn, { backgroundColor: C.p }]}
          onPress={() => navigation.navigate('RBuyurtma')}
          activeOpacity={0.88}
        >
          <View style={rs2.bigBtnIcon}>
            <IcArrowLeft color="#fff" size={rs(20, 24)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={rs2.bigBtnTitle}>Buyurtmalarni boshqarish</Text>
            <Text style={rs2.bigBtnSub}>{newCount} ta yangi buyurtma kutmoqda</Text>
          </View>
          <Text style={{ fontSize: rs(18, 22), color: '#fff' }}>→</Text>
        </TouchableOpacity>

        <View style={[rs2.infoCard, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[rs2.infoTitle, { color: T.t1 }]}>Komissiya tizimi</Text>
          <Text style={[rs2.infoBody, { color: T.t3 }]}>
            Har buyurtmadan 10% komissiya avtomatik ajratiladi. Sizga 90% qoladi.
          </Text>
          <View style={rs2.infoRow}>
            <View style={[rs2.infoPill, { backgroundColor: C.gnb }]}>
              <Text style={[rs2.infoPillTxt, { color: C.gn }]}>90% Sizga</Text>
            </View>
            <View style={[rs2.infoPill, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
              <Text style={[rs2.infoPillTxt, { color: C.p }]}>10% Platforma</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const rs2 = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  name: { fontSize: rs(20, 24), fontWeight: '900' },
  dot: { width: rs(7, 9), height: rs(7, 9), borderRadius: 9 },
  statusTxt: { fontSize: F.sm, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg },
  statCard: { width: '47%', borderWidth: 1, borderRadius: R.lg, padding: S.md },
  statN: { fontSize: rs(20, 24), fontWeight: '900' },
  statL: { fontSize: F.xs, fontWeight: '600', marginTop: 4 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', gap: S.md, borderRadius: R.lg, padding: S.lg, marginBottom: S.md },
  bigBtnIcon: { width: rs(40, 48), height: rs(40, 48), borderRadius: rs(13, 16), backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  bigBtnTitle: { color: '#fff', fontSize: F.lg, fontWeight: '900' },
  bigBtnSub: { color: 'rgba(255,255,255,0.85)', fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  infoCard: { borderWidth: 1, borderRadius: R.lg, padding: S.md },
  infoTitle: { fontSize: F.md, fontWeight: '800', marginBottom: S.sm },
  infoBody: { fontSize: F.sm, fontWeight: '500', lineHeight: rs(18, 22), marginBottom: S.md },
  infoRow: { flexDirection: 'row', gap: S.sm },
  infoPill: { flex: 1, borderRadius: R.full, paddingVertical: rs(8, 10), alignItems: 'center' },
  infoPillTxt: { fontSize: F.sm, fontWeight: '800' },
});

// ════════ BUYURTMALAR ════════
type Filter = 'new' | 'preparing' | 'ready';

export function RestaurantOrdersScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { orders, acceptOrder, readyOrder, rejectOrder, tickTimers } = useRestOrderStore();
  const [filter, setFilter] = useState<Filter>('new');

  useEffect(() => {
    const iv = setInterval(tickTimers, 1000);
    return () => clearInterval(iv);
  }, []);

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

  const fmtTimer = (sec: number) => sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'new', label: 'Yangi' },
    { key: 'preparing', label: 'Tayyorlanmoqda' },
    { key: 'ready', label: 'Tayyor' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[os.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[os.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <IcArrowLeft color={T.t2} size={rs(18, 22)} />
        </TouchableOpacity>
        <Text style={[os.hdrTitle, { color: T.t1 }]}>Buyurtmalar</Text>
        <View style={[os.live, { backgroundColor: C.gn }]}>
          <Text style={os.liveTxt}>LIVE</Text>
        </View>
      </View>

      <View style={[os.filters, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key}
            style={[os.chip, { backgroundColor: T.bg3, borderColor: T.bd }, filter === f.key && { backgroundColor: C.p, borderColor: C.p }]}
            onPress={() => setFilter(f.key)} activeOpacity={0.85}
          >
            <Text style={[os.chipTxt, { color: filter === f.key ? '#fff' : T.t2 }]}>{f.label}</Text>
            {counts[f.key] > 0 && (
              <View style={[os.chipBadge, { backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : C.p }]}>
                <Text style={os.chipBadgeTxt}>{counts[f.key]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: rs(60, 80) }}>
            <Text style={{ fontSize: rs(52, 64), marginBottom: S.md }}>
              {filter === 'new' ? '📭' : filter === 'preparing' ? '👨‍🍳' : '🎁'}
            </Text>
            <Text style={{ fontSize: F.xl, fontWeight: '800', color: T.t2 }}>
              {filter === 'new' ? "Yangi buyurtma yo'q" : filter === 'preparing' ? "Tayyorlanayotgan yo'q" : "Tayyor buyurtma yo'q"}
            </Text>
          </View>
        ) : filtered.map(order => (
          <OrderCard key={order.id} order={order} isDark={isDark} T={T} fmtTimer={fmtTimer}
            onAccept={() => { acceptOrder(order.id); Alert.alert('Qabul qilindi', `#${order.orderNumber} buyurtma qabul qilindi!`); }}
            onReject={() => Alert.alert('Rad etish', `#${order.orderNumber} buyurtmani rad etasizmi?`, [
              { text: 'Bekor', style: 'cancel' },
              { text: 'Rad etish', style: 'destructive', onPress: () => rejectOrder(order.id) },
            ])}
            onReady={() => { readyOrder(order.id); Alert.alert('Tayyor!', 'Kuryer chaqirildi'); }}
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
  const sBg = isNew ? (isDark ? '#2a1400' : C.plt) : isPrep ? (isDark ? '#2a1500' : C.ambBg) : (isDark ? C.gndk : C.gnb);

  return (
    <View style={[oc.card, { backgroundColor: T.card, borderColor: isNew ? C.p : T.bd }, isNew && { borderWidth: 2 }]}>
      <View style={[oc.top, { backgroundColor: sBg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          <View style={[oc.ping, { backgroundColor: sColor }]} />
          <Text style={[oc.num, { color: sColor }]}>#{order.orderNumber}</Text>
          <Text style={[oc.status, { color: sColor }]}>
            {isNew ? 'Yangi' : isPrep ? 'Tayyorlanmoqda' : 'Tayyor'}
          </Text>
        </View>
        {isNew && (
          <View style={[oc.timer, { backgroundColor: order.timer > 60 ? C.rdb : (isDark ? '#1a0a00' : C.ambBg) }]}>
            <Text style={[oc.timerTxt, { color: order.timer > 60 ? C.rd : C.amber }]}>
              {fmtTimer(order.timer)}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: S.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.md }}>
          <View style={[oc.av, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <Text style={{ fontSize: rs(16, 20) }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[oc.client, { color: T.t1 }]}>{order.clientName}</Text>
            <Text style={[oc.addr, { color: T.t3 }]}>{order.address}</Text>
          </View>
        </View>
        <Text style={[oc.items, { color: T.t2 }]}>{order.items}</Text>
        <View style={[oc.total, { borderTopColor: T.bd }]}>
          <View>
            <Text style={[oc.totalLbl, { color: T.t3 }]}>Sizga (90%)</Text>
            <Text style={[oc.totalNum, { color: C.gn }]}>{fmtPrice(order.myShare)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[oc.totalLbl, { color: T.t3 }]}>Platforma (10%)</Text>
            <Text style={[{ fontSize: F.sm, fontWeight: '700' }, { color: T.t3 }]}>{fmtPrice(order.platformShare)}</Text>
          </View>
        </View>
      </View>

      <View style={[oc.btns, { borderTopColor: T.bd }]}>
        {isNew && (
          <>
            <TouchableOpacity style={[oc.btn, { backgroundColor: C.gn }]} onPress={onAccept} activeOpacity={0.87}>
              <IcCheck color="#fff" size={rs(16, 20)} />
              <Text style={oc.btnTxt}>Qabul</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[oc.btn, { backgroundColor: isDark ? C.rddk : C.rdb, borderWidth: 1, borderColor: C.rd }]} onPress={onReject} activeOpacity={0.87}>
              <IcX color={C.rd} size={rs(16, 20)} />
              <Text style={[oc.btnTxt, { color: C.rd }]}>Rad</Text>
            </TouchableOpacity>
          </>
        )}
        {isPrep && (
          <TouchableOpacity style={[oc.btn, { flex: 1, backgroundColor: C.amber }]} onPress={onReady} activeOpacity={0.87}>
            <Text style={oc.btnTxt}>Tayyor!</Text>
          </TouchableOpacity>
        )}
        {isReady && (
          <View style={[oc.btn, { flex: 1, backgroundColor: isDark ? C.gndk : C.gnb, borderWidth: 1, borderColor: C.gn }]}>
            <IcCheck color={C.gn} size={rs(16, 20)} />
            <Text style={[oc.btnTxt, { color: C.gn }]}>Kuryer kutilmoqda</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const os = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  back: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  hdrTitle: { fontSize: rs(17, 21), fontWeight: '800' },
  live: { flexDirection: 'row', alignItems: 'center', paddingVertical: S.xs, paddingHorizontal: S.sm, borderRadius: R.full },
  liveTxt: { fontSize: F.xs, fontWeight: '900', color: '#fff' },
  filters: { flexDirection: 'row', padding: S.md, gap: S.sm, borderBottomWidth: 1 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, borderWidth: 1, borderRadius: R.full, paddingVertical: rs(8, 10) },
  chipTxt: { fontSize: F.xs, fontWeight: '700' },
  chipBadge: { minWidth: rs(18, 22), height: rs(18, 22), borderRadius: rs(9, 11), alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  chipBadgeTxt: { fontSize: rs(10, 12), fontWeight: '900', color: '#fff' },
});
const oc = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: R.lg, overflow: 'hidden', marginBottom: S.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.md, paddingVertical: S.sm },
  ping: { width: rs(7, 9), height: rs(7, 9), borderRadius: rs(4, 5) },
  num: { fontSize: F.md, fontWeight: '800' },
  status: { fontSize: F.sm, fontWeight: '600' },
  timer: { paddingVertical: 4, paddingHorizontal: S.sm, borderRadius: R.sm },
  timerTxt: { fontSize: F.sm, fontWeight: '800' },
  av: { width: rs(40, 48), height: rs(40, 48), borderRadius: rs(20, 24), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  client: { fontSize: F.md, fontWeight: '700' },
  addr: { fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  items: { fontSize: F.sm, fontWeight: '600', lineHeight: rs(20, 24), marginBottom: S.sm },
  total: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, paddingTop: S.sm },
  totalLbl: { fontSize: F.xs, fontWeight: '600' },
  totalNum: { fontSize: F.lg, fontWeight: '900', marginTop: 2 },
  btns: { flexDirection: 'row', gap: S.sm, padding: S.md, borderTopWidth: 0.5 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xs, borderRadius: R.md, paddingVertical: rs(11, 14) },
  btnTxt: { fontSize: F.md, fontWeight: '800', color: '#fff' },
});

// ════════ MENYU ════════
interface RMenuItem {
  id: string; name: string; price: number; category: string;
  desc: string; available: boolean; emoji: string;
}

const INIT_MENU: RMenuItem[] = [
  { id: '1', name: 'Palov', price: 25000, category: 'Asosiy', desc: "An'anaviy osh", available: true, emoji: '🍚' },
  { id: '2', name: 'Somsa', price: 8000, category: 'Snack', desc: 'Tandirda pishirilgan', available: true, emoji: '🥟' },
  { id: '3', name: 'Shurva', price: 20000, category: 'Asosiy', desc: "Qo'y go'shtli", available: true, emoji: '🍲' },
  { id: '4', name: 'Lag\'mon', price: 22000, category: 'Asosiy', desc: 'Qo\'lda tortilgan', available: false, emoji: '🍜' },
  { id: '5', name: 'Choy', price: 3000, category: 'Ichimlik', desc: "Ko'k choy", available: true, emoji: '🍵' },
  { id: '6', name: 'Manti', price: 18000, category: 'Asosiy', desc: 'Bug\'da pishirilgan', available: true, emoji: '🫕' },
];

const CATEGORIES_R = ['Barchasi', 'Asosiy', 'Snack', 'Ichimlik', 'Yangi'];

export function RestaurantMenuScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const [items, setItems] = useState<RMenuItem[]>(INIT_MENU);
  const [catFilter, setCatFilter] = useState('Barchasi');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<RMenuItem | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'Asosiy', desc: '', emoji: '🍽' });

  const filtered = catFilter === 'Barchasi' ? items : items.filter(i => i.category === catFilter);
  const availCount = items.filter(i => i.available).length;

  const toggleAvail = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  const deleteItem = (id: string) => {
    Alert.alert('O\'chirish', 'Bu taomni menyudan o\'chirmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: () => setItems(prev => prev.filter(i => i.id !== id)) },
    ]);
  };

  const openEdit = (item: RMenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, price: item.price.toString(), category: item.category, desc: item.desc, emoji: item.emoji });
    setShowAdd(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', price: '', category: 'Asosiy', desc: '', emoji: '🍽' });
    setShowAdd(true);
  };

  const saveItem = () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Xato', 'Nom va narxni kiriting');
      return;
    }
    const price = parseInt(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Xato', 'Narx to\'g\'ri kiriting');
      return;
    }
    if (editItem) {
      setItems(prev => prev.map(i => i.id === editItem.id
        ? { ...i, name: form.name.trim(), price, category: form.category, desc: form.desc.trim(), emoji: form.emoji }
        : i
      ));
    } else {
      const newItem: RMenuItem = {
        id: Date.now().toString(), name: form.name.trim(), price,
        category: form.category, desc: form.desc.trim(), available: true, emoji: form.emoji,
      };
      setItems(prev => [...prev, newItem]);
    }
    setShowAdd(false);
  };

  const EMOJIS = ['🍽', '🍚', '🥟', '🍲', '🍜', '🍕', '🍔', '🌮', '🥗', '🍣', '🍵', '🥤', '🧃', '🍰', '🫕'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[mn.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <View style={{ flex: 1 }}>
          <Text style={[mn.title, { color: T.t1 }]}>Menyu</Text>
          <Text style={[mn.sub, { color: T.t3 }]}>{availCount}/{items.length} ta mavjud</Text>
        </View>
        <TouchableOpacity style={[mn.addBtn, { backgroundColor: C.p }]} onPress={openAdd}>
          <IcPlus color="#fff" size={rs(18, 22)} />
          <Text style={mn.addTxt}>Qo'shish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ maxHeight: rs(50, 60), borderBottomWidth: 1, borderBottomColor: T.bd }}
        contentContainerStyle={{ paddingHorizontal: S.lg, gap: S.sm, alignItems: 'center', paddingVertical: S.sm }}
      >
        {CATEGORIES_R.map(cat => (
          <TouchableOpacity key={cat}
            style={[mn.catChip, { backgroundColor: T.bg3, borderColor: T.bd }, catFilter === cat && { backgroundColor: C.p, borderColor: C.p }]}
            onPress={() => setCatFilter(cat)}
          >
            <Text style={[mn.catTxt, { color: catFilter === cat ? '#fff' : T.t2 }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {filtered.map(item => (
          <View key={item.id} style={[mn.itemCard, { backgroundColor: T.card, borderColor: item.available ? T.bd : C.rd + '44' }, !item.available && { opacity: 0.7 }]}>
            <View style={[mn.itemEmoji, { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
              <Text style={{ fontSize: rs(22, 27) }}>{item.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.xs }}>
                <Text style={[mn.itemName, { color: T.t1 }]}>{item.name}</Text>
                {!item.available && (
                  <View style={[mn.badge, { backgroundColor: C.rdb }]}>
                    <Text style={[mn.badgeTxt, { color: C.rd }]}>To'xtatilgan</Text>
                  </View>
                )}
              </View>
              <Text style={[mn.itemDesc, { color: T.t3 }]}>{item.desc}</Text>
              <Text style={[mn.itemPrice, { color: C.p }]}>{fmtPrice(item.price)}</Text>
              <Text style={[mn.itemCat, { color: T.t4 }]}>{item.category}</Text>
            </View>
            <View style={{ gap: S.sm }}>
              <TouchableOpacity onPress={() => toggleAvail(item.id)}>
                {item.available
                  ? <IcToggleOn color={C.gn} size={rs(26, 32)} />
                  : <IcToggleOff color="#999" size={rs(26, 32)} />}
              </TouchableOpacity>
              <TouchableOpacity style={[mn.iconBtn, { backgroundColor: isDark ? '#1a1a2a' : '#EEF2FF' }]} onPress={() => openEdit(item)}>
                <IcEdit color={C.blue} size={rs(14, 17)} />
              </TouchableOpacity>
              <TouchableOpacity style={[mn.iconBtn, { backgroundColor: C.rdb }]} onPress={() => deleteItem(item.id)}>
                <IcTrash color={C.rd} size={rs(14, 17)} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: rs(60, 80) }}>
            <Text style={{ fontSize: rs(48, 60), marginBottom: S.md }}>🍽</Text>
            <Text style={{ fontSize: F.xl, fontWeight: '800', color: T.t2 }}>Bu kategoriyada taom yo'q</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={mn.overlay}>
          <View style={[mn.modal, { backgroundColor: T.bg }]}>
            <View style={[mn.modalHdr, { borderBottomColor: T.bd }]}>
              <Text style={[mn.modalTitle, { color: T.t1 }]}>{editItem ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <IcX color={T.t2} size={rs(22, 26)} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: S.lg }}>
              <Text style={[mn.lbl, { color: T.t2 }]}>Emoji tanlang</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: S.md }}>
                <View style={{ flexDirection: 'row', gap: S.sm }}>
                  {EMOJIS.map(e => (
                    <TouchableOpacity key={e}
                      style={[mn.emojiBtn, { backgroundColor: form.emoji === e ? C.plt : T.bg3, borderColor: form.emoji === e ? C.p : T.bd }]}
                      onPress={() => setForm(f => ({ ...f, emoji: e }))}
                    >
                      <Text style={{ fontSize: rs(20, 24) }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {[
                { label: 'Taom nomi *', key: 'name', placeholder: 'Mas: Palov', keyboard: 'default' },
                { label: 'Narxi (so\'m) *', key: 'price', placeholder: 'Mas: 25000', keyboard: 'numeric' },
                { label: 'Tavsif', key: 'desc', placeholder: 'Mas: An\'anaviy o\'zbek palovi', keyboard: 'default' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: S.md }}>
                  <Text style={[mn.lbl, { color: T.t2 }]}>{f.label}</Text>
                  <TextInput
                    style={[mn.input, { backgroundColor: T.bg2, borderColor: T.bd, color: T.t1 }]}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder} placeholderTextColor={T.t4}
                    keyboardType={f.keyboard as any}
                  />
                </View>
              ))}

              <Text style={[mn.lbl, { color: T.t2 }]}>Kategoriya</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.lg }}>
                {['Asosiy', 'Snack', 'Ichimlik', 'Desert', 'Yangi'].map(cat => (
                  <TouchableOpacity key={cat}
                    style={[mn.catChip, { backgroundColor: form.category === cat ? C.p : T.bg3, borderColor: form.category === cat ? C.p : T.bd }]}
                    onPress={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[mn.catTxt, { color: form.category === cat ? '#fff' : T.t2 }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[mn.saveBtn, { backgroundColor: C.p }]} onPress={saveItem}>
                <IcCheck color="#fff" size={rs(18, 22)} />
                <Text style={mn.saveTxt}>{editItem ? 'Saqlash' : 'Qo\'shish'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const mn = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  sub: { fontSize: F.sm, fontWeight: '600', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: S.xs, borderRadius: R.md, paddingVertical: rs(9, 11), paddingHorizontal: rs(14, 18) },
  addTxt: { color: '#fff', fontWeight: '800', fontSize: F.sm },
  catChip: { paddingVertical: rs(7, 9), paddingHorizontal: rs(14, 18), borderRadius: R.full, borderWidth: 1 },
  catTxt: { fontSize: F.xs, fontWeight: '700' },
  itemCard: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.sm },
  itemEmoji: { width: rs(52, 62), height: rs(52, 62), borderRadius: rs(16, 20), alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: F.md, fontWeight: '800' },
  itemDesc: { fontSize: F.xs, fontWeight: '500', marginTop: 3 },
  itemPrice: { fontSize: F.md, fontWeight: '900', marginTop: S.xs },
  itemCat: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  badge: { paddingVertical: 2, paddingHorizontal: rs(7, 9), borderRadius: R.full },
  badgeTxt: { fontSize: rs(9, 11), fontWeight: '800' },
  iconBtn: { width: rs(28, 34), height: rs(28, 34), borderRadius: rs(9, 11), alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: '85%' },
  modalHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  modalTitle: { fontSize: F.lg, fontWeight: '900' },
  lbl: { fontSize: F.sm, fontWeight: '700', marginBottom: S.xs },
  input: { borderWidth: 1.5, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: rs(11, 14), fontSize: F.md },
  emojiBtn: { width: rs(44, 52), height: rs(44, 52), borderRadius: rs(13, 16), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, borderRadius: R.lg, paddingVertical: rs(15, 19) },
  saveTxt: { color: '#fff', fontWeight: '900', fontSize: F.lg },
});

// ════════ STATISTIKA ════════
const WEEKLY_DATA = [
  { day: 'Du', orders: 12, revenue: 340000 },
  { day: 'Se', orders: 18, revenue: 520000 },
  { day: 'Ch', orders: 15, revenue: 430000 },
  { day: 'Pa', orders: 22, revenue: 680000 },
  { day: 'Ju', orders: 28, revenue: 810000 },
  { day: 'Sh', orders: 35, revenue: 980000 },
  { day: 'Ya', orders: 20, revenue: 590000 },
];

const TOP_ITEMS = [
  { name: 'Palov', count: 87, revenue: 2175000, emoji: '🍚' },
  { name: 'Somsa', count: 124, revenue: 992000, emoji: '🥟' },
  { name: 'Shurva', count: 56, revenue: 1120000, emoji: '🍲' },
  { name: 'Manti', count: 43, revenue: 774000, emoji: '🫕' },
  { name: 'Choy', count: 201, revenue: 603000, emoji: '🍵' },
];

export function RestaurantStatsScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const totalRevenue = WEEKLY_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = WEEKLY_DATA.reduce((s, d) => s + d.orders, 0);
  const maxRevenue = Math.max(...WEEKLY_DATA.map(d => d.revenue));
  const avgOrder = Math.round(totalRevenue / totalOrders);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <View style={[st.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[st.title, { color: T.t1 }]}>Statistika</Text>
        <View style={[st.periodRow, { backgroundColor: T.bg3 }]}>
          {(['week', 'month'] as const).map(p => (
            <TouchableOpacity key={p}
              style={[st.periodBtn, period === p && { backgroundColor: C.p }]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[st.periodTxt, { color: period === p ? '#fff' : T.t3 }]}>
                {p === 'week' ? 'Hafta' : 'Oy'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xxl }}>
        {/* Asosiy kartalar */}
        <View style={st.grid}>
          {[
            { n: fmtPrice(totalRevenue), l: 'Umumiy daromad', c: C.gn },
            { n: totalOrders.toString(), l: 'Buyurtmalar', c: C.p },
            { n: fmtPrice(avgOrder), l: "O'rtacha buyurtma", c: C.amber },
            { n: '4.8 ⭐', l: 'Reyting', c: C.gold },
          ].map((item, i) => (
            <View key={i} style={[st.card, { backgroundColor: T.card, borderColor: T.bd }]}>
              <Text style={[st.cardN, { color: item.c }]}>{item.n}</Text>
              <Text style={[st.cardL, { color: T.t3 }]}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* Grafik */}
        <View style={[st.chartBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[st.chartTitle, { color: T.t1 }]}>Haftalik daromad</Text>
          <View style={st.chart}>
            {WEEKLY_DATA.map((d, i) => {
              const height = (d.revenue / maxRevenue) * rs(100, 130);
              return (
                <View key={i} style={st.bar}>
                  <Text style={[st.barVal, { color: T.t3 }]}>{Math.round(d.revenue / 1000)}k</Text>
                  <View style={[st.barFill, { height, backgroundColor: i === 5 ? C.p : (isDark ? '#3a2a1a' : C.plt), borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <Text style={[st.barDay, { color: T.t3 }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top taomlar */}
        <View style={[st.topBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[st.sectionTitle, { color: T.t1 }]}>Eng ko'p sotilgan</Text>
          {TOP_ITEMS.map((item, i) => (
            <View key={i} style={[st.topRow, i < TOP_ITEMS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}>
              <View style={[st.topRank, { backgroundColor: i === 0 ? C.gold : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : T.bg3 }]}>
                <Text style={[st.topRankTxt, { color: i < 3 ? '#fff' : T.t3 }]}>{i + 1}</Text>
              </View>
              <Text style={{ fontSize: rs(20, 24), marginHorizontal: S.sm }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[st.topName, { color: T.t1 }]}>{item.name}</Text>
                <Text style={[st.topCount, { color: T.t3 }]}>{item.count} ta sotildi</Text>
              </View>
              <Text style={[st.topRev, { color: C.gn }]}>{fmtPrice(item.revenue)}</Text>
            </View>
          ))}
        </View>

        {/* Buyurtma taqsimoti */}
        <View style={[st.distBox, { backgroundColor: T.card, borderColor: T.bd }]}>
          <Text style={[st.sectionTitle, { color: T.t1 }]}>Buyurtma taqsimoti</Text>
          {[
            { label: 'Tushlik (12-15)', pct: 45, color: C.p },
            { label: 'Kechki (18-21)', pct: 35, color: C.amber },
            { label: 'Ertalab (8-11)', pct: 20, color: C.gn },
          ].map((row, i) => (
            <View key={i} style={{ marginBottom: S.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[st.distLbl, { color: T.t2 }]}>{row.label}</Text>
                <Text style={[st.distPct, { color: row.color }]}>{row.pct}%</Text>
              </View>
              <View style={[st.progressBg, { backgroundColor: T.bg3 }]}>
                <View style={[st.progressFill, { width: `${row.pct}%` as any, backgroundColor: row.color }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.lg, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  periodRow: { flexDirection: 'row', borderRadius: R.full, padding: 3 },
  periodBtn: { paddingVertical: rs(6, 8), paddingHorizontal: rs(14, 18), borderRadius: R.full },
  periodTxt: { fontSize: F.xs, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.md },
  card: { width: '47%', borderWidth: 1, borderRadius: R.lg, padding: S.md },
  cardN: { fontSize: rs(16, 20), fontWeight: '900' },
  cardL: { fontSize: F.xs, fontWeight: '600', marginTop: 4 },
  chartBox: { borderWidth: 1, borderRadius: R.lg, padding: S.md, marginBottom: S.md },
  chartTitle: { fontSize: F.md, fontWeight: '800', marginBottom: S.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: rs(140, 170) },
  bar: { flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  barFill: { width: '100%' },
  barVal: { fontSize: rs(8, 10), fontWeight: '700' },
  barDay: { fontSize: rs(9, 11), fontWeight: '700' },
  topBox: { borderWidth: 1, borderRadius: R.lg, overflow: 'hidden', marginBottom: S.md },
  sectionTitle: { fontSize: F.md, fontWeight: '800', padding: S.md },
  topRow: { flexDirection: 'row', alignItems: 'center', padding: S.md, paddingVertical: S.sm },
  topRank: { width: rs(24, 30), height: rs(24, 30), borderRadius: rs(12, 15), alignItems: 'center', justifyContent: 'center' },
  topRankTxt: { fontSize: F.xs, fontWeight: '900' },
  topName: { fontSize: F.sm, fontWeight: '700' },
  topCount: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  topRev: { fontSize: F.sm, fontWeight: '800' },
  distBox: { borderWidth: 1, borderRadius: R.lg, padding: S.md },
  distLbl: { fontSize: F.sm, fontWeight: '600' },
  distPct: { fontSize: F.sm, fontWeight: '800' },
  progressBg: { height: rs(8, 10), borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: R.full },
});

// ════════ PROFIL ════════
export function RestaurantProfileScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(true);
  const [workHours, setWorkHours] = useState('09:00 - 22:00');

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  const GROUPS = [
    [
      { Icon: IcPhone, label: 'Telefon raqam', val: user?.phone ? '+' + user.phone : '', bg: C.blue, go: () => {} },
      { Icon: IcInfo, label: 'Restoran haqida', val: '', bg: '#7C4DFF', go: () => Alert.alert('Tez orada', 'Restoran ma\'lumotlarini tahrirlash qo\'shiladi') },
    ],
    [
      { Icon: IcSettings, label: 'Ish vaqti', val: workHours, bg: C.amber, go: () => Alert.alert('Ish vaqti', 'Ish vaqtini sozlash qo\'shiladi') },
      { Icon: IcChart, label: 'Statistika', val: '', bg: C.gn, go: () => navigation.navigate('RStat') },
    ],
  ];

  return (
    <SafeAreaView style={[pr.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[pr.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[pr.title, { color: T.t1 }]}>Profil</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: S.xxl }}>
        {/* Top karta */}
        <View style={[pr.top, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
          <View style={[pr.avatar, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
            <Text style={{ fontSize: rs(34, 42) }}>🏪</Text>
          </View>
          <Text style={[pr.name, { color: T.t1 }]}>{user?.name || 'Restoran'}</Text>
          <Text style={[pr.phone, { color: T.t3 }]}>+{user?.phone}</Text>
          {user?.regionName && <Text style={[pr.region, { color: T.t4 }]}>{user.regionName}</Text>}

          <View style={[pr.statusRow, { backgroundColor: isOpen ? C.gnb : C.rdb, borderColor: isOpen ? C.gn : C.rd }]}>
            <View style={[pr.statusDot, { backgroundColor: isOpen ? C.gn : C.rd }]} />
            <Text style={[pr.statusTxt, { color: isOpen ? C.gn : C.rd }]}>
              {isOpen ? 'Hozir ochiq' : 'Hozir yopiq'}
            </Text>
            <Switch
              value={isOpen} onValueChange={setIsOpen}
              trackColor={{ false: C.rd + '44', true: C.gn + '44' }} thumbColor={isOpen ? C.gn : C.rd}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Statistika */}
        <View style={[pr.statsRow, { borderBottomColor: T.bd }]}>
          {[
            { n: '150', l: 'Buyurtma', c: C.p },
            { n: '4.8', l: 'Reyting', c: C.gold },
            { n: '98%', l: "To'g'rilik", c: C.gn },
          ].map((st, i) => (
            <View key={i} style={[pr.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: T.bd }]}>
              <Text style={[pr.statN, { color: st.c }]}>{st.n}</Text>
              <Text style={[pr.statL, { color: T.t3 }]}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Menyu guruhlari */}
        {GROUPS.map((grp, gi) => (
          <View key={gi} style={[pr.grp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
            {grp.map((item, ii) => (
              <TouchableOpacity key={ii}
                style={[pr.row, ii < grp.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}
                onPress={item.go} activeOpacity={0.7}
              >
                <View style={[pr.rowIcon, { backgroundColor: item.bg }]}>
                  <item.Icon color="#fff" size={rs(17, 21)} />
                </View>
                <Text style={[pr.rowLbl, { color: T.t1 }]}>{item.label}</Text>
                {item.val ? <Text style={[pr.rowVal, { color: T.t3 }]}>{item.val}</Text> : null}
                <IcChevron color={T.t4} size={rs(16, 20)} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Rejim */}
        <View style={[pr.grp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
          <View style={pr.row}>
            <View style={[pr.rowIcon, { backgroundColor: isDark ? '#1a1a2a' : '#e0e0ff' }]}>
              {isDark ? <IcMoon color="#aaf" size={rs(17, 21)} /> : <IcSun color="#f90" size={rs(17, 21)} />}
            </View>
            <Text style={[pr.rowLbl, { color: T.t1, flex: 1 }]}>{isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}</Text>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ false: T.bg4, true: C.p }} thumbColor="#fff" />
          </View>
        </View>

        <TouchableOpacity style={[pr.logoutBtn, { backgroundColor: isDark ? C.rddk : C.rdb, borderColor: C.rd }]} onPress={handleLogout}>
          <IcLogout color={C.rd} size={rs(18, 22)} />
          <Text style={[pr.logoutTxt, { color: C.rd }]}>Tizimdan chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function IcMoon({ color, size }: { color: string; size: number }) {
  const { IcMoon: Icon } = require('../../components/Icons');
  return <Icon color={color} size={size} />;
}
function IcSun({ color, size }: { color: string; size: number }) {
  const { IcSun: Icon } = require('../../components/Icons');
  return <Icon color={color} size={size} />;
}
function IcChevron({ color, size }: { color: string; size: number }) {
  const { IcChevron: Icon } = require('../../components/Icons');
  return <Icon color={color} size={size} />;
}

const pr = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { padding: S.lg, paddingBottom: S.md, borderBottomWidth: 1 },
  title: { fontSize: rs(20, 24), fontWeight: '900' },
  top: { alignItems: 'center', paddingVertical: S.xl, paddingHorizontal: S.lg, borderBottomWidth: 1 },
  avatar: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(26, 32), borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  name: { fontSize: rs(20, 25), fontWeight: '900' },
  phone: { fontSize: F.md, fontWeight: '600', marginTop: 4 },
  region: { fontSize: F.sm, fontWeight: '600', marginTop: 3 },
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
