import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { C, IS_TABLET, rs } from '../theme';
import { useAuthStore, useThemeStore } from '../store';

// Auth
import {
  SplashScreen, LoginScreen, LoginOtpScreen,
  RegRoleScreen, RegInfoScreen, RegOtpScreen, RegRegionScreen,
} from '../screens/auth/AuthScreens';

// Customer
import { CustomerHomeScreen } from '../screens/customer/HomeScreen';
import { MenuScreen, CartScreen } from '../screens/customer/MenuCartScreens';
import { MarraScreen } from '../screens/customer/MarraScreen';
import { CustomerProfileScreen } from '../screens/customer/ProfileScreen';
import { AiChatScreen } from '../screens/customer/AiChatScreen';
import {
  NotificationsScreen, AddressScreen, CardsScreen,
  ReferralScreen, TrackingScreen, CustomerOrdersScreen,
} from '../screens/customer/OtherScreens';

// Restaurant
import {
  RestaurantHomeScreen, RestaurantOrdersScreen,
  RestaurantMenuScreen, RestaurantStatsScreen, RestaurantProfileScreen,
} from '../screens/restaurant/RestaurantScreens';

// Courier
import {
  CourierHomeScreen, CourierHistoryScreen, CourierStatsScreen, CourierProfileScreen,
} from '../screens/courier/CourierScreens';
// Admin
import { AdminScreen } from '../screens/admin/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TIcon({ emoji, focused, isDark }: { emoji: string; focused: boolean; isDark: boolean }) {
  return (
    <View style={[ts.icon, focused && { backgroundColor: isDark ? '#2a1400' : C.plt }]}>
      <Text style={{ fontSize: IS_TABLET ? 24 : 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
    </View>
  );
}

const tabOpts = (T: any, isDark: boolean) => ({
  headerShown: false as const,
  tabBarStyle: { height: IS_TABLET ? 82 : 68, paddingBottom: IS_TABLET ? 14 : 10, paddingTop: IS_TABLET ? 8 : 5, backgroundColor: T.navBg, borderTopColor: T.navBd, borderTopWidth: 1 },
  tabBarLabelStyle: { fontSize: IS_TABLET ? 12 : 10, fontWeight: '800' as const, marginTop: -2 },
  tabBarActiveTintColor: C.p,
  tabBarInactiveTintColor: T.t4,
});

// ── MIJOZ TABS ──
function MijozTabs() {
  const { T, isDark } = useThemeStore();
  return (
    <Tab.Navigator screenOptions={tabOpts(T, isDark)}>
      <Tab.Screen name="MBosh" component={CustomerHomeScreen} options={{ tabBarLabel:'Bosh', tabBarIcon:({focused})=><TIcon emoji="🏠" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="MBuyurtma" component={CustomerOrdersScreen} options={{ tabBarLabel:'Buyurtmalar', tabBarIcon:({focused})=><TIcon emoji="📋" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="MAI" component={AiChatScreen} options={{ tabBarLabel:'Darrov AI', tabBarIcon:({focused})=><TIcon emoji="✨" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="MProfil" component={CustomerProfileScreen} options={{ tabBarLabel:'Profil', tabBarIcon:({focused})=><TIcon emoji="👤" focused={focused} isDark={isDark}/> }} />
    </Tab.Navigator>
  );
}

// ── RESTORAN TABS ──
function RestoranTabs() {
  const { T, isDark } = useThemeStore();
  return (
    <Tab.Navigator screenOptions={tabOpts(T, isDark)}>
      <Tab.Screen name="RBosh" component={RestaurantHomeScreen} options={{ tabBarLabel:'Bosh', tabBarIcon:({focused})=><TIcon emoji="🏪" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="RBuyurtma" component={RestaurantOrdersScreen} options={{ tabBarLabel:'Buyurtmalar', tabBarIcon:({focused})=><TIcon emoji="📋" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="RMenu" component={RestaurantMenuScreen} options={{ tabBarLabel:'Menyu', tabBarIcon:({focused})=><TIcon emoji="🍽" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="RStat" component={RestaurantStatsScreen} options={{ tabBarLabel:'Statistika', tabBarIcon:({focused})=><TIcon emoji="📊" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="RProfil" component={RestaurantProfileScreen} options={{ tabBarLabel:'Profil', tabBarIcon:({focused})=><TIcon emoji="👤" focused={focused} isDark={isDark}/> }} />
    </Tab.Navigator>
  );
}

// ── KURYER TABS ──
function KuryerTabs() {
  const { T, isDark } = useThemeStore();
  return (
    <Tab.Navigator screenOptions={tabOpts(T, isDark)}>
      <Tab.Screen name="KBosh" component={CourierHomeScreen} options={{ tabBarLabel:'Bosh', tabBarIcon:({focused})=><TIcon emoji="🏠" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="KStat" component={CourierStatsScreen} options={{ tabBarLabel:'Statistika', tabBarIcon:({focused})=><TIcon emoji="📊" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="KTarix" component={CourierHistoryScreen} options={{ tabBarLabel:'Tarix', tabBarIcon:({focused})=><TIcon emoji="📋" focused={focused} isDark={isDark}/> }} />
      <Tab.Screen name="KProfil" component={CourierProfileScreen} options={{ tabBarLabel:'Profil', tabBarIcon:({focused})=><TIcon emoji="👤" focused={focused} isDark={isDark}/> }} />
    </Tab.Navigator>
  );
}

function Loading() {
  return (
    <View style={{ flex:1, backgroundColor:C.p, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:IS_TABLET?80:60 }}>🛵</Text>
      <Text style={{ fontSize:IS_TABLET?48:38, fontWeight:'900', color:'#fff', marginTop:14, letterSpacing:-1 }}>DarrovGo</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { user } = useAuthStore();
  const { isDark, T } = useThemeStore();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors), background: T.bg, card: T.hdrBg, border: T.bd, text: T.t1 },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="LoginOtp" component={LoginOtpScreen} />
            <Stack.Screen name="RegRole" component={RegRoleScreen} />
            <Stack.Screen name="RegInfo" component={RegInfoScreen} />
            <Stack.Screen name="RegOtp" component={RegOtpScreen} />
            <Stack.Screen name="RegRegion" component={RegRegionScreen} />
          </>
        ) : (user.role === 'superadmin' || user.role === 'admin') ? (
          <Stack.Screen name="AdminPanel" component={AdminScreen} />
        ) : user.role === 'restaurant_owner' ? (
          <>
            <Stack.Screen name="RestoranTabs" component={RestoranTabs} />
          </>
        ) : user.role === 'courier' ? (
          <Stack.Screen name="KuryerTabs" component={KuryerTabs} />
        ) : (
          <>
            <Stack.Screen name="MijozTabs" component={MijozTabs} />
            <Stack.Screen name="Menu" component={MenuScreen} options={{ animation:'slide_from_bottom' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ animation:'slide_from_bottom' }} />
            <Stack.Screen name="Marra" component={MarraScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="Cards" component={CardsScreen} />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="AiChat" component={AiChatScreen} options={{ animation:'slide_from_bottom' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const ts = StyleSheet.create({
  icon: { width: IS_TABLET ? 54 : 44, height: IS_TABLET ? 54 : 44, borderRadius: IS_TABLET ? 18 : 14, alignItems: 'center', justifyContent: 'center' },
});
