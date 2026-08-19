/**
 * Helper to compute competition standings with dense tie handling (dense ranking: 1, 2, 2, 3).
 * If two or more houses have identical points, they share the same rank and position (e.g. Shared 2nd),
 * and the next house takes the subsequent position (3rd Place, not 4th).
 */

export interface RankedHouseFields {
  rank: number;
  isTied: boolean;
  rankLabel: string;      // e.g. "SHARED 1ST", "1ST PLACE", "SHARED 2ND", "3RD PLACE"
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
      currentRank += 1; // Dense ranking: 1, 2, 2 -> 3rd Place
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
