import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Icons } from '../components/Icons';
import { cn } from '../lib/utils';
import BottomNav from '../components/BottomNav';
import { useSearchParams } from 'react-router-dom';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'bestseller'>('newest');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const prodSnapshot = await getDocs(collection(db, 'products'));
        const productsData = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);

        const catSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => p.price <= priceRange)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestseller') return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      return b.createdAt - a.createdAt;
    });

  return (
    <div className="pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">المتجر</h1>
          <p className="text-zinc-400 font-bold mt-1">تصفح وجد ما يناسبك</p>
        </div>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex lg:hidden items-center gap-2 px-6 py-3 bg-white rounded-2xl border font-bold shadow-sm"
        >
          <Icons.Filter size={18} />
          تصفية
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filter */}
        <aside className={cn(
          "lg:w-72 lg:block space-y-10",
          !isFilterOpen && "hidden"
        )}>
          {/* Categories */}
          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
               <Icons.LayoutDashboard size={20} className="text-accent" />
               التصنيفات
            </h3>
            <div className="flex flex-col gap-2">
               {['all', ...categories.map(c => c.name)].map(name => (
                 <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={cn(
                    "text-right px-4 py-3 rounded-2xl font-bold transition-all",
                    selectedCategory === name ? "bg-black text-white" : "bg-white text-zinc-500 hover:bg-zinc-100 hover:text-black"
                  )}
                 >
                   {name === 'all' ? 'الكل' : name}
                 </button>
               ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
               <Icons.TrendingUp size={20} className="text-accent" />
               الترتيب حسب
            </h3>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-14 bg-white border rounded-2xl px-6 font-bold outline-none appearance-none cursor-pointer"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="price-asc">الأقل سعراً</option>
              <option value="price-desc">الأعلى سعراً</option>
              <option value="bestseller">الأكثر مبيعاً</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
               <Icons.Tag size={20} className="text-accent" />
               السعر (كحد أقصى)
            </h3>
            <div className="space-y-4 px-2">
               <input 
                 type="range" 
                 min="0" 
                 max="10000" 
                 step="10"
                 value={priceRange}
                 onChange={e => setPriceRange(parseInt(e.target.value))}
                 className="w-full accent-accent"
               />
               <div className="flex justify-between font-black text-sm text-accent">
                  <span>0 ر.س</span>
                  <span>{priceRange} ر.س</span>
               </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 space-y-8">
           {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-zinc-100 rounded-[2rem] animate-pulse" />)}
             </div>
           ) : filteredProducts.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(p => (
                   <div key={p.id}>
                      <ProductCard product={p} />
                   </div>
                ))}
             </div>
           ) : (
             <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200 shadow-sm">
                <Icons.Search size={64} className="mx-auto mb-6 text-zinc-100" />
                <h2 className="text-2xl font-black text-zinc-400">لم نجد أي منتجات تطابق بحثك</h2>
                <button onClick={() => { setSelectedCategory('all'); setPriceRange(10000); }} className="mt-4 text-accent font-bold underline">إعادة ضبط التصفية</button>
             </div>
           )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
