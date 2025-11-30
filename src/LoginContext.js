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

  const usersCacheRef = useRef({});

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(userData.isAdmin || false);
    }

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
    } catch (err) {}
  }, []);

  const login = async (username, password) => {
    if (username === "ryzensports@gmail.com" && password === "ryzen2244") {
      const adminUser = {
        username,
        isAdmin: true,
        loginTime: new Date().toISOString()
      };
      setUser(adminUser);
      setIsLoggedIn(true);
      setIsAdmin(true);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      setModalOpen(false);
      return { success: true };
    }

    const usersMap = usersCacheRef.current || {};
    const found = usersMap[username];

    if (found && found.password === password) {
      const loggedInUser = { ...found, loginTime: new Date().toISOString() };
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setIsAdmin(found.isAdmin || false);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      setModalOpen(false);
      return { success: true };
    }

    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        usersCacheRef.current[username] = user;

        const loggedInUser = { ...user, loginTime: new Date().toISOString() };
        setUser(loggedInUser);
        setIsLoggedIn(true);
        setIsAdmin(user.isAdmin || false);

        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        setModalOpen(false);
        return { success: true };
      }
    } catch (err) {}

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password === password) {
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
    } catch (err) {}

    return { success: false, error: 'Invalid username or password' };
  };

  const register = async (username, email, password, phone) => {
    const exists = await checkUserExists(username, email);
    if (exists) {
      return { success: false, error: 'User already exists' };
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      phone,
      password,
      isAdmin: false,
      registrationTime: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'users'), newUser);

      const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      usersCacheRef.current[username] = newUser;
    } catch (err) {
      return { success: false, error: 'Registration failed' };
    }

    const loggedInUser = { ...newUser, loginTime: new Date().toISOString() };
    setUser(loggedInUser);
    setIsLoggedIn(true);
    setIsAdmin(false);

    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);

    // ⭐ DO NOT clear guestCart here
    localStorage.removeItem('currentUser');
  };

  const checkUserExists = async (username, email) => {
    try {
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('username', '==', username));
      const q2 = query(usersRef, where('email', '==', email));

      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      if (!s1.empty || !s2.empty) return true;

    } catch (err) {}

    const usersMap = usersCacheRef.current || {};
    return (
      usersMap[username] ||
      Object.values(usersMap).some(u => u.email === email)
    );
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <LoginContext.Provider
      value={{
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
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginProvider;
