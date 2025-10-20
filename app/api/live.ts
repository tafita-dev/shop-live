import { db } from '@/firebase/config';
import { Live } from '@/types/live';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default class LiveService {
  static async createLive(live: Live) {
    try {
      const docRef = await addDoc(collection(db, 'lives'), {
        ...live,
        createdAt: serverTimestamp(),
      });
      console.log('✅ Profil créé avec ID :', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création du profil :', error);
      throw error;
    }
  }
}
