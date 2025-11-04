import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { X } from 'lucide-react-native';

interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  value: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  visible,
  onClose,
  value,
}) => {
  const qrRef = useRef<View>(null);

  const handleDownload = async () => {
    if (!qrRef.current) return;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Erreur',
          'Permission non accordée pour accéder à la galerie',
        );
        return;
      }

      // Capture le QR code en PNG
      const uri = await captureRef(qrRef, { format: 'png', quality: 1 });

      // Sauvegarde dans la galerie
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Succès', 'QR code téléchargé dans votre galerie !');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de télécharger le QR code.');
    }
  };

  // Date actuelle pour affichage
  const currentDate = new Date().toLocaleDateString();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>QR Code pour Livraison</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.infoText}>
              Ce QR code est nécessaire pour valider la livraison.
            </Text>

            <View ref={qrRef} collapsable={false} style={styles.qrContainer}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 10,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 20,
                }}
              >
                <QRCode value={value || 'juhjh'} size={200} />
                <Text style={styles.dateText}>
                  Téléchargé le: {currentDate}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
            >
              <Text style={styles.downloadText}>Télécharger le QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    borderRadius: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    padding: 15,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  closeButton: { padding: 5, borderRadius: 50, backgroundColor: '#ff1744' },
  body: { alignItems: 'center', padding: 20 },
  infoText: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  qrContainer: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  downloadButton: {
    marginTop: 20,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  downloadText: { color: '#fff', fontWeight: 'bold' },
});
