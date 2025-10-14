import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  Text,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { useRouter, Slot, useSegments } from 'expo-router';
import {
  Home,
  User,
  Bell,
  Menu,
  CalendarCheck,
  Video,
  LogOut,
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

export default function TabsLayout() {
  const [userInfo, setUserInfo] = React.useState<UserTypes>({
    name: '',
    role: 'client',
    email: '',
    authProviders: {
      emailPassword: false,
      facebookId: '',
      googleId: '',
    },
    createdAt: '',
    phone: '',
    photoURL: '',
  });

  const router = useRouter();
  const drawerRef = React.useRef<DrawerLayout>(null);

  const [activeTab, setActiveTab] = React.useState<
    'home' | 'profile' | 'reservation'
  >('home');
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const loadUserData = async () => {
    const data = await fetchFirebaseUserInfo();
    console.log(data);
    const role =
      data.role === 'client' || data.role === 'vendor' ? data.role : 'client';
    if (data) {
      setUserInfo({
        name: data.name,
        photoURL: data.photoURL,
        email: data.email,
        role: role,
        phone: data.phone,
      });
    }
  };

  React.useEffect(() => {
    const currentSegment = segments[segments.length - 1];
    const tabIndex =
      currentSegment === 'profile'
        ? 1
        : currentSegment === 'reservation'
        ? 2
        : 0;
    setActiveTab(
      currentSegment === 'profile'
        ? 'profile'
        : currentSegment === 'reservation'
        ? 'reservation'
        : 'home',
    );
    Animated.spring(indicatorAnim, {
      toValue: tabIndex,
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start();
    loadUserData();
  }, [segments]);

  const handleLogout = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            await authStorage.clearAuthData();
            drawerRef.current?.closeDrawer();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleTabPress = (tab: 'home' | 'profile' | 'reservation') => {
    setActiveTab(tab);
    const positions = { home: 0, profile: 1, reservation: 2 };
    Animated.spring(indicatorAnim, {
      toValue: positions[tab],
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start();
    const path = `/(client)/${tab === 'home' ? '' : tab}` as any;
    router.replace(path);
    drawerRef.current?.closeDrawer();
  };

  const renderDrawer = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={['#FFF', '#F3F4F6']}
        style={styles.drawerContainer}
      >
        {/* Profil utilisateur */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: userInfo.photoURL || 'https://i.pravatar.cc/150?img=3',
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userInfo.name}</Text>
        </View>

        {/* Menu */}
        <View style={styles.drawerMenu}>
          {[
            { label: 'Live video', icon: Video, route: '/(client)' as const },
            {
              label: 'Profil',
              icon: User,
              route: '/(client)/profile' as const,
            },
            {
              label: 'Réservations',
              icon: CalendarCheck,
              route: '/(client)/reservation' as const,
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

          {/* Déconnexion */}
          <TouchableRipple
            style={styles.drawerItemMini}
            rippleColor="rgba(255,0,0,0.1)"
            onPress={handleLogout}
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
    <ProtectUserRole role="client">
      <GestureHandlerRootView>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={300} // drawer plus large
          drawerPosition="right"
          drawerBackgroundColor="#FFF"
          renderNavigationView={renderDrawer}
        >
          <LinearGradient colors={['#FFF', '#F9FAFB']} style={styles.container}>
            {/* HEADER 3D */}
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
                  <View style={{ position: 'relative' }}>
                    <Bell size={28} color="#111827" />
                    <View style={styles.badge} />
                  </View>
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

            {/* TABS 3D */}
            <LinearGradient colors={['#FFF', '#F3F4F6']} style={styles.tabBar}>
              {['home', 'profile', 'reservation'].map((tab, index) => (
                <TouchableRipple
                  key={tab}
                  style={styles.tabButtonMini} // mini-card style
                  rippleColor="rgba(24,119,242,0.2)"
                  onPress={() =>
                    handleTabPress(tab as 'home' | 'profile' | 'reservation')
                  }
                >
                  <View style={{ alignItems: 'center' }}>
                    {tab === 'home' && (
                      <Video
                        size={26}
                        color={activeTab === 'home' ? '#EC4899' : '#8e8e93'}
                      />
                    )}
                    {tab === 'reservation' && (
                      <CalendarCheck
                        size={26}
                        color={
                          activeTab === 'reservation' ? '#EC4899' : '#8e8e93'
                        }
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

            {/* Barre active 3D */}
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  transform: [
                    {
                      translateX: indicatorAnim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [0, width / 3, (width / 3) * 2],
                      }),
                    },
                    { perspective: 800 },
                    { rotateX: '15deg' },
                  ],
                },
              ]}
            />

            {/* Contenu */}
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
  logo: { width: 60, height: 60 },
  drawerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
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
  drawerMenu: {
    flex: 1,
  },
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
  drawerText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },

  header: {
    backgroundColor: '#FFF',
    height: Platform.OS === 'ios' ? 75 : 65,
    paddingTop: Platform.OS === 'ios' ? 12 : 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#EC4899',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  logoContainer: { justifyContent: 'center' },
  subtitle: { color: '#E11D48', fontSize: 20, fontWeight: '700', marginTop: 2 },
  iconsRight: { flexDirection: 'row' },
  iconButton: { marginLeft: 15, padding: 6, borderRadius: 50 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 0.3,
    borderBottomColor: '#DDD',
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
    width: width / 3,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    shadowColor: '#EC4899',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  content: { flex: 1, backgroundColor: '#fff' },

  drawerContent: { flex: 1, backgroundColor: '#FFF', padding: 20 },
});
