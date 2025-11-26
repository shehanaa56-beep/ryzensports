import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterSort from "./FilterSort";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function Outlet() {
  const navigate = useNavigate();
  const [showFilterSort, setShowFilterSort] = useState(false);
  const [outletProducts, setOutletProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ Detect screen width to adjust columns automatically
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchOutletProducts = async () => {
      try {
        const q = query(collection(db, "products"), where("section", "==", "outlet"));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOutletProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error("Error fetching outlet products:", error);
        const fallbackProducts = [
          {
            id: "1",
            name: "Manchester United 08/09 Jersey",
            category: "Football",
            currentPrice: "Rs. 299.00",
            originalPrice: "Rs. 399.00",
            image: "/images/ronaldo1.jpg",
          },
          {
            id: "2",
            name: "Inter Milan Ibrahimovic Half Sleeve",
            category: "Football",
            currentPrice: "Rs. 299.00",
            originalPrice: "Rs. 380.00",
            image: "/images/ibrahimovic1.jpg",
          },
          {
            id: "3",
            name: "Neymar Santos 2012 Jersey",
            category: "Football",
            currentPrice: "Rs. 299.00",
            originalPrice: "Rs. 380.00",
            image: "/images/neymar1.jpg",
          },
          {
            id: "4",
            name: "Real Madrid Ronaldo Jersey",
            category: "Football",
            currentPrice: "Rs. 299.00",
            originalPrice: "Rs. 399.00",
            image: "/images/ronaldo2.jpg",
          },
        ];
        setOutletProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchOutletProducts();
  }, []);

  const handleFilterSortClick = () => setShowFilterSort(true);
  const handleCloseFilterSort = () => setShowFilterSort(false);

  return (
    <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      {/* =========================
          SALE BANNER
      ========================== */}
      <section
        style={{
          background: "linear-gradient(to right, #000 50%, #003300 50%)",
          color: "#fff",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
          JERSEY, HALF SLEEVE AND FULL SLEEVE: UP TO 60% OFF
        </h1>
        <p style={{ color: "#ccc" }}>[{filteredProducts.length}]</p>
      </section>

      {/* =========================
          FILTER BUTTON
      ========================== */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px" }}>
        <button
          onClick={handleFilterSortClick}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "10px 20px",
            fontWeight: "600",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          FILTER & SORT ☰
        </button>
      </div>

      {/* =========================
          PRODUCTS GRID
      ========================== */}
      <section style={{ padding: "20px" }}>
        <div
          style={{
            display: "grid",
            gap: "20px",
            width: "100%",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)" // ✅ 2 per row on mobile
              : "repeat(auto-fit, minmax(250px, 1fr))", // ✅ desktop/tablet auto
          }}
        >
          {loading ? (
            <div style={{ color: "#fff" }}>Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "1px solid #333",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 0 15px rgba(0,0,0,0.5)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#000",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "300px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "110%",
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: "8px",
                        display: "block",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        backgroundColor: "#fff",
                        color: "#000",
                        fontWeight: "600",
                        fontSize: "10px",
                        padding: "2px 5px",
                        borderRadius: "2px",
                        textTransform: "uppercase",
                        lineHeight: "1",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Sale
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const savedWishlist = localStorage.getItem('wishlist');
                        let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
                        const isInWishlist = wishlist.some(item => item.id === product.id);
                        if (!isInWishlist) {
                          wishlist.push(product);
                          localStorage.setItem('wishlist', JSON.stringify(wishlist));
                        }
                        navigate('/wishlist');
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: '20px',
                          height: '20px',
                          fill:
                            localStorage.getItem('wishlist') &&
                            JSON.parse(localStorage.getItem('wishlist')).some(
                              item => item.id === product.id
                            )
                              ? 'red'
                              : '#fff',
                        }}
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2
                        12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74
                        0 3.41.81 4.5 2.09C13.09 3.81 14.76
                        3 16.5 3 19.58 3 22 5.42 22
                        8.5c0 3.78-3.4 6.86-8.55
                        11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
  <div
                    style={{
                      padding: "1rem",
                      background: "linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,20,0.9))",
                      borderRadius: "0 0 15px 15px",
                      textAlign: "center",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        color: "#fff",
                        marginBottom: "6px",
                        textTransform: "capitalize",
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                         style={{
                        fontSize: "0.8rem",
                        color: "#ccc",
                        textTransform: "capitalize",
                        marginBottom: "10px",
                      }}
                    >
                      {product.category}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1rem",
                          color: "#888",
                          textDecoration: "line-through",
                        }}
                      >
                        {product.originalPrice}
                      </span>
                      <span
                         style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: "#FFD700",
                          background: "linear-gradient(45deg, #656809, #ffed4e)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {product.currentPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ color: "#fff" }}>No products found.</div>
          )}
        </div>
      </section>

      {showFilterSort && (
        <FilterSort onClose={handleCloseFilterSort} itemCount={filteredProducts.length} />
      )}
    </div>
  );
}

export default Outlet;
