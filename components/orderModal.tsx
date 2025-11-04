import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView, // <-- Ajouté pour l'UX sur les appareils modernes
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrderScreen from './orderScreen';
// Importez OrderScreen ici (assurez-vous qu'il est disponible dans ce fichier/contexte)
// import OrderScreen from './OrderScreen';

// Définissez cette constante pour l'accessibilité si vous n'utilisez pas de contexte
const PRIMARY_COLOR = '#4c51bf';
const CARD_BG = '#ffffff';

type orderProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
const OrderModal: React.FC<orderProps> = ({ visible, setVisible }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setVisible(false)}
    >
      {/* 💡 UX: Utiliser SafeAreaView pour éviter que le contenu n'empiète sur les encoches/barres d'état */}
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalContainer}>
          {/* Header Amélioré (UI: Élégant, UX: Bouton de fermeture clair) */}
          <View style={styles.headerModal}>
            {/* 1. Espaceur pour le centrage parfait (UI) */}
            <View style={styles.headerSpacer} />

            {/* 2. Titre centré (UI/UX) */}
            <Text style={styles.headerTitle}>Détails de la commande</Text>

            {/* 3. Bouton de fermeture (UX: clair et à l'emplacement standard) */}
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.closeButton} // Style pour une zone de tap plus grande
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // UX: Augmente la zone cliquable
            >
              <Ionicons
                name="close-circle-outline"
                size={28}
                color={PRIMARY_COLOR}
              />
              {/* 💡 UI: Utiliser une icône "outline" ou "circle" pour un look moderne */}
            </TouchableOpacity>
          </View>

          {/* Contenu principal (UX: Laisse l'espace pour la barre d'état) */}
          <View style={styles.content}>
            <OrderScreen setVisible={setVisible} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OrderModal;

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: CARD_BG, // Assurez-vous que le fond est blanc/clair
  },
  modalContainer: {
    flex: 1,
  },

  // --- Header Amélioré ---
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 55,
    // 💡 UI: Utiliser une ombre légère plutôt qu'un fond plein pour la clarté
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? 0 : 0, // Optionnel: ajustement pour Android si besoin
  },
  headerTitle: {
    // Le titre est forcé au centre car il est entre deux éléments de même taille (`headerSpacer` et `closeButton`)
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '700', // UI: Rendre le titre plus visible
  },
  headerSpacer: {
    width: 28, // Doit être égal à la taille de l'icône + un peu de padding
  },
  closeButton: {
    padding: 5, // Augmente la zone de tap (UX)
  },

  // --- Contenu ---
  content: {
    flex: 1,
    backgroundColor: '#f9fafb', // Laissez le fond du contenu légèrement différent du header
  },
});
