// app/(vendor)/_layout.tsx
import * as React from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { useRouter, Slot, useSegments } from 'expo-router';
import {
  Home,
  User,
  ShoppingBag,
  Clipboard,
  LogOut,
  Bell,
  Menu,
} from 'lucide-react-native';
import {
  DrawerLayout,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';
import { User as UserTypes } from '@/types/user';
import ProtectUserRole from '@/components/ProtectUserRole';

const { width } = Dimensions.get('window');

export default function VendorLayout() {
  const [userInfo, setUserInfo] = React.useState<UserTypes>({
    name: '',
    role: 'vendor',
    email: '',
    authProviders: { emailPassword: false, facebookId: '', googleId: '' },
    createdAt: '',
    phone: '',
    photoURL: '',
  });

  const router = useRouter();
  const drawerRef = React.useRef<DrawerLayout>(null);

  const [activeTab, setActiveTab] = React.useState<
    'home' | 'products' | 'orders' | 'profile'
  >('home');
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;
  const segments = useSegments();

  React.useEffect(() => {
    const currentSegment = segments[segments.length - 1];
    const tabIndex =
      currentSegment === 'products'
        ? 1
        : currentSegment === 'orders'
        ? 2
        : currentSegment === 'profile'
        ? 3
        : 0;
    setActiveTab(
      currentSegment === 'products'
        ? 'products'
        : currentSegment === 'orders'
        ? 'orders'
        : currentSegment === 'profile'
        ? 'profile'
        : 'home',
    );
    Animated.spring(indicatorAnim, {
      toValue: tabIndex,
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start();
  }, [segments]);

  const loadUserData = async () => {
    const data = await fetchFirebaseUserInfo();
    if (data) {
      setUserInfo({
        name: data.name,
        photoURL: data.photoURL,
        email: data.email,
        role: 'vendor',
        phone: data.phone,
      });
    }
  };

  React.useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          await authStorage.clearAuthData();
          drawerRef.current?.closeDrawer();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleTabPress = (tab: 'home' | 'products' | 'orders' | 'profile') => {
    setActiveTab(tab);
    const positions = { home: 0, products: 1, orders: 2, profile: 3 };
    Animated.spring(indicatorAnim, {
      toValue: positions[tab],
      useNativeDriver: true,
    }).start();
    router.replace(`/(vendor)/${tab === 'home' ? '' : tab}` as any);
    drawerRef.current?.closeDrawer();
  };

  const renderDrawer = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={['#FFF', '#F3F4F6']}
        style={styles.drawerContainer}
      >
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: userInfo.photoURL || 'https://i.pravatar.cc/150?img=3',
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userInfo.name}</Text>
        </View>

        <View style={styles.drawerMenu}>
          {[
            {
              label: 'Dashboard',
              icon: Home,
              route: '/(vendor)' as any,
            },
            {
              label: 'Produits',
              icon: ShoppingBag,
              route: '/(vendor)/products' as const,
            },
            {
              label: 'Commandes',
              icon: Clipboard,
              route: '/(vendor)/orders' as const,
            },
            {
              label: 'Profil',
              icon: User,
              route: '/(vendor)/profile' as const,
            },
          ].map((item) => (
            <TouchableRipple
              key={item.label}
              style={styles.drawerItemMini}
              rippleColor="rgba(24,119,242,0.1)"
              onPress={() => {
                router.replace(item.route);
                drawerRef.current?.closeDrawer();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <item.icon size={22} color="#6A00F4" />
                <Text style={[styles.drawerText, { marginLeft: 12 }]}>
                  {item.label}
                </Text>
              </View>
            </TouchableRipple>
          ))}

          <View style={styles.separator} />

          <TouchableRipple
            style={styles.drawerItemMini}
            rippleColor="rgba(255,0,0,0.1)"
            onPress={handleLogout}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LogOut size={22} color="#E11D48" />
              <Text
                style={[
                  styles.drawerText,
                  { color: '#E11D48', marginLeft: 12 },
                ]}
              >
                Déconnexion
              </Text>
            </View>
          </TouchableRipple>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

  return (
    <ProtectUserRole role="vendor">
      <GestureHandlerRootView>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={300}
          drawerPosition="right"
          drawerBackgroundColor="#FFF"
          renderNavigationView={renderDrawer}
        >
          <LinearGradient colors={['#FFF', '#F9FAFB']} style={styles.container}>
            <Appbar.Header style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.subtitle}>Shop live</Text>
              </View>

              <View style={styles.iconsRight}>
                <TouchableRipple
                  style={styles.iconButton}
                  rippleColor="rgba(0,0,0,0.1)"
                >
                  <Bell size={28} color="#111827" />
                </TouchableRipple>

                <TouchableRipple
                  style={styles.iconButton}
                  rippleColor="rgba(0,0,0,0.1)"
                  onPress={() => drawerRef.current?.openDrawer()}
                >
                  <Menu size={30} color="#111827" />
                </TouchableRipple>
              </View>
            </Appbar.Header>

            <LinearGradient colors={['#FFF', '#F3F4F6']} style={styles.tabBar}>
              {['home', 'products', 'orders', 'profile'].map((tab, index) => (
                <TouchableRipple
                  key={tab}
                  style={styles.tabButtonMini}
                  onPress={() => handleTabPress(tab as any)}
                >
                  <View style={{ alignItems: 'center' }}>
                    {tab === 'home' && (
                      <Home
                        size={26}
                        color={activeTab === 'home' ? '#6A00F4' : '#8e8e93'}
                      />
                    )}
                    {tab === 'products' && (
                      <ShoppingBag
                        size={26}
                        color={activeTab === 'products' ? '#6A00F4' : '#8e8e93'}
                      />
                    )}
                    {tab === 'orders' && (
                      <Clipboard
                        size={26}
                        color={activeTab === 'orders' ? '#6A00F4' : '#8e8e93'}
                      />
                    )}
                    {tab === 'profile' && (
                      <User
                        size={26}
                        color={activeTab === 'profile' ? '#6A00F4' : '#8e8e93'}
                      />
                    )}
                  </View>
                </TouchableRipple>
              ))}
            </LinearGradient>

            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  transform: [
                    {
                      translateX: indicatorAnim.interpolate({
                        inputRange: [0, 1, 2, 3],
                        outputRange: [
                          0,
                          width / 4,
                          (width / 4) * 2,
                          (width / 4) * 3,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            />

            <View style={styles.content}>
              <Slot />
            </View>
          </LinearGradient>
        </DrawerLayout>
      </GestureHandlerRootView>
    </ProtectUserRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  drawerContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#6A00F4',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 10,
  },
  drawerMenu: { flex: 1 },
  drawerItemMini: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#FFF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  drawerText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },

  header: {
    backgroundColor: '#FFF',
    height: Platform.OS === 'ios' ? 75 : 65,
    paddingTop: Platform.OS === 'ios' ? 12 : 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#6A00F4',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  logoContainer: { justifyContent: 'center' },
  subtitle: { color: '#E11D48', fontSize: 20, fontWeight: '700', marginTop: 2 },
  iconsRight: { flexDirection: 'row' },
  iconButton: { marginLeft: 15, padding: 6, borderRadius: 50 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 55,
    alignItems: 'center',
    shadowColor: '#6A00F4',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  tabButtonMini: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  activeIndicator: {
    height: 4,
    width: width / 4,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  content: { flex: 1, backgroundColor: '#fff' },
});
