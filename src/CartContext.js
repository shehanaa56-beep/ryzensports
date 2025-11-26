import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useLogin } from './LoginContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { user, isLoggedIn } = useLogin();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFromListener = useRef(false);



  // Load cart from Firestore when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      const userEmail = user.email || user.username;
      const cartDocRef = doc(db, 'carts', userEmail);

      // Set up real-time listener for cart
      const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
        let firestoreCart = [];
        if (docSnap.exists()) {
          const cartData = docSnap.data();
          firestoreCart = cartData.items || [];
          console.log('Loaded cart from Firestore:', firestoreCart);
        } else {
          console.log('No cart found in Firestore for user');
        }

        isFromListener.current = true;
        setCartItems(firestoreCart);
        setLoading(false);
      }, (error) => {
        console.error('Error loading cart from Firestore:', error);
        setCartItems([]);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!isLoggedIn) {
      // If not logged in, cart is empty
      setCartItems([]);
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  // Save cart to Firestore whenever cartItems changes (only if logged in and not from listener)
  useEffect(() => {
    if (isLoggedIn && user && !loading && !isFromListener.current) {
      const userEmail = user.email || user.username;
      const cartDocRef = doc(db, 'carts', userEmail);

      const saveCart = async () => {
        try {
          await setDoc(cartDocRef, { items: cartItems }, { merge: true });
          console.log('Cart saved to Firestore:', cartItems);
        } catch (error) {
          console.error('Error saving cart to Firestore:', error);
        }
      };

      saveCart();
    }
    isFromListener.current = false;
  }, [cartItems, isLoggedIn, user, loading]);

  const addToCart = (product, size) => {
    const existingItem = cartItems.find(item => item.id === product.id && item.size === size);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, size, quantity: 1 }]);
    }
  };

  const removeFromCart = (id, size) => {
    setCartItems(cartItems.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.currentPrice.replace('₹', '').replace(',', ''));
      return total + price * item.quantity;
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalPrice,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
