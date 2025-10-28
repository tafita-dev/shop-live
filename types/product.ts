// types/product.ts
export interface Product {
  id?: string | number; // Optional si l'ID est généré par la base de données
  vendorId?: string; // ID du vendeur
  title: string; // Titre du produit
  description: string; // Description du produit
  image?: string; // URL de l'image du produit
  price: number; // Prix en Ariary
  stock?: number; // Quantité en stock
  createdAt?: Date; // Date de création
  code: string;
  categoryId: string;
}
