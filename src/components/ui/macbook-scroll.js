import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Badge = () => {
  return (
    <div className="badge">
      <span>New</span>
    </div>
  );
};

export const MacbookScroll = ({ title, src, badge, product }) => {
  const navigate = useNavigate();

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const savedWishlist = localStorage.getItem('wishlist');
    let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (!isInWishlist) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    navigate('/wishlist');
  };

  return (
    <div className="macbook-scroll-item">
      <div className="product-image-container">
        <button className="wishlist-btn" onClick={handleWishlistClick}>
          <svg className={`wishlist-icon ${localStorage.getItem('wishlist') && JSON.parse(localStorage.getItem('wishlist')).some(item => item.id === product.id) ? 'filled' : ''}`} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <img src={src} alt={title} />
      </div>
      <h3>{title}</h3>
      {badge}
    </div>
  );
};

export default MacbookScroll;
