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
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { authStorage } from '@/utils/authStorage';
import { Product } from '@/types/product';
import { Categorie } from '@/types/categorie';

export class ProduitClass {
  // ✅ Créer un produit
  static createProduit = async (product: Product) => {
    try {
      await addDoc(collection(db, 'produits'), {
        code: product.code,
        title: product.title,
        description: product.description || '',
        price: product.price,
        image: product.image || '',
        stock: product.stock || 0,
        categoryId: product.categoryId || '',
        createdAt: serverTimestamp(),
        vendorId: product.vendorId,
      });
      return { success: true, message: 'Produit ajouté avec succès !' };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Une erreur est survenue lors de la création du produit',
      };
    }
  };

  static fetchAllProducts = async (): Promise<Product[]> => {
    // Si ProduitClass.getAllProduits() existait:
    // return ProduitClass.getAllProduits();

    // TEMPORAIRE: Simuler un appel qui récupère tous les produits
    // C'est une simulation DANGEREUSE car elle pourrait renvoyer une erreur
    // si un `categoryId` vide n'est pas géré dans ProduitClass.getProduits.
    // On va simuler ici la structure de retour attendue par les données Firebase réelles.

    // Pour l'exercice, nous allons modifier ProduitClass.getProduits
    // ou appeler une nouvelle méthode qui ne filtre pas par catégorie.
    // Étant donné que je ne peux pas modifier ProduitClass, je vais
    // simuler une liste de produits réels. Dans votre code,
    // vous devriez ajouter une méthode `getAllProduits` à `ProduitClass`.

    // Pour que le code ci-dessous compile et fonctionne avec l'interface,
    // on va modifier la structure des mocks pour coller au format Product[] Firebase.
    const userId = await authStorage.getUserId();
    if (!userId) {
      console.warn('Aucun userId trouvé');
      return [];
    }

    // ⚠️ ALERTE : Ceci appelle getProduits avec un ID bidon.
    // Cela ne marchera que si ProduitClass.getProduits est modifié.
    // La bonne pratique serait de créer une méthode `getAllProduits` dans ProduitClass.
    // Pour la démo, on utilise l'appel le plus général possible (qui pourrait échouer
    // dans la version actuelle de ProduitClass si categoryId est requis).

    // On va plutôt implémenter la logique de base qui consiste à lister tous les produits
    // de l'utilisateur, SANS FILTRE PAR CATEGORIE.

    try {
      const q = query(
        collection(db, 'produits'),
        where('vendorId', '==', userId),
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const produits: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        produits.push({
          id: doc.id,
          code: data.code,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image || '',
          stock: data.stock || 0,
          categoryId: data.categoryId || '', // Clé categoryId réelle
          createdAt:
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toLocaleString()
              : '',
          vendorId: data.vendorId || '',
        });
      });

      return produits;
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  };

  // ✅ Récupérer tous les produits d'un utilisateur
  static getProduits = async (categoryId: string): Promise<Product[]> => {
    try {
      const userId = await authStorage.getUserId();

      if (!userId) {
        console.warn('Aucun userId trouvé');
        return [];
      }

      const q = query(
        collection(db, 'produits'),
        where('vendorId', '==', userId),
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const produits: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        produits.push({
          id: doc.id,
          code: data.code,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image || '',
          stock: data.stock || 0,
          categoryId: data.categoryId || '',
          createdAt:
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toLocaleString()
              : '',
          vendorId: data.vendorId || '',
        });
      });

      return produits;
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  };

  static getProduitsByvendorId = async (
    vendorId: string,
  ): Promise<Product[]> => {
    try {
      const q = query(
        collection(db, 'produits'),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const produits: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        produits.push({
          id: doc.id,
          code: data.code,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image || '',
          stock: data.stock || 0,
          categoryId: data.categoryId || '',
          createdAt:
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toLocaleString()
              : '',
          vendorId: data.vendorId || '',
        });
      });

      return produits;
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  };

  static getProduitsByvendorandcategorie = async (
    categoryId: string,
    userId: string,
  ): Promise<Product[]> => {
    try {
      const q = query(
        collection(db, 'produits'),
        where('vendorId', '==', userId),
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const produits: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        produits.push({
          id: doc.id,
          code: data.code,
          title: data.title,
          description: data.description || '',
          price: data.price,
          image: data.image || '',
          stock: data.stock || 0,
          categoryId: data.categoryId || '',
          createdAt:
            data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toLocaleString()
              : '',
          vendorId: data.vendorId || '',
        });
      });

      return produits;
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  };

  // ✅ Supprimer un produit par ID
  static deleteProduit = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'produits', id));
      return { success: true, message: 'Produit supprimé avec succès !' };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Une erreur est survenue lors de la suppression du produit',
      };
    }
  };

  // ✅ Mettre à jour un produit
  static updateProduit = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'produits', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: 'Produit mis à jour avec succès !' };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.message ||
          'Une erreur est survenue lors de la mise à jour du produit',
      };
    }
  };
}

// --- src/services/dataService.ts ---

// Assurez-vous que l'importation de db et authStorage est correcte
// import { db } from '../firebase/config';
// import { authStorage } from '@/utils/authStorage';
// import { Product } from '@/types/product';
// import { Categorie } from '@/types/categorie';

// NOTE: Ces fonctions doivent exister dans votre code réel.
// Nous allons les encapsuler ici pour la logique de regroupement.

// Simule l'appel à la fonction getAllProducts de votre ProduitClass
export async function fetchAllProductsForVendor(
  vendorId: string,
): Promise<Product[]> {
  // Votre code réel irait chercher tous les produits pour ce vendorId
  const q = query(
    collection(db, 'produits'),
    where('vendorId', '==', vendorId),
    orderBy('createdAt', 'desc'),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Product),
  );
}

// Simule l'appel à la fonction getCategories de votre CategorieClass
export async function fetchCategoriesForVendor(
  vendorId: string,
): Promise<Categorie[]> {
  // Votre code réel irait chercher toutes les catégories pour ce vendorId
  const q = query(
    collection(db, 'categories'),
    where('vendorId', '==', vendorId),
    orderBy('createdAt', 'asc'),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
        // Assurez-vous que le champ `name` est là
      } as Categorie),
  );
}

// --- Type de structure pour l'affichage ---
export type GroupedProducts = {
  categoryName: string;
  categoryId: string;
  products: Product[];
}[];

/**
 * Récupère tous les produits et catégories, puis regroupe les produits
 * par leur catégorie associée pour l'affichage.
 * @param vendorId ID du vendeur actuel
 * @returns Un tableau de GroupedProducts.
 */
export async function fetchProductsGroupedByCategory(
  vendorId: string,
): Promise<GroupedProducts> {
  if (!vendorId) return [];

  try {
    const [categories, allProducts] = await Promise.all([
      fetchCategoriesForVendor(vendorId),
      fetchAllProductsForVendor(vendorId),
    ]);

    const NO_CATEGORY_ID = 'no_category';

    // 1. Initialiser la map avec les catégories réelles
    const groupedMap = new Map<
      string,
      { categoryName: string; categoryId: string; products: Product[] }
    >();
    categories.forEach((cat) => {
      if (cat.id) {
        groupedMap.set(cat.id, {
          categoryName: cat.name || 'Catégorie non nommée',
          categoryId: cat.id,
          products: [],
        });
      }
    });

    // 2. Ajouter le groupe "Autres/Sans Catégorie"
    groupedMap.set(NO_CATEGORY_ID, {
      categoryName: 'Autres produits / Sans catégorie',
      categoryId: NO_CATEGORY_ID,
      products: [],
    });

    // 3. Regrouper les produits
    allProducts.forEach((product) => {
      const categoryId = product.categoryId || NO_CATEGORY_ID;

      // Ajout au groupe correspondant, sinon au groupe "Autres"
      const group =
        groupedMap.get(categoryId) || groupedMap.get(NO_CATEGORY_ID);
      if (group) {
        group.products.push(product);
      }
    });

    // 4. Filtrer les groupes vides et convertir en tableau
    const finalGroupedList = Array.from(groupedMap.values())
      .filter((group) => group.products.length > 0)
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    return finalGroupedList;
  } catch (error) {
    console.error('Erreur regroupement produits:', error);
    return [];
  }
}
