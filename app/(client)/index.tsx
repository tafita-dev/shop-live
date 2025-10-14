import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ListRenderItem,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '@/firebase/config';
import { Live } from '@/types/live';
import { Eye, Calendar, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const cardWidth = isWeb ? Math.min(400, width - 40) : width - 20;

export default function HomeScreen() {
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const q = query(collection(db, 'lives'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveList: Live[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            objectId: doc.id,
            id: doc.id,
            profile: data.profile || '',
            title: data.title || '',
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
            facebookIframeUrl: data.facebookIframeUrl || '',
            isActive: data.isActive ?? false,
            vendorId: data.vendorId || '',
            vendorName: data.vendorName || '',
          };
        });

        setLives(liveList);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur de chargement des lives :', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  function formatDate(date: any): string {
    const jsDate =
      date instanceof Timestamp ? date.toDate() : new Date(date ?? Date.now());
    return jsDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const renderItem: ListRenderItem<Live> = ({ item }) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.profile ||
              'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.overlay} />

        {item.isActive && (
          <View style={styles.livePulseContainer}>
            <View style={styles.livePulse} />
            <View style={[styles.badge, styles.liveBadge]}>
              <View style={styles.liveDot} />
              <Text style={styles.badgeText}>EN DIRECT</Text>
            </View>
          </View>
        )}

        {!item.isActive && (
          <View style={[styles.badge, styles.offlineBadge]}>
            <Text style={styles.badgeText}>Terminé</Text>
          </View>
        )}

        <View style={styles.dateContainer}>
          <Calendar size={12} color="#fff" strokeWidth={2} />
          <Text style={styles.dateText}>
            {item.createdAt ? formatDate(item.createdAt) : ''}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.vendorContainer}>
            <User size={14} color="#666" strokeWidth={2} />
            <Text style={styles.vendor} numberOfLines={1}>
              {item.vendorName}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.replace(
              `/(live)/livedetails?id=${item.vendorId}&link=${item.facebookIframeUrl}`,
            )
          }
          style={[styles.button, !item.isActive && styles.buttonInactive]}
          activeOpacity={0.8}
        >
          <Eye size={16} color="white" strokeWidth={2} />
          <Text style={styles.buttonText}>
            {item.isActive ? 'Rejoindre' : 'Revoir'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucun live disponible</Text>
      <Text style={styles.emptySubtext}>
        Les nouveaux lives apparaîtront ici
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4267B2" />
        <Text style={styles.loadingText}>Chargement des lives...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFF', '#F3F4F6']} style={styles.drawerContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lives</Text>
          <View style={styles.liveCountBadge}>
            <View style={styles.liveCountDot} />
            <Text style={styles.liveCountText}>
              {lives.filter((l) => l.isActive).length} en direct
            </Text>
          </View>
        </View>

        <FlatList
          data={lives}
          keyExtractor={(item) => item.id ?? item.vendorId}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            lives.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  liveCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveCountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EC4899',
    marginRight: 6,
  },
  liveCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
  },
  listContent: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e4e8',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  livePulseContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  livePulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EC4899',
    borderRadius: 20,
    opacity: 0.3,
    transform: [{ scale: 1.3 }],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveBadge: {
    backgroundColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  offlineBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.9)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontWeight: '700',
    fontSize: 17,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  vendor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonInactive: {
    backgroundColor: '#64748b',
    shadowColor: '#64748b',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
