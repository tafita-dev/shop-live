// import React from 'react';
// import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
// import { FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
// import { auth } from '@/firebase/config';
// import { authStorage } from '@/utils/authStorage';
// import { UserClass } from '@/users/user';
// import { LinearGradient } from 'expo-linear-gradient';

// async function facebookLogin() {
//   try {
//     const result = await LoginManager.logInWithPermissions([
//       'public_profile',
//       'email',
//     ]);

//     if (!result || result.isCancelled) {
//       Alert.alert('Connexion Facebook annulée');
//       return;
//     }

//     const data = await AccessToken.getCurrentAccessToken();
//     if (!data?.accessToken) {
//       Alert.alert('Erreur', 'Impossible de récupérer le jeton Facebook.');
//       return;
//     }

//     const credential = FacebookAuthProvider.credential(data.accessToken);
//     const fbResult = await signInWithCredential(auth, credential);

//     if (fbResult) {
//       const user = fbResult.user;
//       const uid = user.uid;
//       const firebaseToken = await user.getIdToken();

//       await authStorage.saveAuthToken(firebaseToken);
//       await authStorage.saveUserId(uid);

//       const fbRes = await fetch(
//         `https://graph.facebook.com/me?fields=id,name,email,picture.width(400).height(400)&access_token=${data.accessToken}`,
//       );
//       const fbUser = await fbRes.json();

//       let existingUser = null;
//       try {
//         existingUser = await UserClass.getUserByFacebookId(fbUser.id);
//       } catch (err) {
//         console.warn('Erreur recherche utilisateur:', err);
//       }

//       if (!existingUser) {
//         const response = await UserClass.createUser(uid, {
//           name: fbUser.name || 'Utilisateur Facebook',
//           email: fbUser.email || user.email || '',
//           role: 'client',
//           photoURL: fbUser.picture?.data?.url || user.photoURL || '',
//           authProviders: { facebookId: fbUser.id },
//         });

//         if (response?.success) {
//           Alert.alert('Bienvenue 🎉', `Compte créé pour ${fbUser.name}`);
//         } else {
//           Alert.alert('Erreur', 'Échec de la création du compte utilisateur.');
//           return;
//         }
//       } else {
//         Alert.alert('Bienvenue de retour 👋', `${fbUser.name}`);
//       }

//       await authStorage.saverole('client');
//       router.replace('/(client)');
//     }
//   } catch (error: any) {
//     console.error('Erreur Facebook :', error);
//     Alert.alert(
//       'Erreur',
//       error?.message || 'Une erreur inattendue est survenue.',
//     );
//   }
// }

// export default function GoogleLoginScreen() {
//   return (
//     <TouchableOpacity style={styles.mainButton} onPress={facebookLogin}>
//       <LinearGradient
//         colors={['#080808ff', '#0a0a0aff']} // rouge Google
//         start={{ x: 0, y: 0.5 }}
//         end={{ x: 1, y: 0.5 }}
//         style={styles.mainButtonGradient}
//       >
//         <FontAwesome name="google" size={22} color="#FFF" />
//         <Text style={styles.mainButtonText}>Google</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   mainButton: {
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   mainButtonGradient: {
//     flexDirection: 'row', // 🔥 met l’icône et le texte sur une ligne
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     gap: 8, // espace entre icône et texte
//   },
//   mainButtonText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: 'bold',
//   },
// });
