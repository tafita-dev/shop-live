import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Plus, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProduitClass } from '@/users/product';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { authStorage } from '@/utils/authStorage';
import uploadImageToCloudinary from '@/app/api/uploadFile';
// ⚠️ ASSUREZ-VOUS D'IMPORTER VOTRE COMPOSANT SPINNER CI-DESSOUS
import Spinner from 'react-native-loading-spinner-overlay';
import { router } from 'expo-router'; // Assurez-vous que l'importation est correcte

// Utilisation de Dimensions pour des valeurs responsives
const { width, height } = Dimensions.get('window');

// Fonctions pour des tailles responsives
const responsiveWidth = (size: any) => width * size;
const responsiveHeight = (size: any) => height * size;
const responsiveFontSize = (size: any) => Math.min(width, height) * size;

interface Product {
  code: string;
  title: string;
  description: string;
  image: string;
  stock: number;
  price: number;
}

const INITIAL_PRODUCT_STATE: Product = {
  code: '',
  title: '',
  description: '',
  image: '',
  stock: 0,
  price: 0,
};
type productProps = {
  handleModalClose: () => void;
};

export const CreateProduct: React.FC<productProps> = ({ handleModalClose }) => {
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCT_STATE);
  // 🟢 Nouvel état pour le système de chargement
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          `Veuillez autoriser l’accès à la ${
            fromCamera ? 'caméra' : 'galerie'
          } pour sélectionner une image.`,
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProduct({ ...product, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de sélectionner l’image.');
    }
  };

  const params = useLocalSearchParams<{ categoryId?: string }>();
  const categoryId = params.categoryId ?? 'Aucun lien';

  // 🟢 Fonction de réinitialisation des champs
  const resetProductState = () => {
    setProduct(INITIAL_PRODUCT_STATE);
    setStep(1); // Retour à la première étape
  };

  const nextStep = () => {
    // Validation simple maintenue
    if (step === 1 && (!product.code.trim() || !product.title.trim())) {
      Alert.alert('Erreur', 'Veuillez remplir le code et le nom du produit.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!product.title.trim() || product.price <= 0) {
      Alert.alert('Erreur', 'Le nom et le prix du produit sont obligatoires.');
      return;
    }

    setIsSubmitting(true); // 🟢 Démarrer le chargement

    try {
      const userConneted = await authStorage.getUserId();
      let imageUrl = product.image;

      // 1. UPLOAD DE L'IMAGE
      if (product.image) {
        const uploadedUrl = await uploadImageToCloudinary(product.image);
        if (!uploadedUrl) {
          Alert.alert(
            'Erreur',
            'Impossible de télécharger l’image. Vérifiez votre connexion.',
          );
          return;
        }
        imageUrl = uploadedUrl;
      }

      // 2. CRÉATION DU PRODUIT
      const res = await ProduitClass.createProduit({
        categoryId: categoryId,
        code: product.code,
        description: product.description,
        price: product.price,
        title: product.title,
        stock: product.stock,
        vendorId: userConneted || '',
        image: imageUrl, // Utilisation de l'URL uploadée
      });

      // 3. GESTION DU SUCCÈS/ÉCHEC
      if (res.success) {
        Alert.alert(
          '✅ Succès',
          `Produit "${product.title}" créé avec succès !`,
          [
            {
              text: 'OK',
              onPress: () => {
                // 🟢 Fermer le dialogue/la page et effacer les champs
                resetProductState();
                handleModalClose();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          '❌ Erreur',
          res.message || 'La création du produit a échoué.',
          [],
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur Critique', 'Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false); // 🟢 Arrêter le chargement
    }
  };

  const renderImagePickerContent = (isCamera: boolean) => {
    const isImageSelected = product.image && !isCamera;

    if (isImageSelected && !isCamera) {
      return (
        <Image source={{ uri: product.image }} style={styles.imagePreview} />
      );
    }

    return (
      <>
        {isCamera ? (
          <Camera size={responsiveFontSize(0.06)} color="#10B981" />
        ) : (
          <ImageIcon size={responsiveFontSize(0.06)} color="#EC4899" />
        )}
        <Text
          style={[
            styles.imageLabel,
            { color: isCamera ? '#10B981' : '#EC4899' },
          ]}
        >
          {isCamera ? 'Caméra' : 'Galerie'}
        </Text>
      </>
    );
  };

  const getStepTitle = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return 'Informations Générales';
      case 2:
        return 'Description Détaillée';
      case 3:
        return 'Média (Photo)';
      case 4:
        return 'Prix & Stock';
      default:
        return '';
    }
  };

  return (
    <>
      {/* 🟢 Composant de chargement */}
      <Spinner
        visible={isSubmitting}
        textContent={'Création en cours...'}
        textStyle={{ color: '#fff' }}
        overlayColor="rgba(0, 0, 0, 0.7)"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>
          📦 Créer un Produit -
          <Text style={styles.stepTitle}>{getStepTitle(step)}</Text>
        </Text>
        <Text style={styles.progress}>Étape {step} sur 4</Text>

        {/* Contenu des Étapes (inchangé) */}
        <View style={styles.contentWrapper}>
          {/* Step 1: Code & Title */}
          {step === 1 && (
            <View style={styles.step}>
              <Text style={styles.label}>Code du produit *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: C001 (Utilisé pour la gestion d'inventaire)"
                placeholderTextColor="#9ca3af"
                value={product.code}
                onChangeText={(text) => setProduct({ ...product, code: text })}
              />
              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: T-Shirt Coton Premium"
                placeholderTextColor="#9ca3af"
                value={product.title}
                onChangeText={(text) => setProduct({ ...product, title: text })}
              />
            </View>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <View style={styles.step}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Description complète pour le client (matériaux, tailles, usage...)"
                placeholderTextColor="#9ca3af"
                multiline
                value={product.description}
                onChangeText={(text) =>
                  setProduct({ ...product, description: text })
                }
              />
            </View>
          )}

          {/* Step 3: Image */}
          {step === 3 && (
            <View style={styles.step}>
              <Text style={styles.label}>Photo du produit</Text>
              <View style={styles.imagePickerRow}>
                {/* Galerie Button */}
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={() => pickImage(false)}
                  activeOpacity={0.7}
                >
                  {renderImagePickerContent(false)}
                </TouchableOpacity>

                {/* Camera Button */}
                <TouchableOpacity
                  style={[styles.imagePickerButton, styles.cameraButton]}
                  onPress={() => pickImage(true)}
                  activeOpacity={0.7}
                >
                  {renderImagePickerContent(true)}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 4: Stock & Price */}
          {step === 4 && (
            <View style={styles.step}>
              <Text style={styles.label}>Stock Disponible</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 50"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={product.stock.toString()}
                onChangeText={(text) =>
                  setProduct({
                    ...product,
                    stock: parseInt(text.replace(/[^0-9]/g, ''), 10) || 0,
                  })
                }
              />
              <Text style={styles.label}>Prix (Ar) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 15000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={product.price.toString()}
                onChangeText={(text) =>
                  setProduct({
                    ...product,
                    price: parseInt(text.replace(/[^0-9]/g, ''), 10) || 0,
                  })
                }
              />

              <View style={styles.preview}>
                <Text style={styles.previewTitle}>✨ Aperçu Final</Text>
                <Text style={styles.previewText}>
                  Code:{' '}
                  <Text style={styles.previewValue}>
                    {product.code || 'N/A'}
                  </Text>
                </Text>
                <Text style={styles.previewText}>
                  Nom:{' '}
                  <Text style={styles.previewValue}>
                    {product.title || 'N/A'}
                  </Text>
                </Text>
                <Text style={styles.previewText}>
                  Stock:{' '}
                  <Text style={styles.previewValue}>{product.stock}</Text>
                </Text>
                <Text style={styles.previewText}>
                  Prix:{' '}
                  <Text style={[styles.previewValue, styles.priceValue]}>
                    {product.price.toLocaleString()} Ar
                  </Text>
                </Text>
                {product.image && (
                  <Image
                    source={{ uri: product.image }}
                    style={styles.imageFinalPreview}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Navigation Buttons */}
      <View style={styles.navContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: '#6b7280' }]}
            onPress={prevStep}
            disabled={isSubmitting} // Désactivé pendant le chargement
          >
            <Text style={styles.navText}>← Précédent</Text>
          </TouchableOpacity>
        )}
        {step < 4 ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={nextStep}
            disabled={isSubmitting} // Désactivé pendant le chargement
          >
            <Text style={styles.navText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            // Désactiver si pas de titre, prix <= 0, ou en cours d'envoi
            disabled={
              !product.title.trim() || product.price <= 0 || isSubmitting
            }
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Création...' : '✅ Créer le Produit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

// --- Styles (Inchagés) ---

const styles = StyleSheet.create({
  // Global
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: responsiveWidth(0.05),
    paddingVertical: responsiveHeight(0.03),
  },
  contentWrapper: {
    flex: 1,
  },

  // Header & Progress
  header: {
    fontSize: responsiveFontSize(0.035),
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: responsiveHeight(0.01),
  },
  stepTitle: {
    color: '#EC4899',
  },
  progress: {
    fontSize: responsiveFontSize(0.035),
    color: '#6b7280',
    marginBottom: responsiveHeight(0.03),
    fontWeight: '600',
  },
  step: {
    marginBottom: responsiveHeight(0.02),
    flex: 1,
  },

  // Form Elements
  label: {
    fontSize: responsiveFontSize(0.035),
    fontWeight: '700',
    color: '#374151',
    marginBottom: responsiveHeight(0.005),
    marginTop: responsiveHeight(0.01),
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#EC4899',
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(0.03),
    paddingVertical: responsiveHeight(0.015),
    marginBottom: responsiveHeight(0.02),
    fontSize: responsiveFontSize(0.035),
    color: '#1f2937',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textarea: {
    height: responsiveHeight(0.18),
    textAlignVertical: 'top',
  },

  // Image Picker
  imagePickerRow: {
    flexDirection: 'row',
    gap: responsiveWidth(0.04),
    marginBottom: responsiveHeight(0.02),
  },
  imagePickerButton: {
    flex: 1,
    height: responsiveWidth(0.4),
    borderWidth: 2,
    borderColor: '#EC4899',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cameraButton: {
    borderColor: '#10B981',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageLabel: {
    fontSize: responsiveFontSize(0.03),
    fontWeight: '600',
    marginTop: responsiveHeight(0.01),
  },
  imageStatus: {
    fontSize: responsiveFontSize(0.03),
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: responsiveHeight(0.01),
  },

  // Preview
  preview: {
    marginTop: responsiveHeight(0.03),
    padding: responsiveWidth(0.04),
    borderWidth: 2,
    borderColor: '#EC4899',
    borderRadius: 15,
    backgroundColor: '#fef2f2',
  },
  previewTitle: {
    fontSize: responsiveFontSize(0.04),
    fontWeight: '800',
    color: '#EC4899',
    marginBottom: responsiveHeight(0.01),
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingBottom: 5,
  },
  previewText: {
    fontSize: responsiveFontSize(0.035),
    color: '#374151',
    marginBottom: 3,
  },
  previewValue: {
    fontWeight: '600',
    color: '#1f2937',
  },
  priceValue: {
    color: '#10B981',
    fontSize: responsiveFontSize(0.038),
  },
  imageFinalPreview: {
    width: responsiveWidth(0.4),
    height: responsiveWidth(0.3),
    borderRadius: 10,
    marginTop: responsiveHeight(0.015),
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  // Navigation
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: responsiveWidth(0.04),
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#EC4899',
    paddingVertical: responsiveHeight(0.015),
    borderRadius: 10,
    marginHorizontal: responsiveWidth(0.015),
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: responsiveFontSize(0.035),
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: responsiveHeight(0.015),
    borderRadius: 10,
    marginHorizontal: responsiveWidth(0.015),
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: responsiveFontSize(0.038),
  },
});
