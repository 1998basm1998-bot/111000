import React from 'react';
import { motion } from 'motion/react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'عطور', icon: '✨', bg: 'bg-rose-50', text: 'text-rose-600' },
  { name: 'ملابس', icon: '👗', bg: 'bg-blue-50', text: 'text-blue-600' },
  { name: 'أحذية', icon: '👟', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { name: 'إلكترونيات', icon: '📱', bg: 'bg-violet-50', text: 'text-violet-600' },
  { name: 'إكسسوارات', icon: '👜', bg: 'bg-amber-50', text: 'text-amber-600' },
  { name: 'ساعات', icon: '⌚', bg: 'bg-indigo-50', text: 'text-indigo-600' },
];

export default function CategoriesSection() {
  return (
    <section className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-black">تسوق حسب القسم</h2>
        <Link to="/products" className="text-sm font-bold text-accent hover:underline">عرض الكل</Link>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -5 }}
          >
            <Link 
              to={`/products?category=${cat.name}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-3xl ${cat.bg} flex items-center justify-center text-4xl shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:scale-110`}>
                {cat.icon}
              </div>
              <span className="text-sm font-black text-zinc-700">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
