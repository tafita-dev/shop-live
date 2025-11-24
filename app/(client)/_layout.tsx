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
} from 'react-native';
import {
  Appbar,
  TouchableRipple,
  Drawer as PaperDrawer,
  Portal,
  Modal,
} from 'react-native-paper';
import { useRouter, Slot, useSegments } from 'expo-router';
import {
  User,
  Bell,
  Menu,
  CalendarCheck,
  Video,
  LogOut,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';
import { User as UserTypes } from '@/types/user';
import ProtectUserRole from '@/components/ProtectUserRole';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const modalAnim = React.useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    'home' | 'profile' | 'reservation'
  >('home');
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;
  const segments = useSegments();

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const loadUserData = async () => {
    const data = await fetchFirebaseUserInfo();
    if (data) {
      setUserInfo({
        name: data.name,
        photoURL: data.photoURL,
        email: data.email,
        role:
          data.role === 'client' || data.role === 'vendor'
            ? data.role
            : 'client',
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
    }).start();
    loadUserData();
  }, [segments]);

  const handleLogout = async () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      authStorage.clearAuthData();
      closeDrawer();
      router.replace('/(auth)/login');
    });
  };

  const handleTabPress = (tab: 'home' | 'profile' | 'reservation') => {
    setActiveTab(tab);
    const positions = { home: 0, profile: 1, reservation: 2 };
    Animated.spring(indicatorAnim, {
      toValue: positions[tab],
      useNativeDriver: true,
    }).start();
    const path = `/(client)/${tab === 'home' ? '' : tab}` as const;
    router.replace(path as any);
    closeDrawer();
  };

  const openModal = () => {
    closeDrawer();
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
  };

  const renderDrawer = () => (
    <Portal>
      <Modal
        visible={drawerVisible}
        onDismiss={closeDrawer}
        contentContainerStyle={styles.drawerContainer}
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
          <Text style={styles.userName}>{userInfo.name || 'Utilisateur'}</Text>
        </View>

        <PaperDrawer.Section title="Menu">
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
            <PaperDrawer.Item
              key={item.label}
              label={item.label}
              icon={() => <item.icon size={22} color="#EC4899" />}
              onPress={() => {
                router.replace(item.route);
                closeDrawer();
              }}
            />
          ))}

          <PaperDrawer.Item
            label="Déconnexion"
            icon={() => <LogOut size={22} color="#EC4899" />}
            onPress={openModal}
          />
        </PaperDrawer.Section>
      </Modal>
    </Portal>
  );

  return (
    <ProtectUserRole role="client">
      <GestureHandlerRootView style={{ flex: 1 }}>
        {renderDrawer()}

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
              <TouchableRipple style={styles.iconButton}>
                <View style={{ position: 'relative' }}>
                  <Bell size={28} color="#111827" />
                  <View style={styles.badge} />
                </View>
              </TouchableRipple>

              <TouchableRipple style={styles.iconButton} onPress={openDrawer}>
                <Menu size={30} color="#111827" />
              </TouchableRipple>
            </View>
          </Appbar.Header>

          <LinearGradient colors={['#FFF', '#F3F4F6']} style={styles.tabBar}>
            {['home', 'profile', 'reservation'].map((tab, index) => (
              <TouchableRipple
                key={tab}
                style={styles.tabButtonMini}
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
                ],
              },
            ]}
          />

          <View style={styles.content}>
            <Slot />
          </View>
        </LinearGradient>

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
      </GestureHandlerRootView>
    </ProtectUserRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logo: { width: 60, height: 60 },
  drawerContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 40,
    width: '75%',
    alignSelf: 'flex-end',
    height: '100%',
  },
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
  header: {
    backgroundColor: '#FFF',
    height: Platform.OS === 'ios' ? 75 : 65,
    paddingTop: Platform.OS === 'ios' ? 12 : 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 6,
  },
  logoContainer: { justifyContent: 'center' },
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
    height: 55,
    alignItems: 'center',
    elevation: 3,
  },
  tabButtonMini: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  activeIndicator: {
    height: 4,
    width: width / 3,
    backgroundColor: '#EC4899',
    borderRadius: 4,
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
