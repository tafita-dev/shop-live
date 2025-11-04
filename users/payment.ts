import { db } from '@/firebase/config';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
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

export const createOrderWithReservations = async (order: Order) => {
  try {
    const batch = writeBatch(db);

    // 1️⃣ Référence du nouvel order
    const orderRef = doc(collection(db, 'orders'));
    batch.set(orderRef, {
      ...order,
      status: 'payer',
      createdAt: serverTimestamp(),
    });
    const id = orderRef.id;

    // 2️⃣ Création des reservations
    const reservationsRef = collection(db, 'reservation');
    order.items.forEach((item) => {
      const reservationRef = doc(reservationsRef); // chaque doc a son ID auto-généré
      batch.set(reservationRef, {
        orderId: orderRef.id,
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        status: 'réservé',
        userId: order.userId,
        vendorId: order.vendorId,
        createdAt: serverTimestamp(),
      });
    });

    // 3️⃣ Commit du batch
    await batch.commit();

    console.log(orderRef.id);
    return {
      success: true,
      data: orderRef.id,
    };
  } catch (error) {
    return {
      success: false,
      data: 'ereor',
    };
  }
};
