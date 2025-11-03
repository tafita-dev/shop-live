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
    photoURL:
      'https://res.cloudinary.com/dfywekuna/image/upload/v1736843708/20171206_01_jx8oyo.jpg',
  });

  const openModal = () => {
    drawerRef.current?.closeDrawer();
    setShowModal(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowModal(false));
    drawerRef.current?.openDrawer();
  };

  const modalAnim = React.useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const drawerRef = React.useRef<DrawerLayout>(null);
  const [showModal, setShowModal] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<
    'home' | 'categorie' | 'orders' | 'profile'
  >('home');
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;
  const segments = useSegments();

  React.useEffect(() => {
    const currentSegment = segments[segments.length - 1];
    const tabIndex =
      currentSegment === 'categorie'
        ? 1
        : currentSegment === 'orders'
        ? 2
        : currentSegment === 'profile'
        ? 3
        : 0;
    setActiveTab(
      currentSegment === 'categorie'
        ? 'categorie'
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
    console.log(data);
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
    await authStorage.clearAuthData();
    drawerRef.current?.closeDrawer();
    router.replace('/(auth)/login');
  };

  const handleTabPress = (tab: 'home' | 'categorie' | 'orders' | 'profile') => {
    setActiveTab(tab);
    const positions = { home: 0, categorie: 1, orders: 2, profile: 3 };
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
              uri: userInfo.photoURL
                ? userInfo.photoURL
                : 'https://res.cloudinary.com/dfywekuna/image/upload/v1736843708/20171206_01_jx8oyo.jpg',
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
              route: '/(vendor)/categorie' as const,
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
                <item.icon size={22} color="#EC4899" />
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
            onPress={openModal}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LogOut size={22} color="#EC4899" />
              <Text
                style={[
                  styles.drawerText,
                  { color: '#EC4899', marginLeft: 12 },
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
                <Image
                  source={require('../../assets/images/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
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
              {['home', 'categorie', 'orders', 'profile'].map((tab, index) => (
                <TouchableRipple
                  key={tab}
                  style={styles.tabButtonMini}
                  onPress={() => handleTabPress(tab as any)}
                >
                  <View style={{ alignItems: 'center' }}>
                    {tab === 'home' && (
                      <Home
                        size={26}
                        color={activeTab === 'home' ? '#EC4899' : '#8e8e93'}
                      />
                    )}
                    {tab === 'categorie' && (
                      <ShoppingBag
                        size={26}
                        color={
                          activeTab === 'categorie' ? '#EC4899' : '#8e8e93'
                        }
                      />
                    )}
                    {tab === 'orders' && (
                      <Clipboard
                        size={26}
                        color={activeTab === 'orders' ? '#EC4899' : '#8e8e93'}
                      />
                    )}
                    {tab === 'profile' && (
                      <User
                        size={26}
                        color={activeTab === 'profile' ? '#EC4899' : '#8e8e93'}
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
      {showModal && (
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: modalAnim, transform: [{ scale: modalAnim }] },
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Déconnexion</Text>
            <Text style={styles.modalMessage}>
              Voulez-vous vraiment vous déconnecter ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Non</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Oui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </ProtectUserRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logo: { width: 60, height: 60 },
  drawerContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#EC4899',
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
    shadowColor: '#EC4899',
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
    backgroundColor: '#EC4899',
    borderRadius: 4,
    shadowColor: '#EC4899',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  content: { flex: 1, backgroundColor: '#fff' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.45,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#6B7280' },
  confirmButton: { backgroundColor: '#EC4899' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
