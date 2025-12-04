import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FilterSort from "./FilterSort";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./Outlet.css";

function Outlet() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedSection = location.state?.section || null;

  const [showFilterSort, setShowFilterSort] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ⭐ View All mode
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchOutletProducts = async () => {
      try {
        const sections = ["fullsleeves", "halfsleeves", "oversized"];
        let loadedProducts = [];

        for (let sec of sections) {
          const q = query(collection(db, "products"), where("section", "==", sec));
          const snap = await getDocs(q);

          const secProducts = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          loadedProducts = [...loadedProducts, ...secProducts];
        }

        setAllProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
      } catch (error) {
        console.error("Error fetching outlet products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutletProducts();
  }, []);

  const fullSleeves = filteredProducts.filter((p) => p.section === "fullsleeves");
  const halfSleeves = filteredProducts.filter((p) => p.section === "halfsleeves");
  const oversized = filteredProducts.filter((p) => p.section === "oversized");

  // PRODUCT CARD
  const renderProductCard = (product) => {
    const discount =
      product.originalPrice && product.currentPrice
        ? Math.round(
            ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
          )
        : null;

    return (
      <Link
        key={product.id}
        to={`/product/${product.id}`}
        className="outlet-card"
        style={{ textDecoration: "none" }}
      >
        <div className="outlet-img">
          <img src={product.image} alt={product.name} />

          {discount > 0 && <span className="discount-badge">{discount}%</span>}

          <button
            className="wishlist-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const savedWishlist = localStorage.getItem("wishlist");
              let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
              const exists = wishlist.some((item) => item.id === product.id);

              if (!exists) {
                wishlist.push(product);
                localStorage.setItem("wishlist", JSON.stringify(wishlist));
              }

              navigate("/wishlist");
            }}
          >
            <svg viewBox="0 0 24 24" className="wishlist-icon">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 
                12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 
                0 3.41.81 4.5 2.09C13.09 3.81 14.76 
                3 16.5 3 19.58 3 22 5.42 22 
                8.5c0 3.78-3.4 6.86-8.55 
                11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        <div className="outlet-info">
          <h3 className="outlet-name">{product.name}</h3>
          <p className="outlet-category">{product.category}</p>

          <div className="price-row">
            <span className="current-price">₹{product.currentPrice}</span>
            <span className="original-price">₹{product.originalPrice}</span>
          </div>
        </div>
      </Link>
    );
  };

  // SECTION BLOCK
  const SectionBlock = ({ title, list }) => (
    <div className="outlet-section">
      <h2 className="section-title">{title}</h2>

      {!viewAll ? (
        <>
          {/* ⭐ Horizontal scroll for mobile */}
          <div className="outlet-grid">{list.map(renderProductCard)}</div>

          <div className="scroll-footer">
            <div className="scroll-count">1 / {list.length}</div>

            <button className="view-all-btn" onClick={() => setViewAll(true)}>
              View all
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ⭐ FULL GRID MODE */}
          <div className="outlet-grid full">{list.map(renderProductCard)}</div>

          <button className="back-btn" onClick={() => setViewAll(false)}>
            Back
          </button>
        </>
      )}
    </div>
  );

  const renderSelectedSection = () => {
    if (selectedSection === "fullsleeves") {
      return <SectionBlock title="FULLSLEEVE'S" list={fullSleeves} />;
    }
    if (selectedSection === "halfsleeves") {
      return <SectionBlock title="HALFSLEEVE'S" list={halfSleeves} />;
    }
    if (selectedSection === "oversized") {
      return <SectionBlock title="OVERSIZED" list={oversized} />;
    }

    return (
      <>
        <SectionBlock title="FULLSLEEVE'S" list={fullSleeves} />
        <SectionBlock title="HALFSLEEVE'S" list={halfSleeves} />
        <SectionBlock title="OVERSIZED" list={oversized} />
      </>
    );
  };

  return (
    <div style={{ backgroundColor: "#fff", color: "#312d2dff", minHeight: "100vh" }}>
      <section className="header-banner" style={{fontFamily:'times new roman',fontSize:'.8rem',fontWeight:'700',textTransform:'uppercase'}}>
        <h1>JERSEY, HALF SLEEVE AND FULL SLEEVE: UP TO 60% OFF</h1>
        <p>[{filteredProducts.length}]</p>
      </section>

      <div className="filter-box">
        <button className="filter-btn" onClick={() => setShowFilterSort(true)}>
          FILTER & SORT ☰
        </button>
      </div>

      <section>{loading ? <div>Loading…</div> : renderSelectedSection()}</section>

      {showFilterSort && (
        <FilterSort
          onClose={() => setShowFilterSort(false)}
          itemCount={filteredProducts.length}
        />
      )}
    </div>
  );
}

export default Outlet;
