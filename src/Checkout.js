import React, { useState, useRef } from 'react';
import { useCart } from './CartContext';
import { useLogin } from './LoginContext';
import { useNavigate } from 'react-router-dom';
import Payment from './Payment';
import './Checkout.css';

function Checkout() {
  const { cartItems, getTotalPrice } = useCart();
  const { isLoggedIn, user, openModal } = useLogin();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  // -------------------------------
  // ADDRESS SEARCH AUTOCOMPLETE
  // -------------------------------
  const handleSearchChange = async (e) => {
    const input = e.target.value;

    setShippingAddress(prev => ({ ...prev, address: input }));

    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${input}`);
      const data = await res.json();

      const list = data.features.map(item => ({
        name: item.properties.name,
        city: item.properties.city,
        state: item.properties.state,
        country: item.properties.country,
        full: `${item.properties.name || ''}, ${item.properties.city || ''}, ${item.properties.state || ''}, ${item.properties.country || ''}`
      }));

      setSuggestions(list);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    }
  };

  const selectSuggestion = (item) => {
    setShippingAddress(prev => ({
      ...prev,
      address: item.full,
      city: item.city || prev.city,
      state: item.state || prev.state,
      country: item.country || prev.country
    }));
    setSuggestions([]);
  };

  // -------------------------------
  // INPUT HANDLING
  // -------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // -------------------------------
  // FORM SUBMIT → SHOW PAYMENT PAGE
  // -------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    setShowPayment(true);
  };

  // -------------------------------
  // SHOW PAYMENT PAGE
  // -------------------------------
  if (showPayment) {
    return (
      <Payment
        onSuccess={() => navigate('/')}
        cartItems={cartItems}
        loggedInUser={user || { id: "guest" }}  // ⭐ FIX: pass user correctly
      />
    );
  }

  // -------------------------------
  // NORMAL CHECKOUT PAGE
  // -------------------------------
  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-content">

        {/* ORDER SUMMARY */}
        <div className="order-summary" style={{background:"#fff",color:"#000"}}>
          <h2>Order Summary</h2>

          {cartItems.map(item => (
            <div key={`${item.id}-${item.size}`} className="checkout-item">
              <img src={item.image} className="checkout-item-image" alt="" />
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

        {/* SHIPPING FORM */}
        <div className="shipping-form">
          <h2>Shipping Address</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={shippingAddress.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* SEARCH ADDRESS */}
            <div className="form-group">
              <label>Search Address</label>
              <input
                type="text"
                placeholder="Search location..."
                value={shippingAddress.address}
                onChange={handleSearchChange}
              />
            </div>

            {suggestions.length > 0 && (
              <ul className="suggestions-box">
                {suggestions.map((item, index) => (
                  <li key={index} onClick={() => selectSuggestion(item)}>
                    {item.full}
                  </li>
                ))}
              </ul>
            )}

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="place-order-button">
              Place Order
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
