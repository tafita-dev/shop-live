import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  ScrollView, // Ajout pour le défilement sur petits écrans
  Platform, // Ajout pour gérer les styles spécifiques à la plateforme
  KeyboardAvoidingView, // Ajout pour éviter que le clavier ne cache les inputs
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ImageIcon } from 'lucide-react-native';
// Assurez-vous que les imports suivants existent et sont corrects dans votre projet
import { CategorieClass } from '@/users/categorie';
import Spinner from 'react-native-loading-spinner-overlay';
import uploadImageToCloudinary from '@/app/api/uploadFile';
import { authStorage } from '@/utils/authStorage';

// Utilisation de Dimensions pour des valeurs responsives
const { width, height } = Dimensions.get('window');

// Facteurs pour rendre les tailles responsives
const responsiveWidth = (size: any) => width * size;
const responsiveHeight = (size: any) => height * size;
const responsiveFontSize = (size: any) => Math.min(width, height) * size;

type categorieProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

export const AddCategory: React.FC<categorieProps> = ({ setStep }) => {
  const [category, setCategory] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600, // Légèrement plus long pour une meilleure transition
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleChange = (field: string, value: string) => {
    setCategory((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async (fromCamera = false) => {
    // ... (Logique de pickImage non modifiée, mais le code de style révisé l'utilisera mieux)
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Veuillez autoriser l’accès à la caméra ou à la galerie pour continuer.',
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
            aspect: [4, 3], // Un aspect ratio standard pour les images
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images', // Correction du type de média
            allowsEditing: true,
            quality: 0.7,
            aspect: [4, 3],
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCategory((prev) => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erreur',
        'Impossible de sélectionner l’image. Veuillez réessayer.',
      );
    }
  };

  const handleSubmit = async () => {
    if (!category.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est obligatoire.');
      return;
    }

    setLoading(true);
    try {
      const image = await uploadImageToCloudinary(category.image);
      if (!image) {
        Alert.alert(
          'Erreur',
          'Impossible de télécharger l’image. Veuillez vous assurer d’avoir sélectionné une image.',
        );
        setLoading(false);
        return;
      }
      const userConneted = await authStorage.getUserId();

      const res = await CategorieClass.createCategorie({
        description: category.description,
        image,
        name: category.name,
        vendorId: userConneted || '',
      });

      if (res.success) {
        Alert.alert('✅ Succès', 'Catégorie ajoutée avec succès !', [
          { text: 'OK', onPress: () => setStep(1) },
        ]);
        setCategory({ name: '', description: '', image: '' });
      } else {
        Alert.alert(
          'Erreur',
          res.message ||
            'Une erreur inconnue est survenue lors de la création.',
        );
      }
    } catch (error) {
      console.error('Erreur lors de la soumission: ', error);
      Alert.alert(
        'Erreur',
        'Impossible d’ajouter la catégorie. Veuillez vérifier votre connexion et réessayer.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={responsiveFontSize(0.045)} />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>📂 Nouvelle Catégorie</Text>
          </View>

          <Spinner
            visible={loading}
            textContent="Création en cours..."
            textStyle={styles.spinnerText}
            overlayColor="rgba(0,0,0,0.6)"
          />

          {/* Formulaire */}
          <View style={styles.form}>
            <Text style={styles.label}>Nom de la Catégorie *</Text>
            <TextInput
              placeholder="Ex: Pâtisseries, Électronique..."
              placeholderTextColor="#999"
              style={styles.input}
              value={category.name}
              onChangeText={(text) => handleChange('name', text)}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Décrivez brièvement cette catégorie..."
              placeholderTextColor="#999"
              style={[styles.input, styles.textarea]}
              multiline
              value={category.description}
              onChangeText={(text) => handleChange('description', text)}
            />

            <Text style={styles.label}>Image de la Catégorie</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => pickImage(false)}
              >
                <ImageIcon color="#fff" size={responsiveFontSize(0.04)} />
                <Text style={styles.imageButtonText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: '#EC4899' }]}
                onPress={() => pickImage(true)}
              >
                <Camera color="#fff" size={responsiveFontSize(0.04)} />
                <Text style={styles.imageButtonText}>Caméra</Text>
              </TouchableOpacity>
            </View>

            {category.image ? (
              <Image source={{ uri: category.image }} style={styles.preview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon color="#aaa" size={responsiveFontSize(0.1)} />
                <Text style={styles.imagePlaceholderText}>
                  Aucune image sélectionnée
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonLoading,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Créer la catégorie</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Conteneur Principal
  scrollContent: {
    flexGrow: 1,
    paddingBottom: responsiveHeight(0.05), // Espace en bas pour un meilleur confort de défilement
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Couleur de fond plus douce
    paddingHorizontal: responsiveWidth(0.045), // Utilisation de pourcentage
    paddingTop: responsiveHeight(0.02),
  },

  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(0.03),
    marginTop: Platform.OS === 'android' ? responsiveHeight(0.02) : 0, // Marge pour Android
  },
  title: {
    fontSize: responsiveFontSize(0.055),
    fontWeight: '800',
    color: '#1f2937', // Un noir plus doux
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: responsiveHeight(0.01),
    paddingHorizontal: responsiveWidth(0.03),
    borderRadius: 25, // Bordures plus rondes
    shadowColor: '#EC4899',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4, // Ombre Android
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: responsiveWidth(0.01),
    fontSize: responsiveFontSize(0.035),
  },

  // Spinner
  spinnerText: {
    color: '#fff',
    fontSize: responsiveFontSize(0.04),
    fontWeight: '600',
  },

  // Formulaire et Inputs
  form: {
    flex: 1,
    padding: responsiveWidth(0.02),
  },
  label: {
    fontSize: responsiveFontSize(0.038),
    fontWeight: '600',
    color: '#374151',
    marginBottom: responsiveHeight(0.005),
    marginTop: responsiveHeight(0.01),
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: responsiveHeight(0.018),
    marginBottom: responsiveHeight(0.02),
    borderWidth: 1.5,
    borderColor: '#e5e7eb', // Bordure légère
    color: '#1f2937',
    fontSize: responsiveFontSize(0.035),
    shadowColor: '#000', // Ombre subtile pour le relief
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textarea: {
    height: responsiveHeight(0.15), // Hauteur relative
    textAlignVertical: 'top',
  },

  // Image Picking
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(0.02),
    gap: responsiveWidth(0.03),
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(0.015),
    borderRadius: 12,
    gap: responsiveWidth(0.02),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: responsiveFontSize(0.035),
  },
  preview: {
    width: '100%',
    height: responsiveHeight(0.25), // Hauteur basée sur le pourcentage de l'écran
    borderRadius: 12,
    marginBottom: responsiveHeight(0.03),
    borderWidth: 3,
    borderColor: '#EC4899',
    resizeMode: 'cover', // Assure que l'image couvre la zone
  },
  imagePlaceholder: {
    width: '100%',
    height: responsiveHeight(0.25),
    borderRadius: 12,
    marginBottom: responsiveHeight(0.03),
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#aaa',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: responsiveFontSize(0.035),
  },

  // Bouton de Soumission
  submitButton: {
    backgroundColor: '#1f2937', // Un noir plus professionnel
    paddingVertical: responsiveHeight(0.02),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: responsiveHeight(0.02),
    shadowColor: '#1f2937',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonLoading: {
    backgroundColor: '#9ca3af', // Gris lorsque désactivé
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: responsiveFontSize(0.04),
    fontWeight: '800',
    textTransform: 'uppercase', // Texte en majuscules
  },
});
