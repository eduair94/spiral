/**
 * @fileoverview Mathematical constants for golden ratio spiral calculations.
 * 
 * The golden ratio (φ) is the mathematical constant that defines the growth
 * pattern of a golden spiral. This module contains all fixed constants used
 * throughout the application.
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
 * Growth factor for the golden spiral.
 * 
 * In a golden spiral, the radius multiplies by φ every full turn (360° / 2π radians).
 * This constant (b) is used in the logarithmic spiral formula:
 * r(θ) = a × e^(b×θ)
 * 
 * Derivation: b = ln(φ) / (2π) ≈ 0.0766
 * This means r(θ) = a × φ^(θ/2π)
 */
export const GOLDEN_B = Math.log(PHI) / (2 * Math.PI);

/**
 * Default points per full turn when generating spiral paths.
 * Higher values = smoother curves but more computation.
 */
export const DEFAULT_POINTS_PER_TURN = 720;

/**
 * Conversion factor from millimeters to inches.
 */
export const MM_PER_INCH = 25.4;
