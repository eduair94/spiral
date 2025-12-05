/**
 * @fileoverview Mathematical functions for golden spiral calculations.
 * 
 * This module contains pure mathematical functions for computing
 * golden spiral properties based on Robert Edward Grant's "Golden Mean Ratio Spiral".
 * 
 * Key characteristic: The radius multiplies by φ every QUARTER turn (90°).
 * This matches the classic Fibonacci spiral construction with nested golden rectangles.
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
 * Represents a point with its radius for variable-width drawing.
 */
export interface SpiralPoint {
  x: number;
  y: number;
  radius: number;
}

/**
 * Represents a golden rectangle for nested rectangle drawing.
 */
export interface GoldenRectangle {
  /** Center X coordinate */
  cx: number;
  /** Center Y coordinate */
  cy: number;
  /** Width of the rectangle */
  width: number;
  /** Height of the rectangle */
  height: number;
  /** Rotation angle in radians */
  rotation: number;
  /** The side length of the square to cut off */
  squareSize: number;
}

/**
 * Calculate the radius of a golden spiral at a given angle.
 * 
 * The golden spiral follows the logarithmic spiral formula:
 * r(θ) = a × φ^(2θ/π)
 * 
 * Which is equivalent to:
 * r(θ) = a × e^(b×θ) where b = ln(φ)/(π/2)
 * 
 * This means the radius multiplies by φ every QUARTER turn (90°).
 * 
 * @param theta - Angle in radians from the starting point
 * @param initialRadius - Starting radius at θ=0 (in millimeters)
 * @returns Radius at the given angle (in millimeters)
 * 
 * @example
 * // Get radius after one quarter turn (90°)
 * const r = goldenSpiralRadius(Math.PI / 2, 10);
 * // r ≈ 10 × φ ≈ 16.18mm
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
 * Each point includes its radius for variable-width drawing.
 * 
 * @param initialRadius - Starting radius (in millimeters)
 * @param maxTheta - Maximum angle in radians
 * @param pointsPerTurn - Number of points per 360° rotation (default: 720)
 * @returns Array of {x, y, radius} coordinates in millimeters relative to center
 */
export function generateSpiralPoints(
  initialRadius: number,
  maxTheta: number,
  pointsPerTurn: number = DEFAULT_POINTS_PER_TURN
): SpiralPoint[] {
  const points: SpiralPoint[] = [];
  const totalPoints = Math.ceil((maxTheta / (2 * Math.PI)) * pointsPerTurn);
  
  for (let i = 0; i <= totalPoints; i++) {
    const theta = (i / totalPoints) * maxTheta;
    const r = goldenSpiralRadius(theta, initialRadius);
    
    // Clockwise rotation (negative theta for standard math coordinates)
    const x = r * Math.cos(-theta);
    const y = r * Math.sin(-theta);
    
    points.push({ x, y, radius: r });
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
 * Calculate spiral parameters based on paper size and number of turns.
 * 
 * For a TRUE Fibonacci spiral (φ per 90°), the radius multiplies by φ
 * every quarter-turn. Given the number of full turns, we calculate
 * the initial radius needed to fit within the paper.
 * 
 * Formula: r(θ) = initialRadius × φ^(2θ/π)
 * At quarter-turn n: r = initialRadius × φ^n
 * 
 * For N full turns (4N quarter-turns):
 * finalRadius = initialRadius × φ^(4N)
 * 
 * Given maxRadius (from paper size):
 * initialRadius = maxRadius / φ^(4N)
 * 
 * @param paperWidth - Paper width in millimeters
 * @param paperHeight - Paper height in millimeters  
 * @param turns - Number of complete 360° rotations
 * @returns Object containing initialRadius, finalRadius, maxTheta, and quarterTurns
 */
export function calculateSpiralFromPaper(
  paperWidth: number,
  paperHeight: number,
  turns: number
): { initialRadius: number; finalRadius: number; maxTheta: number; quarterTurns: number } {
  // Use the smaller dimension to ensure spiral fits
  const minDimension = Math.min(paperWidth, paperHeight);
  
  // Maximum radius is half the smaller dimension, minus margin
  const finalRadius = (minDimension / 2) * (1 - 2 * MARGIN_PERCENT);
  
  // Calculate quarter-turns from full turns
  const quarterTurns = Math.round(turns * 4);
  
  // Calculate initial radius based on final radius and quarter-turns
  // finalRadius = initialRadius × φ^quarterTurns
  // initialRadius = finalRadius / φ^quarterTurns
  const initialRadius = finalRadius / Math.pow(PHI, quarterTurns);
  
  // Convert quarter-turns to radians (each quarter = π/2)
  const maxTheta = quarterTurns * (Math.PI / 2);
  
  return { 
    initialRadius, 
    finalRadius, 
    maxTheta,
    quarterTurns
  };
}

/**
 * Calculate quarter-turns needed for a given initial and final radius.
 * 
 * @param initialRadius - Starting radius in mm
 * @param finalRadius - Ending radius in mm
 * @returns Number of quarter-turns (90° segments)
 */
export function calculateQuarterTurnsFromRadii(initialRadius: number, finalRadius: number): number {
  return Math.log(finalRadius / initialRadius) / Math.log(PHI);
}

/**
 * Generate nested golden rectangles for the spiral construction.
 * 
 * Each rectangle is φ times larger than the previous and rotated 90°.
 * This creates the classic Fibonacci spiral construction.
 * 
 * @param initialSize - Starting size (shortest side of innermost rectangle)
 * @param numRectangles - Number of nested rectangles to generate
 * @returns Array of golden rectangles from innermost to outermost
 */
export function generateGoldenRectangles(
  initialSize: number,
  numRectangles: number
): GoldenRectangle[] {
  const rectangles: GoldenRectangle[] = [];
  
  // Start from center and work outward
  let size = initialSize;
  let cx = 0;
  let cy = 0;
  
  for (let i = 0; i < numRectangles; i++) {
    const width = size * PHI;
    const height = size;
    const rotation = (i * Math.PI) / 2; // Rotate 90° each step
    
    rectangles.push({
      cx,
      cy,
      width,
      height,
      rotation,
      squareSize: size
    });
    
    // Move center for next rectangle based on rotation
    // The new rectangle's center shifts by half the difference
    const shift = (size * (PHI - 1)) / 2;
    const angle = rotation + Math.PI; // Opposite direction
    
    cx += shift * Math.cos(angle);
    cy += shift * Math.sin(angle);
    
    // Scale up for next iteration
    size *= PHI;
  }
  
  return rectangles;
}

/**
 * Generate radial lines from center for the golden spiral diagram.
 * These are the annotation lines shown in Robert Edward Grant's diagram.
 * 
 * @param numLines - Number of radial lines
 * @param maxRadius - Maximum radius for the lines
 * @returns Array of angle/radius pairs
 */
export function generateRadialLines(
  numLines: number,
  maxRadius: number
): { angle: number; radius: number }[] {
  const lines: { angle: number; radius: number }[] = [];
  
  // Generate lines at various angles based on the golden spiral
  for (let i = 0; i < numLines; i++) {
    const angle = (i * 2 * Math.PI) / numLines;
    lines.push({ angle, radius: maxRadius });
  }
  
  return lines;
}
