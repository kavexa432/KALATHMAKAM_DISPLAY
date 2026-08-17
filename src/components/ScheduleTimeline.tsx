import React, { useState } from 'react';
import { DAYS_LIST, SCHEDULE_DATA, DAY2_SCHEDULE_DATA, DAY3_SCHEDULE_DATA, PREFEST_SCHEDULE_DATA } from '../data/scheduleData';
import { Clock, MapPin, CheckCircle, Radio, Calendar, ChevronDown } from 'lucide-react';

export const ScheduleTimeline: React.FC = () => {
  const [activeDay, setActiveDay] = useState<string>(DAYS_LIST[0]);
  const [activeStage, setActiveStage] = useState<string>('All Venues');
  const [sessionFilter, setSessionFilter] = useState<'Morning' | 'Afternoon' | 'All'>('Morning');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Show first 8 cards, rest behind "View More"
  const [showAll, setShowAll] = useState(false);

  const INITIAL_VISIBLE = 8;

  const ALL_SCHEDULE = [...SCHEDULE_DATA, ...DAY2_SCHEDULE_DATA, ...DAY3_SCHEDULE_DATA, ...PREFEST_SCHEDULE_DATA];
  const filteredScheduleByDay = ALL_SCHEDULE.filter((item) => item.day === activeDay);
  const uniqueStages = Array.from(new Set(filteredScheduleByDay.map(item => item.stage).filter(Boolean)));

  const isMorningItem = (timeStr: string) => {
    if (timeStr.includes('Completed Pre-Fest')) return true;
    if (timeStr.includes('TBA') || timeStr.includes('Same Session')) return true;
    if (timeStr.includes('AM')) return true;
    if (timeStr.includes('PM')) {
      if (timeStr.startsWith('12:') || timeStr.startsWith('01:00')) return true;
      return false;
    }
    return true;
  };

  const filteredSchedule = filteredScheduleByDay.filter((item) => {
    // Lunch breaks (no stage) always pass stage filter — they belong to whatever context they're in
    const isBreak = item.category === 'Break';
    const matchesStage = activeStage === 'All Venues' || item.stage === activeStage || isBreak;
    if (!matchesStage) return false;
    if (sessionFilter === 'Morning') return isMorningItem(item.time);
    if (sessionFilter === 'Afternoon') return !isMorningItem(item.time);
    return true;
  });


  const visibleItems = showAll ? filteredSchedule : filteredSchedule.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filteredSchedule.length - INITIAL_VISIBLE;

  // Reset expanded & showAll when filters change
  const handleDayChange = (day: string) => {
    setActiveDay(day);
    setActiveStage('All Venues');
    setExpandedId(null);
    setShowAll(false);
  };

  const handleStageChange = (stage: string) => {
    setActiveStage(stage);
    setExpandedId(null);
    setShowAll(false);
  };

  const handleSessionChange = (s: 'Morning' | 'Afternoon' | 'All') => {
    setSessionFilter(s);
    setExpandedId(null);
    setShowAll(false);
  };

  return (
    <section id="schedule" className="py-20 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-sans-manrope font-extrabold tracking-[0.25em] text-[#FF5E84] uppercase">
            PROGRAM AGENDA
          </span>
          <h2 className="font-serif-cormorant text-4xl sm:text-5xl font-bold text-[#111111]">
            Festival Schedule
          </h2>
          <p className="font-sans-manrope text-sm text-[#5F5F5F]">
            Live competition schedule across 7 official stages at MGM Model School campus.
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center justify-center gap-2.5 mb-5 overflow-x-auto pb-1">
          {DAYS_LIST.map((day) => (
            <button
              key={day}
              onClick={() => handleDayChange(day)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-sans-manrope font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeDay === day
                  ? 'bg-gradient-to-r from-[#FF5E84] to-[#FF8A00] text-white shadow-md scale-105'
                  : 'bg-white border border-black/10 text-[#5F5F5F] hover:text-[#111111]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{day}</span>
            </button>
          ))}
        </div>

        {/* Session Filter */}
        {activeDay.includes('Stages') && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-5">
            {(['Morning', 'Afternoon', 'All'] as const).map((s) => {
              const labels = {
                Morning: '🌅 Morning (09:00 AM – 01:00 PM)',
                Afternoon: '☀️ Afternoon (01:30 PM – 06:30 PM)',
                All: '🗓 Full Day (All Events)',
              };
              return (
                <button
                  key={s}
                  onClick={() => handleSessionChange(s)}
                  className={`px-4 py-2 rounded-full text-xs font-sans-manrope font-extrabold transition-all cursor-pointer ${
                    sessionFilter === s
                      ? s === 'Morning' ? 'bg-[#FF5E84] text-white shadow-sm'
                        : s === 'Afternoon' ? 'bg-[#FF8A00] text-white shadow-sm'
                        : 'bg-[#111111] text-white shadow-sm'
                      : 'bg-white border border-black/10 text-[#5F5F5F] hover:text-[#111111]'
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </div>
        )}

        {/* Venue Selector */}
        {uniqueStages.length > 1 && (
          <div className="flex items-center justify-start sm:justify-center gap-2 mb-8 overflow-x-auto pb-2 px-1">
            <button
              onClick={() => handleStageChange('All Venues')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans-manrope font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeStage === 'All Venues'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-white border border-black/10 text-[#5F5F5F] hover:text-[#111111]'
              }`}
            >
              All Venues
            </button>
            {uniqueStages.map((stage) => (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[11px] font-sans-manrope font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeStage === stage
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-white border border-black/10 text-[#5F5F5F] hover:text-[#111111]'
                }`}
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>{stage.replace('Stage ', 'S').split(':')[0]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="relative pl-5 sm:pl-8 border-l-2 border-[#FF5E84]/25 space-y-3 ml-2 sm:ml-4">
          {filteredSchedule.length > 0 ? (
            <>
              {visibleItems.map((item) => {
                const isCompleted = item.status === 'Completed';
                const isLive = item.status === 'Live';
                const isExpanded = expandedId === item.id;
                const hasDetails = item.coordinator || item.participants;

                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[40px] top-3.5 w-4 h-4 rounded-full flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-125 ${
                        isLive
                          ? 'bg-[#FF8A00] border-white ring-2 ring-[#FF8A00]/30 animate-pulse'
                          : isCompleted
                          ? 'bg-[#FF5E84] border-white'
                          : 'bg-white border-[#FF5E84]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      ) : isLive ? (
                        <Radio className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF5E84]" />
                      )}
                    </div>

                    {/* Compact Card */}
                    <div
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                        isExpanded ? 'border-[#FF5E84]/40 shadow-sm' : 'border-black/8 hover:border-[#FF5E84]/25'
                      } ${hasDetails ? 'cursor-pointer' : ''}`}
                      onClick={() => hasDetails && setExpandedId(isExpanded ? null : item.id)}
                    >
                      {/* Main Row — always visible */}
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Time */}
                          <span className="shrink-0 flex items-center gap-1 text-[11px] font-sans-manrope font-bold text-[#FF5E84] whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>

                          {/* Title */}
                          <span className="font-serif-cormorant font-bold text-[15px] sm:text-base text-[#111111] leading-tight truncate">
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-sans-manrope font-bold whitespace-nowrap ${
                              isLive
                                ? 'bg-amber-500 text-white animate-pulse'
                                : isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.status}
                          </span>

                          {/* Expand chevron if has details */}
                          {hasDetails && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-[#5F5F5F] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Sub-row: venue (only shown when stage is set) */}
                      {item.stage && (
                        <div className="flex items-center gap-1.5 px-4 pb-2.5 -mt-1">
                          <MapPin className="w-2.5 h-2.5 text-[#FF8A00] shrink-0" />
                          <span className="text-[11px] font-sans-manrope text-[#5F5F5F] truncate">{item.stage}</span>
                        </div>
                      )}

                      {/* Expanded details */}
                      {isExpanded && hasDetails && (
                        <div className="px-4 pb-3.5 pt-1 border-t border-black/6 space-y-1.5 bg-[#FAF8F5]">
                          {item.participants && (
                            <div className="flex items-center gap-1.5 text-xs font-sans-manrope">
                              <span className="text-[#5F5F5F]">Participants:</span>
                              <span className="font-bold text-[#FF5E84]">{item.participants}</span>
                            </div>
                          )}
                          {item.coordinator && (
                            <div className="flex items-center gap-1.5 text-xs font-sans-manrope">
                              <span className="text-[#5F5F5F]">Coordinator:</span>
                              <span className="font-bold text-[#111111]">{item.coordinator}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* View More / Show Less */}
              {filteredSchedule.length > INITIAL_VISIBLE && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#FF5E84]/40 text-[#FF5E84] font-sans-manrope font-bold text-xs hover:bg-[#FF5E84] hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
                    {showAll ? 'Show Less' : `View ${hiddenCount} More Events`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-black/8 text-center text-[#5F5F5F] font-sans-manrope text-sm">
              No events scheduled for {activeDay}.
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
