import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, 'products'), where('__name__', '==', id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data();
          setProduct({
            id: querySnapshot.docs[0].id,
            ...productData
          });
        } else {
          // Fallback to static data if Firebase doesn't have the product
          const staticProducts = [
            {
              id: 1,
              name: 'Galaxy 6 Shoes',
              category: 'Performance',
              currentPrice: '₹2 400.00',
              originalPrice: '₹5 999.00',
              discount: '-60%',
              image: '/images/s1.png',
              image2: '/images/s1.png',
              image3: '/images/s1.png',
              sizes: {
                XS: 10,
                S: 10,
                M: 10,
                L: 10,
                XL: 10,
                '2XL': 10,
                '3XL': 10,
                '4XL': 10
              },
              description: 'High-performance shoes for athletes.'
            },
            // Add more static products as needed
          ];
          const foundProduct = staticProducts.find(p => p.id === parseInt(id));
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to static data
        const staticProducts = [
          {
            id: 1,
            name: 'Galaxy 6 Shoes',
            category: 'Performance',
            currentPrice: '₹2 400.00',
            originalPrice: '₹5 999.00',
            discount: '-60%',
            image: '/images/s1.png',
            image2: '/images/s1.png',
            image3: '/images/s1.png',
            sizes: {
              XS: 10,
              S: 10,
              M: 10,
              L: 10,
              XL: 10,
              '2XL': 10,
              '3XL': 10,
              '4XL': 10
            },
            description: 'High-performance shoes for athletes.'
          },
        ];
        const foundProduct = staticProducts.find(p => p.id === parseInt(id));
        setProduct(foundProduct);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('productId', '==', id));
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (product) {
      const fetchRelatedProducts = async () => {
        try {
          const q = query(collection(db, 'products'), where('category', '==', product.category));
          const querySnapshot = await getDocs(q);
          const related = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => p.id !== product.id)
            .slice(0, 4);
          setRelatedProducts(related);
        } catch (error) {
          console.error('Error fetching related products:', error);
        }
      };
      fetchRelatedProducts();
    }
  }, [product]);

  if (loading) {
    return <div>Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const selectSize = (size) => {
    if (product && product.sizes && product.sizes[size] > 0) {
      setSelectedSize(size);
    }
  };

  const addToBag = async () => {
    if (selectedSize && product && product.sizes && product.sizes[selectedSize] > 0) {
      // Decrease stock
      const updatedSizes = { ...product.sizes };
      updatedSizes[selectedSize] -= 1;

      try {
        // Update stock in Firebase
        await updateDoc(doc(db, 'products', product.id), { sizes: updatedSizes });
        // Update local state
        setProduct({ ...product, sizes: updatedSizes });
        // Add to cart
        addToCart(product, selectedSize);
        navigate('/cart');
      } catch (error) {
        console.error('Error updating stock:', error);
        alert('Error updating stock. Please try again.');
      }
    } else {
      alert('Please select an available size first');
    }
  };

  const toggleWishlist = () => {
    setWishlist(!wishlist);
  };

  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const submitReview = async () => {
    if (userRating === 0 || !reviewText.trim() || !reviewName.trim()) {
      alert('Please fill in all fields and select a rating');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        name: reviewName,
        rating: userRating,
        text: reviewText,
        createdAt: new Date()
      });

      // Reset form
      setUserRating(0);
      setReviewText('');
      setReviewName('');

      // Refresh reviews
      const q = query(collection(db, 'reviews'), where('productId', '==', id));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);

      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        <div className="product-images">
  <div className="image-carousel">
    {product.image && (
      <img src={product.image} alt={product.name} className="carousel-image" />
    )}
    {product.image2 && (
      <img src={product.image2} alt={product.name} className="carousel-image" />
    )}
    {product.image3 && (
      <img src={product.image3} alt={product.name} className="carousel-image" />
    )}
  </div>
</div>


        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="category">{product.category}</p>
          <div className="price-container">
            <span className="current-price">{product.currentPrice}</span>
            <span className="original-price">{product.originalPrice}</span>
            <span className="discount">{product.discount}</span>
          </div>
          <p className="description">{product.description}</p>

          {/* Size Selector */}
          <div className="size-section">
            <div className="size-header">
              <h2>Sizes</h2>
            </div>

            <div className="size-grid">
              {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                <div key={size} className="size-button-container">
                  <button
                    className={`size-button ${selectedSize === size ? 'selected' : ''} ${product.sizes && product.sizes[size] === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => selectSize(size)}
                    disabled={product.sizes && product.sizes[size] === 0}
                  >
                    {size}
                  </button>
                  {product.sizes && (
                    <div className={`size-stock ${product.sizes[size] <= 2 ? 'low-stock' : ''}`}>
                      {product.sizes[size] === 0 ? 'Out of stock' : `${product.sizes[size]} left`}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="size-grid">
              {['2XL', '3XL', '4XL'].map(size => (
                <div key={size} className="size-button-container">
                  <button
                    className={`size-button ${selectedSize === size ? 'selected' : ''} ${product.sizes && product.sizes[size] === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => selectSize(size)}
                    disabled={product.sizes && product.sizes[size] === 0}
                  >
                    {size}
                  </button>
                  {product.sizes && (
                    <div className={`size-stock ${product.sizes[size] <= 2 ? 'low-stock' : ''}`}>
                      {product.sizes[size] === 0 ? 'Out of stock' : `${product.sizes[size]} left`}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="size-info">
              <div className="info-icon">i</div>
              <div className="size-info-text">
                <strong>True to size.</strong> We recommend ordering your usual size.
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="add-to-bag"
                onClick={addToBag}
                disabled={!selectedSize || (product.sizes && product.sizes[selectedSize] === 0)}
              >
                <span>Add to bag</span>
                <span className="bag-icon"></span>
              </button>
              <button className="wishlist-button" onClick={toggleWishlist}>
                <span className="heart-icon">{wishlist ? '❤️' : '🤍'}</span>
              </button>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="related-products-section">
              <h2>Related Products</h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`} className="product-card-link">
                    <div className="product-card">
                      <img src={relatedProduct.image} alt={relatedProduct.name} className="product-card-image" />
                      <h3 className="product-card-name">{relatedProduct.name}</h3>
                      <div className="product-card-price">
                        <span className="current-price">{relatedProduct.currentPrice}</span>
                        <span className="original-price">{relatedProduct.originalPrice}</span>
                        <span className="discount">{relatedProduct.discount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          </div>

        </div>
      </div>

  );
}

export default ProductDetails;
