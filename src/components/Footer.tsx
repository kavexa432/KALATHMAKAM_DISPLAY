import React from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#111111] text-white pt-20 pb-12 relative overflow-hidden">
      
      {/* Top subtle gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5E84] via-[#FF8A00] to-[#7A3CF5]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5E84] to-[#FF8A00] p-[2px]">
                <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FF5E84]" />
                </div>
              </div>
              <span className="font-malayalam font-extrabold text-3xl text-white">
                കലാത്മകം <span className="text-[#FF5E84] font-sans-manrope text-xl font-bold">2K26</span>
              </span>
            </div>

            <p className="font-sans-manrope text-xs text-gray-400 max-w-sm leading-relaxed">
              The Grand Arts Festival of MGM Model School, Ayiroor, Varkala. Celebrating classical dance, music, dramatic theatre, painting, and literature.
            </p>

            <p className="font-sans-manrope text-xs font-semibold text-[#FF8A00]">
              "Where Art Breathes, Talent Flourishes."
            </p>

            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
              <span className="text-[11px] font-sans-manrope text-gray-400">Made by</span>
              <span className="text-[11px] font-sans-manrope font-extrabold text-[#FF5E84]">Vaishnavi L, IX B</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-cormorant text-xl font-bold text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-sans-manrope text-gray-400">
              <li><a href="#home" className="hover:text-[#FF5E84] transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-[#FF5E84] transition-colors">About Kalathmakam</a></li>
              <li><a href="#events" className="hover:text-[#FF5E84] transition-colors">Competitions & Bento Grid</a></li>
              <li><a href="#schedule" className="hover:text-[#FF5E84] transition-colors">3-Day Timeline</a></li>
              <li><a href="#gallery" className="hover:text-[#FF5E84] transition-colors">Photo Highlights</a></li>
              <li><a href="#committee" className="hover:text-[#FF5E84] transition-colors">Executive Committee</a></li>
            </ul>
          </div>

          {/* School Location Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif-cormorant text-xl font-bold text-white">
              MGM Model School Campus
            </h4>
            <p className="text-xs font-sans-manrope text-gray-400 leading-relaxed">
              Ayiroor P.O, Varkala, Thiruvananthapuram, Kerala 695310, India.
            </p>
            <p className="text-xs font-sans-manrope text-gray-400">
              Phone: +91 94470 12345 / 0470 2695200
            </p>
            <p className="text-xs font-sans-manrope text-gray-400">
              Email: kavexa432@gmail.com
            </p>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans-manrope text-gray-500">
          <p>© 2026 MGM Model School, Ayiroor, Varkala. All rights reserved.</p>
          
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[#FF5E84] flex items-center justify-center transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
