import React from "react";
import { useNavigate } from "react-router-dom";
import "./ShopByCollection.css";

function ShopByCollection() {
  const navigate = useNavigate();

  const collections = [
    {
      img: "/images/s7.png",
      title: "FIVE SLEEVE JERSEYS",
      section: "fivesleeves"
    },
    {
      img: "/images/s8.png",
      title: "FULL SLEEVE JERSEYS",
      section: "fullsleeves"
    },
    {
      img: "/images/s1.png",
      title: "Black Friday sale 2025 MS Retro",
      section: "blackfriday"
    },
    {
      img: "/images/s2.png",
      title: "Embroidery collection",
      section: "embroidery"
    },
    {
      img: "/images/s3.png",
      title: "Goat Tour INDIA Special",
      section: "goattour"
    },
    {
      img: "/images/s9.png",
      title: "World cup 2026 collection",
      section: "worldcup"
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
              <img src={item.img} alt={item.title} />
            </div>
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShopByCollection;
