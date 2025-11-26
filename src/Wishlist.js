import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <div className="wishlist-count">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Add items to your wishlist to see them here</p>
            <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="wishlist-items">
            {wishlistItems.map((item) => (
              <div key={item.id} className="wishlist-item">
                <div className="wishlist-item-image">
                  <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} />
                  </Link>
                </div>
                <div className="wishlist-item-details">
                  <h3 className="wishlist-item-name">
                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p className="wishlist-item-category">{item.category}</p>
                  <div className="wishlist-item-price">
                    <span className="current-price">{item.currentPrice}</span>
                    <span className="original-price">{item.originalPrice}</span>
                    <span className="discount">{item.discount}</span>
                  </div>
                </div>
                <div className="wishlist-item-actions">
                  <button
                    className="remove-from-wishlist-btn"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                  <Link to={`/product/${item.id}`} className="view-product-btn">
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
