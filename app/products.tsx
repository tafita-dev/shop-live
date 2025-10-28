import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  useWindowDimensions,
  ScrollView,
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

  const MAX_COLUMNS = 4;
  const MIN_COLUMNS = 2;
  const CARD_MARGIN = 10;
  const numColumns = width > 768 ? MAX_COLUMNS : width > 480 ? 3 : MIN_COLUMNS;
  const cardWidth = (width - CARD_MARGIN * (numColumns + 1)) / numColumns;
  const responsiveCardFontSize = (factor: number) => cardWidth * factor;

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

  // 🟢 Chargement des produits
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProduitClass.getProduits(categoryId);
      setProducts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les produits depuis le serveur.',
      );
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
      `Ouvrir la modale pour modifier: ${item.description}`,
    );
  };

  // 🟢 Suppression du produit
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await ProduitClass.deleteProduit(id);
      if (res.success) {
        setProducts((p) => p?.filter((x) => x.id !== id));
        Alert.alert('Succès', 'Produit supprimé avec succès.');
      } else {
        Alert.alert('Erreur', res.message || 'La suppression a échoué.');
      }
    } catch (error) {
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

  const IMAGE_RATIO = 0.5;

  return (
    <Provider>
      <Spinner
        visible={loading}
        textContent={'Chargement des produits...'}
        textStyle={{ color: '#fff' }}
        overlayColor="rgba(0, 0, 0, 0.7)"
      />

      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff" />
        <Appbar.Content
          title={`Mes Produits ${categoryName}`}
          titleStyle={styles.appBarTitle}
        />

        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={styles.appBarPlusIcon}
          accessibilityLabel="Ajouter un nouveau produit"
          disabled={loading}
        >
          <Plus size={20} color="#EC4899" />
        </TouchableOpacity>
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={[
          styles.scrollViewContent,
          { padding: CARD_MARGIN, paddingBottom: 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!loading && products && (
          <View style={[styles.grid, { marginHorizontal: -CARD_MARGIN }]}>
            {products.map((item) => {
              const isOutOfStock = item.stock === 0;
              return (
                <Card
                  key={item.id || item.code || Math.random().toString()}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      margin: CARD_MARGIN / 2,
                      marginBottom: CARD_MARGIN,
                      opacity: isOutOfStock ? 0.7 : 1,
                    },
                  ]}
                  mode="elevated"
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: item.image || 'https://via.placeholder.com/150',
                      }}
                      style={[
                        styles.image,
                        { height: cardWidth * IMAGE_RATIO },
                      ]}
                      resizeMode="cover"
                    />
                    {isOutOfStock && (
                      <View style={styles.stockOverlay}>
                        <Text style={styles.stockText}>ÉPUISÉ</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.body}>
                    <Text
                      style={[
                        styles.code,
                        { fontSize: responsiveCardFontSize(0.055) },
                      ]}
                    >
                      {item.code || 'N/A'}
                    </Text>
                    <Text
                      style={[
                        styles.name,
                        { fontSize: responsiveCardFontSize(0.055) },
                      ]}
                      numberOfLines={2}
                    >
                      {item.title || 'Produit sans titre'}
                    </Text>
                    <Text
                      style={[
                        styles.price,
                        { fontSize: responsiveCardFontSize(0.055) },
                      ]}
                    >
                      {item.price
                        .toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'MGA',
                          minimumFractionDigits: 0,
                        })
                        .replace('MGA', 'Ar')}
                    </Text>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        style={[styles.icon, { backgroundColor: '#10B981' }]}
                        accessibilityLabel="Modifier le produit"
                      >
                        <Edit
                          size={responsiveCardFontSize(0.065)}
                          color="#fff"
                        />
                      </TouchableOpacity>
                      <View style={{ width: CARD_MARGIN }} />
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedProductId((item.id as string) || '');
                          setShowModalDelete(true);
                        }}
                        style={[styles.icon, { backgroundColor: '#ff1744' }]}
                        accessibilityLabel="Supprimer le produit"
                      >
                        <Trash2
                          size={responsiveCardFontSize(0.065)}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {!loading && products && products.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Votre catalogue est vide. Cliquez sur le '+' pour ajouter votre
              premier produit !
            </Text>
          </View>
        )}
      </ScrollView>

      <Portal>
        <ReusableModal
          showModal={showModalDelete}
          title="Supprimer le Produit"
          message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
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
            <Text style={styles.modalTitle}>Ajouter un Nouveau Produit</Text>
            <TouchableOpacity
              onPress={() => handleModalClose(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            <CreateProduct handleModalClose={handleCreateSuccess} />
          </ScrollView>
        </Modal>
      </Portal>

      {/* 🟢 Confirmation suppression */}
    </Provider>
  );
}

// Styles inchangés
const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#EC4899',
    elevation: 6,
    shadowColor: '#000',
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  appBarPlusIcon: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginRight: 6,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
  },
  imageContainer: { position: 'relative' },
  image: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  stockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  stockText: { color: '#fff', fontWeight: '900', fontSize: 8 },
  body: { alignItems: 'center', padding: 4, minHeight: 60 },
  code: { color: '#9ca3af', fontWeight: '700' },
  name: {
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    minHeight: 25,
  },
  price: { fontWeight: '900', color: '#EC4899', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'space-between',
  },
  icon: {
    padding: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  modalContainer: {
    margin: 0,
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#EC4899',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  modalCloseButton: {
    backgroundColor: '#ff1744',
    borderRadius: 50,
    padding: 4,
    marginLeft: 10,
  },
  modalScrollView: { flexGrow: 1, backgroundColor: '#f8f8f8' },
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
