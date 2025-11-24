import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { authStorage } from '@/utils/authStorage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = await authStorage.getAuthToken();
        const role = await authStorage.getuserRole();
        console.log('Roles:', role);

        if (!isMounted) return;
        console.log(token, role);

        if (token) {
          if (role === 'vendor') {
            console.log('➡️ Redirection vers Vendor', role);
            router.replace('/(vendor)');
          } else if (role === 'livrer') {
            console.log('➡️ Redirection vers livrer', role);
            router.replace('/(livrer)');
          } else {
            console.log('➡️ Redirection vers Client', role);
            console.log('➡️ Redirection vers Client');
            router.replace('/(client)');
          }
        } else {
          console.log('➡️ Redirection vers Login');
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error(
          'Erreur lors de la vérification de l’authentification :',
          error,
        );
        if (isMounted) router.replace('/(auth)/login');
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
});
