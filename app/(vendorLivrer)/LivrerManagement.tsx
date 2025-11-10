import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import ProtectUserRole from '@/components/ProtectUserRole';

type Livreur = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function LivreurManager() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([
    {
      id: '1',
      name: 'Rakoto',
      email: 'rakoto@mail.com',
      phone: '+261330000001',
    },
    {
      id: '2',
      name: 'Ranaivo',
      email: 'ranaivo@mail.com',
      phone: '+261330000002',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newLivreur, setNewLivreur] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleAddLivreur = () => {
    if (
      !newLivreur.name ||
      !newLivreur.email ||
      !newLivreur.phone ||
      !newLivreur.password
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const id = (livreurs.length + 1).toString();
    setLivreurs([...livreurs, { id, ...newLivreur }]);
    setNewLivreur({ name: '', email: '', phone: '', password: '' });
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Livreur }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>{item.email}</Text>
      <Text style={styles.info}>{item.phone}</Text>
    </View>
  );

  return (
    <ProtectUserRole role="vendor">
      <View style={styles.container}>
        <FlatList
          data={livreurs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={() => (
            <Text style={styles.header}>Liste des Livreurs</Text>
          )}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter Livreur</Text>
        </TouchableOpacity>

        {/* Modal pour créer un livreur */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Créer un Livreur</Text>

              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={newLivreur.name}
                onChangeText={(text) =>
                  setNewLivreur({ ...newLivreur, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={newLivreur.email}
                onChangeText={(text) =>
                  setNewLivreur({ ...newLivreur, email: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Numéro"
                keyboardType="phone-pad"
                value={newLivreur.phone}
                onChangeText={(text) =>
                  setNewLivreur({ ...newLivreur, phone: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                secureTextEntry
                value={newLivreur.password}
                onChangeText={(text) =>
                  setNewLivreur({ ...newLivreur, password: text })
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAddLivreur}
                >
                  <Text style={styles.buttonText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ProtectUserRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  name: { fontSize: 16, fontWeight: '600' },
  info: { fontSize: 14, color: '#6B7280' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EC4899',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#EC4899',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 0.45,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#6B7280' },
  confirmButton: { backgroundColor: '#EC4899' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
