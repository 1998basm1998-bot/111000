import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Icons } from './Icons';
import { useCart } from '../context/CartContext';
import { formatCurrency, cn } from '../lib/utils';

export default function ProductCard({ product }: { product: Product, key?: any }) {
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const favorite = isFavorite(product.id);

  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white rounded-3xl border border-zinc-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-transparent"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">جديد</span>
        )}
        {discount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-tighter">-{discount}%</span>
        )}
        {product.isBestseller && (
          <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-tighter">الأكثر مبيعاً</span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product);
        }}
        className={cn(
          "absolute top-4 right-4 z-10 p-2.5 rounded-2xl backdrop-blur-md transition-all duration-300",
          favorite ? "bg-red-500 text-white" : "bg-white/80 text-zinc-400 hover:text-red-500"
        )}
      >
        <Icons.Heart size={18} fill={favorite ? "currentColor" : "none"} />
      </button>

      {/* Image Area */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-zinc-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center gap-1 text-amber-500">
            <Icons.Star size={10} fill="currentColor" />
            <span className="text-xs font-bold">{product.rating || '4.5'}</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} className="mb-3 block text-base font-bold text-zinc-800 line-clamp-1 hover:text-accent transition-colors">
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-black">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-zinc-400 line-through">{formatCurrency(product.oldPrice)}</span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-red-500 mt-1">بقي {product.stock} فقط!</span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-accent hover:-translate-y-1 active:scale-95"
          >
            <Icons.Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
