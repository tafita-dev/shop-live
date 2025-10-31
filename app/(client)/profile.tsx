import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  ActivityIndicator, // ⬅️ IMPORTÉ : Indicateur de chargement
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3, X, Save, Camera } from 'lucide-react-native';
// NOTE : Vous aurez besoin d'installer 'expo-image-picker' pour la vraie gestion de photo.
// import * as ImagePicker from 'expo-image-picker';

import { User } from '@/types/user';
import { fetchFirebaseUserInfo } from '@/utils/authStorage';
import ProfileScreen from '@/components/ProfileScreen'; // Le composant qui affiche le profil

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 110;
const PRIMARY_COLOR = '#EC4899'; // Couleur principale pour le chargement

export default function Profile() {
  const initialUserInfo: User = {
    name: '',
    role: 'client',
    email: '',
    authProviders: { emailPassword: false, facebookId: '', googleId: '' },
    createdAt: '',
    phone: '',
    photoURL: '',
  };

  // 1. État principal (données sauvegardées)
  const [userInfo, setUserInfo] = useState<User>(initialUserInfo);
  // 2. État temporaire (données en cours d'édition)
  const [tempUserInfo, setTempUserInfo] = useState<User>(initialUserInfo);
  // 3. État du mode édition
  const [isEditing, setIsEditing] = useState(false);
  // 4. 🚀 NOUVEL ÉTAT DE CHARGEMENT
  const [isLoading, setIsLoading] = useState(true);
  // 5. État d'erreur si le chargement échoue
  const [loadError, setLoadError] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Chargement initial des données
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true); // ⬅️ Démarre le chargement
      setLoadError(null); // Réinitialise l'erreur

      try {
        const data = await fetchFirebaseUserInfo();
        if (data) {
          // Logique pour s'assurer que le rôle est valide
          const role =
            data.role === 'client' || data.role === 'vendor'
              ? data.role
              : 'client';

          // Création de l'objet utilisateur complet à partir des données
          const loadedInfo: User = {
            ...initialUserInfo,
            name: data.name || initialUserInfo.name,
            photoURL: data.photoURL || initialUserInfo.photoURL,
            email: data.email || initialUserInfo.email,
            role,
            phone: data.phone || initialUserInfo.phone,
          };
          console.log(loadedInfo, 'hjghghj');

          setUserInfo(loadedInfo);
          setTempUserInfo(loadedInfo); // Initialiser l'état temporaire avec les données chargées
        } else {
          // Si fetchFirebaseUserInfo retourne null/undefined
          setLoadError(
            "Impossible de trouver les informations de l'utilisateur.",
          );
        }
      } catch (error) {
        console.error(
          'Erreur lors du chargement des infos utilisateur:',
          error,
        );
        setLoadError('Une erreur réseau ou interne est survenue.');
      } finally {
        setIsLoading(false); // ⬅️ Termine le chargement, qu'il y ait eu succès ou erreur
      }
    };
    loadUserData();
  }, []);

  // 🚀 LOGIQUE D'AFFICHAGE CONDITIONNEL

  // 1. Si le chargement est en cours
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  // 2. Si le chargement a échoué
  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur de chargement : {loadError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            // Redéclencher le chargement initial en mettant à jour une dépendance si nécessaire,
            // ou simplement en rappelant la fonction de chargement si elle était dans l'effet,
            // pour l'instant, on laisse l'utilisateur revenir à l'écran précédent.
            Alert.alert(
              'Erreur',
              "Veuillez redémarrer l'application ou réessayer plus tard.",
            );
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Affichage normal du profil (après chargement réussi)
  return (
    <ProfileScreen
      email={tempUserInfo.email}
      name={tempUserInfo.name}
      phone={tempUserInfo.phone}
      image={tempUserInfo.photoURL}
      // Ajoutez ici toutes les props nécessaires à ProfileScreen
    />
  );
}

// --- Styles pour le chargement et l'erreur ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Un fond neutre pour le chargement
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da', // Fond clair pour l'erreur
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#721c24',
    marginBottom: 20,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
