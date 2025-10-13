import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authStorage } from '@/utils/authStorage';

interface ProtectUserRoleProps {
  role: 'vendor' | 'client';
  children: React.ReactNode;
}

export default function ProtectUserRole({
  role,
  children,
}: ProtectUserRoleProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = await authStorage.getAuthToken();
        const userRole = await authStorage.getuserRole();

        if (!isMounted) return;

        if (!token || !userRole) {
          // Pas connecté → redirige vers login
          router.replace('/(auth)/login');
          return;
        }
        console.log(role);

        if (userRole !== role) {
          // Rôle incorrect → alerte et redirection vers la bonne zone
          Alert.alert(
            'Accès refusé',
            `Vous n'avez pas le rôle ${role} pour accéder à cette page.`,
            [
              {
                text: 'Non',
                onPress: () => {
                  authStorage.clearAuthData();
                  router.replace('/(auth)/login');
                },
              },
              {
                text: 'oui',
                onPress: () =>
                  router.replace(
                    userRole === 'vendor' ? '/(vendor)' : '/(client)',
                  ),
              },
            ],
          );
          return;
        }

        // Tout est bon → affiche le contenu
        setLoading(false);
      } catch (error) {
        console.error('Erreur Auth:', error);
        router.replace('/(auth)/login');
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [role, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A00F4" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
