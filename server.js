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
  console.warn('firebase-admin not available. Webhook Firestore updates will be disabled unless firebase-admin is installed.');
}

const app = express();
app.use(cors());
app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_RkO9M7VrSJCBsz';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'wVx5A5j3eG4OJDGttysMD9ke';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

// Initialize Firebase Admin if service account provided via env var or GOOGLE_APPLICATION_CREDENTIALS
if (admin) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseApp = admin.initializeApp({ credential: admin.credential.cert(svc) });
      console.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseApp = admin.initializeApp();
      console.log('Firebase Admin initialized using GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      console.log('No Firebase credentials provided; webhook will not update Firestore.');
    }
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e.message);
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

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

app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = crypto.createHmac('sha256', KEY_SECRET)
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

// Webhook endpoint: use raw body to verify signature
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['x-razorpay-signature'];
    const body = req.body; // Buffer
    if (!sig) return res.status(400).json({ message: 'Missing signature' });

    const generated = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    if (generated !== sig) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const payload = JSON.parse(body.toString());
    // Handle payment.captured or order.paid events
    const event = payload.event;
    console.log('Received webhook event:', event);

    // Extract order id and payment entity if available
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id || null;

    if (orderId) {
      // Fetch order from Razorpay to get receipt (which we used as Firestore doc id)
      try {
        const rOrder = await razorpay.orders.fetch(orderId);
        const receipt = rOrder.receipt; // this should be firestore doc id

        if (firebaseApp) {
          const firestore = admin.firestore();
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
          console.log('Order', receipt, 'updated to Paid in Firestore');
        } else {
          console.log('Firebase Admin not initialized — skipping Firestore update for receipt', rOrder.receipt);
        }
      } catch (e) {
        console.error('Error fetching order or updating Firestore from webhook:', e.message);
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
