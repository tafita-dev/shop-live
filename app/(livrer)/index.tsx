import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import {
  ScanLine,
  Flashlight,
  FlashlightOff,
  X,
  CheckCircle2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScannerScreen() {
  const [permission, setPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [torch, setTorch] = useState(false);

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Demande permission seulement au lancement
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
    })();
  }, []);

  // Animation de ligne
  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [scanned]);

  const askPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission(status === 'granted');
  };

  // Si pas de permission → écran sécurisé
  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ScanLine size={80} color="#3B82F6" strokeWidth={1.5} />
        <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
        <Text style={styles.permissionText}>
          Nous avons besoin de votre permission pour scanner des QR codes
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={askPermission}
        >
          <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const onScanned = ({ data }: any) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(data);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setScannedData('');
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      {/* Camera affichée SEULEMENT après permission validée → Évite CRASH */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : onScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
        }}
      />

      {/* HEADER SIMPLE (PAS DE BlurView → Évite crash Android) */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Scanner QR Code</Text>
        </View>
      </SafeAreaView>

      {/* ZONE DE SCAN */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            {/* Coins */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Ligne ANIMÉE */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslateY }] },
                ]}
              />
            )}
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* CONTRÔLES (TORCHE) */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setTorch(!torch)}
        >
          {torch ? (
            <Flashlight size={30} color="#fff" />
          ) : (
            <FlashlightOff size={30} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* POPUP RÉSULTAT */}
      {scanned && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <CheckCircle2 size={64} color="#10B981" />

            <Text style={styles.resultTitle}>Code scanné !</Text>

            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{scannedData}</Text>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
              <Text style={styles.resetText}>Scanner à nouveau</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={resetScan}>
              <X size={26} color="#bbb" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#0F172A',
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
  },
  permissionText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 280,
  },
  permissionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerBox: {
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },

  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#3B82F6',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#3B82F6',
  },

  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  flashButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  resultCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    position: 'relative',
  },

  resultTitle: {
    color: '#fff',
    fontSize: 22,
    marginVertical: 20,
    fontWeight: '700',
  },

  resultBox: {
    width: '100%',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultText: { color: '#fff', fontSize: 16 },

  resetButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  resetText: { color: '#fff', textAlign: 'center', fontSize: 16 },

  closeButton: { position: 'absolute', top: 18, right: 18 },
});
