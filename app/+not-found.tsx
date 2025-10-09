import React from 'react';
import { StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Home } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable' }} />
      <LinearGradient
        colors={['#6A00F4', '#C200B0', '#6A00F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>Oups !</Text>
          <Text style={styles.subtitle}>
            La page que vous cherchez n’existe pas ou a été déplacée.
          </Text>

          <Link href="/(tabs)" asChild>
            <TouchableOpacity activeOpacity={0.8} style={styles.button}>
              <LinearGradient
                colors={['#C200B0', '#6A00F4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Home color="#fff" size={22} />
                <Text style={styles.buttonText}>Retour à l’accueil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width * 0.6,
    height: height * 0.25,
    marginBottom: 30,
  },
  title: {
    fontSize: width * 0.09,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
    marginLeft: 8,
  },
});
