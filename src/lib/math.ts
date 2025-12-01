/**
 * @fileoverview Mathematical functions for golden spiral calculations.
 * 
 * This module contains pure mathematical functions for computing
 * golden spiral properties. All functions are stateless and can be
 * easily tested in isolation.
 */

import { DEFAULT_POINTS_PER_TURN, GOLDEN_B, MM_PER_INCH, PHI } from './constants';

/**
 * Represents a 2D point in Cartesian coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate the radius of a golden spiral at a given angle.
 * 
 * The golden spiral follows the logarithmic spiral formula:
 * r(θ) = a × φ^(θ/2π)
 * 
 * Which is equivalent to:
 * r(θ) = a × e^(b×θ) where b = ln(φ)/(2π)
 * 
 * This means the radius multiplies by φ every full turn (360°).
 * 
 * @param theta - Angle in radians from the starting point
 * @param initialRadius - Starting radius at θ=0 (in millimeters)
 * @returns Radius at the given angle (in millimeters)
 * 
 * @example
 * // Get radius after one full turn (360°)
 * const r = goldenSpiralRadius(2 * Math.PI, 15);
 * // r ≈ 15 × φ ≈ 24.27mm
 */
export function goldenSpiralRadius(theta: number, initialRadius: number): number {
  return initialRadius * Math.exp(GOLDEN_B * theta);
}

/**
 * Calculate the arc length of a golden spiral segment.
 * 
 * Uses the analytical formula for logarithmic spiral arc length:
 * L = (a/b) × √(1 + b²) × (e^(b×θmax) - 1)
 * 
 * This is an exact formula, not a numerical approximation.
 * 
 * @param initialRadius - Starting radius (in millimeters)
 * @param maxTheta - Ending angle in radians
 * @returns Arc length from θ=0 to θ=maxTheta (in millimeters)
 * 
 * @example
 * // Calculate path length for 7.5 turns
 * const length = calculateArcLength(15, 7.5 * 2 * Math.PI);
 */
export function calculateArcLength(initialRadius: number, maxTheta: number): number {
  const sqrtFactor = Math.sqrt(1 + GOLDEN_B * GOLDEN_B);
  const expFactor = Math.exp(GOLDEN_B * maxTheta) - 1;
  return (initialRadius / GOLDEN_B) * sqrtFactor * expFactor;
}

/**
 * Generate an array of points along the golden spiral.
 * 
 * Points are generated clockwise from the starting angle (3 o'clock position).
 * 
 * @param initialRadius - Starting radius (in millimeters)
 * @param maxTheta - Maximum angle in radians
 * @param pointsPerTurn - Number of points per 360° rotation (default: 720)
 * @returns Array of {x, y} coordinates in millimeters relative to center
 */
export function generateSpiralPoints(
  initialRadius: number,
  maxTheta: number,
  pointsPerTurn: number = DEFAULT_POINTS_PER_TURN
): Point[] {
  const points: Point[] = [];
  const totalPoints = Math.ceil((maxTheta / (2 * Math.PI)) * pointsPerTurn);
  
  for (let i = 0; i <= totalPoints; i++) {
    const theta = (i / totalPoints) * maxTheta;
    const r = goldenSpiralRadius(theta, initialRadius);
    
    // Clockwise rotation (negative theta for standard math coordinates)
    const x = r * Math.cos(-theta);
    const y = r * Math.sin(-theta);
    
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Generate radii for guide circles at golden ratio intervals.
 * 
 * Each successive radius is φ times the previous, creating
 * circles that mark the natural growth points of the spiral.
 * 
 * @param initialRadius - Starting radius (in millimeters)
 * @param finalRadius - Maximum radius to include
 * @returns Sorted array of radii in millimeters
 */
export function generateGuideRadii(initialRadius: number, finalRadius: number): number[] {
  const radii: number[] = [];
  let r = initialRadius;
  
  // Generate radii at φ intervals
  while (r <= finalRadius * 1.1) {
    radii.push(r);
    r *= PHI;
  }
  
  // Ensure final radius is included
  if (!radii.some(rad => Math.abs(rad - finalRadius) < 1)) {
    radii.push(finalRadius);
  }
  
  return radii.sort((a, b) => a - b);
}

/**
 * Convert millimeters to pixels based on DPI.
 * 
 * @param mm - Value in millimeters
 * @param dpi - Dots per inch
 * @returns Value in pixels
 */
export function mmToPixels(mm: number, dpi: number): number {
  return (mm / MM_PER_INCH) * dpi;
}

/**
 * Margin around the spiral as a percentage of the smaller paper dimension.
 * 5% on each side = 10% total, leaving 90% for the spiral.
 */
const MARGIN_PERCENT = 0.05;

/**
 * Calculate spiral parameters based on paper size and turns.
 * 
 * The spiral will be sized to fit within the paper with a small margin.
 * The final radius is determined by the smaller paper dimension.
 * The initial radius is calculated from the final radius and number of turns.
 * 
 * Formula: finalRadius = initialRadius × φ^turns
 * Therefore: initialRadius = finalRadius / φ^turns
 * 
 * @param paperWidth - Paper width in millimeters
 * @param paperHeight - Paper height in millimeters  
 * @param turns - Number of full spiral rotations
 * @returns Object containing initialRadius, finalRadius, and maxTheta
 * 
 * @example
 * // A4 paper with 5 turns
 * const params = calculateSpiralFromPaper(210, 297, 5);
 * // params.finalRadius ≈ 94.5mm (90% of 210/2)
 * // params.initialRadius ≈ 8.5mm
 */
export function calculateSpiralFromPaper(
  paperWidth: number,
  paperHeight: number,
  turns: number
): { initialRadius: number; finalRadius: number; maxTheta: number } {
  // Use the smaller dimension to ensure spiral fits
  const minDimension = Math.min(paperWidth, paperHeight);
  
  // Final radius is half the smaller dimension, minus margin
  const finalRadius = (minDimension / 2) * (1 - 2 * MARGIN_PERCENT);
  
  // Calculate max angle from turns
  const maxTheta = turns * 2 * Math.PI;
  
  // Calculate initial radius: r_final = r_initial × e^(b × maxTheta)
  // Therefore: r_initial = r_final / e^(b × maxTheta)
  const initialRadius = finalRadius / Math.exp(GOLDEN_B * maxTheta);
  
  return { initialRadius, finalRadius, maxTheta };
}

/**
 * Calculate turns needed for a given initial and final radius.
 * 
 * From r_final = r_initial × e^(b × θ):
 * θ = ln(r_final / r_initial) / b
 * turns = θ / (2π)
 * 
 * @param initialRadius - Starting radius in mm
 * @param finalRadius - Ending radius in mm
 * @returns Number of full turns
 */
export function calculateTurnsFromRadii(initialRadius: number, finalRadius: number): number {
  const theta = Math.log(finalRadius / initialRadius) / GOLDEN_B;
  return theta / (2 * Math.PI);
}
