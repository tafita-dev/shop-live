import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '@/firebase/config';
import { Live } from '@/types/live';

export default function HomeScreen() {
  const [lives, setLives] = useState<Live[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchLives = async () => {
      try {
        const q = query(collection(db, 'lives'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const liveList: Live[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            objectId: doc.id,
            profile: data.Profile || '',
            title: data.Title || '',
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            facebookIframeUrl: data.facebookIframeUrl || '',
            isActive: data.isActive ?? false,
            vendorId: data.vendorId || '',
            vendorName: data.vendorName || '',
          };
        });

        setLives(liveList);
      } catch (error) {
        console.error('Erreur de chargement des lives :', error);
      }
    };

    fetchLives();
  }, []);

  const renderItem: ListRenderItem<Live> = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Image
          source={{
            uri:
              item.profile ||
              'https://via.placeholder.com/300x200.png?text=Live',
          }}
          style={styles.thumbnail}
        />

        {/* ✅ Badge LIVE ou HORS LIGNE */}
        {item.isActive ? (
          <View style={[styles.badge, { backgroundColor: 'red' }]}>
            <Text style={styles.badgeText}>LIVE</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: 'gray' }]}>
            <Text style={styles.badgeText}>Hors ligne</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.vendor}>{item.vendorName}</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Voir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={lives}
      keyExtractor={(item) => item.objectId ?? Math.random().toString()}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  vendor: {
    fontSize: 13,
    color: '#777',
  },
  button: {
    backgroundColor: '#4267B2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
});
