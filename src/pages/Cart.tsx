import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Icons } from '../components/Icons';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import BottomNav from '../components/BottomNav';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, favorites } = useCart();
  const [coupon, setCoupon] = useState('');
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-8">
        <div className="mx-auto h-32 w-32 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300">
          <Icons.ShoppingCart size={64} />
        </div>
        <h1 className="text-3xl font-black">سلة التسوق فارغة</h1>
        <p className="text-zinc-500 font-bold max-w-xs mx-auto">يبدو أنك لم تضف أي منتجات بعد. ابدأ بالتسوق الآن!</p>
        <Link to="/products" className="inline-block bg-black text-white px-10 py-4 rounded-2xl font-black hover:bg-accent transition-all">
          تصفح المنتجات
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black">سلة التسوق</h1>
        <span className="bg-zinc-100 px-4 py-2 rounded-2xl text-sm font-bold text-zinc-500">
           {items.length} منتجات
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative flex gap-6 bg-white p-4 sm:p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all"
              >
                <Link to={`/product/${item.id}`} className="h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-50 border">
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </Link>
                
                <div className="flex flex-col flex-1 justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link to={`/product/${item.id}`} className="font-black text-lg hover:text-accent transition-colors line-clamp-1">{item.name}</Link>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Icons.X size={18} />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-xs font-bold mt-1 uppercase tracking-wider">{item.category}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-black">{formatCurrency(item.price)}</span>
                    
                    <div className="flex items-center bg-zinc-50 rounded-xl p-1 gap-3">
                       <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:scale-105 transition-all"
                       >
                         <Icons.Minus size={14} />
                       </button>
                       <span className="w-4 text-center font-black text-sm">{item.quantity}</span>
                       <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         className="h-8 w-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:scale-105 transition-all"
                       >
                         <Icons.Plus size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link to="/products" className="flex items-center gap-2 text-zinc-400 font-bold hover:text-black transition-colors pt-4">
             <Icons.ArrowRight size={18} className="rotate-180" />
             متابعة التسوق
          </Link>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-2xl space-y-8 sticky top-24">
            <h2 className="text-2xl font-black">تفاصيل الفاتورة</h2>
            
            <div className="space-y-4">
               <div className="flex justify-between text-zinc-500 font-bold">
                 <span>المجموع الجزئي</span>
                 <span>{formatCurrency(totalPrice)}</span>
               </div>
               <div className="flex justify-between text-zinc-500 font-bold">
                 <span>التوصيل</span>
                 <span className="text-green-500">مجاني</span>
               </div>
               <div className="flex justify-between text-zinc-500 font-bold">
                 <span>الخصم</span>
                 <span>-{formatCurrency(0)}</span>
               </div>
               <div className="h-px bg-zinc-100 my-4" />
               <div className="flex justify-between text-2xl font-black">
                 <span>الإجمالي</span>
                 <span className="text-accent">{formatCurrency(totalPrice)}</span>
               </div>
            </div>

            <div className="relative">
               <Icons.Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
               <input 
                 value={coupon}
                 onChange={e => setCoupon(e.target.value)}
                 type="text" 
                 placeholder="كود الخصم"
                 className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl h-14 pr-12 pl-4 outline-none focus:border-accent font-bold transition-all"
               />
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:bg-accent transition-all delay-75"
            >
              إتمام الطلب
            </button>

            <div className="flex items-center justify-center gap-3 text-zinc-300">
               <Icons.CreditCard size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest leading-none">مدفوعات آمنة 100%</span>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
