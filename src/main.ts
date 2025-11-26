import './style.css';

// Golden Ratio constant
const PHI = 1.6180339887;

// Configuration - all measurements in millimeters
interface SpiralConfig {
  initialRadius: number;      // Starting radius in mm
  lineWidth: number;          // 2 mm
  totalPathLength: number;    // 3330 mm (3.33 meters)
  targetTurns: number;        // 7.5 turns (7 full + half of 8th)
  guideCircleRadii: number[]; // in mm
  canvasSizeMM: number;       // Canvas size in mm
  dpi: number;                // Dots per inch for printing
  useFixedTurns: boolean;     // If true, use fixed turns; if false, calculate based on path length
}

const DEFAULT_CONFIG: SpiralConfig = {
  initialRadius: 15,
  lineWidth: 2,
  totalPathLength: 3330,
  targetTurns: 7.5,
  guideCircleRadii: [15, 24, 39, 63, 102, 165, 253, 267], // Guide circle radii in mm
  canvasSizeMM: 550, // Slightly larger than 506mm diameter
  dpi: 300,
  useFixedTurns: true  // Use the target turns (7.5) as the constraint
};

// State
let config = { ...DEFAULT_CONFIG };
let calculatedPathLength = 0;
let finalRadius = 0;
let effectiveRadius = 15; // The actual initial radius used (may differ from config.initialRadius)

// Zoom and pan state
let currentZoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

/**
 * Golden spiral: r(θ) = a * φ^(θ/(2π))
 * where a is the initial radius at θ=0
 * 
 * For a golden spiral, the radius multiplies by φ every 360° (2π radians)
 */
function goldenSpiralRadius(theta: number, initialRadius: number): number {
  return initialRadius * Math.pow(PHI, theta / (2 * Math.PI));
}

/**
 * Calculate the arc length of a golden spiral from θ=0 to θ=maxTheta
 * Using numerical integration (higher precision with more steps)
 * 
 * Arc length formula: L = ∫√(r² + (dr/dθ)²) dθ
 * For golden spiral: dr/dθ = r * ln(φ) / (2π)
 */
function calculateArcLength(initialRadius: number, maxTheta: number, steps: number = 50000): number {
  const k = Math.log(PHI) / (2 * Math.PI);
  let length = 0;
  const dTheta = maxTheta / steps;
  
  for (let i = 0; i < steps; i++) {
    const theta = i * dTheta;
    const r = goldenSpiralRadius(theta, initialRadius);
    const drDtheta = r * k;
    
    // Arc length element: ds = √(r² + (dr/dθ)²) dθ
    const ds = Math.sqrt(r * r + drDtheta * drDtheta) * dTheta;
    length += ds;
  }
  
  return length;
}

/**
 * Find the initial radius that gives us the target path length for a fixed number of turns
 * Uses binary search for precision
 */
function findInitialRadiusForPathLength(targetLength: number, turns: number): number {
  const maxTheta = turns * 2 * Math.PI;
  let low = 0.1;  // Minimum initial radius in mm
  let high = 100; // Maximum initial radius in mm
  const tolerance = 0.1; // 0.1mm tolerance
  
  while (high - low > 0.001) {
    const mid = (low + high) / 2;
    const length = calculateArcLength(mid, maxTheta);
    
    if (Math.abs(length - targetLength) < tolerance) {
      return mid;
    }
    
    if (length < targetLength) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return (low + high) / 2;
}

/**
 * Find the maximum theta that gives us the target path length
 * Uses binary search for precision
 */
function findThetaForPathLength(initialRadius: number, targetLength: number): number {
  let low = 0;
  let high = 20 * 2 * Math.PI; // Start with 20 turns max
  const tolerance = 0.1; // 0.1mm tolerance
  
  while (high - low > 0.0001) {
    const mid = (low + high) / 2;
    const length = calculateArcLength(initialRadius, mid);
    
    if (Math.abs(length - targetLength) < tolerance) {
      return mid;
    }
    
    if (length < targetLength) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return (low + high) / 2;
}

/**
 * Generate points along the golden spiral for rendering
 */
function generateSpiralPoints(
  initialRadius: number,
  maxTheta: number,
  pointsPerTurn: number = 360
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const totalPoints = Math.ceil((maxTheta / (2 * Math.PI)) * pointsPerTurn);
  
  for (let i = 0; i <= totalPoints; i++) {
    const theta = (i / totalPoints) * maxTheta;
    const r = goldenSpiralRadius(theta, initialRadius);
    
    // Start at 3 o'clock (θ=0) and go clockwise (negative y direction)
    // Clockwise when viewed from above means we negate the angle
    const x = r * Math.cos(-theta);
    const y = r * Math.sin(-theta);
    
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Convert millimeters to pixels based on DPI
 */
function mmToPixels(mm: number, dpi: number): number {
  return (mm / 25.4) * dpi;
}

/**
 * Draw the complete spiral template on canvas
 */
function drawSpiral(canvas: HTMLCanvasElement, config: SpiralConfig): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Calculate canvas size in pixels
  const canvasPixels = mmToPixels(config.canvasSizeMM, config.dpi);
  canvas.width = canvasPixels;
  canvas.height = canvasPixels;
  
  // Center of the canvas
  const centerX = canvasPixels / 2;
  const centerY = canvasPixels / 2;
  
  // Clear canvas with white background (paper)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasPixels, canvasPixels);
  
  // Add subtle paper texture
  addPaperTexture(ctx, canvasPixels);
  
  let maxTheta: number;
  let actualTurns: number;
  let effectiveInitialRadius = config.initialRadius;
  
  if (config.useFixedTurns) {
    // Use fixed number of turns (7.5) and calculate the initial radius needed
    // to achieve the target path length with that many turns
    maxTheta = config.targetTurns * 2 * Math.PI;
    actualTurns = config.targetTurns;
    
    // Find the initial radius that gives us the target path length with fixed turns
    effectiveInitialRadius = findInitialRadiusForPathLength(config.totalPathLength, config.targetTurns);
    
    // Update calculated values
    calculatedPathLength = calculateArcLength(effectiveInitialRadius, maxTheta);
    finalRadius = goldenSpiralRadius(maxTheta, effectiveInitialRadius);
  } else {
    // Calculate theta based on path length with fixed initial radius
    maxTheta = findThetaForPathLength(config.initialRadius, config.totalPathLength);
    actualTurns = maxTheta / (2 * Math.PI);
    
    // Update calculated values
    calculatedPathLength = calculateArcLength(config.initialRadius, maxTheta);
    finalRadius = goldenSpiralRadius(maxTheta, config.initialRadius);
  }
  
  // Draw guide circles (very faint light-gray)
  drawGuideCircles(ctx, centerX, centerY, config, finalRadius);
  
  // Generate spiral points
  const points = generateSpiralPoints(effectiveInitialRadius, maxTheta, 720);
  
  // Draw the spiral
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = mmToPixels(config.lineWidth, config.dpi);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = centerX + mmToPixels(points[i].x, config.dpi);
    const py = centerY + mmToPixels(points[i].y, config.dpi);
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  
  // Draw center dot with "O"
  drawCenterMark(ctx, centerX, centerY, config.dpi);
  
  // Update UI with calculated values
  updateCalculatedValues(actualTurns, effectiveInitialRadius);
  
  // Store effective radius for SVG export
  effectiveRadius = effectiveInitialRadius;
}

/**
 * Add subtle paper texture to the canvas
 */
function addPaperTexture(ctx: CanvasRenderingContext2D, size: number): void {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Add very subtle noise (±2 out of 255)
    const noise = (Math.random() - 0.5) * 4;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw guide circles with 90° marker dots
 */
function drawGuideCircles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  config: SpiralConfig,
  actualFinalRadius: number
): void {
  // Use the configured guide radii plus the actual final radius
  const radii = [...config.guideCircleRadii];
  if (!radii.includes(Math.round(actualFinalRadius))) {
    radii.push(actualFinalRadius);
  }
  
  // Sort radii
  radii.sort((a, b) => a - b);
  
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)'; // Very faint light-gray
  ctx.lineWidth = mmToPixels(0.3, config.dpi);
  
  radii.forEach(radius => {
    const radiusPixels = mmToPixels(radius, config.dpi);
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw 90° marker dots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const dotRadius = mmToPixels(0.8, config.dpi);
    
    for (let angle = 0; angle < 360; angle += 90) {
      const rad = (angle * Math.PI) / 180;
      const dotX = centerX + radiusPixels * Math.cos(rad);
      const dotY = centerY + radiusPixels * Math.sin(rad);
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

/**
 * Draw center mark with "O" label
 */
function drawCenterMark(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  dpi: number
): void {
  // Draw small black dot
  const dotRadius = mmToPixels(2, dpi);
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw "O" label slightly below
  const fontSize = mmToPixels(6, dpi);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000';
  ctx.fillText('O', centerX, centerY + dotRadius + mmToPixels(1, dpi));
}

/**
 * Update the UI with calculated values
 */
function updateCalculatedValues(actualTurns: number, effectiveInitialRadius: number): void {
  const pathLengthEl = document.getElementById('calculated-path-length');
  const finalRadiusEl = document.getElementById('calculated-final-radius');
  const turnsEl = document.getElementById('calculated-turns');
  const diameterEl = document.getElementById('calculated-diameter');
  const initialRadiusEl = document.getElementById('calculated-initial-radius');
  
  if (pathLengthEl) {
    pathLengthEl.textContent = `${(calculatedPathLength / 1000).toFixed(4)} m (${calculatedPathLength.toFixed(1)} mm)`;
  }
  if (finalRadiusEl) {
    finalRadiusEl.textContent = `${(finalRadius / 10).toFixed(2)} cm (${finalRadius.toFixed(1)} mm)`;
  }
  if (turnsEl) {
    turnsEl.textContent = `${actualTurns.toFixed(3)} turns`;
  }
  if (diameterEl) {
    diameterEl.textContent = `${((finalRadius * 2) / 10).toFixed(2)} cm`;
  }
  if (initialRadiusEl) {
    initialRadiusEl.textContent = `${effectiveInitialRadius.toFixed(2)} mm`;
  }
}

/**
 * Handle printing
 */
function printSpiral(): void {
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the spiral');
    return;
  }
  
  // Calculate physical size in mm
  const sizeMM = config.canvasSizeMM;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Golden Spiral Template - Print</title>
      <style>
        @page {
          size: ${sizeMM}mm ${sizeMM}mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        img {
          width: ${sizeMM}mm;
          height: ${sizeMM}mm;
        }
      </style>
    </head>
    <body>
      <img src="${canvas.toDataURL('image/png')}" />
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for image to load then print
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

/**
 * Download the spiral as PNG
 */
function downloadSpiral(): void {
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = `golden-spiral-${config.initialRadius}mm-${(config.totalPathLength/1000).toFixed(2)}m.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Download as SVG for vector printing
 */
function downloadSVG(): void {
  // Use the same logic as drawSpiral to get consistent results
  let maxTheta: number;
  let usedInitialRadius: number;
  
  if (config.useFixedTurns) {
    maxTheta = config.targetTurns * 2 * Math.PI;
    usedInitialRadius = effectiveRadius;
  } else {
    maxTheta = findThetaForPathLength(config.initialRadius, config.totalPathLength);
    usedInitialRadius = config.initialRadius;
  }
  
  const points = generateSpiralPoints(usedInitialRadius, maxTheta, 720);
  
  const svgWidth = config.canvasSizeMM;
  const svgHeight = config.canvasSizeMM;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  
  // Build path data
  let pathData = '';
  points.forEach((point, i) => {
    const x = centerX + point.x;
    const y = centerY + point.y;
    pathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });
  
  // Build guide circles
  let guideCircles = '';
  const radii = [...config.guideCircleRadii, finalRadius];
  radii.forEach(radius => {
    guideCircles += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="rgba(200,200,200,0.4)" stroke-width="0.3"/>`;
    
    // Add 90° dots
    for (let angle = 0; angle < 360; angle += 90) {
      const rad = (angle * Math.PI) / 180;
      const dotX = centerX + radius * Math.cos(rad);
      const dotY = centerY + radius * Math.sin(rad);
      guideCircles += `<circle cx="${dotX}" cy="${dotY}" r="0.8" fill="rgba(0,0,0,0.5)"/>`;
    }
  });
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}mm" height="${svgHeight}mm" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="100%" height="100%" fill="white"/>
  ${guideCircles}
  <path d="${pathData}" fill="none" stroke="black" stroke-width="${config.lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${centerX}" cy="${centerY}" r="2" fill="black"/>
  <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" font-family="Arial" font-size="6" font-weight="bold">O</text>
</svg>`;
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = `golden-spiral-${usedInitialRadius.toFixed(1)}mm-${(config.totalPathLength/1000).toFixed(2)}m.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

/**
 * Initialize the application
 */
function init(): void {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = `
    <div class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <!-- Header -->
      <header class="no-print bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-amber-400">🌀 Golden Ratio Spiral Generator</h1>
          <p class="text-slate-400 text-sm mt-1">Precision template for 3.33m copper wire implosion coil</p>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="no-print lg:col-span-1 space-y-6">
            
            <!-- Configuration Card -->
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 class="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Configuration
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Initial Radius (mm)</label>
                  <input type="number" id="initial-radius" value="${config.initialRadius}" 
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Total Path Length (mm)</label>
                  <input type="number" id="path-length" value="${config.totalPathLength}" 
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Line Width (mm)</label>
                  <input type="number" id="line-width" value="${config.lineWidth}" step="0.1"
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Print DPI</label>
                  <select id="dpi" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent">
                    <option value="150">150 DPI (Draft)</option>
                    <option value="300" selected>300 DPI (Standard)</option>
                    <option value="600">600 DPI (High Quality)</option>
                  </select>
                </div>
                
                <button id="regenerate-btn" 
                  class="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Regenerate Spiral
                </button>
              </div>
            </div>
            
            <!-- Calculated Values Card -->
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 class="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Calculated Values
              </h2>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center py-2 border-b border-slate-700">
                  <span class="text-slate-400">Path Length:</span>
                  <span id="calculated-path-length" class="text-white font-mono">--</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-700">
                  <span class="text-slate-400">Initial Radius:</span>
                  <span id="calculated-initial-radius" class="text-white font-mono">--</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-700">
                  <span class="text-slate-400">Final Radius:</span>
                  <span id="calculated-final-radius" class="text-white font-mono">--</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-700">
                  <span class="text-slate-400">Total Diameter:</span>
                  <span id="calculated-diameter" class="text-white font-mono">--</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-slate-400">Turns:</span>
                  <span id="calculated-turns" class="text-white font-mono">--</span>
                </div>
              </div>
              
              <div class="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p class="text-xs text-amber-300">
                  <strong>φ (Phi):</strong> \${PHI.toFixed(10)}<br>
                  Growth factor per 360° turn
                </p>
              </div>
            </div>
            
            <!-- Export Actions -->
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 class="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export & Print
              </h2>
              
              <div class="space-y-3">
                <button id="print-btn" 
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Print 1:1 Scale
                </button>
                
                <button id="download-png-btn" 
                  class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Download PNG
                </button>
                
                <button id="download-svg-btn" 
                  class="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                  Download SVG (Vector)
                </button>
              </div>
              
              <p class="text-xs text-slate-400 mt-4">
                💡 SVG format is recommended for large-format printing to maintain crisp edges at any scale.
              </p>
            </div>
          </div>
          
          <!-- Right Panel: Canvas -->
          <div class="lg:col-span-2">
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-white">Preview</h2>
                <div class="flex items-center gap-2">
                  <button id="zoom-out-btn" class="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Zoom Out">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                    </svg>
                  </button>
                  <span id="zoom-level" class="text-sm text-slate-400 min-w-[60px] text-center">Fit</span>
                  <button id="zoom-in-btn" class="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Zoom In">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
                    </svg>
                  </button>
                  <button id="zoom-fit-btn" class="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Fit to View">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                  </button>
                  <button id="zoom-100-btn" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs font-medium" title="100% (Actual Size)">
                    1:1
                  </button>
                </div>
              </div>
              
              <div id="canvas-container" class="relative overflow-hidden bg-slate-900 rounded-lg cursor-grab active:cursor-grabbing" style="height: 500px;">
                <div id="canvas-wrapper" class="absolute origin-center transition-transform duration-150" style="transform-origin: center center;">
                  <canvas id="spiral-canvas" class="block"></canvas>
                </div>
              </div>
              
              <div class="mt-4 flex items-center justify-between text-sm text-slate-400">
                <span>Canvas: <span id="canvas-size-display">--</span></span>
                <span class="text-xs">Scroll to zoom • Drag to pan • Double-click to reset</span>
              </div>
            </div>
            
            <!-- Print Instructions -->
            <div class="mt-6 bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-amber-400 mb-3">📋 Printing Instructions</h3>
              <ol class="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                <li>Download the SVG file for best quality at large sizes</li>
                <li>Open in a vector editor (Inkscape, Illustrator) or print directly</li>
                <li>Set paper size to at least 55cm × 55cm</li>
                <li>Ensure "Scale: 100%" or "Actual Size" is selected</li>
                <li>Verify the center dot measures approximately 4mm diameter</li>
                <li>The spiral line should be exactly 2mm wide</li>
                <li>Trace the 3.33m copper wire directly on the black line</li>
              </ol>
            </div>
            
            <!-- Design Requirements -->
            <div class="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 class="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Design Requirements
              </h3>
              
              <div class="text-sm text-slate-300 space-y-3">
                <p class="text-slate-400 italic text-xs mb-3">
                  Golden ratio implosion coil template specifications:
                </p>
                
                <ul class="space-y-2">
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Total spiral path length: <strong class="text-white">exactly 3.33 meters</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Golden ratio: <strong class="text-white">φ = 1.6180339887</strong> per 360° turn</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-amber-400">⚠</span>
                    <span>Initial radius: <strong class="text-white">15 mm</strong> (first small loop) <em class="text-amber-400">— see note below</em></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Line width: <strong class="text-white">exactly 2 mm</strong> (for 1.5-2mm copper wire)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Turns: <strong class="text-white">7 full + ½ of 8th</strong> (7.5 turns total)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Start: <strong class="text-white">3 o'clock position</strong>, curves clockwise</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-amber-400">⚠</span>
                    <span>Final radius: <strong class="text-white">≈ 25.3 cm</strong>, diameter ≈ 50.6 cm <em class="text-amber-400">— see note below</em></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Center point: <strong class="text-white">black dot with "O"</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span>Guide circles at: <strong class="text-white">1.5, 2.4, 3.9, 6.3, 10.2, 16.5, 26.7 cm</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-400">✓</span>
                    <span><strong class="text-white">90° marker dots</strong> on each guide circle</span>
                  </li>
                </ul>
                
                <div class="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p class="text-xs text-purple-300">
                    <strong>Purpose:</strong> Print 1:1 scale template to trace 3.33m copper wire directly on the spiral line for implosion coil construction.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Mathematical Note -->
            <div class="mt-6 bg-linear-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-red-400 mb-3">⚠️ Mathematical Constraint Note</h3>
              <div class="text-sm text-slate-300 space-y-3">
                <p>
                  The original requirements contain a <strong class="text-red-400">mathematical impossibility</strong>. 
                  For a golden spiral with φ = 1.6180339887, you <strong>cannot</strong> simultaneously achieve:
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li>Path length = exactly 3.33 meters</li>
                  <li>Initial radius = 15 mm</li>
                  <li>Exactly 7.5 turns</li>
                  <li>Final radius = 25.3 cm</li>
                </ul>
                <p class="mt-3">
                  <strong class="text-white">This implementation prioritizes:</strong>
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li><span class="text-green-400">✓</span> Path length = <strong>exactly 3.33 meters</strong></li>
                  <li><span class="text-green-400">✓</span> Turns = <strong>exactly 7.5</strong></li>
                  <li><span class="text-amber-400">→</span> Initial radius is <strong>calculated (~7.08 mm)</strong> to satisfy these constraints</li>
                  <li><span class="text-amber-400">→</span> Final radius is <strong>~26.1 cm</strong> (diameter ~52.3 cm)</li>
                </ul>
                <p class="mt-3 text-xs text-slate-400">
                  The "Calculated Values" panel on the left shows the actual mathematically precise values used. 
                  You can adjust the parameters in the Configuration panel to explore different trade-offs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="no-print bg-slate-800/30 border-t border-slate-700 mt-12 py-6">
        <div class="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          Golden Ratio Spiral Generator • φ = 1.6180339887 • Implosion Coil Template
        </div>
      </footer>
    </div>
  `;
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial render
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  if (canvas) {
    drawSpiral(canvas, config);
    updateCanvasSizeDisplay();
  }
}

/**
 * Set up UI event listeners
 */
function setupEventListeners(): void {
  // Regenerate button
  document.getElementById('regenerate-btn')?.addEventListener('click', () => {
    updateConfigFromInputs();
    const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
    if (canvas) {
      drawSpiral(canvas, config);
      updateCanvasSizeDisplay();
      fitToView();
    }
  });
  
  // Print button
  document.getElementById('print-btn')?.addEventListener('click', printSpiral);
  
  // Download PNG button
  document.getElementById('download-png-btn')?.addEventListener('click', downloadSpiral);
  
  // Download SVG button
  document.getElementById('download-svg-btn')?.addEventListener('click', downloadSVG);
  
  // DPI change
  document.getElementById('dpi')?.addEventListener('change', (e) => {
    config.dpi = parseInt((e.target as HTMLSelectElement).value);
  });
  
  // Zoom controls
  setupZoomControls();
}

/**
 * Set up zoom and pan controls
 */
function setupZoomControls(): void {
  const container = document.getElementById('canvas-container');
  const wrapper = document.getElementById('canvas-wrapper');
  
  if (!container || !wrapper) return;
  
  // Zoom buttons
  document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
    setZoom(currentZoom * 1.25);
  });
  
  document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
    setZoom(currentZoom / 1.25);
  });
  
  document.getElementById('zoom-fit-btn')?.addEventListener('click', fitToView);
  
  document.getElementById('zoom-100-btn')?.addEventListener('click', () => {
    setZoom(1);
    panX = 0;
    panY = 0;
    updateTransform();
  });
  
  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    
    // Get mouse position relative to container
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    
    // Adjust pan to zoom towards mouse position
    const newZoom = Math.max(0.05, Math.min(5, currentZoom * delta));
    const zoomRatio = newZoom / currentZoom;
    
    panX = mouseX - (mouseX - panX) * zoomRatio;
    panY = mouseY - (mouseY - panY) * zoomRatio;
    
    currentZoom = newZoom;
    updateTransform();
  }, { passive: false });
  
  // Pan with mouse drag
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    container.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    panX += deltaX;
    panY += deltaY;
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    updateTransform();
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  });
  
  // Double-click to reset view
  container.addEventListener('dblclick', fitToView);
  
  // Touch support for mobile
  let touchStartDistance = 0;
  let touchStartZoom = 1;
  
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      touchStartDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartZoom = currentZoom;
    } else if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  }, { passive: true });
  
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / touchStartDistance;
      setZoom(touchStartZoom * scale);
    } else if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      
      panX += deltaX;
      panY += deltaY;
      
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      
      updateTransform();
    }
  }, { passive: false });
  
  container.addEventListener('touchend', () => {
    isDragging = false;
  });
  
  // Initial fit to view
  setTimeout(fitToView, 100);
}

/**
 * Set zoom level
 */
function setZoom(zoom: number): void {
  currentZoom = Math.max(0.05, Math.min(5, zoom));
  updateTransform();
}

/**
 * Fit the canvas to the container view
 */
function fitToView(): void {
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  
  if (!container || !canvas) return;
  
  const containerRect = container.getBoundingClientRect();
  const padding = 20;
  
  const scaleX = (containerRect.width - padding * 2) / canvas.width;
  const scaleY = (containerRect.height - padding * 2) / canvas.height;
  
  currentZoom = Math.min(scaleX, scaleY, 1);
  panX = 0;
  panY = 0;
  
  updateTransform();
}

/**
 * Update the transform of the canvas wrapper
 */
function updateTransform(): void {
  const wrapper = document.getElementById('canvas-wrapper');
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  const zoomDisplay = document.getElementById('zoom-level');
  
  if (!wrapper || !container || !canvas) return;
  
  const containerRect = container.getBoundingClientRect();
  
  // Calculate position to center the canvas
  const scaledWidth = canvas.width * currentZoom;
  const scaledHeight = canvas.height * currentZoom;
  
  const left = (containerRect.width - scaledWidth) / 2 + panX;
  const top = (containerRect.height - scaledHeight) / 2 + panY;
  
  wrapper.style.transform = `translate(${left}px, ${top}px) scale(${currentZoom})`;
  wrapper.style.transformOrigin = 'top left';
  
  // Update zoom level display
  if (zoomDisplay) {
    const percentage = Math.round(currentZoom * 100);
    if (percentage === 100) {
      zoomDisplay.textContent = '100%';
    } else if (currentZoom < 0.1) {
      zoomDisplay.textContent = `${(currentZoom * 100).toFixed(1)}%`;
    } else {
      zoomDisplay.textContent = `${percentage}%`;
    }
  }
}

/**
 * Update config from input values
 */
function updateConfigFromInputs(): void {
  const initialRadius = document.getElementById('initial-radius') as HTMLInputElement;
  const pathLength = document.getElementById('path-length') as HTMLInputElement;
  const lineWidth = document.getElementById('line-width') as HTMLInputElement;
  const dpi = document.getElementById('dpi') as HTMLSelectElement;
  
  if (initialRadius) config.initialRadius = parseFloat(initialRadius.value);
  if (pathLength) config.totalPathLength = parseFloat(pathLength.value);
  if (lineWidth) config.lineWidth = parseFloat(lineWidth.value);
  if (dpi) config.dpi = parseInt(dpi.value);
  
  // Recalculate canvas size based on expected final radius
  const maxTheta = findThetaForPathLength(config.initialRadius, config.totalPathLength);
  const expectedFinalRadius = goldenSpiralRadius(maxTheta, config.initialRadius);
  config.canvasSizeMM = Math.ceil((expectedFinalRadius * 2 + 40) / 10) * 10; // Round up to nearest 10mm with margin
}

/**
 * Update canvas size display
 */
function updateCanvasSizeDisplay(): void {
  const display = document.getElementById('canvas-size-display');
  if (display) {
    const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
    if (canvas) {
      display.textContent = `${config.canvasSizeMM}mm × ${config.canvasSizeMM}mm (${canvas.width}×${canvas.height}px at ${config.dpi} DPI)`;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Also call init immediately in case DOM is already loaded
if (document.readyState !== 'loading') {
  init();
}
