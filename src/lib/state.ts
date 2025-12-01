/**
 * @fileoverview Application state management for the spiral generator.
 * 
 * This module implements a simple reactive state system using
 * a publish-subscribe pattern. All UI updates flow through this
 * centralized state management.
 */

import type { SpiralConfig } from './config';
import { DEFAULT_CONFIG, DPI_OPTIONS } from './config';
import type { DrawResult } from './renderer';

/**
 * Current application state.
 */
export interface AppState {
  /** Spiral configuration */
  config: SpiralConfig;
  /** Result from the last render */
  drawResult: DrawResult | null;
  /** Current zoom level (1.0 = 100%) */
  zoom: number;
  /** Pan offset X in pixels */
  panX: number;
  /** Pan offset Y in pixels */
  panY: number;
  /** Whether currently dragging */
  isDragging: boolean;
  /** UI panel collapsed state */
  isConfigCollapsed: boolean;
}

/**
 * Listener function type for state changes.
 */
type StateListener = (state: AppState) => void;

/**
 * State manager with reactive updates.
 */
class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();
  
  constructor() {
    this.state = {
      config: { ...DEFAULT_CONFIG },
      drawResult: null,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      isDragging: false,
      isConfigCollapsed: false
    };
    
    // Try to load saved state from localStorage
    this.loadFromStorage();
  }
  
  /**
   * Get current state (readonly).
   */
  getState(): Readonly<AppState> {
    return this.state;
  }
  
  /**
   * Get current config.
   */
  getConfig(): Readonly<SpiralConfig> {
    return this.state.config;
  }
  
  /**
   * Update configuration partially.
   */
  updateConfig(partial: Partial<SpiralConfig>): void {
    this.state = {
      ...this.state,
      config: { ...this.state.config, ...partial }
    };
    this.saveToStorage();
    this.notify();
  }
  
  /**
   * Reset configuration to defaults.
   */
  resetConfig(): void {
    this.state = {
      ...this.state,
      config: { ...DEFAULT_CONFIG },
      zoom: 1.0,
      panX: 0,
      panY: 0
    };
    this.saveToStorage();
    this.notify();
  }
  
  /**
   * Set the draw result.
   */
  setDrawResult(result: DrawResult): void {
    this.state = { ...this.state, drawResult: result };
    this.notify();
  }
  
  /**
   * Update zoom level.
   */
  setZoom(zoom: number): void {
    // Clamp zoom between 10% and 500%
    const clampedZoom = Math.max(0.1, Math.min(5.0, zoom));
    this.state = { ...this.state, zoom: clampedZoom };
    this.notify();
  }
  
  /**
   * Update pan offset.
   */
  setPan(x: number, y: number): void {
    this.state = { ...this.state, panX: x, panY: y };
    this.notify();
  }
  
  /**
   * Reset view (zoom and pan).
   */
  resetView(): void {
    this.state = { ...this.state, zoom: 1.0, panX: 0, panY: 0 };
    this.notify();
  }
  
  /**
   * Set dragging state.
   */
  setDragging(isDragging: boolean): void {
    this.state = { ...this.state, isDragging };
    // Don't notify on drag state change to avoid re-renders
  }
  
  /**
   * Toggle config panel collapsed state.
   */
  toggleConfigCollapsed(): void {
    this.state = { 
      ...this.state, 
      isConfigCollapsed: !this.state.isConfigCollapsed 
    };
    this.saveToStorage();
    this.notify();
  }
  
  /**
   * Subscribe to state changes.
   * @returns Unsubscribe function
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);
    
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners of state change.
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
  
  /**
   * Save state to localStorage.
   */
  private saveToStorage(): void {
    try {
      const toSave = {
        config: this.state.config,
        isConfigCollapsed: this.state.isConfigCollapsed
      };
      localStorage.setItem('spiral-generator-state', JSON.stringify(toSave));
    } catch {
      // localStorage might be unavailable
    }
  }
  
  /**
   * Load state from localStorage.
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('spiral-generator-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Validate DPI value
        if (parsed.config?.dpi && !DPI_OPTIONS.some(opt => opt.value === parsed.config.dpi)) {
          parsed.config.dpi = DEFAULT_CONFIG.dpi;
        }
        
        this.state = {
          ...this.state,
          config: { ...DEFAULT_CONFIG, ...parsed.config },
          isConfigCollapsed: parsed.isConfigCollapsed ?? false
        };
      }
    } catch {
      // Invalid stored data, use defaults
    }
  }
}

/**
 * Global state manager singleton.
 */
export const state = new StateManager();
