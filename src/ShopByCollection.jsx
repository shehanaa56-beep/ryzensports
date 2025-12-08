import React from "react";
import { useNavigate } from "react-router-dom";
import "./ShopByCollection.css";

function ShopByCollection() {
  const navigate = useNavigate();

  const collections = [
    {
      img: "/images/s7.webp",
      title: "Five Sleeve Jerseys",
      section: "fivesleeves",
      w: 120,
      h: 120
    },
    {
      img: "/images/s8.webp",
      title: "Full Sleeve Jerseys",
      section: "fullsleeves",
      w: 120,
      h: 120
    },
    {
      img: "/images/s1.webp",
      title: "Black Friday sale 2025",
      section: "blackfriday",
      w: 120,
      h: 120
    },
    {
      img: "/images/s2.webp",
      title: "Embroidery collection",
      section: "embroidery",
      w: 120,
      h: 120
    },
    {
      img: "/images/s3.webp",
      title: "Goat Tour INDIA Special",
      section: "goattour",
      w: 120,
      h: 120
    },
    {
      img: "/images/s9.webp",
      title: "World cup 2026 collection",
      section: "worldcup",
      w: 120,
      h: 120
    },
  ];

  const goToSection = (sectionName) => {
    navigate("/outlet", { state: { section: sectionName } });
  };

  return (
    <section className="shop-collection">
      <h2>Shop By Collection</h2>

      <div className="collection-row">
        {collections.map((item, i) => (
          <div
            className="collection-item"
            key={i}
            onClick={() => goToSection(item.section)}
            style={{ cursor: "pointer" }}
          >
            <div className="collection-img">
              <img 
                src={item.img}
                alt={item.title}
                width={item.w}
                height={item.h}
                loading="lazy"      // ⭐ improves performance drastically
                decoding="async"     // ⭐ faster rendering
                style={{ borderRadius: "50%" }}
              />
            </div>

            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShopByCollection;
