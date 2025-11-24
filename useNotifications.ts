import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: string | null;
}

export const usePushNotification = (): PushNotificationState => {
  // Affichage notification même en app ouverte
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowBanner: true, // remplace shouldShowAlert
      shouldShowList: true, // nouveau
      shouldSetBadge: true,
      shouldShowAlert: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListner = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListner = useRef<Notifications.EventSubscription | null>(null);

  /**
   * Enregistrer les permissions + obtenir Expo Push Token
   */
  async function registerForPushNotificationsAsync() {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          'Notifications',
          'Les notifications ne fonctionnent pas sur un émulateur.',
        );
        return null;
      }

      // Vérifier permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Impossible d’activer les notifications.',
        );
        return null;
      }

      // Obtenir Expo Push Token
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenResponse.data;
    } catch (error) {
      console.log('❌ Erreur récupération token Expo :', error);
      return null;
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      console.log('Expo Push Token -> ', token);
    });

    // Listener notification reçue
    notificationListner.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification, 'notif');
        setNotification(notification);
      },
    );

    // Listener quand l’utilisateur clique sur la notif
    responseListner.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification cliquée ➜', response);
      });

    // Cleanup
    return () => {
      if (notificationListner.current) notificationListner.current.remove();

      if (responseListner.current) responseListner.current.remove();
    };
  }, []);
  console.log(notification, 'notif');

  return {
    expoPushToken,
    notification,
  };
};
