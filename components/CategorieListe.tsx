import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { Plus, Edit, Trash2, Eye } from 'lucide-react-native';
import { Categorie } from '@/types/categorie';
import { CategorieClass } from '@/users/categorie';
import Spinner from 'react-native-loading-spinner-overlay';

type categorieProsps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};
const { width } = Dimensions.get('window');

const CategoriesListes: React.FC<categorieProsps> = ({ setStep }) => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(
    null,
  );

  // Charger les catégories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await CategorieClass.getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => setStep(2);

  const handleEdit = (item: Categorie) => {
    Alert.alert('Modifier', `Modifier la catégorie : ${item.name}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer cette catégorie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            CategorieClass.deleteCategorie(id).then((res) => {
              if (res.success) {
                setCategories(categories.filter((c) => c.id !== id));
              } else {
                Alert.alert('Erreur', res.message);
              }
            });
          },
        },
      ],
    );
  };

  const handleView = (item: Categorie) => {
    setSelectedCategory(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Categorie }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.date}>{item.createdAt}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={[styles.actionBtn, { backgroundColor: '#0a0a0afb' }]}
          >
            <Edit size={16} color="#fff" />
            <Text style={styles.actionText}>Editer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id!)}
            style={[styles.actionBtn, { backgroundColor: '#ff1744' }]}
          >
            <Trash2 size={16} color="#fff" />
            <Text style={styles.actionText}>Supprimer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleView(item)}
            style={[styles.actionBtn, { backgroundColor: '#EC4899' }]}
          >
            <Eye size={16} color="#fff" />
            <Text style={styles.actionText}>Voir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Catégories</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <Spinner
        visible={loading}
        textContent="Chargement..."
        textStyle={styles.spinnerText}
        overlayColor="rgba(0,0,0,0.6)"
      />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal pour voir la catégorie */}
      {selectedCategory && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <Image
                  source={{ uri: selectedCategory.image }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalName}>{selectedCategory.name}</Text>
                <Text style={styles.modalDescription}>
                  {selectedCategory.description}
                </Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  spinnerText: { color: '#fff', fontSize: width * 0.04, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  image: { width: 90, height: 90 },
  cardBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  date: { fontSize: 12, color: '#999', marginBottom: 6 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: { width: 180, height: 180, borderRadius: 10, marginBottom: 15 },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeText: { color: '#fff', fontWeight: '700' },
});

export default CategoriesListes;
