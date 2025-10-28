import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
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

  static async getUserByFacebookId(facebookId: string) {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('authProviders.facebookId', '==', facebookId),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // Aucun utilisateur trouvé
    }

    // Retourne le premier utilisateur trouvé
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }
}
