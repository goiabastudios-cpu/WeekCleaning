import { Assignment, ChoreKey } from '../types';

export const CHORE_KEYS: ChoreKey[] = ['brushing', 'mopping', 'dusting', 'vacuuming'];

// Fixed Monday epoch to serve as Week 0 (using Jan 5, 2026 as a convenient reference)
export const EPOCH_DATE = new Date(2026, 0, 5); // January 5, 2026

/**
 * Returns the week index since the fixed anchor date.
 * Perfectly stable.
 */
export function getWeekIndexForDate(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0); // Midday to avoid DST issues
  const e = new Date(EPOCH_DATE.getFullYear(), EPOCH_DATE.getMonth(), EPOCH_DATE.getDate(), 12, 0, 0);
  const diffTime = d.getTime() - e.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}

/**
 * Resolves the calendar range for the weekend corresponding to a week index.
 * Returns the Saturday and Sunday of that week index.
 */
export function getWeekendRange(weekIndex: number): { sat: Date; sun: Date } {
  const sat = new Date(EPOCH_DATE.getFullYear(), EPOCH_DATE.getMonth(), EPOCH_DATE.getDate(), 12, 0, 0);
  sat.setDate(sat.getDate() + (weekIndex * 7) + 5);

  const sun = new Date(EPOCH_DATE.getFullYear(), EPOCH_DATE.getMonth(), EPOCH_DATE.getDate(), 12, 0, 0);
  sun.setDate(sun.getDate() + (weekIndex * 7) + 6);

  return { sat, sun };
}

/**
 * Core allocation engine:
 * Calculates assignments for the week.
 *
 * For a standard week W:
 * - Brushing (Slot 0): Brother (W + 0) % 4
 * - Mopping (Slot 1): Brother (W + 1) % 4
 * - Dusting (Slot 2): Brother (W + 2) % 4
 * - Vacuuming (Slot 3): Brother (W + 3) % 4
 *
 * If 3 brothers are present:
 * - The absent brothers are ignored, and tasks are consolidated.
 * - Brushing & Vacuuming are combined to be done by the same brother.
 * - The brother doing Brushing & Vacuuming is the Brushing brother (unless they are absent, in which case the Vacuum brother does it).
 * - Mopping is done by the Mopping brother (unless they are absent, in which case the Vacuum brother covers it).
 * - Dusting is done by the Dusting brother (unless they are absent, in which case the Vacuum brother covers it).
 */
export function getAssignmentsForWeek(
  weekIndex: number,
  brotherNames: string[],
  presentCount: number, // 3 or 4
  absentBrotherIndex: number // 0, 1, 2, or 3
): Record<ChoreKey, Assignment> {
  const br = (weekIndex + 0) % 4;
  const mo = (weekIndex + 1) % 4;
  const du = (weekIndex + 2) % 4;
  const va = (weekIndex + 3) % 4;

  const names = [
    brotherNames[0] || 'Brother 1',
    brotherNames[1] || 'Brother 2',
    brotherNames[2] || 'Brother 3',
    brotherNames[3] || 'Brother 4'
  ];

  if (presentCount === 4) {
    return {
      brushing: { choreKey: 'brushing', brotherIndex: br, brotherName: names[br] },
      mopping: { choreKey: 'mopping', brotherIndex: mo, brotherName: names[mo] },
      dusting: { choreKey: 'dusting', brotherIndex: du, brotherName: names[du] },
      vacuuming: { choreKey: 'vacuuming', brotherIndex: va, brotherName: names[va] },
    };
  } else {
    // 3 Brothers mode
    // Brushing and Vacuuming are combined.
    // The brother assigned to Brushing & Vacuum is:
    // - if 'br' is absent: 'va' (the Vacuum brother covers both)
    // - else: 'br' (the Brushing brother covers both)
    const bvIndex = br === absentBrotherIndex ? va : br;
    const isBvCombined = true;

    // Mopping is normal, unless mopping brother is absent, then vacuum brother covers.
    const moIndex = mo === absentBrotherIndex ? va : mo;

    // Dusting is normal, unless dusting brother is absent, then vacuum brother covers.
    const duIndex = du === absentBrotherIndex ? va : du;

    return {
      brushing: { choreKey: 'brushing', brotherIndex: bvIndex, brotherName: names[bvIndex], isCombined: isBvCombined },
      mopping: { choreKey: 'mopping', brotherIndex: moIndex, brotherName: names[moIndex] },
      dusting: { choreKey: 'dusting', brotherIndex: duIndex, brotherName: names[duIndex] },
      vacuuming: { choreKey: 'vacuuming', brotherIndex: bvIndex, brotherName: names[bvIndex], isCombined: isBvCombined },
    };
  }
}
