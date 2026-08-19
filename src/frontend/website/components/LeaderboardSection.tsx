import React, { useState } from 'react';
import { Trophy, TrendingUp, Info, ArrowRight, RotateCw, Clock, Filter, Building2, Crown, Sparkles } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';
import { HouseDetailModal } from './HouseDetailModal';

// Official House Emblem Images
import vegaEmblem from '../../../assets/houses/vega.png';
import novaEmblem from '../../../assets/houses/nova.png';
import orionEmblem from '../../../assets/houses/orion.png';
import astraEmblem from '../../../assets/houses/astra.png';

const houseEmblems: Record<HouseId, string> = {
  VEGA: vegaEmblem,
  NOVA: novaEmblem,
  ORION: orionEmblem,
  ASTRA: astraEmblem,
  NONE: '',
};

import { rankByPoints } from '../../../shared/utils/ranking';

export const LeaderboardSection: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals, results } = useFestival();
  const [selectedHouse, setSelectedHouse] = useState<HouseId | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [showPointSystemModal, setShowPointSystemModal] = useState(false);

  // Compute Live House Standings dynamically from Firebase Results with Tie Support
  const rawStandings = houses.map((h) => {
    const houseId = h.id as HouseId;
    const pts = getHousePoints(houseId);
    const medals = getHouseMedals(houseId);
    
    // Calculate recent points delta & wins for this house from results
    const houseResults = results.filter((r) => r.houseId === houseId && r.status === 'Published');
    const recentDelta = houseResults.slice(0, 3).reduce((sum, r) => sum + r.points, 0);
    const totalWins = houseResults.length;
    const latestWin = houseResults.length > 0 ? houseResults[0].eventTitle : 'None yet';

    return {
      ...h,
      points: pts,
      medals,
      totalWins,
      latestWin,
      recentDelta,
    };
  });

  const standings = rankByPoints(rawStandings);

  const leaders = standings.filter((h) => h.rank === 1);
  const isLeaderTie = leaders.length > 1;
  const leaderHouse = standings[0];
  const secondHouse = standings.find((h) => h.rank > 1) ?? standings[1];
  const leadPointsDiff = leaderHouse.points - (secondHouse ? secondHouse.points : 0);
  const maxPoints = Math.max(...standings.map((s) => s.points), 1);

  const getCategoryTag = (category: string, eventTitle: string) => {
    const value = `${category} ${eventTitle}`.toLowerCase();
    if (value.includes('music') || value.includes('song') || value.includes('mappila')) return 'Music';
    if (value.includes('dance') || value.includes('bharat') || value.includes('mohini') || value.includes('kuchi')) return 'Dance';
    if (value.includes('literary') || value.includes('essay') || value.includes('story') || value.includes('versification')) return 'Literary';
    if (value.includes('fine') || value.includes('art') || value.includes('drawing') || value.includes('painting') || value.includes('poster') || value.includes('cartoon') || value.includes('collage')) return 'Fine Arts';
    return 'Other';
  };

  // Recent result data from Firebase results
  const recentWinsData = results
    .filter((r) => r.status === 'Published' || r.status === 'Verified')
    .map((r, i) => {
      const winnerHouse = String(r.houseId || 'NONE').toUpperCase() as HouseId;
      const isHousePointResult = winnerHouse !== 'NONE' && String(winnerHouse) !== 'N/A' && r.points > 0;
      const pos = r.position || '1st';
      const medalIcon = pos === '1st' ? '🥇' : pos === '2nd' ? '🥈' : pos === '3rd' ? '🥉' : '🏅';
      const posLabel = pos === '1st' ? '🥇 1st Place' : pos === '2nd' ? '🥈 2nd Place' : pos === '3rd' ? '🥉 3rd Place' : `🏅 ${pos}`;

      return {
        id: r.id,
        time: `${11 - (i % 5)}:${45 - (i % 8) * 5} AM`,
        date: '05 Aug, 2026',
        categoryTag: getCategoryTag(r.category, r.eventTitle),
        competition: r.eventTitle,
        categoryType: r.category,
        winnerHouse,
        isHousePointResult,
        points: `+${r.points}`,
        participant: r.participantName,
        studentClass: r.studentClass,
        position: pos,
        positionLabel: posLabel,
        medalIcon: medalIcon,
      };
    });

  const categoryFilters = ['All', 'Music', 'Dance', 'Literary', 'Fine Arts'];

  const filteredWinsData = activeCategoryFilter === 'All'
    ? recentWinsData
    : recentWinsData.filter((w) => w.categoryTag === activeCategoryFilter);
  const housePointWinsData = filteredWinsData.filter((w) => w.isHousePointResult);
  const individualWinsData = filteredWinsData.filter((w) => !w.isHousePointResult);

  const renderResultRow = (row: typeof recentWinsData[number]) => {
    const houseColor = houseColors[row.winnerHouse as HouseId] || houseColors.NOVA;
    const isIndividual = !row.isHousePointResult;

    const posBadgeStyles: Record<string, string> = {
      '1st': 'bg-amber-100 text-amber-900 border-amber-300 font-black',
      '2nd': 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold',
      '3rd': 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold',
    };

    return (
      <div
        key={row.id}
        className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-black/6 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-black/10 flex items-center justify-center shrink-0 text-xl shadow-2xs">
            {row.medalIcon}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                {row.competition}
              </h4>
              <span className={`text-[11px] font-sans-manrope px-2.5 py-0.5 rounded-full border shrink-0 ${posBadgeStyles[row.position] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {row.positionLabel}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#5F5F5F]">
                {row.categoryType}
              </span>
              {isIndividual && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Individual result
                </span>
              )}
            </div>
            <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-0.5">
              Winner: <strong className="text-[#111111] font-semibold">{row.participant}</strong> - {row.studentClass}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
          {isIndividual ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/8 text-xs font-extrabold text-[#5F5F5F]">
              Non-House
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/8 text-xs font-extrabold">
              <img
                src={houseEmblems[row.winnerHouse as HouseId]}
                alt={row.winnerHouse}
                className="w-4 h-4 object-contain mix-blend-multiply"
              />
              <span style={{ color: houseColor.primary }}>{row.winnerHouse}</span>
            </span>
          )}

          <div className="text-right">
            <span className={`font-sans-manrope font-black text-sm ${isIndividual ? 'text-[#5F5F5F]' : 'text-emerald-600'}`}>
              {isIndividual ? 'No house pts' : row.points}
            </span>
            <span className="block text-[10px] text-[#5F5F5F] font-medium">{row.time}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="leaderboard" className="relative py-14 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Live Status Bar & Current Leader Card */}
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          
          <div className="text-left space-y-3 max-w-2xl">
            <h2 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight flex items-center gap-2">
              <span>
                House{' '}
                <span className="bg-gradient-to-r from-[#FF5E84] to-[#F59E0B] bg-clip-text text-transparent">
                  Leaderboard
                </span>
              </span>
              <span className="text-[#F59E0B] text-3xl font-normal">✦</span>
            </h2>

            <p className="font-sans-manrope text-xs sm:text-sm text-[#5F5F5F] font-medium">
              Real-time points dynamically computed from published competition results.
            </p>

            {/* Live Sub-Stats Pill Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#111111] border border-black/8 text-[11px] font-extrabold font-sans-manrope shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#FF5E84]" />
                <span>4 Houses Competing</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#111111] border border-black/8 text-[11px] font-extrabold font-sans-manrope shadow-2xs">
                <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{results.length} Results Published</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#111111] border border-black/8 text-[11px] font-extrabold font-sans-manrope shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>20+ Events Scheduled</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold font-sans-manrope">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Auto-updated</span>
              </span>
            </div>
          </div>

          {/* Current Leader Card (Right Header) */}
          <div className="w-full lg:w-auto shrink-0">
            <div className="bg-gradient-to-br from-[#111111] to-[#2B2B2B] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-white/20 flex items-center gap-4 text-left relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
                <Trophy className="w-24 h-24 text-[#F59E0B]" />
              </div>

              <div className="flex items-center -space-x-2 shrink-0">
                {leaders.slice(0, 2).map((l) => (
                  <div key={l.id} className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FFA033] p-0.5 shrink-0 shadow-md">
                    <div className="w-full h-full bg-[#111111] rounded-[10px] flex items-center justify-center">
                      <img
                        src={houseEmblems[l.id as HouseId]}
                        alt={l.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F59E0B]">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isLeaderTie ? 'CO-CHAMPIONS (TIED)' : 'CURRENT CHAMPION'}</span>
                </div>
                <h4 className="font-sans-manrope font-black text-lg text-white">
                  {isLeaderTie
                    ? `HOUSES ${leaders.map((l) => l.name).join(' & ')} • ${leaders[0]?.points ?? 0} PTS`
                    : `HOUSE ${leaderHouse?.name ?? ''} • ${leaderHouse?.points ?? 0} PTS`}
                </h4>
                <p className="font-sans-manrope text-[11px] text-white/70">
                  {isLeaderTie
                    ? `Tied for 1st place (${leaders.length} houses equal on points)`
                    : leadPointsDiff > 0
                    ? `Leading by +${leadPointsDiff} PTS ahead of 2nd place`
                    : 'Tied for 1st place'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Top 4 House Cards Row (Compact 260px Height, Left-Aligned, Rich Info) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {standings.map((h) => {
            const houseId = h.id as HouseId;
            const colorInfo = houseColors[houseId];
            const isFirstRank = h.rank === 1;

            const rankBadge = h.rank === 1
              ? { text: h.isTied ? 'Rank #1 (Tied)' : 'Rank #1', bg: 'bg-[#F59E0B]', textColor: 'text-white' }
              : h.rank === 2
              ? { text: h.isTied ? 'Rank #2 (Tied)' : 'Rank #2', bg: 'bg-slate-100', textColor: 'text-slate-700' }
              : h.rank === 3
              ? { text: h.isTied ? 'Rank #3 (Tied)' : 'Rank #3', bg: 'bg-amber-100', textColor: 'text-amber-800' }
              : { text: h.isTied ? 'Rank #4 (Tied)' : 'Rank #4', bg: 'bg-slate-100', textColor: 'text-slate-600' };

            return (
              <div
                key={h.id}
                onClick={() => setSelectedHouse(houseId)}
                className={`relative rounded-[24px] p-5 bg-white transition-all duration-300 cursor-pointer text-left flex flex-col justify-between space-y-3.5 border group hover:-translate-y-1 ${
                  isFirstRank
                    ? 'border-[#F59E0B] shadow-lg ring-2 ring-[#F59E0B]/30'
                    : 'border-black/8 hover:border-black/15 shadow-2xs hover:shadow-md'
                }`}
                style={{
                  borderTopWidth: '4px',
                  borderTopColor: colorInfo.primary,
                }}
              >
                {/* Crown Icon on Top Edge for 1st Rank Leader(s) */}
                {isFirstRank && (
                  <div className="absolute -top-3 left-6 bg-[#F59E0B] text-white p-1 rounded-full shadow-xs">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Card Top Header: Rank Badge Right + House Logo Left */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    {/* Compact Scaled Emblem Circle (22% smaller) */}
                    <div className="w-12 h-12 rounded-xl bg-white border border-black/8 shadow-2xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={houseEmblems[houseId]}
                        alt={`${houseId} Emblem`}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div>
                      <h3
                        className="font-sans-manrope font-black text-lg tracking-wider uppercase leading-none"
                        style={{ color: colorInfo.primary }}
                      >
                        {h.name}
                      </h3>
                      <span className="font-sans-manrope text-[11px] text-[#5F5F5F] font-semibold">
                        {h.totalWins} Victories
                      </span>
                    </div>
                  </div>

                  {/* Rank Pill Badge Top Right */}
                  <span className={`text-[10px] font-sans-manrope font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${rankBadge.bg} ${rankBadge.textColor}`}>
                    {rankBadge.text}
                  </span>
                </div>

                {/* Score & Gain Info Row */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-black/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-sans-manrope font-bold text-[#5F5F5F] uppercase block">
                      TOTAL SCORE
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-sans-manrope font-black text-3xl text-[#111111] leading-none">
                        {h.points}
                      </span>
                      <span className="font-sans-manrope font-extrabold text-[11px] text-[#5F5F5F]">
                        PTS
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block">
                      ▲ +{h.recentDelta} Today
                    </span>
                    <span className="block text-[10px] text-[#5F5F5F] font-medium mt-0.5">
                      {h.medals.gold} Gold Medals
                    </span>
                  </div>
                </div>

                {/* Latest Victory Subtext */}
                <div className="pt-0.5 flex items-center justify-between text-[11px] font-sans-manrope text-[#5F5F5F]">
                  <span className="truncate">
                    <strong className="text-[#111111]">Last Win:</strong> {h.latestWin}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF5E84] group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Two Columns Grid: Recent Wins Cards Feed (Left 2/3) + Points Overview (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Recent Wins Activity Feed with Category Pills */}
          <div className="lg:col-span-8 bg-white rounded-[28px] p-6 sm:p-7 border border-black/8 shadow-sm flex flex-col justify-between space-y-6 text-left">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans-manrope font-extrabold text-base sm:text-lg text-[#111111] flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span>Recent Victories & Live Activity</span>
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F] mt-0.5">
                  Verified results published by festival judges
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-[#5F5F5F] shrink-0 mr-1" />
                {categoryFilters.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-sans-manrope font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeCategoryFilter === cat
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Comparison Feed */}
            <div className="space-y-5">
              {filteredWinsData.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                        House Point Winners
                      </h4>
                      <span className="text-[10px] text-[#10B981] font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        Counts in leaderboard
                      </span>
                    </div>
                    {housePointWinsData.length > 0 ? (
                      housePointWinsData.map(renderResultRow)
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/5 text-xs font-sans-manrope text-[#5F5F5F]">
                        No house-point results in this filter yet.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-black/8">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-sans-manrope font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                        Individual Winners
                      </h4>
                      <span className="text-[10px] text-blue-700 font-extrabold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        Not house-wise
                      </span>
                    </div>
                    {individualWinsData.length > 0 ? (
                      individualWinsData.map(renderResultRow)
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/5 text-xs font-sans-manrope text-[#5F5F5F]">
                        No individual/non-house results in this filter yet.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-2">
                  <Trophy className="w-8 h-8 text-[#F59E0B] mx-auto opacity-70" />
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                    No Verified Results Published Yet
                  </h4>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                    Results will populate live here as administrators upload and publish verified result sheets.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Button */}
            <div className="pt-2 flex justify-center">
              <a
                href="#results"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-black/5 text-[#111111] font-sans-manrope font-bold text-xs border border-black/10 transition-colors"
              >
                <span>Explore Full Festival Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Right Column (4 cols): Rich Points Overview */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Rich Points Overview Bars */}
            <div className="bg-white rounded-[28px] p-6 border border-black/8 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-sans-manrope font-extrabold text-base text-[#111111] flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-[#3B82F6]" />
                  <span>House Points Overview</span>
                </h3>
              </div>

              <div className="space-y-4">
                {standings.map((h) => {
                  const houseId = h.id as HouseId;
                  const colorInfo = houseColors[houseId];
                  const pct = Math.round((h.points / maxPoints) * 100);

                  return (
                    <div key={h.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-sans-manrope font-bold">
                        <span className="flex items-center gap-2" style={{ color: colorInfo.primary }}>
                          <img src={houseEmblems[houseId]} alt={houseId} className="w-4.5 h-4.5 object-contain mix-blend-multiply" />
                          <span>{h.name}</span>
                        </span>
                        <div className="text-right">
                          <span className="text-[#111111] font-black text-sm">{h.points} PTS</span>
                          <span className="block text-[10px] text-emerald-600 font-bold">▲ +{h.recentDelta} Today</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-black/8 p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: colorInfo.primary,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#5F5F5F] font-medium pt-0.5">
                        <span>🥇 {h.medals.gold} Golds</span>
                        <span>{h.totalWins} Total Wins</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Collapsible How Points Work? */}
            <div className="bg-white rounded-[28px] p-6 border border-black/8 shadow-sm space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Info className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                    CBSE Point Allocation System
                  </h4>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F] leading-relaxed mt-1">
                    Points are automatically assigned upon judge result publication. Higher events yield bonus house points.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPointSystemModal(true)}
                className="w-full py-2.5 px-4 rounded-full bg-[#FAF8F5] hover:bg-black/5 border border-black/10 text-[#111111] font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>View Full Point Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Footer Status Bar */}
        <div className="mt-8 pt-4 border-t border-black/8 flex flex-wrap items-center justify-between gap-4 text-xs font-sans-manrope text-[#5F5F5F]">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-[#5F5F5F]" />
            <span>Last updated: 11:45 AM, 05 Aug 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#5F5F5F]" />
            <span>Updates every 30 seconds</span>
          </div>
        </div>

      </div>

      {/* House Detail Profile Modal */}
      <HouseDetailModal
        houseId={selectedHouse}
        onClose={() => setSelectedHouse(null)}
      />

      {/* Point System Info Modal */}
      {showPointSystemModal && (
        <div
          onClick={() => setShowPointSystemModal(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-7 border border-black/10 shadow-2xl space-y-5 text-left cursor-default"
          >
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                Official CBSE Point Allocation Rules
              </h3>
              <button
                onClick={() => setShowPointSystemModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#111111]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans-manrope">
              <div className="p-3.5 rounded-2xl bg-white border border-black/8 space-y-1.5">
                <h5 className="font-extrabold text-[#111111]">🥇 1st Position (Gold)</h5>
                <p className="text-[#5F5F5F]">Individual & Team House Items (PPT, Anchoring, Turn Coat, Declamation): +10 Pts • Large Group Items (Mime, Group Dance, Oppana): +20 Pts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-black/8 space-y-1.5">
                <h5 className="font-extrabold text-[#111111]">🥈 2nd Position (Silver)</h5>
                <p className="text-[#5F5F5F]">Individual & Team House Items: +7 Pts • Large Group Items: +15 Pts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-black/8 space-y-1.5">
                <h5 className="font-extrabold text-[#111111]">🥉 3rd Position (Bronze)</h5>
                <p className="text-[#5F5F5F]">Individual & Team House Items: +5 Pts • Large Group Items: +10 Pts</p>
              </div>
            </div>

            <button
              onClick={() => setShowPointSystemModal(false)}
              className="w-full py-3 rounded-full bg-[#111111] text-white font-bold text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
