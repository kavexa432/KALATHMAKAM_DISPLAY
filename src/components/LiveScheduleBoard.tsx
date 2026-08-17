import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  MapPin,
  Radio,
  CheckCircle2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import {
  ALL_SCHEDULE_DATA,
  DAY_DATE_MAP,
} from '../data/scheduleData';
import type { ScheduleEvent } from '../data/scheduleData';

// ─── Helpers & Time Calculations ─────────────────────────────────────────────

function nowIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

const FEST_DATES = Object.keys(DAY_DATE_MAP).sort();

function resolveDayLabel(key: string) {
  if (DAY_DATE_MAP[key]) return { label: DAY_DATE_MAP[key], isToday: true };
  if (key < FEST_DATES[0]) return { label: DAY_DATE_MAP[FEST_DATES[0]], isToday: false };
  if (key > FEST_DATES[FEST_DATES.length - 1])
    return { label: DAY_DATE_MAP[FEST_DATES[FEST_DATES.length - 1]], isToday: false };
  const next = FEST_DATES.find((d) => d > key);
  return { label: DAY_DATE_MAP[next ?? FEST_DATES[0]], isToday: false };
}

// ─── Category Color Map (High-Legibility Light Theme) ─────────────────────────

const CAT_COLORS: Record<string, { dot: string; pill: string; text: string; border: string }> = {
  Ceremony:     { dot: 'bg-sky-500',     pill: 'bg-sky-50 text-sky-700 border-sky-200',         text: 'text-sky-700',     border: 'border-sky-300' },
  Dance:        { dot: 'bg-pink-500',    pill: 'bg-pink-50 text-pink-700 border-pink-200',       text: 'text-pink-700',    border: 'border-pink-300' },
  Drama:        { dot: 'bg-purple-500',  pill: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', border: 'border-purple-300' },
  Music:        { dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-800 border-amber-200',   text: 'text-amber-800',  border: 'border-amber-300' },
  Instrumental: { dot: 'bg-violet-500',  pill: 'bg-violet-50 text-violet-700 border-violet-200', text: 'text-violet-700', border: 'border-violet-300' },
  English:      { dot: 'bg-cyan-600',    pill: 'bg-cyan-50 text-cyan-800 border-cyan-200',       text: 'text-cyan-800',    border: 'border-cyan-300' },
  Hindi:        { dot: 'bg-orange-500',  pill: 'bg-orange-50 text-orange-800 border-orange-200', text: 'text-orange-800', border: 'border-orange-300' },
  Malayalam:    { dot: 'bg-emerald-600', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-800', border: 'border-emerald-300' },
  Sanskrit:     { dot: 'bg-yellow-600',  pill: 'bg-yellow-50 text-yellow-800 border-yellow-200', text: 'text-yellow-800', border: 'border-yellow-300' },
  'House Item': { dot: 'bg-rose-500',    pill: 'bg-rose-50 text-rose-700 border-rose-200',       text: 'text-rose-700',    border: 'border-rose-300' },
  'Fine Arts':  { dot: 'bg-teal-600',    pill: 'bg-teal-50 text-teal-800 border-teal-200',       text: 'text-teal-800',    border: 'border-teal-300' },
};

function getCatStyle(c: string) {
  return CAT_COLORS[c] ?? {
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    border: 'border-slate-300'
  };
}

function shortStage(s: string) {
  if (!s) return 'General';
  return s.replace(/^Stage (\d+):\s*/, 'S$1 · ');
}

type LiveStatus = 'live' | 'next' | 'done' | 'upcoming';

interface EnrichedEvent extends ScheduleEvent {
  startMin: number | null;
  liveStatus: LiveStatus;
}

const ROTATION_MS = 8000;
const PROGRESS_INTERVAL_MS = 50;

// ─── Component ─────────────────────────────────────────────────────────────

export const LiveScheduleBoard: React.FC = () => {
  const [now, setNow] = useState(nowIST());

  // Rotation & Filter States
  const [stageIndex, setStageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [manualStage, setManualStage] = useState<string | null>(null); // null = auto mode
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  // Auto-scroll TV Display States
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoScrollTimerRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedAtBoundaryRef = useRef(false);

  const progressRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clock interval (30s check for state accuracy)
  useEffect(() => {
    const id = setInterval(() => setNow(nowIST()), 30_000);
    return () => clearInterval(id);
  }, []);

  const todayKey = toDateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const { label: dayLabel, isToday } = resolveDayLabel(todayKey);

  // Format friendly date string
  const friendlyDate = useMemo(() => {
    const m = dayLabel.match(/(\w{3})\s+(\d+)\/(\d+)/);
    if (!m) return dayLabel;
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${m[1]} ${m[2]} ${months[parseInt(m[3], 10)]}`;
  }, [dayLabel]);

  // Enrich all events for current day
  const allEvents = useMemo<EnrichedEvent[]>(() => {
    return ALL_SCHEDULE_DATA
      .filter((e) => e.day === dayLabel && e.category !== 'Break')
      .map((e) => {
        const startMin = parseTimeMinutes(e.time);
        let liveStatus: LiveStatus = 'upcoming';
        if (isToday && startMin !== null) {
          if (nowMin > startMin + 25) {
            liveStatus = 'done';
          } else if (nowMin >= startMin) {
            liveStatus = 'live';
          } else if (startMin - nowMin <= 30) {
            liveStatus = 'next';
          }
        }
        return { ...e, startMin, liveStatus };
      });
  }, [dayLabel, isToday, nowMin]);

  // Extract unique stages
  const stages = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    allEvents.forEach((e) => {
      if (e.stage && !seen.has(e.stage)) {
        seen.add(e.stage);
        out.push(e.stage);
      }
    });
    return out;
  }, [allEvents]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ['All', ...Array.from(set)];
  }, [allEvents]);

  // Active stage (manual selection wins over auto-rotation)
  const activeStage = manualStage ?? (stages[stageIndex] ?? stages[0] ?? '');

  // Filter events for the active stage & selected category
  const stageEvents = useMemo(() => {
    let list = manualStage === 'ALL'
      ? allEvents
      : allEvents.filter((e) => e.stage === activeStage);

    if (selectedCategory !== 'All') {
      list = list.filter((e) => e.category === selectedCategory);
    }

    return list.sort((a, b) => (a.startMin ?? 9999) - (b.startMin ?? 9999));
  }, [allEvents, activeStage, manualStage, selectedCategory]);

  // Hero event: LIVE event first, then NEXT event, then first UPCOMING
  const heroEvent = useMemo(() => {
    return (
      stageEvents.find((e) => e.liveStatus === 'live') ??
      stageEvents.find((e) => e.liveStatus === 'next') ??
      stageEvents.find((e) => e.liveStatus === 'upcoming') ??
      null
    );
  }, [stageEvents]);

  // Countdown timer calculation for hero event
  const countdown = useMemo(() => {
    if (!heroEvent?.startMin || heroEvent.liveStatus === 'live') return null;
    const diff = heroEvent.startMin - nowMin;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [heroEvent, nowMin]);

  // Session & Category Breakdown stats for left column
  const morningEvents = useMemo(() => {
    return stageEvents.filter((e) => (e.startMin ?? 0) < 13 * 60);
  }, [stageEvents]);

  const afternoonEvents = useMemo(() => {
    return stageEvents.filter((e) => (e.startMin ?? 0) >= 13 * 60);
  }, [stageEvents]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    stageEvents.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [stageEvents]);

  // ── Auto-rotation Timers for Multi-Stage Days ──────────────────────────────

  const stopTimers = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    if (progTimerRef.current) clearInterval(progTimerRef.current);
  }, []);

  const startRotation = useCallback(() => {
    stopTimers();
    progressRef.current = 0;
    setProgress(0);

    progTimerRef.current = setInterval(() => {
      progressRef.current += (PROGRESS_INTERVAL_MS / ROTATION_MS) * 100;
      setProgress(Math.min(progressRef.current, 100));
    }, PROGRESS_INTERVAL_MS);

    autoTimerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStageIndex((prev) => (prev + 1) % stages.length);
        progressRef.current = 0;
        setProgress(0);
        setVisible(true);
      }, 300);
    }, ROTATION_MS);
  }, [stages.length, stopTimers]);

  useEffect(() => {
    if (autoPlay && !manualStage && stages.length > 1) {
      startRotation();
    } else {
      stopTimers();
      setProgress(0);
    }
    return stopTimers;
  }, [autoPlay, manualStage, stages.length, startRotation, stopTimers]);

  // ── Teleprompter Smooth Auto-Scroll Engine for Large TV Displays ──────────

  useEffect(() => {
    if (!isAutoScrollEnabled || isHovered) return;

    const container = timelineScrollRef.current;
    if (!container) return;

    let lastTime = performance.now();
    const SCROLL_SPEED = 26; // pixels per second (gentle, easily readable on large TV)

    const step = (nowTime: number) => {
      if (!container || !isAutoScrollEnabled || isHovered || isPausedAtBoundaryRef.current) {
        autoScrollTimerRef.current = requestAnimationFrame(step);
        return;
      }

      const delta = (nowTime - lastTime) / 1000;
      lastTime = nowTime;

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 15) {
        autoScrollTimerRef.current = requestAnimationFrame(step);
        return;
      }

      if (container.scrollTop >= maxScroll - 4) {
        // Reached bottom of schedule: Pause for 4 seconds, then smooth-scroll to top
        isPausedAtBoundaryRef.current = true;
        setTimeout(() => {
          if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              isPausedAtBoundaryRef.current = false;
              lastTime = performance.now();
            }, 2000); // 2s pause at the top before resuming scroll
          } else {
            isPausedAtBoundaryRef.current = false;
          }
        }, 4000);
      } else {
        container.scrollTop += SCROLL_SPEED * delta;
      }

      autoScrollTimerRef.current = requestAnimationFrame(step);
    };

    autoScrollTimerRef.current = requestAnimationFrame(step);

    return () => {
      if (autoScrollTimerRef.current) cancelAnimationFrame(autoScrollTimerRef.current);
    };
  }, [isAutoScrollEnabled, isHovered, activeStage, selectedCategory]);

  const handleUserInteraction = () => {
    setIsHovered(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 4500);
  };

  // Navigation handlers
  const goPrev = () => {
    setManualStage(null);
    setStageIndex((p) => (p - 1 + stages.length) % stages.length);
    setAutoPlay(false);
  };

  const goNext = () => {
    setManualStage(null);
    setStageIndex((p) => (p + 1) % stages.length);
    setAutoPlay(false);
  };

  const selectStage = (s: string) => {
    if (manualStage === s) {
      setManualStage(null);
      setAutoPlay(true);
    } else {
      setManualStage(s);
      setAutoPlay(false);
    }
  };

  const toggleAutoPlay = () => {
    if (!autoPlay) {
      setManualStage(null);
      setAutoPlay(true);
    } else {
      setAutoPlay(false);
    }
  };

  const totalFestEvents = allEvents.length;
  const doneCount = allEvents.filter((e) => e.liveStatus === 'done').length;

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans-manrope overflow-hidden select-none">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. SUBHEADER: STATUS EYEBROW + DAY TITLE + ROTATION CONTROLS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Hierarchy Title */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {isToday ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Festival Schedule
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Upcoming Schedule
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-medium">
              {isToday ? '• Real-time stage tracking active' : '• Live tracking activates on festival day'}
            </span>
          </div>

          <h2 className="font-serif-cormorant text-2xl font-bold text-slate-900 tracking-wide leading-tight">
            {dayLabel.split(' — ')[1] ?? dayLabel}
            <span className="font-sans-manrope text-xs font-bold text-slate-500 ml-3 uppercase tracking-wider">
              {friendlyDate}
            </span>
          </h2>
        </div>

        {/* Right: Stage count + Auto-cycle controller */}
        <div className="flex items-center gap-3">
          {stages.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                {manualStage ? 'Manual Mode' : `Rotating Venue ${stageIndex + 1}/${stages.length}`}
              </span>
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  autoPlay && !manualStage
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
                title={autoPlay ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
              >
                {autoPlay && !manualStage ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Auto</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-red-500" />
                    <span>Auto</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. SLIM AUTO-ROTATION PROGRESS BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 h-[3px] bg-slate-200 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-pink-500 transition-all duration-75"
          style={{ width: `${autoPlay && !manualStage ? progress : 0}%` }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. CLEAN & SIMPLIFIED FILTER ROW (Venues + Categories)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white/95 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        
        {/* Left: Stage Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
            title="Previous Stage"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectStage('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              manualStage === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Venues
          </button>

          {stages.map((s, i) => {
            const isActive = manualStage === 'ALL' ? false : s === activeStage;
            const hasLive = isToday && allEvents.some((e) => e.stage === s && e.liveStatus === 'live');
            const isCurrentAuto = !manualStage && i === stageIndex && autoPlay;

            return (
              <button
                key={s}
                onClick={() => selectStage(s)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-200'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {hasLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                {isCurrentAuto && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                <span>{shortStage(s)}</span>
              </button>
            );
          })}

          <button
            onClick={goNext}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer text-slate-600 hover:text-slate-900"
            title="Next Stage"
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Category Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">Category:</span>
          {categories.slice(0, 7).map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isCatActive
                    ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
          <span className="text-xs font-bold text-slate-600 ml-2 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200">
            {stageEvents.length} Events
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. MAIN VIEWPORT (2-COLUMN BALANCED BROADCAST LAYOUT)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 p-5 overflow-hidden">

        {/* ── LEFT PANEL: SMART HERO CARD + VENUES + SESSION & CATEGORY BREAKDOWN ─ */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 min-h-0">

          {/* SMART HERO EVENT CARD (DYNAMIC STATE SYSTEM) */}
          <div
            className={`transition-opacity duration-300 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {heroEvent ? (
              <div
                className={`rounded-2xl p-5 relative overflow-hidden transition-all border ${
                  heroEvent.liveStatus === 'live'
                    ? 'bg-gradient-to-br from-red-50 via-white to-orange-50 border-2 border-red-500/50 shadow-md ring-2 ring-red-100'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {/* Status Eyebrow & Countdown */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {heroEvent.liveStatus === 'live' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-700">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-widest">🔴 Live Now</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {heroEvent.liveStatus === 'next' ? 'Next Up' : 'First Event'}
                      </span>
                    </div>
                  )}

                  {countdown && (
                    <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      Starts in {countdown}
                    </span>
                  )}
                </div>

                {/* Big Time Display */}
                <div
                  className={`text-4xl font-black tabular-nums tracking-tight mb-1.5 ${
                    heroEvent.liveStatus === 'live' ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {heroEvent.time}
                </div>

                {/* Event Title */}
                <h3 className="font-serif-cormorant text-2xl font-bold text-slate-900 leading-snug mb-2">
                  {heroEvent.title}
                </h3>

                {/* Category & Venue Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      getCatStyle(heroEvent.category).pill
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getCatStyle(heroEvent.category).dot}`} />
                    {heroEvent.category}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {shortStage(heroEvent.stage)}
                  </span>
                </div>

                {/* Coordinator / Participants Info */}
                {(heroEvent.coordinator || heroEvent.participants) && (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    {heroEvent.coordinator && (
                      <p className="truncate">
                        <span className="text-slate-400 font-semibold">Coord:</span> {heroEvent.coordinator}
                      </p>
                    )}
                    {heroEvent.participants && (
                      <p className="text-slate-600">
                        <span className="text-slate-400 font-semibold">Participants:</span> {heroEvent.participants}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-6 bg-white border border-slate-200 flex flex-col items-center gap-3 text-center shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Stage Completed</h4>
                  <p className="text-xs text-slate-500 mt-1">All competitions at this venue have finished for today.</p>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE VENUES LIST */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Active Venues Today
              </span>
              <span className="text-[10px] font-bold text-slate-500">{stages.length} Venues</span>
            </div>

            <div className="space-y-1.5">
              {stages.map((stg) => {
                const isSelected = manualStage === 'ALL' ? false : stg === activeStage;
                const count = allEvents.filter((e) => e.stage === stg).length;
                const stgLive = isToday && allEvents.some((e) => e.stage === stg && e.liveStatus === 'live');

                return (
                  <button
                    key={stg}
                    onClick={() => selectStage(stg)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {stgLive ? (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      ) : (
                        <MapPin className={`w-3 h-3 shrink-0 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} />
                      )}
                      <span className="text-xs truncate">{stg.replace(/^Stage \d+:\s*/, '')}</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {count} items
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SESSION TIMELINE BREAKDOWN (Fills the space meaningfully) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Schedule Sessions
              </span>
              <span className="text-[10px] font-bold text-slate-500">2 Sessions</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Morning</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">9:00 AM – 1:00 PM</div>
                <div className="text-xs font-extrabold text-blue-600 mt-1">{morningEvents.length} Events</div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Afternoon</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">1:40 PM – 6:00 PM</div>
                <div className="text-xs font-extrabold text-amber-600 mt-1">{afternoonEvents.length} Events</div>
              </div>
            </div>
          </div>

          {/* CATEGORY DISTRIBUTION OVERVIEW */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 shrink-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Category Highlights
              </span>
              <span className="text-[10px] font-bold text-slate-500">{categoryDistribution.length} Categories</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {categoryDistribution.map(([cat, count]) => {
                const style = getCatStyle(cat);
                const pct = Math.round((count / stageEvents.length) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        {cat}
                      </span>
                      <span className="text-slate-500 tabular-nums">{count} items ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${style.dot} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: EXPLICIT VERTICAL TIMELINE WITH TELEPROMPTER AUTO-SCROLL ─ */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">

          {/* Timeline Header with TV Auto-Scroll Indicator */}
          <div className="flex-shrink-0 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                {manualStage === 'ALL' ? 'All Venues Schedule' : shortStage(activeStage)} Timeline
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                {stageEvents.length} events
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* TV Auto-Scroll Controller */}
              <button
                onClick={() => setIsAutoScrollEnabled((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                  isAutoScrollEnabled
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="Toggle smooth auto-scrolling for TV screens"
              >
                {isAutoScrollEnabled ? (
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

              {isToday && doneCount > 0 && (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                  {doneCount} finished
                </span>
              )}
            </div>
          </div>

          {/* Timeline List (Continuous Connector Line & Smooth Teleprompter Auto-Scroll) */}
          <div
            ref={timelineScrollRef}
            onMouseEnter={handleUserInteraction}
            onMouseMove={handleUserInteraction}
            onTouchStart={handleUserInteraction}
            onWheel={handleUserInteraction}
            className="flex-1 overflow-y-auto p-5 relative scroll-smooth focus:outline-none"
          >
            {stageEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Clock className="w-10 h-10 mb-2 opacity-30" />
                <p className="font-bold text-sm text-slate-600">No events match the selected filter.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setManualStage('ALL'); }}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="relative pl-6">
                
                {/* Explicit Vertical Continuous Connector Line */}
                <div className="absolute left-[31px] top-4 bottom-6 w-0.5 bg-slate-200 pointer-events-none" />

                <div className="space-y-3.5 pb-8">
                  {stageEvents.map((ev) => {
                    const isLive = ev.liveStatus === 'live';
                    const isNext = ev.liveStatus === 'next';
                    const isDone = ev.liveStatus === 'done';
                    const catStyle = getCatStyle(ev.category);

                    return (
                      <div
                        key={ev.id}
                        className={`relative flex items-start gap-4 p-4 rounded-2xl transition-all ${
                          isLive
                            ? 'bg-red-50/80 border-2 border-red-400 shadow-md ring-2 ring-red-100'
                            : isNext
                            ? 'bg-blue-50/70 border border-blue-200 shadow-xs'
                            : isDone
                            ? 'bg-slate-50/60 border border-slate-100 opacity-60'
                            : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {/* Timeline Node on the Connector Line */}
                        <div className="absolute -left-[30px] top-5 shrink-0 flex items-center justify-center">
                          {isLive ? (
                            <span className="relative flex h-5 w-5 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 ring-2 ring-white" />
                            </span>
                          ) : isDone ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            </span>
                          ) : isNext ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
                          )}
                        </div>

                        {/* Event Time */}
                        <div className="w-24 shrink-0 pt-0.5">
                          <span
                            className={`text-base font-black tabular-nums tracking-tight ${
                              isLive ? 'text-red-600' : isNext ? 'text-blue-700' : isDone ? 'text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {ev.time}
                          </span>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                            {shortStage(ev.stage)}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4
                              className={`text-base leading-snug ${
                                isLive
                                  ? 'font-black text-slate-900'
                                  : isDone
                                  ? 'font-medium text-slate-400 line-through'
                                  : 'font-bold text-slate-800'
                              }`}
                            >
                              {ev.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catStyle.pill}`}>
                              {ev.category}
                            </span>

                            {ev.coordinator && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                                {ev.coordinator}
                              </span>
                            )}

                            {ev.participants && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                • {typeof ev.participants === 'number' ? `${ev.participants} participants` : ev.participants}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right State Badge */}
                        <div className="shrink-0 pt-0.5">
                          {isLive && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 text-[10px] font-black uppercase tracking-wider">
                              <Radio className="w-3 h-3 text-red-600 animate-pulse" /> LIVE NOW
                            </span>
                          )}
                          {isNext && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                              UP NEXT
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              DONE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* End of schedule loop indicator */}
                  <div className="pt-4 pb-2 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin opacity-50" />
                    <span>Auto-scrolling all {stageEvents.length} events • Seamless TV Loop</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. BOTTOM STATUS STRIP (CLEAN BROADCAST-STYLE FOOTER)
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
            {totalFestEvents} EVENTS TODAY
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
          <span>Auto-Scroll Active • Large TV Display Board</span>
        </div>
      </div>
    </div>
  );
};
