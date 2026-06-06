import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, fmtPrice } from '../../theme';
import { useThemeStore, useAuthStore } from '../../store';
import { IcArrowLeft, IcSend, IcMusic, IcRobot, IcStore, IcFire } from '../../components/Icons';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY ?? '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const SYSTEM_PROMPT = `Sen DarrovGo ilovasining AI yordamchisisisan — Darrov AI. Sen faqat O'zbek tilida javob berasan.
DarrovGo — O'zbekistondagi ovqat yetkazib berish ilovasi.

Sening vazifang:
1. Ovqat tavsiya qilish (palov, lag'mon, burger, pizza, sushi va boshqalar)
2. Sog'lom ovqatlanish bo'yicha maslahat berish
3. Musiqa playlist tavsiya (ovqat paytiga mos)
4. Kaloriya va ozuqa haqida ma'lumot
5. O'zbek milliy taomlari haqida tushuntirish

MUHIM QOIDALAR:
- FAQAT O'zbek tilida javob ber
- Qisqa va aniq javob ber (3-5 jumladan ko'p bo'lmasin)
- Har doim do'stona va professional bo'l
- Ovqat buyurtma qilishga undovchi gap qo'sh
- Emojidan foydalanma (ular ilovada ko'rinmaydi)
- Faqat DarrovGo ilovasiga oid mavzularda javob ber`;

const MUSIC_RECS = [
  { mood: 'nonushta', title: 'Morning Vibes', genre: 'Lofi / Chill', desc: 'Sokin nonushta musiqasi' },
  { mood: 'nonushta', title: 'Acoustic Morning', genre: 'Acoustic', desc: 'Akustik gitara' },
  { mood: 'tushlik', title: 'Jazz Café', genre: 'Jazz / Bossa Nova', desc: 'Yengil jaz' },
  { mood: 'tushlik', title: 'Pop Hits', genre: 'Pop', desc: 'Energiya beruvchi qo\'shiqlar' },
  { mood: 'kechki', title: 'Classical Piano', genre: 'Classical', desc: 'Klassik piano' },
  { mood: 'kechki', title: 'Smooth R&B', genre: 'R&B / Soul', desc: 'Yumshoq R&B' },
  { mood: 'sport', title: 'Workout Beats', genre: 'EDM', desc: 'Sport uchun energiya' },
  { mood: 'sport', title: 'Hip-Hop Power', genre: 'Hip-Hop', desc: 'Mashqlar uchun motivatsiya' },
  { mood: 'relax', title: 'Ocean Sounds', genre: 'Ambient', desc: 'Tabiat tovushlari' },
  { mood: "o'zbek", title: "O'zbek Pop 2024", genre: "O'zbek pop", desc: "Eng yangi o'zbek qo'shiqlari" },
];

interface Msg {
  role: 'user' | 'ai';
  text: string;
  music?: typeof MUSIC_RECS;
}

async function askGemini(history: Msg[], userMsg: string): Promise<string> {
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: "Xush kelibsiz! Men Darrov AI — ovqat va sog'lom hayot bo'yicha maslahatchi. Qanday yordam bera olaman?" }] },
    ...history.slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: userMsg }] },
  ];

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gemini xatosi');
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Uzur, javob olishda xatolik yuz berdi.';
}

const isMusicQuery = (q: string) => {
  const lq = q.toLowerCase();
  return lq.includes('musiqa') || lq.includes('playlist') || lq.includes('qo\'shiq') || lq.includes('music');
};

const getMusicMood = (q: string): string => {
  const lq = q.toLowerCase();
  if (lq.includes('nonushta') || lq.includes('ertalab')) return 'nonushta';
  if (lq.includes('tushlik') || lq.includes('tush')) return 'tushlik';
  if (lq.includes('kechki') || lq.includes('kech')) return 'kechki';
  if (lq.includes('sport') || lq.includes('mashq')) return 'sport';
  if (lq.includes('dam') || lq.includes('relax')) return 'relax';
  if (lq.includes("o'zbek") || lq.includes('milliy')) return "o'zbek";
  return 'tushlik';
};

const QUICK = [
  "Tushlik nima ye?", "Sport ovqat", "Nonushta musiqasi",
  "Ozishga tavsiya", "O'zbek taomi", "Kaloriya haqida",
];

export function AiChatScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'ai',
    text: `Salom${user?.name ? ', ' + user.name : ''}! Men Darrov AI.\n\nNimani xohlaysiz:\n- Ovqat tavsiya\n- Musiqa playlist\n- Kaloriya haqida\n- Sport ovqatlari`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', text: msg };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);
    scrollDown();

    try {
      const music = isMusicQuery(msg) ? MUSIC_RECS.filter(m => m.mood === getMusicMood(msg)).slice(0, 2) : undefined;
      const aiText = await askGemini([...msgs, userMsg], msg);
      setMsgs(prev => [...prev, { role: 'ai', text: aiText, music }]);
    } catch (e: any) {
      setMsgs(prev => [...prev, { role: 'ai', text: `Uzur, hozir javob bera olmadim. Internet aloqangizni tekshiring.\n\nXato: ${e.message}` }]);
    } finally {
      setLoading(false);
      scrollDown();
    }
  }, [input, loading, msgs]);

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
            <Text style={[s.onlineTxt, { color: C.gn }]}>Gemini AI bilan ishlaydi</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        {/* Xabarlar */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: S.md, paddingBottom: S.lg }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                    : { backgroundColor: isDark ? T.bg3 : '#fff', borderColor: T.bd, borderWidth: 1, borderBottomLeftRadius: 4 },
                ]}>
                  <Text style={[s.bubbleTxt, { color: m.role === 'user' ? '#fff' : T.t1 }]}>{m.text}</Text>
                </View>
              </View>

              {/* Musiqa kartalari */}
              {m.music && m.music.map((track, ti) => (
                <View key={ti} style={[s.musicCard, { backgroundColor: T.card, borderColor: isDark ? '#3a1a4a' : '#e8d0f0' }]}>
                  <View style={[s.musicIcon, { backgroundColor: '#7C4DFF22' }]}>
                    <IcMusic color="#7C4DFF" size={rs(20, 24)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.musicTitle, { color: T.t1 }]}>{track.title}</Text>
                    <Text style={[s.musicGenre, { color: '#7C4DFF' }]}>{track.genre}</Text>
                    <Text style={[s.musicDesc, { color: T.t3 }]}>{track.desc}</Text>
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
              <View style={[s.bubble, { backgroundColor: isDark ? T.bg3 : '#fff', borderColor: T.bd, borderWidth: 1, paddingVertical: rs(12, 15) }]}>
                <ActivityIndicator size="small" color={C.p} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Tezkor savollar */}
        <View style={{ height: rs(48, 58), borderTopWidth: 0.5, borderTopColor: T.bd }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: S.md, gap: S.sm, alignItems: 'center' }}
            keyboardShouldPersistTaps="always"
          >
            {QUICK.map((q, i) => (
              <TouchableOpacity key={i} style={[s.chip, { backgroundColor: isDark ? T.bg3 : C.plt, borderColor: C.p }]} onPress={() => send(q)} activeOpacity={0.8}>
                <Text style={[s.chipTxt, { color: C.p }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Kiritish */}
        <View style={[s.inpRow, { backgroundColor: T.hdrBg, borderTopColor: T.bd }]}>
          <TextInput
            style={[s.inp, {
              color: isDark ? '#FFFFFF' : '#1a1a1a',
              backgroundColor: isDark ? '#333333' : '#F5F5F5',
              borderWidth: 1,
              borderColor: T.bd,
            }]}
            value={input}
            onChangeText={setInput}
            placeholder="Savol bering..."
            placeholderTextColor={isDark ? '#888888' : '#AAAAAA'}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            maxLength={300}
            multiline={false}
            keyboardType="default"
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: input.trim() && !loading ? C.p : T.bg3 }]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color={C.p} />
              : <IcSend color={input.trim() ? '#fff' : T.t4} size={rs(17, 21)} />
            }
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
  musicCard: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginLeft: rs(38, 46), marginBottom: S.sm, borderWidth: 1.5, borderRadius: R.md, padding: S.sm },
  musicIcon: { width: rs(42, 50), height: rs(42, 50), borderRadius: rs(13, 16), alignItems: 'center', justifyContent: 'center' },
  musicTitle: { fontSize: F.sm, fontWeight: '800' },
  musicGenre: { fontSize: F.xs, fontWeight: '700', marginTop: 1 },
  musicDesc: { fontSize: rs(10, 12), fontWeight: '500', marginTop: 2 },
  chip: { paddingVertical: rs(7, 9), paddingHorizontal: rs(13, 17), borderRadius: R.full, borderWidth: 1.5, height: rs(36, 44), justifyContent: 'center' },
  chipTxt: { fontSize: F.xs, fontWeight: '800' },
  inpRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, padding: S.md, borderTopWidth: 1 },
  inp: { flex: 1, borderRadius: rs(22, 26), paddingHorizontal: rs(16, 20), paddingVertical: rs(12, 15), fontSize: F.md, fontWeight: '500' },
  sendBtn: { width: rs(46, 54), height: rs(46, 54), borderRadius: rs(23, 27), alignItems: 'center', justifyContent: 'center' },
});
