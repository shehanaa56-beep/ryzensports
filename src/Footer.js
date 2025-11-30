import './Footer.css';
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="ryzen-footer">
      <div className="footer-container">
        {/* ===== Brand Section ===== */}
        <div className="footer-brand">
          <p className="footer-tagline">
            Elevate your game with premium jerseys, authentic collections, and unmatched quality.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        {/* ===== Quick Links ===== */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/outlet">Outlet</Link></li>
            <li><Link to="/">Collections</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/customer-support">Support</Link></li>
          </ul>
        </div>

        {/* ===== Customer Support ===== */}
        <div className="footer-links">
          <h4>Customer Support</h4>
          <ul>
            <li><a href="#shipping">Shipping Policy</a></li>
            <li><a href="#returns">Returns & Exchanges</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* ===== Contact Section ===== */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><strong>Email:</strong> support@ryzensports.com</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p><strong>Hours:</strong> Mon–Sat 10AM–8PM</p>
        </div>
      </div>

      {/* ===== Footer Bottom ===== */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RyzenSports. All rights reserved.</p>
        <p className="developer-credit">Designed & Developed by Ryzen Team ⚡</p>
      </div>
    </footer>
  );
}

export default Footer;
