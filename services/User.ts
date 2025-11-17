import { supabase } from '@/config/supabaseClient';

export class UserBySuperBase {
  public Register = async (
    email: string,
    password: string,
    phone: string,
    name: string,
    role: string,
  ) => {
    try {
      // Crée l'utilisateur avec email, password et métadonnées (role + name)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name, phone }, // 👈 ajoute name et phone ici
        },
      });
      console.log(data, error);

      if (error) {
        return {
          success: false,
          data: error.message,
        };
      } else {
        return {
          success: true, // ✅ succès corrigé
          data: data.user, // contient l'objet utilisateur
        };
      }
    } catch (err: any) {
      console.log(err);
      return {
        success: false,
        data: err.message || 'Erreur inconnue',
      };
    }
  };
}
