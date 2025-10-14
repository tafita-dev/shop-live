import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Search, ShoppingCart, Menu, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 25;

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

export default function ProductList() {
  const allProducts: Product[] = Array.from({ length: 40 }).map((_, i) => ({
    id: `${i + 1}`,
    title: `Produit ${i + 1}`,
    price: 100000 + i * 5000,
    image: `https://fastly.picsum.photos/id/${
      i + 10
    }/300/200.jpg?hmac=qsii1Hrz_II3sDiVUrQsuEr4v4SwgT6YGZc5uuNn7tQ`,
  }));

  const [products, setProducts] = useState(allProducts.slice(0, 8));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setProducts(allProducts.slice(0, page * 8));
    } else {
      const filtered = allProducts.filter((p) =>
        p.title.toLowerCase().includes(text.toLowerCase()),
      );
      setProducts(filtered);
    }
  };

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const nextProducts = allProducts.slice(0, nextPage * 8);
      setProducts(nextProducts);
      setPage(nextPage);
      setLoading(false);
    }, 800);
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => openModal(item)}
      >
        <Menu size={18} color="#EC4899" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString()} Ar</Text>

        <TouchableOpacity style={styles.cartButton}>
          <ShoppingCart size={16} color="#FFF" />
          <Text style={styles.cartText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#EC4899" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Rechercher un produit..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Liste des produits */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="small"
              color="#EC4899"
              style={{ margin: 15 }}
            />
          ) : null
        }
      />

      {/* Bouton panier flottant */}

      {/* Modal de détails produit */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={20} color="#EC4899" />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                <Text style={styles.modalPrice}>
                  {selectedProduct.price.toLocaleString()} Ar
                </Text>

                <Text style={styles.modalDescription}>
                  Ce produit est un excellent choix ! Fabriqué avec soin et
                  conçu pour durer, il offre un bon rapport qualité-prix. Idéal
                  pour un usage quotidien ou comme cadeau 🎁.
                </Text>

                <TouchableOpacity style={styles.modalCartButton}>
                  <ShoppingCart size={18} color="#FFF" />
                  <Text style={styles.modalCartText}>Ajouter au panier</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EC4899',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingBottom: 80,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  infoContainer: {
    padding: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EC4899',
    marginTop: 3,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  cartText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
    padding: 10,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 10,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899',
    textAlign: 'center',
    marginVertical: 6,
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
  modalCartButton: {
    backgroundColor: '#EC4899',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginVertical: 12,
  },
  modalCartText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },
});
