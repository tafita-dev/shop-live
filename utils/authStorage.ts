// firebaseService.ts
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_ID_KEY = '@user_id';
const USER_NAME_KEY = '@user_name';
const USER_PHOTO_KEY = '@user_photo';
const USER_ROLE_KEY = '@user_role';

export const authStorage = {
  saveAuthToken: async (token: string) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  getAuthToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },
  saveUserId: async (userId: string) => {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  },
  saverole: async (role: string) => {
    await AsyncStorage.setItem(USER_ROLE_KEY, role);
  },
  getUserId: async (): Promise<string | null> => {
    return AsyncStorage.getItem(USER_ID_KEY);
  },
  getuserRole: async (): Promise<string | null> => {
    return AsyncStorage.getItem(USER_ROLE_KEY);
  },
  saveUserInfo: async (name: string, photoURL: string) => {
    await AsyncStorage.multiSet([
      [USER_NAME_KEY, name],
      [USER_PHOTO_KEY, photoURL],
    ]);
  },
  getUserInfo: async (): Promise<{
    name: string | null;
    photoURL: string | null;
  }> => {
    const values = await AsyncStorage.multiGet([USER_NAME_KEY, USER_PHOTO_KEY]);
    return {
      name: values[0][1],
      photoURL: values[1][1],
    };
  },
  clearAuthData: async () => {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      USER_ID_KEY,
      USER_NAME_KEY,
      USER_PHOTO_KEY,
    ]);
  },
};

import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const fetchFirebaseUserInfo = async () => {
  const auth = getAuth();
  console.log(auth);
  const user = auth.currentUser;

  if (!user) {
    return { name: '', photoURL: '', email: '', role: 'client', phone: '' };
  }

  const userId = user.uid;
  const db = getFirestore();

  // Récupération du document correspondant à userId dans la collection "users"
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);

  let name = 'Utilisateur';
  let photoURL =
    'https://res.cloudinary.com/dfywekuna/image/upload/v1736843708/20171206_01_jx8oyo.jpg';
  let email = '';
  let role = 'client';
  let phone = '';

  if (userSnap.exists()) {
    const data = userSnap.data();

    name = data.name || name;
    photoURL = data.photoURL || photoURL;
    email = data.email || email;
    role = data.role || role;
    phone = data.phone || phone;
  }

  return { name, photoURL, email, role, phone };
};
