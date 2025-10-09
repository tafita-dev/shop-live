// utils/firebaseErrors.ts
export const formatFirebaseError = (error: any): string => {
  if (!error) return 'Une erreur inconnue est survenue.';

  // 🔍 Récupération du code possible
  const code =
    error.code ||
    error._errorCode ||
    error.message?.match(/auth\/[a-z-]+/)?.[0];

  if (!code) return 'Une erreur inconnue est survenue.';

  switch (code) {
    // 🔐 Inscription
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé. Veuillez en utiliser un autre.';
    case 'auth/invalid-email':
      return "L'adresse email est invalide.";
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';

    // 🔑 Connexion
    case 'auth/user-not-found':
      return "Aucun compte n'est associé à cet email.";
    case 'auth/wrong-password':
      return 'Le mot de passe est incorrect.';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe invalide.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives échouées. Réessayez plus tard.';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé. Veuillez contacter le support.';
    case 'auth/network-request-failed':
      return 'Problème de connexion réseau. Vérifiez votre connexion internet.';

    // ⚙️ Autres
    case 'permission-denied':
      return "Vous n'avez pas la permission d'effectuer cette action.";

    default:
      return error.message || 'Une erreur est survenue. Veuillez réessayer.';
  }
};
