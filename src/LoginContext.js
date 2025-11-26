import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const LoginContext = createContext();

export const useLogin = () => {
  return useContext(LoginContext);
};

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  // Cache users in a ref to avoid parsing localStorage on every login call
  const usersCacheRef = useRef({});

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(userData.isAdmin || false);
    }
    // Load users into in-memory cache once to avoid repeated JSON.parse on login
    try {
      const usersJson = localStorage.getItem('users');
      if (usersJson) {
        const usersArr = JSON.parse(usersJson);
        const map = {};
        usersArr.forEach(u => {
          if (u && u.username) map[u.username] = u;
        });
        usersCacheRef.current = map;
      } else {
        usersCacheRef.current = {};
      }
    } catch (err) {
      console.error('Failed to load users cache:', err);
      usersCacheRef.current = {};
    }
  }, []);

  const login = async (username, password) => {
    // Check for admin credentials
    if (username === "ryzensports@gmail.com" && password === "ryzen2244") {
      const adminUser = {
        username: username,
        isAdmin: true,
        loginTime: new Date().toISOString()
      };
      setUser(adminUser);
      setIsLoggedIn(true);
      setIsAdmin(true);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      setModalOpen(false);
      return { success: true };
    } else {
      // Regular user login — use in-memory cache to avoid parsing large localStorage repeatedly
      const usersMap = usersCacheRef.current || {};
      const found = usersMap[username];
      if (found && found.password === password) {
        const loggedInUser = {
          ...found,
          loginTime: new Date().toISOString()
        };
        setUser(loggedInUser);
        setIsLoggedIn(true);
        setIsAdmin(found.isAdmin || false);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        setModalOpen(false);
        return { success: true };
      }

      // Fallback: if cache miss, try parsing from localStorage (robustness)
      try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          // update cache for future
          usersCacheRef.current[username] = user;
          const loggedInUser = { ...user, loginTime: new Date().toISOString() };
          setUser(loggedInUser);
          setIsLoggedIn(true);
          setIsAdmin(user.isAdmin || false);
          localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
          setModalOpen(false);
          return { success: true };
        }
      } catch (err) {
        console.error('Error during fallback login parse:', err);
      }

      // If not found in localStorage, check Firestore
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          if (userData.password === password) {
            // update cache and localStorage
            usersCacheRef.current[username] = userData;
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
            existingUsers.push(userData);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            const loggedInUser = { ...userData, loginTime: new Date().toISOString() };
            setUser(loggedInUser);
            setIsLoggedIn(true);
            setIsAdmin(userData.isAdmin || false);
            localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
            setModalOpen(false);
            return { success: true };
          }
        }
      } catch (error) {
        console.error('Error during Firestore login:', error);
      }

      return { success: false, error: 'Invalid username or password' };
    }
  };

  const register = async (username, email, password) => {
    // Check existence in Firestore and localStorage
    const exists = await checkUserExists(username, email);
    if (exists) {
      return { success: false, error: 'User already exists' };
    }

    const newUser = {
      id: Date.now(),
      username: username,
      email: email,
      password: password, // In real app, hash this
      isAdmin: false,
      registrationTime: new Date().toISOString()
    };

    try {
      // Save to Firestore
      await addDoc(collection(db, 'users'), newUser);

      // Also save to localStorage for caching
      const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      // update in-memory cache
      usersCacheRef.current = usersCacheRef.current || {};
      usersCacheRef.current[username] = newUser;
    } catch (err) {
      console.error('Error saving new user:', err);
      return { success: false, error: 'Registration failed' };
    }

    const loggedInUser = {
      ...newUser,
      loginTime: new Date().toISOString()
    };
    setUser(loggedInUser);
    setIsLoggedIn(true);
    setIsAdmin(false);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setModalOpen(false);
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  const checkUserExists = async (username, email) => {
    try {
      // Check in Firestore
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('username', '==', username));
      const q2 = query(usersRef, where('email', '==', email));
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      if (!snapshot1.empty || !snapshot2.empty) {
        return true;
      }
    } catch (error) {
      console.error('Error checking user existence in Firestore:', error);
    }

    // Fallback to localStorage cache
    const usersMap = usersCacheRef.current || {};
    return usersMap[username] || Object.values(usersMap).some(u => u.email === email);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <LoginContext.Provider value={{
      isLoggedIn,
      isAdmin,
      user,
      login,
      register,
      logout,
      checkUserExists,
      modalOpen,
      openModal,
      closeModal
    }}>
      {children}
    </LoginContext.Provider>
  );
};
