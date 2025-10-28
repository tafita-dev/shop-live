import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { authStorage } from '@/utils/authStorage';
import { UserClass } from '@/users/user';

async function facebookLogin() {
  try {
    // 1️⃣ Demander les permissions Facebook
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (!result || result.isCancelled) {
      Alert.alert('Connexion Facebook annulée');
      return;
    }

    // 2️⃣ Obtenir le jeton d’accès Facebook
    const data = await AccessToken.getCurrentAccessToken();
    if (!data?.accessToken) {
      Alert.alert('Erreur', 'Impossible de récupérer le jeton Facebook.');
      return;
    }

    // 3️⃣ Créer les credentials Firebase à partir du token Facebook
    const credential = FacebookAuthProvider.credential(data.accessToken);

    // 4️⃣ Authentifier l’utilisateur avec Firebase
    const fbResult = await signInWithCredential(auth, credential);
    if (fbResult) {
      const user = fbResult.user;

      if (!user) {
        Alert.alert('Erreur', 'Échec de la connexion Firebase.');
        return;
      }

      const uid = user.uid;
      const firebaseToken = await user.getIdToken();

      // 5️⃣ Sauvegarder dans le stockage local
      await authStorage.saveAuthToken(firebaseToken);
      await authStorage.saveUserId(uid);

      // 6️⃣ Récupérer les infos Facebook supplémentaires
      const fbRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.width(400).height(400)&access_token=${data.accessToken}`,
      );
      const fbUser = await fbRes.json();

      if (!fbUser?.id) {
        Alert.alert('Erreur', 'Impossible d’obtenir votre profil Facebook.');
        return;
      }

      // 7️⃣ Vérifier si l’utilisateur existe déjà dans Firestore (via UserClass)
      let existingUser = null;
      try {
        existingUser = await UserClass.getUserByFacebookId(fbUser.id);
      } catch (err: any) {
        console.warn('Erreur lors de la recherche utilisateur:', err);
      }

      // 8️⃣ Si inexistant, créer un nouvel utilisateur
      if (!existingUser) {
        try {
          const response = await UserClass.createUser(uid, {
            name: fbUser.name || 'Utilisateur Facebook',
            email: fbUser.email || user.email || '',
            role: 'client',
            photoURL: fbUser.picture?.data?.url || user.photoURL || '',
            authProviders: { facebookId: fbUser.id },
          });

          if (response?.success) {
            Alert.alert('Bienvenue 🎉', `Compte créé pour ${fbUser.name}`);
          } else {
            Alert.alert(
              'Erreur',
              'Échec de la création du compte utilisateur.',
            );
            return;
          }
        } catch (err: any) {
          Alert.alert(
            'Erreur création utilisateur',
            err?.message || 'Inconnue',
          );
          return;
        }
      } else {
        Alert.alert('Bienvenue de retour 👋', `${fbUser.name}`);
      }

      // 9️⃣ Redirection
      await authStorage.saverole('client');
      router.replace('/(client)');
    } else {
      Alert.alert('Bienvenue de retour 👋', `${fbResult}`);
    }
  } catch (error: any) {
    console.error('Erreur de connexion Facebook :', error);
    Alert.alert(
      'Erreur',
      error?.message || 'Une erreur inattendue est survenue.',
    );
  }
}

export default function GoogleLoginScreen() {
  return (
    <TouchableOpacity onPress={facebookLogin} style={styles.socialIcon}>
      <FontAwesome name="google" size={24} color="#4267B2" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  socialIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 14,
    marginBottom: 12,
  },
  facebook: { backgroundColor: '#1877F2' },
  socialTextF: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
});
