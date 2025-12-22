import React from "react";
import { useNavigate } from "react-router-dom";
import "./SearchResults.css";

function SearchResults({ results, onClose }) {
  const navigate = useNavigate();

  if (!results) return null;

  const { suggestions = [], products = [] } = results;

  const goToProduct = (id) => {
    navigate(`/product/${id}`);
    onClose();
  };

  // ⭐ Detect section from suggestion text
  const goToSection = (text) => {
    const lower = text.toLowerCase();

    let section = null;

    if (lower.includes("half")) section = "halfsleeves";
    else if (lower.includes("full")) section = "fullsleeves";
    else if (lower.includes("oversized")) section = "oversized";

    if (section) {
      navigate("/outlet", { state: { section } });
      onClose();
    }
  };

  
return (
  <div className="search-box">

    {/* ⭐ SUGGESTIONS SECTION */}
    {suggestions.length > 0 && (
      <>
        <h4 className="sr-title">
          <i className="bi bi-search sr-title-icon"></i>
          SUGGESTIONS
        </h4>

        {suggestions.map((text, i) => (
          <div
            key={i}
            className="sr-suggestion"
            onClick={() => goToSection(text)}
          >
            <i className="bi bi-arrow-right-circle"></i>
            <span>{text}</span>
          </div>
        ))}
      </>
    )}

    {/* ⭐ PRODUCTS SECTION */}
    {products.length > 0 && (
      <>
        <h4 className="sr-title">
          <i className="bi bi-bag sr-title-icon"></i>
          PRODUCTS
        </h4>

        {products.map((p, index) => (
          <div
            key={p.id || index}
            className="sr-product"
            onClick={() => goToProduct(p.id)}
          >
            <img
              src={p.image || "/images/default.png"}
              alt="product"
              className="sr-product-img"
            />

            <div className="sr-product-info">
              <div className="sr-product-name">
                <i className="bi bi-box-seam"></i>
                {p.category}
              </div>
            </div>
          </div>
        ))}
      </>
    )}

    {/* ❌ No Results */}
    {suggestions.length === 0 && products.length === 0 && (
      <div className="no-results">
        <i className="bi bi-emoji-frown"></i> No products found
      </div>
    )}
  </div>
);

}

export default SearchResults;
