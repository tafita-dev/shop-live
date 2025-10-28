import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { loginWithEmailPassword } from '@/utils/authServices';
import SuccessModal from '@/components/SuccesModal';
import ErrorModal from '@/components/ErrorModal';
import { formatFirebaseError } from '@/utils/fromater';
import FacebookLogin from '@/components/FacebookLogin';
import GoogleLoginScreen from '@/components/GoogleLogin';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- CONSTANTES DE STYLE AMÉLIORÉES ---
const PRIMARY_COLOR = '#EC4899'; // Votre rose
const SECONDARY_COLOR = '#fff'; // Bleu/noir de l'interface
const ACCENT_COLOR = '#f43f5e'; // Un rose plus vif pour l'accentuation
const BACKGROUND_COLOR = '#fff'; // Fond très sombre (presque noir) pour le contraste

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Logique de connexion (inchangée)
  const handleLogin = async () => {
    setShowSuccessModal(false);
    setLoading(true);
    try {
      const loginResult = await loginWithEmailPassword(email.trim(), password);
      if (loginResult?.success) {
        router.replace('/(client)');
      } else {
        setShowErrorModal(true);
        const errorMessage = formatFirebaseError(loginResult?.error);
        setErrorMessage(
          errorMessage || 'Une erreur est survenue lors de la connexion.',
        );
      }
    } catch (error) {
      setShowErrorModal(true);
      const errorMessage = formatFirebaseError(error);
      setErrorMessage(
        errorMessage || 'Erreur inattendue lors de la connexion.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Utilisation d'un fond très sombre
    <SafeAreaView
      style={[styles.container, { backgroundColor: BACKGROUND_COLOR }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // 'height' est parfois meilleur sur Android
        style={{ flex: 1 }}
      >
        <Spinner
          visible={loading}
          textContent="Connexion..."
          textStyle={styles.spinnerText}
          overlayColor="rgba(0,0,0,0.75)"
        />

        <SuccessModal
          visible={showSuccessModal}
          title="Inscription réussie !"
          message="Votre compte a été créé avec succès. Cliquez sur continuer pour accéder à l'application."
          onContinue={handleLogin}
        />
        <ErrorModal
          visible={showErrorModal}
          title="Erreur !"
          message={errorMessage}
          onContinue={() => setShowErrorModal(false)}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Améliore la gestion du clavier
        >
          {/* Logo et Titre - Centré au-dessus de la carte */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Connecte-toi pour continuer</Text>
          </View>

          {/* Carte d'Authentification (Auth Card) */}
          <View style={styles.authCard}>
            {/* Formulaire */}
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="nom.utilisateur@email.com"
                placeholderTextColor="#94a3b8" // Gris clair pour le placeholder
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="********"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} // Ajustement pour le conteneur
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <FontAwesome
                    name={showPassword ? 'eye' : 'eye-slash'}
                    size={20}
                    color="#94a3b8" // Oeil gris clair
                  />
                </TouchableOpacity>
              </View>

              {/* Mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/login')} // Ajout d'une navigation
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            {/* Bouton principal - Rose Gradient */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleLogin}
              disabled={loading} // Désactiver pendant le chargement
            >
              <LinearGradient
                colors={[PRIMARY_COLOR, ACCENT_COLOR]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.mainButtonGradient}
              >
                <Text style={styles.mainButtonText}>Se connecter</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.separatorContainer}>
              <View style={styles.separator} />
              <Text style={styles.separatorText}>OU</Text>
              <View style={styles.separator} />
            </View>

            {/* Boutons sociaux - Gardez la logique dans les composants */}
            <View style={styles.socialIconsContainer}>
              <GoogleLoginScreen />
              <FacebookLogin />
            </View>

            {/* Lien d’inscription */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerText}>
                Pas encore de compte ?{' '}
                <Text style={styles.registerHighlight}>S’inscrire</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLESHEET AMÉLIORÉ ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Le fond sera géré par la constante BACKGROUND_COLOR
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10, // Plus d'espace vertical
  },
  // --- Entête ---
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: { width: 100, height: 100, borderRadius: 20 }, // Logo plus petit et arrondi
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800', // Gras pour un titre d'impact
    marginTop: 15,
  },
  subtitle: {
    color: '#EC4899', // Gris doux pour le contraste
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  // --- Carte d'Authentification (Auth Card) ---
  authCard: {
    backgroundColor: SECONDARY_COLOR, // Carte sombre pour contraste
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  // --- Formulaire ---
  form: { marginBottom: 20 },
  label: {
    color: '#EC4899', // Gris très clair
    fontSize: 14,
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#rgba(255,255,255,0.7)', // Fond d'input légèrement plus clair que la carte
    color: '#EC4899',
    borderRadius: 12, // Coins légèrement moins arrondis que le style par défaut
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155', // Bordure subtile
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    // Centrer l'icône dans l'input
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: {
    color: ACCENT_COLOR, // Utilisation de l'accent pour le lien
    fontWeight: '600',
    fontSize: 14,
  },
  // --- Bouton Principal ---
  mainButton: { borderRadius: 12, overflow: 'hidden' }, // Important pour le gradient
  mainButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800', // Très gras
  },
  // --- Séparateur ---
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  separatorText: {
    width: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  // --- Connexion Sociale ---
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Espacement égal
    marginBottom: 20,
  },
  // (Note: Les styles pour Google/Facebook sont gérés dans les composants enfants)
  // --- Lien d'Inscription ---
  registerLink: { marginTop: 15, alignItems: 'center' },
  registerText: { color: '#a1a1aa', fontSize: 14 },
  registerHighlight: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR, // Utilisation du rose principal
  },
  spinnerText: { color: 'white', fontSize: width * 0.04, fontWeight: '600' },
});
