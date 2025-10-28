import { Categorie } from '@/types/categorie';
import { Live } from '@/types/live';
import { Product } from '@/types/product';
import { CategorieClass } from '@/users/categorie';
import { ProduitClass } from '@/users/product';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Filter,
  Link2,
  Package,
  Search,
  Sparkles,
  Video,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { View } from '@/components/Themed';
import LiveService from '../api/live';
import { Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const isWeb = Platform.OS === 'web';
// --- NOUVELLES Constantes de Couleurs (Clean & Simple) ---
const PRIMARY_COLOR = '#EC4899'; // Bleu standard d'action (iOS/natif)
const ACCENT_COLOR = '#34C759'; // Vert pour succès
const DANGER_COLOR = '#FF3B30'; // Rouge pour les alertes
const TEXT_DARK = '#1C1C1E'; // Noir quasi-total
const TEXT_MUTED = '#8E8E93'; // Gris pour les hints
const BACKGROUND_LIGHT = '#F2F2F7'; // Arrière-plan très léger (gris clair natif)
const CARD_BACKGROUND = '#FFFFFF'; // Fond de carte blanc pur
const BORDER_COLOR = '#D1D1D6'; // Lignes de séparation fines

// --- Définition des Étapes ---
type LiveCreationStep = 1 | 2; // 1: Détails | 2: Produits

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<LiveCreationStep>(1);

  // États pour les données réelles et UI (inchangés)
  const [allCategoriesData, setAllCategoriesData] = useState<Categorie[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('Toutes');
  const [isCreating, setIsCreating] = useState(false);

  // --- LOGIQUE (Raccourcie) ---

  const categoryOptions = useMemo(() => {
    return ['Toutes', ...allCategoriesData.map((c) => c.name)];
  }, [allCategoriesData]);

  const getSelectedCategoryIdByName = (name: string): string => {
    if (name === 'Toutes') return 'Toutes';
    return allCategoriesData.find((c) => c.name === name)?.id || 'Toutes';
  };

  const handleCategoryChange = (categoryName: string) => {
    const categoryId = getSelectedCategoryIdByName(categoryName);
    setSelectedCategoryId(categoryId);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const categories = await CategorieClass.getCategories();
        setAllCategoriesData(categories);
        const products = await ProduitClass.fetchAllProducts();
        setAllProducts(products);
      } catch (error) {
        console.error(
          'Erreur lors du chargement des données Firebase :',
          error,
        );
        Alert.alert(
          'Erreur',
          'Impossible de charger les produits ou catégories.',
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (selectedCategoryId !== 'Toutes') {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.description || '').toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query),
      );
    }
    return result;
  }, [searchQuery, selectedCategoryId, allProducts]);

  const getCategoryNameById = (categoryId: string) => {
    const category = allCategoriesData.find((c) => c.id === categoryId);
    return category ? category.name : 'Inconnue';
  };

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
    const currentlySelectedFilteredIds = selectedProducts.filter((id) =>
      filteredProducts.some((p) => p.id === id),
    ).length;

    if (currentlySelectedFilteredIds === filteredProducts.length) {
      setSelectedProducts((prev) =>
        prev.filter((id) => !filteredProducts.some((p) => p.id === id)),
      );
    } else {
      const newSelectedIds = filteredProducts
        .map((p) => p.id as string)
        .filter((id) => !selectedProducts.includes(id));
      setSelectedProducts((prev) => [...prev, ...newSelectedIds]);
    }
  };

  const validateStep1 = (): boolean => {
    if (!title.trim()) {
      Alert.alert(
        'Titre manquant',
        "Veuillez saisir un titre pour l'événement.",
      );
      return false;
    }
    if (!facebookLink.trim()) {
      Alert.alert('Lien manquant', 'Veuillez coller le lien Facebook Live.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (selectedProducts.length === 0) {
      Alert.alert(
        'Sélection requise',
        'Veuillez sélectionner au moins un produit.',
      );
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as LiveCreationStep);
    } else {
      router.back();
    }
  };

  const handleCreateLive = async () => {
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setIsCreating(true);

    try {
      const { name, photoURL } = await fetchFirebaseUserInfo();
      const userId = await authStorage.getUserId();

      const data: Live & { productIds: string[] } = {
        facebookIframeUrl: facebookLink,
        isActive: true,
        profile: photoURL,
        title: title,
        vendorId: userId || '',
        vendorName: name,
        createdAt: new Date(),
        productIds: selectedProducts,
      };

      const live = await LiveService.createLive(data);

      if (live) {
        Alert.alert(
          'Succès',
          `Live créé avec ${selectedProducts.length} produit(s)`,
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
      }
    } catch (error) {
      console.error('Erreur de création de Live:', error);
      Alert.alert('Erreur', 'Impossible de créer le live');
    } finally {
      setIsCreating(false);
    }
  };

  // --- Composants de Rendu (Simplifiés) ---

  const CategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryBarContent}
    >
      {categoryOptions.map((categoryName) => {
        const currentCategoryId = getSelectedCategoryIdByName(categoryName);
        const isActive = selectedCategoryId === currentCategoryId;

        return (
          <TouchableOpacity
            key={categoryName}
            style={[
              styles.categoryButton,
              isActive
                ? styles.categoryButtonActive
                : styles.categoryButtonInactive,
            ]}
            onPress={() => handleCategoryChange(categoryName)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                isActive
                  ? styles.categoryTextActive
                  : styles.categoryTextInactive,
              ]}
            >
              {categoryName || ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderProduct = ({ item }: { item: Product }) => {
    const isSelected = selectedProducts.includes(item.id as string);
    const categoryName = getCategoryNameById(item.categoryId || '');
    const isOutOfStock = (item.stock || 0) <= 0;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isSelected && styles.productCardSelected,
          isOutOfStock && styles.productCardDisabled,
        ]}
        onPress={() => !isOutOfStock && toggleProduct(item.id as string)}
        disabled={isOutOfStock}
        activeOpacity={0.8}
      >
        <View style={styles.productCheckbox}>
          {isSelected ? (
            <CheckCircle size={26} color={PRIMARY_COLOR} fill={PRIMARY_COLOR} />
          ) : (
            <View style={styles.emptyCheckbox} />
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.title || ''}
          </Text>
          <Text style={styles.productPrice}>
            {item.price
              ? item.price
                  .toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'MGA',
                    minimumFractionDigits: 0,
                  })
                  .replace('MGA', 'Ar')
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.productStatus}>
          <Text style={styles.categoryBadgeText}>{categoryName}</Text>
          <Text style={[styles.stockText, isOutOfStock && styles.stockAlert]}>
            {isOutOfStock ? 'Rupture' : `${item.stock} en stock`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // --- Rendu UI Principal ---

  return (
    <>
      <View style={styles.container}>
        {/* Header (Minimaliste) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevStep} style={styles.backButton}>
            <ArrowLeft size={24} color={PRIMARY_COLOR} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Créer un Live</Text>
            <Text style={styles.stepCounter}>Étape {currentStep} de 2</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 🔴 CONTENU DE L'ÉTAPE 1 */}
          {currentStep === 1 && (
            <View style={styles.stepWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Détails de l'événement</Text>
              </View>

              <View style={styles.cardSection}>
                {/* Titre */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Titre de l'événement</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Vente flash d'automne"
                    placeholderTextColor={TEXT_MUTED}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                {/* Lien Facebook */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Lien Facebook Live</Text>
                  <View style={styles.inputWithButton}>
                    <TextInput
                      style={[styles.input, styles.inputFlex, styles.linkInput]}
                      placeholder="Collez l'URL de votre vidéo ici..."
                      placeholderTextColor={TEXT_MUTED}
                      value={facebookLink}
                      onChangeText={setFacebookLink}
                    />
                    <TouchableOpacity
                      style={styles.pasteButton}
                      onPress={handlePasteLink}
                    >
                      <Link2
                        size={20}
                        color={CARD_BACKGROUND}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.hintText}>
                    URL de la vidéo Facebook (pas de lien de profil).
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 🔴 CONTENU DE L'ÉTAPE 2 */}
          {currentStep === 2 && (
            <View style={styles.stepWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Sélectionnez les produits
                </Text>
              </View>

              {/* Recherche et Filtres Card */}
              <View style={styles.searchFilterCard}>
                {/* Recherche */}
                <View style={styles.searchContainer}>
                  <Search
                    size={20}
                    color={TEXT_MUTED}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par titre ou référence"
                    placeholderTextColor={TEXT_MUTED}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={styles.clearButton}
                    >
                      <X size={18} color={TEXT_MUTED} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filtre Catégorie */}
                <View style={styles.filterHeader}>
                  <Filter size={18} color={TEXT_DARK} />
                  <Text style={styles.filterTitle}>Catégories</Text>
                </View>
                <CategorySelector />
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                  <Text style={styles.loadingText}>
                    Chargement des produits...
                  </Text>
                </View>
              ) : (
                <View style={styles.productListContainer}>
                  <View style={styles.resultBar}>
                    <Text style={styles.resultCount}>
                      {filteredProducts.length} produit
                      {filteredProducts.length > 1 ? 's' : ''} trouvé
                      {filteredProducts.length > 1 ? 's' : ''}
                    </Text>
                    <TouchableOpacity
                      onPress={toggleSelectAll}
                      style={styles.selectAllButton}
                    >
                      <Text style={styles.selectAllText}>
                        {selectedProducts.filter((id) =>
                          filteredProducts.some((p) => p.id === id),
                        ).length === filteredProducts.length
                          ? 'Désélectionner tout'
                          : 'Sélectionner tout'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Liste des Produits */}
                  <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id as string}
                    renderItem={renderProduct}
                    scrollEnabled={false}
                    contentContainerStyle={styles.productList}
                    ListEmptyComponent={
                      <View style={styles.emptyState}>
                        <Package
                          size={48}
                          color={BORDER_COLOR}
                          strokeWidth={1.5}
                        />
                        <Text style={styles.emptyText}>
                          Aucun produit trouvé
                        </Text>
                      </View>
                    }
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer (Bouton d'Action Focalise) */}
        <View style={styles.footer}>
          {currentStep === 2 && (
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Produits sélectionnés :</Text>
              <Text style={styles.summaryValue}>{selectedProducts.length}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              currentStep === 1 &&
                (!title.trim() || !facebookLink.trim()) &&
                styles.buttonDisabled,
              currentStep === 2 &&
                (selectedProducts.length === 0 || isCreating) &&
                styles.buttonDisabled,
            ]}
            onPress={currentStep === 1 ? handleNextStep : handleCreateLive}
            disabled={
              (currentStep === 1 && (!title.trim() || !facebookLink.trim())) ||
              (currentStep === 2 &&
                (selectedProducts.length === 0 || isCreating))
            }
            activeOpacity={0.8}
          >
            {isCreating ? (
              <ActivityIndicator color={CARD_BACKGROUND} size="small" />
            ) : (
              <>
                {currentStep === 2 && (
                  <Sparkles size={20} color={CARD_BACKGROUND} />
                )}
                <Text style={styles.actionButtonText}>
                  {currentStep === 1 ? 'SUIVANT' : 'LANCER LE LIVE'}
                </Text>
                {currentStep === 1 && (
                  <ArrowRight size={20} color={CARD_BACKGROUND} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

// --- Styles Simplifiés pour l'Ergonomie et la Fluidité ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  // 🟢 Header (Plus plat et léger)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    paddingBottom: 15,
    backgroundColor: CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backButton: {
    padding: 5,
    // Style natif pour un retour
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginTop: 2,
  },
  headerSpacer: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'web' ? 100 : 130, // Espace pour le footer
    paddingHorizontal: 15, // Marge latérale globale
  },
  stepWrapper: {
    paddingVertical: 15,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  // 🟢 Card Section pour les inputs (Effet de carte natif)
  cardSection: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: TEXT_DARK,
    backgroundColor: BACKGROUND_LIGHT, // L'input est légèrement grisé
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  inputFlex: {
    flex: 1,
  },
  linkInput: {
    backgroundColor: BACKGROUND_LIGHT,
  },
  pasteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  hintText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 5,
    paddingLeft: 4,
  },
  // 🟢 Recherche et Filtres (Card dédiée)
  searchFilterCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
    color: TEXT_MUTED,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT_DARK,
  },
  clearButton: {
    padding: 5,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  categoryBarContent: {
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  categoryButtonInactive: {
    backgroundColor: BACKGROUND_LIGHT,
    borderColor: BORDER_COLOR,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: CARD_BACKGROUND,
  },
  categoryTextInactive: {
    color: TEXT_DARK,
  },
  // 🟢 Liste des Produits
  productListContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  resultBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultCount: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  selectAllButton: {
    paddingVertical: 4,
  },
  selectAllText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
  productList: {
    gap: 1, // Espacement minimum entre les éléments pour simuler une liste unifiée
  },
  // 🟢 Cartes de Produit (Lignes de liste légères)
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  productCardSelected: {
    backgroundColor: '#EBF5FF', // Très léger fond bleu pour la sélection
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  productCheckbox: {
    marginRight: 15,
  },
  emptyCheckbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    backgroundColor: CARD_BACKGROUND,
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: ACCENT_COLOR,
  },
  productStatus: {
    alignItems: 'flex-end',
    minWidth: 90,
    gap: 2,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  stockText: {
    fontSize: 13,
    color: ACCENT_COLOR,
    fontWeight: '500',
  },
  stockAlert: {
    color: DANGER_COLOR,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginTop: 10,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  // 🟢 Footer (Fixe, action principale)
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: isWeb ? 15 : 30, // Gestion de l'espace de bas de page (safe area)
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 15,
    borderRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: BORDER_COLOR,
  },
  actionButtonText: {
    color: CARD_BACKGROUND,
    fontWeight: '700',
    fontSize: 17,
  },
});
