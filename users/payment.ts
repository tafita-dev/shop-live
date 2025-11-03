import { db } from '@/firebase/config';
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export interface PaymentMethod {
  code: string;
  icon: string;
  name: string;
  id: string; // facultatif, ID du document
}

export interface OrderItem {
  image: string;
  price: number;
  productId: string;
  quantity: number;
  title: string;
}

interface DeliveryAddress {
  email: string;
  name: string;
  phone: string;
  street: string;
}

export interface Order {
  createdAt?: string; // ou Date si tu veux manipuler comme objet Date
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  paymentMethod: string;
  status: string;
  totalPrice: number;
  userId: string;
  vendorId: string;
}

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const colRef = collection(db, 'PayementMethode');
    const snapshot = await getDocs(colRef);

    const methods: PaymentMethod[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PaymentMethod[];

    return methods;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération :', error);
    return [];
  }
};

export const createOrder = async (order: Order) => {
  try {
    const colRef = collection(db, 'orders');
    const docRef = await addDoc(colRef, {
      ...order,
      status: 'pending', // statut initial
      createdAt: serverTimestamp(), // timestamp serveur
    });

    console.log(`✅ Order créé avec l'ID : ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'ordre :", error);
    throw error;
  }
};
