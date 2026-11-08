/*
 * Gli stadi della fiamma della streak. Ogni numero è da quanti allenamenti di fila parte lo stadio
 * (3 a settimana: 24 allenamenti sono circa 8 settimane). Se la streak si spezza la fiamma scende
 * di uno stadio invece di tornare alla brace, e risale quando la streak supera di nuovo quello stadio.
 */
export const FLAME_STAGE_STARTS: readonly number[] = [0, 1, 3, 6, 10, 14, 20, 24, 36]

export function flameStageFor(streak: number): number {
  return FLAME_STAGE_STARTS.reduce((found, start, i) => (streak >= start ? i : found), 0)
}
