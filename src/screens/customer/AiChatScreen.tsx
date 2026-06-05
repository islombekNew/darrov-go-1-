import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';
import { RESTAURANTS } from '../../constants/data';

// ── Taom bazasi (deep link uchun) ──
const FOOD_KEYWORDS: Record<string, { restId: string; itemName: string }[]> = {
  'salat':   [{ restId:'rest_gb', itemName:'Cezar salati' }, { restId:'rest_gb', itemName:'Tovuqli salat' }],
  'cezar':   [{ restId:'rest_gb', itemName:'Cezar salati' }],
  'palov':   [{ restId:'rest_no', itemName:'Palov' }],
  'osh':     [{ restId:'rest_no', itemName:'Palov' }],
  'burger':  [{ restId:'rest_bh', itemName:'Cheeseburger' }],
  'pizza':   [{ restId:'rest_pp', itemName:'Margarita' }],
  'sushi':   [{ restId:'rest_tr', itemName:'Philadelphia' }],
  'shurva':  [{ restId:'rest_no', itemName:'Shurva' }],
};

// ── Offline AI javoblari (internet shart emas) ──
const getAiResponse = (q: string): { text: string; foods?: string[] } => {
  const query = q.toLowerCase();

  if (query.includes('oz') || query.includes('vazn') || query.includes('dieta')) {
    return {
      text: "Ozish uchun kam kaloriyali, yuqori oqsilli ovqatlar tavsiya qilaman:\n\n• Cezar salati (tovuq bilan)\n• Tovuqli salat\n• Sabzavotli taomlar\n\nQovurilgan va shirin narsalardan saqlaning. Kuniga 1.5-2 litr suv iching!",
      foods: ['cezar salati', 'tovuqli salat'],
    };
  }
  if (query.includes('muskul') || query.includes('zal') || query.includes('oqsil') || query.includes('protein')) {
    return {
      text: "Muskul uchun yuqori oqsilli ovqatlar kerak:\n\n• Tovuqli salat (oqs13ga boy)\n• Cezar salati\n• Go'shtli taomlar\n\nMashqdan keyin 30 daqiqa ichida oqsil iste'mol qiling. Kuniga tana vazningizning har kg uchun 1.5-2g oqsil oling.",
      foods: ['tovuqli salat', 'palov'],
    };
  }
  if (query.includes('tushlik') || query.includes('ovqat') || query.includes('och') || query.includes('nima ye')) {
    return {
      text: "Bugungi tushlik uchun mazali takliflar:\n\n• Palov — to'yimli va an'anaviy\n• Lag'mon — issiq va mazali\n• Cheeseburger — tez va to'q\n\nNimani xohlaysiz? Buyurtma beraman!",
      foods: ['palov', 'burger'],
    };
  }
  if (query.includes('salom') || query.includes('assalom') || query.includes('hello')) {
    return { text: "Vaalaykum assalom! Ovqat tanlashda yordam beraman. Nima yegingiz keladi? Yoki maqsadingizni ayting — ozish, muskul, yoki shunchaki mazali ovqat?" };
  }
  if (query.includes('rahmat') || query.includes('raxmat')) {
    return { text: "Arzimaydi! Yana savol bo'lsa, bemalol so'rang. Yoqimli ishtaha! 😊" };
  }

  // Default
  return {
    text: "Tushundim! Sizga mos ovqat tanlashda yordam beraman. Aniqroq aytsangiz:\n\n• Ozmoqchimisiz?\n• Muskul uchunmi?\n• Yoki mazali tushlikmi?\n\nMen ilovadagi restoranlardan eng yaxshisini tavsiya qilaman.",
    foods: ['palov', 'cezar salati'],
  };
};

interface Msg { role: 'user'|'ai'; text: string; foods?: string[]; }

export function AiChatScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'ai',
    text: `Salom${user?.name ? ', ' + user.name : ''}! Men Darrov AI — ovqat maslahatchiingizman.\n\nNima so'raysiz? Masalan:\n• Ozmoqchi bo'lsangiz\n• Muskullar uchun ovqat\n• Bugungi tushlik`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, [msgs]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    // Offline AI javob (tez, internet shart emas)
    setTimeout(() => {
      const res = getAiResponse(msg);
      setMsgs(prev => [...prev, { role: 'ai', text: res.text, foods: res.foods }]);
      setLoading(false);
    }, 600);
  };

  // Taom nomidan restoran topish
  const findFoodLink = (foodName: string) => {
    const q = foodName.toLowerCase();
    for (const [key, links] of Object.entries(FOOD_KEYWORDS)) {
      if (q.includes(key)) {
        const link = links[0];
        const rest = RESTAURANTS.find(r => r.id === link.restId);
        const item = rest?.menu.find(m => m.name === link.itemName);
        if (rest && item) return { rest, item };
      }
    }
    return null;
  };

  const QUICK = ["Ozmoqchi bo'lsam", 'Muskullar uchun', 'Bugungi tushlik', "Sog'lom salatlar"];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: T.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[s.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[s.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: rs(20, 24), color: T.t2 }}>←</Text>
        </TouchableOpacity>
        <View style={[s.aiAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
          <Text style={{ fontSize: rs(20, 24) }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.aiName, { color: T.t1 }]}>Darrov AI</Text>
          <View style={s.onlineRow}>
            <View style={[s.dot, { backgroundColor: C.gn }]} />
            <Text style={[s.onlineTxt, { color: C.gn }]}>Har doim tayyor</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Messages */}
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: S.md }} showsVerticalScrollIndicator={false}>
          {msgs.map((m, i) => (
            <View key={i}>
              <View style={[s.msgWrap, m.role === 'user' && { flexDirection: 'row-reverse' }]}>
                {m.role === 'ai' && (
                  <View style={[s.msgAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                    <Text style={{ fontSize: rs(12, 15) }}>🤖</Text>
                  </View>
                )}
                <View style={[
                  s.bubble,
                  m.role === 'user'
                    ? { backgroundColor: C.p, borderBottomRightRadius: 4 }
                    : { backgroundColor: T.bg2, borderColor: T.bd, borderWidth: 0.5, borderBottomLeftRadius: 4 },
                ]}>
                  <Text style={[s.bubbleTxt, { color: m.role === 'user' ? '#fff' : T.t1 }]}>{m.text}</Text>
                </View>
              </View>

              {/* Deep link kartalar */}
              {m.foods && m.foods.map((food, fi) => {
                const link = findFoodLink(food);
                if (!link) return null;
                return (
                  <TouchableOpacity
                    key={fi}
                    style={[s.foodCard, { backgroundColor: isDark ? '#1a1200' : C.ambBg, borderColor: C.amber }]}
                    onPress={() => navigation.navigate('Menu', { restId: link.rest.id, highlight: link.item.name })}
                    activeOpacity={0.85}
                  >
                    <View style={[s.foodEmoji, { backgroundColor: isDark ? '#2a1400' : '#fff' }]}>
                      <Text style={{ fontSize: rs(20, 24) }}>{link.item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.foodName, { color: T.t1 }]}>{link.item.name}</Text>
                      <Text style={[s.foodRest, { color: T.t3 }]}>{link.rest.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[s.foodPrice, { color: C.p }]}>{fmtPrice(link.item.price)}</Text>
                      <Text style={[s.foodGo, { color: C.p }]}>Buyurtma →</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          {loading && (
            <View style={s.msgWrap}>
              <View style={[s.msgAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                <Text style={{ fontSize: rs(12, 15) }}>🤖</Text>
              </View>
              <View style={[s.bubble, { backgroundColor: T.bg2, borderColor: T.bd, borderWidth: 0.5 }]}>
                <ActivityIndicator size="small" color={C.p} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick chips - TUZATILGAN (kichik, bir qatorli) */}
        <View style={{ height: rs(44, 54) }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.md, gap: S.sm, alignItems: 'center' }}>
            {QUICK.map((q, i) => (
              <TouchableOpacity key={i} style={[s.chip, { backgroundColor: T.bg2, borderColor: C.p }]} onPress={() => send(q)} activeOpacity={0.8}>
                <Text style={[s.chipTxt, { color: C.p }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={[s.inpRow, { backgroundColor: T.hdrBg, borderTopColor: T.bd }]}>
          <TextInput
            style={[s.inp, { color: T.t1, backgroundColor: T.bg3 }]}
            value={input} onChangeText={setInput}
            placeholder="Savol bering..." placeholderTextColor={T.t4}
            onSubmitEditing={() => send()} returnKeyType="send" maxLength={300}
          />
          <TouchableOpacity style={[s.sendBtn, { backgroundColor: input.trim() ? C.p : T.bg3 }]} onPress={() => send()} disabled={!input.trim() || loading}>
            <Text style={{ fontSize: rs(18, 22), color: input.trim() ? '#fff' : T.t4 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  hdr: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.lg, borderBottomWidth: 1 },
  back: { width: rs(40, 50), height: rs(40, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  aiAv: { width: rs(42, 52), height: rs(42, 52), borderRadius: rs(21, 26), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: F.lg, fontWeight: '800' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: rs(6, 8), height: rs(6, 8), borderRadius: rs(3, 4) },
  onlineTxt: { fontSize: F.xs, fontWeight: '700' },

  msgWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: S.sm, marginBottom: S.md },
  msgAv: { width: rs(28, 34), height: rs(28, 34), borderRadius: rs(14, 17), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: rs(16, 20), padding: S.md, maxWidth: '78%' },
  bubbleTxt: { fontSize: F.md, fontWeight: '500', lineHeight: rs(20, 24) },

  foodCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginLeft: rs(36, 44), marginBottom: S.sm, borderWidth: 1.5, borderRadius: R.md, padding: S.sm },
  foodEmoji: { width: rs(40, 48), height: rs(40, 48), borderRadius: rs(12, 15), alignItems: 'center', justifyContent: 'center' },
  foodName: { fontSize: F.sm, fontWeight: '800' },
  foodRest: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  foodPrice: { fontSize: F.sm, fontWeight: '800' },
  foodGo: { fontSize: F.xs, fontWeight: '700', marginTop: 2 },

  chip: { paddingVertical: rs(7, 9), paddingHorizontal: rs(14, 18), borderRadius: R.full, borderWidth: 1, height: rs(34, 42), justifyContent: 'center' },
  chipTxt: { fontSize: F.xs, fontWeight: '700' },

  inpRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md, borderTopWidth: 1 },
  inp: { flex: 1, borderRadius: rs(13, 16), paddingHorizontal: S.md, paddingVertical: rs(11, 14), fontSize: F.md, maxHeight: rs(100, 120) },
  sendBtn: { width: rs(44, 52), height: rs(44, 52), borderRadius: rs(14, 17), alignItems: 'center', justifyContent: 'center' },
});
