/**
 * @fileoverview Main entry point for the Golden Ratio Spiral Generator.
 * 
 * This application generates printable spiral templates based on the
 * golden ratio (phi = 1.6180339887). The spiral follows the formula:
 *   r(theta) = a * e^(b*theta)
 * where b = ln(phi) / (2*pi), meaning the radius multiplies by phi every full turn.
 * 
 * @version 2.0.0
 */

import './style.css';

// Import components
import { setupEventHandlers, setupStateSubscriptions } from './components/handlers';
import { injectStyles } from './components/styles';
import { createAppTemplate, updateFormFromConfig, updateStatsDisplay } from './components/template';

// Import core modules
import { drawSpiral } from './lib/renderer';
import { state } from './lib/state';

/**
 * Initialize the application.
 * 
 * This function:
 * 1. Injects CSS styles
 * 2. Creates the HTML structure
 * 3. Sets up event handlers
 * 4. Performs initial render
 */
function initApp(): void {
  // Inject application styles
  injectStyles();
  
  // Create the HTML structure
  const appRoot = document.getElementById('app');
  if (!appRoot) {
    throw new Error('Could not find #app element');
  }
  
  appRoot.innerHTML = createAppTemplate();
  
  // Initialize form with current config
  updateFormFromConfig(state.getConfig());
  
  // Setup event handlers
  setupEventHandlers(redraw);
  setupStateSubscriptions(redraw);
  
  // Initial draw
  redraw();
  
  console.log('Golden Ratio Spiral Generator initialized');
  console.log('phi =', 1.6180339887);
}

/**
 * Redraw the spiral with current configuration.
 * 
 * This is called whenever the configuration changes.
 */
function redraw(): void {
  const canvas = document.getElementById('spiral-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  try {
    const config = state.getConfig();
    const result = drawSpiral(canvas, config);
    
    // Update state with result
    state.setDrawResult(result);
    
    // Update stats display
    updateStatsDisplay(
      result.pathLength, 
      result.finalRadius, 
      result.initialRadius,
      config.paperWidth,
      config.paperHeight
    );
    
  } catch (error) {
    console.error('Error drawing spiral:', error);
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
