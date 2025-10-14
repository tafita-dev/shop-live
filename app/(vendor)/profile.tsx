import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
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
    authProviders: { emailPassword: false, facebookId: '', googleId: '' },
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
      colors={['#1A0033', '#4C0070', '#FF006A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
        {/* Avatar avec effet Glow */}
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={['#FF6B00', '#FF00CC']}
            style={styles.avatarGlow}
          >
            <Animated.Image
              source={
                userInfo.photoURL
                  ? { uri: userInfo.photoURL }
                  : require('../../assets/images/icon.png')
              }
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
          </LinearGradient>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Edit3 size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{userInfo.name || 'Utilisateur'}</Text>
        <Text style={styles.role}>
          {userInfo.role ? userInfo.role.toUpperCase() : 'CLIENT'}
        </Text>

        {/* Informations */}
        <View style={styles.cardsWrapper}>
          {cards.map((item, index) => (
            <Animated.View
              key={item.label}
              style={[
                styles.card,
                {
                  transform: [
                    {
                      scale: scrollY.interpolate({
                        inputRange: [0, 100 * (index + 1)],
                        outputRange: [1, 0.98],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>
                {item.value || 'Non renseigné'}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#FF3366', '#FF6B00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color="#FFF" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatarGlow: {
    borderRadius: 100,
    padding: 4,
    shadowColor: '#FF00CC',
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
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
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 10,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  role: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 25,
    letterSpacing: 1,
    fontWeight: '600',
  },
  cardsWrapper: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#FF00CC',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 10,
    width: '80%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#FF006A',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
