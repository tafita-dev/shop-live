import {
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Categorie } from '@/types/categorie';
import { authStorage } from '@/utils/authStorage';

export class CategorieClass {
  // ✅ Créer une catégorie
  static createCategorie = async (category: Categorie) => {
    try {
      await addDoc(collection(db, 'categories'), {
        name: category.name,
        description: category.description,
        image: category.image,
        createdAt: serverTimestamp(),
        vendorId: category.vendorId,
      });
      return { success: true, message: 'Catégorie ajoutée avec succès !' };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Une erreur est survenue lors de la création de la categorie',
      };
    }
  };

  // ✅ Récupérer toutes les catégories d'un utilisateur
  static getCategories = async (): Promise<Categorie[]> => {
    try {
      const userId = await authStorage.getUserId();
      console.log(userId, 'userId');

      if (!userId) {
        console.warn('Aucun userId trouvé');
        return [];
      }

      const q = query(
        collection(db, 'categories'),
        where('vendorId', '==', userId), // filtrer par userId
        orderBy('createdAt', 'desc'), // ordre par date
      );

      const querySnapshot = await getDocs(q);
      const categories: Categorie[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          image: data.image,
          createdAt:
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toLocaleString()
              : '',
          vendorId: data.vendorId || '', // corrige le champ userConneted
        });
      });

      return categories;
    } catch (error) {
      console.error('Erreur récupération catégories:', error);
      return [];
    }
  };

  // ✅ Supprimer une catégorie par ID
  static deleteCategorie = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return { success: true, message: 'Catégorie supprimée avec succès !' };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Une erreur est survenue lors de la suppression de la categorie',
      };
    }
  };
}
