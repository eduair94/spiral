/**
 * @fileoverview Event handlers for UI interactions.
 * 
 * This module connects UI elements to state changes and actions.
 * It handles form input changes, button clicks, and other user interactions.
 */

import { PAPER_SIZES } from '../lib/config';
import { downloadPNG, downloadSVG, printSpiral } from '../lib/export';
import { state } from '../lib/state';
import { resetView, setupZoomPan, zoomIn, zoomOut } from '../lib/zoom';
import { setPanelCollapsed, updateFormFromConfig, updateStatsDisplay, updateZoomDisplay } from './template';

/**
 * Setup all event handlers for the application.
 * 
 * @param redrawFn - Function to call when the spiral needs to be redrawn
 */
export function setupEventHandlers(redrawFn: () => void): void {
  setupFormHandlers(redrawFn);
  setupButtonHandlers();
  setupZoomHandlers();
}

/**
 * Handle form input changes.
 */
function setupFormHandlers(redrawFn: () => void): void {
  const form = document.getElementById('config-form');
  if (!form) return;
  
  // Handle paper size select change
  const paperSizeSelect = document.getElementById('paper-size') as HTMLSelectElement | null;
  if (paperSizeSelect) {
    paperSizeSelect.addEventListener('change', () => {
      const selectedKey = paperSizeSelect.value;
      const paperSize = PAPER_SIZES[selectedKey];
      
      // Show/hide custom dimensions group
      const customGroup = document.getElementById('custom-paper-group');
      if (customGroup) {
        customGroup.style.display = selectedKey === 'custom' ? 'block' : 'none';
      }
      
      if (paperSize) {
        state.updateConfig({
          paperSize: selectedKey,
          paperWidth: paperSize.width,
          paperHeight: paperSize.height
        });
        
        // Update custom dimension inputs to reflect selected size
        const widthInput = document.getElementById('paper-width') as HTMLInputElement | null;
        const heightInput = document.getElementById('paper-height') as HTMLInputElement | null;
        if (widthInput) widthInput.value = String(paperSize.width);
        if (heightInput) heightInput.value = String(paperSize.height);
        
        redrawFn();
      }
    });
  }
  
  // Handle all input changes
  form.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const name = target.name;
    
    if (!name || name === 'paperSize') return; // paperSize handled separately
    
    let value: string | number | boolean;
    
    if (target.type === 'checkbox') {
      value = (target as HTMLInputElement).checked;
    } else if (target.type === 'number') {
      value = parseFloat(target.value) || 0;
    } else {
      value = parseInt(target.value) || 0;
    }
    
    // Update state with the changed value
    state.updateConfig({ [name]: value });
    
    // Redraw the spiral
    redrawFn();
  });
}

/**
 * Handle button clicks.
 */
function setupButtonHandlers(): void {
  // Export buttons
  document.getElementById('btn-png')?.addEventListener('click', () => {
    downloadPNG(state.getConfig());
  });
  
  document.getElementById('btn-svg')?.addEventListener('click', () => {
    downloadSVG(state.getConfig());
  });
  
  document.getElementById('btn-print')?.addEventListener('click', () => {
    printSpiral(state.getConfig());
  });
  
  // Reset button
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    state.resetConfig();
    updateFormFromConfig(state.getConfig());
    // Redraw will happen via state subscription
  });
  
  // Panel toggle
  document.getElementById('btn-toggle-panel')?.addEventListener('click', () => {
    state.toggleConfigCollapsed();
  });
}

/**
 * Setup zoom control button handlers.
 */
function setupZoomHandlers(): void {
  document.getElementById('btn-zoom-in')?.addEventListener('click', zoomIn);
  document.getElementById('btn-zoom-out')?.addEventListener('click', zoomOut);
  document.getElementById('btn-zoom-reset')?.addEventListener('click', resetView);
  document.getElementById('btn-rotate')?.addEventListener('click', () => {
    state.rotate();
  });
  
  // Setup canvas zoom/pan
  const wrapper = document.getElementById('canvas-wrapper');
  if (wrapper) {
    setupZoomPan(wrapper);
  }
}

/**
 * Subscribe to state changes and update UI accordingly.
 */
export function setupStateSubscriptions(_redrawFn: () => void): void {
  state.subscribe((appState) => {
    // Update zoom display
    updateZoomDisplay(appState.zoom);
    
    // Update canvas transform for zoom/pan/rotation
    const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      canvas.style.transform = `scale(${appState.zoom}) translate(${appState.panX / appState.zoom}px, ${appState.panY / appState.zoom}px) rotate(${appState.rotation}deg)`;
    }
    
    // Update panel collapsed state
    setPanelCollapsed(appState.isConfigCollapsed);
    
    // Update stats if available
    if (appState.drawResult) {
      updateStatsDisplay(
        appState.drawResult.pathLength,
        appState.drawResult.finalRadius,
        appState.drawResult.initialRadius,
        appState.config.paperWidth,
        appState.config.paperHeight
      );
    }
  });
}