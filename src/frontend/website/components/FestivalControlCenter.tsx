import React from 'react';
import { Radio, Trophy, Bell, ArrowRight } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';
import { formatTime12Hour } from '../../../utils/timeUtils';
import { cleanVenueName } from '../../../utils/venueUtils';
import { rankByPoints } from '../../../shared/utils/ranking';

export const FestivalControlCenter: React.FC = () => {
  const { events, houses, getHousePoints, liveFeed } = useFestival();

  // Only consider today's scheduled stage events (not house items) for the live display
  const todayEvents = events.filter(
    (e) => e.date === '2026-08-10' && e.category !== 'House Item' && e.category !== 'Ceremony' && !e.cancelled
  );

  // Find active live event or fallback to next upcoming today
  const liveEvent = todayEvents.find((e) => e.status === 'Running') || todayEvents.find((e) => e.status === 'Upcoming');
  
  // Find the event that comes immediately after the live event on the same stage
  const nextEvent = liveEvent 
    ? todayEvents.find((e) => e.stage === liveEvent.stage && e.status === 'Upcoming' && e.id !== liveEvent.id)
    : undefined;

  const latestNotice = liveFeed[0];

  // Computed House Standings with Ties
  const rawStandings = houses.map((h) => ({
    ...h,
    points: getHousePoints(h.id),
  }));

  const standings = rankByPoints(rawStandings);

  // Don't render a mostly-empty widget if no events are loaded yet
  if (events.length === 0) return null;

  return (
    <section className="relative py-4 sm:py-6 z-20">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Glass Control Center Container */}
        <div className="glass-card bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-xl border border-white/95 relative overflow-hidden">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] text-white flex items-center justify-center shadow-xs">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-cormorant font-bold text-xl sm:text-2xl text-[#111111] leading-none">
                    KALATHMAKAM FESTIVAL CONTROL CENTER
                  </h3>
                  <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    ● LIVE
                  </span>
                </div>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-0.5">
                  Real-time Festival Status • Day 2 • MGM Ayiroor
                </p>
              </div>
            </div>

            <a
              href="#leaderboard"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-sans-manrope font-bold text-[#FF5E84] hover:text-[#F59E0B] transition-colors"
            >
              <span>Full Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 3-Column Grid: Live Stage | House Standings | Latest Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Column 1: Current Live Event Status (lg:col-span-4) */}
            <div className="lg:col-span-4 bg-[#FAF8F5] rounded-2xl p-5 border border-black/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans-manrope font-extrabold tracking-widest text-[#5F5F5F] uppercase">
                  🎭 CURRENT STAGE EVENT
                </span>
                {liveEvent?.status === 'Running' ? (
                  <span className="bg-red-500/15 text-red-600 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    LIVE NOW
                  </span>
                ) : (
                  <span className="bg-blue-500/15 text-blue-600 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {liveEvent?.status || 'No events'}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  {liveEvent?.eventName || 'Loading...'}
                </h4>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-1 font-semibold">
                  📍 {liveEvent ? cleanVenueName(liveEvent.venue, liveEvent.stage) : ''} • Category: {liveEvent?.category || ''}
                </p>
              </div>

              <div className="pt-2 border-t border-black/6 flex items-center justify-between text-xs font-sans-manrope">
                <span className="text-[#5F5F5F]">Next Up:</span>
                <span className="font-bold text-[#111111]">
                  {nextEvent ? `${nextEvent.eventName} @ ${formatTime12Hour(nextEvent.scheduledStartTime)}` : 'None Scheduled'}
                </span>
              </div>
            </div>

            {/* Column 2: House Standings Live Score Cards (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-[#FAF8F5] rounded-2xl p-5 border border-black/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans-manrope font-extrabold tracking-widest text-[#5F5F5F] uppercase flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>LIVE HOUSE STANDINGS</span>
                </span>
                <span className="text-[10px] font-bold text-[#FF5E84]">Auto-Updated</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {standings.map((h) => {
                  const info = houseColors[h.id as HouseId];
                  const medal = h.rank === 1 ? '🥇' : h.rank === 2 ? '🥈' : h.rank === 3 ? '🥉' : '⭐';

                  return (
                    <div
                      key={h.id}
                      className="bg-white rounded-xl p-3 border border-black/5 shadow-2xs flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden group hover:-translate-y-0.5 transition-transform"
                    >
                      <div
                        className="absolute top-0 inset-x-0 h-1"
                        style={{ backgroundColor: info.primary }}
                      />
                      <span className="text-xs">{medal}</span>
                      <span
                        className="font-sans-manrope font-extrabold text-xs tracking-wider"
                        style={{ color: info.primary }}
                      >
                        {h.name}
                      </span>
                      <span className="font-serif-cormorant font-bold text-2xl text-[#111111] leading-none">
                        {h.points}
                      </span>
                      <span className="text-[9px] font-bold text-[#5F5F5F]">PTS</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-[#5F5F5F] text-center font-medium">
                Points dynamically calculated from verified judges results.
              </p>
            </div>

            {/* Column 3: Latest Live Activity Feed Entry (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-[#FAF8F5] rounded-2xl p-5 border border-black/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans-manrope font-extrabold tracking-widest text-[#5F5F5F] uppercase flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>LATEST UPDATE</span>
                </span>
                <span className="text-[10px] text-[#5F5F5F] font-bold">{latestNotice?.timestamp || 'Just Now'}</span>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-black/5 shadow-2xs space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF5E84]/15 text-[#FF5E84]">
                    {latestNotice?.type || 'Notice'}
                  </span>
                </div>
                <p className="font-sans-manrope text-xs text-[#111111] font-semibold leading-relaxed">
                  {latestNotice?.content || 'Welcome to Kalathmakam 2K26 Grand Arts Fest!'}
                </p>
              </div>

              <a
                href="#schedule"
                className="text-center text-xs font-sans-manrope font-bold text-[#3B82F6] hover:underline cursor-pointer"
              >
                View Complete Activity Timeline →
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
