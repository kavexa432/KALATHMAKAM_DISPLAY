import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { NotificationDrawer } from './NotificationDrawer';
import logoImage from '../../../assets/kalathmakam_2k26_logo.png';

interface NavbarProps {
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const { currentUser, logout } = useFestival();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Leaderboard', href: '#leaderboard', id: 'leaderboard' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      const sections = navLinks.map((link) => link.id);
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220 && rect.bottom >= 220) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant redirect / view jump handler without long smooth-scrolling delay
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      window.location.hash = '#home';
      setActiveSection('home');
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 68;
      window.scrollTo({ top: topOffset, behavior: 'instant' as ScrollBehavior });
      window.location.hash = `#${targetId}`;
      setActiveSection(targetId);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'glass-nav py-1 shadow-xs' : 'bg-transparent py-1.5'
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px] sm:h-[76px] lg:h-[82px]">
            
            {/* Official Custom Malayalam Calligraphy Logo Image */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
              className="flex items-center gap-2 group shrink-0 py-1"
            >
              <img
                src={logoImage}
                alt="Kalathmakam 2K26 Malayalam Calligraphy Official Logo"
                className="h-11 sm:h-13 lg:h-[68px] xl:h-[76px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] origin-left drop-shadow-2xs"
              />
            </a>

            {/* Desktop Navigation Links (Perfectly Centered & Spaced) */}
            <nav className="hidden lg:flex items-center gap-4.5 xl:gap-7 2xl:gap-9">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className={`relative font-sans-manrope text-[14px] xl:text-[14.5px] font-semibold transition-colors duration-300 ${
                      isActive
                        ? 'text-[#FF5E84] font-bold'
                        : 'text-[#333333] hover:text-[#111111]'
                    }`}
                  >
                    {link.name}
                    {/* Active Link Underline Indicator */}
                    {isActive && (
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-[2px]">
                        <div className="w-3 h-[1px] bg-[#FF5E84]" />
                        <div className="w-1 h-1 rounded-full bg-[#FF5E84]" />
                        <div className="w-3 h-[1px] bg-[#FF5E84]" />
                      </div>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Desktop Auth Pills */}
              <div className="hidden lg:flex items-center gap-3">
                {currentUser ? (
                  <div className="relative" ref={dropdownRef}>
                    
                    {/* Role Button + Profile Trigger Pill */}
                    <div className="flex items-center gap-2">
                      {/* User Profile Avatar Pill Button */}
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="bg-white hover:bg-black/5 border border-black/10 rounded-full px-2.5 py-1 flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                      >
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-6 h-6 rounded-full object-cover border border-black/10"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] text-white flex items-center justify-center font-bold text-[10px]">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-[#111111] max-w-[100px] truncate">
                          {currentUser.name}
                        </span>
                        <svg className="w-3 h-3 text-[#5F5F5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </div>

                    {/* Clean Desktop User Dropdown Panel */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 top-11 w-64 bg-white/98 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl border border-black/10 z-50 text-left animate-in fade-in space-y-2">
                        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-black/6 flex items-center gap-2.5">
                          {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-black/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                              {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111] truncate">
                              {currentUser.name}
                            </h4>
                            <p className="font-sans-manrope text-[11px] text-[#5F5F5F] truncate">
                              {currentUser.email}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 bg-slate-100 text-slate-700">
                            {currentUser.role}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <button
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full py-2 px-3 rounded-xl hover:bg-black/5 text-xs font-bold text-[#5F5F5F] flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Account Settings</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-black/8">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  /* Visitor Desktop Login Button */
                  <button
                    onClick={onOpenLogin}
                    className="bg-white hover:bg-black/5 text-[#111111] font-sans-manrope font-bold text-[13px] px-6 py-1.5 rounded-full flex items-center gap-2 cursor-pointer shadow-sm border border-[#FF5E84] transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-[#FF5E84]" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Hamburger Toggle Button (Always visible on Mobile) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#111111] hover:text-[#FF5E84] shadow-sm cursor-pointer transition-colors lg:hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Clean Integrated Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[60px] bg-[#FAF8F5]/98 backdrop-blur-2xl border-b border-black/10 p-6 shadow-2xl animate-in fade-in max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col gap-2 text-left">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`text-sm font-bold py-2.5 px-4 rounded-xl transition-colors ${
                    activeSection === link.id
                      ? 'bg-[#FF5E84]/15 text-[#FF5E84]'
                      : 'text-[#333333] hover:bg-black/5'
                  }`}
                >
                  {link.name}
                </a>
              ))}

              <div className="h-[1px] bg-black/10 my-3" />

              {/* Mobile Account Profile & Dashboard Actions */}
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-white border border-black/10 space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-black/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-sm">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] truncate">
                        {currentUser.name}
                      </h4>
                      <p className="font-sans-manrope text-[11px] text-[#5F5F5F] truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0 bg-slate-100 text-slate-700">
                      {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-red-50 text-red-600 font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-3 px-4 rounded-2xl gradient-btn-primary text-white font-sans-manrope font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Continue with Google / Login</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </>
  );
};
