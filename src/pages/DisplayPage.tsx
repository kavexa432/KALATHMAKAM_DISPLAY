import React, { useState, useEffect } from 'react';
import { Clock, Trophy, TrendingUp, Crown, Calendar } from 'lucide-react';
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

// Festival quotes that rotate
const festivalQuotes = [
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Art enables us to find ourselves and lose ourselves at the same time.", author: "Thomas Merton" },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
  { text: "Art is not what you see, but what you make others see.", author: "Edgar Degas" },
];

export const DisplayPage: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals, results } = useFestival();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveCompIndex, setLiveCompIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [breakingNewsIndex, setBreakingNewsIndex] = useState(0);
  const [isConnected] = useState(true); // Firebase connection status

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate quotes every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % festivalQuotes.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // Rotate quotes every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % festivalQuotes.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // Rotate live competitions every 5 seconds
  const liveCompetitions = [
    { name: 'Mohiniyattam', venue: 'Main Auditorium (Stage 1)', cat: 'Cat 2', time: '02:00 PM' },
    { name: 'Violin', venue: 'KG Auditorium (Stage 1)', cat: 'Cat 3', time: '03:05 PM' },
    { name: 'Group Song', venue: 'KG Auditorium (Stage 3)', cat: 'Common', time: '04:00 PM' },
    { name: 'Patriotic Song', venue: 'KG Auditorium (Stage 3)', cat: 'Common', time: '05:45 PM' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCompIndex((prev) => (prev + 1) % liveCompetitions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [liveCompetitions.length]);

  // Compute Live House Standings
  const standings = houses
    .map((h) => {
      const houseId = h.id as HouseId;
      const pts = getHousePoints(houseId);
      const medals = getHouseMedals(houseId);
      
      const houseResults = results.filter((r) => r.houseId === houseId && r.status === 'Published');
      const recentDelta = houseResults.slice(0, 3).reduce((sum, r) => sum + r.points, 0);
      const totalWins = houseResults.length;

      return {
        ...h,
        points: pts,
        medals,
        totalWins,
        recentDelta,
      };
    })
    .sort((a, b) => b.points - a.points);

  const leaderHouse = standings[0];
  const secondHouse = standings[1];
  const leadPointsDiff = leaderHouse ? leaderHouse.points - (secondHouse ? secondHouse.points : 0) : 0;

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Latest updates messages - auto-generated from results
  const latestUpdates = React.useMemo(() => {
    const recentResults = results
      .filter(r => r.status === 'Published' || r.status === 'Verified')
      .slice(0, 3);

    const updates = [];
    
    // Add leader update
    if (leaderHouse) {
      updates.push(`🏆 ${leaderHouse.name} leads with ${leaderHouse.points} points!`);
    }
    
    // Add recent result updates
    recentResults.forEach(result => {
      if (result.houseId !== 'NONE' && result.position === '1st') {
        updates.push(`🥇 New Winner: ${result.eventTitle} — ${result.houseId} (+${result.points} pts)`);
      }
    });
    
    // Add next event
    updates.push(`🎭 Next Event: ${liveCompetitions[liveCompIndex].name} — ${liveCompetitions[liveCompIndex].venue} at ${liveCompetitions[liveCompIndex].time}`);
    
    // Add results count
    const publishedCount = results.filter(r => r.status === 'Published').length;
    if (publishedCount > 0) {
      updates.push(`📊 ${publishedCount} Results Published • 4 Houses Competing • ${houses.length} Total Events`);
    }
    
    // Fallback if no updates
    if (updates.length === 0) {
      updates.push('🎨 Kalathmakam 2K26 Grand Arts Festival is Live!');
      updates.push('📢 Stay tuned for live updates and results');
    }
    
    return updates;
  }, [leaderHouse, results, liveCompetitions, liveCompIndex, houses.length]);

  // Rotate latest updates every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBreakingNewsIndex((prev) => (prev + 1) % latestUpdates.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [latestUpdates.length]);

  // Group results by event for compact display
  const recentCompetitions = React.useMemo(() => {
    const eventMap = new Map<string, any[]>();
    
    results
      .filter((r) => (r.status === 'Published' || r.status === 'Verified') && r.houseId !== 'NONE')
      .forEach((result) => {
        const key = result.eventTitle;
        if (!eventMap.has(key)) {
          eventMap.set(key, []);
        }
        eventMap.get(key)!.push(result);
      });
    
    // Convert to array containing all house competitions
    return Array.from(eventMap.entries())
      .map(([eventTitle, results], i) => ({
        eventTitle,
        results: results.sort((a, b) => {
          const posOrder = { '1st': 1, '2nd': 2, '3rd': 3 };
          return (posOrder[a.position as keyof typeof posOrder] || 999) - 
                 (posOrder[b.position as keyof typeof posOrder] || 999);
        }),
        time: `${10 + Math.floor(i / 2)}:${(i * 15) % 60 < 10 ? '0' : ''}${(i * 15) % 60} ${i >= 4 ? 'PM' : 'AM'}`,
      }));
  }, [results]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#0F172A] overflow-hidden flex flex-col">
      
      {/* PROFESSIONAL HEADER */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          
          {/* Left: Festival Identity */}
          <div className="flex items-center gap-4">
            <img 
              src={logoImage} 
              alt="Kalathmakam 2K26 Logo" 
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="font-serif-cormorant text-2xl font-bold text-[#0F172A] leading-tight">
                KALATHMAKAM 2K26
              </h1>
              <p className="font-sans-manrope text-xs font-semibold text-[#64748B] uppercase tracking-widest">
                GRAND ARTS FESTIVAL
              </p>
            </div>
          </div>

          {/* Center: Live Status Indicator - Subtle Green */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isConnected ? 'bg-[#ECFDF5] border border-[#A7F3D0]' : 'bg-amber-50 border border-amber-200'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-[#10B981] animate-pulse-dot' : 'bg-amber-500 animate-pulse'
              }`} />
              <span className={`font-sans-manrope font-bold text-sm uppercase tracking-wider ${
                isConnected ? 'text-[#047857]' : 'text-amber-700'
              }`}>
                {isConnected ? '● LIVE' : '● RECONNECTING'}
              </span>
            </div>

            <button
              onClick={() => {
                window.location.hash = '';
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans-manrope font-bold text-xs transition-colors cursor-pointer"
            >
              ← Back to Main Site
            </button>
          </div>

          {/* Right: Clock + Quote + Participants */}
          <div className="flex items-center gap-6">
            {/* Real-Time Clock */}
            <div className="text-right">
              <div className="font-sans-manrope font-black text-xl text-[#0F172A] leading-none flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#64748B]" />
                {formatTime(currentTime)}
              </div>
              <div className="font-sans-manrope text-xs text-[#64748B] font-medium mt-0.5">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Rotating Quote */}
            <div className="border-l border-[#E2E8F0] pl-6 max-w-xs">
              <p className="font-serif-cormorant text-sm italic text-[#64748B] leading-tight transition-opacity duration-500">
                "{festivalQuotes[quoteIndex].text}"
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">— {festivalQuotes[quoteIndex].author}</p>
            </div>

            {/* Total Participants */}
            <div className="bg-[#315EF8] text-white rounded-xl px-4 py-2.5 shadow-sm">
              <div className="text-xs font-sans-manrope font-bold uppercase tracking-wider opacity-90">
                TOTAL CONTESTANTS
              </div>
              <div className="font-sans-manrope font-black text-2xl">65+</div>
            </div>
          </div>
        </div>
      </header>

      {/* LATEST UPDATES TICKER - DARK NAVY WITH RED ACCENT */}
      <div className="bg-[#0F172A] text-white py-2.5 overflow-hidden border-b-2 border-[#EF4444]">
        <div className="flex items-center gap-4 px-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EF4444] rounded shrink-0">
            <span className="text-xs font-sans-manrope font-black uppercase tracking-wider">📰 LATEST UPDATES</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee-slow whitespace-nowrap font-sans-manrope font-bold text-sm">
              {latestUpdates[breakingNewsIndex]}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - FILLS REMAINING HEIGHT */}
      <main className="flex-1 max-w-[1920px] mx-auto w-full p-5 grid grid-cols-12 gap-5 overflow-hidden">
        
        {/* LEFT COLUMN - 8 cols */}
        <div className="col-span-8 flex flex-col gap-5 overflow-hidden">
          
          {/* HOUSE CARDS ROW */}
          <div className="grid grid-cols-4 gap-4">
            {standings.map((house, index) => {
              const houseId = house.id as HouseId;
              const colorInfo = houseColors[houseId];
              const isLeader = index === 0;

              return (
                <div
                  key={house.id}
                  className={`relative bg-white rounded-xl p-5 border ${
                    isLeader ? 'border-[#F59E0B] shadow-lg' : 'border-[#E2E8F0] shadow-sm'
                  } hover:shadow-md transition-all duration-300`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-3 right-3 text-white text-sm font-black px-3 py-1 rounded-lg ${
                    index === 0 ? 'bg-[#F59E0B]' : 
                    index === 1 ? 'bg-[#94A3B8]' : 
                    index === 2 ? 'bg-[#FB923C]' : 
                    'bg-[#CBD5E1]'
                  }`}>
                    {index === 0 ? '1ST' : index === 1 ? '2ND' : index === 2 ? '3RD' : '4TH'}
                  </div>

                  {/* House Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-20 h-20 bg-[#F8FAFC] rounded-xl p-2.5 border border-[#E2E8F0]">
                      <img 
                        src={houseEmblems[houseId]} 
                        alt={house.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="font-sans-manrope font-black text-2xl uppercase tracking-wide leading-none mb-1.5"
                        style={{ color: colorInfo.primary }}
                      >
                        {house.name}
                      </h3>
                      <p className="text-sm text-[#64748B] font-medium leading-tight">
                        {house.name === 'ASTRA' ? 'Flourishing Virtues' : 
                         house.name === 'ORION' ? 'Boundless Depth' :
                         house.name === 'NOVA' ? 'Igniting Passion' : 'Rising Brightest'}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 border border-[#E2E8F0]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-5xl font-black text-[#0F172A] leading-none">{house.points}</div>
                        <div className="text-sm text-[#64748B] font-bold uppercase mt-1.5">POINTS</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#059669] font-black text-lg flex items-center gap-1">
                          <span className="text-2xl">▲</span>
                          +{house.recentDelta}
                        </div>
                        <div className="text-sm text-[#64748B] font-medium">TODAY</div>
                      </div>
                    </div>
                  </div>

                  {/* Medal Tally */}
                  <div className="flex items-center justify-between text-base border-t border-[#E2E8F0] pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="font-black text-[#0F172A] text-lg">{house.medals.gold}</span>
                        <span className="text-[#64748B] text-sm">1ST</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-black text-[#0F172A] text-lg">{house.medals.silver}</span>
                        <span className="text-[#64748B] text-sm">2ND</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-black text-[#0F172A] text-lg">{house.medals.bronze}</span>
                        <span className="text-[#64748B] text-sm">3RD</span>
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* RECENT VICTORIES & LIVE ACTIVITY - SECOND SECTION */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-7 h-7 text-[#315EF8]" />
                <h3 className="font-sans-manrope font-black text-xl text-[#0F172A] uppercase tracking-wide">
                  RECENT VICTORIES & LIVE ACTIVITY
                </h3>
              </div>
              <div className="px-4 py-2 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] rounded-lg text-sm font-bold">
                LIVE FEED
              </div>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-scroll-medium">
                {recentCompetitions.concat(recentCompetitions).map((competition, i) => {
                  const firstPlace = competition.results.find(r => r.position === '1st');
                  const hasWinner = !!firstPlace;

                  return (
                    <div
                      key={`${competition.eventTitle}-${i}`}
                      className="flex-shrink-0 w-96 bg-white rounded-xl p-5 border border-[#E2E8F0] hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      {/* Competition Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-sm ${
                          hasWinner ? 'bg-[#FEF3C7] border-2 border-[#F59E0B]' : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                        }`}>
                          {hasWinner ? '🏆' : '🎭'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs px-3 py-1.5 rounded font-black uppercase ${
                              hasWinner ? 'bg-[#059669] text-white' : 'bg-[#315EF8] text-white'
                            }`}>
                              {hasWinner ? '✨ RESULTS' : '📋 COMPLETED'}
                            </span>
                            <span className="text-sm text-[#64748B] font-bold">{competition.time}</span>
                          </div>
                          <h4 className="font-sans-manrope font-black text-lg text-[#0F172A] truncate">
                            {competition.eventTitle}
                          </h4>
                        </div>
                      </div>

                      {/* All Placements */}
                      <div className="space-y-2">
                        {competition.results.slice(0, 3).map((result) => {
                          const houseColor = houseColors[result.houseId as HouseId] || houseColors.NOVA;
                          const positionEmoji = result.position === '1st' ? '🥇' : result.position === '2nd' ? '🥈' : '🥉';
                          
                          return (
                            <div 
                              key={result.id}
                              className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xl flex-shrink-0">{positionEmoji}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm text-[#0F172A] truncate">
                                    {result.participantName}
                                  </div>
                                  <div className="text-xs text-[#64748B]">{result.studentClass}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-[#E2E8F0]">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: houseColor.primary }}></div>
                                  <span className="font-black text-xs" style={{ color: houseColor.primary }}>
                                    {result.houseId}
                                  </span>
                                </div>
                                <span className="text-[#059669] font-black text-sm">
                                  +{result.points}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Points Summary */}
                      {competition.results.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                          <span className="text-xs text-[#64748B] font-medium">
                            {competition.results.length} {competition.results.length === 1 ? 'Result' : 'Results'}
                          </span>
                          <div className="text-[#059669] font-black text-base flex items-center gap-1">
                            <span className="text-lg">▲</span>
                            Total: +{competition.results.reduce((sum, r) => sum + r.points, 0)} PTS
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - 4 cols */}
        <div className="col-span-4 flex flex-col gap-5 overflow-hidden">
          
          {/* UPCOMING EVENT - WHITE WITH PURPLE ACCENT */}
          <div className="bg-white text-[#0F172A] rounded-xl p-4 border-l-4 border-[#7C3AED] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1.5 bg-[#7C3AED] text-white rounded text-sm font-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-white relative" />
                LIVE NOW
              </div>
              <div className="text-sm font-bold text-[#7C3AED]">{liveCompetitions[liveCompIndex].time}</div>
            </div>
            <h3 className="font-sans-manrope font-black text-2xl text-[#7C3AED] mb-2">
              {liveCompetitions[liveCompIndex].name}
            </h3>
            <div className="flex items-center gap-2 text-base mb-3 text-[#64748B]">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">📍 {liveCompetitions[liveCompIndex].venue}</span>
            </div>
            <div className="px-3 py-2 bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg text-sm font-bold text-center text-[#7C3AED]">
              {liveCompetitions[liveCompIndex].cat}
            </div>
          </div>
          
          {/* CHAMPION CARD - PREMIUM DARK */}
          <div className="bg-[#0F172A] text-white rounded-xl p-5 relative overflow-hidden shadow-xl border-2 border-[#F59E0B]">
            <div className="absolute -right-8 -bottom-8 opacity-5">
              <Trophy className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-black uppercase tracking-wider mb-3">
                <Crown className="w-5 h-5" />
                CURRENT CHAMPION
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-[#F59E0B] rounded-xl p-1 shadow-lg">
                  <div className="w-full h-full bg-[#0F172A] rounded-lg flex items-center justify-center">
                    <img 
                      src={houseEmblems[leaderHouse?.id as HouseId]} 
                      alt={leaderHouse?.name}
                      className="w-10 h-10"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans-manrope font-black text-2xl leading-tight">
                    HOUSE {leaderHouse?.name}
                  </h3>
                  <div className="text-4xl font-black text-[#F59E0B] leading-none mt-1">
                    {leaderHouse?.points}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#CBD5E1]">
                Leading by <strong className="text-white text-base">+{leadPointsDiff} PTS</strong> ahead of 2nd place
              </p>
            </div>
          </div>

          {/* HOUSE LEADERBOARD TABLE - MONOCHROME */}
          <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm flex-1 overflow-hidden">
            <h3 className="font-sans-manrope font-black text-base text-[#0F172A] mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#315EF8]" />
              HOUSE LEADERBOARD
            </h3>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#64748B] font-bold uppercase border-b border-[#E2E8F0]">
                  <th className="text-left pb-2">RANK</th>
                  <th className="text-left pb-2">HOUSE</th>
                  <th className="text-right pb-2">POINTS</th>
                  <th className="text-center pb-2">1ST</th>
                  <th className="text-center pb-2">2ND</th>
                  <th className="text-center pb-2">3RD</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((house, index) => {
                  const houseId = house.id as HouseId;
                  const colorInfo = houseColors[houseId];

                  return (
                    <tr key={house.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                          index === 0 ? 'bg-[#F59E0B]' : 
                          index === 1 ? 'bg-[#94A3B8]' : 
                          index === 2 ? 'bg-[#FB923C]' : 
                          'bg-[#CBD5E1]'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorInfo.primary }}></div>
                          <span className="font-bold text-sm text-[#0F172A]">
                            {house.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-black text-sm text-[#0F172A]">{house.points}</td>
                      <td className="py-2.5 text-center text-sm text-[#64748B]">{house.medals.gold}</td>
                      <td className="py-2.5 text-center text-sm text-[#64748B]">{house.medals.silver}</td>
                      <td className="py-2.5 text-center text-sm text-[#64748B]">{house.medals.bronze}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>● LIVE UPDATES ENABLED • {formatTime(currentTime)}</span>
            </div>
          </div>

        </div>

      </main>

      <style>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 25s linear infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-medium {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll-medium:hover {
          animation-play-state: paused;
        }
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
