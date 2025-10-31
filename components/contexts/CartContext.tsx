import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartCountByVendor } from '@/utils/cartStorage';

interface CartContextProps {
  cartCount: number;
  refreshCart: (vendorId: string) => Promise<void>;
}

const CartContext = createContext<CartContextProps>({
  cartCount: 0,
  refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async (vendorId: string) => {
    const count = await getCartCountByVendor(vendorId);
    setCartCount(count);
  };

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
