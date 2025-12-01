import React from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  // ✅ Checkout allowed for everyone
  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <h1>Your Bag</h1>

      {cartItems.length === 0 ? (
        <p>Your bag is empty.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <button
                  className="remove-icon"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  ✕
                </button>

                <img src={item.image} alt={item.name} className="cart-item-image" />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Size: {item.size}</p>
                  <p>{item.currentPrice}</p>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => {
                        const newQty = item.quantity - 1;
                        if (newQty < 1) {
                          removeFromCart(item.id, item.size);   // ⭐ Prevent quantity going below 1
                        } else {
                          updateQuantity(item.id, item.size, newQty);
                        }
                      }}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="remove-item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <p>Total: ₹{getTotalPrice().toFixed(2)}</p>

            {/* No login check anymore */}
            <button className="checkout-button" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
