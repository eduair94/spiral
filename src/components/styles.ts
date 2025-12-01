/**
 * @fileoverview Application CSS styles.
 * 
 * This module contains all the CSS styles for the spiral generator.
 * Using a JavaScript string to inject styles ensures they're bundled
 * with the application.
 */

/**
 * Get the complete application stylesheet.
 */
export function getAppStyles(): string {
  return `
/* ================================================
   CSS Variables - Design Tokens (Dark Theme)
   ================================================ */
:root {
  --color-primary: #f59e0b;
  --color-primary-hover: #d97706;
  --color-secondary: #3b82f6;
  --color-secondary-hover: #2563eb;
  --color-success: #10b981;
  --color-success-hover: #059669;
  --color-purple: #8b5cf6;
  --color-purple-hover: #7c3aed;
  --color-background: #0f172a;
  --color-background-gradient: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a);
  --color-surface: #1e293b;
  --color-surface-elevated: #334155;
  --color-border: #475569;
  --color-border-light: #334155;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-dim: #64748b;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --header-height: 60px;
  --footer-height: 40px;
  --panel-width: 320px;
  --panel-collapsed-width: 48px;
  
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}

/* ================================================
   Base & Reset
   ================================================ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-background-gradient);
  overflow: hidden;
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

input, select {
  font-family: inherit;
  font-size: inherit;
}

/* ================================================
   Layout - App Container
   ================================================ */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ================================================
   Header
   ================================================ */
.app-header {
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.title-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* ================================================
   Buttons
   ================================================ */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: #1e293b;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-secondary-hover);
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.btn-success:hover {
  background: var(--color-success-hover);
}

.btn-purple {
  background: var(--color-purple);
  color: white;
}

.btn-purple:hover {
  background: var(--color-purple-hover);
}

.btn-text {
  color: var(--color-text-muted);
  padding: var(--spacing-sm);
}

.btn-text:hover {
  color: var(--color-text);
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.btn-icon {
  font-size: 0.875rem;
}

.btn-icon-only {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.btn-icon-only:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

/* ================================================
   Main Layout
   ================================================ */
.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* ================================================
   Canvas Wrapper
   ================================================ */
.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-background);
  position: relative;
}

#spiral-canvas {
  max-width: 100%;
  max-height: 100%;
  box-shadow: var(--shadow-lg);
  background: white;
  transform-origin: center;
}

/* ================================================
   Zoom Controls
   ================================================ */
.zoom-controls {
  position: absolute;
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--color-surface-elevated);
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface);
}

.zoom-btn:hover {
  background: var(--color-surface-elevated);
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

/* ================================================
   Config Panel
   ================================================ */
.config-panel {
  width: var(--panel-width);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width var(--transition-normal);
  overflow: hidden;
}

.config-panel.collapsed {
  width: var(--panel-collapsed-width);
}

.config-panel.collapsed .panel-content,
.config-panel.collapsed .panel-header h2 span:last-child {
  display: none;
}

.panel-header {
  height: var(--header-height);
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  white-space: nowrap;
}

.panel-icon {
  font-size: 1.125rem;
  color: var(--color-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

/* ================================================
   Config Form
   ================================================ */
.config-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  background: var(--color-border);
  color: var(--color-text-muted);
  border-radius: 50%;
  cursor: help;
}

.form-group input[type="number"],
.form-group select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.form-group input[type="number"]:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
}

/* Custom paper dimensions */
.custom-paper-group {
  padding: var(--spacing-sm);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.dimension-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.dimension-inputs input {
  flex: 1;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.dimension-inputs input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
}

.dimension-separator {
  color: var(--color-text-muted);
  font-weight: 500;
}

/* Toggle switches */
.form-toggle {
  flex-direction: row;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  width: 40px;
  height: 22px;
  background: var(--color-border);
  border-radius: 11px;
  position: relative;
  transition: background var(--transition-fast);
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.toggle-label input:checked + .toggle-slider {
  background: var(--color-primary);
}

.toggle-label input:checked + .toggle-slider::after {
  transform: translateX(18px);
}

/* ================================================
   Stats Section
   ================================================ */
.stats-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.stats-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  font-family: 'SF Mono', Monaco, 'Consolas', monospace;
  font-size: 0.875rem;
  color: var(--color-primary);
}

/* ================================================
   Panel Actions
   ================================================ */
.panel-actions {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
}

/* ================================================
   Footer
   ================================================ */
.app-footer {
  height: var(--footer-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.separator {
  opacity: 0.5;
}

/* ================================================
   Responsive
   ================================================ */
@media (max-width: 768px) {
  .app-title span:not(.title-icon) {
    display: none;
  }
  
  .config-panel {
    position: absolute;
    right: 0;
    top: var(--header-height);
    bottom: var(--footer-height);
    z-index: 100;
    box-shadow: var(--shadow-lg);
  }
  
  .config-panel.collapsed {
    width: var(--panel-collapsed-width);
  }
  
  .app-footer {
    font-size: 0.75rem;
  }
  
  .app-footer .separator,
  .app-footer span:last-child {
    display: none;
  }
}
`;
}

/**
 * Inject styles into the document head.
 */
export function injectStyles(): void {
  const existingStyle = document.getElementById('spiral-app-styles');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'spiral-app-styles';
  style.textContent = getAppStyles();
  document.head.appendChild(style);
}
