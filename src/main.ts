import './style.css';

// Golden Ratio constant - FIXED
const PHI = 1.6180339887498948;

// Golden spiral: radius multiplies by PHI every 90 degrees
const GOLDEN_B = Math.log(PHI) / (Math.PI / 2);

interface SpiralConfig {
  initialRadius: number;
  lineWidth: number;
  turns: number;
  canvasSizeMM: number;
  dpi: number;
  showGrid: boolean;
  gridSpacingMM: number;
  showGuideCircles: boolean;
}

const DEFAULT_CONFIG: SpiralConfig = {
  initialRadius: 15,
  lineWidth: 2,
  turns: 7.5,
  canvasSizeMM: 600,
  dpi: 300,
  showGrid: true,
  gridSpacingMM: 50,
  showGuideCircles: true
};

let config = { ...DEFAULT_CONFIG };
let calculatedPathLength = 0;
let finalRadius = 0;

let currentZoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function goldenSpiralRadius(theta: number, initialRadius: number): number {
  return initialRadius * Math.exp(GOLDEN_B * theta);
}

function calculateArcLength(initialRadius: number, maxTheta: number): number {
  const sqrtFactor = Math.sqrt(1 + GOLDEN_B * GOLDEN_B);
  const expFactor = Math.exp(GOLDEN_B * maxTheta) - 1;
  return (initialRadius / GOLDEN_B) * sqrtFactor * expFactor;
}

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
    const x = r * Math.cos(-theta);
    const y = r * Math.sin(-theta);
    points.push({ x, y });
  }
  
  return points;
}

function mmToPixels(mm: number, dpi: number): number {
  return (mm / 25.4) * dpi;
}

function drawSpiral(canvas: HTMLCanvasElement, config: SpiralConfig): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const maxTheta = config.turns * 2 * Math.PI;
  finalRadius = goldenSpiralRadius(maxTheta, config.initialRadius);
  calculatedPathLength = calculateArcLength(config.initialRadius, maxTheta);
  
  const requiredSize = Math.ceil((finalRadius * 2 + 60) / 10) * 10;
  config.canvasSizeMM = Math.max(requiredSize, 200);
  
  const canvasPixels = mmToPixels(config.canvasSizeMM, config.dpi);
  canvas.width = canvasPixels;
  canvas.height = canvasPixels;
  
  const centerX = canvasPixels / 2;
  const centerY = canvasPixels / 2;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasPixels, canvasPixels);
  
  if (config.showGrid) {
    drawPrintGrid(ctx, canvasPixels, config);
  }
  
  if (config.showGuideCircles) {
    drawGuideCircles(ctx, centerX, centerY, config);
  }
  
  const points = generateSpiralPoints(config.initialRadius, maxTheta, 720);
  
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
  
  drawCenterMark(ctx, centerX, centerY, config.dpi);
  updateCalculatedValues();
}

function drawPrintGrid(
  ctx: CanvasRenderingContext2D,
  canvasPixels: number,
  config: SpiralConfig
): void {
  const gridSpacingPx = mmToPixels(config.gridSpacingMM, config.dpi);
  const centerX = canvasPixels / 2;
  const centerY = canvasPixels / 2;
  
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.lineWidth = mmToPixels(0.2, config.dpi);
  
  for (let x = centerX % gridSpacingPx; x < canvasPixels; x += gridSpacingPx) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasPixels);
    ctx.stroke();
  }
  
  for (let y = centerY % gridSpacingPx; y < canvasPixels; y += gridSpacingPx) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasPixels, y);
    ctx.stroke();
  }
  
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
  ctx.lineWidth = mmToPixels(0.4, config.dpi);
  
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvasPixels);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvasPixels, centerY);
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
  const fontSize = mmToPixels(3, config.dpi);
  ctx.font = fontSize + 'px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  for (let d = config.gridSpacingMM; d <= config.canvasSizeMM / 2; d += config.gridSpacingMM) {
    const px = mmToPixels(d, config.dpi);
    ctx.fillText(d.toString(), centerX + px, 5);
    ctx.save();
    ctx.translate(5, centerY + px);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(d.toString(), 0, 0);
    ctx.restore();
  }
}

function drawGuideCircles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  config: SpiralConfig
): void {
  const radii: number[] = [];
  let r = config.initialRadius;
  while (r <= finalRadius * 1.1) {
    radii.push(r);
    r *= PHI;
  }
  if (!radii.some(rad => Math.abs(rad - finalRadius) < 1)) {
    radii.push(finalRadius);
  }
  
  radii.sort((a, b) => a - b);
  
  ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)';
  ctx.lineWidth = mmToPixels(0.25, config.dpi);
  
  radii.forEach(radius => {
    const radiusPixels = mmToPixels(radius, config.dpi);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const dotRadius = mmToPixels(0.6, config.dpi);
    
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

function drawCenterMark(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  dpi: number
): void {
  const dotRadius = mmToPixels(2, dpi);
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  const fontSize = mmToPixels(6, dpi);
  ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000';
  ctx.fillText('O', centerX, centerY + dotRadius + mmToPixels(1, dpi));
}

function updateCalculatedValues(): void {
  const pathLengthEl = document.getElementById('calculated-path-length');
  const finalRadiusEl = document.getElementById('calculated-final-radius');
  const turnsEl = document.getElementById('calculated-turns');
  const diameterEl = document.getElementById('calculated-diameter');
  const initialRadiusEl = document.getElementById('calculated-initial-radius');
  const growthFactorEl = document.getElementById('calculated-growth');
  
  if (pathLengthEl) {
    pathLengthEl.textContent = (calculatedPathLength / 1000).toFixed(4) + ' m (' + calculatedPathLength.toFixed(1) + ' mm)';
  }
  if (finalRadiusEl) {
    finalRadiusEl.textContent = (finalRadius / 10).toFixed(2) + ' cm (' + finalRadius.toFixed(1) + ' mm)';
  }
  if (turnsEl) {
    turnsEl.textContent = config.turns.toFixed(2) + ' turns';
  }
  if (diameterEl) {
    diameterEl.textContent = ((finalRadius * 2) / 10).toFixed(2) + ' cm';
  }
  if (initialRadiusEl) {
    initialRadiusEl.textContent = config.initialRadius.toFixed(2) + ' mm';
  }
  if (growthFactorEl) {
    growthFactorEl.textContent = 'x' + PHI.toFixed(10) + ' per 90 deg';
  }
}

function printSpiral(): void {
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the spiral');
    return;
  }
  
  const sizeMM = config.canvasSizeMM;
  
  printWindow.document.write(
    '<!DOCTYPE html><html><head><title>Golden Spiral Template - Print</title>' +
    '<style>@page { size: ' + sizeMM + 'mm ' + sizeMM + 'mm; margin: 0; }' +
    'body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; }' +
    'img { width: ' + sizeMM + 'mm; height: ' + sizeMM + 'mm; }</style></head>' +
    '<body><img src="' + canvas.toDataURL('image/png') + '" /></body></html>'
  );
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

function downloadSpiral(): void {
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = 'golden-spiral-' + config.initialRadius + 'mm-' + config.turns + 'turns.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function downloadSVG(): void {
  const maxTheta = config.turns * 2 * Math.PI;
  const points = generateSpiralPoints(config.initialRadius, maxTheta, 720);
  
  const svgWidth = config.canvasSizeMM;
  const svgHeight = config.canvasSizeMM;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  
  let pathData = '';
  points.forEach((point, i) => {
    const x = centerX + point.x;
    const y = centerY + point.y;
    pathData += i === 0 ? 'M ' + x + ' ' + y : ' L ' + x + ' ' + y;
  });
  
  let gridLines = '';
  if (config.showGrid) {
    const gridSpacing = config.gridSpacingMM;
    for (let d = gridSpacing; d <= svgWidth / 2; d += gridSpacing) {
      gridLines += '<line x1="' + (centerX + d) + '" y1="0" x2="' + (centerX + d) + '" y2="' + svgHeight + '" stroke="rgba(200,200,200,0.3)" stroke-width="0.2"/>';
      gridLines += '<line x1="' + (centerX - d) + '" y1="0" x2="' + (centerX - d) + '" y2="' + svgHeight + '" stroke="rgba(200,200,200,0.3)" stroke-width="0.2"/>';
      gridLines += '<line x1="0" y1="' + (centerY + d) + '" x2="' + svgWidth + '" y2="' + (centerY + d) + '" stroke="rgba(200,200,200,0.3)" stroke-width="0.2"/>';
      gridLines += '<line x1="0" y1="' + (centerY - d) + '" x2="' + svgWidth + '" y2="' + (centerY - d) + '" stroke="rgba(200,200,200,0.3)" stroke-width="0.2"/>';
    }
    gridLines += '<line x1="' + centerX + '" y1="0" x2="' + centerX + '" y2="' + svgHeight + '" stroke="rgba(150,150,150,0.5)" stroke-width="0.4"/>';
    gridLines += '<line x1="0" y1="' + centerY + '" x2="' + svgWidth + '" y2="' + centerY + '" stroke="rgba(150,150,150,0.5)" stroke-width="0.4"/>';
  }
  
  let guideCircles = '';
  if (config.showGuideCircles) {
    let r = config.initialRadius;
    while (r <= finalRadius * 1.1) {
      guideCircles += '<circle cx="' + centerX + '" cy="' + centerY + '" r="' + r + '" fill="none" stroke="rgba(180,180,180,0.4)" stroke-width="0.25"/>';
      for (let angle = 0; angle < 360; angle += 90) {
        const rad = (angle * Math.PI) / 180;
        const dotX = centerX + r * Math.cos(rad);
        const dotY = centerY + r * Math.sin(rad);
        guideCircles += '<circle cx="' + dotX + '" cy="' + dotY + '" r="0.6" fill="rgba(0,0,0,0.4)"/>';
      }
      r *= PHI;
    }
    guideCircles += '<circle cx="' + centerX + '" cy="' + centerY + '" r="' + finalRadius + '" fill="none" stroke="rgba(180,180,180,0.4)" stroke-width="0.25"/>';
  }
  
  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + 'mm" height="' + svgHeight + 'mm" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">\n' +
    '  <rect width="100%" height="100%" fill="white"/>\n' +
    '  ' + gridLines + '\n' +
    '  ' + guideCircles + '\n' +
    '  <path d="' + pathData + '" fill="none" stroke="black" stroke-width="' + config.lineWidth + '" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '  <circle cx="' + centerX + '" cy="' + centerY + '" r="2" fill="black"/>\n' +
    '  <text x="' + centerX + '" y="' + (centerY + 5) + '" text-anchor="middle" font-family="Arial" font-size="6" font-weight="bold">O</text>\n' +
    '</svg>';
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = 'golden-spiral-' + config.initialRadius + 'mm-' + config.turns + 'turns.svg';
  link.href = URL.createObjectURL(blob);
  link.click();
}

function init(): void {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = `
    <div class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header class="no-print bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold text-amber-400">��� Golden Ratio Spiral Generator</h1>
          <p class="text-slate-400 text-sm mt-1">Mathematically precise φ-based logarithmic spiral template</p>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="no-print lg:col-span-1 space-y-6">
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <h3 class="text-amber-400 font-semibold mb-2">��� Golden Spiral Properties</h3>
              <p class="text-xs text-slate-300">
                This spiral is <strong class="text-amber-300">always</strong> a true golden spiral. 
                The radius multiplies by <strong class="text-amber-300">φ = ${PHI.toFixed(10)}</strong> 
                every 90° (quarter turn). This is mathematically guaranteed.
              </p>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 class="text-lg font-semibold text-amber-400 mb-4">⚙️ Configuration</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Initial Radius (mm)</label>
                  <input type="number" id="initial-radius" value="${config.initialRadius}" min="1" step="0.5"
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400">
                  <p class="text-xs text-slate-500 mt-1">Starting radius at center</p>
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Number of Turns</label>
                  <input type="number" id="num-turns" value="${config.turns}" min="0.5" max="20" step="0.5"
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400">
                  <p class="text-xs text-slate-500 mt-1">Complete 360° rotations</p>
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Line Width (mm)</label>
                  <input type="number" id="line-width" value="${config.lineWidth}" step="0.1" min="0.5" max="10"
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400">
                  <p class="text-xs text-slate-500 mt-1">Width of spiral line</p>
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Grid Spacing (mm)</label>
                  <input type="number" id="grid-spacing" value="${config.gridSpacingMM}" step="10" min="10" max="100"
                    class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-400">
                  <p class="text-xs text-slate-500 mt-1">Print alignment grid spacing</p>
                </div>
                
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="show-grid" ${config.showGrid ? 'checked' : ''} 
                      class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500">
                    <span class="text-sm text-slate-300">Show Grid</span>
                  </label>
                  
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="show-guides" ${config.showGuideCircles ? 'checked' : ''} 
                      class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500">
                    <span class="text-sm text-slate-300">Guide Circles</span>
                  </label>
                </div>
                
                <div>
                  <label class="block text-sm text-slate-300 mb-1">Print DPI</label>
                  <select id="dpi" class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                    <option value="150">150 DPI (Draft)</option>
                    <option value="300" selected>300 DPI (Standard)</option>
                    <option value="600">600 DPI (High Quality)</option>
                  </select>
                </div>
                
                <button id="regenerate-btn" 
                  class="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-colors">
                  ��� Regenerate Spiral
                </button>
              </div>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 class="text-lg font-semibold text-green-400 mb-4">��� Calculated Values</h2>
              
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
                <div class="flex justify-between items-center py-2 border-b border-slate-700">
                  <span class="text-slate-400">Turns:</span>
                  <span id="calculated-turns" class="text-white font-mono">--</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-slate-400">Growth Factor:</span>
                  <span id="calculated-growth" class="text-amber-400 font-mono">--</span>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 class="text-lg font-semibold text-blue-400 mb-4">��� Export & Print</h2>
              
              <div class="space-y-3">
                <button id="print-btn" 
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  ���️ Print 1:1 Scale
                </button>
                
                <button id="download-png-btn" 
                  class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  ���️ Download PNG
                </button>
                
                <button id="download-svg-btn" 
                  class="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  ��� Download SVG (Vector)
                </button>
              </div>
              
              <p class="text-xs text-slate-400 mt-4">
                ��� Use the grid lines to align multi-page prints. SVG format recommended for large prints.
              </p>
            </div>
          </div>
          
          <div class="lg:col-span-2">
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-white">Preview</h2>
                <div class="flex items-center gap-2">
                  <button id="zoom-out-btn" class="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Zoom Out">➖</button>
                  <span id="zoom-level" class="text-sm text-slate-400 min-w-[60px] text-center">Fit</span>
                  <button id="zoom-in-btn" class="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Zoom In">➕</button>
                  <button id="zoom-fit-btn" class="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Fit to View">⛶</button>
                  <button id="zoom-100-btn" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-xs font-medium" title="100%">1:1</button>
                </div>
              </div>
              
              <div id="canvas-container" class="relative overflow-hidden bg-slate-900 rounded-lg cursor-grab active:cursor-grabbing" style="height: 500px;">
                <div id="canvas-wrapper" class="absolute origin-center transition-transform duration-150">
                  <canvas id="spiral-canvas" class="block"></canvas>
                </div>
              </div>
              
              <div class="mt-4 flex items-center justify-between text-sm text-slate-400">
                <span>Canvas: <span id="canvas-size-display">--</span></span>
                <span class="text-xs">Scroll to zoom • Drag to pan • Double-click to reset</span>
              </div>
            </div>
            
            <div class="mt-6 bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-amber-400 mb-3">��� Printing Instructions</h3>
              <ol class="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                <li>Download the SVG file for best quality at any size</li>
                <li>Open in a vector editor (Inkscape, Illustrator) or print directly</li>
                <li>Set paper size to match the canvas size shown above</li>
                <li>Ensure "Scale: 100%" or "Actual Size" is selected</li>
                <li>Use the grid lines to align multiple pages if needed</li>
                <li>Verify measurements with a ruler before using</li>
              </ol>
            </div>
            
            <div class="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 class="text-lg font-semibold text-purple-400 mb-4">��� Golden Spiral Mathematics</h3>
              <div class="text-sm text-slate-300 space-y-3">
                <p>A <strong class="text-purple-300">golden spiral</strong> is a special logarithmic spiral 
                  where the growth factor is the golden ratio φ.</p>
                <div class="bg-slate-900/50 p-4 rounded-lg font-mono text-xs">
                  <p class="text-amber-300">Formula: r(θ) = a × e^(b×θ)</p>
                  <p class="text-slate-400 mt-2">Where:</p>
                  <ul class="ml-4 space-y-1">
                    <li>a = initial radius</li>
                    <li>b = ln(φ)/(π/2) ≈ ${GOLDEN_B.toFixed(10)}</li>
                    <li>φ = ${PHI.toFixed(10)} (golden ratio)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer class="no-print bg-slate-800/30 border-t border-slate-700 mt-12 py-6">
        <div class="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          Golden Ratio Spiral Generator • φ = ${PHI.toFixed(10)} • Always mathematically precise
        </div>
      </footer>
    </div>
  `;
  
  setupEventListeners();
  
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  if (canvas) {
    drawSpiral(canvas, config);
    updateCanvasSizeDisplay();
  }
}

function setupEventListeners(): void {
  document.getElementById('regenerate-btn')?.addEventListener('click', () => {
    updateConfigFromInputs();
    const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
    if (canvas) {
      drawSpiral(canvas, config);
      updateCanvasSizeDisplay();
      fitToView();
    }
  });
  
  document.getElementById('print-btn')?.addEventListener('click', printSpiral);
  document.getElementById('download-png-btn')?.addEventListener('click', downloadSpiral);
  document.getElementById('download-svg-btn')?.addEventListener('click', downloadSVG);
  
  document.getElementById('dpi')?.addEventListener('change', (e) => {
    config.dpi = parseInt((e.target as HTMLSelectElement).value);
  });
  
  setupZoomControls();
}

function setupZoomControls(): void {
  const container = document.getElementById('canvas-container');
  const wrapper = document.getElementById('canvas-wrapper');
  
  if (!container || !wrapper) return;
  
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
  
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    
    const newZoom = Math.max(0.05, Math.min(5, currentZoom * delta));
    const zoomRatio = newZoom / currentZoom;
    
    panX = mouseX - (mouseX - panX) * zoomRatio;
    panY = mouseY - (mouseY - panY) * zoomRatio;
    
    currentZoom = newZoom;
    updateTransform();
  }, { passive: false });
  
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    container.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    panX += e.clientX - lastMouseX;
    panY += e.clientY - lastMouseY;
    
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
  
  container.addEventListener('dblclick', fitToView);
  
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
      setZoom(touchStartZoom * (distance / touchStartDistance));
    } else if (e.touches.length === 1 && isDragging) {
      panX += e.touches[0].clientX - lastMouseX;
      panY += e.touches[0].clientY - lastMouseY;
      
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      
      updateTransform();
    }
  }, { passive: false });
  
  container.addEventListener('touchend', () => {
    isDragging = false;
  });
  
  setTimeout(fitToView, 100);
}

function setZoom(zoom: number): void {
  currentZoom = Math.max(0.05, Math.min(5, zoom));
  updateTransform();
}

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

function updateTransform(): void {
  const wrapper = document.getElementById('canvas-wrapper');
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
  const zoomDisplay = document.getElementById('zoom-level');
  
  if (!wrapper || !container || !canvas) return;
  
  const containerRect = container.getBoundingClientRect();
  
  const scaledWidth = canvas.width * currentZoom;
  const scaledHeight = canvas.height * currentZoom;
  
  const left = (containerRect.width - scaledWidth) / 2 + panX;
  const top = (containerRect.height - scaledHeight) / 2 + panY;
  
  wrapper.style.transform = 'translate(' + left + 'px, ' + top + 'px) scale(' + currentZoom + ')';
  wrapper.style.transformOrigin = 'top left';
  
  if (zoomDisplay) {
    const percentage = Math.round(currentZoom * 100);
    if (percentage === 100) {
      zoomDisplay.textContent = '100%';
    } else if (currentZoom < 0.1) {
      zoomDisplay.textContent = (currentZoom * 100).toFixed(1) + '%';
    } else {
      zoomDisplay.textContent = percentage + '%';
    }
  }
}

function updateConfigFromInputs(): void {
  const initialRadius = document.getElementById('initial-radius') as HTMLInputElement;
  const numTurns = document.getElementById('num-turns') as HTMLInputElement;
  const lineWidth = document.getElementById('line-width') as HTMLInputElement;
  const gridSpacing = document.getElementById('grid-spacing') as HTMLInputElement;
  const showGrid = document.getElementById('show-grid') as HTMLInputElement;
  const showGuides = document.getElementById('show-guides') as HTMLInputElement;
  const dpi = document.getElementById('dpi') as HTMLSelectElement;
  
  if (initialRadius) config.initialRadius = Math.max(1, parseFloat(initialRadius.value));
  if (numTurns) config.turns = Math.max(0.5, Math.min(20, parseFloat(numTurns.value)));
  if (lineWidth) config.lineWidth = Math.max(0.5, parseFloat(lineWidth.value));
  if (gridSpacing) config.gridSpacingMM = Math.max(10, parseFloat(gridSpacing.value));
  if (showGrid) config.showGrid = showGrid.checked;
  if (showGuides) config.showGuideCircles = showGuides.checked;
  if (dpi) config.dpi = parseInt(dpi.value);
}

function updateCanvasSizeDisplay(): void {
  const display = document.getElementById('canvas-size-display');
  if (display) {
    const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement;
    if (canvas) {
      display.textContent = config.canvasSizeMM + 'mm x ' + config.canvasSizeMM + 'mm (' + canvas.width + 'x' + canvas.height + 'px at ' + config.dpi + ' DPI)';
    }
  }
}

document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
  init();
}
