import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPaymentMethods, PaymentMethod } from '@/users/payment';
import { isNull } from 'lodash';

interface OrderConfirmationProps {
  totalAmount: number;
  selected: string | null;
  setSelected: React.Dispatch<React.SetStateAction<string | null>>;
  showError: boolean;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  totalAmount,
  selected,
  setSelected,
  showError,
}) => {
  const [paymentMethods, setPayement] = useState<PaymentMethod[]>([]);
  const isError = showError && isNull(selected);
  useEffect(() => {
    const loadpaymentmean = async () => {
      const a = await getPaymentMethods();
      console.log(a);
      setPayement(a);
    };
    loadpaymentmean();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Confirmation de commande</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Montant total</Text>
        <Text style={styles.amount}>{totalAmount} Ar</Text>
      </View>

      <Text style={styles.subtitle}>Choisissez un moyen de paiement :</Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodBox,
            selected === method.code && styles.methodSelected,
          ]}
          onPress={() => setSelected(method.code)}
        >
          <Ionicons
            name={method.icon as any}
            size={24}
            color={selected === method.code ? '#fff' : '#333'}
          />
          <Text
            style={[
              styles.methodText,
              selected === method.code && { color: '#fff' },
            ]}
          >
            {method.name}
          </Text>
        </TouchableOpacity>
      ))}
      {isError && (
        <Text style={styles.errorText}>
          Vous devez choisir un moyen de payement
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    color: '#444',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#007bff',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  methodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  methodSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  methodText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  confirmButton: {
    marginTop: 25,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OrderConfirmation;
