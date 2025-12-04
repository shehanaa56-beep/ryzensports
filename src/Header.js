/* ===========================
   UPDATED HEADER.JS (FINAL)
=========================== */

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
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { isLoggedIn, isAdmin, logout, modalOpen, openModal, closeModal } = useLogin();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ suggestions: [], products: [] });
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
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ⭐ FINAL AUTO-GENERATING SEARCH FUNCTION */
  const searchProducts = async (term) => {
    if (!term.trim()) {
      setSearchResults({ suggestions: [], products: [] });
      return;
    }

    try {
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);

      const lower = term.toLowerCase();

      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ⭐ MATCH PRODUCTS
      const matched = allProducts.filter((p) =>
        p.category?.toLowerCase().includes(lower)
      );

      // ⭐ SMART AUTO-GENERATED SUGGESTIONS
      let autoSuggestions = [];

      matched.forEach((p) => {
        const cat = p.category?.toLowerCase();
        if (!cat) return;

        autoSuggestions.push(cat);
        autoSuggestions.push(`${cat} jersey`);
        autoSuggestions.push(`buy ${cat}`);
      });

      // Remove duplicates + limit
      autoSuggestions = [...new Set(autoSuggestions)].slice(0, 6);

      setSearchResults({
        suggestions: autoSuggestions,
        products: matched,
      });

    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => searchProducts(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);


  const navLinkStyle = {
    color: '#000',
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
          backgroundColor: '#f8f6f6ff',
          color: '#000',
          padding: '7px 0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 1000,
        }}>
        <div className="header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto', padding: '0 20px', gap: '10px' }}>

          {/* LOGO */}
          <div className="logo" style={{ flex: '0 0 auto', marginRight: '40px' }}>
            <Link to="/">
              <img src="/images/ryz.png" alt="Ryzen Sport Logo" className="logo-img" style={{ width: 'auto', cursor: 'pointer' }} />
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="desktop-nav" style={{ flex: 1, justifyContent: 'center' }}>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '35px' }}>
              <li><Link to="/" style={navLinkStyle}>HOME</Link></li>
              <li><Link to="/sizechart" style={navLinkStyle}>SIZECHART</Link></li>
              <li><Link to="/faq" style={navLinkStyle}>FAQ</Link></li>
              <li><Link to="/customer-support" style={navLinkStyle}>CUSTOMER SUPPORT</Link></li>
              <li><Link to="/outlet" style={navLinkStyle}>OUTLET</Link></li>
            </ul>
          </nav>

          {/* RIGHT SECTION */}
          <div className="right-section" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>

            <div style={{ position: 'relative' }} ref={searchRef}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                className="search-input"
                style={{ background: 'transparent', border: '1px solid #333', borderRadius: '20px', color: '#040404ff' }}
              />

              {/* ⭐ UPDATED: Pass NEW searchResults structure */}
              {showResults && searchTerm && (
                <SearchResults
                  results={searchResults}
                  onClose={() => { setShowResults(false); setSearchTerm(''); }}
                />
              )}

              {/* WISHLIST */}
              <Link to="/wishlist">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#000" strokeWidth="2" fill="none" />
                </svg>
              </Link>
            </div>

            {/* CART */}
            <Link to="/cart" style={{ position: 'relative' }}>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M6 2L3 6v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="#000" strokeWidth="2" fill="none" />
                <line x1="3" y1="6" x2="21" y2="6" stroke="#000" strokeWidth="2" />
                <path d="M16 10a4 4 0 0 1-8 0" stroke="#000" strokeWidth="2" />
              </svg>

              {cartItems.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: '#000', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* LOGIN */}
            <div className="desktop-login">
              {isLoggedIn && isAdmin && <Link to="/admin" style={{ color: '#000', textDecoration: 'none' }}>Admin</Link>}

              <button onClick={isLoggedIn ? logout : openModal} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}>
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            </div>
          </div>

          {/* MOBILE MENU ICON */}
          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </div>

        </div>
      </header>

      {/* ⭐ MOBILE MENU */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <li><Link to="/" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>HOME</Link></li>
                            <li><Link to="/sizechart" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>SIZECHART</Link></li>
              <li><Link to="/faq" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>FAQ</Link></li>
              <li><Link to="/customer-support" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>CUSTOMER SUPPORT</Link></li>
              <li><Link to="/outlet" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>OUTLET</Link></li>

              <li>
                <button
                  className="mobile-cat-btn"style={{color:"#000"}}
                  onClick={() => {
                    navigate("/outlet", { state: { section: "fullsleeves" } });
                    setIsMenuOpen(false);
                  }}
                >
                  FULL SLEEVES
                </button>
              </li>

              <li>
                <button
                  className="mobile-cat-btn" style={{color:"#000"}}
                  onClick={() => {
                    navigate("/outlet", { state: { section: "halfsleeves" } });
                    setIsMenuOpen(false);
                  }}
                >
                  HALF SLEEVES
                </button>
              </li>

              <li>
                <button
                  className="mobile-cat-btn" style={{color:"#000"}}
                  onClick={() => {
                    navigate("/outlet", { state: { section: "oversized" } });
                    setIsMenuOpen(false);
                  }}
                >
                  OVERSIZED
                </button>
              </li>

              {isLoggedIn && isAdmin && (
                <li><Link to="/admin" style={navLinkStyle} onClick={() => setIsMenuOpen(false)}>ADMIN</Link></li>
              )}

              <li>
                <button className="mobile-login-btn"  style={{color:"#000"}} onClick={() => { isLoggedIn ? logout() : openModal(); setIsMenuOpen(false); }}>
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
