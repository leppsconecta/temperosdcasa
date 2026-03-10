import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number | string;
  name: string;
  category: string;
  weight: string;
  quantity: number;
  variationName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number, variation?: any) => void;
  removeFromCart: (id: number | string, variationName?: string) => void;
  updateQuantity: (id: number | string, quantity: number, variationName?: string) => void;
  clearCart: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, quantity: number, variation?: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => 
        item.id === product.id && item.variationName === variation?.nome
      );
      
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id === product.id && item.variationName === variation?.nome)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            weight: variation ? `${variation.qtd || ''} ${variation.unidade || ''}` : product.weight,
            quantity: quantity,
            variationName: variation?.nome
          },
        ];
      }
    });
  };

  const removeFromCart = (id: number | string, variationName?: string) => {
    setCart((prevCart) => prevCart.filter((item) => 
      !(item.id === id && item.variationName === variationName)
    ));
  };

  const updateQuantity = (id: number | string, quantity: number, variationName?: string) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === id && item.variationName === variationName) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
