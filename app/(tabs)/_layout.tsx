import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  Text,
  Animated,
} from 'react-native';
import { Appbar, TouchableRipple } from 'react-native-paper';
import { useRouter, Slot } from 'expo-router';
import { Home, Users, Bell, Menu } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TabsLayout() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'home' | 'profile'>('home');

  const indicatorAnim = React.useRef(new Animated.Value(0)).current;

  const handleTabPress = (tab: 'home' | 'profile') => {
    setActiveTab(tab);

    const positions = { home: 0, profile: 1, friends: 2 };
    Animated.spring(indicatorAnim, {
      toValue: positions[tab],
      useNativeDriver: true,
    }).start();

    const path = `/(tabs)/${tab === 'home' ? '' : tab}` as any;
    router.replace(path);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Shop live</Text>
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
          >
            <Menu size={30} color="#111827" />
          </TouchableRipple>
        </View>
      </Appbar.Header>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['home', 'profile'].map((tab, index) => (
          <TouchableRipple
            key={tab}
            style={styles.tabButton}
            rippleColor="rgba(24,119,242,0.2)"
            onPress={() => handleTabPress(tab as 'home' | 'profile')}
          >
            <View style={{ alignItems: 'center' }}>
              {tab === 'home' && (
                <Home
                  size={26}
                  color={activeTab === 'home' ? '#1877F2' : '#8e8e93'}
                />
              )}
              {tab === 'profile' && (
                <Users
                  size={26}
                  color={activeTab === 'profile' ? '#1877F2' : '#8e8e93'}
                />
              )}
            </View>
          </TouchableRipple>
        ))}
      </View>

      {/* Barre bleue active sous tab */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [
              {
                translateX: indicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width / 3, (width / 3) * 2],
                }),
              },
            ],
          },
        ]}
      />

      {/* Contenu */}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    backgroundColor: '#FFF',
    height: Platform.OS === 'ios' ? 75 : 65,
    paddingTop: Platform.OS === 'ios' ? 12 : 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  logoContainer: { justifyContent: 'center' },
  logo: { width: width * 0.25, height: 35 },
  subtitle: {
    color: '#e61111', // rouge Shop live
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
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
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    height: 50,
    alignItems: 'center',
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  activeIndicator: {
    height: 2,
    width: width / 3,
    backgroundColor: '#1877F2', // couleur bleu onglet actif
  },
  content: { flex: 1 },
});
