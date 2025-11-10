export interface User {
  name: string;
  email?: string;
  role?: 'client' | 'vendor' | 'livrer';
  phone?: string;
  createdAt?: any;
  photoURL?: string;
  authProviders?: {
    facebookId?: string;
    googleId?: string;
    emailPassword?: boolean;
  };
  password?: string;
  vendorId?: string;
}
