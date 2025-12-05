/**
 * @fileoverview Canvas rendering functions for the spiral generator.
 * 
 * TRUE Fibonacci spiral: quarter-circle arcs inscribed in squares
 * following the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55...)
 * 
 * Each arc is centered at a corner of its square and sweeps 90 degrees.
 */

import type { SpiralConfig } from './config';
import {
  calculateSpiralFromPaper,
  mmToPixels
} from './math';

/**
 * Generate Fibonacci sequence up to n terms
 */
function generateFibonacci(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];
  
  const fib = [1, 1];
  for (let i = 2; i < n; i++) {
    fib.push(fib[i - 1] + fib[i - 2]);
  }
  return fib;
}

/**
 * Result of drawing a spiral, containing calculated values.
 */
export interface DrawResult {
  pathLength: number;
  initialRadius: number;
  finalRadius: number;
}

/**
 * Draw the complete spiral template on a canvas.
 */
export function drawSpiral(canvas: HTMLCanvasElement, config: SpiralConfig): DrawResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }
  
  // Calculate spiral parameters from paper size
  const { quarterTurns } = calculateSpiralFromPaper(
    config.paperWidth,
    config.paperHeight,
    config.turns
  );
  
  // Generate Fibonacci sequence for the squares
  const fibSequence = generateFibonacci(quarterTurns + 2);
  
  // Calculate the bounding box and square positions
  const { width: bbWidth, height: bbHeight, offsetX, offsetY } = calculateBoundingBox(fibSequence, quarterTurns);
  
  // Scale to fit the paper with margin
  const margin = 0.9; // 90% of available space
  const availableWidth = config.paperWidth * margin;
  const availableHeight = config.paperHeight * margin;
  
  // Scale factor to fit the bounding box into available space
  const scaleX = availableWidth / bbWidth;
  const scaleY = availableHeight / bbHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // Set canvas dimensions based on paper size
  const canvasWidthPx = mmToPixels(config.paperWidth, config.dpi);
  const canvasHeightPx = mmToPixels(config.paperHeight, config.dpi);
  canvas.width = canvasWidthPx;
  canvas.height = canvasHeightPx;
  
  // Calculate path length (sum of quarter-circle arc lengths)
  let pathLength = 0;
  for (let i = 0; i < quarterTurns; i++) {
    const radius = fibSequence[i] * scale;
    pathLength += (Math.PI / 2) * radius; // quarter circle arc length
  }
  
  // Canvas center
  const canvasCenterX = canvasWidthPx / 2;
  const canvasCenterY = canvasHeightPx / 2;
  
  // The offset tells us how far from the first square's center the bounding box center is
  // We need to shift the drawing origin so the bounding box ends up centered
  const drawOriginX = canvasCenterX - mmToPixels(offsetX * scale, config.dpi);
  const drawOriginY = canvasCenterY - mmToPixels(offsetY * scale, config.dpi);
  
  // Clear with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);
  
  // Draw layers in order (back to front)
  if (config.showGrid) {
    drawPrintGrid(ctx, canvasWidthPx, canvasHeightPx, config.gridSpacingMM, config.dpi);
  }
  
  // Draw nested golden rectangles
  if (config.showGoldenRectangles) {
    drawFibonacciRectangles(ctx, drawOriginX, drawOriginY, fibSequence, scale, quarterTurns, config.dpi);
  }

  // Draw the spiral
  drawFibonacciSpiral(ctx, drawOriginX, drawOriginY, fibSequence, scale, quarterTurns, config.lineWidth, config.dpi);
  
  return { 
    pathLength, 
    initialRadius: fibSequence[0] * scale, 
    finalRadius: fibSequence[quarterTurns - 1] * scale 
  };
}

/**
 * Calculate the bounding box dimensions of all Fibonacci squares.
 * Also returns the offset from the first square center to the bounding box center.
 */
function calculateBoundingBox(fibSequence: number[], numSquares: number): { 
  width: number; 
  height: number;
  offsetX: number;
  offsetY: number;
} {
  if (numSquares <= 0) return { width: 1, height: 1, offsetX: 0, offsetY: 0 };
  
  // Simulate square placement to find bounding box
  // First square centered at origin (0,0)
  const firstSize = fibSequence[0];
  let minX = -firstSize / 2;
  let maxX = firstSize / 2;
  let minY = -firstSize / 2;
  let maxY = firstSize / 2;
  
  // Track placement
  const squares: { x: number; y: number; size: number }[] = [];
  squares.push({ x: minX, y: minY, size: firstSize });
  
  for (let i = 1; i < numSquares; i++) {
    const size = fibSequence[i];
    const prevSquares = squares.slice(0, i);
    
    // Recalculate bounding box of existing squares
    let bbMinX = Infinity, bbMinY = Infinity, bbMaxX = -Infinity, bbMaxY = -Infinity;
    for (const sq of prevSquares) {
      bbMinX = Math.min(bbMinX, sq.x);
      bbMinY = Math.min(bbMinY, sq.y);
      bbMaxX = Math.max(bbMaxX, sq.x + sq.size);
      bbMaxY = Math.max(bbMaxY, sq.y + sq.size);
    }
    
    const dir = i % 4;
    let newX: number, newY: number;
    
    switch (dir) {
      case 1: newX = bbMaxX; newY = bbMinY; break;
      case 2: newX = bbMaxX - size; newY = bbMaxY; break;
      case 3: newX = bbMinX - size; newY = bbMaxY - size; break;
      case 0: newX = bbMinX; newY = bbMinY - size; break;
      default: newX = bbMaxX; newY = bbMinY;
    }
    
    squares.push({ x: newX, y: newY, size: size });
    
    // Update overall bounds
    minX = Math.min(minX, newX);
    minY = Math.min(minY, newY);
    maxX = Math.max(maxX, newX + size);
    maxY = Math.max(maxY, newY + size);
  }
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Center of bounding box relative to origin (which is first square center)
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return { width, height, offsetX: centerX, offsetY: centerY };
}

/**
 * Draw Fibonacci squares (golden rectangles construction).
 * Builds outward from center, placing each new square adjacent to form golden rectangle.
 */
function drawFibonacciRectangles(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fibSequence: number[],
  scale: number,
  numSquares: number,
  dpi: number
): void {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = mmToPixels(0.25, dpi);
  
  // Build the rectangle positions by tracking where each square goes
  // Starting from center, we place squares in order: first two 1x1 squares,
  // then 2x2, 3x3, 5x5, etc.
  
  // We'll track the bounding box of all placed squares
  // and place each new square on the appropriate side
  
  const squares: { x: number; y: number; size: number }[] = [];
  
  // Place first square centered at origin
  const firstSize = mmToPixels(fibSequence[0] * scale, dpi);
  squares.push({ x: startX - firstSize / 2, y: startY - firstSize / 2, size: firstSize });
  
  // For subsequent squares, place them adjacent
  for (let i = 1; i < numSquares; i++) {
    const sizePx = mmToPixels(fibSequence[i] * scale, dpi);
    const prevSquares = squares.slice(0, i);
    
    // Calculate bounding box of existing squares
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const sq of prevSquares) {
      minX = Math.min(minX, sq.x);
      minY = Math.min(minY, sq.y);
      maxX = Math.max(maxX, sq.x + sq.size);
      maxY = Math.max(maxY, sq.y + sq.size);
    }
    
    // Place new square based on rotation pattern
    const dir = i % 4;
    let newX: number, newY: number;
    
    switch (dir) {
      case 1: // Place to the right
        newX = maxX;
        newY = minY;
        break;
      case 2: // Place below
        newX = maxX - sizePx;
        newY = maxY;
        break;
      case 3: // Place to the left
        newX = minX - sizePx;
        newY = maxY - sizePx;
        break;
      case 0: // Place above
        newX = minX;
        newY = minY - sizePx;
        break;
      default:
        newX = maxX;
        newY = minY;
    }
    
    squares.push({ x: newX, y: newY, size: sizePx });
  }
  
  // Draw all squares
  for (const sq of squares) {
    ctx.strokeRect(sq.x, sq.y, sq.size, sq.size);
  }
}

/**
 * Draw the Fibonacci spiral using quarter-circle arcs.
 * Each arc is inscribed in its corresponding Fibonacci square.
 */
function drawFibonacciSpiral(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fibSequence: number[],
  scale: number,
  numArcs: number,
  lineWidth: number,
  dpi: number
): void {
  ctx.strokeStyle = '#000000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Same square placement logic as rectangles
  const squares: { x: number; y: number; size: number }[] = [];
  
  const firstSize = mmToPixels(fibSequence[0] * scale, dpi);
  squares.push({ x: startX - firstSize / 2, y: startY - firstSize / 2, size: firstSize });
  
  for (let i = 1; i < numArcs; i++) {
    const sizePx = mmToPixels(fibSequence[i] * scale, dpi);
    const prevSquares = squares.slice(0, i);
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const sq of prevSquares) {
      minX = Math.min(minX, sq.x);
      minY = Math.min(minY, sq.y);
      maxX = Math.max(maxX, sq.x + sq.size);
      maxY = Math.max(maxY, sq.y + sq.size);
    }
    
    const dir = i % 4;
    let newX: number, newY: number;
    
    switch (dir) {
      case 1: newX = maxX; newY = minY; break;
      case 2: newX = maxX - sizePx; newY = maxY; break;
      case 3: newX = minX - sizePx; newY = maxY - sizePx; break;
      case 0: newX = minX; newY = minY - sizePx; break;
      default: newX = maxX; newY = minY;
    }
    
    squares.push({ x: newX, y: newY, size: sizePx });
  }
  
  // Now draw arcs in each square
  // The arc center is at the corner of the square where the spiral "pivots"
  // Arc sweeps 90 degrees inside the square
  
  for (let i = 0; i < numArcs; i++) {
    const sq = squares[i];
    const dir = i % 4;
    const radiusPx = sq.size;
    
    // Determine arc center (the pivot corner) and arc angles
    let arcX: number, arcY: number;
    let startAngle: number, endAngle: number;
    
    switch (dir) {
      case 0: // Arc center at bottom-right corner, sweep from top to left (180° to 270°)
        arcX = sq.x + sq.size;
        arcY = sq.y + sq.size;
        startAngle = Math.PI;
        endAngle = Math.PI * 1.5;
        break;
      case 1: // Arc center at bottom-left corner, sweep from left to bottom (270° to 360°)
        arcX = sq.x;
        arcY = sq.y + sq.size;
        startAngle = Math.PI * 1.5;
        endAngle = Math.PI * 2;
        break;
      case 2: // Arc center at top-left corner, sweep from bottom to right (0° to 90°)
        arcX = sq.x;
        arcY = sq.y;
        startAngle = 0;
        endAngle = Math.PI * 0.5;
        break;
      case 3: // Arc center at top-right corner, sweep from right to top (90° to 180°)
        arcX = sq.x + sq.size;
        arcY = sq.y;
        startAngle = Math.PI * 0.5;
        endAngle = Math.PI;
        break;
      default:
        arcX = sq.x + sq.size;
        arcY = sq.y + sq.size;
        startAngle = Math.PI;
        endAngle = Math.PI * 1.5;
    }
    
    // Variable line width
    const minLineWidthPx = mmToPixels(0.2, dpi);
    const maxLineWidthPx = mmToPixels(lineWidth, dpi);
    const arcLineWidth = Math.max(minLineWidthPx, Math.min(radiusPx * 0.015, maxLineWidthPx));
    
    ctx.lineWidth = arcLineWidth;
    ctx.beginPath();
    ctx.arc(arcX, arcY, radiusPx, startAngle, endAngle);
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
