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
  Platform, // Ajouté pour une meilleure compatibilité des styles
} from 'react-native';
import { Plus, Edit, Trash2, Eye } from 'lucide-react-native';
import { Categorie } from '@/types/categorie';
// Assurez-vous que CategorieClass est correctement défini
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

  // La modal n'est plus nécessaire si on utilise router.push
  // const [modalVisible, setModalVisible] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(null);

  const [numColumns, setNumColumns] = useState(
    width > 768 ? 4 : width > 480 ? 3 : 2,
  ); // 4 colonnes sur très grand écran

  // 🔁 Recalculer le nombre de colonnes à chaque changement d'orientation/taille
  useEffect(() => {
    const updateColumns = ({ window }: { window: { width: number } }) => {
      setNumColumns(window.width > 768 ? 4 : window.width > 480 ? 3 : 2);
    };

    const subscription = Dimensions.addEventListener('change', updateColumns);
    return () => subscription.remove();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // 🟢 Rétablissement de l'appel à l'API réelle
      const data = await CategorieClass.getCategories();
      setCategories(data);
    } catch (error) {
      // Pour une meilleure gestion des erreurs
      console.error('Erreur lors du chargement des catégories:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les catégories depuis le serveur.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => setStep(2);

  const handleEdit = (item: Categorie) => {
    // Si la page d'édition est une autre route Expo, utilisez :
    // router.push({ pathname: '/edit-category', params: { categoryId: item.id } });
    Alert.alert(
      'Modification',
      `Ouvrir la modale/page pour modifier : ${item.name}`,
    );
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
            await CategorieClass.deleteCategorie(id); // Décommentez pour l'API réelle
            setCategories(categories.filter((c) => c.id !== id));
            Alert.alert('Succès', 'Catégorie supprimée.');
          },
        },
      ],
    );
  };

  const handleView = (item: Categorie) => {
    // Naviguer vers la page des produits de cette catégorie
    // On passe le nom/ID en paramètre pour la page de destination
    router.push({
      pathname: '/products',
      params: { categoryId: item.id, categoryName: item.name },
    });
  };

  // Calcul dynamique de la hauteur de l'image pour un ratio cohérent (par exemple 4:3)
  const cardWidth = width / numColumns - (numColumns > 1 ? 10 : 20); // Estimation pour le padding/margin
  const image_height = cardWidth * (3 / 4); // Ratio 4:3 pour l'image (si cardWidth est la largeur, hauteur = 75% de la largeur)

  const renderItem = ({ item }: { item: Categorie }) => (
    <View style={styles.card}>
      {/* Image avec hauteur calculée */}
      <Image
        source={{ uri: item.image }}
        style={[styles.image, { height: image_height }]}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        {/* Nom sur une seule ligne pour rester compact */}
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.date}>{item.createdAt}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleView(item)}
            style={[styles.actionBtn, styles.viewBtn]}
            accessibilityLabel={`Voir les produits de ${item.name}`}
          >
            <Eye size={16} color="#EC4899" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={[styles.actionBtn, styles.editBtn]}
            accessibilityLabel={`Modifier ${item.name}`}
          >
            <Edit size={16} color="#1f2937" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id!)}
            style={[styles.actionBtn, styles.deleteBtn]}
            accessibilityLabel={`Supprimer ${item.name}`}
          >
            <Trash2 size={16} color="#fff" />
          </TouchableOpacity>
        </View>
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
        <Text style={styles.title}>Mes Catégories </Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        key={numColumns} // Force le re-render au changement de colonnes
        data={categories}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aucune catégorie trouvée. Créez-en une !
            </Text>
          </View>
        }
      />
      {/* La Modal de détail a été supprimée car handleView utilise la navigation (router.push) */}
    </View>
  );
};

export default CategoriesListes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Fond plus doux
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937', // Noir plus profond
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingHorizontal: 15, // Plus grand
    paddingVertical: 10, // Plus grand
    borderRadius: 10,
    shadowColor: '#EC4899',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  addText: { color: '#fff', marginLeft: 8, fontWeight: '700' },

  // FlatList & Grid
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  // Card (Améliorations)
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12, // Coins arrondis plus modernes
    margin: 5, // Marge ajustée pour la grille
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  image: {
    width: '100%',
    // La hauteur est calculée dynamiquement dans renderItem
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardBody: {
    padding: 10,
    // Hauteur minimale pour que toutes les cartes aient la même taille de base
    minHeight: 80,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899', // Nom en couleur principale
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#9ca3af', // Gris clair
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto', // Pousse les actions vers le bas
  },

  // Action Buttons (Améliorations)
  actionBtn: {
    flex: 1,
    marginHorizontal: 3,
    padding: 8, // Zone de clic augmentée
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  viewBtn: {
    backgroundColor: '#f8f8f8',
    borderColor: '#EC4899',
  },
  editBtn: {
    backgroundColor: '#f8f8f8',
    borderColor: '#1f2937',
  },
  deleteBtn: {
    backgroundColor: '#ff1744',
    borderColor: '#ff1744',
  },

  // Empty State
  emptyState: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EC4899',
    fontWeight: '600',
  },

  // Modal styles supprimés car la modal est retirée
});
