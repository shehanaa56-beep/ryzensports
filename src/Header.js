import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useLogin } from './LoginContext';
import LoginModal from './LoginModal';
import SearchResults from './SearchResults';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './Header.css';

function Header() {
  const { cartItems } = useCart();
  const { isLoggedIn, isAdmin, logout, modalOpen, openModal, closeModal } = useLogin();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchProducts = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      // Get all products first
      const querySnapshot = await getDocs(productsRef);
      
      // Filter products where category includes the search term (case insensitive)
      const searchTermLower = term.toLowerCase();
      const results = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => 
          product.category && 
          product.category.toLowerCase().includes(searchTermLower)
        );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const navLinkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    padding: '8px 12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  };

  return (
    <>
      <header
        style={{
          backgroundColor: '#000',
          color: '#fff',
          padding: '15px 0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 1000,
        }}
      >
        <div
          className="header-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
            gap: '10px',
          }}
        >
          {/* Left: Logo */}
          <div className="logo" style={{ flex: '0 0 auto', marginRight: '40px' }}>
            <Link to="/">
              <img
                src="/images/r2.png"
                alt="Ryzen Sport Logo"
                className="logo-img"
                style={{ width: 'auto', cursor: 'pointer' }}
              />
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="desktop-nav" style={{ flex: 1, justifyContent: 'center' }}>
            <ul
              style={{
                display: 'flex',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                gap: '35px',
              }}
            >
              <li><Link to="/" style={navLinkStyle}>HOME</Link></li>
              <li><Link to="/faq" style={navLinkStyle}>FAQ</Link></li>
              <li><Link to="/customer-support" style={navLinkStyle}>CUSTOMER SUPPORT</Link></li>
              <li><Link to="/outlet" style={navLinkStyle}>OUTLET</Link></li>
            </ul>
          </nav>

          {/* Right: Search + Icons + Login */}
          <div
            className="right-section"
            style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }} ref={searchRef}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="search-input"
                style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '20px',
                  color: '#fff',
                  transition: 'border-color 0.3s',
                }}
              />
              {showResults && searchTerm && (
                <SearchResults
                  results={searchResults}
                  onClose={() => {
                    setShowResults(false);
                    setSearchTerm('');
                  }}
                />
              )}

              {/* Heart Icon */}
              <Link to="/wishlist" style={{ display: 'inline-block' }}>
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon"
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </Link>
            </div>

            {/* Bag Icon */}
            <Link to="/cart" style={{ position: 'relative', display: 'inline-block' }}>
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                style={{ cursor: 'pointer' }}
              >
                <path
                  d="M6 2L3 6v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                />
                <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="2" />
                <path d="M16 10a4 4 0 0 1-8 0" stroke="#fff" strokeWidth="2" />
              </svg>
              {cartItems.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {cartItems.length}
                </span>
              )}
            </Link>



            {/* Login/Logout Button */}
            <div className="desktop-login" style={{ alignItems: 'center', gap: '15px' }}>
              {isLoggedIn && isAdmin && (
                <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  Admin
                </Link>
              )}
              <button
                onClick={isLoggedIn ? logout : openModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 12px',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '24px', height: '24px' }}
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="2" fill="none" />
                </svg>
                <span>{isLoggedIn ? 'Logout' : 'Login'}</span>
              </button>
            </div>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              flexDirection: 'column',
              cursor: 'pointer',
              gap: '4px',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.3s',
            }}
          >
            <span style={{ width: '10px', height: '2px', backgroundColor: '#fff', transition: '0.3s' }}></span>
            <span style={{ width: '10px', height: '2px', backgroundColor: '#fff', transition: '0.3s' }}></span>
            <span style={{ width: '10px', height: '2px', backgroundColor: '#fff', transition: '0.3s' }}></span>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav style={{ display: 'flex', justifyContent: 'center' }}>
            <ul
              style={{
                display: 'flex',
                flexDirection: 'column',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                gap: '20px',
                alignItems: 'center',
              }}
            >
              <li><Link to="/" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>HOME</Link></li>
              <li><Link to="/faq" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>FAQ</Link></li>
              <li><Link to="/customer-support" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>CUSTOMER SUPPORT</Link></li>
              <li><Link to="/outlet" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>OUTLET</Link></li>
              {isLoggedIn && (
                <li>
                  <Link to="/order-history" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: '20px', height: '20px' }}
                    >
                      <path
                        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                        stroke="#fff"
                        strokeWidth="2"
                        fill="none"
                      />
                      <polyline points="9,22 9,12 15,12 15,22" stroke="#fff" strokeWidth="2" fill="none" />
                    </svg>
                  </Link>
                </li>
              )}
              {isLoggedIn && isAdmin && (
                <li><Link to="/admin" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>ADMIN</Link></li>
              )}
              <li>
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      logout();
                    } else {
                      openModal();
                    }
                    setIsMenuOpen(false);
                  }}
                  style={{
                    ...navLinkStyle,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="#fff"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="2" fill="none" />
                  </svg>
                  {isLoggedIn ? 'LOGOUT' : 'LOGIN'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <LoginModal isOpen={modalOpen} onClose={closeModal} />
    </>
  );
}

export default Header;
