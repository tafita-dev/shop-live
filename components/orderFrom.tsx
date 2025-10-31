// OrderForm.tsx
import React, { useRef, useState } from 'react';
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

type FormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type OrderFormProps = {
  initialValues?: Partial<FormValues>;
  onSubmit?: (values: FormValues) => void;
  submitLabel?: string;
};

export default function OrderForm({
  initialValues = {},
  onSubmit,
  submitLabel = 'Valider',
}: OrderFormProps) {
  const { width } = useWindowDimensions();
  const [values, setValues] = useState<FormValues>({
    name: initialValues.name || '',
    email: initialValues.email || '',
    phone: initialValues.phone || '',
    address: initialValues.address || '',
  });

  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const emailRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const addressRef = useRef<TextInput | null>(null);

  const isNarrow = width < 380;

  const validate = (): boolean => {
    const e: Partial<FormValues> = {};
    if (!values.name.trim()) e.name = 'Le nom est requis';
    if (!values.email.trim()) e.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Email invalide';
    if (!values.phone.trim()) e.phone = 'Le téléphone est requis';
    else if (!/^[0-9+\s()-]{6,20}$/.test(values.phone))
      e.phone = 'Numéro invalide';
    if (!values.address.trim()) e.address = "L'adresse est requise";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    onSubmit?.(values);
  };

  const onChange = (key: keyof FormValues, text: string) => {
    setValues((prev) => ({ ...prev, [key]: text }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, isNarrow && styles.narrow]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Informations de livraison</Text>

          {/* NAME */}
          <View style={styles.field}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              value={values.name}
              onChangeText={(t) => onChange('name', t)}
              placeholder="Ex: Jean Rakoto"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              style={styles.input}
              autoCapitalize="words"
              autoComplete="name"
              accessibilityLabel="Nom complet"
            />
            {errors.name ? (
              <Text style={styles.error}>{errors.name}</Text>
            ) : null}
          </View>

          {/* EMAIL */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              value={values.email}
              onChangeText={(t) => onChange('email', t)}
              placeholder="exemple@domaine.com"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Adresse email"
            />
            {errors.email ? (
              <Text style={styles.error}>{errors.email}</Text>
            ) : null}
          </View>

          {/* PHONE */}
          <View style={styles.field}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              ref={phoneRef}
              value={values.phone}
              onChangeText={(t) => onChange('phone', t)}
              placeholder="+261 34 12 345 67"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
              blurOnSubmit={false}
              style={styles.input}
              autoComplete="tel"
              textContentType="telephoneNumber"
              accessibilityLabel="Numéro de téléphone"
            />
            {errors.phone ? (
              <Text style={styles.error}>{errors.phone}</Text>
            ) : null}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  narrow: {
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    color: '#1f2937',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#e6e7eb',
    fontSize: 15,
    color: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  error: {
    marginTop: 6,
    color: '#dc2626',
    fontSize: 12,
  },
  actions: {
    marginTop: 16,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4c51bf',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
