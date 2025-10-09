import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '@/types/user';

export class UserClass {
  static createUser = async (userId: string, userData: User) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
      });

      return { success: true, message: 'Utilisateur créé avec succès !' };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Une erreur est survenue lors de la création de l’utilisateur',
      };
    }
  };
}
