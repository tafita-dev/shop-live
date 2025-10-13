// app/(vendor)/orders.tsx
import * as React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

// types/order.ts
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  clientName: string;
  items: OrderItem[];
  status: 'pending' | 'shipped' | 'completed';
  createdAt: string;
}

export default function OrdersScreen() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        // const data = ""
        // setOrders(data);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes :', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Commande #{item.id}</Text>
      <Text>Client: {item.clientName}</Text>
      <Text>Produits: {item.items.map((i) => i.name).join(', ')}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A00F4" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Aucune commande pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#555' },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 6 },
});
