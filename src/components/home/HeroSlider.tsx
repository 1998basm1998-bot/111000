import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'motion/react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    title: "تشكيلة الصيف الجديدة",
    subtitle: "وصلت الآن أحدث صيحات الموضة",
    image: "https://picsum.photos/seed/summer/1920/1080",
    buttonText: "تسوق المجموعة",
    color: "bg-blue-600"
  },
  {
    title: "عروض الساعات الفاخرة",
    subtitle: "خصومات تصل إلى 40% على أرقى الماركات",
    image: "https://picsum.photos/seed/watch/1910/1070",
    buttonText: "اكتشف العروض",
    color: "bg-zinc-900"
  },
  {
    title: "قسم العطور العالمي",
    subtitle: "روائح تمنحك الثقة والتميز في كل مناسبة",
    image: "https://picsum.photos/seed/perfume/1900/1060",
    buttonText: "اطلب الآن",
    color: "bg-amber-600"
  }
];

export default function HeroSlider() {
  return (
    <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 5000 }}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <img 
                src={slide.image} 
                className="absolute inset-0 h-full w-full object-cover" 
                alt={slide.title} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
              
              <div className="container relative mx-auto flex h-full items-center px-8 md:px-20 text-right">
                <div className="max-w-2xl space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="inline-block rounded-full bg-accent/20 px-4 py-1 text-sm font-black text-accent backdrop-blur-md">
                      خصومات حصرية
                    </span>
                    <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-7xl">
                      {slide.title}
                    </h2>
                    <p className="mt-4 text-lg font-medium text-zinc-300 md:text-2xl">
                      {slide.subtitle}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                  >
                    <Link 
                      to="/products"
                      className="group flex items-center justify-center gap-3 rounded-2xl bg-accent px-10 py-4 text-lg font-black text-white shadow-xl shadow-accent/20 transition-all hover:scale-105 hover:bg-orange-600"
                    >
                      {slide.buttonText}
                      <Icons.ArrowRight size={20} className="rotate-180 transition-transform group-hover:-translate-x-2" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
