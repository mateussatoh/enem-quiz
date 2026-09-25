export const MIN_SCORE = 0;
export const MAX_SCORE = 100;

/**
 * Score is the plain sum of the chosen options' weights, clamped to 0..100.
 * The quiz content is authored so the best answers add up to exactly 100; the clamp keeps
 * the contract stable if marketing ever edits weights past that.
 */
export function calculateScore(weights: readonly number[]): number {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(sum)));
}
