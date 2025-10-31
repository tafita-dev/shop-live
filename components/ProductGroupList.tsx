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
import { FontAwesome } from '@expo/vector-icons';
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
        style={[styles.categoryCard, isSelected && styles.selectedCard]}
        activeOpacity={0.8}
        onPress={() =>
          cat ? fetchProductsByCategory(cat.id ?? '') : fetchAllProducts()
        }
      >
        <Image
          source={{
            uri:
              cat?.image ??
              'https://res.cloudinary.com/dfywekuna/image/upload/v1761829682/bq4q3bfkaomjft08oyit.jpg',
          }}
          style={styles.categoryImage}
        />
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
    Alert.alert('Info', `Produit ${product.title} ajouté au panier 🛒`);
  };

  const renderProduct = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <Text style={styles.productTitle} numberOfLines={1}>
        {product.title}
      </Text>
      <Text style={styles.productCode}>Code : {product.code ?? 'N/A'}</Text>
      <Text style={styles.productPrice}>{product.price} Ar</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => openModal(product)}
        >
          <Eye color="#fff" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => handleAddToCart(product)}
        >
          <ShoppingCart size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🛍️ Catégories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {renderCategory()}
        {categories.map((cat) => renderCategory(cat))}
      </ScrollView>

      <Text style={styles.sectionTitle}>📦 Produits</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 30 }}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        >
          {products.map((product) => renderProduct(product))}
        </ScrollView>
      )}

      {/* Modal produit */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View style={styles.modalContent}>
          {selectedProduct && (
            <>
              <Image
                source={{ uri: selectedProduct.image }}
                style={styles.modalImage}
              />
              <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
              <Text style={styles.modalCode}>
                Code : {selectedProduct.code}
              </Text>
              <Text style={styles.modalPrice}>{selectedProduct.price} Ar</Text>
              <Text style={styles.modalDescription}>
                {selectedProduct.description ??
                  'Aucune description disponible.'}
              </Text>

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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 8,
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryCard: {
    width: 90,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 100,
  },
  selectedCard: {
    borderWidth: 1.5,
    borderColor: '#EC4899',
  },
  categoryImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 5 },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#333' },
  selectedText: { color: '#EC4899' },

  productList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexDirection: 'row',
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: { width: '100%', height: 90, borderRadius: 8 }, // 🔹 image plus petite
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
  },
  productCode: { fontSize: 12, color: '#666', marginTop: 3 },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4899',
    marginTop: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailButton: {
    backgroundColor: '#010911ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  detailText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cartButton: { backgroundColor: '#EC4899', padding: 6, borderRadius: 6 },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  modalCode: { fontSize: 14, color: '#666', marginBottom: 4 },
  modalPrice: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 10,
    borderRadius: 10,
    width: '60%',
  },
  closeText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
