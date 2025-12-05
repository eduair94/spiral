/**
 * @fileoverview Mathematical constants for golden ratio spiral calculations.
 * 
 * The golden ratio (φ) is the mathematical constant that defines the growth
 * pattern of a golden spiral. This module contains all fixed constants used
 * throughout the application.
 * 
 * Based on Robert Edward Grant's "Golden Mean Ratio Spiral" from Code X.
 * This is the TRUE Fibonacci spiral where φ multiplies every 90°.
 */

/**
 * The Golden Ratio (phi) - an irrational mathematical constant.
 * Approximately equal to 1.618033988749895.
 * 
 * Properties:
 * - φ = (1 + √5) / 2
 * - φ² = φ + 1
 * - 1/φ = φ - 1
 */
export const PHI = 1.6180339887498948;

/**
 * Growth factor for the TRUE Fibonacci/Golden spiral.
 * 
 * The radius multiplies by φ every QUARTER turn (90° / π/2 radians).
 * This is the classic Fibonacci spiral that fits perfectly in nested
 * golden rectangles.
 * 
 * Formula: r(θ) = a × φ^(2θ/π)
 * Which is equivalent to: r(θ) = a × e^(b×θ) where b = ln(φ) / (π/2)
 * 
 * Growth rate: After N quarter-turns, radius = initial × φ^N
 * - After 1 turn (4 quarters): radius × φ^4 ≈ × 6.85
 * - After 2 turns (8 quarters): radius × φ^8 ≈ × 46.98
 */
export const GOLDEN_B = Math.log(PHI) / (Math.PI / 2);

/**
 * Default points per full turn when generating spiral paths.
 * Higher values = smoother curves but more computation.
 */
export const DEFAULT_POINTS_PER_TURN = 720;

/**
 * Conversion factor from millimeters to inches.
 */
export const MM_PER_INCH = 25.4;
