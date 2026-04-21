import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import { motion } from 'motion/react';

export default function Login() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-50 overflow-y-auto pt-20 pb-20">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl mx-4"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 text-center space-y-12 border border-zinc-100">
           <div className="space-y-4">
              <div className="mx-auto h-20 w-20 bg-black text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/20">
                 <Icons.ShoppingBag size={40} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">أهلاً بك في متجري</h1>
              <p className="text-zinc-400 font-bold">اكتشف تجربة تسوق عالمية بين يديك</p>
           </div>

           <div className="space-y-4">
              <button
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="group relative w-full h-16 bg-white border-2 border-zinc-100 rounded-2xl flex items-center justify-center gap-4 hover:border-black transition-all active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
                <span className="text-lg font-black">{loading ? 'جاري التحميل...' : 'تسجيل الدخول عبر Google'}</span>
              </button>

              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                 <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-zinc-300 font-black">أو</span></div>
              </div>

              <button
                onClick={() => signInAsGuest()}
                className="w-full h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-xl shadow-black/10 active:scale-95"
              >
                <Icons.User size={22} />
                <span className="text-lg font-black">الدخول كزائر</span>
              </button>
           </div>

           <div className="pt-8">
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest leading-relaxed">
                باستخدامك للتطبيق، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا
              </p>
           </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-zinc-300">
           {['جودة عالية', 'توصيل سريع', 'دفع آمن'].map(text => (
             <div key={text} className="flex items-center gap-2">
                <div className="h-1 w-1 bg-zinc-300 rounded-full" />
                <span className="text-xs font-bold">{text}</span>
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
