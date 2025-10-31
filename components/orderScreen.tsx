import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList, // <-- Changé de SectionList à FlatList
  StyleSheet,
  Alert,
  SafeAreaView,
  // Platform, // Non utilisé
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  getAllCarts,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  // clearCartByVendor, // non utilisé
} from '../utils/cartStorage'; // Assurez-vous que ce chemin est correct
import { useRouter } from 'expo-router'; // Assurez-vous que ce package est installé
import { useCart } from './contexts/CartContext'; // Assurez-vous que ce chemin est correct
import { toString } from 'lodash';
import OrderForm from './orderFrom';

// --- Couleurs principales ---
const PRIMARY_COLOR = '#4c51bf';
const ACCENT_COLOR = '#ec4899';
const TEXT_COLOR_PRIMARY = '#1f2937';
const TEXT_COLOR_SECONDARY = '#6b7280';
const BG_COLOR = '#f9fafb';
const CARD_BG = '#ffffff';

// --- Étapes (indicateur de progression) ---
interface StepProps {
  title: string;
  index: number;
  currentStep: number;
}
const Step = ({ title, index, currentStep }: StepProps) => {
  const isActive = currentStep >= index;
  return (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.stepCircle,
          {
            backgroundColor: isActive ? PRIMARY_COLOR : BG_COLOR,
            borderColor: isActive ? PRIMARY_COLOR : TEXT_COLOR_SECONDARY,
          },
        ]}
      >
        {currentStep > index ? (
          <Ionicons name="checkmark" size={18} color={CARD_BG} />
        ) : (
          <Text
            style={[
              styles.stepNumber,
              { color: isActive ? CARD_BG : TEXT_COLOR_SECONDARY },
            ]}
          >
            {toString(index)}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.stepTitle,
          { color: isActive ? PRIMARY_COLOR : TEXT_COLOR_SECONDARY },
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

// --- Bouton Gradient ---
const GradientButton = ({ onPress, title, colors, style, textStyle }: any) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientButtonContent}
    >
      <Text style={[textStyle]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// 🛑 CORRECTION ICI : Le composant doit retourner une structure View/Text
const VendorHeader = ({
  vendorId,
  total,
}: {
  vendorId: string;
  total: number;
}) => <View>{}</View>;

export default function OrderScreen() {
  const [cartData, setCartData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const getVendorTotal = (items: any[]) =>
    items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

  /**
   * Fonction pour transformer la structure SectionList en structure FlatList.
   * Ajoute un objet 'HEADER' avant les articles de chaque fournisseur.
   */
  const flattenCartData = (carts: { [key: string]: any[] }) => {
    const flattened: any[] = [];
    Object.entries(carts).forEach(([vendorId, items]) => {
      if (items && items.length > 0) {
        // 1. Ajouter l'objet HEADER
        flattened.push({
          type: 'HEADER',
          // Utilisation de l'id du fournisseur pour la clé de l'en-tête
          key: `header-${vendorId}`,
          vendorId,
          total: getVendorTotal(items),
        });
        // 2. Ajouter les articles du panier
        items.forEach((item, index) => {
          flattened.push({
            ...item,
            type: 'ITEM',
            vendorId, // Ajouter l'ID du fournisseur à chaque article
            // Utilisation d'une clé unique pour l'élément (FlatList l'exige)
            key: `${vendorId}-${item.id}-${index}`,
          });
        });
      }
    });
    return flattened;
  };

  const loadCart = async () => {
    const allCarts = await getAllCarts();
    const flattened = flattenCartData(allCarts);
    setCartData(flattened);
  };
  const { refreshCart } = useCart(); // Assurez-vous que useCart est correctement importé et configuré

  useEffect(() => {
    loadCart();
  }, []);

  const handleIncrease = async (vendorId: string, productId: string) => {
    await increaseQuantity(vendorId, productId);
    await refreshCart(vendorId);
    loadCart();
  };

  const Remove = async (vendorId: string, productId: string) => {
    await removeFromCart(vendorId, productId);
    await refreshCart(vendorId);
    loadCart();
  };

  const handleDecrease = async (vendorId: string, productId: string) => {
    await decreaseQuantity(vendorId, productId);
    await refreshCart(vendorId);
    loadCart();
  };

  const getTotal = useMemo((): number => {
    return cartData.reduce((sum, item) => {
      if (item.type === 'ITEM') {
        // Sécurité pour s'assurer que item.price et item.quantity sont des nombres
        const price = parseFloat(item.price) || 0;
        const quantity = parseFloat(item.quantity) || 1;
        return sum + price * quantity;
      }
      return sum;
    }, 0);
  }, [cartData]);

  const nextStep = () => {
    if (getTotal === 0 && currentStep === 1) {
      Alert.alert(
        'Panier Vide',
        'Veuillez ajouter des produits à votre panier avant de continuer.',
      );
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else Alert.alert('✅ Paiement', 'Paiement effectué avec succès 🎉');
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.back();
  };

  // --- Rendu carte animée pour l'ITEM ---
  const renderCartItem = (item: any, index: number) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        delay: index * 50,
        damping: 15,
        stiffness: 150,
      }}
      style={styles.cartItemContainer}
    >
      <View style={styles.cardContent}>
        {/* 🖼️ Image du produit */}
        <Image
          source={{
            uri:
              item.image ||
              'https://via.placeholder.com/100x100.png?text=Produit',
          }}
          style={styles.productImage}
        />

        {/* 📄 Détails du produit */}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemPriceDetail}>
            {parseFloat(item.price).toLocaleString()} Ar / pièce
          </Text>

          {/* 🔢 Contrôles de quantité */}
          <View style={styles.qtyControls}>
            <TouchableOpacity
              onPress={() => handleDecrease(item.vendorId, item.id)}
              style={[styles.qtyButton, styles.qtyButtonLeft]}
              disabled={item.quantity <= 1}
            >
              <Ionicons
                name="remove-outline"
                size={18}
                color={TEXT_COLOR_PRIMARY}
              />
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => handleIncrease(item.vendorId, item.id)}
              style={[styles.qtyButton, styles.qtyButtonRight]}
            >
              <Ionicons
                name="add-outline"
                size={18}
                color={TEXT_COLOR_PRIMARY}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 💰 Sous-total et suppression */}
        <View style={styles.itemRight}>
          <Text style={styles.itemSubTotal}>
            {(item.price * item.quantity).toLocaleString()} Ar
          </Text>

          <TouchableOpacity
            onPress={() => Remove(item.vendorId, item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={22} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>
    </MotiView>
  );

  // --- Rendu principal de la FlatList ---
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Le type 'id' est maintenant utilisé pour l'en-tête (voir flattenCartData)
    if (item.type === 'HEADER') {
      return <VendorHeader vendorId={item.vendorId} total={item.total} />;
    }
    return renderCartItem(item, index);
  };

  // --- Rendu des étapes 2, 3 et 4 ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return <OrderForm />;
      case 3:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.stepContentTitle}>📦 Étape 3: Livraison</Text>
            <Text style={styles.stepContent}>
              Entrez votre adresse exacte et choisissez le mode de livraison.
            </Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.stepContentTitle}>💳 Étape 4: Paiement</Text>
            <Text style={styles.stepContent}>
              Vérifiez le récapitulatif et choisissez votre méthode de paiement
              sécurisée.
            </Text>
          </View>
        );
      default:
        return null; // L'étape 1 (Panier) est gérée par la FlatList
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CARD_BG }}>
      <View style={styles.container}>
        {/* Étapes (4 au total) */}
        <View style={styles.steps}>
          <Step title="Panier" index={1} currentStep={currentStep} />
          <View style={styles.stepLine} />
          <Step title="Infos" index={2} currentStep={currentStep} />
          <View style={styles.stepLine} />
          <Step title="Livraison" index={3} currentStep={currentStep} />
          <View style={styles.stepLine} />
          <Step title="Paiement" index={4} currentStep={currentStep} />
        </View>

        {/* Contenu */}
        <View style={styles.contentArea}>
          {currentStep === 1 ? (
            <FlatList // <-- Utilisation de FlatList
              data={cartData}
              // keyExtractor est crucial pour FlatList. Utilise la clé unique définie.
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons
                      name="cart-outline"
                      size={80}
                      color={TEXT_COLOR_SECONDARY}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>Votre panier est vide</Text>
                  <Text style={styles.emptySubtitle}>
                    Ajoutez des produits pour commencer votre commande.
                  </Text>
                </View>
              }
              contentContainerStyle={styles.listContentContainer}
            />
          ) : (
            <View style={styles.stepContentContainer}>
              {renderStepContent()}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à payer :</Text>
            <Text style={styles.totalValue}>
              {getTotal.toLocaleString()} Ar
            </Text>
          </View>
          <View style={styles.navButtons}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                <Ionicons
                  name="chevron-back-outline"
                  size={20}
                  color={TEXT_COLOR_PRIMARY}
                />
                <Text style={styles.backBtnText}>Retour</Text>
              </TouchableOpacity>
            )}
            <GradientButton
              onPress={nextStep}
              // Le titre du bouton change à l'étape 4
              title={currentStep === 4 ? 'Payer la Commande' : 'Continuer'}
              // Désactiver si panier vide à l'étape 1
              disabled={currentStep === 1 && getTotal === 0}
              colors={
                currentStep === 4
                  ? [ACCENT_COLOR, PRIMARY_COLOR]
                  : [PRIMARY_COLOR, ACCENT_COLOR]
              }
              style={[
                styles.nextBtnContainer,
                // Le bouton prend toute la largeur à l'étape 1 s'il n'y a pas de bouton "Retour"
                currentStep === 1 ? { marginLeft: 0 } : { marginLeft: 10 },
              ]}
              textStyle={styles.nextBtnText}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Styles mis à jour ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  contentArea: { flex: 1, paddingHorizontal: 15 },
  listContentContainer: { paddingBottom: 20, paddingTop: 5 }, // Ajout padding pour la première section
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ffecec',
    padding: 6,
    borderRadius: 8,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: CARD_BG,
    marginBottom: 10,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300, // Pour s'assurer qu'il est centré
  },
  emptyIconContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 50,
    padding: 20,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_COLOR_PRIMARY,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_COLOR_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },

  stepContainer: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepNumber: { fontWeight: 'bold', fontSize: 16 },
  stepTitle: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: -10,
  },

  // Style pour l'en-tête du vendeur
  vendorHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 5,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  vendorTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: PRIMARY_COLOR,
    flex: 1,
  },
  vendorTotal: { color: PRIMARY_COLOR, fontWeight: '800', fontSize: 16 },

  // Style pour les articles du panier
  cartItemContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 15,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 1,
  },

  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR_PRIMARY },
  itemPriceDetail: { fontSize: 13, color: TEXT_COLOR_SECONDARY, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', minWidth: 80 }, // Ajout minWidth pour éviter le chevauchement
  itemSubTotal: { fontSize: 15, fontWeight: 'bold', color: PRIMARY_COLOR },

  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  qtyButtonLeft: { marginRight: 6 },
  qtyButtonRight: { marginLeft: 6 },
  qtyValue: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR_PRIMARY },

  stepContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stepCard: {
    backgroundColor: CARD_BG,
    borderRadius: 15,
    padding: 30,
    width: '100%',
    elevation: 5,
  },
  stepContentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
    textAlign: 'center',
  },
  stepContent: {
    textAlign: 'center',
    fontSize: 15,
    color: TEXT_COLOR_SECONDARY,
  },

  footer: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: CARD_BG,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: { fontWeight: '500', fontSize: 16, color: TEXT_COLOR_SECONDARY },
  totalValue: { fontWeight: '800', fontSize: 24, color: PRIMARY_COLOR },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    maxWidth: 120,
  },
  backBtnText: {
    color: TEXT_COLOR_PRIMARY,
    fontWeight: '600',
    fontSize: 16,
  },
  nextBtnContainer: { flex: 2, minWidth: 150, marginLeft: 10 },
  gradientButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%', // Assurer que le LinearGradient prend la taille du TouchableOpacity
  },
  nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
