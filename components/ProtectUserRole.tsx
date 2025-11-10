import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authStorage } from '@/utils/authStorage';

interface ProtectUserRoleProps {
  role: 'vendor' | 'client' | 'livrer';
  children: React.ReactNode;
}

export default function ProtectUserRole({
  role,
  children,
}: ProtectUserRoleProps) {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userRoleDetected, setUserRoleDetected] = useState<
    'vendor' | 'client' | 'livrer' | null
  >(null);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = await authStorage.getAuthToken();
        const userRole: string | null = await authStorage.getuserRole();

        if (!isMounted) return;

        if (!token || !userRole) {
          router.replace('/(auth)/login');
          return;
        }

        // ✅ Vérifie que le rôle est valide
        if (!['vendor', 'client', 'livrer'].includes(userRole)) {
          router.replace('/(auth)/login');
          return;
        }

        // ✅ Si l'utilisateur a un rôle différent, on bloque et affiche le modal
        if (userRole !== role) {
          setUserRoleDetected(userRole as 'vendor' | 'client' | 'livrer');
          setLoading(false);
          setShowModal(true);

          Animated.timing(modalAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }).start();
          return;
        }

        // ✅ Tout est bon → on peut afficher le contenu
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

  const handleRedirect = (redirect: boolean) => {
    setShowModal(false);
    if (redirect) {
      if (userRoleDetected === 'vendor') router.replace('/(vendor)');
      else if (userRoleDetected === 'client') router.replace('/(client)');
      else if (userRoleDetected === 'livrer') router.replace('/(livrer)');
    } else {
      authStorage.clearAuthData();
      router.replace('/(auth)/login');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006dff" />
      </View>
    );
  }

  return (
    <>
      {children}
      {showModal && (
        <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Accès refusé</Text>
            <Text style={styles.modalMessage}>
              Vous n'avez pas le rôle {role} pour accéder à cette page.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => handleRedirect(false)}
              >
                <Text style={styles.buttonText}>Non</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleRedirect(true)}
              >
                <Text style={styles.buttonText}>Oui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#006dff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#006dff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.45,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  confirmButton: {
    backgroundColor: '#006dff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
