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
  Appbar,
} from 'react-native-paper';
import { Menu, LogOut, X, ArrowLeft } from 'lucide-react-native';
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

  return (
    <ProtectUserRole role="vendor">
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* ✅ SafeArea global */}
        <LinearGradient colors={['#FFF', '#F9FAFB']} style={styles.container}>
          {/* Header */}
          <Appbar.Header style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/')}>
              <ArrowLeft size={28} color="#EC4899" />
            </TouchableOpacity>
            <Text style={styles.title}>Gestion Livreur</Text>
          </Appbar.Header>

          {/* Contenu principal */}
          <View style={styles.content}>
            <Slot />
          </View>
        </LinearGradient>
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
