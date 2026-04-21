import React, { useState, useEffect } from 'react';
import { collection, query, limit, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { Icons } from '../components/Icons';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/home/HeroSlider';
import CategoriesSection from '../components/home/CategoriesSection';
import BottomNav from '../components/BottomNav';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const prodRef = collection(db, 'products');
        
        // Featured / New
        const qNew = query(prodRef, orderBy('createdAt', 'desc'), limit(8));
        const snapNew = await getDocs(qNew);
        setFeatured(snapNew.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Offers
        const qOffers = query(prodRef, where('isOffer', '==', true), limit(4));
        const snapOffers = await getDocs(qOffers);
        setOffers(snapOffers.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Bestsellers
        const qBest = query(prodRef, where('isBestseller', '==', true), limit(4));
        const snapBest = await getDocs(qBest);
        setBestsellers(snapBest.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-32">
      {/* Hero */}
      <HeroSlider />

      {/* Categories */}
      <CategoriesSection />

      {/* Special Offers Section */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <Icons.Tag size={22} />
             </div>
             <h2 className="text-2xl font-black">عروض حصرية</h2>
          </div>
          <Link to="/products?filter=offers" className="text-sm font-bold text-accent">المزيد</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-96 bg-zinc-100 rounded-[2rem] animate-pulse" />)
           ) : (
             offers.length > 0 ? (
               offers.map(p => <ProductCard key={p.id} product={p} />)
             ) : (
               <div className="col-span-full p-12 bg-zinc-50 rounded-[2.5rem] border border-dashed text-center">
                  <p className="text-zinc-400 font-bold">لا يوجد عروض في الوقت الحالي</p>
               </div>
             )
           )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <Icons.TrendingUp size={22} />
             </div>
             <h2 className="text-2xl font-black">الأكثر مبيعاً</h2>
          </div>
          <Link to="/products?filter=bestsellers" className="text-sm font-bold text-accent">المزيد</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-96 bg-zinc-100 rounded-[2rem] animate-pulse" />)
           ) : (
             bestsellers.map(p => <ProductCard key={p.id} product={p} />)
           )}
        </div>
      </section>

      {/* Secondary Banner */}
      <section className="relative h-60 md:h-80 rounded-[2.5rem] overflow-hidden group">
         <img src="https://picsum.photos/seed/offer/1920/600" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
         <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-8">
            <div className="max-w-lg">
               <h3 className="text-3xl md:text-5xl font-black text-white mb-4">جودة تليق بك</h3>
               <p className="text-white/80 font-bold mb-8">نضمن لك أفضل تجربة تسوق بأعلى معايير الجودة</p>
               <Link to="/products" className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all">تصفح الآن</Link>
            </div>
         </div>
      </section>

      {/* New Arrivals */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Icons.Clock size={22} />
             </div>
             <h2 className="text-2xl font-black">وصلنا حديثاً</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-accent">المزيد</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {loading ? (
             [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-96 bg-zinc-100 rounded-[2rem] animate-pulse" />)
           ) : (
             featured.map(p => <ProductCard key={p.id} product={p} />)
           )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
