import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy,
  Crown,
  Calendar,
  Sparkles,
  Eye,
  Pause,
  RefreshCw,
  Clock,
  MapPin,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { useFestival } from '../shared/context/FestivalContext';
import { houseColors } from '../shared/tokens/designTokens';
import type { HouseId } from '../shared/types/festivalTypes';
import { LiveScheduleBoard, resolveDefaultDay, getCatStyle } from '../components/LiveScheduleBoard';
import { DAY_DATE_MAP, ALL_SCHEDULE_DATA } from '../data/scheduleData';

import vegaEmblem  from '../assets/houses/vega.png';
import novaEmblem  from '../assets/houses/nova.png';
import orionEmblem from '../assets/houses/orion.png';
import astraEmblem from '../assets/houses/astra.png';
import logoImage   from '../assets/kalathmakam_2k26_logo.png';

const houseEmblems: Record<HouseId, string> = {
  VEGA: vegaEmblem,
  NOVA: novaEmblem,
  ORION: orionEmblem,
  ASTRA: astraEmblem,
  NONE: '',
};

export const DisplayPage: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals, results } = useFestival();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState<'scores' | 'schedule'>('scores');

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  // Standings calculation
  const standings = useMemo(() => {
    return houses
      .map((h) => {
        const houseId = h.id as HouseId;
        const pts = getHousePoints(houseId);
        const medals = getHouseMedals(houseId);
        const houseResults = results.filter((r) => r.houseId === houseId && r.status === 'Published');
        const recentDelta = houseResults.slice(0, 3).reduce((sum, r) => sum + r.points, 0);
        return { ...h, points: pts, medals, recentDelta };
      })
      .sort((a, b) => b.points - a.points);
  }, [houses, getHousePoints, getHouseMedals, results]);

  const leaderHouse = standings[0];
  const secondHouse = standings[1];
  const leadDiff = leaderHouse ? leaderHouse.points - (secondHouse?.points ?? 0) : 0;

  // Festival date check
  const nowISTString = currentTime.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const isFestToday = Boolean(DAY_DATE_MAP[nowISTString]);
  const isConcluded = currentTime.getHours() >= 19;

  // Lifecycle state
  const lifecycleState = isFestToday
    ? isConcluded
      ? 'COMPLETED'
      : 'LIVE'
    : 'PREVIEW';

  // Live Marquee Ticker items
  const tickerItems = useMemo(() => {
    const pubCount = results.filter((r) => r.status === 'Published').length;
    if (isConcluded) {
      return [
        `DAY 1 CONCLUDED • DAY 2 COMPETITIONS BEGIN TOMORROW AT 09:00 AM`,
        `STAGE 1 (KALAKELI AUDITORIUM): WELCOME DANCE AT 09:00 AM & ARABIC DANCE AT 09:05 AM`,
        `HOUSE-WISE COMPETITIONS: FOLK DANCE (STD III), THEMATIC DANCE (STD IV), THIRUVATHIRA, OPPANA & FUSION DANCE`,
        `4 HOUSES COMPETING: ASTRA • NOVA • ORION • VEGA`,
        leaderHouse ? `CURRENT LEADER: ${leaderHouse.name} (${leaderHouse.points} PTS)` : `KALATHMAKAM 2K26 IN FULL SWING`,
        `${pubCount > 0 ? pubCount : 349} RESULTS PUBLISHED`,
        `OFFICIAL KALATHMAKAM 2K26 LIVE DISPLAY`,
      ];
    }
    return [
      `${pubCount > 0 ? pubCount : 349} RESULTS PUBLISHED`,
      `4 HOUSES COMPETING (ASTRA • NOVA • ORION • VEGA)`,
      `STAGE 1 KALAKELI AUDITORIUM ACTIVE`,
      leaderHouse ? `CURRENT LEADER: ${leaderHouse.name} (${leaderHouse.points} PTS)` : `KALATHMAKAM 2K26 IN FULL SWING`,
      `65+ TALENTED CONTESTANTS`,
      `OFFICIAL SCORING & LIVE BROADCAST ACTIVE`,
    ];
  }, [leaderHouse, results, isConcluded]);

  // All published / verified results for scores feed
  const recentResults = useMemo(() => {
    return results
      .filter((r) => (r.status === 'Published' || r.status === 'Verified') && r.houseId !== 'NONE');
  }, [results]);

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden font-sans-manrope selection:bg-red-500 selection:text-white">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HEADER — SINGLE HIGH-CONTRAST LIGHT ROW WITH CLEAN HIERARCHY
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-5 h-14 flex items-center justify-between gap-4 select-none z-20 shadow-xs">

        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <img src={logoImage} alt="Logo" className="h-8 w-auto object-contain shrink-0 drop-shadow-sm" />
          <div className="leading-none flex items-baseline gap-1.5">
            <span className="font-serif-cormorant font-bold text-xl text-slate-900 tracking-wide">
              KALATHMAKAM
            </span>
            <span className="font-sans-manrope font-black text-sm text-[#315EF8] tracking-wider">
              2K26
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-1 gap-1 shrink-0">
          <button
            onClick={() => setActiveView('schedule')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'schedule'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Schedule
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveView('scores')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'scores'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Scores & Standings
          </button>
        </nav>

        {/* Right: Dynamic Status Badge + Digital Clock + Date + Contestants */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Dynamic State System Badge */}
          {lifecycleState === 'LIVE' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">LIVE</span>
            </div>
          )}

          {lifecycleState === 'PREVIEW' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">PREVIEW</span>
            </div>
          )}

          {lifecycleState === 'COMPLETED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">CONCLUDED</span>
            </div>
          )}

          {/* Clock & Date */}
          <div className="text-right leading-tight">
            <div className="text-sm font-black text-slate-900 tabular-nums tracking-tight">
              {formatTime(currentTime)}
            </div>
            <div className="text-[10px] text-slate-500 font-bold">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Contestants Count Pill */}
          <div className="bg-[#315EF8] text-white text-xs font-black px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-1 shadow-xs">
            <span>65+</span>
            <span className="font-semibold opacity-90">Contestants</span>
          </div>

          {/* Back to main site */}
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            ← Main Site
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. 🔴 LIVE UPDATE TICKER (FIXED BADGE LEFT + MARQUEE SCROLL RIGHT)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-[#0F172A] border-b border-red-500/40 h-8 flex items-stretch overflow-hidden z-10 select-none">
        
        {/* FIXED LEFT BADGE */}
        <div className="bg-red-600 text-white px-4 flex items-center gap-2 shrink-0 z-10 shadow-md">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            LIVE UPDATE
          </span>
        </div>

        {/* CONTINUOUS SCROLLING TICKER */}
        <div className="flex-1 overflow-hidden flex items-center relative">
          <div className="animate-ticker flex items-center whitespace-nowrap">
            {/* Duplicated for seamless infinite looping */}
            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center text-xs font-bold text-slate-200 mx-3">
                <span>{item}</span>
                <span className="text-red-400 font-black ml-6 mr-3">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. MAIN VIEW (SCHEDULE BOARD OR FULL-HEIGHT SCORES DASHBOARD)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeView === 'schedule' ? (
        <div className="flex-1 overflow-hidden min-h-0">
          <LiveScheduleBoard />
        </div>
      ) : (
        <ScoresView
          standings={standings}
          leaderHouse={leaderHouse}
          leadDiff={leadDiff}
          recentResults={recentResults}
          currentTime={currentTime}
          onViewSchedule={() => setActiveView('schedule')}
        />
      )}

      {/* Styles for High Performance Ticker Marquee */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker {
          display: flex;
          width: max-content;
          animation: ticker 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

// ─── Time Helper ────────────────────────────────────────────────────────────────

function parseTimeMinutes(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'AM' && h === 12) h = 0;
  if (ap === 'PM' && h !== 12) h += 12;
  return h * 60 + min;
}

// ─── High-Contrast Broadcast Scores View (Extra Large Legibility & Auto-Scroll) ──

interface ScoresViewProps {
  standings: any[];
  leaderHouse: any;
  leadDiff: number;
  recentResults: any[];
  currentTime: Date;
  onViewSchedule?: () => void;
}

const ScoresView: React.FC<ScoresViewProps> = ({
  standings,
  leaderHouse,
  leadDiff,
  recentResults,
  currentTime,
  onViewSchedule,
}) => {
  const victoriesScrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollVictories, setIsAutoScrollVictories] = useState(true);
  const [isVictoriesHovered, setIsVictoriesHovered] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedBoundaryRef = useRef(false);

  // Active Day & Schedule Data for the TV Display
  const activeDay = useMemo(() => resolveDefaultDay(currentTime), [currentTime]);

  const scheduleEvents = useMemo(() => {
    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const todayKey = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
    const isActualToday = activeDay === DAY_DATE_MAP[todayKey];
    const isTodayTime = isActualToday && (currentTime.getHours() < 19 && currentTime.getHours() >= 6);

    return ALL_SCHEDULE_DATA
      .filter((e) => e.day === activeDay && e.category !== 'Break')
      .map((e) => {
        const startMin = parseTimeMinutes(e.time);
        let liveStatus: 'live' | 'next' | 'done' | 'upcoming' = 'upcoming';
        if (isTodayTime && startMin !== null) {
          if (nowMin > startMin + 25) {
            liveStatus = 'done';
          } else if (nowMin >= startMin) {
            liveStatus = 'live';
          } else if (startMin - nowMin <= 30) {
            liveStatus = 'next';
          }
        }
        return { ...e, startMin, liveStatus };
      })
      .sort((a, b) => (a.startMin ?? 9999) - (b.startMin ?? 9999));
  }, [activeDay, currentTime]);

  const scheduleScrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollSchedule, setIsAutoScrollSchedule] = useState(true);
  const [isScheduleHovered, setIsScheduleHovered] = useState(false);
  const scheduleScrollTimerRef = useRef<number | null>(null);
  const scheduleResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSchedulePausedRef = useRef(false);

  // Smooth teleprompter auto-scroll for all published victories
  useEffect(() => {
    if (!isAutoScrollVictories || isVictoriesHovered) return;

    const container = victoriesScrollRef.current;
    if (!container) return;

    let lastTime = performance.now();
    const SCROLL_SPEED = 24; // px per second (smooth & easily readable on TV)

    const step = (nowTime: number) => {
      if (!container || !isAutoScrollVictories || isVictoriesHovered || isPausedBoundaryRef.current) {
        scrollTimerRef.current = requestAnimationFrame(step);
        return;
      }

      const delta = (nowTime - lastTime) / 1000;
      lastTime = nowTime;

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 15) {
        scrollTimerRef.current = requestAnimationFrame(step);
        return;
      }

      if (container.scrollTop >= maxScroll - 4) {
        // Reached bottom of victories: Pause for 4 seconds, then smooth-scroll back to top
        isPausedBoundaryRef.current = true;
        setTimeout(() => {
          if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              isPausedBoundaryRef.current = false;
              lastTime = performance.now();
            }, 2000); // 2s pause at the top
          } else {
            isPausedBoundaryRef.current = false;
          }
        }, 4000);
      } else {
        container.scrollTop += SCROLL_SPEED * delta;
      }

      scrollTimerRef.current = requestAnimationFrame(step);
    };

    scrollTimerRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollTimerRef.current) cancelAnimationFrame(scrollTimerRef.current);
    };
  }, [isAutoScrollVictories, isVictoriesHovered, recentResults.length]);

  // Smooth teleprompter auto-scroll for schedule events
  useEffect(() => {
    if (!isAutoScrollSchedule || isScheduleHovered) return;

    const container = scheduleScrollRef.current;
    if (!container) return;

    let lastTime = performance.now();
    const SCROLL_SPEED = 24; // px per second

    const step = (nowTime: number) => {
      if (!container || !isAutoScrollSchedule || isScheduleHovered || isSchedulePausedRef.current) {
        scheduleScrollTimerRef.current = requestAnimationFrame(step);
        return;
      }

      const delta = (nowTime - lastTime) / 1000;
      lastTime = nowTime;

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 15) {
        scheduleScrollTimerRef.current = requestAnimationFrame(step);
        return;
      }

      if (container.scrollTop >= maxScroll - 4) {
        // Reached bottom: Pause for 4s then smooth scroll to top
        isSchedulePausedRef.current = true;
        setTimeout(() => {
          if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              isSchedulePausedRef.current = false;
              lastTime = performance.now();
            }, 2000);
          } else {
            isSchedulePausedRef.current = false;
          }
        }, 4000);
      } else {
        container.scrollTop += SCROLL_SPEED * delta;
      }

      scheduleScrollTimerRef.current = requestAnimationFrame(step);
    };

    scheduleScrollTimerRef.current = requestAnimationFrame(step);

    return () => {
      if (scheduleScrollTimerRef.current) cancelAnimationFrame(scheduleScrollTimerRef.current);
    };
  }, [isAutoScrollSchedule, isScheduleHovered, scheduleEvents.length]);

  const handleVictoriesInteraction = () => {
    setIsVictoriesHovered(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsVictoriesHovered(false);
    }, 4500);
  };

  const handleScheduleInteraction = () => {
    setIsScheduleHovered(true);
    if (scheduleResumeTimerRef.current) clearTimeout(scheduleResumeTimerRef.current);
    scheduleResumeTimerRef.current = setTimeout(() => {
      setIsScheduleHovered(false);
    }, 4500);
  };

  const totalPoints = useMemo(() => {
    return standings.reduce((acc, h) => acc + (h.points || 0), 0);
  }, [standings]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#F8FAFC]">
      <main className="flex-1 overflow-hidden p-5 grid grid-cols-12 gap-5 min-h-0">

        {/* LEFT — 8 cols: Large House Point Cards & Expanded Live Victories Feed */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden min-h-0">

          {/* 4 Large House Point Cards with Uncut Prominent House Names */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 flex-shrink-0">
            {standings.map((house, index) => {
              const houseId = house.id as HouseId;
              const colorInfo = houseColors[houseId];
              const isLeader = index === 0;
              const rankBadges = [
                'bg-amber-500 text-white',
                'bg-slate-400 text-white',
                'bg-amber-700 text-white',
                'bg-slate-600 text-white',
              ];
              const rankLabels = ['1ST PLACE', '2ND PLACE', '3RD PLACE', '4TH PLACE'];

              return (
                <div
                  key={house.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm flex flex-col justify-between ${
                    isLeader
                      ? 'border-2 border-amber-400 shadow-md ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Top Row: Rank Badge on Left + Live Delta on Right */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${rankBadges[index]}`}
                      >
                        {rankLabels[index]}
                      </span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        +{house.recentDelta} pts
                      </span>
                    </div>

                    {/* House Row: Big Emblem + FULL UNCUT HOUSE NAME */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                        <img
                          src={houseEmblems[houseId]}
                          alt={house.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-sans-manrope font-black text-2xl uppercase leading-none tracking-tight whitespace-nowrap"
                          style={{ color: colorInfo.primary }}
                        >
                          {house.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold truncate leading-tight mt-1">
                          {house.name === 'ASTRA'
                            ? 'Virtues Unbound'
                            : house.name === 'ORION'
                            ? 'Boundless Depth'
                            : house.name === 'NOVA'
                            ? 'Igniting Passion'
                            : 'Rising Brightest'}
                        </p>
                      </div>
                    </div>

                    {/* Big Bold Points Card */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-200">
                      <div className="flex items-baseline justify-between">
                        <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tight">
                          {house.points}
                        </span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                          Official Points
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Medal Counts */}
                  <div className="flex gap-1.5 text-center border-t border-slate-100 pt-2.5">
                    {[
                      ['🥇 1st', house.medals.gold],
                      ['🥈 2nd', house.medals.silver],
                      ['🥉 3rd', house.medals.bronze],
                    ].map(([lbl, val]) => (
                      <div key={lbl as string} className="flex-1 bg-slate-50 rounded-xl py-1 border border-slate-100">
                        <div className="font-black text-base text-slate-900 tabular-nums">{val}</div>
                        <div className="text-[9px] text-slate-500 font-extrabold uppercase">{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Recent Victories Live Grid (Fills Remaining Screen Height & Auto-Scrolls) */}
          <div className="bg-white rounded-2xl border border-slate-200 flex-1 overflow-hidden flex flex-col shadow-sm min-h-0">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/90 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Live Published Victories Feed
                </span>
                <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  {recentResults.length} Results
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* TV Auto-Scroll Controller for Victories Feed */}
                <button
                  onClick={() => setIsAutoScrollVictories((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                    isAutoScrollVictories
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle automatic scrolling for victories list"
                >
                  {isAutoScrollVictories ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Auto-Scroll: <strong className="text-blue-700">ON</strong></span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-slate-500" />
                      <span>Auto-Scroll: <strong>PAUSED</strong></span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Feed
                </div>
              </div>
            </div>

            {/* Scrollable Container with Smooth Auto-Scroll for Victories */}
            <div
              ref={victoriesScrollRef}
              onMouseEnter={handleVictoriesInteraction}
              onMouseMove={handleVictoriesInteraction}
              onTouchStart={handleVictoriesInteraction}
              onWheel={handleVictoriesInteraction}
              className="flex-1 overflow-y-auto p-4 min-h-0 scroll-smooth"
            >
              {recentResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Trophy className="w-10 h-10 mb-2 opacity-30 text-amber-500" />
                  <p className="font-bold text-sm text-slate-600">Official scores will appear here as results are published.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-4">
                  {recentResults.map((result) => {
                    const houseColor = houseColors[result.houseId as HouseId] || houseColors.NOVA;
                    const posEmoji =
                      result.position === '1st' ? '🥇' : result.position === '2nd' ? '🥈' : '🥉';
                    return (
                      <div
                        key={result.id}
                        className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between hover:bg-slate-100 transition-all shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-lg shrink-0">{posEmoji}</span>
                              <span className="font-bold text-xs text-slate-900 leading-snug truncate">
                                {result.eventTitle}
                              </span>
                            </div>
                            <span
                              className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                result.position === '1st'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {result.position} Place
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {result.participantName} {result.studentClass ? `(${result.studentClass})` : ''}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-200 text-xs">
                          <span className="font-black text-sm" style={{ color: houseColor.primary }}>
                            {result.houseId}
                          </span>
                          <span className="text-emerald-600 font-black text-sm">+{result.points} PTS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {recentResults.length > 0 && (
                <div className="pt-2 pb-1 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin opacity-50" />
                  <span>Auto-scrolling {recentResults.length} verified results</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — 4 cols: Big Champion Spotlight + Upcoming Schedule Feed + Points Share (Full Height) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden min-h-0">

          {/* Large Current Champion Spotlight */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-5 md:p-6 relative overflow-hidden border-2 border-amber-400/60 shadow-md shrink-0">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
                  <Crown className="w-4 h-4" />
                  Tournament Leader
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  +{leadDiff} PTS LEAD
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-amber-400 rounded-2xl p-1 shrink-0 shadow-lg">
                  <div className="w-full h-full bg-[#0F172A] rounded-xl flex items-center justify-center">
                    <img
                      src={houseEmblems[leaderHouse?.id as HouseId]}
                      alt={leaderHouse?.name}
                      className="w-11 h-11 object-contain"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-2xl md:text-3xl leading-none uppercase text-white tracking-tight">
                    HOUSE {leaderHouse?.name}
                  </h3>
                  <div className="text-4xl md:text-5xl font-black text-amber-400 leading-none mt-1.5 tabular-nums tracking-tight">
                    {leaderHouse?.points} <span className="text-sm font-bold text-amber-200/70">PTS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-white/10">
                <span>Gold Medals: <strong className="text-white text-sm">{leaderHouse?.medals?.gold || 0}</strong></span>
                <span>Total Medals: <strong className="text-white text-sm">{(leaderHouse?.medals?.gold || 0) + (leaderHouse?.medals?.silver || 0) + (leaderHouse?.medals?.bronze || 0)}</strong></span>
              </div>
            </div>
          </div>

          {/* Live / Upcoming Schedule Board (Replaces Redundant Overall Standings Table) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Schedule Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/90 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900 uppercase tracking-wider truncate">
                      Upcoming Schedule
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                      {activeDay.split(' — ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-Scroll Toggle Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAutoScrollSchedule((v) => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer border ${
                    isAutoScrollSchedule
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle automatic scrolling for schedule"
                >
                  {isAutoScrollSchedule ? (
                    <>
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>Auto-Scroll: <strong className="text-blue-700">ON</strong></span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 text-slate-500" />
                      <span>Auto-Scroll: <strong>PAUSED</strong></span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Container with Continuous Auto-Scroll */}
            <div
              ref={scheduleScrollRef}
              onMouseEnter={handleScheduleInteraction}
              onMouseMove={handleScheduleInteraction}
              onTouchStart={handleScheduleInteraction}
              onWheel={handleScheduleInteraction}
              className="flex-1 overflow-y-auto p-3.5 space-y-2.5 min-h-0 scroll-smooth"
            >
              {scheduleEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Clock className="w-8 h-8 mb-2 opacity-30 text-blue-500" />
                  <p className="font-bold text-xs text-slate-600">No events scheduled for {activeDay}.</p>
                </div>
              ) : (
                scheduleEvents.map((ev) => {
                  const isLive = ev.liveStatus === 'live';
                  const isNext = ev.liveStatus === 'next';
                  const isDone = ev.liveStatus === 'done';
                  const catStyle = getCatStyle(ev.category);

                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isLive
                          ? 'bg-red-50/90 border-2 border-red-400 shadow-sm ring-1 ring-red-200'
                          : isNext
                          ? 'bg-blue-50/80 border border-blue-300 shadow-xs'
                          : isDone
                          ? 'bg-slate-50/50 border border-slate-100 opacity-60'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Top row: Time + Stage + Live/Next Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs font-black tabular-nums tracking-tight px-2 py-0.5 rounded-md ${
                              isLive
                                ? 'bg-red-600 text-white'
                                : isNext
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {ev.time}
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            {ev.stage ? ev.stage.replace(/^Stage \d+:\s*/, '') : 'Main Stage'}
                          </span>
                        </div>

                        <div className="shrink-0">
                          {isLive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[9px] font-black uppercase tracking-wider">
                              <Radio className="w-2.5 h-2.5 text-red-600 animate-pulse" /> LIVE NOW
                            </span>
                          )}
                          {isNext && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[9px] font-black uppercase tracking-wider">
                              UP NEXT
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              DONE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle row: Event Title */}
                      <div className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                        {ev.title}
                      </div>

                      {/* Bottom row: Category pill + Coordinator / Participants */}
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${catStyle.pill}`}>
                          {ev.category}
                        </span>

                        {(ev.coordinator || ev.participants) && (
                          <span className="truncate max-w-[160px] text-slate-500 font-medium">
                            {ev.coordinator ? `Coord: ${ev.coordinator}` : `${ev.participants} participants`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {scheduleEvents.length > 0 && (
                <div className="pt-2 pb-1 text-center flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <RefreshCw className="w-3 h-3 animate-spin opacity-50" />
                  <span>Auto-scrolling {scheduleEvents.length} scheduled events</span>
                </div>
              )}
            </div>

            {/* Bottom Status bar for Schedule */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[10px] text-slate-500 flex-shrink-0">
              <span className="font-semibold">{scheduleEvents.length} Total Events Today</span>
              {onViewSchedule && (
                <button
                  onClick={onViewSchedule}
                  className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5 hover:underline"
                >
                  Full Schedule View <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Points Share Breakdown (Fills the remaining height on right) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm shrink-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                House Points Share
              </span>
              <span className="text-xs font-black text-slate-600">{totalPoints} Total PTS</span>
            </div>

            {/* Stacked Percentage Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200">
              {standings.map((h) => {
                const pct = totalPoints > 0 ? Math.round((h.points / totalPoints) * 100) : 25;
                const col = houseColors[h.id as HouseId]?.primary || '#3B82F6';
                return (
                  <div
                    key={h.id}
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: col }}
                    title={`${h.name}: ${h.points} pts (${pct}%)`}
                  />
                );
              })}
            </div>

            {/* Mini Legend */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 text-center">
              {standings.map((h) => {
                const pct = totalPoints > 0 ? Math.round((h.points / totalPoints) * 100) : 25;
                const col = houseColors[h.id as HouseId]?.primary || '#3B82F6';
                return (
                  <div key={h.id} className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="text-xs font-black leading-none" style={{ color: col }}>
                      {h.name}
                    </div>
                    <div className="text-xs font-black text-slate-800 mt-1">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. BOTTOM STATUS STRIP (CLEAN BROADCAST-STYLE FOOTER)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-6 font-extrabold uppercase tracking-wider text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            4 HOUSES COMPETING
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            43 EVENTS TODAY
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            349 RESULTS PUBLISHED
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            65+ CONTESTANTS
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Scoring & Auto-Scroll Active • TV Display Mode</span>
        </div>
      </div>
    </div>
  );
};
