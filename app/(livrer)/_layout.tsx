import * as React from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Drawer as PaperDrawer,
  Portal,
  Modal,
  TouchableRipple,
} from 'react-native-paper';
import { Menu, LogOut } from 'lucide-react-native';
import ProtectUserRole from '@/components/ProtectUserRole';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';
import { User as UserTypes } from '@/types/user';

const { width } = Dimensions.get('window');

export default function LiveLayout() {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const modalAnim = React.useRef(new Animated.Value(0)).current;

  const [userInfo, setUserInfo] = React.useState<UserTypes>({
    name: '',
    role: 'livrer',
    email: '',
    authProviders: { emailPassword: false, facebookId: '', googleId: '' },
    createdAt: '',
    phone: '',
    photoURL:
      'https://res.cloudinary.com/dfywekuna/image/upload/v1736843708/20171206_01_jx8oyo.jpg',
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const data = await fetchFirebaseUserInfo();
      if (data) {
        setUserInfo({
          name: data.name,
          photoURL: data.photoURL,
          email: data.email,
          role: 'livrer',
          phone: data.phone,
        });
      }
    };
    loadUser();
  }, []);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const openLogoutModal = () => {
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

  const handleLogout = async () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      authStorage.clearAuthData();
      router.replace('/(auth)/login');
    });
  };

  const renderDrawer = () => (
    <Portal>
      <Modal
        visible={drawerVisible}
        onDismiss={closeDrawer}
        contentContainerStyle={styles.drawerContainer}
      >
        <View style={styles.profileSection}>
          <Image source={{ uri: userInfo.photoURL }} style={styles.avatar} />
          <Text style={styles.userName}>{userInfo.name || 'Utilisateur'}</Text>
        </View>

        <PaperDrawer.Section title="Menu">
          <PaperDrawer.Item
            label="Déconnexion"
            icon={() => <LogOut size={22} color="#EC4899" />}
            onPress={openLogoutModal}
          />
          <PaperDrawer.Item
            label="Option 2"
            onPress={() => {
              closeDrawer();
              // action pour l'option 2
            }}
          />
        </PaperDrawer.Section>
      </Modal>
    </Portal>
  );

  return (
    <ProtectUserRole role="livrer">
      <GestureHandlerRootView style={{ flex: 1 }}>
        {renderDrawer()}
        <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient colors={['#FFF', '#F9FAFB']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Scanne Produits</Text>
              <TouchableOpacity onPress={openDrawer}>
                <Menu size={28} color="#EC4899" />
              </TouchableOpacity>
            </View>

            {/* Contenu principal */}
            <View style={styles.content}>
              <Slot />
            </View>

            {/* Modal Déconnexion */}
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
          </LinearGradient>
        </SafeAreaView>
      </GestureHandlerRootView>
    </ProtectUserRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EC4899',
    textAlign: 'center',
    flex: 2,
  },
  content: { flex: 1, backgroundColor: '#fff' },
  drawerContainer: {
    backgroundColor: '#FFF',
    width: width * 0.75,
    height: '100%',
    position: 'absolute',
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
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
