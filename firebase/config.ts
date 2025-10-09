// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDL58VdcftBVJwB7hzGnWz-bebIRUUDNFk',
  authDomain: 'shoplive-9a270.firebaseapp.com',
  projectId: 'shoplive-9a270',
  storageBucket: 'shoplive-9a270.firebasestorage.app',
  messagingSenderId: '361884207411',
  appId: '1:361884207411:web:58d224951a8146f92ad646',
  measurementId: 'G-V2Q5YKDCYN',
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: [],
});
export const db = getFirestore(app);
