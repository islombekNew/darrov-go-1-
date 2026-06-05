import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Animated, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, S, R, F, rs, normalizePhone } from '../../theme';
import { getRoleByPhone, COIN, REGIONS } from '../../constants';
import { useAuthStore, useThemeStore } from '../../store';

const ROLES = [
  { id:'customer',         icon:'🛍', name:'Mijoz',          desc:'Ovqat buyurtma qilish' },
  { id:'restaurant_owner', icon:'🏪', name:'Restoran egasi', desc:'Menyu va buyurtmalar' },
  { id:'courier',          icon:'🛵', name:'Kuryer',         desc:'Buyurtmalar yetkazish' },
];

export function SplashScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue:1, duration:1000, useNativeDriver:true }).start(); }, []);
  return (
    <View style={{ flex:1, backgroundColor:C.p, alignItems:'center', justifyContent:'center', padding:S.xl }}>
      <Animated.View style={{ opacity:fade, alignItems:'center', width:'100%' }}>
        <View style={{ width:rs(110,134), height:rs(110,134), backgroundColor:'rgba(255,255,255,0.2)', borderRadius:rs(32,39), alignItems:'center', justifyContent:'center', marginBottom:S.lg }}>
          <Text style={{ fontSize:rs(60,73) }}>🛵</Text>
        </View>
        <Text style={{ fontSize:rs(44,54), fontWeight:'900', color:'#fff', letterSpacing:-1.5, marginBottom:S.sm }}>DarrovGo</Text>
        <Text style={{ fontSize:F.md, color:'rgba(255,255,255,0.85)', textAlign:'center', fontWeight:'600', lineHeight:rs(22,27), marginBottom:rs(44,54) }}>
          {'Tez, qulay va mazali\novqat yetkazib berish'}
        </Text>
        <TouchableOpacity style={{ backgroundColor:'#fff', borderRadius:R.lg, paddingVertical:rs(16,20), width:'100%', alignItems:'center', marginBottom:S.sm }} onPress={() => navigation.navigate('Login')} activeOpacity={0.87}>
          <Text style={{ fontSize:F.lg, fontWeight:'900', color:C.p }}>Kirish</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor:'rgba(255,255,255,0.15)', borderWidth:2, borderColor:'rgba(255,255,255,0.45)', borderRadius:R.lg, paddingVertical:rs(15,19), width:'100%', alignItems:'center' }} onPress={() => navigation.navigate('RegRole')} activeOpacity={0.87}>
          <Text style={{ fontSize:F.lg, fontWeight:'800', color:'#fff' }}>{"Ro'yxatdan o'tish"}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection:'row', alignItems:'center', gap:S.sm, marginTop:S.lg, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:R.full, paddingVertical:S.sm, paddingHorizontal:S.md }}>
          <Text style={{ fontSize:rs(15,18) }}>🎁</Text>
          <Text style={{ fontSize:F.xs, color:'rgba(255,255,255,0.9)', fontWeight:'700' }}>{`Ro'yxatdan o'tganda +${COIN.WELCOME} coin sovg'a!`}</Text>
        </View>
        <Text style={{ marginTop:S.xl, fontSize:rs(10,12), color:'rgba(255,255,255,0.35)', fontWeight:'600' }}>darrovgo.uz</Text>
      </Animated.View>
    </View>
  );
}

export function LoginScreen({ navigation }: any) {
  const { T } = useThemeStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const ok = phone.length === 9;
  const onSend = async () => {
    if (!ok) { setErr("9 ta raqam kiriting"); return; }
    setLoading(true);
    try {
      const full = normalizePhone(phone);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      navigation.navigate('LoginOtp', { phone: full, otp });
    } catch(e:any) { setErr(e.message); }
    finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:T.bg }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:S.lg, paddingBottom:S.xxl }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={[ss.back, { backgroundColor:T.bg3 }]} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize:rs(20,24), color:T.t2 }}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={[ss.h1, { color:T.t1 }]}>Telefon raqam</Text>
          <Text style={[ss.sub, { color:T.t3 }]}>SMS orqali bir martalik kod yuboramiz</Text>
          <Text style={[ss.lbl, { color:T.t3 }]}>TELEFON RAQAM</Text>
          <View style={[ss.row, { backgroundColor:T.bg2, borderColor:ok?C.gn:err?C.rd:T.bd }]}>
            <Text style={{ fontSize:rs(20,24) }}>🇺🇿</Text>
            <Text style={{ fontSize:rs(16,18), fontWeight:'800', color:T.t2 }}>+998</Text>
            <TextInput style={[ss.inp, { color:T.t1 }]} value={phone} onChangeText={t=>{setPhone(t.replace(/\D/g,'').slice(0,9));setErr('');}} placeholder="90 000 00 00" placeholderTextColor={T.t4} keyboardType="phone-pad" maxLength={9} autoFocus/>
            {ok && <Text style={{ color:C.gn, fontSize:rs(18,22) }}>✓</Text>}
          </View>
          {!!err && <Text style={{ fontSize:F.xs, color:C.rd, fontWeight:'700', marginBottom:S.sm }}>{err}</Text>}
          <TouchableOpacity style={[ss.btn, { backgroundColor:ok?C.p:T.bg3 }]} onPress={onSend} disabled={!ok||loading} activeOpacity={0.87}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={[ss.bTxt, { color:ok?'#fff':T.t4 }]}>SMS kod yuborish</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function LoginOtpScreen({ navigation, route }: any) {
  const { T } = useThemeStore();
  const { phone, otp:devOtp } = route.params;
  const [digits, setDigits] = useState(['','','','']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const refs = useRef<(TextInput|null)[]>([]);
  const { setAuth } = useAuthStore();
  useEffect(() => { const iv = setInterval(()=>setTimer(t=>t>0?t-1:0),1000); return ()=>clearInterval(iv); },[]);
  const onChange = (txt:string,i:number) => {
    const d=txt.replace(/\D/g,'').slice(-1); const next=[...digits]; next[i]=d; setDigits(next);
    if(d&&i<3) refs.current[i+1]?.focus();
    if(i===3&&d) verify(next.join(''));
  };
  const onKey=(e:any,i:number)=>{ if(e.nativeEvent.key==='Backspace'&&!digits[i]&&i>0) refs.current[i-1]?.focus(); };
  const verify=async(code:string)=>{
    if(code.length<4) return; setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    const role=getRoleByPhone(phone)?? 'customer';
    setAuth({ id:'u_'+Date.now(), phone, name:role==='superadmin'?'Ilova Egasi':role==='admin'?'Admin':'Foydalanuvchi', role:role as any, status:'active', regionId:'tsh', regionName:'Toshkent', coins:role==='customer'?COIN.WELCOME:0, streak:0, referralCount:0 }, 'tok_'+Date.now());
    setLoading(false);
  };
  const all=digits.every(d=>d);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}} edges={['top']}>
      <ScrollView contentContainerStyle={{padding:S.lg,paddingBottom:S.xxl}}>
        <TouchableOpacity style={[ss.back,{backgroundColor:T.bg3}]} onPress={()=>navigation.goBack()}>
          <Text style={{fontSize:rs(20,24),color:T.t2}}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={[ss.h1,{color:T.t1}]}>SMS kodi</Text>
        <View style={{flexDirection:'row',justifyContent:'center',gap:rs(12,15),marginVertical:S.lg}}>
          {digits.map((d,i)=>(
            <TextInput key={i} ref={el=>{refs.current[i]=el;}}
              style={{width:rs(68,83),height:rs(76,93),borderWidth:2.5,borderColor:d?(all?C.gn:C.p2):T.bd,borderRadius:R.md,fontSize:rs(30,37),fontWeight:'900',color:T.t1,backgroundColor:T.bg2,textAlign:'center'}}
              value={d} onChangeText={t=>onChange(t,i)} onKeyPress={e=>onKey(e,i)} keyboardType="numeric" maxLength={1} selectTextOnFocus
            />
          ))}
        </View>
        <Text style={{textAlign:'center',fontSize:F.sm,color:T.t3,fontWeight:'700',marginBottom:S.sm}}>{timer>0?`Kod ${timer} soniyada eskiradi`:'Kod eskirdi'}</Text>
        {!!devOtp&&<View style={{flexDirection:'row',gap:S.sm,backgroundColor:T.bg2,borderWidth:1.5,borderColor:C.gn,borderRadius:R.md,padding:S.md,marginBottom:S.md}}>
          <Text>🧪</Text><Text style={{flex:1,fontSize:F.sm,color:C.gn,fontWeight:'700'}}>Test OTP: {devOtp}</Text>
        </View>}
        <TouchableOpacity style={[ss.btn,{backgroundColor:all?C.p:T.bg3}]} onPress={()=>verify(digits.join(''))} disabled={!all||loading} activeOpacity={0.87}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={[ss.bTxt,{color:all?'#fff':T.t4}]}>Tasdiqlash</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RegRoleScreen({ navigation }: any) {
  const { T, isDark } = useThemeStore();
  const [sel, setSel] = useState('customer');
  return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}} edges={['top']}>
      <ScrollView contentContainerStyle={{padding:S.lg,paddingBottom:S.xxl}}>
        <TouchableOpacity style={[ss.back,{backgroundColor:T.bg3}]} onPress={()=>navigation.goBack()}>
          <Text style={{fontSize:rs(20,24),color:T.t2}}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={[ss.h1,{color:T.t1}]}>Siz kim?</Text>
        <Text style={[ss.sub,{color:T.t3}]}>Rolingizga mos panel ochiladi</Text>
        {ROLES.map(r=>(
          <TouchableOpacity key={r.id} style={{flexDirection:'row',alignItems:'center',gap:rs(14,17),backgroundColor:T.bg2,borderWidth:2.5,borderColor:sel===r.id?C.p:T.bd,borderRadius:R.lg,padding:rs(16,20),marginBottom:S.md}} onPress={()=>setSel(r.id)} activeOpacity={0.87}>
            <View style={{width:rs(54,66),height:rs(54,66),backgroundColor:sel===r.id?(isDark?'#2a1400':C.plt):T.bg3,borderRadius:rs(17,21),alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:rs(27,33)}}>{r.icon}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.lg,fontWeight:'900',color:T.t1}}>{r.name}</Text>
              <Text style={{fontSize:F.sm,color:T.t3,fontWeight:'600',marginTop:3}}>{r.desc}</Text>
            </View>
            <View style={{width:rs(26,32),height:rs(26,32),borderRadius:rs(13,16),borderWidth:2.5,borderColor:sel===r.id?C.p:T.bd,backgroundColor:sel===r.id?C.p:'transparent',alignItems:'center',justifyContent:'center'}}>
              {sel===r.id&&<View style={{width:rs(10,12),height:rs(10,12),borderRadius:rs(5,6),backgroundColor:'#fff'}}/>}
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[ss.btn,{backgroundColor:C.p}]} onPress={()=>navigation.navigate('RegInfo',{role:sel})} activeOpacity={0.87}>
          <Text style={[ss.bTxt,{color:'#fff'}]}>Davom etish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RegInfoScreen({ navigation, route }: any) {
  const { T } = useThemeStore();
  const { role } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.length === 9;
  const onNext = async () => {
    setLoading(true);
    try {
      const full = normalizePhone(phone);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      navigation.navigate('RegOtp', { role, name:name.trim(), phone:full, otp });
    } catch(e:any) { Alert.alert('Xato', e.message); }
    finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding:S.lg,paddingBottom:S.xxl}} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={[ss.back,{backgroundColor:T.bg3}]} onPress={()=>navigation.goBack()}>
            <Text style={{fontSize:rs(20,24),color:T.t2}}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={[ss.h1,{color:T.t1}]}>{"Ma'lumotlar"}</Text>
          <Text style={[ss.lbl,{color:T.t3}]}>ISM VA FAMILIYA</Text>
          <View style={[ss.row,{backgroundColor:T.bg2,borderColor:nameOk?C.gn:T.bd,marginBottom:S.md}]}>
            <Text style={{fontSize:rs(18,22)}}>👤</Text>
            <TextInput style={[ss.inp,{color:T.t1}]} value={name} onChangeText={setName} placeholder="Anvar Salimov" placeholderTextColor={T.t4} autoCapitalize="words"/>
          </View>
          <Text style={[ss.lbl,{color:T.t3}]}>TELEFON RAQAM</Text>
          <View style={[ss.row,{backgroundColor:T.bg2,borderColor:phoneOk?C.gn:T.bd}]}>
            <Text style={{fontSize:rs(20,24)}}>🇺🇿</Text>
            <Text style={{fontSize:rs(16,18),fontWeight:'800',color:T.t2}}>+998</Text>
            <TextInput style={[ss.inp,{color:T.t1}]} value={phone} onChangeText={t=>setPhone(t.replace(/\D/g,'').slice(0,9))} placeholder="90 000 00 00" placeholderTextColor={T.t4} keyboardType="phone-pad" maxLength={9}/>
          </View>
          <TouchableOpacity style={[ss.btn,{backgroundColor:nameOk&&phoneOk?C.p:T.bg3}]} onPress={onNext} disabled={!nameOk||!phoneOk||loading} activeOpacity={0.87}>
            {loading?<ActivityIndicator color="#fff"/>:<Text style={[ss.bTxt,{color:nameOk&&phoneOk?'#fff':T.t4}]}>SMS tasdiqlash</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function RegOtpScreen({ navigation, route }: any) {
  const { T } = useThemeStore();
  const { phone, name, role, otp:devOtp } = route.params;
  const [digits, setDigits] = useState(['','','','']);
  const refs = useRef<(TextInput|null)[]>([]);
  const onChange=(txt:string,i:number)=>{
    const d=txt.replace(/\D/g,'').slice(-1); const next=[...digits]; next[i]=d; setDigits(next);
    if(d&&i<3) refs.current[i+1]?.focus();
    if(i===3&&d) navigation.navigate('RegRegion',{phone,name,role,code:next.join('')});
  };
  const onKey=(e:any,i:number)=>{ if(e.nativeEvent.key==='Backspace'&&!digits[i]&&i>0) refs.current[i-1]?.focus(); };
  const all=digits.every(d=>d);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}} edges={['top']}>
      <ScrollView contentContainerStyle={{padding:S.lg,paddingBottom:S.xxl}}>
        <TouchableOpacity style={[ss.back,{backgroundColor:T.bg3}]} onPress={()=>navigation.goBack()}>
          <Text style={{fontSize:rs(20,24),color:T.t2}}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={[ss.h1,{color:T.t1}]}>SMS tasdiqlash</Text>
        <View style={{flexDirection:'row',justifyContent:'center',gap:rs(12,15),marginVertical:S.lg}}>
          {digits.map((d,i)=>(
            <TextInput key={i} ref={el=>{refs.current[i]=el;}}
              style={{width:rs(68,83),height:rs(76,93),borderWidth:2.5,borderColor:d?C.p2:T.bd,borderRadius:R.md,fontSize:rs(30,37),fontWeight:'900',color:T.t1,backgroundColor:T.bg2,textAlign:'center'}}
              value={d} onChangeText={t=>onChange(t,i)} onKeyPress={e=>onKey(e,i)} keyboardType="numeric" maxLength={1} selectTextOnFocus
            />
          ))}
        </View>
        {!!devOtp&&<View style={{flexDirection:'row',gap:S.sm,backgroundColor:T.bg2,borderWidth:1.5,borderColor:C.gn,borderRadius:R.md,padding:S.md,marginBottom:S.md}}>
          <Text>🧪</Text><Text style={{flex:1,fontSize:F.sm,color:C.gn,fontWeight:'700'}}>Test OTP: {devOtp}</Text>
        </View>}
        <TouchableOpacity style={[ss.btn,{backgroundColor:all?C.p:T.bg3}]} onPress={()=>navigation.navigate('RegRegion',{phone,name,role,code:digits.join('')})} disabled={!all} activeOpacity={0.87}>
          <Text style={[ss.bTxt,{color:all?'#fff':T.t4}]}>Davom etish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RegRegionScreen({ navigation, route }: any) {
  const { T } = useThemeStore();
  const { phone, name, role } = route.params;
  const [sel, setSel] = useState('tsh');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const onDone = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,900));
    const finalRole = getRoleByPhone(phone) ?? role;
    const region = REGIONS.find(r=>r.id===sel);
    setAuth({ id:'u_'+Date.now(), phone, name, role:finalRole as any, status:finalRole==='customer'?'active':'pending', regionId:sel, regionName:region?.name??'Toshkent', coins:finalRole==='customer'?COIN.WELCOME:0, streak:0, referralCount:0 }, 'tok_'+Date.now());
    setLoading(false);
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:T.bg}} edges={['top']}>
      <ScrollView contentContainerStyle={{padding:S.lg,paddingBottom:S.xxl}}>
        <TouchableOpacity style={[ss.back,{backgroundColor:T.bg3}]} onPress={()=>navigation.goBack()}>
          <Text style={{fontSize:rs(20,24),color:T.t2}}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={[ss.h1,{color:T.t1}]}>Hudud</Text>
        {REGIONS.map(r=>(
          <TouchableOpacity key={r.id} style={{flexDirection:'row',alignItems:'center',gap:rs(12,15),backgroundColor:T.bg2,borderWidth:2.5,borderColor:sel===r.id?C.p:T.bd,borderRadius:R.md,padding:rs(14,17),marginBottom:S.sm,opacity:r.active?1:0.45}} onPress={()=>r.active&&setSel(r.id)} disabled={!r.active} activeOpacity={0.87}>
            <View style={{width:rs(44,54),height:rs(44,54),backgroundColor:T.bg3,borderRadius:rs(13,16),alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:rs(22,27)}}>🏙️</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:F.lg,fontWeight:'800',color:T.t1}}>{r.name}</Text>
              <Text style={{fontSize:F.xs,color:T.t3,fontWeight:'700',marginTop:2}}>{r.active?'Faol':'Yaqinda'}</Text>
            </View>
            {r.active&&<View style={{width:rs(28,34),height:rs(28,34),borderRadius:rs(14,17),borderWidth:2.5,borderColor:sel===r.id?C.p:T.bd,backgroundColor:sel===r.id?C.p:'transparent',alignItems:'center',justifyContent:'center'}}>
              {sel===r.id&&<Text style={{color:'#fff',fontWeight:'900',fontSize:F.md}}>✓</Text>}
            </View>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[ss.btn,{backgroundColor:C.gn,marginTop:S.md}]} onPress={onDone} disabled={loading} activeOpacity={0.87}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={[ss.bTxt,{color:'#fff'}]}>{"✅ Ro'yxatdan o'tish"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  back: { width:rs(40,50), height:rs(40,50), borderRadius:rs(13,16), alignItems:'center', justifyContent:'center', marginBottom:S.lg },
  h1:   { fontSize:rs(26,32), fontWeight:'900', marginBottom:S.xs },
  sub:  { fontSize:F.md, fontWeight:'600', marginBottom:S.lg },
  lbl:  { fontSize:F.xs, fontWeight:'800', textTransform:'uppercase', letterSpacing:0.5, marginBottom:S.sm },
  row:  { flexDirection:'row', alignItems:'center', borderWidth:2.5, borderRadius:R.md, paddingHorizontal:S.md, height:rs(56,68), marginBottom:S.sm, gap:S.sm },
  inp:  { flex:1, fontSize:rs(17,21), fontWeight:'700', padding:0 },
  btn:  { borderRadius:R.lg, paddingVertical:rs(17,21), alignItems:'center', marginTop:S.sm },
  bTxt: { fontSize:F.lg, fontWeight:'900' },
});
