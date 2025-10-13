import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Product } from '@/types/product';
import { Live } from '@/types/live';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';
import {
  Video,
  Link2,
  Search,
  CheckSquare,
  Square,
  Package,
  ArrowLeft,
  Sparkles,
  X,
} from 'lucide-react-native';
import { LiveService } from '../api/live';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const productsMock: Product[] = Array.from({ length: 120 }, (_, i) => ({
  id: (i + 1).toString(),
  description: `Produit ${i + 1}`,
  price: (Math.floor(Math.random() * 100) + 1) * 1000,
  category: ['Vêtements', 'Électronique', 'Maison', 'Beauté'][
    Math.floor(Math.random() * 4)
  ],
  stock: Math.floor(Math.random() * 50) + 1,
  title: '',
}));

export default function CreateLive() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productsMock;
    const query = searchQuery.toLowerCase();
    return productsMock.filter(
      (p) =>
        p.description.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handlePasteLink = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        setFacebookLink(clipboardContent);
        Alert.alert('Succès', 'Lien collé depuis le presse-papiers');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de coller le lien');
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
      // } else {
      //   setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleCreateLive = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour le live');
      return;
    }
    if (!facebookLink.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter le lien Facebook Live');
      return;
    }
    if (selectedProducts.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un produit');
      return;
    }

    setIsCreating(true);

    try {
      const { name, photoURL } = await fetchFirebaseUserInfo();
      const userId = await authStorage.getUserId();

      const data: Live = {
        facebookIframeUrl: facebookLink,
        isActive: true,
        profile: photoURL,
        title: title,
        vendorId: userId || '',
        vendorName: name,
        createdAt: new Date(),
      };

      const live = await LiveService.createLive(data);

      if (live.length !== 0) {
        Alert.alert(
          'Succès',
          `Live "${title}" créé avec ${selectedProducts.length} produit(s)`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTitle('');
                setFacebookLink('');
                setSelectedProducts([]);
                setSearchQuery('');
                router.back();
              },
            },
          ],
        );
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le live');
    } finally {
      setIsCreating(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isSelected = selectedProducts.includes(item.id as string);
    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        onPress={() => toggleProduct(item.id as string)}
        activeOpacity={0.7}
      >
        <View style={styles.productCheckbox}>
          {isSelected ? (
            <CheckSquare size={24} color="#4267B2" strokeWidth={2.5} />
          ) : (
            <Square size={24} color="#cbd5e1" strokeWidth={2} />
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>
              {item.price.toLocaleString()} Ar
            </Text>
            {item.price && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.price}</Text>
              </View>
            )}
          </View>
          {item.stock !== undefined && (
            <Text style={styles.stockText}>Stock: {item.stock} unités</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#1a1a1a" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un Live</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Video size={20} color="#4267B2" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Informations du Live</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Titre du Live <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Vente spéciale vêtements d'hiver"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Lien Facebook Live <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="https://www.facebook.com/..."
                placeholderTextColor="#94a3b8"
                value={facebookLink}
                onChangeText={setFacebookLink}
              />
              <TouchableOpacity
                style={styles.pasteButton}
                onPress={handlePasteLink}
              >
                <Link2 size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.pasteButtonText}>Coller</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color="#4267B2" strokeWidth={2} />
            <Text style={styles.sectionTitle}>
              Produits ({selectedProducts.length} sélectionné
              {selectedProducts.length > 1 ? 's' : ''})
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Search
              size={20}
              color="#64748b"
              strokeWidth={2}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un produit..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setShowProducts(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={18} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actionBar}>
            <TouchableOpacity
              onPress={toggleSelectAll}
              style={styles.selectAllButton}
            >
              <Text style={styles.selectAllText}>
                {selectedProducts.length === filteredProducts.length
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.resultCount}>
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id as string}
            renderItem={renderProduct}
            scrollEnabled={false}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Package size={48} color="#cbd5e1" strokeWidth={1.5} />
                <Text style={styles.emptyText}>Aucun produit trouvé</Text>
                <Text style={styles.emptySubtext}>
                  Essayez une autre recherche
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Produits</Text>
            <Text style={styles.summaryValue}>{selectedProducts.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            (!title || !facebookLink || selectedProducts.length === 0) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreateLive}
          disabled={
            isCreating ||
            !title ||
            !facebookLink ||
            selectedProducts.length === 0
          }
          activeOpacity={0.8}
        >
          {isCreating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Sparkles size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.createButtonText}>Publier le Live</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputFlex: {
    flex: 1,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4267B2',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4267B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pasteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectAllText: {
    color: '#4267B2',
    fontWeight: '600',
    fontSize: 14,
  },
  resultCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  productList: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  productCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#4267B2',
  },
  productCheckbox: {
    marginRight: 14,
    marginTop: 2,
  },
  productInfo: {
    flex: 1,
    gap: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 22,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4267B2',
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  stockText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: isWeb ? 20 : 34,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4267B2',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4267B2',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#4267B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
