import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { authStorage } from './authStorage';

import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const fetchUserRole = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.role; // 'client' ou 'vendor'
  }
  return null;
};

export const loginWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const token = await userCredential.user.getIdToken();
    const userId = userCredential.user.uid;
    console.log(userCredential);
    await authStorage.saveAuthToken(token);
    await authStorage.saveUserId(userId);

    const role = await fetchUserRole(userId);
    console.log(role, 'role');
    await authStorage.saverole(role);

    return {
      success: true,
      token,
      userId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error || 'Erreur de connexion',
    };
  }
};
