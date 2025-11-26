import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import './Insta.css';

function Insta() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [gap, setGap] = useState('20px');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'instaCollections'));
        let collectionsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            alt: doc.data().title || 'Collection'
          }))
          .sort((a, b) => (a.createdAt?.toDate?.() || new Date()) - (b.createdAt?.toDate?.() || new Date()));

        // Fallback to hardcoded collections if no data in Firestore
        if (collectionsData.length === 0) {
          collectionsData = [
            {
              id: 'default-1',
              image: "/images/in1.jpeg",
              alt: "Wales Bonner Collection",
              title: "adidas Originals by Wales Bonner",
              description: "Fall/Winter 2025. Live and direct.",
              cta: "Shop Now",
              hasLogo: true,
              brandName: "Wales Bonner",
              isBordered: true
            },
            {
              id: 'default-2',
              image: "/images/in3.jpeg",
              alt: "Tokyo Collection",
              title: "TOKYO",
              description: "Low Profile Shoes Inspired by the '70s Running Style.",
              cta: "Shop Now",
              hasLogo: true,
              brandName: "",
              isBordered: true
            },
            {
              id: 'default-3',
              image: "/images/in4.jpeg",
              alt: "Fear of God Athletics",
              title: "Fear of God Athletics",
              description: "Form, function, and focus.",
              cta: "Shop now",
              hasLogo: false,
              brandName: "",
              isBordered: true
            },
            {
              id: 'default-4',
              image: "/images/in2.jpeg",
              alt: "George Russell F1",
              title: "Exclusive F1 Signed Cap from George Russell",
              description: "This is your chance to win a George Russell signed cap. Redeem your adiclub points this...",
              cta: "Participate Now",
              hasLogo: false,
              brandName: "",
              isBordered: true
            },
            {
              id: 'default-5',
              image: "https://brand.assets.adidas.com/image/upload/f_auto,q_auto,fl_lossy/if_w_gt_800,w_800/plp_tc_push_ss24_predator_bellingham_d_0cf67ef5b7.jpg",
              alt: "Bellingham Collection",
              title: "Bellingham",
              description: "Dance to your own drum.",
              cta: "Shop now",
              hasLogo: false,
              brandName: "",
              isBordered: false
            }
          ];
        }

        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
        // Fallback to hardcoded on error
        setCollections([
          {
            id: 'default-1',
            image: "/images/in1.jpeg",
            alt: "Wales Bonner Collection",
            title: "adidas Originals by Wales Bonner",
            description: "Fall/Winter 2025. Live and direct.",
            cta: "Shop Now",
            hasLogo: true,
            brandName: "Wales Bonner",
            isBordered: true
          },
          {
            id: 'default-2',
            image: "/images/in3.jpeg",
            alt: "Tokyo Collection",
            title: "TOKYO",
            description: "Low Profile Shoes Inspired by the '70s Running Style.",
            cta: "Shop Now",
            hasLogo: true,
            brandName: "",
            isBordered: true
          },
          {
            id: 'default-3',
            image: "/images/in4.jpeg",
            alt: "Fear of God Athletics",
            title: "Fear of God Athletics",
            description: "Form, function, and focus.",
            cta: "Shop now",
            hasLogo: false,
            brandName: "",
            isBordered: true
          },
          {
            id: 'default-4',
            image: "/images/in2.jpeg",
            alt: "George Russell F1",
            title: "Exclusive F1 Signed Cap from George Russell",
            description: "This is your chance to win a George Russell signed cap. Redeem your adiclub points this...",
            cta: "Participate Now",
            hasLogo: false,
            brandName: "",
            isBordered: true
          },
          {
            id: 'default-5',
            image: "https://brand.assets.adidas.com/image/upload/f_auto,q_auto,fl_lossy/if_w_gt_800,w_800/plp_tc_push_ss24_predator_bellingham_d_0cf67ef5b7.jpg",
            alt: "Bellingham Collection",
            title: "Bellingham",
            description: "Dance to your own drum.",
            cta: "Shop now",
            hasLogo: false,
            brandName: "",
            isBordered: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setVisibleCards(2);
        setGap('0px');
      } else if (width <= 768) {
        setVisibleCards(2);
        setGap('0px');
      } else if (width <= 1200) {
        setVisibleCards(3);
        setGap('20px');
      } else {
        setVisibleCards(4);
        setGap('20px');
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  const slideCarousel = (direction) => {
    const maxIndex = collections.length - visibleCards;
    if (direction === 'next') {
      setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    } else {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  };

  if (loading) {
    return (
      <section className="collections-section">
        <h2 className="section-title">WHAT'S HOT</h2>
        <div className="loading">Loading collections...</div>
      </section>
    );
  }

  return (
    <section className="collections-section">
      {/* Section Title */}
      <h2 className="section-title">WHAT'S HOT</h2>
      <div className="carousel-wrapper">
        <div className="carousel-container">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              gap: gap
            }}
          >
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`collection-card ${collection.isBordered ? 'card-bordered' : ''}`}
                style={{
                  minWidth: gap === '0px' ? `${100 / visibleCards}%` : `calc(${100 / visibleCards}% - 15px)`,
                  flexShrink: 0
                }}
              >
                <div className="card-image">
                  <img src={collection.image} alt={collection.alt} />
                  {collection.hasLogo && (
                    <div className="card-logo">
                      <svg className="adidas-logo" viewBox="0 0 50 50" fill="#fff">
                        <path d="M25 5L5 45h8l12-30 12 30h8L25 5z"/>
                      </svg>
                      {collection.brandName && (
                        <span className="brand-name">{collection.brandName}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{collection.title}</h3>
                  <p className="card-description">{collection.description}</p>
                  <button className="card-cta" onClick={() => console.log(`Clicked ${collection.title}`)}>{collection.cta}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          className="nav-button prev"
          onClick={() => slideCarousel('prev')}
          disabled={currentIndex === 0}
        >
          <span className="sr-only">Previous</span>
        </button>
        <button
          className="nav-button next"
          onClick={() => slideCarousel('next')}
          disabled={currentIndex >= collections.length - visibleCards}
        >
          <span className="sr-only">Next</span>
        </button>
      </div>
    </section>
  );
}

export default Insta;
