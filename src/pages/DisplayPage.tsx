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
  const [isConnected, setIsConnected] = useState(true); // Firebase connection status

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

  // Breaking news messages - auto-generated from results
  const breakingNews = [
    `${leaderHouse?.name || 'ASTRA'} extends lead to ${leaderHouse?.points || 0} points!`,
    `New Winner: Anchoring (Cat III) — ${leaderHouse?.name || 'ASTRA'}`,
    `Next Event: Mohiniyattam — Main Auditorium at 02:00 PM`,
    `${results.filter(r => r.status === 'Published').length} Results Published • 4 Houses Competing`,
  ];

  // Rotate breaking news every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBreakingNewsIndex((prev) => (prev + 1) % breakingNews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [breakingNews.length]);

  // Recent house results for scrolling cards
  const recentHouseResults = results
    .filter((r) => (r.status === 'Published' || r.status === 'Verified') && r.houseId !== 'NONE' && r.points > 0)
    .slice(0, 12)
    .map((r, i) => ({
      ...r,
      time: `${11 - (i % 5)}:${45 - (i % 8) * 5} AM`,
    }));

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 overflow-hidden flex flex-col">
      
      {/* PROFESSIONAL HEADER */}
      <header className="bg-white border-b-2 border-slate-200 px-6 py-3 flex-shrink-0 shadow-sm">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          
          {/* Left: Festival Identity */}
          <div className="flex items-center gap-4">
            <img 
              src={logoImage} 
              alt="Kalathmakam 2K26 Logo" 
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="font-serif-cormorant text-2xl font-bold text-slate-900 leading-tight">
                KALATHMAKAM 2K26
              </h1>
              <p className="font-sans-manrope text-xs font-semibold text-slate-600 uppercase tracking-widest">
                GRAND ARTS FESTIVAL
              </p>
            </div>
          </div>

          {/* Center: Live Status Indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse-dot' : 'bg-amber-500 animate-pulse'
              }`} />
              <span className="font-sans-manrope font-bold text-sm uppercase tracking-wider">
                {isConnected ? '● LIVE' : '● RECONNECTING'}
              </span>
            </div>
          </div>

          {/* Right: Clock + Quote + Participants */}
          <div className="flex items-center gap-6">
            {/* Real-Time Clock */}
            <div className="text-right">
              <div className="font-sans-manrope font-black text-xl text-slate-900 leading-none flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {formatTime(currentTime)}
              </div>
              <div className="font-sans-manrope text-xs text-slate-600 font-medium mt-0.5">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Rotating Quote */}
            <div className="border-l-2 border-slate-200 pl-6 max-w-xs">
              <p className="font-serif-cormorant text-sm italic text-slate-700 leading-tight transition-opacity duration-500">
                "{festivalQuotes[quoteIndex].text}"
              </p>
              <p className="text-xs text-slate-500 mt-1">— {festivalQuotes[quoteIndex].author}</p>
            </div>

            {/* Total Participants */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl px-4 py-2.5 shadow-md">
              <div className="text-xs font-sans-manrope font-bold uppercase tracking-wider opacity-90">
                TOTAL CONTESTANTS
              </div>
              <div className="font-sans-manrope font-black text-2xl">65+</div>
            </div>
          </div>
        </div>
      </header>

      {/* BREAKING NEWS TICKER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 overflow-hidden">
        <div className="flex items-center gap-4 px-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full shrink-0 backdrop-blur-sm">
            <span className="text-xs font-sans-manrope font-black uppercase tracking-wider">⚡ BREAKING NEWS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee-slow whitespace-nowrap font-sans-manrope font-bold text-sm">
              {breakingNews[breakingNewsIndex]}
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
                  className={`relative bg-white rounded-2xl p-5 border-2 ${
                    isLeader ? 'border-amber-400 shadow-lg' : 'border-slate-200 shadow-md'
                  } hover:shadow-xl transition-all duration-300`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-3 right-3 text-white text-sm font-black px-3 py-1 rounded-full ${
                    index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                    index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' : 
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-600' : 
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {index === 0 ? '1ST' : index === 1 ? '2ND' : index === 2 ? '3RD' : '4TH'}
                  </div>

                  {/* House Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-2.5 shadow-inner">
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
                      <p className="text-sm text-slate-600 font-medium leading-tight">
                        {house.name === 'ASTRA' ? 'Flourishing Virtues' : 
                         house.name === 'ORION' ? 'Boundless Depth' :
                         house.name === 'NOVA' ? 'Igniting Passion' : 'Rising Brightest'}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-5xl font-black text-slate-900 leading-none">{house.points}</div>
                        <div className="text-sm text-slate-600 font-bold uppercase mt-1.5">POINTS</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 font-black text-lg flex items-center gap-1">
                          <span className="text-2xl">▲</span>
                          +{house.recentDelta}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">TODAY</div>
                      </div>
                    </div>
                  </div>

                  {/* Medal Tally */}
                  <div className="flex items-center justify-between text-base border-t border-slate-200 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-lg">{house.medals.gold}</span>
                        <span className="text-slate-500 text-sm">1ST</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-lg">{house.medals.silver}</span>
                        <span className="text-slate-500 text-sm">2ND</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-lg">{house.medals.bronze}</span>
                        <span className="text-slate-500 text-sm">3RD</span>
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* RECENT VICTORIES & LIVE ACTIVITY - SECOND SECTION */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-7 h-7 text-blue-600" />
                <h3 className="font-sans-manrope font-black text-xl text-slate-900 uppercase tracking-wide">
                  RECENT VICTORIES & LIVE ACTIVITY
                </h3>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg text-sm font-bold">
                LIVE FEED
              </div>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="overflow-hidden">
              <div className="flex gap-4 animate-scroll-medium">
                {recentHouseResults.concat(recentHouseResults).map((result, i) => {
                  const houseColor = houseColors[result.houseId as HouseId] || houseColors.NOVA;

                  return (
                    <div
                      key={`${result.id}-${i}`}
                      className="flex-shrink-0 w-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border-2 border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                          {result.position === '1st' ? '🥇' : result.position === '2nd' ? '🥈' : '🥉'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase">
                              {result.position === '1st' ? '🏆 NEW WINNER' : '✨ NEW RESULT'}
                            </span>
                            <span className="text-sm text-slate-500 font-bold">{result.time}</span>
                          </div>
                          <h4 className="font-sans-manrope font-black text-lg text-slate-900 truncate mb-1">
                            {result.eventTitle}
                          </h4>
                          <p className="text-sm text-slate-600 truncate font-medium">
                            {result.participantName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border-2 border-slate-300 shadow-sm">
                          <img 
                            src={houseEmblems[result.houseId as HouseId]} 
                            alt={result.houseId}
                            className="w-5 h-5"
                          />
                          <span 
                            className="font-black text-base"
                            style={{ color: houseColor.primary }}
                          >
                            {result.houseId}
                          </span>
                        </div>
                        <div className="text-emerald-600 font-black text-xl flex items-center gap-1.5">
                          <span className="text-2xl">▲</span>
                          +{result.points} PTS
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - 4 cols */}
        <div className="col-span-4 flex flex-col gap-5 overflow-hidden">
          
          {/* LIVE NOW COMPETITION */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-4 shadow-lg border-2 border-purple-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1.5 bg-white/30 rounded-lg text-sm font-black flex items-center gap-2 backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-white relative" />
                LIVE NOW
              </div>
              <div className="text-sm font-bold opacity-90">{liveCompetitions[liveCompIndex].time}</div>
            </div>
            <h3 className="font-sans-manrope font-black text-2xl mb-2">
              {liveCompetitions[liveCompIndex].name}
            </h3>
            <div className="flex items-center gap-2 text-base mb-3">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">📍 {liveCompetitions[liveCompIndex].venue}</span>
            </div>
            <div className="px-3 py-2 bg-white/20 rounded-lg text-sm font-bold text-center backdrop-blur-sm">
              {liveCompetitions[liveCompIndex].cat}
            </div>
          </div>
          
          {/* CURRENT CHAMPION CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 relative overflow-hidden shadow-xl border-2 border-amber-400">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Trophy className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-black uppercase tracking-wider mb-3">
                <Crown className="w-5 h-5" />
                CURRENT CHAMPION
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-1 shadow-lg">
                  <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
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
                  <div className="text-4xl font-black text-amber-400 leading-none mt-1">
                    {leaderHouse?.points}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                Leading by <strong className="text-white text-base">+{leadPointsDiff} PTS</strong> ahead of 2nd place
              </p>
            </div>
          </div>

          {/* HOUSE LEADERBOARD TABLE */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex-1 overflow-hidden">
            <h3 className="font-sans-manrope font-black text-base text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              HOUSE LEADERBOARD
            </h3>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-600 font-bold uppercase border-b-2 border-slate-200">
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
                    <tr key={house.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-sm ${
                          index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                          index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' : 
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <img src={houseEmblems[houseId]} alt={house.name} className="w-5 h-5" />
                          <span 
                            className="font-bold text-sm"
                            style={{ color: colorInfo.primary }}
                          >
                            {house.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-black text-sm text-slate-900">{house.points}</td>
                      <td className="py-2.5 text-center text-sm text-slate-700">{house.medals.gold}</td>
                      <td className="py-2.5 text-center text-sm text-slate-700">{house.medals.silver}</td>
                      <td className="py-2.5 text-center text-sm text-slate-700">{house.medals.bronze}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
