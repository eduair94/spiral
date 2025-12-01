/**
 * @fileoverview Export functions for the spiral generator.
 * 
 * This module handles all export operations including:
 * - PNG download with customizable DPI
 * - SVG download with millimeter units
 * - Print functionality with size verification
 */

import type { SpiralConfig } from './config';
import { drawSpiral } from './renderer';

/**
 * Download the spiral as a PNG image.
 * 
 * Creates a new canvas with the configured DPI, renders the spiral,
 * and triggers a browser download with a descriptive filename.
 * 
 * @param config - Spiral configuration
 * @returns The draw result with path information
 */
export function downloadPNG(config: SpiralConfig) {
  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  const result = drawSpiral(canvas, config);
  
  // Generate filename
  const filename = generateFilename(config, result.pathLength, 'png');
  
  // Trigger download
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
  
  return result;
}

/**
 * Download the spiral as an SVG file.
 * 
 * Generates a vector SVG with millimeter units, perfect for
 * CAD software and CNC machines.
 * 
 * @param config - Spiral configuration
 */
export function downloadSVG(config: SpiralConfig) {
  import('./math').then(({ 
    generateSpiralPoints,
    calculateSpiralFromPaper,
    calculateArcLength
  }) => {
    const { initialRadius, finalRadius, maxTheta } = calculateSpiralFromPaper(
      config.paperWidth,
      config.paperHeight,
      config.turns
    );
    const pathLength = calculateArcLength(initialRadius, maxTheta);
    
    const points = generateSpiralPoints(initialRadius, maxTheta);
    const centerX = config.paperWidth / 2;
    const centerY = config.paperHeight / 2;
    
    // Build SVG path
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const x = (centerX + points[i].x).toFixed(4);
      const y = (centerY + points[i].y).toFixed(4);
      pathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    
    // Create SVG document
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${config.paperWidth}mm" 
     height="${config.paperHeight}mm"
     viewBox="0 0 ${config.paperWidth} ${config.paperHeight}">
  <title>Golden Ratio Spiral - ${pathLength.toFixed(1)}mm path</title>
  <desc>
    Paper size: ${config.paperWidth}x${config.paperHeight}mm
    Initial radius: ${initialRadius.toFixed(2)}mm
    Turns: ${config.turns}
    Final radius: ${finalRadius.toFixed(2)}mm
    Path length: ${pathLength.toFixed(2)}mm
    Golden ratio (phi): 1.6180339887
  </desc>
  
  <!-- Center mark -->
  <circle cx="${centerX}" cy="${centerY}" r="2" fill="black"/>
  <text x="${centerX}" y="${centerY + 4}" 
        font-family="Arial" font-size="6" text-anchor="middle">O</text>
  
  <!-- Spiral path -->
  <path d="${pathData}"
        fill="none"
        stroke="black"
        stroke-width="${config.lineWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>`;

    // Trigger download
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = generateFilename(config, pathLength, 'svg');
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Print the spiral with size verification dialog.
 * 
 * This function:
 * 1. Creates a high-resolution print canvas
 * 2. Opens a new window with print instructions
 * 3. Includes a measurement calibration line
 * 
 * @param config - Spiral configuration
 */
export function printSpiral(config: SpiralConfig) {
  import('./math').then(({ 
    calculateSpiralFromPaper,
    calculateArcLength
  }) => {
    const { initialRadius, finalRadius, maxTheta } = calculateSpiralFromPaper(
      config.paperWidth,
      config.paperHeight,
      config.turns
    );
    const pathLength = calculateArcLength(initialRadius, maxTheta);
    
    // Create print canvas with high DPI
    const canvas = document.createElement('canvas');
    const printConfig = { ...config, dpi: 300 };
    drawSpiral(canvas, printConfig);
    
    // Calculate print dimensions
    const widthInches = config.paperWidth / 25.4;
    const heightInches = config.paperHeight / 25.4;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the spiral');
      return;
    }
    
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Print Golden Ratio Spiral</title>
  <style>
    @page {
      size: ${widthInches}in ${heightInches}in;
      margin: 0;
    }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .print-container { 
        width: ${widthInches}in; 
        height: ${heightInches}in;
        page-break-after: avoid;
      }
      img { 
        width: 100%; 
        height: 100%; 
        object-fit: contain;
      }
    }
    @media screen {
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f0f0f0;
        margin: 0;
        padding: 20px;
      }
      .no-print {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h2 { margin-top: 0; color: #333; }
      .warning { 
        background: #fff3cd; 
        border-left: 4px solid #ffc107;
        padding: 12px;
        margin: 15px 0;
      }
      button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 24px;
        font-size: 16px;
        border-radius: 6px;
        cursor: pointer;
      }
      button:hover { background: #1d4ed8; }
      .specs { 
        font-family: monospace; 
        background: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
      }
      .print-container { 
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
      img { 
        max-width: 100%;
        max-height: 80vh;
        border: 1px solid #ddd;
        background: white;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <h2>Print Settings</h2>
    <div class="specs">
      <p><strong>Paper size:</strong> ${config.paperWidth.toFixed(0)} x ${config.paperHeight.toFixed(0)} mm</p>
      <p><strong>Path length:</strong> ${pathLength.toFixed(1)} mm (${(pathLength / 1000).toFixed(3)} m)</p>
      <p><strong>Radius:</strong> ${initialRadius.toFixed(2)} → ${finalRadius.toFixed(2)} mm</p>
      <p><strong>Turns:</strong> ${config.turns}</p>
    </div>
    <div class="warning">
      <strong>Important:</strong> In your print dialog:
      <ul style="margin: 8px 0 0 0;">
        <li>Set scale to <strong>100%</strong> (not "Fit to page")</li>
        <li>Paper size should be at least ${config.paperWidth.toFixed(0)} x ${config.paperHeight.toFixed(0)} mm</li>
        <li>Disable headers and footers</li>
        <li>Use "Actual size" if available</li>
      </ul>
    </div>
    <button onclick="window.print()">Print Now</button>
  </div>
  <div class="print-container">
    <img src="${canvas.toDataURL('image/png', 1.0)}" alt="Golden Ratio Spiral">
  </div>
</body>
</html>
    `);
    printWindow.document.close();
  });
}

/**
 * Generate a descriptive filename for exports.
 */
function generateFilename(config: SpiralConfig, pathLength: number, extension: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const pathMeters = (pathLength / 1000).toFixed(2).replace('.', '_');
  return `golden-spiral_${config.paperSize}_${config.turns}turns_${pathMeters}m_${date}.${extension}`;
}
