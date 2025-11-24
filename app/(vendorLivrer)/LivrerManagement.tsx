import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Plus,
  Camera,
  ArrowLeft,
  ArrowRight,
  X,
  User,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ProtectUserRole from '@/components/ProtectUserRole';
import { UserClass } from '@/users/user';
import { authStorage } from '@/utils/authStorage';
import uploadImageToCloudinary from '../api/uploadFile';
import Spinner from 'react-native-loading-spinner-overlay';
import { isNull } from 'lodash';
import { formatFirebaseError } from '@/utils/fromater';
import * as Haptics from 'expo-haptics';

import {
  Button,
  TextInput as PaperInput,
  Portal,
  Modal as PaperModal,
  Card,
  Text as PaperText,
  useTheme,
  FAB,
} from 'react-native-paper';
import { usePushNotification } from '@/useNotifications';

type Livreur = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  status?: string;
};

const { width } = Dimensions.get('window');

// --- Composant Badge de Statut ---
const StatusBadge = ({ status }: { status: string | undefined }) => {
  const normalizedStatus = (status || 'pending').toLowerCase();
  let color = '#6B7280'; // Gris
  let label = 'En Attente';
  let Icon = Clock;

  if (normalizedStatus === 'terminer') {
    color = '#10B981';
    label = 'Actif';
    Icon = CheckCircle;
  } else if (normalizedStatus === 'blocked') {
    color = '#EF4444';
    label = 'Bloqué';
    Icon = X;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Icon size={14} color={color} />
      <PaperText style={[styles.statusText, { color }]}>{label}</PaperText>
    </View>
  );
};

export default function LivreurManager() {
  const theme = useTheme();

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
  const { expoPushToken } = usePushNotification();

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadLivreursAndPermissions = async () => {
      setLoading(true);
      try {
        const uid = await authStorage.getUserId();
        if (uid) {
          const response = await UserClass.getLivreursByVendor(uid);
          if (response.success) setLivreurs(response.data as any);
        }

        // Permissions caméra
        const cameraPerm = await ImagePicker.getCameraPermissionsAsync();
        if (cameraPerm.status !== 'granted') {
          await ImagePicker.requestCameraPermissionsAsync();
        }

        // Permissions galerie
        const galleryPerm = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (galleryPerm.status !== 'granted') {
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
      } catch (error) {
        console.log('Erreur chargement livreurs ou permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLivreursAndPermissions();
  }, []);

  const handleAddPress = () => {
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
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
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
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewLivreur({ ...newLivreur, image: result.assets[0].uri });
    }
  };

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
    setStep(1);
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

      const response = await UserClass.createUser(
        'mialay',
        {
          name: newLivreur.name,
          email: newLivreur.email,
          phone: newLivreur.phone,
          password: newLivreur.password,
          role: 'livrer',
          authProviders: { emailPassword: true },
          vendorId: uid,
          photoURL: imageUrl,
          status: 'pending',
        },
        expoPushToken ? expoPushToken : '',
      );

      if (response.success) {
        Alert.alert('Succès', 'Livreur créé avec succès !');

        const livreursResponse = await UserClass.getLivreursByVendor(uid);
        if (livreursResponse.success) {
          setLivreurs(livreursResponse.data as any);
        }

        closeModal();
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

  const renderItem = ({ item }: { item: Livreur }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content
        style={{ flexDirection: 'row', alignItems: 'center', padding: 0 }}
      >
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={30} color="#EC4899" />
          </View>
        )}

        <View style={styles.cardInfo}>
          <PaperText style={styles.name}>{item.name}</PaperText>
          <PaperText style={styles.info}>{item.email}</PaperText>
          <PaperText style={styles.phone}>{item.phone}</PaperText>
          <StatusBadge status={item.status} />
        </View>

        <View style={{ padding: 8 }}>
          <Button mode="text" onPress={() => {}} compact textColor="#6B7280">
            <ArrowRight size={18} color="#6B7280" />
          </Button>
        </View>
      </Card.Content>
    </Card>
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
        <PaperText style={styles.header}>👷‍♂️ Gestion des Livreurs</PaperText>

        <FlatList
          data={livreurs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <PaperText style={styles.emptyText}>
                Aucun livreur trouvé.
              </PaperText>
              <PaperText style={styles.emptyTextSmall}>
                Appuyez sur '+' pour en ajouter un.
              </PaperText>
            </View>
          }
        />

        {/* FAB animé */}
        <Animated.View
          style={[
            styles.fab,
            { transform: [{ scale: scaleAnim }, { rotate }] },
          ]}
        >
          <FAB
            icon="plus"
            onPress={handleAddPress}
            style={{ backgroundColor: '#EC4899' }}
            small={false}
            color="#fff"
          />
        </Animated.View>

        {/* Modal Paper via Portal */}
        <Portal>
          <PaperModal
            visible={modalVisible}
            onDismiss={closeModal}
            contentContainerStyle={styles.paperModalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <PaperText style={styles.modalTitle}>
                  Créer un Livreur
                </PaperText>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#EC4899" />
                </TouchableOpacity>
              </View>

              {/* … ici tu gardes le reste de tes steps 1 et 2 exactement comme avant … */}
              {/* Step 1 */}
              {step === 1 && (
                <>
                  <PaperInput
                    label="Nom complet"
                    mode="outlined"
                    value={newLivreur.name}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, name: text })
                    }
                    disabled={loading}
                    style={styles.paperInput}
                  />
                  <PaperInput
                    label="Email"
                    mode="outlined"
                    keyboardType="email-address"
                    value={newLivreur.email}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, email: text })
                    }
                    disabled={loading}
                    style={styles.paperInput}
                  />
                  <PaperInput
                    label="Numéro de téléphone"
                    mode="outlined"
                    keyboardType="phone-pad"
                    value={newLivreur.phone}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, phone: text })
                    }
                    disabled={loading}
                    style={styles.paperInput}
                  />

                  <Button
                    mode="contained"
                    onPress={() => setStep(2)}
                    disabled={
                      !newLivreur.name ||
                      !newLivreur.email ||
                      !newLivreur.phone ||
                      loading
                    }
                    buttonColor={
                      newLivreur.name && newLivreur.email && newLivreur.phone
                        ? '#EC4899'
                        : '#FBB6CE'
                    }
                    style={styles.nextButtonPaper}
                    contentStyle={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <PaperText style={styles.nextText}>Suivant</PaperText>
                    <ArrowRight size={18} color="#fff" />
                  </Button>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <TouchableOpacity onPress={handleTakePhoto}>
                    {newLivreur.image ? (
                      <View style={styles.photoPlaceholder}>
                        <Camera size={30} color="#EC4899" />
                        <Image
                          source={{ uri: newLivreur.image }}
                          style={styles.photo}
                        />
                      </View>
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Camera size={30} color="#EC4899" />
                        <PaperText
                          style={{
                            color: '#EC4899',
                            marginTop: 6,
                            fontWeight: '600',
                          }}
                        >
                          Ajouter Photo
                        </PaperText>
                      </View>
                    )}
                  </TouchableOpacity>

                  <PaperInput
                    label="Mot de passe"
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    value={newLivreur.password}
                    onChangeText={(text) =>
                      setNewLivreur({ ...newLivreur, password: text })
                    }
                    disabled={loading}
                    right={
                      <PaperInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={{ marginBottom: 0 }}
                  />

                  <View style={styles.modalButtons}>
                    <Button
                      mode="contained"
                      onPress={() => setStep(1)}
                      disabled={loading}
                      contentStyle={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      buttonColor="#4B5563"
                      style={[styles.modalButton, styles.cancelButton]}
                    >
                      <ArrowLeft size={18} color="#fff" />
                      <PaperText style={styles.buttonText}>Retour</PaperText>
                    </Button>

                    <Button
                      mode="contained"
                      onPress={handleAddLivreur}
                      disabled={loading || !newLivreur.password}
                      loading={loading}
                      buttonColor="#EC4899"
                      contentStyle={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      style={[styles.modalButton, styles.confirmButton]}
                    >
                      <PaperText style={styles.buttonText}>
                        {loading ? 'Création...' : 'Créer'}
                      </PaperText>
                    </Button>
                  </View>
                </>
              )}
            </View>
          </PaperModal>
        </Portal>
      </View>
    </ProtectUserRole>
  );
}

// --- Styles (inchangés) ---
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
  emptyTextSmall: { fontSize: 14, color: '#6B7280' },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'left',
  },
  spinnerText: { color: '#FFF', fontSize: width * 0.04, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  cardInfo: { flex: 1, paddingLeft: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  info: { fontSize: 14, color: '#6B7280' },
  phone: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
  },
  paperModalContainer: { margin: 20, backgroundColor: 'transparent' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#EC4899' },
  stepsContainer: { marginBottom: 12, alignItems: 'center' },
  stepTitle: {
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
  paperInput: { marginBottom: 12 },
  nextButtonPaper: { borderRadius: 12, paddingVertical: 6 },
  nextText: { color: '#fff', fontWeight: '800', marginRight: 6, fontSize: 16 },
  photoButton: { borderRadius: 12, borderColor: '#EC4899', marginBottom: 12 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#EC4899',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: { flex: 1, marginHorizontal: 5, borderRadius: 12 },
  cancelButton: { backgroundColor: '#4B5563' },
  confirmButton: { backgroundColor: '#EC4899' },
  buttonText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
});
