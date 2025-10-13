import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const stats = [
    {
      id: 1,
      title: 'Produits',
      value: 48,
      icon: <Package size={28} color="#EC4899" />,
    },
    {
      id: 2,
      title: 'Commandes',
      value: 125,
      icon: <ShoppingBag size={28} color="#EC4899" />,
    },
    {
      id: 3,
      title: 'Clients',
      value: 89,
      icon: <Users size={28} color="#EC4899" />,
    },
    {
      id: 4,
      title: 'Revenus',
      value: '3,200,000 Ar',
      icon: <DollarSign size={28} color="#EC4899" />,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bienvenue 👋</Text>
      <Text style={styles.subtitle}>
        Voici un aperçu de vos activités du jour
      </Text>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        {stats.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.8}
          >
            <View style={styles.icon}>{item.icon}</View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton d’action */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(vendor)/live')}
        activeOpacity={0.8}
      >
        <Plus size={22} color="#fff" />
        <Text style={styles.addText}>Creer une live</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 40,
    elevation: 3,
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 15,
  },
});
