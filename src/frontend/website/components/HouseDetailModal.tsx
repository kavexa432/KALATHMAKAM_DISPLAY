import React, { useEffect } from 'react';
import { X, Trophy, Award, Users, Star, Shield, Flag } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';

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

interface HouseDetailModalProps {
  houseId: HouseId | null;
  onClose: () => void;
}

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({ houseId, onClose }) => {
  const { houses, getHousePoints, getHouseRank, getHouseMedals, results } = useFestival();

  // Press ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!houseId) return null;

  const house = houses.find((h) => h.id === houseId);
  if (!house) return null;

  const colorInfo = houseColors[houseId];
  const points = getHousePoints(houseId);
  const rank = getHouseRank(houseId);
  const medals = getHouseMedals(houseId);

  // House specific verified results
  const houseResults = results.filter((r) => r.houseId === houseId && r.status === 'Published');

  const isTied = houses.some((h) => h.id !== houseId && getHousePoints(h.id) === points);
  const rankSuffix = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`;
  const rankBadge = isTied
    ? `🤝 Shared ${rankSuffix} Rank`
    : rank === 1
    ? '🥇 1st Rank'
    : rank === 2
    ? '🥈 2nd Rank'
    : rank === 3
    ? '🥉 3rd Rank'
    : '⭐ 4th Rank';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] rounded-[32px] max-w-3xl w-full overflow-hidden shadow-2xl border border-black/10 relative my-8 cursor-default"
      >
        {/* Banner Header with House Color & Background Emblem Watermark */}
        <div
          className="p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]"
          style={{
            background: `linear-gradient(135deg, ${colorInfo.primary} 0%, ${colorInfo.secondary} 100%)`,
          }}
        >
          {/* Background Emblem Watermark Image */}
          <img
            src={houseEmblems[houseId as keyof typeof houseEmblems] || ''}
            alt={`${houseId} Emblem`}
            className="absolute -right-6 -bottom-6 w-48 h-48 object-contain opacity-25 pointer-events-none mix-blend-overlay"
          />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md p-2 flex items-center justify-center border border-white/30 shrink-0">
              <img
                src={houseEmblems[houseId as keyof typeof houseEmblems] || ''}
                alt={houseId}
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <div>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {rankBadge}
              </span>
              <h2 className="font-serif-cormorant font-bold text-4xl sm:text-5xl mt-1 leading-none">
                HOUSE {house.name}
              </h2>
            </div>
          </div>

          <p className="font-sans-manrope italic text-sm text-white/90 font-medium max-w-lg mt-4 relative z-10">
            "{house.motto}"
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-4 pt-3 border-t border-white/20 text-xs font-sans-manrope relative z-10">
            <div>
              <span className="opacity-75">Captain:</span>{' '}
              <strong className="font-extrabold">{house.captain}</strong>
            </div>

            <div>
              <span className="opacity-75">Teacher In-charge:</span>{' '}
              <strong className="font-extrabold">{house.teacherInCharge}</strong>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-black/5 text-center shadow-2xs">
              <Trophy className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Total Points</span>
              <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">{points}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-black/5 text-center shadow-2xs">
              <Award className="w-5 h-5 text-[#EF4444] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">🥇 Gold Medals</span>
              <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">{medals.gold}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-black/5 text-center shadow-2xs">
              <Star className="w-5 h-5 text-[#3B82F6] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Total Medals</span>
              <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">{medals.total}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-black/5 text-center shadow-2xs">
              <Users className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
              <span className="text-[10px] font-bold text-[#5F5F5F] uppercase">Contestants</span>
              <div className="font-serif-cormorant font-bold text-3xl text-[#111111]">65+</div>
            </div>
          </div>

          {/* Medal Tally Table */}
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs">
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF5E84]" />
              <span>OFFICIAL MEDAL TALLY</span>
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-sans-manrope">
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-black/5">
                <span className="block text-base">🥇</span>
                <span className="font-bold text-[#111111]">{medals.gold} Gold</span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-black/5">
                <span className="block text-base">🥈</span>
                <span className="font-bold text-[#111111]">{medals.silver} Silver</span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-black/5">
                <span className="block text-base">🥉</span>
                <span className="font-bold text-[#111111]">{medals.bronze} Bronze</span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-black/5">
                <span className="block text-base">🏅</span>
                <span className="font-bold text-[#111111]">{medals.total} Total</span>
              </div>
            </div>
          </div>

          {/* Recent Victories Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs">
            <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#F59E0B]" />
              <span>VERIFIED VICTORIES & PERFORMANCE</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {houseResults.length > 0 ? (
                houseResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs font-sans-manrope"
                  >
                    <div>
                      <span className="font-bold text-[#111111]">{r.eventTitle}</span>
                      <p className="text-[11px] text-[#5F5F5F]">{r.participantName} • {r.studentClass}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-[#EF4444]">{r.position} Place</span>
                      <p className="text-[10px] font-bold text-[#10B981]">+{r.points} Pts</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#5F5F5F] py-3 text-center">Results will be updated as competitions conclude.</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/8 bg-white text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#111111] text-white font-sans-manrope font-bold text-xs hover:bg-[#FF5E84] transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
