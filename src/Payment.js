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

  // Initialize EmailJS
  emailjs.init('GhbnU4GVjsYtlE4Di');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
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

  // Generate UPI payment string
  const upiString = `upi://pay?pa=sinuharsha6478-2@okaxis&pn=Jewelry Store&am=${total}&cu=INR&tn=Payment for Order`;


  // ⭐⭐⭐ ADDED — Reduce stock AFTER payment success ⭐⭐⭐
  const reduceStock = async () => {
    try {
      for (const item of itemsToUse) {
        const productRef = firestoreDoc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) continue;

        const productData = productSnap.data();
        const updatedSizes = { ...productData.sizes };

        // Reduce quantity based on purchased size
        updatedSizes[item.size] -= item.quantity;

        await updateDoc(productRef, { sizes: updatedSizes });
      }

      console.log("Stock reduced successfully after payment.");
    } catch (error) {
      console.error("Error reducing stock:", error);
    }
  };
  // ⭐⭐⭐ END OF STOCK REDUCTION LOGIC ⭐⭐⭐


  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setIsProcessing(true);

    try {
      const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));

      const orderData = {
        userEmail: user.email || user.username,
        items: itemsToUse,
        subtotal: total.toFixed(2),
        shipping: "0.00",
        total: total.toFixed(2),
        paymentMethod,
        shippingAddress: `${shippingAddress.name}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`,
        orderDate: serverTimestamp(),
        status: "Pending"
      };

      // Save order to Firestore first
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log("Order saved to Firestore with ID:", docRef.id);

      // Create Razorpay order on backend
      const createOrderResp = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100), currency: 'INR', receipt: docRef.id })
      });

      if (!createOrderResp.ok) {
        const text = await createOrderResp.text();
        console.error('Create order failed:', createOrderResp.status, text);
        alert('Failed to create payment order. Try again.');
        setIsProcessing(false);
        return;
      }

      const createOrderData = await createOrderResp.json();
      const razorpayOrder = createOrderData.order;
      const razorpayKeyId = createOrderData.key_id;


      // Razorpay checkout options
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Ryzen Store',
        description: 'Payment for Order',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          console.log('Payment successful:', response);

          try {
            // Verify payment with backend
            const verifyResp = await fetch(`${API_BASE}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResp.ok) {
              const text = await verifyResp.text();
              console.error('Payment verification failed:', verifyResp.status, text);
              alert('Payment verification failed. Contact support.');
              setIsProcessing(false);
              return;
            }

            const verifyData = await verifyResp.json();

            // Update order to Paid
            await updateDoc(firestoreDoc(db, 'orders', docRef.id), {
              status: 'Paid',
              payment: {
                id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                paidAt: serverTimestamp()
              }
            });

            // ⭐⭐⭐ Reduce product stock ONLY now ⭐⭐⭐
            await reduceStock();


            // Send email to admin
            try {
              const emailParams = {
                email: "RyzenSport64@gmail.com",
                order_id: docRef.id,
                orders: itemsToUse
                  .map(item => `${item.name} (Size: ${item.size}) x ${item.quantity}`)
                  .join("\n"),
                name: shippingAddress.name,
                price: total.toFixed(2),
                shipping_address: [
                  shippingAddress.name,
                  shippingAddress.address,
                  `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`,
                  shippingAddress.country
                ].join("\n"),
                product_images: itemsToUse
                  .map(item => item.image)
                  .join("\n")
              };

              await emailjs.send(
                "service_gmail",
                "template_ufcvumq",
                emailParams,
                "GhbnU4GVjsYtlE4Di"
              );

              console.log("Order email sent to admin");
            } catch (emailError) {
              console.error("Email sending error:", emailError);
            }

            clearCart();
            setIsProcessing(false);
            setPaymentSuccess(true);

            // Auto redirect
            setTimeout(() => {
              window.location.href = "/order-history";
            }, 3000);

          } catch (err) {
            console.error('Error handling payment success:', err);
            alert('There was a problem processing the payment. Contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: user.email || user.username,
          contact: shippingAddress.phone || '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            alert("Payment cancelled.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Order save error:", error);
      alert("Failed to initiate payment. Try again.");
      setIsProcessing(false);
    }
  };


  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Your order has been placed successfully.</p>
          <div className="order-details">
            <p><strong>Order ID:</strong> #{Date.now()}</p>
            <p><strong>Total Amount:</strong> ₹{total.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {paymentMethod}</p>
          </div>
          <p className="redirect-message">
            Redirecting to order history in 3 seconds...
          </p>
          <button
            onClick={() => (window.location.href = "/order-history")}
            className="view-orders-btn"
          >
            View Order History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Payment</h1>

      <div className="order-summary">
        <h2>Order Summary</h2>
        {itemsToUse.map((item) => (
          <div key={item.id} className="summary-item">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>
              ₹{(parseFloat(item.currentPrice.replace("₹", "")) * item.quantity).toFixed(2)}
            </span>
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
            id="upi"
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
        {isProcessing ? "Processing Payment..." : "Confirm Payment"}
      </button>
    </div>
  );
};

export default Payment;
