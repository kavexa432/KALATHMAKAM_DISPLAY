/**
 * Helper to compute competition standings with proper tie handling (standard competition ranking: 1, 1, 3, 4).
 * If two or more houses have identical points, they share the same rank and position.
 */

export interface RankedHouseFields {
  rank: number;
  isTied: boolean;
  rankLabel: string;      // e.g. "SHARED 1ST", "1ST PLACE", "2ND PLACE", "SHARED 2ND"
  rankBadgeText: string;  // e.g. "Rank #1 (Tied)", "Rank #1", "Rank #2"
  positionSuffix: string; // e.g. "1st", "2nd", "3rd", "4th"
  isLeader: boolean;      // true if rank === 1
}

export function rankByPoints<T extends { points: number }>(
  items: T[]
): (T & RankedHouseFields)[] {
  const sorted = [...items].sort((a, b) => b.points - a.points);
  let currentRank = 1;

  return sorted.map((item, index, arr) => {
    if (index > 0 && item.points < arr[index - 1].points) {
      currentRank = index + 1; // Standard competition ranking: 1, 1, 3, 4
    }

    const tiedCount = arr.filter((x) => x.points === item.points).length;
    const isTied = tiedCount > 1;
    const suffix =
      currentRank === 1
        ? '1ST'
        : currentRank === 2
        ? '2ND'
        : currentRank === 3
        ? '3RD'
        : `${currentRank}TH`;

    const rankLabel = isTied ? `SHARED ${suffix}` : `${suffix} PLACE`;
    const rankBadgeText = isTied ? `Rank #${currentRank} (Tied)` : `Rank #${currentRank}`;
    const positionSuffix =
      currentRank === 1
        ? '1st'
        : currentRank === 2
        ? '2nd'
        : currentRank === 3
        ? '3rd'
        : `${currentRank}th`;

    return {
      ...item,
      rank: currentRank,
      isTied,
      rankLabel,
      rankBadgeText,
      positionSuffix,
      isLeader: currentRank === 1,
    };
  });
}
