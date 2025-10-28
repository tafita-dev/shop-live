import * as React from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Slot, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableRipple } from 'react-native-paper';
import { Video, ListVideo, ArrowLeft } from 'lucide-react-native';
import ProtectUserRole from '@/components/ProtectUserRole';

const { width } = Dimensions.get('window');

export default function LiveLayoyt() {
  const router = useRouter();
  const segments = useSegments();

  const [activeTab, setActiveTab] = React.useState<'create' | 'list'>('create');
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const currentSegment = String(segments[segments.length - 1]);
    const tabIndex = currentSegment === 'list' ? 1 : 0;

    setActiveTab(currentSegment === 'list' ? 'list' : 'create');
    Animated.spring(indicatorAnim, {
      toValue: tabIndex,
      useNativeDriver: true,
      friction: 5,
      tension: 80,
    }).start();
  }, [segments]);

  const handleTabPress = (tab: 'create' | 'list') => {
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: tab === 'list' ? 1 : 0,
      useNativeDriver: true,
    }).start();
    router.replace(`/(vendor)/${tab === 'create' ? '' : 'list'}` as any);
  };

  return (
    <ProtectUserRole role="vendor">
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* ✅ SafeArea global */}
        <SafeAreaView style={{ flex: 1 }}>
          <LinearGradient colors={['#FFF', '#F9FAFB']} style={styles.container}>
            {/* --- Header --- */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <View>
                  <ArrowLeft size={28} color="#EC4899" />
                </View>
              </TouchableOpacity>
              <Text style={styles.title}>
                {activeTab === 'create'
                  ? ('Création Live' as string)
                  : ('Liste des Lives' as string)}
              </Text>
              <View style={{ width: 28 }} /> {/* espace à droite */}
            </View>

            {/* --- Contenu principal --- */}
            <View style={styles.content}>
              <Slot />
            </View>

            {/* --- Barre de navigation inférieure --- */}
            <LinearGradient colors={['#FFF', '#F3F4F6']} style={styles.tabBar}>
              <TouchableRipple
                style={styles.tabButtonMini}
                onPress={() => handleTabPress('create')}
              >
                <View style={{ alignItems: 'center' }}>
                  <Video
                    size={26}
                    color={activeTab === 'create' ? '#EC4899' : '#8e8e93'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === 'create' ? '#EC4899' : '#8e8e93' },
                    ]}
                  >
                    Création Live
                  </Text>
                </View>
              </TouchableRipple>

              <TouchableRipple
                style={styles.tabButtonMini}
                onPress={() => handleTabPress('list')}
              >
                <View style={{ alignItems: 'center' }}>
                  <ListVideo
                    size={26}
                    color={activeTab === 'list' ? '#EC4899' : '#8e8e93'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === 'list' ? '#EC4899' : '#8e8e93' },
                    ]}
                  >
                    Liste Live
                  </Text>
                </View>
              </TouchableRipple>
            </LinearGradient>

            {/* --- Indicateur animé --- */}
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  transform: [
                    {
                      translateX: indicatorAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width / 2],
                      }),
                    },
                  ],
                },
              ]}
            />
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
  title: { fontSize: 18, fontWeight: '600', color: '#EC4899' },
  content: { flex: 1, backgroundColor: '#fff' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 70,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  tabButtonMini: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeIndicator: {
    height: 4,
    width: width / 2,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
