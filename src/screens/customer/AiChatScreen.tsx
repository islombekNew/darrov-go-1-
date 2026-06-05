import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';
import { RESTAURANTS } from '../../constants/data';
import { IcArrowLeft, IcSend, IcMusic, IcRobot } from '../../components/Icons';

// ─── OVQAT KALIT SO'ZLARI ───
const FOOD_KEYWORDS: Record<string, { restId: string; itemName: string }[]> = {
  'salat':    [{ restId: 'rest_gb', itemName: 'Cezar salati' }, { restId: 'rest_gb', itemName: 'Tovuqli salat' }],
  'cezar':    [{ restId: 'rest_gb', itemName: 'Cezar salati' }],
  'palov':    [{ restId: 'rest_no', itemName: 'Palov' }],
  'osh':      [{ restId: 'rest_no', itemName: 'Palov' }],
  'burger':   [{ restId: 'rest_bh', itemName: 'Cheeseburger' }],
  'pizza':    [{ restId: 'rest_pp', itemName: 'Margarita' }],
  'sushi':    [{ restId: 'rest_tr', itemName: 'Philadelphia' }],
  'shurva':   [{ restId: 'rest_no', itemName: 'Shurva' }],
  'lag\'mon': [{ restId: 'rest_no', itemName: "Lag'mon" }],
  'manti':    [{ restId: 'rest_no', itemName: 'Manti' }],
};

// ─── MUSIQA TAVSIYALARI ───
const MUSIC_RECS = [
  { mood: 'nonushta', emoji: '☕', title: 'Morning Vibes', artist: 'Lofi Hip-Hop Mix', genre: 'Lofi / Chill', desc: 'Sokin, iliq musiqa nonushta paytiga mos' },
  { mood: 'nonushta', emoji: '🌅', title: 'Good Morning', artist: 'Acoustic Guitar', genre: 'Acoustic', desc: 'Akustik gitara — kun boshlanishiga ilhom' },
  { mood: 'tushlik', emoji: '🎵', title: 'Lunch Beats', artist: 'Jazz Café', genre: 'Jazz / Bossa Nova', desc: "Kafeda tushlik paytiga mos yengil jaz" },
  { mood: 'tushlik', emoji: '🎶', title: 'Pop Classics', artist: "Xalqaro pop eng zo'rlari", genre: 'Pop', desc: 'Energiya beruvchi mashhur qo\'shiqlar' },
  { mood: 'kechki', emoji: '🌙', title: 'Dinner Ambience', artist: 'Classical Piano', genre: 'Classical', desc: "Klassik piano — kechki ovqat uchun mukammal" },
  { mood: 'kechki', emoji: '🎸', title: 'R&B Dinner', artist: 'Smooth R&B', genre: 'R&B / Soul', desc: "Yumshoq R&B — kechki damolish uchun" },
  { mood: 'sport', emoji: '💪', title: 'Workout Beats', artist: 'EDM / Techno', genre: 'EDM', desc: 'Sport uchun yuqori energiyali trek' },
  { mood: 'sport', emoji: '🏋️', title: 'Hip-Hop Power', artist: 'Rap / Hip-Hop', genre: 'Hip-Hop', desc: "Zo'r ritm — mashqlar uchun motivatsiya" },
  { mood: 'relax', emoji: '🌊', title: 'Ocean Sounds', artist: 'Nature Ambient', genre: 'Ambient', desc: "Tabiat tovushlari — stressni kamaytiradi" },
  { mood: 'relax', emoji: '🎻', title: 'Strings & Piano', artist: 'Instrumental', genre: 'Instrumental', desc: "Dam olish va kitob o'qish uchun" },
  { mood: "o'zbek", emoji: '🪗', title: "O'zbek Pop 2024", artist: "Milliy hofizlar toplam", genre: "O'zbek pop", desc: "Eng yangi o'zbek qo'shiqlari" },
  { mood: "o'zbek", emoji: '🎼', title: "Klassik O'zbek", artist: "Shashmaqom va maqom", genre: "Milliy musiqa", desc: "An'anaviy o'zbek musiqasi" },
];

// ─── RASM STILI TAVSIYALARI (ovqat vizual) ───
const PHOTO_RECS = [
  { category: 'sog\'lom', emoji: '🥗', name: 'Yashil salat', colors: '#4CAF50 · #8BC34A', mood: 'Tetik, sog\'lom', kcal: '180 kkal' },
  { category: 'sog\'lom', emoji: '🍱', name: 'Bento box', colors: '#FF9800 · #FFC107', mood: 'Muvozanatli', kcal: '350 kkal' },
  { category: 'milliy', emoji: '🍚', name: 'Palov', colors: '#F4A228 · #8D6E63', mood: "To'yimli, issiq", kcal: '520 kkal' },
  { category: 'milliy', emoji: '🍜', name: "Lag'mon", colors: '#FF6B1A · #795548', mood: 'Kuchli, barakali', kcal: '480 kkal' },
  { category: 'tez', emoji: '🍔', name: 'Burger', colors: '#FF5722 · #FFC107', mood: 'Energik, to\'q', kcal: '620 kkal' },
  { category: 'tez', emoji: '🍕', name: 'Pizza', colors: '#E53935 · #FFA000', mood: 'Shirin, mazali', kcal: '560 kkal' },
  { category: 'desert', emoji: '🍰', name: 'Tort', colors: '#F06292 · #CE93D8', mood: 'Baxtli, mazali', kcal: '390 kkal' },
  { category: 'ichimlik', emoji: '🧃', name: 'Meva sharbati', colors: '#FF9800 · #CDDC39', mood: 'Yangilovchi', kcal: '120 kkal' },
];

// ─── AI JAVOB TIZIMI ───
type MsgType = 'food' | 'music' | 'photo' | 'text';

interface AiResponse {
  text: string;
  type: MsgType;
  foods?: string[];
  music?: typeof MUSIC_RECS[0][];
  photos?: typeof PHOTO_RECS[0][];
}

const getAiResponse = (q: string): AiResponse => {
  const query = q.toLowerCase();

  // Musiqa
  if (query.includes('musiqa') || query.includes('qo\'shiq') || query.includes('music') || query.includes('playlist')) {
    if (query.includes('nonushta') || query.includes('ertalab') || query.includes('morning')) {
      return { type: 'music', text: "Nonushta uchun zo'r musiqa topildi! Ertalabki ovqat bilan tinglaydigan eng yaxshi playlistlar:", music: MUSIC_RECS.filter(m => m.mood === 'nonushta') };
    }
    if (query.includes('tushlik') || query.includes('tush')) {
      return { type: 'music', text: "Tushlik paytiga mos musiqa — kafédagi kayfiyat uyda ham bo'lsin:", music: MUSIC_RECS.filter(m => m.mood === 'tushlik') };
    }
    if (query.includes('kechki') || query.includes('kech')) {
      return { type: 'music', text: "Kechki ovqat uchun salobatli va sokin musiqa:", music: MUSIC_RECS.filter(m => m.mood === 'kechki') };
    }
    if (query.includes('sport') || query.includes('mashq') || query.includes('zal')) {
      return { type: 'music', text: "Sport va mashq uchun energiya beruvchi musiqa! 💪", music: MUSIC_RECS.filter(m => m.mood === 'sport') };
    }
    if (query.includes('dam') || query.includes('relax') || query.includes('tinchl') || query.includes('sokin')) {
      return { type: 'music', text: "Hordiq chiqarish va dam olish uchun eng sokin musiqa:", music: MUSIC_RECS.filter(m => m.mood === 'relax') };
    }
    if (query.includes("o'zbek") || query.includes('milliy') || query.includes('uzbek')) {
      return { type: 'music', text: "O'zbek musiqasining eng zo'r tanlanmasi:", music: MUSIC_RECS.filter(m => m.mood === "o'zbek") };
    }
    return {
      type: 'music',
      text: "Qaysi kayfiyatga musiqa kerak? Masalan:\n\n• Nonushta uchun musiqa\n• Sport uchun playlist\n• Kechki ovqatga sokin musiqa\n• Dam olish uchun\n• O'zbek musiqasi",
      music: [MUSIC_RECS[0], MUSIC_RECS[2], MUSIC_RECS[8]],
    };
  }

  // Rasm / vizual
  if (query.includes('rasm') || query.includes('foto') || query.includes('ko\'rin') || query.includes('qanday ko\'r')) {
    if (query.includes('sog\'lom') || query.includes('dieta') || query.includes('yengil')) {
      return { type: 'photo', text: "Sog'lom ovqat vizualida rang-barang sabzavotlar va yashil ranglar ustun bo'ladi. Eng chiroyli sog'lom ovqatlar:", photos: PHOTO_RECS.filter(p => p.category === "sog'lom") };
    }
    if (query.includes('milliy') || query.includes("o'zbek") || query.includes('palov') || query.includes('osh')) {
      return { type: 'photo', text: "Milliy taomlar oltinrang va jigarrang ranglar bilan ajralib turadi. Eng yaxshi ko'rinish:", photos: PHOTO_RECS.filter(p => p.category === 'milliy') };
    }
    return { type: 'photo', text: "Ovqat vizuali — ranglar, kayfiyat va kaloriyalar bilan tanishing:", photos: PHOTO_RECS.slice(0, 4) };
  }

  // Ozish / dieta
  if (query.includes('oz') || query.includes('vazn') || query.includes('dieta') || query.includes('yengil')) {
    return {
      type: 'food',
      text: "Ozish uchun past kaloriyali, to'yimli ovqatlar tavsiya qilaman:\n\n• Cezar salati — 320 kkal\n• Tovuqli salat — 280 kkal\n• Sabzavotli taomlar\n\nShirin va qovurilgan narsalardan saqlaning. Kuniga 1.5-2L suv iching! 💧",
      foods: ['cezar', 'salat'],
    };
  }

  // Sport / oqsil
  if (query.includes('muskul') || query.includes('zal') || query.includes('oqsil') || query.includes('protein') || query.includes('sport')) {
    return {
      type: 'food',
      text: "Sport uchun yuqori oqsilli ovqatlar:\n\n• Tovuqli salat — 35g oqsil\n• Cezar salati (+ tovuq) — 28g\n• Go'shtli taomlar\n\nMashqdan keyin 30 daqiqa ichida oqsil oling. Har kg uchun 1.5-2g oqsil tavsiya!",
      foods: ['salat', 'palov'],
    };
  }

  // Nonushta
  if (query.includes('nonushta') || query.includes('ertalab') || query.includes('breakfast')) {
    return {
      type: 'music',
      text: "Nonushta uchun mazali tanlov + musiqa:\n\n• Tuxum va non (klassik)\n• Meva salatasi\n• Yoqut yoki qatiq\n\nNonushta paytiga mos musiqa ham tavsiya qilaman:",
      music: MUSIC_RECS.filter(m => m.mood === 'nonushta'),
    };
  }

  // Tushlik / och
  if (query.includes('tushlik') || query.includes('ovqat') || query.includes('och') || query.includes('nima ye')) {
    return {
      type: 'food',
      text: "Bugungi tushlik uchun mazali takliflar:\n\n• Palov — to'yimli, an'anaviy\n• Lag'mon — issiq, barakali\n• Burger — tez, to'q\n\nBuyurtma berish uchun pastdagi kartani bosing!",
      foods: ['palov', 'burger'],
    };
  }

  // Kechki
  if (query.includes('kechki') || query.includes('kech ovqat') || query.includes('dinner')) {
    return {
      type: 'food',
      text: "Kechki ovqat uchun yengil tavsiyalar:\n\n• Sho'rva — hazm qilish uchun qulay\n• Salat — tunda og'ir emas\n• Pizza — maxsus kechki dam olish\n\nKechki musiqa ham tavsiya qilayinmi?",
      foods: ['shurva', 'salat'],
    };
  }

  // Salom
  if (query.includes('salom') || query.includes('assalom') || query.includes('hello') || query.includes('hi')) {
    return { type: 'text', text: "Vaalaykum assalom! Men Darrov AI — ovqat, musiqa va ko'proq narsada yordam beraman.\n\nNimani xohlaysiz?\n• 🍽 Ovqat tavsiya\n• 🎵 Musiqa playlist\n• 📸 Ovqat vizuali\n• 💪 Sport ovqatlari" };
  }

  // Rahmat
  if (query.includes('rahmat') || query.includes('raxmat')) {
    return { type: 'text', text: "Arzimaydi! Yana savol bo'lsa, bemalol so'rang. Yoqimli ishtaha! 🍽" };
  }

  // Mavsumiy
  if (query.includes('yoz') || query.includes('issiq')) {
    return {
      type: 'food',
      text: "Yoz issig'ida salqin va yengil ovqatlar:\n\n• Sovuq salat — tetiklashtiradi\n• Mevali desert — vitaminlar\n• Suyuq taomlar — suv balansini saqlaydi\n\nIssiq paytga mos sokin musiqa ham qo'shayinmi?",
      foods: ['salat', 'cezar'],
    };
  }
  if (query.includes('qish') || query.includes('sovuq')) {
    return {
      type: 'food',
      text: "Qish sovug'ida issiq va to'yimli ovqatlar:\n\n• Sho'rva — isitadi va kuchaytiradi\n• Palov — energiya beradi\n• Lag'mon — issiq va barakali\n\nMashxur qishki taomlar buyurtma qilish uchun tayyor!",
      foods: ['shurva', 'palov'],
    };
  }

  // Default
  return {
    type: 'food',
    text: "Tushundim! Sizga yordam berish uchun aniqroq aytsangiz:\n\n• 🍽 Ovqat: ozish, sport, tushlik...\n• 🎵 Musiqa: nonushta, sport, kechki...\n• 📸 Vizual: sog'lom, milliy...\n\nQaysi mavzuda maslahat kerak?",
    foods: ['palov', 'cezar'],
  };
};

// ─── XABAR TURLARI ───
interface Msg {
  role: 'user' | 'ai';
  text: string;
  type?: MsgType;
  foods?: string[];
  music?: typeof MUSIC_RECS[0][];
  photos?: typeof PHOTO_RECS[0][];
}

export function AiChatScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'ai', type: 'text',
    text: `Salom${user?.name ? ', ' + user.name : ''}! Men Darrov AI.\n\nNimani xohlaysiz?\n• 🍽 Ovqat tavsiya\n• 🎵 Musiqa playlist\n• 📸 Ovqat vizuali\n• 💪 Sport ovqatlari`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    scrollDown();

    setTimeout(() => {
      const res = getAiResponse(msg);
      setMsgs(prev => [...prev, { role: 'ai', text: res.text, type: res.type, foods: res.foods, music: res.music, photos: res.photos }]);
      setLoading(false);
      scrollDown();
    }, 700);
  };

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

  const QUICK = [
    "Tushlik nima ye?", "Sport uchun ovqat", "Nonushta musiqasi",
    "Ozishga tavsiya", "O'zbek taomi", "Kechki musiqa",
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: T.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[s.hdr, { backgroundColor: T.hdrBg, borderBottomColor: T.bd }]}>
        <TouchableOpacity style={[s.back, { backgroundColor: T.bg3 }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <IcArrowLeft color={T.t2} size={rs(20, 24)} />
        </TouchableOpacity>
        <View style={[s.aiAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
          <IcRobot color={C.p} size={rs(22, 27)} />
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
        {/* Xabarlar */}
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: S.md }} showsVerticalScrollIndicator={false}>
          {msgs.map((m, i) => (
            <View key={i}>
              <View style={[s.msgWrap, m.role === 'user' && { flexDirection: 'row-reverse' }]}>
                {m.role === 'ai' && (
                  <View style={[s.msgAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                    <IcRobot color={C.p} size={rs(13, 16)} />
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

              {/* Ovqat kartalari */}
              {m.foods && m.foods.map((food, fi) => {
                const link = findFoodLink(food);
                if (!link) return null;
                return (
                  <TouchableOpacity key={fi}
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

              {/* Musiqa kartalari */}
              {m.music && m.music.map((track, ti) => (
                <View key={ti} style={[s.musicCard, { backgroundColor: T.card, borderColor: isDark ? '#3a1a4a' : '#e8d0f0' }]}>
                  <View style={[s.musicEmoji, { backgroundColor: '#7C4DFF22' }]}>
                    <Text style={{ fontSize: rs(22, 28) }}>{track.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.musicTitle, { color: T.t1 }]}>{track.title}</Text>
                    <Text style={[s.musicArtist, { color: '#7C4DFF' }]}>{track.genre}</Text>
                    <Text style={[s.musicDesc, { color: T.t3 }]}>{track.desc}</Text>
                  </View>
                  <IcMusic color="#7C4DFF" size={rs(18, 22)} />
                </View>
              ))}

              {/* Rasm / vizual kartalari */}
              {m.photos && m.photos.map((ph, pi) => (
                <View key={pi} style={[s.photoCard, { backgroundColor: T.card, borderColor: T.bd }]}>
                  <View style={[s.photoEmoji, { backgroundColor: isDark ? '#1a1a1a' : '#f8f8f8' }]}>
                    <Text style={{ fontSize: rs(24, 30) }}>{ph.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.photoName, { color: T.t1 }]}>{ph.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.xs, marginTop: 3 }}>
                      <Text style={[s.photoKcal, { color: C.gn }]}>{ph.kcal}</Text>
                      <Text style={[s.photoDot, { color: T.t4 }]}>•</Text>
                      <Text style={[s.photoMood, { color: T.t3 }]}>{ph.mood}</Text>
                    </View>
                    <Text style={[s.photoColors, { color: T.t4 }]}>Rang: {ph.colors}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}

          {loading && (
            <View style={s.msgWrap}>
              <View style={[s.msgAv, { backgroundColor: isDark ? '#2a1400' : C.plt, borderColor: C.p }]}>
                <IcRobot color={C.p} size={rs(13, 16)} />
              </View>
              <View style={[s.bubble, { backgroundColor: T.bg2, borderColor: T.bd, borderWidth: 0.5, paddingVertical: rs(12, 15) }]}>
                <ActivityIndicator size="small" color={C.p} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Tezkor savollar */}
        <View style={{ height: rs(46, 58) }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: S.md, gap: S.sm, alignItems: 'center' }}>
            {QUICK.map((q, i) => (
              <TouchableOpacity key={i} style={[s.chip, { backgroundColor: T.bg2, borderColor: C.p }]} onPress={() => send(q)} activeOpacity={0.8}>
                <Text style={[s.chipTxt, { color: C.p }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Kiritish */}
        <View style={[s.inpRow, { backgroundColor: T.hdrBg, borderTopColor: T.bd }]}>
          <TextInput
            style={[s.inp, { color: T.t1, backgroundColor: T.bg3 }]}
            value={input} onChangeText={setInput}
            placeholder="Savol bering..." placeholderTextColor={T.t4}
            onSubmitEditing={() => send()} returnKeyType="send" maxLength={300}
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: input.trim() ? C.p : T.bg3 }]}
            onPress={() => send()} disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            <IcSend color={input.trim() ? '#fff' : T.t4} size={rs(17, 21)} />
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
  aiAv: { width: rs(44, 54), height: rs(44, 54), borderRadius: rs(22, 27), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: F.lg, fontWeight: '800' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: rs(6, 8), height: rs(6, 8), borderRadius: rs(3, 4) },
  onlineTxt: { fontSize: F.xs, fontWeight: '700' },

  msgWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: S.sm, marginBottom: S.md },
  msgAv: { width: rs(30, 36), height: rs(30, 36), borderRadius: rs(15, 18), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: rs(16, 20), padding: S.md, maxWidth: '78%' },
  bubbleTxt: { fontSize: F.md, fontWeight: '500', lineHeight: rs(20, 24) },

  foodCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginLeft: rs(38, 46), marginBottom: S.sm, borderWidth: 1.5, borderRadius: R.md, padding: S.sm },
  foodEmoji: { width: rs(42, 50), height: rs(42, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  foodName: { fontSize: F.sm, fontWeight: '800' },
  foodRest: { fontSize: F.xs, fontWeight: '600', marginTop: 2 },
  foodPrice: { fontSize: F.sm, fontWeight: '800' },
  foodGo: { fontSize: F.xs, fontWeight: '700', marginTop: 2 },

  musicCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginLeft: rs(38, 46), marginBottom: S.sm, borderWidth: 1.5, borderRadius: R.md, padding: S.sm },
  musicEmoji: { width: rs(42, 50), height: rs(42, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  musicTitle: { fontSize: F.sm, fontWeight: '800' },
  musicArtist: { fontSize: F.xs, fontWeight: '700', marginTop: 1 },
  musicDesc: { fontSize: rs(10, 12), fontWeight: '500', marginTop: 2 },

  photoCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginLeft: rs(38, 46), marginBottom: S.sm, borderWidth: 1, borderRadius: R.md, padding: S.sm },
  photoEmoji: { width: rs(44, 52), height: rs(44, 52), borderRadius: rs(14, 17), alignItems: 'center', justifyContent: 'center' },
  photoName: { fontSize: F.sm, fontWeight: '800' },
  photoKcal: { fontSize: F.xs, fontWeight: '700' },
  photoDot: { fontSize: F.xs },
  photoMood: { fontSize: F.xs, fontWeight: '600' },
  photoColors: { fontSize: rs(10, 12), fontWeight: '500', marginTop: 2 },

  chip: { paddingVertical: rs(7, 9), paddingHorizontal: rs(13, 17), borderRadius: R.full, borderWidth: 1, height: rs(34, 42), justifyContent: 'center' },
  chipTxt: { fontSize: F.xs, fontWeight: '700' },

  inpRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md, borderTopWidth: 1 },
  inp: { flex: 1, borderRadius: rs(13, 16), paddingHorizontal: S.md, paddingVertical: rs(11, 14), fontSize: F.md, maxHeight: rs(100, 120) },
  sendBtn: { width: rs(44, 52), height: rs(44, 52), borderRadius: rs(14, 17), alignItems: 'center', justifyContent: 'center' },
});
