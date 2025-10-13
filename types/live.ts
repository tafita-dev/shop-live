export interface Live {
  id?: string; // optionnel : id Firestore
  profile: string; // URL ou chemin de l'image du vendeur
  title: string; // titre du live
  createdAt?: Date; // date Firestore convertie en Date
  facebookIframeUrl: string; // URL iframe du live Facebook public
  isActive: boolean; // true si live en cours
  vendorId: string; // id du vendeur
  vendorName: string; // nom du vendeur
}
