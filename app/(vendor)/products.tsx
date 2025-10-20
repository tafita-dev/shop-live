import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Plus, Edit, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';

export default function VendorProducts() {
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Chemise Homme',
      price: 45000,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '2',
      name: 'Chaussures Femme',
      price: 80000,
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '3',
      name: 'Montre Luxe',
      price: 120000,
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const handleAdd = () => {
    router.push('/(vendor)/categorie');
  };

  const handleEdit = (item: any) => {
    Alert.alert('Modifier', `Modifier le produit : ${item.name}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          setProducts(products.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} Ar</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconBtn}
          >
            <Edit size={18} color="#EC4899" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.iconBtn}
          >
            <Trash2 size={18} color="#EC4899" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Titre */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Catégories</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EC4899',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  image: {
    width: 90,
    height: 90,
  },
  cardBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    color: '#EC4899',
    fontWeight: '700',
    marginVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  iconBtn: {
    padding: 4,
  },
});
