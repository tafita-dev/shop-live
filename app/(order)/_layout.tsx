import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useCart } from '@/components/contexts/CartContext';

export default function OrderLayout() {
  const router = useRouter();
  const { cartCount } = useCart();
  const params = useLocalSearchParams<{
    link?: string;
    id?: string;
    status?: string;
  }>();
  const link = params.link ?? 'Aucun lien';
  const vendorId = params.id ?? '';
  const status = params.status;
  console.log(params);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* En-tête dégradé moderne */}
      <LinearGradient
        colors={['#fce7f3', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* Bouton retour */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#EC4899" size={22} />
          </TouchableOpacity>

          {/* Titre principal */}
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>🛒 Commande</Text>
            <Text style={styles.headerSubtitle}>
              Étape par étape jusqu’au paiement
            </Text>
          </View>

          {/* Icône panier + compteur animé */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() =>
              router.replace(
                `/(live)/livedetails?id=${vendorId}&link=${link}&status=${status}`,
              )
            }
          >
            <ShoppingCart size={22} color="#EC4899" />
            {cartCount > 0 && (
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>{cartCount}</Text>
              </MotiView>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Zone de navigation (écrans enfants) */}
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderColor: '#fbcfe8',
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#fdf2f8',
    padding: 8,
    borderRadius: 14,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9d174d',
    marginTop: 2,
  },
  cartButton: {
    backgroundColor: '#fdf2f8',
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f43f5e',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
