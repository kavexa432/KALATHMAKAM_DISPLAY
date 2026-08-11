import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Trophy, Building2, MapPin, Sparkles } from 'lucide-react';
import heroArt from '../../../assets/hero_kerala_art_transparent.png';

interface HeroProps {
  onViewLeaderboard: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewLeaderboard }) => {
  return (
    <section
      id="home"
      className="relative pt-20 sm:pt-22 lg:pt-24 pb-4 min-h-[75vh] lg:min-h-[82vh] max-h-[920px] flex flex-col justify-between overflow-hidden bg-[#FAF8F5]"
    >
      {/* Warm Golden Cream Ambient Backdrop Glow */}
      <div
        className="absolute top-1/4 right-1/4 w-[700px] h-[600px] pointer-events-none -z-10 blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 235, 215, 0.9) 0%, rgba(255, 220, 200, 0.3) 60%, transparent 80%)',
        }}
      />

      {/* Main Container max-width: 1500px */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        
        {/* Main Grid: Vertically Centered Grid Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* Left Social Bar */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-2.5 text-[#5F5F5F] -mt-6">
            <a
              href="https://mgmmodelschool.edu.in"
              target="_blank"
              rel="noreferrer"
              aria-label="Official Website"
              className="w-8 h-8 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#10B981] hover:scale-110 transition-all duration-300"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.facebook.com/MGMModelSchoolAyiroorVarkala/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#3B82F6] hover:scale-110 transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
            </a>
            <a
              href="https://www.youtube.com/@mgmmodelschoolvarkala2839"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 rounded-full bg-white border border-black/8 shadow-2xs flex items-center justify-center hover:text-[#EF4444] hover:scale-110 transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>

            <div className="w-[1px] h-7 bg-black/12 my-0.5" />

            <span className="[writing-mode:vertical-lr] rotate-180 text-[8.5px] font-sans-manrope font-extrabold tracking-[0.22em] text-[#5F5F5F] uppercase">
              FOLLOW US
            </span>
          </div>

          {/* Left Content Column */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left space-y-4 relative z-30 max-w-2xl xl:max-w-3xl -mt-4 lg:-mt-6">
            
            {/* Sub-Badge */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-sans-manrope font-extrabold tracking-[0.24em] text-[#FF5E84] uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E84]" />
              <span>KALATHMAKAM 2K26</span>
            </motion.div>

            {/* Dominant Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-[78px] xl:text-[86px] font-bold leading-[1.04] tracking-tight text-[#111111]"
            >
              Where{' '}
              <span className="inline-flex items-baseline whitespace-nowrap">
                <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent">
                  Art
                </span>
              </span>
              ,<br />
              <span className="whitespace-nowrap">
                <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent">
                  Talent
                </span>{' '}
                Flourishes.
              </span>
            </motion.h1>

            {/* Description Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans-manrope text-sm sm:text-base lg:text-lg text-[#5F5F5F] max-w-[460px] lg:max-w-[500px] leading-relaxed font-medium"
            >
              The Grand Arts Fest of
              <br />
              <strong className="text-[#111111] font-semibold">MGM Model School, Ayiroor, Varkala.</strong>
              <br />
              A celebration of creativity, culture and expression.
            </motion.p>

            {/* Action Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto"
            >
              {/* Primary Pill: Leaderboard */}
              <button
                onClick={onViewLeaderboard}
                className="gradient-btn-primary text-white font-sans-manrope font-bold text-xs sm:text-sm px-6 py-3.5 sm:py-3 rounded-full flex items-center justify-center gap-2.5 cursor-pointer group shadow-md hover:scale-[1.02] transition-all w-full sm:w-auto shrink-0"
              >
                <Trophy className="w-4 h-4 text-white" />
                <span>View Leaderboard</span>
                <svg className="w-4 h-4 fill-white transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {/* Large Display Mode Button */}
              <button
                onClick={() => window.location.href = '/display'}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-sans-manrope font-bold text-xs sm:text-sm px-6 py-3.5 sm:py-3 rounded-full flex items-center justify-center gap-2.5 cursor-pointer group shadow-md hover:scale-[1.02] transition-all w-full sm:w-auto shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>📺 Large Display Mode</span>
              </button>
            </motion.div>

            {/* Quick Highlights / Key Festival Stats Strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-[#5F5F5F] font-sans-manrope"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-[#FF5E84] shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs sm:text-sm text-[#111111] block leading-none">100+</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#5F5F5F]">Competitions</span>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-black/10 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#FF8A00] shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs sm:text-sm text-[#111111] block leading-none">4 House Teams</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#5F5F5F]">Vega • Nova • Orion • Astra</span>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-black/10 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs sm:text-sm text-[#111111] block leading-none">7 Main Stages</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#5F5F5F]">MGM Campus</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Grand Prominent Hero Emblem */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end items-center relative z-10 lg:-ml-8 xl:-ml-14">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1.08 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[640px] xl:max-w-[720px] 2xl:max-w-[780px] aspect-square flex items-center justify-center gpu-render animate-gentle-float shrink-0"
            >
              <img
                src={heroArt}
                alt="Kalathmakam 2K26 Cultural Arts Emblem - Kathakali, Mohiniyattam, Theyyam, Chenda, Open Book"
                className="w-full h-full object-contain filter drop-shadow-[0_25px_55px_rgba(255,94,132,0.22)] scale-105"
              />
            </motion.div>

          </div>

        </div>

      </div>

      {/* Soft Watercolor Bottom Transition Gradient Overlay */}
      <div className="h-10 w-full bg-gradient-to-b from-transparent via-[#FAF8F5]/80 to-[#FAF8F5] pointer-events-none relative z-20" />

    </section>
  );
};
