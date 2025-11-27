import './App.css';
import { BrowserRouter as Router, Routes, Route, createRoutesFromElements } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { LoginProvider } from './LoginContext';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
import './firebase';
import Offer from './Offer';
import Header from './Header';
import Shop from './Shop';
import Collection from './Collection';
import Insta from './Insta';
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
                  {/* Announcement Bar */}
                  <div className="announcement">
                    NEXT-GEN GST REFORM: NEW GST RATES NOW IN EFFECT ON APPLICABLE PRODUCTS
                  </div>
                  
                  {/* Hero Banner */}
                  <section className="hero">
                   
                  </section>
                  {/* Insta Section */}
                  <Insta />
                  {/* About Section */}
                  <About />
                  {/* Collection Section */}
                  <Collection />
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
          </div>
        </Router>
      </CartProvider>
    </LoginProvider>
  );
}

export default App;
