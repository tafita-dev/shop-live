import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  getAllCarts,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from '../utils/cartStorage';
import { useRouter } from 'expo-router';
import { useCart } from './contexts/CartContext';
import { isNull, toString } from 'lodash';
import OrderForm, { FormValues } from './orderFrom';
import { authStorage, fetchFirebaseUserInfo } from '@/utils/authStorage';
import Textarea from './Adresse';
import OrderConfirmation from './OrderConfirmation';
import { createOrder, Order, OrderItem } from '@/users/payment';

// 🎨 Couleurs principales
const PRIMARY_COLOR = '#4c51bf';
const ACCENT_COLOR = '#ec4899';
const TEXT_COLOR_PRIMARY = '#1f2937';
const TEXT_COLOR_SECONDARY = '#6b7280';
const BG_COLOR = '#f9fafb';
const CARD_BG = '#ffffff';

/* ---------------- Étapes d’avancement ---------------- */
const Step = ({ title, index, currentStep }: any) => {
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

/* ---------------- Bouton dégradé ---------------- */
const GradientButton = ({ onPress, title, colors, style, textStyle }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
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

/* ---------------- En-tête du vendeur ---------------- */
const VendorHeader = ({
  vendorId,
  total,
}: {
  vendorId: string;
  total: number;
}) => <View></View>;

export default function OrderScreen() {
  const [cartData, setCartData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedError, setSubmittedError] = useState(false);
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
  });
  const { refreshCart } = useCart();
  const router = useRouter();

  /* ---------------- Validation du formulaire ---------------- */
  const validate = useCallback((): boolean => {
    const e: Partial<FormValues> = {};
    if (!values.name.trim()) e.name = 'Le nom est requis';
    if (!values.email.trim()) e.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Email invalide';
    if (!values.phone.trim()) e.phone = 'Le téléphone est requis';
    else if (!/^[0-9+\s()-]{6,20}$/.test(values.phone))
      e.phone = 'Numéro invalide (Min 6 caractères)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [values]);

  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const uid = (await authStorage.getUserId()) ?? ''; // jamais undefined

      const vendorIds = cartData.map((i) => i.vendorId).filter(Boolean);
      const cart: OrderItem[] = cartData
        .filter((p) => p.type === 'ITEM')
        .map((p) => ({
          image: p.image ?? '',
          price: p.price ?? 0,
          productId: p.id ?? '', // jamais undefined
          quantity: p.quantity ?? 1,
          title: p.title ?? '',
        }));
      console.log(cart, 'cart', cartData);

      if (cart.length === 0) throw new Error('Le panier est vide');
      if (!vendorIds[0]) throw new Error('VendorId manquant');

      const order: Order = {
        createdAt: new Date().toISOString(),
        deliveryAddress: {
          street: message ?? '',
          email: values.email ?? '',
          name: values.name ?? '',
          phone: values.phone ?? '',
        },
        items: cart,
        paymentMethod: selected ?? 'CSH',
        status: 'pending',
        totalPrice: getTotal ?? 0,
        userId: uid,
        vendorId: vendorIds[0],
      };

      const response = await createOrder(order);
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
    }
  };

  /* ---------------- Chargement des infos utilisateur ---------------- */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchFirebaseUserInfo();
        if (data) {
          setValues({
            name: data.name || 'Utilisateur',
            email: data.email || '',
            phone: data.phone || '',
          });
        }
      } catch (error) {
        console.error(
          'Erreur lors du chargement des infos utilisateur:',
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  /* ---------------- Chargement du panier ---------------- */
  const getVendorTotal = (items: any[]) =>
    items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

  const flattenCartData = (carts: { [key: string]: any[] }) => {
    const flattened: any[] = [];
    Object.entries(carts).forEach(([vendorId, items]) => {
      if (items?.length > 0) {
        flattened.push({
          type: 'HEADER',
          key: `header-${vendorId}`,
          vendorId,
          total: getVendorTotal(items),
        });
        items.forEach((item, index) => {
          flattened.push({
            ...item,
            type: 'ITEM',
            vendorId,
            key: `${vendorId}-${item.id}-${index}`,
          });
        });
      }
    });
    return flattened;
  };

  const loadCart = useCallback(async () => {
    const allCarts = await getAllCarts();
    setCartData(flattenCartData(allCarts));
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ---------------- Actions panier ---------------- */
  const handleIncrease = async (vendorId: string, productId: string) => {
    await increaseQuantity(vendorId, productId);
    await refreshCart(vendorId);
    loadCart();
  };

  const handleDecrease = async (vendorId: string, productId: string) => {
    await decreaseQuantity(vendorId, productId);
    await refreshCart(vendorId);
    loadCart();
  };

  const Remove = async (vendorId: string, productId: string) => {
    await removeFromCart(vendorId, productId);
    await refreshCart(vendorId);
    loadCart();
  };

  /* ---------------- Calcul du total global ---------------- */
  const getTotal = useMemo(() => {
    return cartData.reduce((sum, item) => {
      if (item.type === 'ITEM') {
        const price = parseFloat(item.price) || 0;
        const quantity = parseFloat(item.quantity) || 1;
        return sum + price * quantity;
      }
      return sum;
    }, 0);
  }, [cartData]);

  /* ---------------- Navigation entre étapes ---------------- */
  const nextStep = () => {
    if (currentStep === 1 && getTotal === 0) {
      return Alert.alert(
        'Panier Vide',
        'Ajoutez des produits avant de continuer.',
      );
    }
    if (currentStep === 2) {
      Keyboard.dismiss();
      if (!validate()) return;
    }
    if (currentStep === 3) {
      if (message.trim().length === 0) {
        setSubmitted(true);
        return;
      }
    }
    if (currentStep === 4) {
      if (isNull(selected)) {
        setSubmittedError(true);
        return;
      }
    }
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    else router.back();
  };

  /* ---------------- Rendu des éléments ---------------- */
  const renderCartItem = (item: any, index: number) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 50, damping: 15, stiffness: 150 }}
      style={styles.cartItemContainer}
    >
      <View style={styles.cardContent}>
        <Image
          source={{
            uri:
              item.image ||
              'https://via.placeholder.com/100x100.png?text=Produit',
          }}
          style={styles.productImage}
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemPriceDetail}>
            {parseFloat(item.price).toLocaleString()} Ar / pièce
          </Text>

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

  const renderItem = ({ item, index }: { item: any; index: number }) =>
    item.type === 'HEADER' ? (
      <VendorHeader vendorId={item.vendorId} total={item.total} />
    ) : (
      renderCartItem(item, index)
    );

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <OrderForm
            errors={errors}
            setErrors={setErrors}
            setValues={setValues}
            values={values}
          />
        );
      case 3:
        return (
          <View style={styles.stepCard}>
            <Textarea
              label="Votre Adresse de livraison"
              placeholder="Écrivez ici votre adresse de livraison"
              value={message}
              onChangeText={setMessage}
              maxLength={300}
              showError={submitted}
              required
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepCard}>
            <OrderConfirmation
              selected={selected}
              setSelected={setSelected}
              totalAmount={getTotal.toLocaleString()}
              showError={submittedError}
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={{ marginTop: 10 }}>
          Chargement des données utilisateur...
        </Text>
      </SafeAreaView>
    );
  }

  /* ---------------- Rendu principal ---------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CARD_BG }}>
      <View style={styles.container}>
        {/* Étapes */}
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
            <FlatList
              data={cartData}
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="cart-outline"
                    size={80}
                    color={TEXT_COLOR_SECONDARY}
                  />
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
              title={currentStep === 4 ? 'Payer la Commande' : 'Continuer'}
              colors={
                currentStep === 4
                  ? [ACCENT_COLOR, PRIMARY_COLOR]
                  : [PRIMARY_COLOR, ACCENT_COLOR]
              }
              style={[
                styles.nextBtnContainer,
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

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  contentArea: { flex: 1, paddingHorizontal: 15 },
  listContentContainer: { paddingBottom: 20, paddingTop: 5 },
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
  stepTitle: { fontSize: 12, marginTop: 4 },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: -10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_COLOR_PRIMARY },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_COLOR_SECONDARY,
    textAlign: 'center',
    marginTop: 5,
  },
  vendorHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  vendorTitle: { fontWeight: '700', fontSize: 16, color: PRIMARY_COLOR },
  vendorTotal: { color: PRIMARY_COLOR, fontWeight: '800', fontSize: 16 },
  cartItemContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 15,
    marginTop: 8,
    flexDirection: 'row',
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
  itemRight: { alignItems: 'flex-end', minWidth: 80 },
  itemSubTotal: { fontSize: 15, fontWeight: 'bold', color: PRIMARY_COLOR },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ffecec',
    padding: 6,
    borderRadius: 8,
  },
  qtyControls: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
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
  stepCard: {
    backgroundColor: CARD_BG,
    borderRadius: 15,
    padding: 10,
    width: '100%',
    elevation: 5,
  },
  stepContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  navButtons: { flexDirection: 'row', alignItems: 'center' },
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
  backBtnText: { color: TEXT_COLOR_PRIMARY, fontWeight: '600', fontSize: 16 },
  nextBtnContainer: { flex: 2, minWidth: 150, marginLeft: 10 },
  gradientButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
