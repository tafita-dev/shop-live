import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = 'user_cart';

// 🔹 Récupérer tout le panier
export const getAllCarts = async () => {
  const data = await AsyncStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : {};
};

// 🔹 Récupérer le panier d’un vendeur spécifique
export const getCartByVendor = async (vendorId: string) => {
  const all = await getAllCarts();
  return all[vendorId] || [];
};

// 🔹 Ajouter un produit dans le panier du vendeur (avec quantité +1 si déjà présent)
export const addToCart = async (vendorId: string, product: any) => {
  const all = await getAllCarts();
  const cart = all[vendorId] || [];

  const existing = cart.find((item: any) => item.id === product.id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1; // Incrémenter la quantité
  } else {
    cart.push({ ...product, quantity: 1 }); // Ajouter avec quantité initiale
  }

  all[vendorId] = cart;
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(all));
  return cart;
};

// 🔹 Diminuer la quantité d’un produit
export const decreaseQuantity = async (vendorId: string, productId: string) => {
  const all = await getAllCarts();
  const cart = all[vendorId] || [];

  const index = cart.findIndex((item: any) => item.id === productId);
  if (index !== -1) {
    const item = cart[index];
    item.quantity = (item.quantity || 1) - 1;
    if (item.quantity <= 0) {
      cart.splice(index, 1); // Retirer du panier si quantité = 0
    }
  }

  all[vendorId] = cart;
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(all));
  return cart;
};

// 🔹 Augmenter la quantité d’un produit
export const increaseQuantity = async (vendorId: string, productId: string) => {
  const all = await getAllCarts();
  const cart = all[vendorId] || [];

  const item = cart.find((p: any) => p.id === productId);
  if (item) {
    item.quantity = (item.quantity || 1) + 1;
  }

  all[vendorId] = cart;
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(all));
  return cart;
};

// 🔹 Supprimer un produit
export const removeFromCart = async (vendorId: string, id: string) => {
  const all = await getAllCarts();
  console.log(all);
  const cart = all[vendorId] || [];
  console.log(cart);
  const updated = cart.filter((item: any) => item.id !== id);
  console.log(all);
  all[vendorId] = updated;
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(all));
  return updated;
};

// 🔹 Supprimer tout le panier d’un vendeur
export const clearCartByVendor = async (vendorId: string) => {
  const all = await getAllCarts();
  delete all[vendorId];
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(all));
};

// 🔹 Compter les articles du panier d’un vendeur
export const getCartCountByVendor = async (vendorId: string) => {
  const cart = await getCartByVendor(vendorId);
  return cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
};
