import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, AlertCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onContinue: () => void;
}

export default function ErrorModal({
  visible,
  title,
  message,
  onContinue,
}: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <AlertCircle size={80} color="#EC4899" strokeWidth={2} />
          </View>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            onPress={onContinue}
            style={styles.continueButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EC4899', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Ok</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: '#111827',
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  message: {
    fontSize: width * 0.04,
    color: '#EC4899',
    marginBottom: height * 0.03,
    textAlign: 'center',
    lineHeight: width * 0.055,
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: width * 0.042,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
