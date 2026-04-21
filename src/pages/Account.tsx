import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Icons } from '../components/Icons';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Order, Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';

export default function Account() {
  const { user, logout } = useAuth();
  const { favorites } = useCart();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user || user.isGuest) {
        setLoadingOrders(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (activeTab === 'orders') fetchOrders();
  }, [user, activeTab]);

  const tabs = [
    { id: 'profile', label: 'حسابي', icon: Icons.User },
    { id: 'orders', label: 'طلباتي', icon: Icons.ShoppingBag },
    { id: 'favorites', label: 'المفضلة', icon: Icons.Heart },
  ];

  if (user?.isGuest && activeTab !== 'profile') {
     return (
       <div className="py-20 text-center space-y-6">
          <div className="mx-auto h-24 w-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
             <Icons.Info size={48} />
          </div>
          <h2 className="text-2xl font-black">تحتاج لتسجيل الدخول</h2>
          <p className="text-zinc-500 font-bold max-w-xs mx-auto">هذه الميزة متاحة فقط للمستخدمين المسجلين عبر Google.</p>
          <button onClick={() => logout()} className="bg-black text-white px-8 py-3 rounded-2xl font-black">تسجيل الدخول</button>
          <BottomNav />
       </div>
     )
  }

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-[2rem] bg-zinc-100 border overflow-hidden shadow-xl">
             {user?.photoURL ? (
               <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
             ) : (
               <div className="h-full w-full flex items-center justify-center text-zinc-300">
                  <Icons.User size={40} />
               </div>
             )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900">{user?.displayName || 'زائر'}</h1>
            <p className="text-zinc-400 font-bold">{user?.isGuest ? 'مستخدم زائر' : user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2 text-red-500 font-black px-6 py-3 rounded-2xl hover:bg-red-50 transition-all border border-red-100"
        >
          <Icons.X size={18} />
          تسجيل الخروج
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-12 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 text-lg font-black transition-all border-b-4",
              activeTab === tab.id ? "border-accent text-black" : "border-transparent text-zinc-300 hover:text-zinc-500"
            )}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
             <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
                <h3 className="text-xl font-black mb-4">بيانات الحساب الأساسية</h3>
                <div className="space-y-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-zinc-400">الاسم</span>
                      <span className="font-black text-lg">{user?.displayName}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-zinc-400">البريد الإلكتروني</span>
                      <span className="font-black text-lg">{user?.email || 'غير متاح'}</span>
                   </div>
                </div>
                <button className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black">تعديل البيانات</button>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
                <h3 className="text-xl font-black mb-4">العناوين المحفوظة</h3>
                <div className="py-8 text-center text-zinc-400 border border-dashed rounded-3xl">
                   <Icons.MapPin size={32} className="mx-auto mb-2 opacity-20" />
                   <p className="font-bold">لم تضف أي عنوان بعد</p>
                </div>
                <button className="w-full h-14 bg-accent text-white rounded-2xl font-black">إضافة عنوان جديد</button>
             </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
             {loadingOrders ? (
               <div className="py-20 text-center"><div className="h-10 w-10 animate-spin border-4 border-accent border-t-transparent mx-auto rounded-full" /></div>
             ) : orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                           <Icons.Package size={32} />
                        </div>
                        <div>
                           <p className="text-lg font-black">طلب رقم #{order.id.slice(-6).toUpperCase()}</p>
                           <p className="text-sm font-bold text-green-500">حالة الطلب: {order.status}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-12 text-right">
                        <div>
                           <p className="text-xs font-bold text-zinc-400">التاريخ</p>
                           <p className="font-black">{order.createdAt?.toDate().toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-zinc-400">الإجمالي</p>
                           <p className="font-black text-accent">{formatCurrency(order.total)}</p>
                        </div>
                        <button className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-black transition-all">
                           <Icons.ChevronLeft size={20} className="rotate-180" />
                        </button>
                     </div>
                  </div>
                ))
             ) : (
                <div className="py-20 text-center text-zinc-400">
                   <Icons.ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                   <p className="font-black">ليس لديك أي طلبات سابقة</p>
                </div>
             )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div 
            key="favorites"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
             {favorites.length > 0 ? (
                favorites.map(p => (
                   <ProductCard key={p.id} product={p} />
                ))
             ) : (
                <div className="col-span-full py-20 text-center text-zinc-400">
                   <Icons.Heart size={64} className="mx-auto mb-4 opacity-10" />
                   <p className="font-black">قائمة المفضلة فارغة</p>
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
