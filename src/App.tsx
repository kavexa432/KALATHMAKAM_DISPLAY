import { useState, useEffect } from 'react';
import { FestivalProvider } from './shared/context/FestivalContext';
import { Navbar } from './frontend/website/components/Navbar';
import { Hero } from './frontend/website/components/Hero';
import { LeaderboardSection } from './frontend/website/components/LeaderboardSection';
import { LoginModal } from './shared/components/LoginModal';
import { DisplayPage } from './pages/DisplayPage';

export function AppContent() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isDisplayMode, setIsDisplayMode] = useState(false);

  // Check if URL has /display route (pathname, hash, or search param)
  useEffect(() => {
    const checkDisplayMode = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      setIsDisplayMode(
        path === '/display' || 
        path.includes('/display') || 
        hash === '#/display' || 
        hash.includes('display') || 
        search.includes('display')
      );
    };

    checkDisplayMode();
    window.addEventListener('popstate', checkDisplayMode);
    window.addEventListener('hashchange', checkDisplayMode);
    return () => {
      window.removeEventListener('popstate', checkDisplayMode);
      window.removeEventListener('hashchange', checkDisplayMode);
    };
  }, []);

  const handleViewLeaderboard = () => {
    const el = document.getElementById('leaderboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If display mode, show fullscreen display
  if (isDisplayMode) {
    return <DisplayPage />;
  }

  // Normal website mode
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] relative font-sans-manrope selection:bg-[#FF5E84] selection:text-white overflow-x-hidden">
      
      {/* Navigation Bar */}
      <Navbar onOpenLogin={() => setLoginModalOpen(true)} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero
          onViewLeaderboard={handleViewLeaderboard}
        />

        {/* Leaderboard Section */}
        <LeaderboardSection />
      </main>

      {/* Auth Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

    </div>
  );
}

export function App() {
  return (
    <FestivalProvider>
      <AppContent />
    </FestivalProvider>
  );
}

export default App;
