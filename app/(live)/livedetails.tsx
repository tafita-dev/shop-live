import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductList from '@/components/ProductListe';

const { height, width } = Dimensions.get('window');

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ link?: string }>();
  const link = params.link ?? 'Aucun lien';

  const iframeHeight = Math.min(height * 0.35, 300);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: transparent;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
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
      <View style={styles.container}>
        {/* Header avec retour et panier */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(client)')}
          >
            <ArrowLeft color="#EC4899" size={22} />
          </TouchableOpacity>

          <Text style={styles.title}>Live Vidéo</Text>

          <TouchableOpacity style={styles.cartButton}>
            <ShoppingCart size={22} color="#f30c33ff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

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

        {/* Liste des produits */}
        <View style={styles.content}>
          <ProductList />
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    elevation: 3,
  },
  backButton: {
    padding: 6,
  },
  title: {
    color: '#EC4899',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cartButton: {
    position: 'relative',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 25,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
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
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.03,
    paddingTop: 10,
  },
});
