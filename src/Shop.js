"use client";

import React, { useState, useEffect } from "react";
import { MacbookScroll, Badge } from "./components/ui/macbook-scroll";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export function Shop() {
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('section', '==', 'home'));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHomeProducts(products);
      } catch (error) {
        console.error('Error fetching home products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F] flex justify-center items-center min-h-[400px]">
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <section className="product-section">
        {homeProducts.length > 0 ? (
          homeProducts.map((product, index) => (
            <MacbookScroll
              key={product.id}
              title={product.name}
              src={product.image}
              badge={<Badge />}
              product={product}
            />
          ))
        ) : (
          <>
            {/* Fallback products if no Firebase data */}
            <MacbookScroll
              title="SPEZIAL"
              src="images/s1.png"
              badge={<Badge />}
              product={{
                id: 'fallback-1',
                name: 'SPEZIAL',
                image: 'images/s1.png',
                category: 'Performance',
                currentPrice: '₹2 400.00',
                originalPrice: '₹5 999.00',
                discount: '-60%'
              }}
            />
            <MacbookScroll
              title="ADIZERO EVO SL"
              src="images/s6.png"
              badge={<Badge />}
              product={{
                id: 'fallback-2',
                name: 'ADIZERO EVO SL',
                image: 'images/s6.png',
                category: 'Sportswear',
                currentPrice: '₹2 240.00',
                originalPrice: '₹5 599.00',
                discount: '-60%'
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}



export default Shop;
