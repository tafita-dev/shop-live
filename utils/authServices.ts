import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db } from '@/firebase/config';
import { authStorage } from './authStorage';
import { doc, getDoc } from 'firebase/firestore';

/** Récupère le rôle de l'utilisateur depuis Firestore */
export const fetchUserRole = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role; // 'client' ou 'vendor'
    }
    return null;
  } catch (err) {
    console.error('Erreur fetchUserRole:', err);
    return null;
  }
};

/** Connexion avec email et mot de passe */
export const loginWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = userCredential.user;
    const token = await user.getIdToken();
    const userId = user.uid;
    const role = await fetchUserRole(userId);

    await authStorage.saverole(role);
    await authStorage.saveAuthToken(token);
    await authStorage.saveUserId(userId);

    console.log('Connexion réussie:', { userId, role });

    return {
      success: true,
      token,
      userId,
      role,
    };
  } catch (err: any) {
    // Toujours récupérer un message clair
    const message = err?.message || String(err) || 'Erreur de connexion';
    console.error('Erreur loginWithEmailPassword:', message);

    return {
      success: false,
      error: message,
    };
  }
};
