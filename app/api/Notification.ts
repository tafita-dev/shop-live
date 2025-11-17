import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert } from 'react-native';

/**
 * Récupère le token Expo FCM pour l'appareil actuel.
 * @returns {Promise<string | null>} Token FCM ou null si non disponible
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      Alert.alert(
        'Notification',
        'Les notifications nécessitent un vrai appareil!',
      );
      return null;
    }

    // Vérifie les permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notification',
        'Permission refusée pour recevoir les notifications.',
      );
      return null;
    }

    // Récupère le token FCM
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('Expo FCM token:', tokenData.data);

    return tokenData.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du FCM token:', error);
    return null;
  }
}
