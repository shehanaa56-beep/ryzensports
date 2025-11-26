import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function Collection() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('section', '==', 'home'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching home products:', error);
        // fallback data
        setProducts([
          {
            id: '1',
            name: 'Galaxy 6 Shoes',
            category: 'Performance',
            currentPrice: '₹2400',
            originalPrice: '₹5999',
            discount: '60%',
            image: '/images/s1.png'
          },
          {
            id: '2',
            name: 'ADVANTAGE BASE SHOES',
            category: 'Sportswear',
            currentPrice: '₹2499',
            originalPrice: '₹6599',
            discount: '65%',
            image: '/images/s5.png'
          },
          {
            id: '3',
            name: 'Lite Racer 3.0 Shoes',
            category: 'Sportswear',
            currentPrice: '₹2240',
            originalPrice: '₹5599',
            discount: '60%',
            image: '/images/s6.png'
          },
          {
            id: '4',
            name: 'Ultraboost 20 Shoes',
            category: 'Performance',
            currentPrice: '₹7600',
            originalPrice: '₹18999',
            discount: '60%',
            image: '/images/s2.png'
          },
          {
            id: '5',
            name: 'Running Sport Shoes',
            category: 'Performance',
            currentPrice: '₹3000',
            originalPrice: '₹6000',
            discount: '50%',
            image: '/images/s3.png'
          }
        ]);
      }
    };
    fetchHomeProducts();
  }, []);

  const getGridStyle = () => {
    if (window.innerWidth <= 768) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      };
    } else {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
      };
    }
  };

  const [gridStyle, setGridStyle] = useState(getGridStyle());

  useEffect(() => {
    const handleResize = () => setGridStyle(getGridStyle());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#000' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          borderBottom: '1px solid #333',
          paddingBottom: '10px'
        }}
      >
        <h2
          style={{
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: '800',
            textTransform: 'uppercase'
          }}
        >
          BEST SELLER
        </h2>
        <a
          href="#shop"
          style={{
            color: '#fff',
            textDecoration: 'underline',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          Shop now
        </a>
      </div>

      {/* Product Grid */}
      <div style={gridStyle}>
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 0 10px rgba(0,0,0,0.6)',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Image Container */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#000',
                  height: '220px',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#f8f8f8',
                    color: '#000',
                    fontWeight: '600',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  Sale
                </span>

                <button
                  onClick={(e) => {
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
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    style={{
                      width: '20px',
                      height: '20px',
                      fill:
                        localStorage.getItem('wishlist') &&
                        JSON.parse(localStorage.getItem('wishlist')).some(
                          item => item.id === product.id
                        )
                          ? 'red'
                          : '#fff',
                    }}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 
                    12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 
                    0 3.41.81 4.5 2.09C13.09 3.81 14.76 
                    3 16.5 3 19.58 3 22 5.42 22 
                    8.5c0 3.78-3.4 6.86-8.55 
                    11.54L12 21.35z" />
                  </svg>
                </button>

                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '110%',
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: 'block',
                  }}
                />
              </div>

              {/* Product Info */}
              <div
                style={{
                  backgroundColor: '#000',
                  padding: '10px',
                  textAlign: 'center',
                  borderTop: '1px solid #333',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.name}
                </h3>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#bbb',
                    marginBottom: '6px',
                  }}
                >
                  {product.category}
                </p>

                {/* ✅ Updated Price Section */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                  }}
                >
                  <span
                    style={{
                      color: '#c7ad38ff',
                      fontWeight: '700',
                      fontSize: '1rem',
                    }}
                  >
                    {product.currentPrice.replace('₹', '')}
                  </span>

                  <span
                    style={{
                      textDecoration: 'line-through',
                      color: '#999',
                      fontSize: '0.9rem',
                    }}
                  >
                    {product.originalPrice.replace('₹', '')}
                  </span>

                  <span
                    style={{
                      backgroundColor: '#e0ceceff',
                      color: '#000',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {product.discount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Collection;
