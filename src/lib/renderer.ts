/**
 * @fileoverview Canvas rendering functions for the spiral generator.
 * 
 * This module handles all 2D canvas drawing operations including
 * the spiral itself, nested golden rectangles, radial lines, 
 * guide circles, and center marks.
 * 
 * Based on Robert Edward Grant's "Golden Mean Ratio Spiral" from Code X.
 */

import type { SpiralConfig } from './config';
import { PHI } from './constants';
import {
    calculateArcLength,
    calculateSpiralFromPaper,
    generateGuideRadii,
    generateSpiralPoints,
    goldenSpiralRadius,
    mmToPixels
} from './math';

/**
 * Result of drawing a spiral, containing calculated values.
 */
export interface DrawResult {
  /** Total path length of the spiral in millimeters */
  pathLength: number;
  /** Initial radius of the spiral in millimeters */
  initialRadius: number;
  /** Final radius of the spiral in millimeters */
  finalRadius: number;
}

/**
 * Draw the complete spiral template on a canvas.
 * 
 * This is the main rendering function that orchestrates drawing
 * all visual elements: grid, golden rectangles, radial lines, 
 * guide circles, spiral, and center mark.
 * 
 * @param canvas - HTML canvas element to draw on
 * @param config - Spiral configuration
 * @returns Calculated values from the drawing
 */
export function drawSpiral(canvas: HTMLCanvasElement, config: SpiralConfig): DrawResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }
  
  // Calculate spiral parameters from paper size
  const { initialRadius, finalRadius, maxTheta } = calculateSpiralFromPaper(
    config.paperWidth,
    config.paperHeight,
    config.turns
  );
  
  const pathLength = calculateArcLength(initialRadius, maxTheta);
  
  // Set canvas dimensions based on paper size
  const canvasWidthPx = mmToPixels(config.paperWidth, config.dpi);
  const canvasHeightPx = mmToPixels(config.paperHeight, config.dpi);
  canvas.width = canvasWidthPx;
  canvas.height = canvasHeightPx;
  
  const centerX = canvasWidthPx / 2;
  const centerY = canvasHeightPx / 2;
  
  // Clear with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);
  
  // Draw layers in order (back to front)
  if (config.showGrid) {
    drawPrintGrid(ctx, canvasWidthPx, canvasHeightPx, config.gridSpacingMM, config.paperWidth, config.paperHeight, config.dpi);
  }
  
  // Draw radial lines first (background)
  if (config.showRadialLines) {
    drawRadialLines(ctx, centerX, centerY, initialRadius, maxTheta, config.dpi);
  }
  
  // Draw nested golden rectangles
  if (config.showGoldenRectangles) {
    drawGoldenRectangles(ctx, centerX, centerY, initialRadius, config.turns, config.dpi);
  }
  
  if (config.showGuideCircles) {
    drawGuideCircles(ctx, centerX, centerY, initialRadius, finalRadius, config.dpi);
  }
  
  drawSpiralPath(ctx, centerX, centerY, initialRadius, maxTheta, config.lineWidth, config.dpi);
  // Center mark removed to avoid hiding the inner spiral turns
  
  return { pathLength, initialRadius, finalRadius };
}

/**
 * Draw nested golden rectangles.
 * 
 * Each rectangle rotates 90° and scales by φ.
 * This creates the classic Fibonacci spiral construction.
 */
function drawGoldenRectangles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  initialRadius: number,
  turns: number,
  dpi: number
): void {
  // Number of quarter turns = turns * 4
  const numRects = Math.ceil(turns * 4) + 1;
  
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = mmToPixels(0.3, dpi);
  
  // We'll build rectangles by tracking the spiral's quarter-turn points
  // At each 90° step, the radius multiplies by φ
  
  // Track the "pole" (center of curvature) for each quarter
  let poleX = centerX;
  let poleY = centerY;
  
  // Start with the innermost square
  let currentSize = initialRadius * 2; // Diameter becomes the first square side
  
  // Direction vectors for each quarter (rotating clockwise)
  // Quarter 0: right, Quarter 1: down, Quarter 2: left, Quarter 3: up
  const directions = [
    { dx: 1, dy: 0 },   // right
    { dx: 0, dy: 1 },   // down
    { dx: -1, dy: 0 },  // left
    { dx: 0, dy: -1 }   // up
  ];
  
  for (let i = 0; i < numRects; i++) {
    const quarterIndex = i % 4;
    const dir = directions[quarterIndex];
    
    // Draw the square for this quarter
    const squareSizePx = mmToPixels(currentSize, dpi);
    
    // Calculate square position based on pole and direction
    let squareX: number, squareY: number;
    
    switch (quarterIndex) {
      case 0: // Square extends to the right
        squareX = poleX;
        squareY = poleY - squareSizePx;
        break;
      case 1: // Square extends downward
        squareX = poleX;
        squareY = poleY;
        break;
      case 2: // Square extends to the left
        squareX = poleX - squareSizePx;
        squareY = poleY;
        break;
      case 3: // Square extends upward
        squareX = poleX - squareSizePx;
        squareY = poleY - squareSizePx;
        break;
      default:
        squareX = poleX;
        squareY = poleY;
    }
    
    // Draw the square
    ctx.strokeRect(squareX, squareY, squareSizePx, squareSizePx);
    
    // Move the pole for the next iteration
    poleX += dir.dx * squareSizePx;
    poleY += dir.dy * squareSizePx;
    
    // Scale up for next square
    currentSize *= PHI;
  }
}

/**
 * Draw radial lines emanating from center.
 * 
 * These lines show the angular positions where the spiral
 * intersects key mathematical ratios.
 */
function drawRadialLines(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  initialRadius: number,
  maxTheta: number,
  dpi: number
): void {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = mmToPixels(0.15, dpi);
  
  // Draw lines at quarter-turn intervals (every 90°)
  // The golden spiral passes through these points
  const numQuarters = Math.ceil(maxTheta / (Math.PI / 2));
  
  for (let i = 0; i <= numQuarters; i++) {
    const theta = i * (Math.PI / 2);
    const radius = goldenSpiralRadius(theta, initialRadius);
    const radiusPx = mmToPixels(radius, dpi);
    
    // Extend the line beyond the spiral
    const extendedRadius = radiusPx * 1.3;
    
    // Calculate end point (clockwise rotation)
    const endX = centerX + extendedRadius * Math.cos(-theta);
    const endY = centerY + extendedRadius * Math.sin(-theta);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Draw additional radial lines at finer intervals (every 15°) for the full effect
  const fineInterval = Math.PI / 12; // 15 degrees
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  
  for (let theta = 0; theta <= maxTheta; theta += fineInterval) {
    const radius = goldenSpiralRadius(theta, initialRadius);
    const radiusPx = mmToPixels(radius, dpi);
    const extendedRadius = radiusPx * 1.2;
    
    const endX = centerX + extendedRadius * Math.cos(-theta);
    const endY = centerY + extendedRadius * Math.sin(-theta);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

/**
 * Draw the print alignment grid.
 */
function drawPrintGrid(
  ctx: CanvasRenderingContext2D,
  canvasWidthPx: number,
  canvasHeightPx: number,
  gridSpacingMM: number,
  _paperWidthMM: number,
  _paperHeightMM: number,
  dpi: number
): void {
  const gridSpacingPx = mmToPixels(gridSpacingMM, dpi);
  const centerX = canvasWidthPx / 2;
  const centerY = canvasHeightPx / 2;
  
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.lineWidth = mmToPixels(0.2, dpi);
  
  // Vertical lines
  for (let x = centerX % gridSpacingPx; x < canvasWidthPx; x += gridSpacingPx) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeightPx);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = centerY % gridSpacingPx; y < canvasHeightPx; y += gridSpacingPx) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidthPx, y);
    ctx.stroke();
  }
  
  // Center crosshairs
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
  ctx.lineWidth = mmToPixels(0.4, dpi);
  
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvasHeightPx);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvasWidthPx, centerY);
  ctx.stroke();
}

/**
 * Draw guide circles at golden ratio intervals.
 */
function drawGuideCircles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  initialRadius: number,
  finalRadius: number,
  dpi: number
): void {
  const radii = generateGuideRadii(initialRadius, finalRadius);
  
  ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)';
  ctx.lineWidth = mmToPixels(0.25, dpi);
  
  for (const radius of radii) {
    const radiusPixels = mmToPixels(radius, dpi);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Only draw 90° marker dots for circles larger than 5mm
    // to avoid obscuring the inner spiral turns
    if (radius > 5) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      // Scale dot size proportionally to radius (min 0.3mm, max 0.6mm)
      const dotRadius = mmToPixels(Math.min(0.6, Math.max(0.3, radius * 0.02)), dpi);
      
      for (let angle = 0; angle < 360; angle += 90) {
        const rad = (angle * Math.PI) / 180;
        const dotX = centerX + radiusPixels * Math.cos(rad);
        const dotY = centerY + radiusPixels * Math.sin(rad);
        
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw the main spiral path with variable line width.
 * Line width scales proportionally to the radius so inner turns are visible.
 */
function drawSpiralPath(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  initialRadius: number,
  maxTheta: number,
  lineWidth: number,
  dpi: number
): void {
  const points = generateSpiralPoints(initialRadius, maxTheta);
  
  if (points.length < 2) return;
  
  ctx.strokeStyle = '#000000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Line width as a fraction of the radius (e.g., 2% of radius)
  // This ensures inner turns have visible but proportional lines
  const lineWidthFraction = 0.02; // 2% of radius
  const minLineWidthPx = mmToPixels(0.1, dpi); // Minimum line width
  const maxLineWidthPx = mmToPixels(lineWidth, dpi); // Maximum from config
  
  // Draw segments with variable line width
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    
    const px0 = centerX + mmToPixels(p0.x, dpi);
    const py0 = centerY + mmToPixels(p0.y, dpi);
    const px1 = centerX + mmToPixels(p1.x, dpi);
    const py1 = centerY + mmToPixels(p1.y, dpi);
    
    // Calculate line width proportional to average radius of segment
    const avgRadius = (p0.radius + p1.radius) / 2;
    const proportionalWidth = mmToPixels(avgRadius * lineWidthFraction, dpi);
    const segmentLineWidth = Math.max(minLineWidthPx, Math.min(proportionalWidth, maxLineWidthPx));
    
    ctx.lineWidth = segmentLineWidth;
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py1);
    ctx.stroke();
  }
}
