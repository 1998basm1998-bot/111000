import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import BottomNav from '../components/BottomNav';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.displayName || '',
    phone: '',
    governorate: '',
    city: '',
    fullAddress: '',
    milestone: '',
    paymentMethod: 'cod' as 'cod' | 'transfer',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.isGuest) {
      alert("يجب تسجيل الدخول لإتمام الطلب");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        customerName: form.fullName,
        customerPhone: form.phone,
        address: {
          governorate: form.governorate,
          city: form.city,
          fullAddress: form.fullAddress,
          milestone: form.milestone,
        },
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl
        })),
        subtotal: totalPrice,
        discount: 0,
        total: totalPrice,
        status: 'pending',
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error(error);
      alert("فشل إرسال الطلب، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="py-20 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto h-32 w-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
        >
          <Icons.Package size={64} />
        </motion.div>
        <h1 className="text-4xl font-black">طلبك قيد المراجعة!</h1>
        <p className="text-zinc-500 font-bold max-w-md mx-auto">شكراً لثقتك بنا. تم استلام طلبك بنجاح وسنقوم بالتواصل معك لتأكيد الشحن في أقرب وقت.</p>
        <Link to="/account" className="inline-block bg-black text-white px-12 py-4 rounded-2xl font-black transition-all hover:scale-105">
          متابعة الطلب
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32">
      <div className="mb-12">
         <h1 className="text-4xl font-black mb-4">إتمام الطلب</h1>
         <div className="flex items-center gap-2 text-zinc-400 font-bold">
            <Link to="/cart" className="hover:text-black transition-colors">السلة</Link>
            <Icons.ChevronLeft size={16} className="rotate-180" />
            <span className="text-black">بيانات الشحن</span>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Shipping Info */}
        <div className="space-y-10">
           <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-8">
              <h3 className="text-2xl font-black">عنوان التوصيل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-black mb-3 text-zinc-600">الاسم الثلاثي</label>
                    <input 
                      required 
                      value={form.fullName}
                      onChange={e => setForm({...form, fullName: e.target.value})}
                      className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold focus:border-accent outline-none transition-all" 
                      placeholder="محمد علي..."
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-black mb-3 text-zinc-600">رقم الهاتف</label>
                    <input 
                      required 
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold text-left focus:border-accent outline-none transition-all" 
                      placeholder="07XXXXXXXX"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-black mb-3 text-zinc-600">المحافظة</label>
                    <input 
                      required 
                      value={form.governorate}
                      onChange={e => setForm({...form, governorate: e.target.value})}
                      className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold focus:border-accent outline-none transition-all" 
                      placeholder="اسم المحافظة"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-black mb-3 text-zinc-600">المدينة / المنطقة</label>
                    <input 
                      required 
                      value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                      className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold focus:border-accent outline-none transition-all" 
                      placeholder="المنطقة"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-black mb-3 text-zinc-600">عنوان السكن بالكامل</label>
                    <input 
                      required 
                      value={form.fullAddress}
                      onChange={e => setForm({...form, fullAddress: e.target.value})}
                      className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold focus:border-accent outline-none transition-all" 
                      placeholder="رقم الشارع، الدار..."
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-black mb-3 text-zinc-600">أقرب نقطة دالة</label>
                    <input 
                      required 
                      value={form.milestone}
                      onChange={e => setForm({...form, milestone: e.target.value})}
                      className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold focus:border-accent outline-none transition-all" 
                      placeholder="مقابل جامع..."
                    />
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-8">
              <h3 className="text-2xl font-black">خيار الدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                  type="button"
                  onClick={() => setForm({...form, paymentMethod: 'cod'})}
                  className={cn(
                    "p-6 rounded-3xl border-2 flex flex-col gap-4 text-right transition-all",
                    form.paymentMethod === 'cod' ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                  )}
                 >
                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-black text-white">
                      <Icons.CreditCard size={22} />
                   </div>
                   <div>
                      <p className="font-black text-lg">دفع عند الاستلام</p>
                      <p className="text-xs text-zinc-500 font-bold">ادفع نقداً عند استلام طلبيتك</p>
                   </div>
                 </button>
                 
                 <button 
                  type="button"
                  onClick={() => setForm({...form, paymentMethod: 'transfer'})}
                  className={cn(
                    "p-6 rounded-3xl border-2 flex flex-col gap-4 text-right transition-all opacity-40 cursor-not-allowed",
                    form.paymentMethod === 'transfer' ? "border-black bg-zinc-50" : "border-zinc-100"
                  )}
                 >
                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-200 text-zinc-500">
                      <Icons.CreditCard size={22} />
                   </div>
                   <div>
                      <p className="font-black text-lg">تحويل بنكي</p>
                      <p className="text-xs text-zinc-500 font-bold">عبر زين كاش أو المحافظ (قريباً)</p>
                   </div>
                 </button>
              </div>
           </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-8">
           <div className="bg-zinc-900 text-white p-10 rounded-[2.5rem] shadow-2xl space-y-10 sticky top-24">
              <h3 className="text-2xl font-black"> ملخص طلبيتك</h3>
              
              <div className="max-h-60 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-4 items-center">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                         <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-black line-clamp-1">{item.name}</p>
                         <p className="text-xs text-zinc-400 font-bold leading-none mt-1">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <p className="text-sm font-black">{formatCurrency(item.price * item.quantity)}</p>
                   </div>
                 ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-white/10">
                 <div className="flex justify-between font-bold text-zinc-400">
                    <span>المجموع الجزئي</span>
                    <span>{formatCurrency(totalPrice)}</span>
                 </div>
                 <div className="flex justify-between font-bold text-zinc-400">
                    <span>التوصيل</span>
                    <span className="text-green-400">مجاني</span>
                 </div>
                 <div className="flex justify-between font-black text-2xl pt-4 border-t border-white/10">
                    <span>الإجمالي</span>
                    <span className="text-accent">{formatCurrency(totalPrice)}</span>
                 </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full h-16 bg-white text-black rounded-2xl font-black text-lg hover:bg-accent hover:text-white transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
              >
                {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الطلب الآن'}
                {!isSubmitting && <Icons.ChevronLeft size={20} className="rotate-0" />}
              </button>
           </div>
        </div>
      </form>
      <BottomNav />
    </div>
  );
}
