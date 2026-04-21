import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { path: '/', icon: Icons.Home, label: 'الرئيسية' },
    { path: '/products', icon: Icons.LayoutDashboard, label: 'التصنيفات' },
    { path: '/cart', icon: Icons.ShoppingCart, label: 'السلة', badge: totalItems },
    { path: '/favorites', icon: Icons.Heart, label: 'المفضلة' },
    { path: '/account', icon: Icons.User, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden print:hidden">
      <div className="bg-white/80 backdrop-blur-lg border-t border-zinc-100 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-accent scale-110" : "text-zinc-400"
              )}
            >
              <div className="relative">
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Spacer for bottom safe area */}
      <div className="bg-white h-safe-area-bottom w-full" />
    </div>
  );
}
