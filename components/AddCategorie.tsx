import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ImageIcon } from 'lucide-react-native';
import { CategorieClass } from '@/users/categorie';
import Spinner from 'react-native-loading-spinner-overlay';
import uploadImageToCloudinary from '@/app/api/uploadFile';
import { authStorage } from '@/utils/authStorage';

type categorieProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};
const { width } = Dimensions.get('window');

export const AddCategory: React.FC<categorieProps> = ({ setStep }) => {
  const [category, setCategory] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setCategory((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async (fromCamera = false) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Tu dois autoriser l’accès à la caméra ou à la galerie.',
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled) {
        setCategory((prev) => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de sélectionner l’image.');
    }
  };

  const handleSubmit = async () => {
    if (!category.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est obligatoire.');
      return;
    }

    setLoading(true); // ⬅️ activer loader
    try {
      const image = await uploadImageToCloudinary(category.image);
      if (!image) {
        Alert.alert('❌Erreur', 'Impossible de télécharger l’image.');
        setLoading(false);
        return;
      }
      const userConneted = await authStorage.getUserId();
      console.log(userConneted, 'co');

      const res = await CategorieClass.createCategorie({
        description: category.description,
        image,
        name: category.name,
        vendorId: userConneted ? userConneted : '',
      });

      if (res.success) {
        Alert.alert('✅ Succès', 'Catégorie ajoutée avec succès !', [
          {
            text: 'OK',
            style: 'destructive',
            onPress: () => setStep(1), // action après fermeture de l'alerte
          },
        ]);

        setCategory({ name: '', description: '', image: '' });
      } else {
        Alert.alert('❌ Erreur', res.message);
      }
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible d’ajouter la catégorie.');
    } finally {
      setLoading(false); // ⬅️ désactiver loader
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.addButton}>
          <ArrowLeft color="#fff" size={22} />
          <Text style={styles.addText}>retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📂 Ajouter une Catégorie</Text>
      </View>

      <Spinner
        visible={loading}
        textContent="Chargement..."
        textStyle={styles.spinnerText}
        overlayColor="rgba(0,0,0,0.6)"
      />

      <TextInput
        placeholder="Nom de la catégorie"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={category.name}
        onChangeText={(text) => handleChange('name', text)}
      />

      <TextInput
        placeholder="Description"
        placeholderTextColor="#aaa"
        style={[styles.input, styles.textarea]}
        multiline
        value={category.description}
        onChangeText={(text) => handleChange('description', text)}
      />

      <View style={styles.imageRow}>
        <TouchableOpacity
          style={[styles.imageButton, { backgroundColor: '#080808ff' }]}
          onPress={() => pickImage(false)}
        >
          <ImageIcon color="#fff" size={18} />
          <Text style={styles.imageButtonText}>Depuis galerie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageButton, { backgroundColor: '#ff4081' }]}
          onPress={() => pickImage(true)}
        >
          <Camera color="#fff" size={18} />
          <Text style={styles.imageButtonText}>Prendre photo</Text>
        </TouchableOpacity>
      </View>

      {category.image ? (
        <Image source={{ uri: category.image }} style={styles.preview} />
      ) : null}

      {/* Bouton avec loader */}
      <TouchableOpacity
        style={[styles.submitButton, loading && { backgroundColor: '#ff80ab' }]}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#EC4899' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addText: { color: '#fff', fontWeight: '600', marginLeft: 5 },
  spinnerText: { color: '#fff', fontSize: width * 0.04, fontWeight: '600' },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ff80ab20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  backText: { color: '#ff4081', fontWeight: '600', fontSize: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff80ab',
    color: '#333',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  imageButtonText: { color: '#fff', fontWeight: '600' },
  preview: {
    width: 130,
    height: 130,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff80ab',
  },
  submitButton: {
    backgroundColor: '#ff4081',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});
