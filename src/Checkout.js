import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useLogin } from './LoginContext';
import { useNavigate } from 'react-router-dom';
import Payment from './Payment';
import './Checkout.css';

function Checkout() {
  const { cartItems, getTotalPrice } = useCart();
  const { isLoggedIn, openModal } = useLogin();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [showPayment, setShowPayment] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save shipping address to localStorage
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    // Show payment page
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    // Don't clear cart here, let Payment component handle it
    navigate('/');
  };

  if (!isLoggedIn) {
    openModal();
    navigate('/cart');
    return null;
  }

  if (showPayment) {
    return (
      <Payment
        onSuccess={handlePaymentSuccess}
        cartItems={cartItems}
        loggedInUser={{ id: 1 }} // Mock user ID, replace with actual user data
      />
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          {cartItems.map((item, index) => (
            <div key={`${item.id}-${item.size}`} className="checkout-item">
              <img src={item.image} alt={item.name} className="checkout-item-image" />
              <div className="checkout-item-details">
                <h3>{item.name}</h3>
                <p>Size: {item.size}</p>
                <p>Quantity: {item.quantity}</p>
                <p>{item.currentPrice}</p>
              </div>
            </div>
          ))}
          <div className="checkout-total">
            <p>Total: ₹{getTotalPrice().toFixed(2)}</p>
          </div>
        </div>

        <div className="shipping-form">
          <h2>Shipping Address</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={shippingAddress.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="place-order-button">Place Order</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
