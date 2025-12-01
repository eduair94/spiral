/**
 * @fileoverview Canvas rendering functions for the spiral generator.
 * 
 * This module handles all 2D canvas drawing operations including
 * the spiral itself, grid lines, guide circles, and center marks.
 */

import type { SpiralConfig } from './config';
import {
    calculateArcLength,
    calculateSpiralFromPaper,
    generateGuideRadii,
    generateSpiralPoints,
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
 * all visual elements: grid, guide circles, spiral, and center mark.
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
  
  if (config.showGuideCircles) {
    drawGuideCircles(ctx, centerX, centerY, initialRadius, finalRadius, config.dpi);
  }
  
  drawSpiralPath(ctx, centerX, centerY, initialRadius, maxTheta, config.lineWidth, config.dpi);
  drawCenterMark(ctx, centerX, centerY, config.dpi);
  
  return { pathLength, initialRadius, finalRadius };
}

/**
 * Draw the print alignment grid.
 * 
 * Creates a grid with:
 * - Light gray lines at regular intervals
 * - Darker center crosshairs
 * - Distance labels at the edges
 */
function drawPrintGrid(
  ctx: CanvasRenderingContext2D,
  canvasWidthPx: number,
  canvasHeightPx: number,
  gridSpacingMM: number,
  paperWidthMM: number,
  paperHeightMM: number,
  dpi: number
): void {
  const gridSpacingPx = mmToPixels(gridSpacingMM, dpi);
  const centerX = canvasWidthPx / 2;
  const centerY = canvasHeightPx / 2;
  
  // Regular grid lines
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
  
  // Center crosshairs (thicker)
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
  
  // Distance labels
  ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
  ctx.font = `${mmToPixels(3, dpi)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const maxDist = Math.min(paperWidthMM, paperHeightMM) / 2;
  for (let d = gridSpacingMM; d <= maxDist; d += gridSpacingMM) {
    const px = mmToPixels(d, dpi);
    
    // Top labels (distances from center)
    if (centerX + px < canvasWidthPx) {
      ctx.fillText(d.toString(), centerX + px, 5);
    }
    
    // Left labels (rotated)
    if (centerY + px < canvasHeightPx) {
      ctx.save();
      ctx.translate(5, centerY + px);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(d.toString(), 0, 0);
      ctx.restore();
    }
  }
}

/**
 * Draw guide circles at golden ratio intervals.
 * 
 * Each circle has 90° marker dots to help visualize
 * the golden ratio growth pattern.
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
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw 90° marker dots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const dotRadius = mmToPixels(0.6, dpi);
    
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

/**
 * Draw the main spiral path.
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
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = mmToPixels(lineWidth, dpi);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = centerX + mmToPixels(points[i].x, dpi);
    const py = centerY + mmToPixels(points[i].y, dpi);
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}

/**
 * Draw the center mark with "O" label.
 */
function drawCenterMark(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  dpi: number
): void {
  const dotRadius = mmToPixels(2, dpi);
  
  // Black dot
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // "O" label
  const fontSize = mmToPixels(6, dpi);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('O', centerX, centerY + dotRadius + mmToPixels(1, dpi));
}
