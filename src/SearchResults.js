import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchResults.css';

function SearchResults({ results, onClose }) {
  const navigate = useNavigate();

  const handleSelectProduct = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  if (results.length === 0) {
    return (
      <div className="search-results-container">
        <div className="no-results">
          No products found
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      {results.map((product) => (
        <div
          key={product.id}
          className="search-result-item"
          onClick={() => handleSelectProduct(product.id)}
        >
          <img
            src={product.image}
            alt={product.category}
            className="search-result-image"
          />
          <div className="search-result-info">
            <div className="search-result-name">{product.category}</div>
            <div className="search-result-price">
              ₹{product.currentPrice} {product.originalPrice && (
                <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '8px' }}>
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;