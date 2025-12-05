/**
 * @fileoverview UI template and layout components.
 * 
 * This module contains all HTML template generation. Text labels are
 * used instead of emojis to avoid encoding issues.
 * 
 * Layout structure:
 * - Header with title and export buttons
 * - Main area with canvas and overlay controls
 * - Config panel on the side
 * - Footer with stats
 */

import type { SpiralConfig } from '../lib/config';
import { DPI_OPTIONS, PAPER_SIZES } from '../lib/config';

/**
 * Create the main application HTML structure.
 * 
 * @returns HTML string for the app layout
 */
export function createAppTemplate(): string {
  return `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <h1 class="app-title">
          <span class="title-icon">&#8734;</span>
          Golden Ratio Spiral Generator
        </h1>
        <div class="header-actions">
          <button id="btn-png" class="btn btn-primary" title="Download as PNG">
            <span class="btn-icon">&#8595;</span> PNG
          </button>
          <button id="btn-svg" class="btn btn-success" title="Download as SVG">
            <span class="btn-icon">&#8595;</span> SVG
          </button>
          <button id="btn-print" class="btn btn-purple" title="Print spiral">
            <span class="btn-icon">&#9113;</span> Print
          </button>
        </div>
      </header>
      
      <!-- Main content -->
      <main class="app-main">
        <!-- Canvas area -->
        <div class="canvas-wrapper" id="canvas-wrapper">
          <canvas id="spiral-canvas"></canvas>
          
          <!-- Zoom controls overlay -->
          <div class="zoom-controls">
            <button id="btn-zoom-in" class="zoom-btn" title="Zoom in (Ctrl++)">+</button>
            <span id="zoom-level" class="zoom-level">100%</span>
            <button id="btn-zoom-out" class="zoom-btn" title="Zoom out (Ctrl+-)">-</button>
            <button id="btn-zoom-reset" class="zoom-btn" title="Reset view (Ctrl+0)">&#8634;</button>
          </div>
        </div>
        
        <!-- Config panel -->
        <aside class="config-panel" id="config-panel">
          <div class="panel-header">
            <h2>
              <span class="panel-icon">&#9881;</span>
              Settings
            </h2>
            <button id="btn-toggle-panel" class="btn-icon-only" title="Toggle panel">
              &#10095;
            </button>
          </div>
          
          <div class="panel-content" id="panel-content">
            ${createConfigForm()}
            
            <!-- Stats display -->
            <div class="stats-section">
              <h3>Calculated Values</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Path Length</span>
                  <span class="stat-value" id="stat-path-length">--</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Radius (start → end)</span>
                  <span class="stat-value" id="stat-final-radius">--</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Paper Size</span>
                  <span class="stat-value" id="stat-canvas-size">--</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="panel-actions">
              <button id="btn-reset" class="btn btn-text">
                Reset to Defaults
              </button>
            </div>
          </div>
        </aside>
      </main>
      
      <!-- Footer -->
      <footer class="app-footer">
        <span>Golden Ratio (phi) = 1.6180339887...</span>
        <span class="separator">|</span>
        <span>Formula: r(theta) = a * e^(b*theta)</span>
      </footer>
    </div>
  `;
}

/**
 * Create the configuration form HTML.
 */
function createConfigForm(): string {
  const dpiOptions = DPI_OPTIONS.map(opt => 
    `<option value="${opt.value}">${opt.label}</option>`
  ).join('');
  
  const paperOptions = Object.entries(PAPER_SIZES).map(([key, size]) => 
    `<option value="${key}">${size.name}</option>`
  ).join('');
  
  return `
    <form class="config-form" id="config-form">
      <!-- Paper Size -->
      <div class="form-group">
        <label for="paper-size">
          Paper Size
          <span class="help-icon" title="Select paper size for the spiral template">?</span>
        </label>
        <select id="paper-size" name="paperSize">
          ${paperOptions}
        </select>
      </div>
      
      <!-- Custom Paper Dimensions (shown when Custom is selected) -->
      <div class="form-group custom-paper-group" id="custom-paper-group" style="display: none;">
        <label>Custom Dimensions (mm)</label>
        <div class="dimension-inputs">
          <input 
            type="number" 
            id="paper-width" 
            name="paperWidth"
            min="50" 
            max="3000" 
            step="1"
            value="1000"
            placeholder="Width"
          >
          <span class="dimension-separator">&#215;</span>
          <input 
            type="number" 
            id="paper-height" 
            name="paperHeight"
            min="50" 
            max="3000" 
            step="1"
            value="1000"
            placeholder="Height"
          >
        </div>
      </div>
      
      <!-- Number of Turns -->
      <div class="form-group">
        <label for="turns">
          Number of Turns
          <span class="help-icon" title="How many complete rotations the spiral makes">?</span>
        </label>
        <input 
          type="number" 
          id="turns" 
          name="turns"
          min="1" 
          max="20" 
          step="0.5"
          value="7"
        >
      </div>
      
      <!-- Line Width -->
      <div class="form-group">
        <label for="line-width">
          Line Width (mm)
          <span class="help-icon" title="Thickness of the spiral line">?</span>
        </label>
        <input 
          type="number" 
          id="line-width" 
          name="lineWidth"
          min="0.5" 
          max="10" 
          step="0.5"
          value="2"
        >
      </div>
      
      <!-- DPI -->
      <div class="form-group">
        <label for="dpi">
          Export Resolution (DPI)
          <span class="help-icon" title="Higher DPI = better print quality but larger file">?</span>
        </label>
        <select id="dpi" name="dpi">
          ${dpiOptions}
        </select>
      </div>
      
      <!-- Grid Spacing -->
      <div class="form-group">
        <label for="grid-spacing">
          Grid Spacing (mm)
          <span class="help-icon" title="Distance between grid lines for print alignment">?</span>
        </label>
        <input 
          type="number" 
          id="grid-spacing" 
          name="gridSpacingMM"
          min="5" 
          max="100" 
          step="5"
          value="10"
        >
      </div>
      
      <!-- Toggles -->
      <div class="form-group form-toggle">
        <label class="toggle-label">
          <input type="checkbox" id="show-rectangles" name="showGoldenRectangles" checked>
          <span class="toggle-slider"></span>
          Golden Rectangles
        </label>
      </div>
      
      <div class="form-group form-toggle">
        <label class="toggle-label">
          <input type="checkbox" id="show-radial" name="showRadialLines" checked>
          <span class="toggle-slider"></span>
          Radial Lines
        </label>
      </div>
      
      <div class="form-group form-toggle">
        <label class="toggle-label">
          <input type="checkbox" id="show-guides" name="showGuideCircles" checked>
          <span class="toggle-slider"></span>
          Guide Circles
        </label>
      </div>
      
      <div class="form-group form-toggle">
        <label class="toggle-label">
          <input type="checkbox" id="show-grid" name="showGrid">
          <span class="toggle-slider"></span>
          Print Grid
        </label>
      </div>
    </form>
  `;
}

/**
 * Update the stats display with new values.
 */
export function updateStatsDisplay(
  pathLength: number,
  finalRadius: number,
  initialRadius: number,
  paperWidth: number,
  paperHeight: number
): void {
  const pathEl = document.getElementById('stat-path-length');
  const radiusEl = document.getElementById('stat-final-radius');
  const canvasEl = document.getElementById('stat-canvas-size');
  
  if (pathEl) {
    const meters = (pathLength / 1000).toFixed(3);
    pathEl.textContent = `${pathLength.toFixed(1)} mm (${meters} m)`;
  }
  
  if (radiusEl) {
    radiusEl.textContent = `${initialRadius.toFixed(2)} → ${finalRadius.toFixed(2)} mm`;
  }
  
  if (canvasEl) {
    canvasEl.textContent = `${paperWidth.toFixed(0)} × ${paperHeight.toFixed(0)} mm`;
  }
}

/**
 * Update zoom level display.
 */
export function updateZoomDisplay(zoom: number): void {
  const el = document.getElementById('zoom-level');
  if (el) {
    el.textContent = `${Math.round(zoom * 100)}%`;
  }
}

/**
 * Update form inputs to match config.
 */
export function updateFormFromConfig(config: SpiralConfig): void {
  const form = document.getElementById('config-form') as HTMLFormElement | null;
  if (!form) return;
  
  // Update paper size select
  const paperSizeSelect = form.elements.namedItem('paperSize') as HTMLSelectElement | null;
  if (paperSizeSelect) {
    paperSizeSelect.value = config.paperSize;
  }
  
  // Update custom dimensions
  const paperWidth = form.elements.namedItem('paperWidth') as HTMLInputElement | null;
  const paperHeight = form.elements.namedItem('paperHeight') as HTMLInputElement | null;
  if (paperWidth) paperWidth.value = String(config.paperWidth);
  if (paperHeight) paperHeight.value = String(config.paperHeight);
  
  // Show/hide custom paper group
  const customGroup = document.getElementById('custom-paper-group');
  if (customGroup) {
    customGroup.style.display = config.paperSize === 'custom' ? 'block' : 'none';
  }
  
  // Update numeric inputs
  const fields = ['turns', 'lineWidth', 'dpi', 'gridSpacingMM'] as const;
  
  for (const field of fields) {
    const input = form.elements.namedItem(field) as HTMLInputElement | HTMLSelectElement | null;
    if (input) {
      input.value = String(config[field]);
    }
  }
  
  // Update checkboxes
  const showGrid = form.elements.namedItem('showGrid') as HTMLInputElement | null;
  const showGuides = form.elements.namedItem('showGuideCircles') as HTMLInputElement | null;
  const showRectangles = form.elements.namedItem('showGoldenRectangles') as HTMLInputElement | null;
  const showRadial = form.elements.namedItem('showRadialLines') as HTMLInputElement | null;
  
  if (showGrid) showGrid.checked = config.showGrid;
  if (showGuides) showGuides.checked = config.showGuideCircles;
  if (showRectangles) showRectangles.checked = config.showGoldenRectangles;
  if (showRadial) showRadial.checked = config.showRadialLines;
}

/**
 * Set panel collapsed state.
 */
export function setPanelCollapsed(collapsed: boolean): void {
  const panel = document.getElementById('config-panel');
  const button = document.getElementById('btn-toggle-panel');
  
  if (panel) {
    panel.classList.toggle('collapsed', collapsed);
  }
  
  if (button) {
    button.innerHTML = collapsed ? '&#10094;' : '&#10095;';
  }
}
