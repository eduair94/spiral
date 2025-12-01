/**
 * @fileoverview Zoom and pan controls for the canvas.
 * 
 * This module handles all zoom and pan interactions including:
 * - Mouse wheel zoom
 * - Click and drag panning
 * - Touch gestures (pinch to zoom, drag to pan)
 * - Keyboard shortcuts
 */

import { state } from './state';

// Zoom configuration
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5.0;

/**
 * Setup zoom and pan handlers on a canvas container.
 * 
 * @param container - The element that wraps the canvas
 */
export function setupZoomPan(container: HTMLElement): void {
  setupMouseHandlers(container);
  setupTouchHandlers(container);
  setupKeyboardHandlers();
}

/**
 * Setup mouse wheel zoom and drag pan.
 */
function setupMouseHandlers(container: HTMLElement): void {
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;
  
  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const currentZoom = state.getState().zoom;
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, currentZoom + delta));
    
    state.setZoom(newZoom);
  }, { passive: false });
  
  // Mouse drag pan
  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Left click only
    
    state.setDragging(true);
    container.style.cursor = 'grabbing';
    
    startX = e.clientX;
    startY = e.clientY;
    startPanX = state.getState().panX;
    startPanY = state.getState().panY;
  });
  
  document.addEventListener('mousemove', (e) => {
    const { isDragging } = state.getState();
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    state.setPan(startPanX + dx, startPanY + dy);
  });
  
  document.addEventListener('mouseup', () => {
    state.setDragging(false);
    container.style.cursor = 'grab';
  });
  
  // Initial cursor
  container.style.cursor = 'grab';
}

/**
 * Setup touch gestures for mobile devices.
 */
function setupTouchHandlers(container: HTMLElement): void {
  let lastDistance = 0;
  let lastCenterX = 0;
  let lastCenterY = 0;
  let startPanX = 0;
  let startPanY = 0;
  
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      lastDistance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      lastCenterX = center.x;
      lastCenterY = center.y;
    } else if (e.touches.length === 1) {
      // Pan start
      state.setDragging(true);
      lastCenterX = e.touches[0].clientX;
      lastCenterY = e.touches[0].clientY;
      startPanX = state.getState().panX;
      startPanY = state.getState().panY;
    }
  }, { passive: true });
  
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const scale = distance / lastDistance;
      
      const currentZoom = state.getState().zoom;
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, currentZoom * scale));
      
      state.setZoom(newZoom);
      lastDistance = distance;
    } else if (e.touches.length === 1 && state.getState().isDragging) {
      // Pan
      const dx = e.touches[0].clientX - lastCenterX;
      const dy = e.touches[0].clientY - lastCenterY;
      
      state.setPan(startPanX + dx, startPanY + dy);
    }
  }, { passive: false });
  
  container.addEventListener('touchend', () => {
    state.setDragging(false);
    lastDistance = 0;
  }, { passive: true });
}

/**
 * Setup keyboard shortcuts for zoom/pan.
 */
function setupKeyboardHandlers(): void {
  document.addEventListener('keydown', (e) => {
    const currentState = state.getState();
    
    // Check for modifier keys
    const isCtrl = e.ctrlKey || e.metaKey;
    
    switch (e.key) {
      case '+':
      case '=':
        if (isCtrl) {
          e.preventDefault();
          state.setZoom(currentState.zoom + ZOOM_STEP);
        }
        break;
        
      case '-':
        if (isCtrl) {
          e.preventDefault();
          state.setZoom(currentState.zoom - ZOOM_STEP);
        }
        break;
        
      case '0':
        if (isCtrl) {
          e.preventDefault();
          state.resetView();
        }
        break;
        
      case 'ArrowUp':
        state.setPan(currentState.panX, currentState.panY + 50);
        break;
        
      case 'ArrowDown':
        state.setPan(currentState.panX, currentState.panY - 50);
        break;
        
      case 'ArrowLeft':
        state.setPan(currentState.panX + 50, currentState.panY);
        break;
        
      case 'ArrowRight':
        state.setPan(currentState.panX - 50, currentState.panY);
        break;
    }
  });
}

/**
 * Calculate distance between two touch points.
 */
function getTouchDistance(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate center point between two touches.
 */
function getTouchCenter(touches: TouchList): { x: number; y: number } {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

/**
 * Zoom in by one step.
 */
export function zoomIn(): void {
  const currentZoom = state.getState().zoom;
  state.setZoom(currentZoom + ZOOM_STEP);
}

/**
 * Zoom out by one step.
 */
export function zoomOut(): void {
  const currentZoom = state.getState().zoom;
  state.setZoom(currentZoom - ZOOM_STEP);
}

/**
 * Reset to default zoom and pan.
 */
export function resetView(): void {
  state.resetView();
}
