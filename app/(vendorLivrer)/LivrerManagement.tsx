import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Animated,
  Alert,
  Easing,
  Dimensions,
  Vibration, // ⚡ NOUVEL IMPORT UX
} from 'react-native';
import {
  Plus,
  Camera,
  ArrowLeft,
  ArrowRight,
  X,
  Eye,
  EyeOff,
  User, // Ajouté pour le placeholder
  CheckCircle, // Pour le statut actif
  Clock, // Pour le statut en attente
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ProtectUserRole from '@/components/ProtectUserRole';
import { UserClass } from '@/users/user';
import { authStorage } from '@/utils/authStorage';
import uploadImageToCloudinary from '../api/uploadFile';
import Spinner from 'react-native-loading-spinner-overlay';
import { isNull } from 'lodash';
import { formatFirebaseError } from '@/utils/fromater';
import * as Haptics from 'expo-haptics'; // ⚡ NOUVEL IMPORT UX

type Livreur = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  status?: string; // Type plus précis
};

const { width } = Dimensions.get('window');

// --- Composant Badge de Statut pour la Carte UI/UX ---
const StatusBadge = ({ status }: { status: string | undefined }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  let color = '#6B7280'; // Gris
  let label = 'En Attente';
  let Icon = Clock;

  if (normalizedStatus === 'terminer') {
    color = '#10B981'; // Vert
    label = 'Actif';
    Icon = CheckCircle;
  } else if (normalizedStatus === 'blocked') {
    color = '#EF4444'; // Rouge
    label = 'Bloqué';
    Icon = X;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Icon size={14} color={color} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
};
// ----------------------------------------------------

export default function LivreurManager() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newLivreur, setNewLivreur] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    image: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Charger les livreurs au chargement du composant
  useEffect(() => {
    const loadLivreurs = async () => {
      setLoading(true);
      try {
        const uid = await authStorage.getUserId();
        if (!uid) return;

        const response = await UserClass.getLivreursByVendor(uid);
        if (response.success) {
          setLivreurs(response.data as any);
        }
      } catch (error) {
        console.log('Erreur chargement livreurs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLivreurs();
  }, []);

  const handleAddPress = () => {
    // ⚡ Feedback Haptique
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setStep(1);
      setModalVisible(true);
    });
  };

  const handleTakePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Vous devez autoriser la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewLivreur({ ...newLivreur, image: result.assets[0].uri });
    }
  };

  // ⚡ Fonction UX pour fermer la Modal
  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    setNewLivreur({
      name: '',
      email: '',
      phone: '',
      password: '',
      image: '',
    });
    setStep(1); // Retour à l'étape 1 par défaut
  };

  const handleAddLivreur = async () => {
    if (
      !newLivreur.name ||
      !newLivreur.email ||
      !newLivreur.phone ||
      !newLivreur.password
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const uid = await authStorage.getUserId();
      if (isNull(uid)) {
        Alert.alert('Erreur', 'Impossible de récupérer votre ID.');
        setLoading(false);
        return;
      }

      const imageUrl = newLivreur.image
        ? await uploadImageToCloudinary(newLivreur.image)
        : '';

      const response = await UserClass.createUser('mialay', {
        name: newLivreur.name,
        email: newLivreur.email,
        phone: newLivreur.phone,
        password: newLivreur.password,
        role: 'livrer',
        authProviders: { emailPassword: true },
        vendorId: uid,
        photoURL: imageUrl,
        status: 'pending', // ⚡ Défini le statut initial après la création
      });

      if (response.success) {
        Alert.alert('Succès', 'Livreur créé avec succès !');

        // 🔹 Mettre à jour la liste des livreurs
        const livreursResponse = await UserClass.getLivreursByVendor(uid);
        if (livreursResponse.success) {
          setLivreurs(livreursResponse.data as any);
        }

        closeModal(); // Fermeture UX
      } else {
        Alert.alert('Erreur', response.message || 'Une erreur est survenue.');
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        formatFirebaseError(error) ||
          'Une erreur est survenue, veuillez réessayer.',
      );
    } finally {
      setLoading(false);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // ⚡ Rendu de l'élément de liste (UI/UX améliorée)
  const renderItem = ({ item }: { item: Livreur }) => (
    <View style={styles.card}>
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        // ⚡ Placeholder d'avatar plus clair
        <View style={styles.avatarPlaceholder}>
          <User size={30} color="#EC4899" />
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.info}>{item.email}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        {/* Affichage du Badge de Statut */}
        <StatusBadge status={item.status} />
      </View>
      {/* ⚡ Ajout d'un indicateur cliquable (pour futur détail/édition) */}
      <TouchableOpacity style={styles.detailArrow}>
        <ArrowRight size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ProtectUserRole role="vendor">
      <Spinner
        visible={loading}
        textContent="Chargement..."
        textStyle={styles.spinnerText}
        overlayColor="rgba(0,0,0,0.6)"
      />

      <View style={styles.container}>
        <Text style={styles.header}>👷‍♂️ Gestion des Livreurs</Text>

        <FlatList
          data={livreurs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun livreur trouvé.</Text>
              <Text style={styles.emptyTextSmall}>
                Appuyez sur '+' pour en ajouter un.
              </Text>
            </View>
          }
        />

        {/* Bouton flottant */}
        <Animated.View
          style={[
            styles.fab,
            { transform: [{ scale: scaleAnim }, { rotate }] },
          ]}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={handleAddPress}>
            <Plus size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Modal 2 étapes UI/UX améliorée */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeModal} // Fermeture Android
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Créer un Livreur</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#EC4899" />
                </TouchableOpacity>
              </View>

              {/* Barre de progression améliorée */}
              <View style={styles.stepsContainer}>
                <Text style={styles.stepTitle}>
                  {step === 1 ? '1. Coordonnées' : '2. Sécurité & Photo'}
                </Text>
                <View
                  style={[styles.stepBar, step >= 1 && styles.activeStepBar]}
                />
                <View
                  style={[styles.stepBar, step >= 2 && styles.activeStepBar]}
                />
              </View>

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Nom complet"
                    value={newLivreur.name}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, name: text })
                    }
                    editable={!loading}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={newLivreur.email}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, email: text })
                    }
                    editable={!loading}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Numéro de téléphone"
                    keyboardType="phone-pad"
                    value={newLivreur.phone}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, phone: text })
                    }
                    editable={!loading}
                  />

                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      {
                        backgroundColor:
                          newLivreur.name &&
                          newLivreur.email &&
                          newLivreur.phone
                            ? '#EC4899'
                            : '#FBB6CE',
                      },
                    ]}
                    onPress={() => {
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                      setStep(2);
                    }}
                    disabled={
                      !newLivreur.name ||
                      !newLivreur.email ||
                      !newLivreur.phone ||
                      loading
                    }
                  >
                    <Text style={styles.nextText}>Suivant</Text>
                    <ArrowRight size={18} color="#fff" />
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={styles.photoContainer}
                    disabled={loading}
                  >
                    {newLivreur.image ? (
                      <Image
                        source={{ uri: newLivreur.image }}
                        style={styles.photo}
                      />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Camera size={30} color="#EC4899" />
                        <Text
                          style={{
                            color: '#EC4899',
                            marginTop: 6,
                            fontWeight: '600',
                          }}
                        >
                          Ajouter Photo
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="Mot de passe"
                      secureTextEntry={!showPassword}
                      value={newLivreur.password}
                      onChangeText={(text) =>
                        setNewLivreur({ ...newLivreur, password: text })
                      }
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setStep(1);
                      }}
                      disabled={loading}
                    >
                      <ArrowLeft size={18} color="#fff" />
                      <Text style={styles.buttonText}>Retour</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        styles.confirmButton,
                        loading && { opacity: 0.6 },
                      ]}
                      onPress={handleAddLivreur}
                      disabled={loading || !newLivreur.password} // Désactiver si pas de MDP
                    >
                      <Text style={styles.buttonText}>
                        {loading ? 'Création...' : 'Créer'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ProtectUserRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EC489930',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EC4899',
    marginBottom: 5,
  },
  emptyTextSmall: {
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    fontSize: 24, // Augmenté pour l'emphase
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'left', // Alignement à gauche
  },
  spinnerText: { color: '#FFF', fontSize: width * 0.04, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08, // Ombre plus subtile
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    // ⚡ Nouveau style pour les avatars manquants
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  cardInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  info: { fontSize: 14, color: '#6B7280' },
  phone: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  detailArrow: { padding: 8, marginLeft: 10 }, // ⚡ Nouvelle flèche de détail
  // ⚡ Styles Badge de Statut
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // --- FIN Styles Badge de Statut ---
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#EC4899',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4, // Ombre plus prononcée pour le FAB
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Opacité plus forte pour le focus
    justifyContent: 'flex-end', // ⚡ Modal qui vient du bas (UX)
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24, // Padding augmenté
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800', // Plus gras
    color: '#EC4899',
    textAlign: 'center',
  },
  stepsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stepTitle: {
    // ⚡ Titre explicatif de l'étape
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  stepBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
  },
  activeStepBar: { backgroundColor: '#EC4899' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Bordure plus claire
    borderRadius: 12,
    padding: 14, // Padding augmenté
    marginBottom: 16,
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  nextText: { color: '#fff', fontWeight: '800', marginRight: 6, fontSize: 16 },
  photoContainer: { alignSelf: 'center', marginBottom: 20, marginTop: 10 },
  photoPlaceholder: {
    width: 120, // Taille augmentée
    height: 120,
    borderRadius: 60,
    borderWidth: 3, // Bordure plus visible
    borderColor: '#EC4899',
    borderStyle: 'dashed', // Style pointillé pour l'UX d'ajout
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: 120, height: 120, borderRadius: 60 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingRight: 12,
    marginBottom: 16,
  },
  eyeIcon: { padding: 8 },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 0.48, // Ajustement pour plus d'espace
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: { backgroundColor: '#4B5563' },
  confirmButton: { backgroundColor: '#EC4899' },
  buttonText: { color: '#fff', fontWeight: '800', marginLeft: 6, fontSize: 16 },
});
