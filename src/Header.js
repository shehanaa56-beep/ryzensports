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
  fontSize: '15px',
  padding: '8px 12px',
  letterSpacing: '0.3px',
  whiteSpace: 'nowrap',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
              <img src="/images/ryzen.png" alt="Ryzen Sport Logo" className="logo-img" style={{ width: '50px',height:'30px', cursor: 'pointer' }} />
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="desktop-nav" style={{ flex: 1, justifyContent: 'center' }}>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '35px' }}>
              <li><Link to="/" style={navLinkStyle}>Home</Link></li>
              <li><Link to="/sizechart" style={navLinkStyle}>Sizechart</Link></li>
              <li><Link to="/faq" style={navLinkStyle}>FAQ</Link></li>
              <li><Link to="/customer-support" style={navLinkStyle}>Customer Support</Link></li>
              <li><Link to="/outlet" style={navLinkStyle}>Outlet</Link></li>
            </ul>
          </nav>

          {/* RIGHT SECTION */}
         {/* RIGHT SECTION */}
<div
  className="right-section"
  style={{
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }}
>

  {/* SEARCH + WISHLIST */}
  <div className="search-wrapper" ref={searchRef}>
    <i
      className="bi bi-search header-icon"
      onClick={() => setShowResults((prev) => !prev)}
    ></i>

    {showResults && (
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus
        className="search-input"
      />
    )}

    {showResults && searchTerm && (
      <SearchResults
        results={searchResults}
        onClose={() => {
          setShowResults(false);
          setSearchTerm('');
        }}
      />
    )}

    <Link to="/wishlist" className="header-icon">
      <i className="bi bi-heart"></i>
    </Link>
  </div>

  {/* CART */}
  <Link to="/cart" className="header-icon cart-icon">
    <i className="bi bi-bag"></i>
    {cartItems.length > 0 && (
      <span className="cart-count">{cartItems.length}</span>
    )}
  </Link>

  {/* MENU ICON */}
  <i
    className="bi bi-list hamburger-icon"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
  ></i>

  {/* DESKTOP LOGIN (hidden on mobile via CSS) */}
  <div className="desktop-login desktop-only">
    {isLoggedIn && isAdmin && (
      <Link to="/admin" style={{ color: '#000', textDecoration: 'none' }}>
        Admin
      </Link>
    )}

    <button
      onClick={isLoggedIn ? logout : openModal}
      style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}
    >
      {isLoggedIn ? 'Logout' : 'Login'}
    </button>
  </div>

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
