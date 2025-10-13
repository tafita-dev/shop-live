import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3, LogOut } from 'lucide-react-native';
import { User } from '@/types/user';
import { fetchFirebaseUserInfo } from '@/utils/authStorage';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 110;
const AVATAR_MIN_SIZE = 70;

export default function Profile() {
  const [userInfo, setUserInfo] = React.useState<User>({
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

  const scrollY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchFirebaseUserInfo();
        if (data) {
          const role =
            data.role === 'client' || data.role === 'vendor'
              ? data.role
              : 'client';
          setUserInfo((prev) => ({
            ...prev,
            name: data.name || prev.name,
            photoURL: data.photoURL || prev.photoURL,
            email: data.email || prev.email,
            role,
            phone: data.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error(
          'Erreur lors du chargement des infos utilisateur:',
          error,
        );
      }
    };
    loadUserData();
  }, []);

  const handleEdit = () => console.log('Modifier le profil');
  const handleLogout = () => console.log('Déconnexion');

  const cards = [
    { label: 'Email', value: userInfo.email },
    { label: 'Téléphone', value: userInfo.phone },
    { label: 'Rôle', value: userInfo.role },
  ];

  // Animations parallaxe
  const avatarScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, AVATAR_MIN_SIZE / AVATAR_SIZE],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* Avatar et Nom */}
        <View style={styles.avatarWrapper}>
          <Animated.Image
            source={{ uri: userInfo.photoURL }}
            style={[
              styles.avatar,
              {
                transform: [
                  { scale: avatarScale },
                  { translateY: avatarTranslateY },
                ],
              },
            ]}
          />
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Edit3 size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{userInfo.name}</Text>
        <Text style={styles.role}>{userInfo.role.toUpperCase()}</Text>

        {/* Mini-cards */}
        <View style={styles.cardsWrapper}>
          {cards.map((item, index) => {
            const translateY = scrollY.interpolate({
              inputRange: [-1, 0, 100 * index, 100 * (index + 2)],
              outputRange: [0, 0, 0, 20],
              extrapolate: 'clamp',
            });
            const opacity = scrollY.interpolate({
              inputRange: [0, 100 * (index + 1)],
              outputRange: [1, 0.7],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={item.label}
                style={[styles.card, { transform: [{ translateY }], opacity }]}
              >
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardValue}>{item.value}</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FFF" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6A00F4',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: { fontSize: 24, fontWeight: '700', color: '#FFF', marginTop: 5 },
  role: { fontSize: 14, color: '#EDE9FE', marginBottom: 25 },
  cardsWrapper: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 5 },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
});
