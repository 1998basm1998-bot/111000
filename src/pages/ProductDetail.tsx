import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Icons } from '../components/Icons';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const favorite = id ? isFavorite(id) : false;

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          
          // Fetch related
          const q = query(
            collection(db, 'products'), 
            where('category', '==', data.category),
            limit(4)
          );
          const relatedSnap = await getDocs(q);
          setRelatedProducts(
            relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Product))
              .filter(p => p.id !== id)
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 pt-4"
    >
      {/* Navigation Header */}
      <div className="mb-8 flex items-center justify-between sticky top-24 z-30 bg-zinc-50/80 backdrop-blur-md py-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 font-bold hover:text-black transition-colors"
        >
          <Icons.ChevronLeft className="rotate-180" size={20} />
          رجوع
        </button>
        <button 
          onClick={() => navigate('/')}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white border shadow-sm text-zinc-400 hover:text-red-500 transition-colors"
        >
          <Icons.X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: Images */}
        <div className="space-y-6">
          <motion.div 
            layoutId={`img-${product.id}`}
            className="aspect-[4/5] overflow-hidden rounded-[3rem] bg-white border border-zinc-100 shadow-xl"
          >
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          </motion.div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                  activeImage === i ? "border-accent scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} className="h-full w-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest leading-none">
                {product.category}
              </span>
              <button 
                onClick={() => toggleFavorite(product)}
                className={cn(
                  "p-3 rounded-2xl transition-all",
                  favorite ? "bg-red-500 text-white" : "bg-zinc-100 text-zinc-400"
                )}
              >
                <Icons.Heart size={20} fill={favorite ? "currentColor" : "none"} />
              </button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-zinc-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-amber-500">
                    {[1,2,3,4,5].map(s => <Icons.Star key={s} size={16} fill={s <= Math.floor(product.rating || 5) ? "currentColor" : "none"} />)}
                  </div>
                  <span className="text-sm font-bold text-zinc-400">({product.reviewsCount || 0} مراجعة)</span>
               </div>
               <div className={cn("px-3 py-1 rounded-lg text-xs font-black bg-green-50 text-green-600", product.stock === 0 && "bg-red-50 text-red-600")}>
                  {product.stock > 0 ? 'متوفر في المخزون' : 'نفذت الكمية'}
               </div>
            </div>
          </div>

          <div className="flex items-end gap-3">
             <span className="text-4xl font-black text-accent">{formatCurrency(product.price)}</span>
             {product.oldPrice && (
               <span className="text-xl text-zinc-300 line-through mb-1 font-bold">{formatCurrency(product.oldPrice)}</span>
             )}
             {product.oldPrice && (
               <span className="mb-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter">
                 وفر {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
               </span>
             )}
          </div>

          <div className="h-px bg-zinc-100 w-full" />

          {/* Quantity and Actions */}
          <div className="flex flex-col sm:flex-row gap-6">
             <div className="flex items-center bg-zinc-100 rounded-2xl p-2 gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:scale-105 transition-all"
                >
                  <Icons.Minus size={18} />
                </button>
                <span className="w-8 text-center text-lg font-black">{quantity}</span>
                <button 
                   onClick={() => setQuantity(quantity + 1)}
                   className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:scale-105 transition-all"
                >
                  <Icons.Plus size={18} />
                </button>
             </div>
             
             <div className="flex-1 flex gap-3">
                <button 
                  onClick={() => addToCart({...product, quantity})}
                  className="flex-1 bg-black text-white rounded-2xl font-black text-lg hover:bg-accent transition-all duration-300 shadow-xl shadow-black/10 active:scale-95"
                >
                  إضافة للسلة
                </button>
                <button 
                   className="flex-1 bg-accent text-white rounded-2xl font-black text-lg hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-accent/10 active:scale-95"
                >
                  شراء الآن
                </button>
             </div>
          </div>

          {/* Tabs */}
          <div className="border-t pt-8">
             <div className="flex gap-8 mb-6 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'desc', label: 'الوصف' },
                  { id: 'specs', label: 'المواصفات' },
                  { id: 'reviews', label: 'التقييمات' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "text-lg font-black pb-2 border-b-4 transition-all whitespace-nowrap",
                      activeTab === tab.id ? "border-accent text-black" : "border-transparent text-zinc-300 hover:text-zinc-500"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>
             
             <div className="min-h-[100px] text-zinc-500 leading-relaxed font-medium">
                {activeTab === 'desc' && <p>{product.description}</p>}
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-4">
                    {product.specs?.map((s, i) => (
                      <div key={i} className="flex flex-col p-4 bg-zinc-50 rounded-2xl">
                        <span className="text-xs font-black text-zinc-400 mb-1">{s.label}</span>
                        <span className="font-bold text-zinc-800">{s.value}</span>
                      </div>
                    )) || <p>لا يوجد مواصفات مضافة</p>}
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <p className="text-sm font-bold">لا توجد مراجعات بعد. كن أول من يقيم هذا المنتج!</p>
                  </div>
                )}
             </div>
          </div>

          {/* Badges/Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t">
             {[
               { icon: Icons.Package, label: 'توصيل لباب البيت', sub: 'خلال 48 ساعة' },
               { icon: Icons.CreditCard, label: 'دفع آمن', sub: 'تشفير وحماية' },
               { icon: Icons.Clock, label: 'ضمان استبدال', sub: 'خلال 14 يوم' },
               { icon: Icons.Tag, label: 'أفضل سعر', sub: 'ضمان التوفير' }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center text-center p-4">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm border mb-3">
                    <item.icon size={22} />
                  </div>
                  <span className="text-[11px] font-black leading-tight text-zinc-800">{item.label}</span>
                  <span className="text-[9px] font-bold text-zinc-400 mt-0.5">{item.sub}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h3 className="text-2xl font-black mb-8">منتجات قد تعجبك أيضاً</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
