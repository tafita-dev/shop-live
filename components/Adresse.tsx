import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  minHeight?: number;
  editable?: boolean;
  required?: boolean;
  showError?: boolean; // affichage du message d’erreur après soumission
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength = 500,
  minHeight = 100,
  editable = true,
  required = false,
  showError = false,
}) => {
  const [height, setHeight] = useState(minHeight);
  const isError = required && showError && value.trim().length === 0;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TextInput
        style={[styles.textarea, { height }, isError && { borderColor: 'red' }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline
        maxLength={maxLength}
        onContentSizeChange={(e) =>
          setHeight(Math.max(minHeight, e.nativeEvent.contentSize.height))
        }
      />

      <Text style={styles.counter}>
        {value.length}/{maxLength}
      </Text>

      {isError && <Text style={styles.errorText}>Ce champ est requis.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top', // important pour Android
    backgroundColor: '#fff',
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Textarea;
