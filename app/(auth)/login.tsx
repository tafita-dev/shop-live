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
import { formatFirebaseError } from '@/utils/fromater';
import ErrorModal from '@/components/ErrorModal';

const { width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    <LinearGradient
      colors={['#6A00F4', '#C200B0', '#FF6B00']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Spinner
          visible={loading}
          textContent="Connexion..."
          textStyle={styles.spinnerText}
          overlayColor="rgba(0,0,0,0.6)"
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
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Bienvenue 👋</Text>
            <Text style={styles.subtitle}>Connecte-toi pour continuer</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Entrez votre email"
              placeholderTextColor="#ddd"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Entrez votre mot de passe"
                placeholderTextColor="#ddd"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Mot de passe oublié */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton principal */}
          <TouchableOpacity style={styles.mainButton} onPress={handleLogin}>
            <Text style={styles.mainButtonText}>Se connecter</Text>
          </TouchableOpacity>

          {/* Boutons sociaux */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, styles.google]}>
              <FontAwesome name="google" size={20} color="#fff" />
              <Text style={styles.socialText}>Continuer avec Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.facebook]}>
              <FontAwesome name="facebook" size={20} color="#fff" />
              <Text style={styles.socialText}>Continuer avec Facebook</Text>
            </TouchableOpacity>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 120, height: 120 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#fff', fontSize: 16, opacity: 0.9, marginBottom: 20 },
  form: { marginBottom: 20 },
  label: { color: '#fff', fontSize: 14, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: { position: 'absolute', right: 16, top: '35%' },
  forgotPassword: { alignItems: 'flex-end', marginTop: 6 },
  forgotText: { color: '#FFD700', fontWeight: '600' },
  mainButton: {
    backgroundColor: '#FFD700',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  mainButtonText: { color: '#6A00F4', fontSize: 18, fontWeight: '700' },
  socialContainer: { marginTop: 25 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 12,
  },
  google: { backgroundColor: '#EA4335' },
  facebook: { backgroundColor: '#1877F2' },
  socialText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '600' },
  registerLink: { marginTop: 15, alignItems: 'center' },
  registerText: { color: '#fff', fontSize: 14 },
  registerHighlight: { fontWeight: 'bold', textDecorationLine: 'underline' },
  spinnerText: { color: '#FFF', fontSize: width * 0.04, fontWeight: '600' },
});
