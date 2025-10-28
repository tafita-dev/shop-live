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

const { height, width } = Dimensions.get('window');

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    link?: string;
    id?: string;
    status?: string;
  }>();

  const link = params.link ?? 'Aucun lien';
  const vendorId = params.id ?? '';
  const status = params.status ?? 'REPLAY';

  const iframeHeight = Math.min(height * 0.32, 320);
  const headerTitle = status === 'LIVE' ? '🟢 Live en cours' : '🎬 Rediffusion';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* En-tête dégradé moderne */}
      <LinearGradient
        colors={['#fce7f3', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(client)')}
        >
          <ArrowLeft color="#EC4899" size={22} />
        </TouchableOpacity>

        <Text style={styles.title}>{headerTitle}</Text>

        <TouchableOpacity style={styles.cartButton}>
          <ShoppingCart size={22} color="#EC4899" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Vidéo */}
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

        <ProductGroupList vendorId={vendorId} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 6,
    backgroundColor: '#fdf2f8',
    borderRadius: 12,
  },
  title: {
    color: '#EC4899',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cartButton: {
    position: 'relative',
    backgroundColor: '#fdf2f8',
    padding: 8,
    borderRadius: 20,
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
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  webviewContainer: {
    marginHorizontal: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 10,
  },
  webview: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
});
