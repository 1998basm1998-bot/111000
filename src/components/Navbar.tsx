import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/20">
                  <Icons.ShoppingBag size={24} />
                </div>
                <span className="hidden sm:block">متجري</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-8">
                {['الرئيسية', 'المتجر', 'العروض', 'عن المتجر'].map((item, i) => (
                  <Link 
                    key={item} 
                    to={i === 1 ? '/products' : '/'} 
                    className="text-sm font-bold text-zinc-500 hover:text-black transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-3 text-zinc-500 hover:bg-zinc-50 rounded-2xl transition-all"
              >
                <Icons.Search size={20} />
              </button>

              <div className="relative">
                <button className="p-3 text-zinc-500 hover:bg-zinc-50 rounded-2xl transition-all">
                  <Icons.Bell size={20} />
                </button>
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </div>

              <Link to="/cart" className="relative p-3 text-zinc-500 hover:bg-zinc-50 rounded-2xl transition-all">
                <Icons.ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-black text-white ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="h-8 w-px bg-zinc-100 mx-2 hidden md:block" />

              <Link to="/account" className="hidden md:flex items-center gap-3 p-1 pl-4 rounded-2xl hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100">
                <div className="h-9 w-9 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" />
                   ) : (
                     <div className="h-full w-full flex items-center justify-center text-zinc-400">
                        <Icons.User size={20} />
                     </div>
                   )}
                </div>
                <div className="text-right">
                   <p className="text-xs font-black leading-tight">{user?.displayName || 'حسابي'}</p>
                   <p className="text-[10px] text-zinc-400 font-bold">{user?.isGuest ? 'زائر' : 'عضو مفضل'}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md p-4 pt-20"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Icons.Search className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400" size={24} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="عن ماذا تبحث اليوم؟"
                  className="w-full bg-white rounded-3xl h-16 pr-16 pl-20 text-lg font-bold outline-none shadow-2xl"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-100 px-4 py-2 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-200"
                >
                  إغلاق (Esc)
                </button>
              </div>

              <div className="mt-8 p-8 bg-white/10 rounded-3xl border border-white/20">
                <p className="text-white/60 text-sm font-bold mb-4">عمليات بحث شائعة</p>
                <div className="flex flex-wrap gap-2">
                  {['عطور', 'ملابس نسائية', 'ساعات ذكية', 'أحذية رياضية'].map(tag => (
                    <button key={tag} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white hover:text-black transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
