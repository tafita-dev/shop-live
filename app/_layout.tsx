import React, { useEffect, useState, ErrorInfo, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import {
  View,
  ActivityIndicator,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CartProvider } from '@/components/contexts/CartContext';
import { PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Audio } from 'expo-av'; // Import pour le son
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'; // Import pour les animations fluides

// Empêche la fermeture automatique du splash screen
SplashScreen.preventAutoHideAsync();

// --- CONFIGURATION DU SON (Placez votre fichier MP3 ici) ---
const notificationSound = new Audio.Sound();
let soundIsLoaded = false;

async function loadAndPlaySound() {
  try {
    if (!soundIsLoaded) {
      // ⚠️ IMPORTANT: Remplacez par le chemin réel de votre fichier audio
      await notificationSound.loadAsync(
        require('../assets/Facebook-Notification.mp3'),
      );
      soundIsLoaded = true;
    }
    await notificationSound.stopAsync();
    await notificationSound.setPositionAsync(0);
    await notificationSound.playAsync();
  } catch (error) {
    console.error('Erreur lors de la lecture du son de notification:', error);
  }
}

// --- Composant de Notification Flottante (Style Messenger) ---
type FloatingNotificationProps = {
  notification: Notifications.Notification;
  isVisible: boolean;
  onPress: () => void;
};

const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  notification,
  isVisible,
  onPress,
}) => {
  // Valeur partagée pour l'animation de translation Y
  const translateY = useSharedValue(-150);

  useEffect(() => {
    // Animation d'entrée et de sortie fluide
    translateY.value = withTiming(isVisible ? 0 : -150, { duration: 300 });
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!notification) return null;

  return (
    <Animated.View
      style={[styles.floatingNotificationContainer, animatedStyle]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.floatingNotification}
        activeOpacity={0.9}
      >
        <View style={styles.floatingNotificationIcon}>
          {/* Un placeholder pour l'image de profil */}
          <Text style={{ color: '#fff', fontSize: 18 }}>💬</Text>
        </View>
        <View style={styles.floatingNotificationContent}>
          <Text style={styles.floatingNotificationTitle} numberOfLines={1}>
            {notification.request.content.title || 'Nouveau message'}
          </Text>
          <Text style={styles.floatingNotificationBody} numberOfLines={2}>
            {notification.request.content.body}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
// ----------------------------------------------------

/**
 * ErrorBoundary pour capturer les erreurs globales
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            💥 Oops, une erreur est survenue !
          </Text>
          <Text style={styles.errorMessage}>
            Nous sommes désolés, l'application a rencontré un problème. Veuillez
            réessayer.
          </Text>
          <Button
            title="Recharger l'application"
            onPress={() => this.setState({ hasError: false })}
            color="#EC4899"
          />
        </View>
      );
    }
    return this.props.children;
  }
}

/**
 * Fonction pour récupérer le token Expo Push
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  // ... (votre implémentation reste identique)
  try {
    if (!Device.isDevice) {
      console.log(
        'Les notifications nécessitent un vrai appareil ou simulateur.',
      );
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.error('Permission refusée pour recevoir les notifications.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('Expo Push Token:', tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.error('Erreur lors de la récupération du token Expo Push:', err);
    return null;
  }
}

/**
 * Composant principal RootLayout
 */
export default function RootLayout() {
  const frameworkReady = useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);

  // NOUVEAUX STATES pour la notification flottante
  const [currentNotification, setCurrentNotification] =
    useState<Notifications.Notification | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  // ----------------------------------------------

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Écoute des notifications reçues
  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification reçue:', notification);

        // 1. Jouer le son
        loadAndPlaySound();

        // 2. Afficher le composant flottant
        setCurrentNotification(notification);
        setIsNotificationVisible(true);

        // 3. Masquer après 4 secondes (style alerte temporaire)
        if (notificationTimerRef.current) {
          clearTimeout(notificationTimerRef.current);
        }
        // Utilisation correcte du type pour setTimeout
        (notificationTimerRef.current as any) = setTimeout(() => {
          setIsNotificationVisible(false);
          setCurrentNotification(null);
        }, 6000);
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Utilisateur a interagi avec la notification:', response);
        // Masquer le composant flottant si l'utilisateur interagit
        setIsNotificationVisible(false);
        setCurrentNotification(null);

        // Logique de navigation/action ici
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Récupération du token Expo Push
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token),
    );
  }, []);

  // Gestion du splash screen
  useEffect(() => {
    if (frameworkReady && !appIsReady) {
      setTimeout(() => {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [frameworkReady, appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ErrorBoundary>
        <CartProvider>
          <View
            style={{
              flex: 1,
              marginTop: currentNotification ? 25 : 0,
            }}
          >
            {/* Composant de Notification Flottante */}
            {currentNotification && (
              <FloatingNotification
                notification={currentNotification}
                isVisible={isNotificationVisible}
                onPress={() => {
                  // Logique à exécuter au clic sur la notification
                  setIsNotificationVisible(false);
                  setCurrentNotification(null);
                }}
              />
            )}

            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="(vendor)" />
              <Stack.Screen name="(livrer)" />
              <Stack.Screen name="(vendorLivrer)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
          <StatusBar style="auto" />
        </CartProvider>
      </ErrorBoundary>
    </PaperProvider>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },

  // --- Styles pour la Notification Flottante ---
  floatingNotificationContainer: {
    position: 'absolute',
    // Positionnement un peu plus bas sur iOS pour la barre de statut/notch
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  floatingNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 15,
    // Ombre stylée pour l'effet flottant (Android)
    ...Platform.select({
      android: {
        elevation: 8,
      },
      // Ombre stylée pour l'effet flottant (iOS)
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  floatingNotificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EC4899',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingNotificationContent: {
    flex: 1,
  },
  floatingNotificationTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  floatingNotificationBody: {
    fontSize: 14,
    color: '#666',
  },
});
