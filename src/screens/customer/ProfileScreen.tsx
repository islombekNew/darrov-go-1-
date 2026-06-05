import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch,
  Modal, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { C, S, R, F, rs } from '../../theme';
import { useAuthStore, useThemeStore, useNotifStore } from '../../store';
import { getLevelByCoins } from '../../constants';
import { CoinIcon } from '../../components/CoinIcon';
import {
  IcPin, IcCard, IcHeart, IcPromo, IcUsers, IcOrders,
  IcQuestion, IcInfo, IcMoon, IcSun, IcGlobe, IcBell,
  IcLogout, IcChevron, IcCamera, IcProfile, IcEdit,
} from '../../components/Icons';

const MENU_GROUPS = [
  [
    { Icon: IcPin,    label: "Manzil o'zgartirish", bg: C.p,        nav: 'Address' },
    { Icon: IcCard,   label: "To'lov kartalari",    bg: '#2b6cb0',  nav: 'Cards' },
    { Icon: IcHeart,  label: 'Sevimlilar',           bg: C.rd,       nav: null },
    { Icon: IcPromo,  label: 'Promo kodlar',         bg: C.amber,    nav: null },
  ],
  [
    { Icon: IcUsers,  label: "Do'stlarni taklif qilish", bg: C.gn,   nav: 'Referral' },
    { Icon: IcOrders, label: 'Buyurtmalar tarixi',         bg: '#555', nav: 'MBuyurtma' },
  ],
  [
    { Icon: IcQuestion, label: 'Yordam',       bg: '#3b82f6', nav: null },
    { Icon: IcInfo,     label: 'Ilova haqida', bg: '#64748b', nav: 'AppInfo' },
  ],
];

export function CustomerProfileScreen({ navigation }: any) {
  const { T, isDark, toggle } = useThemeStore();
  const { user, logout, updateUser } = useAuthStore();
  const { unreadCount } = useNotifStore();
  const coins = user?.coins ?? 0;
  const level = getLevelByCoins(coins);

  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Galereya ruxsatini bering: Sozlamalar > Ilova > Galereya');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const saveProfile = () => {
    if (!editName.trim()) { Alert.alert('Xato', 'Ism kiriting'); return; }
    updateUser({ name: editName.trim(), avatar: editAvatar });
    setEditModal(false);
  };

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[s.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <Text style={[s.hdrTitle, { color: T.t1 }]}>Sahifam</Text>
        <TouchableOpacity style={[s.bellBtn, { backgroundColor: T.bg3 }]} onPress={() => navigation.navigate('Notifications')}>
          <IcBell color={T.t2} size={rs(20, 24)} />
          {unreadCount > 0 && (
            <View style={[s.bellBadge, { backgroundColor: C.p }]}>
              <Text style={s.bellBadgeTxt}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: S.xxl }}>
        {/* Avatar + ism */}
        <View style={[s.profTop, { backgroundColor: T.bg2, borderBottomColor: T.bd }]}>
          <TouchableOpacity onPress={() => setEditModal(true)} style={{ position: 'relative' }} activeOpacity={0.85}>
            {user?.avatar
              ? <Image source={{ uri: user.avatar }} style={[s.avatar, { borderColor: C.p }]} />
              : (
                <View style={[s.avatar, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                  <IcProfile color={C.p} size={rs(36, 44)} />
                </View>
              )}
            <View style={[s.cameraBtn, { backgroundColor: C.p }]}>
              <IcCamera color="#fff" size={rs(12, 15)} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.md }}>
            <Text style={[s.name, { color: T.t1 }]}>{user?.name || 'Foydalanuvchi'}</Text>
            <TouchableOpacity onPress={() => { setEditName(user?.name || ''); setEditAvatar(user?.avatar || ''); setEditModal(true); }}>
              <IcEdit color={T.t4} size={rs(16, 20)} />
            </TouchableOpacity>
          </View>

          <Text style={[s.phone, { color: T.t3 }]}>+{user?.phone}</Text>
          {user?.regionName && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <IcPin color={T.t4} size={rs(12, 14)} />
              <Text style={[s.region, { color: T.t4 }]}>{user.regionName}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.coinRow, { backgroundColor: isDark ? level.bgColor : C.ambBg, borderColor: level.color }]}
            onPress={() => navigation.navigate('Marra')}
            activeOpacity={0.85}
          >
            <CoinIcon level={level.level} size={rs(20, 24)} />
            <Text style={[s.coinNum, { color: level.color }]}>{coins} coin</Text>
            <Text style={[s.coinLvl, { color: level.color }]}>{level.level}-daraja · {level.name}</Text>
            <IcChevron color={level.color} size={rs(14, 17)} />
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
        {MENU_GROUPS.map((grp, gi) => (
          <View key={gi} style={[s.menuGrp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
            {grp.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[s.menuRow, ii < grp.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}
                onPress={() => item.nav ? navigation.navigate(item.nav) : Alert.alert(item.label, 'Tez orada qo\'shiladi!')}
                activeOpacity={0.7}
              >
                <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                  <item.Icon color="#fff" size={rs(17, 21)} />
                </View>
                <Text style={[s.menuLbl, { color: T.t1 }]}>{item.label}</Text>
                <IcChevron color={T.t4} size={rs(16, 20)} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sozlamalar */}
        <View style={[s.menuGrp, { backgroundColor: T.bg2, borderColor: T.bd }]}>
          <View style={[s.menuRow, { borderBottomWidth: 0.5, borderBottomColor: T.bd }]}>
            <View style={[s.menuIcon, { backgroundColor: isDark ? '#1a1a2a' : '#e0e0ff' }]}>
              {isDark ? <IcMoon color="#aaf" size={rs(17, 21)} /> : <IcSun color="#f90" size={rs(17, 21)} />}
            </View>
            <Text style={[s.menuLbl, { color: T.t1, flex: 1 }]}>{isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}</Text>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ false: T.bg4, true: C.p }} thumbColor="#fff" />
          </View>
          <TouchableOpacity style={s.menuRow} onPress={() => Alert.alert('Til', 'O\'zbekcha')} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: '#1a3a5c' }]}>
              <IcGlobe color="#fff" size={rs(17, 21)} />
            </View>
            <Text style={[s.menuLbl, { color: T.t1 }]}>Ilova tili</Text>
            <Text style={[s.menuVal, { color: T.t3 }]}>O'zbekcha</Text>
            <IcChevron color={T.t4} size={rs(16, 20)} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.logoutBtn, { backgroundColor: isDark ? C.rddk : C.rdb, borderColor: C.rd }]} onPress={handleLogout} activeOpacity={0.87}>
          <IcLogout color={C.rd} size={rs(18, 22)} />
          <Text style={[s.logoutTxt, { color: C.rd }]}>Tizimdan chiqish</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Ism/Rasm tahrirlash modali */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalBox, { backgroundColor: T.card }]}>
            <Text style={[s.modalTitle, { color: T.t1 }]}>Profilni tahrirlash</Text>

            {/* Rasm */}
            <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center', marginBottom: S.lg }} activeOpacity={0.85}>
              {editAvatar
                ? <Image source={{ uri: editAvatar }} style={[s.modalAv, { borderColor: C.p }]} />
                : (
                  <View style={[s.modalAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                    <IcProfile color={C.p} size={rs(36, 44)} />
                  </View>
                )}
              <View style={[s.modalCamBtn, { backgroundColor: C.p }]}>
                <IcCamera color="#fff" size={rs(14, 17)} />
              </View>
            </TouchableOpacity>

            <Text style={[s.inpLbl, { color: T.t2 }]}>Ism familiya</Text>
            <TextInput
              style={[s.inp, { color: T.t1, backgroundColor: T.bg3, borderColor: T.bd }]}
              value={editName} onChangeText={setEditName}
              placeholder="Ismingizni kiriting" placeholderTextColor={T.t4}
              returnKeyType="done" onSubmitEditing={saveProfile}
            />

            <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.md }}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: T.bg3, flex: 1 }]} onPress={() => setEditModal(false)}>
                <Text style={[{ color: T.t2, fontWeight: '700', textAlign: 'center' }]}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: C.p, flex: 1 }]} onPress={saveProfile}>
                <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Saqlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatar: { width: rs(80, 96), height: rs(80, 96), borderRadius: rs(40, 48), borderWidth: 3 },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: rs(26, 32), height: rs(26, 32), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: rs(20, 25), fontWeight: '900' },
  phone: { fontSize: F.md, fontWeight: '600', marginTop: 4 },
  region: { fontSize: F.sm, fontWeight: '600' },
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
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.lg, borderWidth: 1.5, borderRadius: R.lg, paddingVertical: S.md },
  logoutTxt: { fontSize: F.lg, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: S.xl, paddingBottom: rs(32, 42) },
  modalTitle: { fontSize: F.xl, fontWeight: '900', marginBottom: S.lg, textAlign: 'center' },
  modalAv: { width: rs(90, 110), height: rs(90, 110), borderRadius: rs(45, 55), borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  modalCamBtn: { position: 'absolute', bottom: 0, right: 0, width: rs(30, 36), height: rs(30, 36), borderRadius: rs(15, 18), alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  inpLbl: { fontSize: F.sm, fontWeight: '700', marginBottom: S.xs },
  inp: { borderWidth: 1.5, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: rs(13, 16), fontSize: F.lg, fontWeight: '600' },
  modalBtn: { borderRadius: R.md, paddingVertical: S.md },
});
