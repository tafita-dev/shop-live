import React, { useState, useRef, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
// Note: J'ai retiré l'import Image de RN car il n'y a pas d'image de logo visible sur l'image de référence.
import { LinearGradient } from 'expo-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
// Icônes Lucide-react-native :
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ChevronLeft,
  Check,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
// Firebase et services (maintenus) :
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from 'firebase/auth';
import { formatFirebaseError } from '@/utils/fromater';
import SuccessModal from '@/components/SuccesModal';
import ErrorModal from '@/components/ErrorModal';
import { loginWithEmailPassword } from '@/utils/authServices';
import { UserClass } from '@/users/user';
import { usePushNotification } from '@/useNotifications';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ----------------------------------------------------
// 🎨 COULEURS ET CONSTANTES
// ----------------------------------------------------
const PRIMARY_COLOR_DARK = '#EC4899'; // Rose foncé utilisé pour le fond
const PRIMARY_COLOR_LIGHT = '#f43f5e'; // Rose plus clair pour le gradient
const BACKGROUND_WHITE = '#FFFFFF';
const TEXT_COLOR_DARK = '#212121';
const TEXT_COLOR_LIGHT = '#757575';
const ACCENT_TEXT_COLOR = PRIMARY_COLOR_DARK;

// Fonction pour valider le format de l'email
const validateEmail = (email: string): boolean => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// --- INTERFACE POUR LES PROPRIÉTÉS DU CHAMP D'ENTRÉE ---
interface InputFieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  showToggle?: boolean;
  togglePress?: () => void;
  error?: string;
  max?: number;
}

// --- COMPOSANT DE CHAMP D'ENTRÉE DYNAMIQUE (Simplifié pour ce design) ---
const InputField: React.FC<InputFieldProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  showToggle,
  togglePress,
  error,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Cloner l'élément React pour injecter les props de couleur
  const iconColor = isFocused ? PRIMARY_COLOR_DARK : TEXT_COLOR_LIGHT;
  const renderIcon = React.cloneElement(icon as any, {
    size: 20,
    color: iconColor,
  });

  return (
    <View style={styles.inputGroup}>
      <View
        style={[
          styles.inputContainer,
          // Styles spécifiques à l'image (fond blanc, pas de bordure visible par défaut)
          // On ajoute la bordure rouge en cas d'erreur
          error && styles.inputErrorBorder,
        ]}
      >
        {renderIcon}
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          autoCapitalize={
            keyboardType === 'email-address' ? 'none' : 'sentences'
          }
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          selectionColor={PRIMARY_COLOR_DARK}
          maxLength={max}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showToggle && togglePress && (
          <TouchableOpacity onPress={togglePress}>
            {secureTextEntry ? (
              <Eye size={20} color={iconColor} />
            ) : (
              <EyeOff size={20} color={iconColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* Affichage de l'erreur */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// --- COMPOSANT PRINCIPAL D'INSCRIPTION ---
export default function Register(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const { expoPushToken } = usePushNotification();
  // console.log(expoPushToken, 'jggjh'); // Maintenu pour la logique de l'utilisateur

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreedToPolicy, setAgreedToPolicy] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [errors, setErrors] = useState<{
    username: string;
    email: string;
    phone: string; // Ajout du champ phone pour l'étape 1
    password: string;
    confirmPassword: string;
    policy: string; // Ajout du champ policy
  }>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    policy: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current; // Utilisation de l'animation pour la transition

  useEffect(() => {
    // Animation d'entrée simple
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const goToLogin = () => router.push('/(auth)/login');

  const handleNextStep = (): void => {
    const newErrors = { username: '', email: '', phone: '' };
    let valid = true;

    if (!username.trim()) {
      newErrors.username = "Le nom d'utilisateur est obligatoire.";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Veuillez saisir un email.';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Le format de l'email n'est pas valide.";
      valid = false;
    }

    // Le champ téléphone n'est pas obligatoire par défaut, mais vous pouvez ajouter une validation si nécessaire.
    // if (!phone.trim()) { newErrors.phone = "Le numéro de téléphone est obligatoire."; valid = false; }

    setErrors((prev) => ({ ...prev, ...newErrors, policy: '' }));

    if (valid) setStep(2);
  };

  const handleConfirm = async (): Promise<void> => {
    const newErrors = { password: '', confirmPassword: '', policy: '' };
    let valid = true;

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire.';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password =
        'Le mot de passe doit contenir au moins 6 caractères.';
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        'La confirmation du mot de passe est obligatoire.';
      valid = false;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
      valid = false;
    }

    // Validation de la politique de confidentialité
    if (!agreedToPolicy) {
      newErrors.policy = 'Vous devez accepter la politique de confidentialité.';
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (!valid) return;

    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: username });
      const userId = userCredential.user.uid;

      // Assurez-vous que UserClass.createUser est bien définie dans votre projet
      const response = await UserClass.createUser(
        userId,
        {
          name: username,
          email,
          phone,
          password,
          role: 'vendor', // Rôle par défaut
          authProviders: { emailPassword: true },
        },
        expoPushToken ? expoPushToken : '',
      );

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
        setErrorMessage(response.message);
      }
    } catch (error) {
      setShowErrorModal(true);
      setErrorMessage(
        formatFirebaseError(error) ||
          'Une erreur est survenue, veuillez réessayer.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToLogin = async (): Promise<void> => {
    setShowSuccessModal(false);
    setLoading(true);
    try {
      const loginResult = await loginWithEmailPassword(email, password);
      if (loginResult.success) {
        // Redirection vers l'écran client après succès
        router.replace('/(client)');
      } else {
        setShowErrorModal(true);
        setErrorMessage(loginResult.error || 'Erreur de connexion automatique');
      }
    } catch {
      setShowErrorModal(true);
      setErrorMessage('Erreur lors de la connexion automatique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer} // Utilise le style pour le fond blanc
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Spinner
        visible={loading}
        textContent="Chargement..."
        textStyle={styles.spinnerText}
        overlayColor="rgba(0,0,0,0.6)"
      />
      <ErrorModal
        visible={showErrorModal}
        title="Erreur !"
        message={errorMessage}
        onContinue={() => setShowErrorModal(false)}
      />
      <SuccessModal
        visible={showSuccessModal}
        title="Inscription réussie !"
        message="Votre compte a été créé avec succès."
        onContinue={handleContinueToLogin}
      />

      {/* 1. Fond rose du header avec les cercles */}
      <View style={styles.topBackground}>
        {/* Cercles de décoration (similaires à l'image) */}
        <View style={[styles.circle, styles.circleTopRight]} />
        <View style={[styles.circle, styles.circleBottomRight]} />
      </View>

      {/* 2. Fond rose du footer pour la forme en bas */}
      <View style={styles.bottomBackground} />

      {/* 3. Contenu (Titre et Formulaire) */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Prêt à nous rejoindre ?</Text>
        </View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {step === 1 && (
            <>
              <InputField
                icon={<User />}
                placeholder="Nom d'utilisateur"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrors((p) => ({ ...p, username: '' }));
                }}
                error={errors.username}
              />
              <InputField
                icon={<Mail />}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((p) => ({ ...p, email: '' }));
                }}
                keyboardType="email-address"
                error={errors.email}
              />
              <InputField
                icon={<Phone />}
                placeholder="Téléphone (Optionnel)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                max={10}
              />

              <TouchableOpacity
                onPress={handleNextStep}
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>ÉTAPE 1/2 : SUIVANT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <InputField
                icon={<Lock />}
                placeholder="Mot de passe"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((p) => ({
                    ...p,
                    password: '',
                    confirmPassword: '',
                  }));
                }}
                secureTextEntry={!showPassword}
                showToggle
                togglePress={() => setShowPassword(!showPassword)}
                error={errors.password}
              />
              <InputField
                icon={<Lock />}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((p) => ({
                    ...p,
                    confirmPassword: '',
                    password: '',
                  }));
                }}
                secureTextEntry={!showConfirmPassword}
                showToggle
                togglePress={() => setShowConfirmPassword(!showConfirmPassword)}
                error={errors.confirmPassword}
              />

              {/* Checkbox de la politique de confidentialité */}
              <TouchableOpacity
                onPress={() => {
                  setAgreedToPolicy(!agreedToPolicy);
                  setErrors((p) => ({ ...p, policy: '' }));
                }}
                style={styles.policyContainer}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreedToPolicy && styles.checkboxActive,
                  ]}
                >
                  {agreedToPolicy && (
                    <Check size={16} color={BACKGROUND_WHITE} />
                  )}
                </View>
                <Text style={styles.policyText}>
                  J'accepte la{' '}
                  <Text style={styles.policyLinkText}>
                    politique de confidentialité
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.policy ? (
                <Text style={[styles.errorText, { marginBottom: 15 }]}>
                  {errors.policy}
                </Text>
              ) : null}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={[styles.secondaryButton, { flex: 0.35 }]}
                >
                  <ChevronLeft size={20} color={TEXT_COLOR_DARK} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[styles.primaryButton, { flex: 0.62 }]}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>ÉTAPE 2/2 : TERMINER</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- STYLES ADAPTÉS À L'IMAGE ---
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_WHITE, // Fond blanc visible
  },

  // --- Éléments de fond basés sur l'image ---
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    backgroundColor: PRIMARY_COLOR_DARK,
    borderBottomRightRadius: 100, // Courbe du bas à droite
    overflow: 'hidden',
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
    backgroundColor: PRIMARY_COLOR_DARK,
    borderTopLeftRadius: 100, // Courbe du haut à gauche
    opacity: 0.9,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
  },
  circleTopRight: {
    width: 150,
    height: 150,
    top: -30,
    right: -50,
    backgroundColor: PRIMARY_COLOR_LIGHT, // Couleur plus claire
  },
  circleBottomRight: {
    width: 80,
    height: 80,
    top: 100,
    right: 50,
  },

  // --- Contenu et Formulaire ---
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.1, // Espace pour le titre
  },
  headerContent: {
    paddingHorizontal: width * 0.08,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: height * 0.05,
  },
  title: {
    fontSize: width * 0.09,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    // Le titre est centré dans l'image, mais ici il est décalé pour le contraste
  },
  subtitle: {
    fontSize: width * 0.045,
    color: '#FFF',
    fontWeight: '500',
    marginTop: 5,
  },

  formContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_WHITE,
    marginHorizontal: width * 0.05, // Ajoute un léger espace sur les côtés
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    borderRadius: 20,
    zIndex: 10, // S'assure que le formulaire est au-dessus du fond rose
  },

  // --- Champs de Saisie (Adaptation de InputField) ---
  inputGroup: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_WHITE, // Fond blanc des inputs (comme l'image)
    borderRadius: 12,
    paddingHorizontal: 15,
    height: height * 0.07,

    // Ombre similaire à l'image
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Bordure très légère pour l'effet
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: width * 0.04,
    color: TEXT_COLOR_DARK,
    paddingHorizontal: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: width * 0.035,
    marginTop: 5,
    marginLeft: 10,
  },

  // --- Checkbox de Politique ---
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: TEXT_COLOR_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: PRIMARY_COLOR_DARK,
    borderColor: PRIMARY_COLOR_DARK,
  },
  policyText: {
    fontSize: width * 0.038,
    color: TEXT_COLOR_DARK,
  },
  policyLinkText: {
    color: PRIMARY_COLOR_DARK,
    fontWeight: '600',
  },

  // --- Boutons ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 15,
    elevation: 3,
  },
  secondaryButton: {
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: BACKGROUND_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonGradient: {
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: BACKGROUND_WHITE,
    fontSize: width * 0.04,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // --- Lien de connexion ---
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  loginText: { fontSize: width * 0.038, color: TEXT_COLOR_LIGHT },
  loginLink: {
    fontSize: width * 0.038,
    color: PRIMARY_COLOR_DARK,
    fontWeight: '700',
  },

  // --- Spinner ---
  spinnerText: {
    color: BACKGROUND_WHITE,
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});
