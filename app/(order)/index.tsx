import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  getAllCarts,
  increaseQuantity,
  decreaseQuantity,
} from '../../utils/cartStorage';
import { Ionicons } from '@expo/vector-icons';

interface StepProps {
  title: string;
  index: number;
  currentStep: number;
}

const Step = ({ title, index, currentStep }: StepProps) => (
  <View style={styles.stepContainer}>
    <View
      style={[
        styles.stepCircle,
        currentStep >= index ? styles.stepActive : styles.stepInactive,
      ]}
    >
      <Text style={styles.stepNumber}>{index}</Text>
    </View>
    <Text
      style={[
        styles.stepTitle,
        currentStep >= index
          ? styles.stepTitleActive
          : styles.stepTitleInactive,
      ]}
    >
      {title}
    </Text>
  </View>
);

export default function OrderScreen() {
  const [cartData, setCartData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(1);

  const loadCart = async () => {
    const all = await getAllCarts();
    setCartData(all);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleIncrease = async (vendorId: string, productId: string) => {
    await increaseQuantity(vendorId, productId);
    loadCart();
  };

  const handleDecrease = async (vendorId: string, productId: string) => {
    await decreaseQuantity(vendorId, productId);
    loadCart();
  };

  const getVendorTotal = (items: any[]) =>
    items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

  const getTotal = () => {
    return Object.values(cartData).reduce((sum, vendorCart: any) => {
      return sum + getVendorTotal(vendorCart);
    }, 0);
  };

  const renderCart = () => {
    return Object.keys(cartData).length === 0 ? (
      <Text style={styles.emptyText}>Votre panier est vide</Text>
    ) : (
      Object.entries(cartData).map(([vendorId, items]: [string, any]) => (
        <View key={vendorId} style={styles.vendorSection}>
          <Text style={styles.vendorTitle}>🛍️ Magasin : {vendorId}</Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  {item.price} Ar × {item.quantity}
                </Text>

                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    onPress={() => handleDecrease(vendorId, item.id)}
                    style={styles.qtyButton}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>

                  <Text style={styles.qtyValue}>{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() => handleIncrease(vendorId, item.id)}
                    style={styles.qtyButton}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <Text style={styles.vendorTotal}>
            Total : {getVendorTotal(items)} Ar
          </Text>
        </View>
      ))
    );
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else Alert.alert('Paiement', 'Paiement en cours...');
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <View style={styles.container}>
      {/* Étapes */}
      <View style={styles.steps}>
        <Step title="Panier" index={1} currentStep={currentStep} />
        <Step title="Livraison" index={2} currentStep={currentStep} />
        <Step title="Paiement" index={3} currentStep={currentStep} />
      </View>

      {/* Contenu selon étape */}
      <View style={styles.content}>
        {currentStep === 1 && renderCart()}
        {currentStep === 2 && (
          <Text style={styles.stepContent}>
            📦 Sélectionnez votre adresse de livraison
          </Text>
        )}
        {currentStep === 3 && (
          <Text style={styles.stepContent}>
            💳 Choisissez un mode de paiement
          </Text>
        )}
      </View>

      {/* Total & Navigation */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total : Ar</Text>
        <View style={styles.navButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
              <Text style={styles.btnText}>← Retour</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
            <Text style={styles.btnText}>
              {currentStep === 3 ? 'Payer' : 'Suivant →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  stepContainer: { alignItems: 'center' },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: { backgroundColor: '#007AFF' },
  stepInactive: { backgroundColor: '#ddd' },
  stepNumber: { color: 'white', fontWeight: 'bold' },
  stepTitle: { fontSize: 12, marginTop: 4 },
  stepTitleActive: { color: '#007AFF', fontWeight: 'bold' },
  stepTitleInactive: { color: '#aaa' },
  vendorSection: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
  },
  vendorTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemName: { fontSize: 15, flex: 1 },
  itemPrice: { fontSize: 14, color: '#555', width: 100, textAlign: 'right' },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    backgroundColor: '#007AFF',
    padding: 4,
    borderRadius: 5,
  },
  qtyValue: { marginHorizontal: 8, fontSize: 16, fontWeight: 'bold' },
  vendorTotal: {
    textAlign: 'right',
    marginTop: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  totalText: { fontWeight: 'bold', fontSize: 18 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  footer: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  backBtn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  nextBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  stepContent: { textAlign: 'center', marginTop: 30, fontSize: 16 },
  content: { flex: 1 },
});
