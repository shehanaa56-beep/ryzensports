import React, { useState, useEffect } from 'react';
import { useLogin } from './LoginContext';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './OrderHistoryModal.css';

function OrderHistoryModal() {
  const { user, isLoggedIn } = useLogin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchOrderHistory();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userEmail', '==', user.email || user.username),
        where('status', '==', 'Paid'),
        orderBy('orderDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ffa500';
      case 'processing':
        return '#007bff';
      case 'shipped':
        return '#28a745';
      case 'delivered':
        return '#17a2b8';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="order-history-page" style={{ padding: "20px" }}>
      
      <div className="order-history-header">
        <h1>Your Order History</h1>
        <p className="welcome-message">Welcome back, {user.username || user.email}!</p>
      </div>

      {!isLoggedIn ? (
        <div className="login-prompt">
          <p>Please log in to view your order history.</p>
        </div>
      ) : loading ? (
        <div className="loading">
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOrderHistory} className="retry-button">
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <p>Start shopping to see your order history here!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id.slice(-8)}</h3>
                  <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
                </div>
                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status || 'Pending'}
                </div>
              </div>

              <div className="order-details">
                <div className="order-items">
                  <h4>Items Ordered:</h4>
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      </div>
                      {item.size && <span className="item-size">Size: {item.size}</span>}
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{Number(order.subtotal).toFixed(2)}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="shipping-info">
                  <h4>Shipping Address:</h4>
                  <p>{order.shippingAddress}</p>
                </div>
              )}

              {order.trackingNumber && (
                <div className="tracking-info">
                  <h4>Tracking Number:</h4>
                  <p>{order.trackingNumber}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryModal;
