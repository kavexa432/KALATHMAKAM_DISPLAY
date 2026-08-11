import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Wifi, WifiOff, MapPin } from 'lucide-react';
import { useFestival } from '../shared/context/FestivalContext';
import { houseColors } from '../shared/tokens/designTokens';
import type { HouseId } from '../shared/types/festivalTypes';

// Official House Emblem Images
import vegaEmblem from '../assets/houses/vega.png';
import novaEmblem from '../assets/houses/nova.png';
import orionEmblem from '../assets/houses/orion.png';
import astraEmblem from '../assets/houses/astra.png';
import logoImage from '../assets/kalathmakam_2k26_logo.png';

const houseEmblems: Record<HouseId, string> = {
  VEGA: vegaEmblem,
  NOVA: novaEmblem,
  ORION: orionEmblem,
  ASTRA: astraEmblem,
  NONE: '',
};

export const DisplayDashboard: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals, results } = useFestival();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [breakingNews, setBreakingNews] = useState([
    "ASTRA extends lead to 89 points!",
    "New Winner: Anchoring (Cat III) — ASTRA",
    "Next Event: Mohiniyattam — Main Auditorium at 02:00 PM"
  ]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState(0);

  const categories = ['All', 'Music', 'Dance', 'Literary', 'Fine Arts'];

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate breaking news every 8 seconds
  useEffect(() => {
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % breakingNews.length);
    }, 8000);
    return () => clearInterval(newsTimer);
  }, [breakingNews.length]);

  // Rotate category filters every 15 seconds
  useEffect(() => {
    const categoryTimer = setInterval(() => {
      setCategoryFilter((prev) => (prev + 1) % categories.length);
    }, 15000);
    return () => clearInterval(categoryTimer);
  }, [categories.length]);

  // Calculate standings
  const standings = houses
    .map((h) => {
      const houseId = h.id as HouseId;
      const pts = getHousePoints(houseId);
      const medals = getHouseMedals(houseId);
      
      const houseResults = results.filter((r) => r.houseId === houseId && r.status === 'Published');
      const todayDelta = houseResults.slice(0, 5).reduce((sum, r) => sum + r.points, 0);
      
      return {
        ...h,
        points: pts,
        medals,
        todayDelta,
        totalParticipants: 65, // This should come from Firebase
      };
    })
    .sort((a, b) => b.points - a.points);

  const leaderHouse = standings[0];
  const secondHouse = standings[1];
  const leadDifference = leaderHouse?.points - (secondHouse?.points || 0);

  // Recent results for activity feed
  const recentResults = results
    .filter(r => r.status === 'Published')
    .slice(0, 6)
    .map((r, i) => ({
      ...r,
      time: `${10 + Math.floor(i / 2)}:${20 + (i % 2) * 20} AM`,
      isWinner: r.position === '1st',
    }));

  // Calculate next event (mock data - should come from schedule)
  const nextEvent = {
    title: 'Mohiniyattam',
    subtitle: 'Classical Dance Competition',
    venue: 'Main Auditorium',
    time: '02:00 PM',
    timeUntil: { hours: 3, minutes: 35, seconds: 45 }
  };

  const totalContestants = standings.reduce((sum, house) => sum + house.totalParticipants, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F5F3F0] text-[#111111] font-sans-manrope overflow-hidden">
      
      {/* HEADER - Festival Identity & Live Status */}
      <header className="bg-gradient-to-r from-[#111111] to-[#2B2B2B] text-white px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img
            src={logoImage}
            alt="Kalathmakam 2K26"
            className="h-16 w-auto object-contain drop-shadow-md"
          />
          <div>
            <h1 className="font-serif-cormorant text-3xl font-bold leading-tight">
              KALATHMAKAM 2K26
            </h1>
            <p className="text-white/80 text-sm font-semibold tracking-wider uppercase">
              Grand Arts Festival
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Live Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-white">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider">LIVE</span>
            </div>
          </div>

          {/* Real-time Clock */}
          <div className="text-right">
            <div className="text-2xl font-black tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
            <div className="text-xs text-white/70 font-semibold">
              {currentTime.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>

          {/* Quote/Message */}
          <div className="text-right max-w-xs">
            <p className="text-sm italic text-white/90 leading-relaxed">
              "Creativity is intelligence having fun."
            </p>
            <p className="text-xs text-white/60 mt-1">- Albert Einstein</p>
          </div>

          {/* Total Contestants */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
            <div className="text-2xl font-black text-white">
              {totalContestants}+
            </div>
            <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
              Total Contestants
            </div>
          </div>
        </div>
      </header>

      {/* BREAKING NEWS TICKER */}
      <div className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] text-white px-8 py-3 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-extrabold uppercase tracking-wider">Breaking News</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div 
              className="whitespace-nowrap text-sm font-bold animate-marquee"
              style={{
                transform: `translateX(-${currentNewsIndex * 100}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            >
              {breakingNews[currentNewsIndex]}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 p-8 grid grid-cols-12 gap-8">
        
        {/* LEFT SECTION - House Score Cards */}
        <div className="col-span-8 space-y-6">
          
          {/* House Cards Grid */}
          <div className="grid grid-cols-4 gap-6">
            {standings.map((house, index) => {
              const houseId = house.id as HouseId;
              const colorInfo = houseColors[houseId];
              const isLeader = index === 0;
              
              const rankBadges = [
                { text: 'RANK #1', bg: 'bg-[#F59E0B] text-white', icon: '👑' },
                { text: 'RANK #2', bg: 'bg-slate-200 text-slate-800', icon: '🥈' },
                { text: 'RANK #3', bg: 'bg-amber-200 text-amber-800', icon: '🥉' },
                { text: 'RANK #4', bg: 'bg-slate-100 text-slate-600', icon: '4️⃣' },
              ];

              return (
                <div
                  key={house.id}
                  className={`relative rounded-3xl p-6 bg-white transition-all duration-500 ${
                    isLeader 
                      ? 'shadow-2xl ring-4 ring-[#F59E0B]/30 transform scale-105' 
                      : 'shadow-lg hover:shadow-xl'
                  }`}
                  style={{
                    borderTop: `6px solid ${colorInfo.primary}`,
                  }}
                >
                  {/* Crown for leader */}
                  {isLeader && (
                    <div className="absolute -top-4 left-8 bg-[#F59E0B] text-white p-2 rounded-full shadow-lg">
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}

                  {/* Rank Badge */}
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold mb-4 ${rankBadges[index].bg}`}>
                    <span>{rankBadges[index].icon}</span>
                    <span>{rankBadges[index].text}</span>
                  </div>

                  {/* House Identity */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center">
                      <img
                        src={houseEmblems[houseId]}
                        alt={house.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-2xl font-black uppercase tracking-wider leading-none"
                        style={{ color: colorInfo.primary }}
                      >
                        {house.name}
                      </h3>
                      <p className="text-xs text-[#5F5F5F] font-semibold mt-1">
                        {house.totalParticipants}+ Contestants
                      </p>
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-[#111111]">
                        {house.points}
                      </span>
                      <span className="text-sm font-bold text-[#5F5F5F] uppercase">
                        Points
                      </span>
                    </div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">
                      ▲ +{house.todayDelta} Today
                    </div>
                  </div>

                  {/* Medal Tally */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-lg">🥇</div>
                      <div className="font-bold">{house.medals.gold}</div>
                    </div>
                    <div>
                      <div className="text-lg">🥈</div>
                      <div className="font-bold">{house.medals.silver}</div>
                    </div>
                    <div>
                      <div className="text-lg">🥉</div>
                      <div className="font-bold">{house.medals.bronze}</div>
                    </div>
                  </div>

                  <div className="text-center mt-3">
                    <span className="text-xs font-bold text-[#5F5F5F]">
                      {house.medals.gold + house.medals.silver + house.medals.bronze} Total Medals
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Victories & Live Activity */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#111111] flex items-center gap-3">
                <Trophy className="w-6 h-6 text-[#F59E0B]" />
                Recent Victories & Live Activity
              </h2>
              
              {/* Auto-rotating category filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5F5F5F] font-semibold">Filter:</span>
                <div className="px-3 py-1 rounded-full bg-[#111111] text-white text-xs font-bold">
                  {categories[categoryFilter]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {recentResults.slice(0, 6).map((result, index) => (
                <div 
                  key={result.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF8F5] hover:bg-white transition-colors"
                >
                  <div className="text-2xl shrink-0">
                    {result.isWinner ? '🏆' : '🏅'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        result.isWinner 
                          ? 'bg-[#F59E0B] text-white' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {result.isWinner ? 'NEW WINNER' : 'NEW RESULT'}
                      </span>
                      <span className="text-xs text-[#5F5F5F] font-medium">
                        {result.time}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-sm text-[#111111] truncate">
                      {result.eventTitle}
                    </h4>
                    <p className="text-xs text-[#5F5F5F] truncate">
                      {result.position} • {result.participantName} • {result.studentClass}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black" style={{ color: houseColors[result.houseId as HouseId]?.primary }}>
                      {result.houseId}
                    </div>
                    <div className="text-xs font-bold text-emerald-600">
                      +{result.points} PTS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Current Champion & Leaderboard */}
        <div className="col-span-4 space-y-6">
          
          {/* Current Champion Panel */}
          <div className="bg-gradient-to-br from-[#111111] to-[#2B2B2B] text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 opacity-10">
              <Trophy className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-bold uppercase tracking-wider mb-3">
                <Trophy className="w-4 h-4" />
                Current Champion
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FFA033] p-1">
                  <div className="w-full h-full bg-[#111111] rounded-xl flex items-center justify-center">
                    <img
                      src={houseEmblems[leaderHouse?.id as HouseId]}
                      alt={leaderHouse?.name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-white">
                    HOUSE {leaderHouse?.name}
                  </h3>
                  <div className="text-3xl font-black text-[#F59E0B]">
                    {leaderHouse?.points} PTS
                  </div>
                </div>
              </div>
              
              <p className="text-white/70 text-sm">
                Leading by +{leadDifference} points ahead of 2nd place
              </p>
            </div>
          </div>

          {/* House Leaderboard Table */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-black text-[#111111] mb-6 flex items-center gap-2">
              📊 House Leaderboard
            </h3>
            
            <div className="space-y-3">
              {standings.map((house, index) => {
                const houseId = house.id as HouseId;
                const colorInfo = houseColors[houseId];
                
                return (
                  <div 
                    key={house.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      index === 0 
                        ? 'bg-gradient-to-r from-[#F59E0B]/10 to-[#FFA033]/10 border-2 border-[#F59E0B]/30' 
                        : 'bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="text-2xl font-black text-[#5F5F5F] w-8">
                      {index + 1}
                    </div>
                    
                    <img
                      src={houseEmblems[houseId]}
                      alt={house.name}
                      className="w-8 h-8 object-contain"
                    />
                    
                    <div className="flex-1">
                      <div 
                        className="font-black text-sm uppercase tracking-wider"
                        style={{ color: colorInfo.primary }}
                      >
                        {house.name}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 text-center text-xs">
                      <div>
                        <div className="font-bold text-[#111111]">{house.points}</div>
                        <div className="text-[#5F5F5F]">PTS</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#F59E0B]">{house.medals.gold}</div>
                        <div className="text-[#5F5F5F]">🥇</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#5F5F5F]">{house.medals.silver}</div>
                        <div className="text-[#5F5F5F]">🥈</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#CD7F32]">{house.medals.bronze}</div>
                        <div className="text-[#5F5F5F]">🥉</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Event Panel */}
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Clock className="w-24 h-24" />
            </div>
            
            <div className="relative z-10">
              <div className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-3">
                Upcoming Event
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2">
                {nextEvent.time}
              </h3>
              
              <h4 className="text-xl font-bold text-white mb-1">
                {nextEvent.title}
              </h4>
              
              <p className="text-blue-200 text-sm mb-4">
                {nextEvent.subtitle}
              </p>
              
              <div className="flex items-center gap-2 text-blue-200 text-sm mb-6">
                <MapPin className="w-4 h-4" />
                {nextEvent.venue}
              </div>
              
              {/* Countdown */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-white">
                    {String(nextEvent.timeUntil.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-blue-200 uppercase font-bold">
                    Hours
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {String(nextEvent.timeUntil.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-blue-200 uppercase font-bold">
                    Minutes
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {String(nextEvent.timeUntil.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-blue-200 uppercase font-bold">
                    Seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - Live Status */}
      <footer className="bg-[#111111] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-bold">
              {isConnected ? '● LIVE UPDATES ENABLED' : '● RECONNECTING...'}
            </span>
          </div>
          
          <span className="text-xs text-white/60">
            Last updated: {currentTime.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-bold text-white/90 italic">
            Celebrate Art • Celebrate Talent • Celebrate Unity
          </p>
        </div>
      </footer>
    </div>
  );
};