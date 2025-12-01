import './App.css';
import { BrowserRouter as Router, Routes, Route, createRoutesFromElements } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { LoginProvider } from './LoginContext';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
import './firebase';
import Offer from './Offer';
import Testimonials from './Testimonials';
import Header from './Header';
import Shop from './Shop';
import Collection from './Collection';
import ShopByCollection from "./ShopByCollection";
import About from './About';
import Footer from './Footer';
import Outlet from './Outlet';
import ProductDetails from './ProductDetails';
import FAQ from './FAQ';
import Cart from './Cart';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import OrderHistoryModal from './OrderHistoryModal';
import AdminDashboard from './AdminDashboard';
import Wishlist from './Wishlist';
import CustomerSupport from './CustomerSupport';
// ⭐ NEW IMPORT
import WhatsAppButton from './WhatsAppButton';
function App() {
  return (
    <LoginProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            {/* Offer Bar */}
            <Offer />

            {/* Header */}
            <Header />

            <Routes>
              <Route path="/" element={
                <>
                  
                  {/* Hero Banner */}
                  <section className="hero">
                   
                  </section>
              <ShopByCollection />

                  {/* Collection Section */}
                  <Collection />
                  <Outlet />

                  {/* About Section */}
                  <About />
                    {/* ⭐ Testimonials Section */}
    <Testimonials />

                </>
              } />
              <Route path="/outlet" element={<Outlet />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/order-history" element={<OrderHistoryModal />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/customer-support" element={<CustomerSupport />} />
            </Routes>

            {/* Footer */}
            <Footer />
            
            {/* ⭐ FLOATING WHATSAPP BUTTON */}
            <WhatsAppButton />
          </div>
        </Router>
      </CartProvider>
    </LoginProvider>
  );
}

export default App;
