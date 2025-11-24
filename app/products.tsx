import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { Card, Appbar, Modal, Portal, Provider } from 'react-native-paper';
import { Edit, Trash2, Plus, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Spinner from 'react-native-loading-spinner-overlay';
import { CreateProduct } from '@/components/CreateProduct';
import { Product } from '@/types/product';
import { ProduitClass } from '@/users/product';
import ReusableModal from '@/components/confirmation';

export default function VendorProducts() {
  const { width, height } = useWindowDimensions();
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [products, setProducts] = useState<Product[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();
  const categoryId = params.categoryId ?? 'Aucun lien';
  const categoryName = params.categoryName ?? 'Aucun lien';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProduitClass.getProduits(categoryId);
      setProducts(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de charger les produits.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (item: Product) => {
    Alert.alert(
      'Modification',
      `Ouvrir la modale pour modifier: ${item.title}`,
    );
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await ProduitClass.deleteProduit(id);
      if (res.success) setProducts((p) => p?.filter((x) => x.id !== id));
      else Alert.alert('Erreur', res.message || 'La suppression a échoué.');
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
      setShowModalDelete(false);
      setSelectedProductId(null);
    }
  };

  const handleModalClose = (shouldRefresh = false) => {
    setShowModal(false);
    if (shouldRefresh) fetchProducts();
  };
  const handleCreateSuccess = () => handleModalClose(true);

  const renderItem = ({ item }: { item: Product }) => {
    const isOutOfStock = item.stock === 0;
    return (
      <Card
        style={[styles.card, { opacity: isOutOfStock ? 0.6 : 1 }]}
        mode="elevated"
      >
        <View style={styles.musicRow}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/60' }}
            style={styles.musicImage}
          />
          <View style={styles.musicInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.code}>{item.code || 'Artiste inconnu'}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={[styles.icon, { backgroundColor: '#10B981' }]}
            >
              <Edit size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedProductId(item.id as string);
                setShowModalDelete(true);
              }}
              style={[
                styles.icon,
                { backgroundColor: '#ff1744', marginLeft: 5 },
              ]}
            >
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <>
      <Spinner
        visible={loading}
        textContent="Chargement des produits..."
        textStyle={{ color: '#fff' }}
        overlayColor="rgba(0,0,0,0.7)"
      />

      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff" />
        <Appbar.Content
          title={`Mes  ${categoryName}`}
          titleStyle={styles.appBarTitle}
        />
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={styles.appBarPlusIcon}
          disabled={loading}
        >
          <Plus size={20} color="#EC4899" />
        </TouchableOpacity>
      </Appbar.Header>

      {products && products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id as string}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
        />
      ) : (
        !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Votre catalogue est vide. Cliquez sur le '+' pour ajouter votre
              première musique !
            </Text>
          </View>
        )
      )}

      <Portal>
        <ReusableModal
          showModal={showModalDelete}
          title="Supprimer la musique"
          message="Êtes-vous sûr de vouloir supprimer cette musique ?"
          onClose={() => setShowModalDelete(false)}
          onConfirm={() => selectedProductId && handleDelete(selectedProductId)}
          confirmColor="#EC4899"
          cancelColor="#777"
          confirmText="Oui"
          cancelText="Non"
        />
        <Modal
          visible={showModal}
          onDismiss={() => handleModalClose(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { width: width * 0.9, maxHeight: height * 0.95 },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter une Nouvelle Musique</Text>
            <TouchableOpacity
              onPress={() => handleModalClose(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <CreateProduct handleModalClose={handleCreateSuccess} />
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  appBar: { backgroundColor: '#EC4899', elevation: 6, shadowColor: '#000' },
  appBarTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  appBarPlusIcon: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 6,
    marginRight: 6,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 5,
    backgroundColor: '#fff',
    padding: 10,
  },
  musicRow: { flexDirection: 'row', alignItems: 'center' },
  musicImage: { width: 60, height: 60, borderRadius: 6 },
  musicInfo: { flex: 1, marginLeft: 10 },
  name: { fontWeight: '700', color: '#1f2937', fontSize: 16 },
  code: { color: '#9ca3af', fontSize: 12 },
  actions: { flexDirection: 'row' },
  icon: { padding: 6, borderRadius: 6 },
  modalContainer: {
    margin: 0,
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#EC4899',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  modalCloseButton: {
    backgroundColor: '#ff1744',
    borderRadius: 50,
    padding: 4,
  },
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
});
