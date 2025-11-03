import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Assurez-vous que ces imports sont bien configurés dans votre projet
import uploadImageToCloudinary from '@/app/api/uploadFile';
import Spinner from 'react-native-loading-spinner-overlay';
import { UserClass } from '@/users/user';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';

const PRIMARY_COLOR = '#EC4899';

export interface UserData {
  name?: string;
  email?: string;
  birthday?: string;
  phone?: string;
  photoURL?: string;
}

// Utilisation du hook dans le composant principal
// const { width, height } = useWindowDimensions();

export default function ProfileScreen() {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'info' | 'geo'>('info');
  const [profileImage, setProfileImage] = useState<string>(
    'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // La condition pour l'affichage étroit (pour les petits écrans horizontaux)
  const isNarrow = height < 980;

  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    birthday: 'Birthday',
    phone: '',
    photoURL: '',
  });

  const [editableEmail, setEditableEmail] = useState('');
  const [editableBirthday, setEditableBirthday] = useState('Birthday');
  const [editablePhone, setEditablePhone] = useState('');

  // Ref pour focus auto sur le premier champ (Birthday)
  const birthdayInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsPageLoading(true);
      setLoadError(null);

      try {
        // Simulez le chargement pour l'exemple si les dépendances ne sont pas là
        // REMPLACEZ CE BLOC PAR VOTRE CODE RÉEL DE fetchFirebaseUserInfo
        const data = await fetchFirebaseUserInfo();

        if (data) {
          const userInfo: UserData = {
            name: data.name || 'User',
            email: data.email || '',
            photoURL: data.photoURL || '',
            phone: data.phone,
          };

          setUserData(userInfo);
          setProfileImage(userInfo.photoURL || '');
          setEditableEmail(userInfo.email || '');
          setEditableBirthday(userInfo.name || '');
          setEditablePhone(userInfo.phone || '');
        } else {
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
        setIsPageLoading(false);
      }
    };

    loadUserData();
  }, []);

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 1,
    });
    if (!result.canceled) {
      setLoading(true);
      const uid = await authStorage.getUserId();
      // Assurez-vous que cette fonction est opérationnelle
      const resultUpload = await uploadImageToCloudinary(result.assets[0].uri);

      if (resultUpload && uid) {
        // Assurez-vous que cette fonction est opérationnelle
        const isupdate = await UserClass.UpdateProfile(resultUpload, uid);
        console.log(resultUpload, 'hjgjhhh', uid, isupdate);
        setLoading(false);
        setProfileImage(result.assets[0].uri);
        setModalVisible(false);
      } else {
        setLoading(false);
        // Afficher une alerte en cas d'échec d'upload/update
        Alert.alert('Erreur', 'Échec de la mise à jour de la photo de profil.');
      }
    }
  };

  const takePhotoWithCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 1,
    });
    if (!result.canceled) {
      setLoading(true);
      const uid = await authStorage.getUserId();
      // Assurez-vous que cette fonction est opérationnelle
      const resultUpload = await uploadImageToCloudinary(result.assets[0].uri);
      console.log(resultUpload, 'hjgjhhh');

      if (resultUpload && uid) {
        // Assurez-vous que cette fonction est opérationnelle
        await UserClass.UpdateProfile(resultUpload, uid);
        setLoading(false);
        setProfileImage(result.assets[0].uri);
        setModalVisible(false);
      } else {
        setLoading(false);
        // Afficher une alerte en cas d'échec d'upload/update
        Alert.alert('Erreur', 'Échec de la mise à jour de la photo de profil.');
      }
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      setLoading(true);
      console.log('Saving changes:', {
        email: editableEmail,
        birthday: editableBirthday,
        phone: editablePhone,
      });
      const uid = await authStorage.getUserId();
      await UserClass.UpdateProfileUser(
        {
          email: editableEmail,
          name: editableBirthday,
          phone: editablePhone,
        },
        uid ? uid : '',
      );

      setUserData({
        ...userData,
        email: editableEmail,
        birthday: editableBirthday,
        phone: editablePhone,
      });
      setLoading(false);
      setIsEditing(false);
      Alert.alert('Succès', 'Votre profil a été mis à jour.');
    } else {
      setIsEditing(true);
      // ✅ Focus automatique sur le premier champ (Birthday)
      setTimeout(() => {
        birthdayInputRef.current?.focus();
      }, 100);
    }
  };

  if (isPageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur de chargement : {loadError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
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

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={loading}
        textContent={'Mise à jour en cours...'}
        textStyle={{ color: '#fff' }}
        overlayColor="rgba(0, 0, 0, 0.7)"
      />

      {/* Barres d'onglets (fixées en haut) */}
      <LinearGradient colors={['#fff', '#f9f9f9']} style={styles.bottomTabs}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'info' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('info')}
        >
          <FontAwesome
            name="user"
            size={22}
            color={activeTab === 'info' ? PRIMARY_COLOR : '#9e9e9e'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'info' && styles.tabTextActive,
            ]}
          >
            Information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'geo' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('geo')}
        >
          <Feather
            name="map-pin"
            size={22}
            color={activeTab === 'geo' ? PRIMARY_COLOR : '#9e9e9e'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'geo' && styles.tabTextActive,
            ]}
          >
            Géolocalisation
          </Text>
        </TouchableOpacity>
      </LinearGradient>
      {/* --- */}

      {/* Contenu des onglets (Défilant si nécessaire) */}
      <View style={{ flex: 1 }}>
        {activeTab === 'info' ? (
          // ✅ ScrollView pour l'onglet Information
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent, // Style ajouté pour assurer le flex du contenu
              isNarrow && styles.narrow,
            ]}
          >
            <LinearGradient colors={['#fff', '#fff']} style={styles.header}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: profileImage
                      ? profileImage
                      : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.cameraIcon}
                  onPress={() => setModalVisible(true)}
                >
                  <FontAwesome name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.name}>{userData.name}</Text>
            </LinearGradient>

            <View style={styles.infoContainer}>
              {/* Ligne : Anniversaire */}
              <View style={styles.infoRow}>
                <MaterialIcons name="cake" size={22} color={PRIMARY_COLOR} />
                {isEditing ? (
                  <TextInput
                    ref={birthdayInputRef}
                    style={styles.infoInput}
                    value={editableBirthday}
                    onChangeText={setEditableBirthday}
                    placeholder="nom"
                    keyboardType="default"
                  />
                ) : (
                  <Text style={styles.infoText}>{editableBirthday}</Text>
                )}
              </View>
              {/* Ligne : Téléphone */}
              <View style={styles.infoRow}>
                <Feather name="phone" size={22} color={PRIMARY_COLOR} />
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editablePhone}
                    onChangeText={setEditablePhone}
                    placeholder="Téléphone"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                ) : (
                  <Text style={styles.infoText}>{editablePhone}</Text>
                )}
              </View>

              {/* Ligne : Email */}
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={22} color={PRIMARY_COLOR} />
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editableEmail}
                    onChangeText={setEditableEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.infoText}>{editableEmail}</Text>
                )}
              </View>

              {/* Ligne : Changer de mot de passe */}
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => setPasswordModalVisible(true)}
              >
                <Feather name="lock" size={22} color={PRIMARY_COLOR} />
                <Text style={styles.infoText}>Changer de mot de passe</Text>
                <Feather
                  name="chevron-right"
                  size={20}
                  color="#9e9e9e"
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>

              {/* Bouton Éditer / Sauvegarder */}
              <TouchableOpacity
                onPress={handleEditToggle}
                style={styles.editButtonWrapper}
              >
                <LinearGradient
                  colors={[
                    !isEditing ? PRIMARY_COLOR : '#333',
                    !isEditing ? PRIMARY_COLOR : '#333',
                  ]}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>
                    {isEditing ? 'Sauvegarder' : 'Modifier le profil'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // Contenu de l'onglet Géolocalisation
          <View style={styles.geoContainer}>
            <Text style={styles.geoTitle}>📍 Position géographique</Text>
            <Text style={styles.geoText}>
              Latitude: -18.8792{'\n'}Longitude: 47.5079{'\n'}(Antananarivo,
              Madagascar)
            </Text>
          </View>
        )}
      </View>
      {/* --- */}

      {/* Modal pour le choix de la photo de profil */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.imagePickerModalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={takePhotoWithCamera}
            >
              <Text style={styles.modalText}>Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.modalText}>Importer depuis la galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[
                  styles.modalText,
                  { color: PRIMARY_COLOR, fontWeight: '700' },
                ]}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal pour le changement de mot de passe */}
      <Modal
        animationType="slide"
        transparent
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPasswordModalVisible(false)}
        >
          <View style={styles.passwordModalContent}>
            <Text style={styles.passwordModalTitle}>
              Changer de mot de passe
            </Text>

            <TextInput
              style={styles.passwordInput}
              placeholder="Mot de passe actuel"
              secureTextEntry
            />

            <TextInput
              style={styles.passwordInput}
              placeholder="Nouveau mot de passe"
              secureTextEntry
            />

            <TextInput
              style={styles.passwordInput}
              placeholder="Confirmer le nouveau mot de passe"
              secureTextEntry
            />

            <TouchableOpacity style={styles.passwordSaveButton}>
              <LinearGradient
                colors={[PRIMARY_COLOR, PRIMARY_COLOR]}
                style={styles.passwordSaveButtonGradient}
              >
                <Text style={styles.passwordSaveButtonText}>Mettre à jour</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.passwordCancelButton}
              onPress={() => setPasswordModalVisible(false)}
            >
              <Text style={styles.passwordCancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    flexGrow: 1, // Assure que le contenu s'étire si court, tout en permettant le défilement
    paddingBottom: 20, // Ajout d'un padding en bas pour le ScrollView
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  narrow: {
    height: 800,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da',
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
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  avatarWrapper: {
    position: 'relative',
    width: 150,
    height: 150,
    marginBottom: 10,
    alignSelf: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  header: { alignItems: 'center', paddingTop: 20 },
  name: { color: PRIMARY_COLOR, fontSize: 20, fontWeight: '600' },
  infoContainer: { marginTop: 30, paddingHorizontal: 30 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  infoText: { marginLeft: 15, fontSize: 15, color: '#333', flex: 1 },
  infoInput: {
    marginLeft: 15,
    fontSize: 15,
    color: '#333',
    flex: 1,
    padding: 0,
  },
  editButtonWrapper: { alignItems: 'center', marginTop: 20, marginBottom: 80 },
  editButton: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  geoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  geoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 10,
  },
  geoText: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22 },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    elevation: 8,
  },
  tabButton: { alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { transform: [{ scale: 1.05 }] },
  tabText: { fontSize: 13, color: '#9e9e9e', marginTop: 2 },
  tabTextActive: { color: PRIMARY_COLOR, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imagePickerModalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden', // Pour contenir les bordures
  },
  modalOption: {
    padding: 18,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  modalText: { fontSize: 16 },
  modalCancel: { borderBottomWidth: 0 },
  passwordModalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 100, // Déplacer vers le haut
    borderRadius: 20,
    padding: 25,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 25,
  },
  passwordInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    marginBottom: 15,
  },
  passwordSaveButton: { marginTop: 10, marginBottom: 15 },
  passwordSaveButtonGradient: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  passwordSaveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  passwordCancelButton: { alignItems: 'center', padding: 10 },
  passwordCancelButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },
});
