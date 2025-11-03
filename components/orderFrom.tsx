import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
} from 'react-native';

// --- TYPES ET INTERFACES (Inchangés) ---
export type FormValues = {
  name: string;
  email: string;
  phone: string;
};

type OrderFormProps = {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
  errors: Partial<FormValues>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<FormValues>>>;
};

// --- NOUVEAU: Composant de Champ de Saisie Personnalisé (UI/UX Dynamique) ---
interface CustomInputProps {
  label: string;
  error?: string;
  inputProps: React.ComponentProps<typeof TextInput>;
  isTextArea?: boolean;
  max?: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  inputProps,
  isTextArea = false,
  max,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Détermination du style dynamique
  const borderColor = error ? '#dc2626' : isFocused ? '#4c51bf' : '#e6e7eb';
  const borderWidth = isFocused || error ? 2 : 1;

  const inputStyle = useMemo(
    () => [
      styles.input,
      isTextArea && styles.textarea,
      { borderColor, borderWidth },
    ],
    [borderColor, borderWidth, isTextArea],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        maxLength={max}
        style={inputStyle}
        placeholderTextColor="#9ca3af"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function OrderForm({
  setValues,
  values,
  errors,
  setErrors,
}: OrderFormProps) {
  const { width } = useWindowDimensions();

  const emailRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const addressRef = useRef<TextInput | null>(null);

  const isNarrow = width < 380;

  const onChange = (key: keyof FormValues, text: string) => {
    setValues((prev) => ({ ...prev, [key]: text }));
    // Effacer l'erreur dès que l'utilisateur commence à taper à nouveau
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        // Ajustement de l'offset pour laisser plus d'espace sur mobile
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, isNarrow && styles.narrow]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* NAME */}
          <CustomInput
            label="Nom complet"
            error={errors.name}
            inputProps={{
              value: values.name,
              onChangeText: (t) => onChange('name', t),
              placeholder: 'Ex: Jean Rakoto',
              returnKeyType: 'next',
              onSubmitEditing: () => emailRef.current?.focus(),
              autoCapitalize: 'words',
              autoComplete: 'name',
            }}
          />

          {/* EMAIL */}
          <CustomInput
            label="Email"
            error={errors.email}
            inputProps={{
              value: values.email,
              onChangeText: (t) => onChange('email', t),
              placeholder: 'exemple@domaine.com',
              keyboardType: 'email-address',
              returnKeyType: 'next',
              onSubmitEditing: () => phoneRef.current?.focus(),
              autoCapitalize: 'none',
              autoComplete: 'email',
              textContentType: 'emailAddress',
            }}
          />

          {/* PHONE */}
          <CustomInput
            label="Téléphone"
            max={10}
            error={errors.phone}
            inputProps={{
              value: values.phone,
              onChangeText: (t) => onChange('phone', t),
              placeholder: '+261 34 12 345 67',
              keyboardType: 'phone-pad',
              returnKeyType: 'next',
              onSubmitEditing: () => addressRef.current?.focus(),
              autoComplete: 'tel',
              textContentType: 'telephoneNumber',
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

// --- STYLES AMÉLIORÉS ---
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    width: 300,
    backgroundColor: '#fff', // Un fond blanc pour le formulaire
  },
  narrow: {
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 22, // Plus grand
    fontWeight: '800', // Plus gras
    marginBottom: 20, // Plus d'espace
    color: '#1f2937',
    textAlign: 'center', // Centré
  },
  field: {
    marginBottom: 16, // Plus d'espace entre les champs
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '700', // Plus gras
  },
  input: {
    backgroundColor: '#f9fafb', // Légèrement grisé pour contraste
    borderRadius: 8, // Arrondi plus doux
    paddingHorizontal: 16, // Plus de padding
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#111827',
    // La bordure est gérée dynamiquement
  },
  textarea: {
    minHeight: 100, // Plus grand
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  error: {
    marginTop: 4, // Moins d'espace pour que l'erreur soit proche
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    marginTop: 24, // Plus d'espace avant le bouton
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4c51bf', // Couleur primaire (Bleu/Violet)
    paddingVertical: 14, // Plus grand
    paddingHorizontal: 40,
    borderRadius: 10,
    minWidth: '70%', // Plus large
    shadowColor: '#4c51bf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    textTransform: 'uppercase', // Pour plus d'impact
  },
});
