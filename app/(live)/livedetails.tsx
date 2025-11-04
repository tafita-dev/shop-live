import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductGroupList } from '@/components/ProductGroupList';
import { useEffect, useState } from 'react';
import {
  addToCart,
  clearCartByVendor,
  getCartCountByVendor,
} from '@/utils/cartStorage';
import { useCart } from '@/components/contexts/CartContext';
import OrderModal from '@/components/orderModal';

const { height, width } = Dimensions.get('window');

const PRIMARY_COLOR = '#4c51bf';
const ACCENT_COLOR = '#ec4899';
const BG_COLOR = '#f9fafb';
const CARD_BG = '#ffffff';
const TEXT_COLOR_PRIMARY = '#1f2937';
const TEXT_COLOR_SECONDARY = '#6b7280';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    link?: string;
    id?: string;
    status?: string;
  }>();

  const link = params.link ?? 'Aucun lien';
  const vendorId = params.id ?? '';
  const status = params.status;
  const { cartCount, refreshCart } = useCart();
  const [visible, setVisible] = useState(false);

  const iframeHeight = Math.min(height * 0.32, 320);
  const isLive = status === 'live';
  const headerTitle = isLive ? 'En direct' : 'Rediffusion';
  const statusBadgeColor = isLive ? '#10b981' : '#8b5cf6';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background-color: #000; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <iframe
        src="https://www.facebook.com/plugins/video.php?height=400&href=${encodeURIComponent(
          link,
        )}&autoplay=1&muted=1&show_text=false&width=600"
        allow="autoplay; encrypted-media"
        allowfullscreen="true"
        scrolling="no"
      ></iframe>
    </body>
    </html>
  `;

  useEffect(() => {
    if (vendorId) {
      refreshCart(vendorId);
    }
  }, [vendorId]);

  const handleBackPress = () => {
    clearCartByVendor(vendorId);
    router.replace('/(client)');
  };

  return (
    <>
      <OrderModal setVisible={setVisible} visible={visible} />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[CARD_BG, BG_COLOR]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={ACCENT_COLOR} size={24} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusBadgeColor },
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{headerTitle}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={styles.cartButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ShoppingCart size={24} color={ACCENT_COLOR} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.videoSection}>
            <View style={[styles.webviewContainer, { height: iframeHeight }]}>
              <WebView
                originWhitelist={['*']}
                source={{ html }}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
              />
            </View>
          </View>

          <View style={styles.productsSection}>
            <ProductGroupList vendorId={vendorId} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CARD_BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    justifyContent: 'center',
    alignItems: 'center',
    transitionProperty: 'background-color 0.2s',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CARD_BG,
  },
  statusText: {
    color: CARD_BG,
    fontSize: 14,
    fontWeight: '600',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#f43f5e',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  badgeText: {
    color: CARD_BG,
    fontSize: 11,
    fontWeight: '700',
  },
  videoSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  webviewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  webview: {
    flex: 1,
  },
  productsSection: {
    paddingTop: 16,
  },
});
