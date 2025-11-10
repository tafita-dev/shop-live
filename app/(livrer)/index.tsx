import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ScanLine,
  Flashlight,
  FlashlightOff,
  X,
  CheckCircle2,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [torch, setTorch] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

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

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.permissionContainer}>
          <ScanLine size={80} color="#3B82F6" strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
          <Text style={styles.permissionText}>
            Nous avons besoin de votre permission pour scanner des QR codes
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannedData(data);
  };

  const handleReset = () => {
    setScanned(false);
    setScannedData('');
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
        }}
      />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <Text style={styles.headerTitle}>Scanner QR Code</Text>
        </BlurView>
      </SafeAreaView>

      {/* Scan Area Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
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

      {/* Instructions */}
      {!scanned && (
        <View style={styles.instructions}>
          <BlurView intensity={60} tint="dark" style={styles.instructionsBlur}>
            <Text style={styles.instructionsText}>
              Placez le code dans le cadre
            </Text>
          </BlurView>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setTorch(!torch)}
        >
          <BlurView intensity={80} tint="dark" style={styles.controlBlur}>
            {torch ? (
              <Flashlight size={28} color="#FFF" />
            ) : (
              <FlashlightOff size={28} color="#FFF" />
            )}
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Success Overlay */}
      {scanned && (
        <View style={styles.successOverlay}>
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <CheckCircle2 size={64} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.successTitle}>Code scanné avec succès!</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>Contenu:</Text>
              <Text style={styles.dataText} numberOfLines={4}>
                {scannedData}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={handleReset}
            >
              <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleReset}>
              <X size={24} color="#9CA3AF" />
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
    backgroundColor: '#0F172A',
  },
  loadingText: { color: '#94A3B8', fontSize: 16 },
  permissionContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerBlur: { paddingVertical: 16, paddingHorizontal: 24 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#3B82F6',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    left: 32,
    right: 32,
    zIndex: 10,
  },
  instructionsBlur: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  controlBlur: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  successCard: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  successIconContainer: { marginBottom: 24 },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 24,
    textAlign: 'center',
  },
  dataContainer: {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataText: { fontSize: 16, color: '#F1F5F9', lineHeight: 24 },
  scanAgainButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  scanAgainText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: { position: 'absolute', top: 16, right: 16, padding: 8 },
});
