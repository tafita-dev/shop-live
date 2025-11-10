import React, { useRef, useState } from 'react';
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
  Alert, // Ajout pour les messages d'erreur de validation
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
const ACCENT_COLOR = '#f43f5e'; // Un rose plus vif pour l'accentuation du gradient
const TEXT_COLOR = '#1f2937'; // Couleur du texte principal
const BACKGROUND_COLOR = '#f3f4f6'; // Fond clair (Gris doux) pour un design moderne
const CARD_BG = '#fff'; // Couleur de la carte d'authentification

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // NOUVEAUX ÉTATS POUR LE CONTRÔLE DES CHAMPS (INPUT VALIDATION)
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const passwordRef = useRef<TextInput>(null);

  // --- NOUVELLE LOGIQUE DE VALIDATION ---
  const validateFields = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Veuillez entrer une adresse email valide.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Veuillez entrer votre mot de passe.');
      isValid = false;
    }
    // Vous pouvez ajouter ici d'autres vérifications de mot de passe (taille min, etc.)

    return isValid;
  };

  // Logique de connexion (MIS À JOUR)
  const handleLogin = async () => {
    // 1. Contrôler les champs avant de procéder
    if (!validateFields()) {
      Alert.alert(
        'Erreur de formulaire',
        'Veuillez corriger les champs en rouge avant de continuer.',
      );
      return;
    }

    // 2. Logique de connexion API (inchangée)
    setShowSuccessModal(false);
    setLoading(true);
    try {
      const loginResult = await loginWithEmailPassword(email.trim(), password);
      if (loginResult?.success) {
        // Redirection en cas de succès
        router.replace('/(client)');
      } else {
        setShowErrorModal(true);
        const firebaseErrorMsg = formatFirebaseError(loginResult?.error);
        setErrorMessage(
          firebaseErrorMsg || 'Une erreur est survenue lors de la connexion.',
        );
      }
    } catch (error) {
      setShowErrorModal(true);
      const generalErrorMsg = formatFirebaseError(error);
      setErrorMessage(
        generalErrorMsg || 'Erreur inattendue lors de la connexion.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour changer le texte et effacer l'erreur associée
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  // Style dynamique pour les inputs
  const getInputStyle = (error: string) => ({
    borderColor: error ? ACCENT_COLOR : '#e2e8f0', // Rose vif si erreur
    borderWidth: error ? 2 : 1,
    shadowColor: error ? ACCENT_COLOR : 'transparent',
    shadowOpacity: error ? 0.3 : 0,
    shadowRadius: error ? 5 : 0,
    elevation: error ? 5 : 0,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: CARD_BG }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo et Titre - Centré au-dessus de la carte */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/icon.png')} // Assurez-vous que ce chemin est correct
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
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={[styles.input, getInputStyle(emailError)]}
              />
              {emailError ? (
                <Text style={styles.validationError}>{emailError}</Text>
              ) : null}

              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  placeholder="********"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  style={[
                    styles.input,
                    { flex: 1, marginBottom: 0 },
                    getInputStyle(passwordError),
                  ]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <FontAwesome
                    name={showPassword ? 'eye' : 'eye-slash'}
                    size={20}
                    color={passwordError ? ACCENT_COLOR : '#94a3b8'} // Couleur de l'oeil basée sur l'erreur
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.validationError}>{passwordError}</Text>
              ) : null}

              {/* Mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotPassword}
                // Chemin corrigé pour être plus logique
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            {/* Bouton principal - Rose Gradient */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[PRIMARY_COLOR, ACCENT_COLOR]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.mainButtonGradient,
                  loading && styles.mainButtonDisabled,
                ]}
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

            {/* Boutons sociaux */}
            <View style={styles.socialIconsContainer}>
              <GoogleLoginScreen />
              <FacebookLogin />
            </View>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => router.push('/(auth)/register')}
              disabled={loading}
            >
              <LinearGradient
                colors={[PRIMARY_COLOR, ACCENT_COLOR]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.mainButtonGradient,
                  loading && styles.mainButtonDisabled,
                ]}
              >
                <Text style={styles.mainButtonText}>Créé un compte </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLESHEET AMÉLIORÉ ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20, // Légèrement augmenté
    paddingVertical: 10,
  },
  // --- Entête ---
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: { width: 80, height: 80, borderRadius: 15 },
  title: {
    color: TEXT_COLOR,
    fontSize: 28, // Taille légèrement réduite
    fontWeight: '800',
    marginTop: 15,
  },
  subtitle: {
    color: PRIMARY_COLOR, // Utilisez le rose principal ici
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  // --- Carte d'Authentification (Auth Card) ---
  authCard: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    shadowColor: TEXT_COLOR,
  },
  // --- Formulaire ---
  form: { marginBottom: 10 },
  label: {
    color: TEXT_COLOR,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f9fafb', // Fond d'input très clair
    color: TEXT_COLOR,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 0, // Géré par l'erreur/l'espacement global
    borderWidth: 1,
    borderColor: '#e2e8f0', // Bordure gris très clair par défaut
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, // Espacement avant l'erreur/le lien oublié
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  // NOUVEAU STYLE POUR L'ERREUR DE VALIDATION
  validationError: {
    color: ACCENT_COLOR,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 14,
  },
  // --- Bouton Principal ---
  mainButton: { borderRadius: 12, overflow: 'hidden' },
  mainButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  mainButtonDisabled: {
    opacity: 0.7, // Diminuer l'opacité lorsque désactivé
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
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
    backgroundColor: '#e2e8f0',
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
    justifyContent: 'space-between', // Utilisé 'space-between' pour plus de marge si les boutons sont larges
    marginBottom: 20,
  },
  // --- Lien d'Inscription ---
  registerLink: { marginTop: 15, alignItems: 'center' },
  registerText: { color: '#a1a1aa', fontSize: 14 },
  registerHighlight: {
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  spinnerText: { color: 'white', fontSize: width * 0.04, fontWeight: '600' },
});
