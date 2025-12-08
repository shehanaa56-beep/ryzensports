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

  emailjs.init('GhbnU4GVjsYtlE4Di');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true; 
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const API_BASE = "https://ryzensports.onrender.com";

  const itemsToUse = cartItems || contextCartItems;

  const total = itemsToUse.reduce(
    (sum, item) =>
      sum + parseFloat(item.currentPrice.replace('₹', '')) * item.quantity,
    0
  );

  const upiString = `upi://pay?pa=sinuharsha6478-2@okaxis&pn=Jewelry Store&am=${total}&cu=INR&tn=Payment for Order`;

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
    } catch (error) {
      console.error("Error reducing stock:", error);
    }
  };

  const [orderDocId, setOrderDocId] = useState(null);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setIsProcessing(true);

    const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));

    const orderData = {
      userEmail: user?.email || user?.username || "guest",
      items: itemsToUse,
      subtotal: total.toFixed(2),
      shipping: "0.00",
      total: total.toFixed(2),
      paymentMethod,
      shippingAddress: `${shippingAddress.name}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`,
      orderDate: serverTimestamp(),
      status: "Pending",
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);
    setOrderDocId(docRef.id);

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

    if (!data.order) {
      alert("Failed to initialize payment. Try again.");
      setIsProcessing(false);
      return;
    }

    const razorOrder = data.order;
    const key = data.key_id;

    const options = {
      key: key,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
      name: "Ryzen Store",
      description: "Order Payment",
      order_id: razorOrder.id,

      handler: async (response) => {
        await updateDoc(firestoreDoc(db, "orders", docRef.id), {
          status: "Paid",
          payment: {
            id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
            paidAt: serverTimestamp()
          }
        });

        // ⭐ SAFELY send email without crashing ⭐
        try {
          await emailjs.send(
            "service_gmail",
            "template_ufcvumq",
            {
              order_id: docRef.id,
              name: shippingAddress.name,
              price: total.toFixed(2),
              email: "ryzensport64@gmail.com",

              // TEXT-ONLY — safe for EmailJS
              orders: itemsToUse
                .map(
                  (item) =>
                    `${item.name} | Size: ${item.size} | Qty: ${item.quantity} | Price: ₹${
                      parseFloat(item.currentPrice.replace("₹", "")) * item.quantity
                    }`
                )
                .join("\n"),

              // Send only URLs (NO <img>)
              product_images: itemsToUse.map((item) => item.image).join("\n"),

              shipping_address: `
${shippingAddress.name}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}
${shippingAddress.country}
Phone: ${shippingAddress.phone}
              `,
            },
            "GhbnU4GVjsYtlE4Di"
          );
        } catch (err) {
          console.error("EmailJS Error:", err);
        }

        await reduceStock();
        clearCart();

        setPaymentSuccess(true);

        setTimeout(() => {
          window.location.href = "/order-history";
        }, 3000);
      },

      prefill: {
        name: shippingAddress.name,
        email: user?.email || user?.username,
        contact: shippingAddress.phone || "",
      },

      theme: { color: "#3399cc" },

      modal: {
        ondismiss: async () => {
          await updateDoc(firestoreDoc(db, "orders", docRef.id), {
            status: "Cancelled",
            cancelledAt: serverTimestamp()
          });

          setIsProcessing(false);
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

      <div className="order-summary" style={{background:"#fff"}}>
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

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="UPI"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          UPI
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="CARD"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Debit / Credit Card
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="NETBANKING"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Netbanking
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            value="WALLET"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Wallets
        </label>
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
