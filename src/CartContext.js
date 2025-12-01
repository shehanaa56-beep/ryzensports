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

  // ---------------------------------------------------
  // 1️⃣ LOAD CART ON APP START
  // ---------------------------------------------------
  useEffect(() => {
    if (isLoggedIn && user) {
      // 🔥 Logged-in → Load from Firestore in realtime
      const userEmail = user.email || user.username;
      const cartDocRef = doc(db, 'carts', userEmail);

      const unsubscribe = onSnapshot(
        cartDocRef,
        (docSnap) => {
          let firestoreCart = [];
          if (docSnap.exists()) {
            firestoreCart = docSnap.data().items || [];
          }

          isFromListener.current = true;
          setCartItems(firestoreCart);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore cart error:", error);
          setCartItems([]);
          setLoading(false);
        }
      );

      return () => unsubscribe();

    } else {
      // 🔥 Guest → Load from localStorage
      const savedCart = localStorage.getItem("guestCart");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  // ---------------------------------------------------
  // 2️⃣ SAVE CART AFTER ANY CHANGE
  // ---------------------------------------------------
  useEffect(() => {
    if (loading) return;

    if (isLoggedIn && user) {
      // 🔥 Logged-in → Save to Firestore
      if (!isFromListener.current) {
        const userEmail = user.email || user.username;
        const cartDocRef = doc(db, 'carts', userEmail);

        const saveCart = async () => {
          try {
            await setDoc(cartDocRef, { items: cartItems }, { merge: true });
          } catch (err) {
            console.error("Error saving Firestore cart:", err);
          }
        };
        saveCart();
      }
      isFromListener.current = false;

    } else {
      // 🔥 Guest → Save to localStorage
      localStorage.setItem("guestCart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn, user, loading]);

  // ---------------------------------------------------
  // 3️⃣ CART ACTIONS
  // ---------------------------------------------------
  const addToCart = (product, size) => {
    const existingItem = cartItems.find(
      item => item.id === product.id && item.size === size
    );

    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
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
      setCartItems(
        cartItems.map(item =>
          item.id === id && item.size === size
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(
        item.currentPrice.replace("₹", "").replace(",", "")
      );
      return total + price * item.quantity;
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isLoggedIn) localStorage.removeItem("guestCart");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
