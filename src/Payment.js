import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useCart } from './CartContext';
import { useLogin } from './LoginContext';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import "./Payment.css";

const Payment = ({ onSuccess, cartItems, loggedInUser }) => {
  const { cartItems: contextCartItems, clearCart } = useCart();
  const { user } = useLogin();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // NEW: Preloaded Razorpay order
  const [preloadedOrder, setPreloadedOrder] = useState(null);
  const [preloadedKey, setPreloadedKey] = useState("");

  // Initialize EmailJS
  emailjs.init('GhbnU4GVjsYtlE4Di');

  // Load Razorpay script early
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Backend base URL
  const API_BASE = "https://ryzensports.onrender.com";

  const itemsToUse = cartItems || contextCartItems;

  const total = itemsToUse.reduce(
    (sum, item) =>
      sum + parseFloat(item.currentPrice.replace('₹', '')) * item.quantity,
    0
  );

  // Generate UPI string
  const upiString = `upi://pay?pa=sinuharsha6478-2@okaxis&pn=Jewelry Store&am=${total}&cu=INR&tn=Payment for Order`;

  // ⭐ Reduce stock AFTER successful payment
  const reduceStock = async () => {
    try {
      for (const item of itemsToUse) {
        const productRef = firestoreDoc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) continue;

        const productData = productSnap.data();
        const updatedSizes = { ...productData.sizes };
        updatedSizes[item.size] -= item.quantity;

        await updateDoc(productRef, { sizes: updatedSizes });
      }

      console.log("Stock reduced successfully.");
    } catch (error) {
      console.error("Error reducing stock:", error);
    }
  };

  // ⚡ PRELOAD Razorpay order BEFORE clicking button
  useEffect(() => {
    const preloadOrder = async () => {
      const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));
      if (!shippingAddress) return;

      // Create a temporary Firestore order (status Pending)
      const orderData = {
        userEmail: user.email || user.username,
        items: itemsToUse,
        subtotal: total.toFixed(2),
        shipping: "0.00",
        total: total.toFixed(2),
        paymentMethod: "UPI",
        shippingAddress: `${shippingAddress.name}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`,
        orderDate: serverTimestamp(),
        status: "Pending"
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderDocId(docRef.id);

      // Create razorpay order from backend
      const resp = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: docRef.id
        })
      });

      const data = await resp.json();
      setPreloadedOrder(data.order);
      setPreloadedKey(data.key_id);
    };

    preloadOrder();
  }, []);

  // Store Firestore order ID
  const [orderDocId, setOrderDocId] = useState(null);

  // Handle payment
  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!preloadedOrder) {
      alert("Still preparing payment… please wait 1 sec.");
      return;
    }

    setIsProcessing(true);

    const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));

    const options = {
      key: preloadedKey,
      amount: preloadedOrder.amount,
      currency: preloadedOrder.currency,
      name: "Ryzen Store",
      description: "Payment for Order",
      order_id: preloadedOrder.id,

      handler: async (response) => {
        try {
          // Verify on backend
          await fetch(`${API_BASE}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });

          // Update Firestore to Paid
          await updateDoc(firestoreDoc(db, "orders", orderDocId), {
            status: "Paid",
            payment: {
              id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              paidAt: serverTimestamp()
            }
          });

          await reduceStock();
          clearCart();

          setPaymentSuccess(true);

          setTimeout(() => {
            window.location.href = "/order-history";
          }, 3000);

        } catch (err) {
          console.error("Payment processing error:", err);
          alert("Problem verifying payment.");
        }
      },

      prefill: {
        name: shippingAddress.name,
        email: user.email || user.username,
        contact: shippingAddress.phone || "",
      },

      theme: {
        color: "#3399cc",
      },

      modal: {
        ondismiss: async () => {
          setIsProcessing(false);

          try {
            await updateDoc(firestoreDoc(db, "orders", orderDocId), {
              status: "Cancelled",
              cancelledAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Cancel update error:", err);
          }

          alert("Payment cancelled.");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Your order has been placed successfully.</p>
          <p className="redirect-message">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Payment</h1>

      <div className="order-summary">
        <h2>Order Summary</h2>
        {itemsToUse.map(item => (
          <div key={item.id} className="summary-item">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{(parseFloat(item.currentPrice.replace("₹", "")) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-total">
          <strong>Total: ₹{total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="payment-options">
        <h2>Select Payment Method</h2>

        <div className="payment-option">
          <input
            type="radio"
            name="payment"
            value="UPI"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <p>UPI</p>
        </div>
      </div>

      <button
        onClick={handlePayment}
        className="pay-btn"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing Payment…" : "Confirm Payment"}
      </button>
    </div>
  );
};

export default Payment;
