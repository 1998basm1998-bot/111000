import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, getDocs, orderBy, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order, Category } from '../types';
import { Icons } from '../components/Icons';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogOut, Eye, CheckCircle, UploadCloud, ImageIcon, XCircle } from 'lucide-react';

// === Image Compression to Base64 (Directly inside Firestore) ===
const compressImage = (file: File, maxWidth = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Compress heavily to JPEG with 0.4 quality for lightweight Base64 string to fit within Firestore limit
          resolve(canvas.toDataURL('image/jpeg', 0.4));
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Admin() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1001') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
    } else {
      setError('الرمز السري غير صحيح');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-zinc-100 text-center space-y-8"
        >
          <div className="mx-auto h-24 w-24 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/20">
            <Lock size={40} />
          </div>
          <div>
             <h1 className="text-4xl font-black mb-2 tracking-tight">لوحة الإدارة</h1>
             <p className="text-zinc-500 font-bold">يرجى إدخال رمز المرور (1001)</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
               <input 
                 type="password"
                 value={passcode}
                 onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                 placeholder="••••"
                 className="w-full h-20 bg-zinc-50 border-2 rounded-3xl px-6 text-center text-5xl tracking-[1em] font-black focus:border-black outline-none transition-all"
                 autoFocus
               />
               <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 font-bold text-sm mt-3">{error}</motion.p>
                  )}
               </AnimatePresence>
            </div>
            
            <button type="submit" className="w-full h-16 bg-accent text-white rounded-2xl font-black text-xl hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-accent/20 active:scale-95 flex justify-center items-center gap-2">
              <Lock size={20} /> دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'نظرة عامة', icon: Icons.BarChart3, path: '/admin' },
    { id: 'products', label: 'إدارة المنتجات', icon: Icons.Package, path: '/admin/products' },
    { id: 'colors', label: 'إدارة الأقسام', icon: Icons.LayoutDashboard, path: '/admin/categories' },
    { id: 'orders', label: 'تتبع الطلبات', icon: Icons.ShoppingBag, path: '/admin/orders' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-28 bg-white p-6 rounded-[3rem] border border-zinc-100 shadow-xl shadow-black/5 space-y-2">
          <div className="flex items-center gap-4 mb-8 p-2">
             <div className="h-16 w-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-black/20">
               <Icons.Store size={28} className="text-accent" />
             </div>
             <div>
                <h3 className="font-black text-xl leading-tight">متجري</h3>
                <p className="text-sm rounded-full font-bold text-accent cursor-pointer hover:underline mt-1" onClick={handleLogout}>تسجيل خروج الإدارة</p>
             </div>
          </div>
          {menuItems.map(item => {
            const isActive = (item.id === 'dashboard' && location.pathname === '/admin') || 
                            (item.id !== 'dashboard' && location.pathname.includes(item.id));
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300",
                  isActive 
                    ? "bg-black text-white shadow-xl shadow-black/10 scale-105" 
                    : "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-black"
                )}
              >
                <item.icon size={22} className={cn(isActive ? 'text-accent' : '')} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-6 mt-6 border-t border-zinc-100">
            <Link to="/" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={22} />
              عودة للمتجر
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-6 md:p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-black/5 min-h-[70vh]">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, totalSales: 0 });

  useEffect(() => {
    async function fetchStats() {
      const prodSnap = await getDocs(collection(db, 'products'));
      const orderSnap = await getDocs(collection(db, 'orders'));
      const orders = orderSnap.docs.map(doc => doc.data() as Order);
      const sales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
      setStats({
        products: prodSnap.size,
        orders: orderSnap.size,
        totalSales: sales
      });
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'إجمالي المبيعات', value: formatCurrency(stats.totalSales), icon: Icons.BarChart3, color: 'text-accent', bg: 'bg-orange-50' },
    { label: 'الطلبات الواردة', value: stats.orders, icon: Icons.ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'المنتجات النشطة', value: stats.products, icon: Icons.Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-12">
      <h2 className="text-4xl font-black">نظرة عامة على المتجر</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="p-8 rounded-[2rem] border border-zinc-100 shadow-sm bg-white flex flex-col justify-between h-48 hover:shadow-xl transition-all">
            <div className={cn("p-4 w-fit rounded-2xl", card.bg, card.color)}>
              <card.icon size={28} />
            </div>
            <div>
              <p className="text-zinc-500 font-bold mb-1">{card.label}</p>
              <h3 className="text-3xl font-black">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2 text-center md:text-right">
          <h3 className="text-3xl font-black mb-2">ارفع مبيعاتك!</h3>
          <p className="text-zinc-400 font-bold max-w-md leading-relaxed">أضف منتجات مميزة بأقسام واضحة واجذب العملاء بالعروض الترويجية الحصرية.</p>
        </div>
        <Link to="/admin/products" className="relative z-10 bg-accent px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all text-white shadow-xl shadow-accent/20">
          إضافة منتج جديد
        </Link>
      </div>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', description: '', price: '', oldPrice: '', category: '', 
    imageUrl: '', additionalImages: [] as string[], stock: '',
    isNew: false, isBestseller: false, isOffer: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  }

  async function fetchCategories() {
    const snap = await getDocs(collection(db, 'categories'));
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const base64Data = await compressImage(file);
      setForm(prev => ({ ...prev, imageUrl: base64Data }));
    } catch (error) {
      console.error(error);
      alert('فشل ضغط الصورة. يرجى التأكد من اختيار صورة صحيحة.');
    } finally {
      setUploadingMain(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    setUploadingAdditional(true);
    
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        const base64Data = await compressImage(file);
        newUrls.push(base64Data);
      }
      setForm(prev => ({ ...prev, additionalImages: [...prev.additionalImages, ...newUrls] }));
    } catch (error) {
      console.error(error);
      alert('فشل تحويل الصور الإضافية.');
    } finally {
      setUploadingAdditional(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      alert("الصورة الرئيسية مطلوبة!");
      return;
    }
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      category: form.category,
      imageUrl: form.imageUrl,
      images: [form.imageUrl, ...form.additionalImages],
      stock: parseInt(form.stock),
      rating: editingProduct?.rating || 4.5,
      reviewsCount: editingProduct?.reviewsCount || 0,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      isOffer: form.isOffer,
      updatedAt: serverTimestamp(),
      createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
      } else {
        await addDoc(collection(db, 'products'), data);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (e: any) { 
      console.error(e); 
      alert("حدث خطأ أثناء الحفظ. قد يكون حجم الصورة كبيراً جداً على قاعدة البيانات: " + e.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
    await deleteDoc(doc(db, 'products', id));
    fetchProducts();
  };

  const openModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setForm({
        name: p.name,
        description: p.description,
        price: p.price.toString(),
        oldPrice: p.oldPrice ? p.oldPrice.toString() : '',
        category: p.category,
        imageUrl: p.imageUrl,
        additionalImages: p.images ? p.images.slice(1) : [],
        stock: p.stock.toString(),
        isNew: p.isNew || false,
        isBestseller: p.isBestseller || false,
        isOffer: p.isOffer || false,
      });
    } else {
      setEditingProduct(null);
      setForm({ 
        name: '', description: '', price: '', oldPrice: '', category: '', 
        imageUrl: '', additionalImages: [], stock: '',
        isNew: false, isBestseller: false, isOffer: false
      });
    }
    setShowManualUrl(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-black">إدارة المنتجات</h2>
           <p className="text-zinc-500 font-bold mt-1">عرض، إضافة وتعديل بضائع المتجر</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-black/10 hover:bg-accent transition-all hover:-translate-y-1"
        >
          <Icons.Plus size={20} /> إضافة منتج
        </button>
      </div>

      <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-zinc-200/50 text-zinc-400">
              <th className="py-6 px-6 font-bold whitespace-nowrap">المنتج</th>
              <th className="py-6 px-6 font-bold whitespace-nowrap">القسم</th>
              <th className="py-6 px-6 font-bold whitespace-nowrap">السعر</th>
              <th className="py-6 px-6 font-bold whitespace-nowrap">المخزون</th>
              <th className="py-6 px-6 font-bold whitespace-nowrap">التصنيفات</th>
              <th className="py-6 px-6 font-bold whitespace-nowrap text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-zinc-200/50 last:border-0 hover:bg-white transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0">
                       <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-black max-w-[200px] line-clamp-2">{p.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 font-bold text-zinc-500">{p.category}</td>
                <td className="py-4 px-6">
                   <p className="font-black text-accent mb-1">{formatCurrency(p.price)}</p>
                   {p.oldPrice && <p className="text-xs text-zinc-400 line-through font-bold">{formatCurrency(p.oldPrice)}</p>}
                </td>
                <td className="py-4 px-6">
                   <span className={cn("px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1", p.stock < 1 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700")}>
                    {p.stock} قطعة {p.stock < 1 && <Icons.AlertCircle size={10} />}
                   </span>
                </td>
                <td className="py-4 px-6">
                   <div className="flex gap-1 flex-wrap">
                      {p.isBestseller && <span className="bg-amber-100 text-amber-600 px-2 flex items-center justify-center rounded text-[10px] font-black h-5">الأكثر مبيعاً</span>}
                      {p.isNew && <span className="bg-blue-100 text-blue-600 px-2 flex items-center justify-center rounded text-[10px] font-black h-5">جديد</span>}
                      {p.isOffer && <span className="bg-red-100 text-red-600 px-2 flex items-center justify-center rounded text-[10px] font-black h-5">عرض</span>}
                   </div>
                </td>
                <td className="py-4 px-6 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(p)} className="p-3 bg-white border border-zinc-100 shadow-sm hover:!bg-blue-50 hover:!border-blue-100 text-blue-500 rounded-xl transition-all"><Icons.LayoutDashboard size={18} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-3 bg-white border border-zinc-100 shadow-sm hover:!bg-red-50 hover:!border-red-100 text-red-500 rounded-xl transition-all"><Icons.Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-3xl rounded-[3rem] p-8 md:p-12 max-h-[90vh] overflow-y-auto">
              <h3 className="text-3xl font-black mb-8">{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <label className="block text-sm font-bold mb-2">اسم المنتج (إلزامي)</label>
                   <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl px-6 h-14 outline-none font-bold" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2">سعر البيع (إلزامي)</label>
                   <input required type="number" step="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl px-6 h-14 outline-none font-bold text-left" dir="ltr" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2">السعر قبل الخصم (اختياري)</label>
                   <input type="number" step="1" value={form.oldPrice} onChange={e => setForm({...form, oldPrice: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl px-6 h-14 outline-none font-bold text-left" dir="ltr" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2">القسم (إلزامي)</label>
                   <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl px-6 h-14 outline-none font-bold">
                     <option value="">-- يرجى اختيار القسم --</option>
                     {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2">كمية المخزون (إلزامي)</label>
                   <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl px-6 h-14 outline-none font-bold text-left" dir="ltr" />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-bold mb-3">الصورة الرئيسية للمنتج (إلزامي)</label>
                   <div className="flex flex-col gap-4 bg-zinc-50 border border-zinc-200 rounded-3xl p-6">
                      {form.imageUrl ? (
                         <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                            <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            <button type="button" onClick={() => setForm({...form, imageUrl: ''})} className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-md hover:scale-110 transition-all">
                               <Icons.X size={16} />
                            </button>
                         </div>
                      ) : (
                         <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
                               <UploadCloud size={20} />
                               {uploadingMain ? 'جاري التحويل...' : 'رفع صورة من الجهاز'}
                               <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} disabled={uploadingMain} />
                            </label>
                            <span className="text-zinc-400 text-sm font-bold">أو</span>
                            <button type="button" onClick={() => setShowManualUrl(!showManualUrl)} className="text-zinc-500 underline font-bold text-sm">
                               {showManualUrl ? 'إلغاء' : 'إدخال رابط يدوي'}
                            </button>
                         </div>
                      )}
                      
                      {showManualUrl && !form.imageUrl && (
                        <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full bg-white border border-zinc-200 focus:border-black rounded-2xl px-6 h-12 outline-none font-bold text-left mt-2" dir="ltr" placeholder="https://" />
                      )}
                   </div>
                </div>

                <div className="md:col-span-2">
                   <label className="block text-sm font-bold mb-3">صور إضافية للمعرض (اختياري)</label>
                   <div className="flex flex-col gap-4 bg-zinc-50 border border-zinc-200 rounded-3xl p-6">
                      <div className="flex flex-wrap gap-4">
                         {form.additionalImages.map((imgUrl, idx) => (
                           <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                              <img src={imgUrl} className="w-full h-full object-cover" alt="Additional" />
                              <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md hover:scale-110 transition-all z-10">
                                 <Icons.X size={14} />
                              </button>
                           </div>
                         ))}
                         
                         <label className="cursor-pointer w-24 h-24 border-2 border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:border-black hover:text-black transition-all bg-white relative">
                            {uploadingAdditional ? (
                               <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full" />
                            ) : (
                               <>
                                 <ImageIcon size={24} className="mb-1" />
                                 <span className="text-[10px] font-bold">رفع صور</span>
                                 <input type="file" multiple accept="image/*" className="hidden" onChange={handleAdditionalImageUpload} disabled={uploadingAdditional} />
                               </>
                            )}
                         </label>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2">
                   <label className="block text-sm font-bold mb-2">وصف تفصيلي (إلزامي)</label>
                   <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl px-6 py-4 outline-none font-bold" rows={4} />
                </div>
                
                {/* Checkboxes */}
                <div className="md:col-span-2 flex flex-wrap gap-6 pt-4 border-t border-zinc-100">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.isBestseller} onChange={e => setForm({...form, isBestseller: e.target.checked})} className="w-6 h-6 rounded-lg accent-black cursor-pointer" />
                      <span className="font-bold group-hover:text-amber-500 transition-colors">الأكثر مبيعاً 🌟</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.isNew} onChange={e => setForm({...form, isNew: e.target.checked})} className="w-6 h-6 rounded-lg accent-black cursor-pointer" />
                      <span className="font-bold group-hover:text-blue-500 transition-colors">منتج جديد ✨</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.isOffer} onChange={e => setForm({...form, isOffer: e.target.checked})} className="w-6 h-6 rounded-lg accent-black cursor-pointer" />
                      <span className="font-bold group-hover:text-red-500 transition-colors">عرض ترويجي 🏷️</span>
                   </label>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-8">
                  <button type="submit" className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-all">حفظ البيانات</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 rounded-2xl border-2 border-zinc-200 font-black text-lg hover:bg-zinc-50 active:scale-95 transition-all text-zinc-500 hover:text-black hover:border-black">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) {
      setSelectedOrder({...selectedOrder, status});
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    processing: 'جاري المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'تم الإلغاء',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-black">الطلبات الواردة</h2>
            <p className="text-zinc-500 font-bold mt-1">تتبع وعالج طلبات الزبائن وتحديث حالتها</p>
         </div>
      </div>
      
      <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-right">
          <thead>
             <tr className="border-b border-zinc-200/50 text-zinc-400">
               <th className="py-6 px-6 font-bold whitespace-nowrap">رقم الطلب و العميل</th>
               <th className="py-6 px-6 font-bold whitespace-nowrap">تاريخ الطلب</th>
               <th className="py-6 px-6 font-bold whitespace-nowrap">الإجمالي</th>
               <th className="py-6 px-6 font-bold whitespace-nowrap">الحالة</th>
               <th className="py-6 px-6 font-bold whitespace-nowrap text-left">التفاصيل</th>
             </tr>
          </thead>
          <tbody>
             {orders.map(o => (
               <tr key={o.id} className="border-b border-zinc-200/50 last:border-0 hover:bg-white transition-colors">
                  <td className="py-4 px-6">
                     <p className="font-black text-lg mb-1">#{o.id.slice(-6).toUpperCase()}</p>
                     <p className="font-bold text-zinc-500 text-sm flex gap-2"><Icons.User size={14} />{o.customerName || 'غير متوفر'}</p>
                  </td>
                  <td className="py-4 px-6 font-bold text-zinc-600">
                     {o.createdAt?.toDate().toLocaleDateString('ar-SA') || ''}
                  </td>
                  <td className="py-4 px-6 font-black text-accent">
                     {formatCurrency(o.total)}
                  </td>
                  <td className="py-4 px-6">
                     <span className={cn("px-4 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1", statusColors[o.status])}>
                       {statusLabels[o.status]}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-left">
                     <button onClick={() => setSelectedOrder(o)} className="inline-flex items-center justify-center p-3 text-black bg-zinc-100 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm">
                       <Eye size={18} />
                     </button>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="py-20 text-center text-zinc-400">
             <Icons.ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
             <p className="font-bold text-lg">لا يوجد طلبات مسجلة بعد</p>
          </div>
        )}
      </div>

      <AnimatePresence>
         {selectedOrder && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="text-2xl font-black mb-1">تفاصيل طلب #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-zinc-500 font-bold">{selectedOrder.createdAt?.toDate().toLocaleString('ar-SA')}</p>
                   </div>
                   <button onClick={() => setSelectedOrder(null)} className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                      <Icons.X size={20} />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50 p-6 rounded-3xl mb-8 border border-zinc-100">
                   <div>
                      <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Icons.MapPin size={14} /> بيانات العميل والشحن</h4>
                      <p className="font-black text-lg mb-1">{selectedOrder.customerName}</p>
                      <p className="font-bold text-zinc-600 mb-1" dir="ltr">{selectedOrder.customerPhone || 'بدون رقم'}</p>
                      {selectedOrder.address ? (
                        <p className="font-medium text-sm text-zinc-600">
                          {selectedOrder.address.governorate} - {selectedOrder.address.city}<br/>
                          {selectedOrder.address.fullAddress}<br/>
                          (أقرب نقطة: {selectedOrder.address.milestone})
                        </p>
                      ) : (
                        <p className="text-red-500 text-sm">تفاصيل العنوان غير متوفرة</p>
                      )}
                   </div>
                   <div>
                      <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Icons.CreditCard size={14} /> حالة الطلب والدفع</h4>
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value as Order['status'])}
                        className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-2xl text-sm font-black outline-none mb-3 shadow-sm focus:border-black"
                      >
                        <option value="pending">قيد الانتظار (جديد)</option>
                        <option value="processing">جاري المعالجة (تحضير)</option>
                        <option value="shipped">تم الشحن (مع المندوب)</option>
                        <option value="delivered">تم التوصيل بنجاح</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <p className="font-bold text-sm text-zinc-600">طريقة الدفع: {selectedOrder.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}</p>
                   </div>
                </div>

                <div>
                   <h4 className="font-black text-lg mb-4">المنتجات المطلوبة</h4>
                   <div className="space-y-4">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                           <img src={item.imageUrl} className="h-16 w-16 bg-zinc-100 rounded-xl object-cover" alt={item.name} />
                           <div className="flex-1">
                              <p className="font-black truncate max-w-[200px]">{item.name}</p>
                              <p className="text-zinc-500 font-bold text-sm">{formatCurrency(item.price)} <span className="mx-2 text-zinc-300">|</span> الكمية: {item.quantity}</p>
                           </div>
                           <p className="font-black">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-dashed flex justify-between items-center text-xl">
                      <span className="font-black">الإجمالي الكلي:</span>
                      <span className="font-black text-accent">{formatCurrency(selectedOrder.total)}</span>
                   </div>
                   
                   {selectedOrder.notes && (
                      <div className="mt-6 p-4 bg-amber-50 rounded-2xl text-amber-700">
                         <p className="font-bold text-xs uppercase mb-1">ملاحظات العميل:</p>
                         <p className="font-bold text-sm">{selectedOrder.notes}</p>
                      </div>
                   )}
                </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => { fetchCategories(); }, []);
  async function fetchCategories() {
    const snap = await getDocs(collection(db, 'categories'));
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addDoc(collection(db, 'categories'), { name: newName });
    setNewName('');
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    if(!confirm("احذر، حذف القسم نهائي. هل تريد المتابعة؟")) return;
    await deleteDoc(doc(db, 'categories', id));
    fetchCategories();
  };

  return (
    <div className="space-y-10">
      <div>
         <h2 className="text-3xl font-black">إدارة تصنيفات المتجر</h2>
         <p className="text-zinc-500 font-bold mt-1">تستخدم هذه التصنيفات لتصفية المنتجات في واجهة الموقع</p>
      </div>
      
      <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem]">
        <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-4">
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            className="flex-1 bg-white border border-zinc-200 rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:border-black transition-all" 
            placeholder="أدخل اسم القسم الجديد (مثال: أحذية رياضية)" 
          />
          <button type="submit" className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
            <Icons.Plus size={20} /> إضافة
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map(c => (
          <div key={c.id} className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-black transition-all">
            <span className="font-black text-xl">{c.name}</span>
            <button 
              onClick={() => deleteCategory(c.id)} 
              className="text-zinc-300 hover:text-white bg-transparent hover:bg-red-500 p-3 rounded-xl transition-all shadow-sm"
              title="حذف القسم"
            >
              <Icons.Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
