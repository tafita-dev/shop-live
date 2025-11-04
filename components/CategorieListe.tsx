import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Plus, Edit, Trash2, Eye } from 'lucide-react-native';
import { Categorie } from '@/types/categorie';
import { CategorieClass } from '@/users/categorie';
import Spinner from 'react-native-loading-spinner-overlay';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

type categorieProsps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

const CategoriesListes: React.FC<categorieProsps> = ({ setStep }) => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);

  const [numColumns, setNumColumns] = useState(3); // 🟢 Toujours 3 colonnes

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await CategorieClass.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      Alert.alert('Erreur', 'Impossible de charger les catégories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => setStep(2);

  const handleEdit = (item: Categorie) => {
    Alert.alert('Modification', `Modifier : ${item.name}`);
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
          onPress: async () => {
            await CategorieClass.deleteCategorie(id);
            setCategories(categories.filter((c) => c.id !== id));
            Alert.alert('Succès', 'Catégorie supprimée.');
          },
        },
      ],
    );
  };

  const handleView = (item: Categorie) => {
    router.push({
      pathname: '/products',
      params: { categoryId: item.id, categoryName: item.name },
    });
  };

  const cardWidth = width / 3 - 18; // 🟡 Ajusté pour 3 colonnes
  const imageHeight = cardWidth * 0.5;

  const renderItem = ({ item }: { item: Categorie }) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.folderTop} />
      <View style={styles.folderBody}>
        <Image
          source={{ uri: item.image }}
          style={[styles.image, { height: imageHeight }]}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleView(item)}
          style={[styles.actionBtn, styles.viewBtn]}
        >
          <Eye size={13} color="#EC4899" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={[styles.actionBtn, styles.editBtn]}
        >
          <Edit size={13} color="#1f2937" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.id!)}
          style={[styles.actionBtn, styles.deleteBtn]}
        >
          <Trash2 size={13} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Spinner
        visible={loading}
        textContent="Chargement..."
        textStyle={{ color: '#fff' }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Mes Catégories</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aucune catégorie trouvée. Créez-en une !
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default CategoriesListes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1f2937',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addText: { color: '#fff', marginLeft: 6, fontWeight: '700', fontSize: 13 },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  // 🟡 Dossier style compact
  card: {
    backgroundColor: '#FBC02D',
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    paddingBottom: 6,
  },
  folderTop: {
    height: 8,
    width: '45%',
    backgroundColor: '#FDD835',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  folderBody: {
    width: '100%',
    backgroundColor: '#FFE082',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '88%',
    borderRadius: 5,
    marginVertical: 5,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 2,
    padding: 5,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  viewBtn: {
    backgroundColor: '#fff',
    borderColor: '#EC4899',
  },
  editBtn: {
    backgroundColor: '#fff',
    borderColor: '#1f2937',
  },
  deleteBtn: {
    backgroundColor: '#ff1744',
    borderColor: '#ff1744',
  },
  emptyState: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#EC4899',
    fontWeight: '600',
  },
});
