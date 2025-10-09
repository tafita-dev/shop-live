import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { authStorage } from './authStorage';

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

    await authStorage.saveAuthToken(token);
    await authStorage.saveUserId(userId);

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
