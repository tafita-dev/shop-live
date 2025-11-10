import { Categorie } from '@/types/categorie';
import { Product } from '@/types/product';
import { CategorieClass } from '@/users/categorie';
import { ProduitClass } from '@/users/product';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { Eye, ShoppingCart } from 'lucide-react-native';
import { addToCart } from '@/utils/cartStorage';
import { useCart } from './contexts/CartContext';

type interfaceProps = {
  vendorId: string;
};

export const ProductGroupList: React.FC<interfaceProps> = ({ vendorId }) => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { refreshCart } = useCart();

  const fetchCategories = async () => {
    const res = await CategorieClass.getCategoriesByvendor(vendorId);
    setCategories(res);
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    const res = await ProduitClass.getProduitsByvendorId(vendorId);
    setProducts(res);
    setLoading(false);
    setSelectedCat('all');
  };

  const fetchProductsByCategory = async (catId: string) => {
    setLoading(true);
    const res = await ProduitClass.getProduitsByvendorandcategorie(
      catId,
      vendorId,
    );
    setProducts(res);
    setLoading(false);
    setSelectedCat(catId);
  };

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  const renderCategory = (cat?: Categorie) => {
    const isSelected = selectedCat === (cat?.id ?? 'all');
    return (
      <TouchableOpacity
        key={cat?.id ?? 'all'}
        style={styles.categoryCard}
        activeOpacity={0.7}
        onPress={() =>
          cat ? fetchProductsByCategory(cat.id ?? '') : fetchAllProducts()
        }
      >
        <View
          style={[
            styles.categoryImageWrapper,
            isSelected && styles.selectedImageWrapper,
          ]}
        >
          <Image
            source={{
              uri:
                cat?.image ??
                'https://res.cloudinary.com/dfywekuna/image/upload/v1761829682/bq4q3bfkaomjft08oyit.jpg',
            }}
            style={styles.categoryImage}
          />
        </View>
        <Text style={[styles.categoryName, isSelected && styles.selectedText]}>
          {cat?.name ?? 'Tous'}
        </Text>
      </TouchableOpacity>
    );
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(vendorId, product);
    await refreshCart(vendorId);
    Alert.alert('Info', `Produit ${product.title} ajouté au panier`);
  };

  const renderProduct = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.productCode}>Code: {product.code ?? 'N/A'}</Text>

        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{product.price} Ar</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => openModal(product)}
            >
              <Eye color="#64748b" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => handleAddToCart(product)}
            >
              <ShoppingCart size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {renderCategory()}
        {categories.map((cat) => renderCategory(cat))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Produits</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun produit disponible</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        >
          {products.map((product) => renderProduct(product))}
        </ScrollView>
      )}

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.6}
      >
        <View style={styles.modalContent}>
          {selectedProduct && (
            <>
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                />
              </View>

              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                <Text style={styles.modalCode}>
                  Code: {selectedProduct.code}
                </Text>
                <Text style={styles.modalPrice}>
                  {selectedProduct.price} Ar
                </Text>

                {selectedProduct.description && (
                  <Text style={styles.modalDescription}>
                    {selectedProduct.description}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeText}>Fermer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  categoryContainer: {
    paddingHorizontal: 12,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    padding: 3,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedImageWrapper: {
    borderColor: '#EC4899',
    borderWidth: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    maxWidth: 80,
  },
  selectedText: {
    color: '#EC4899',
    fontWeight: '700',
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#f1f5f9',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 9,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
    lineHeight: 18,
  },
  productCode: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4899',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '100%',
  },
  modalImageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#f1f5f9',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalCode: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  modalPrice: {
    fontSize: 24,
    color: '#EC4899',
    fontWeight: '700',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
