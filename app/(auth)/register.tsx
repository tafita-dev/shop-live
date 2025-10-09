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
  Image,
  Animated,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { formatFirebaseError } from '@/utils/fromater';
import SuccessModal from '@/components/SuccesModal';
import ErrorModal from '@/components/ErrorModal';
import { loginWithEmailPassword } from '@/utils/authServices';
import { UserClass } from '@/users/user';

const { width, height } = Dimensions.get('window');

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
}

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
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeAnim]);

  return (
    <View style={{ marginBottom: error ? 0 : height * 0.015 }}>
      <Animated.View
        style={[
          styles.inputWrapper,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {icon}
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          selectionColor="#EC4899"
        />
        {showToggle && togglePress && (
          <TouchableOpacity onPress={togglePress}>
            {secureTextEntry ? (
              <Eye size={20} color="#6B7280" />
            ) : (
              <EyeOff size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default function Register(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [errors, setErrors] = useState<{
    username: string;
    emailPhone: string;
    password: string;
    confirmPassword: string;
    passwordMatch: string;
  }>({
    username: '',
    emailPhone: '',
    password: '',
    confirmPassword: '',
    passwordMatch: '',
  });

  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const goToLogin = () => router.push('/(auth)/login');

  const handleNextStep = (): void => {
    const newErrors = { username: '', emailPhone: '' };
    let valid = true;
    if (!username.trim()) {
      newErrors.username = "Le nom d'utilisateur est obligatoire !";
      valid = false;
    }
    if (!email.trim()) {
      newErrors.emailPhone = 'Veuillez saisir un email !';
      valid = false;
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (valid) setStep(2);
  };

  const handleConfirm = async (): Promise<void> => {
    const newErrors = { password: '', confirmPassword: '', passwordMatch: '' };
    let valid = true;
    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est obligatoire !';
      valid = false;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        'La confirmation du mot de passe est obligatoire !';
      valid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.passwordMatch = 'Les mots de passe ne correspondent pas';
      valid = false;
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (!valid) return;

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: username });
      const userId = userCredential.user.uid;
      const response = await UserClass.createUser(userId, {
        name: username,
        email,
        phone,
        password,
        role: 'vendor',
        authProviders: { emailPassword: true },
      });
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
        router.replace('/(tabs)');
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
      style={{ flex: 1 }}
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

      <LinearGradient
        colors={['#8B5CF6', '#EC4899', '#F59E0B']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.topSection,
              { opacity: logoAnim, transform: [{ scale: logoAnim }] },
            ]}
          >
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Inscription !</Text>
            <Text style={styles.subtitle}>Créez votre compte facilement</Text>
          </Animated.View>

          <View style={styles.formContainer}>
            {step === 1 && (
              <>
                <InputField
                  icon={<User size={20} color="#6B7280" />}
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChangeText={setUsername}
                  error={errors.username}
                />
                <InputField
                  icon={<Mail size={20} color="#6B7280" />}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.emailPhone}
                />
                <InputField
                  icon={<Phone size={20} color="#6B7280" />}
                  placeholder="Téléphone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  onPress={handleNextStep}
                  style={styles.signUpButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#FBBF24']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.signUpText}>Suivant</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <InputField
                  icon={<Lock size={20} color="#6B7280" />}
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  showToggle
                  togglePress={() => setShowPassword(!showPassword)}
                  error={errors.password}
                />
                <InputField
                  icon={<Lock size={20} color="#6B7280" />}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  showToggle
                  togglePress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  error={errors.confirmPassword || errors.passwordMatch}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    style={[styles.secondaryButton, { flex: 0.48 }]}
                  >
                    <Text style={styles.buttonText}>Retour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={[styles.primaryButton, { flex: 0.48 }]}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#F59E0B', '#FBBF24']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Terminer</Text>
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
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// Styles conservés de ton code existant, inchangés pour UI/UX
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', minHeight: height },
  topSection: {
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
  },
  logo: { width: 120, height: 120 },
  title: {
    fontSize: width * 0.08,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: { fontSize: width * 0.04, color: '#FFF', fontWeight: '500' },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: height * 0.06,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: { flex: 1, fontSize: width * 0.038, color: '#111827' },
  signUpButton: {
    marginTop: height * 0.01,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#FFF',
    fontSize: width * 0.042,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryButton: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.018,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.042,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  loginText: { fontSize: width * 0.035, color: '#6B7280' },
  loginLink: { fontSize: width * 0.035, color: '#EC4899', fontWeight: '700' },
  errorText: {
    color: '#EF4444',
    fontSize: width * 0.035,
    marginTop: 4,
    marginBottom: 8,
  },
  spinnerText: { color: '#FFF', fontSize: width * 0.04, fontWeight: '600' },
});
