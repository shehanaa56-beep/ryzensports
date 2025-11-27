const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');

// Optional: Firebase Admin to update Firestore from webhook
let admin;
let firebaseApp;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.warn('firebase-admin not available.');
}

const app = express();
app.use(cors());
app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_RkO9M7VrSJCBsz';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'wVx5A5j3eG4OJDGttysMD9ke';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

// -------------------- INIT FIREBASE ADMIN --------------------
if (admin) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = admin.initializeApp({ credential: admin.credential.cert(svc) });
      console.log('Firebase Admin initialized from service account.');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseApp = admin.initializeApp();
      console.log('Firebase Admin initialized using GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      console.log('No Firebase credentials provided; Firestore updates disabled.');
    }
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e.message);
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

// -------------------- CREATE ORDER --------------------
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || !receipt) return res.status(400).json({ message: 'Missing amount or receipt' });

    const options = {
      amount: Number(amount),
      currency,
      receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return res.json({ order, key_id: KEY_ID });
  } catch (err) {
    console.error('Create order error', err);
    return res.status(500).json({ message: 'Order creation failed', error: err.message });
  }
});

// -------------------- VERIFY PAYMENT --------------------
app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.json({ ok: true });
    }

    return res.status(400).json({ ok: false, message: 'Invalid signature' });
  } catch (err) {
    console.error('Verify payment error', err);
    return res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

// -------------------- WEBHOOK --------------------
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['x-razorpay-signature'];
    const body = req.body;
    if (!sig) return res.status(400).json({ message: 'Missing signature' });

    const generated = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    if (generated !== sig) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const payload = JSON.parse(body.toString());
    const event = payload.event;
    console.log('Received webhook event:', event);

    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id || null;

    if (orderId && firebaseApp) {
      const firestore = admin.firestore();

      try {
        // Fetch Razorpay order to get receipt = Firestore doc id
        const rOrder = await razorpay.orders.fetch(orderId);
        const receipt = rOrder.receipt;

        // Update order to Paid
        const updates = { status: 'Paid' };
        if (paymentEntity) {
          updates.payment = {
            id: paymentEntity.id,
            method: paymentEntity.method,
            amount: (paymentEntity.amount || 0) / 100,
            captured: paymentEntity.captured || false,
            capturedAt: admin.firestore.FieldValue.serverTimestamp()
          };
        }

        await firestore.collection('orders').doc(receipt).update(updates);
        console.log('Order updated:', receipt);

        // ⭐⭐⭐ REDUCE STOCK AFTER PAYMENT — ADDED CODE ⭐⭐⭐
        const orderDoc = await firestore.collection('orders').doc(receipt).get();
        const orderData = orderDoc.data();

        if (orderData && Array.isArray(orderData.items)) {
          for (const item of orderData.items) {
            const productRef = firestore.collection("products").doc(item.id);
            const productSnap = await productRef.get();

            if (!productSnap.exists) continue;

            const productData = productSnap.data();
            const updatedSizes = { ...productData.sizes };

            if (updatedSizes[item.size] !== undefined) {
              updatedSizes[item.size] -= item.quantity;
            }

            await productRef.update({ sizes: updatedSizes });
          }

          console.log("Stock reduced for all items");
        }
        // ⭐⭐⭐ END STOCK REDUCTION ⭐⭐⭐

      } catch (e) {
        console.error('Error during webhook Firestore update:', e.message);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Webhook handling error', err.message);
    return res.status(500).json({ message: 'Webhook handling failed', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Razorpay backend listening on ${PORT}`));
