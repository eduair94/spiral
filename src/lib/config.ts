/**
 * @fileoverview Configuration types and defaults for the spiral generator.
 * 
 * This module defines the TypeScript interfaces for spiral configuration
 * and provides sensible default values for all parameters.
 */

/**
 * Standard paper size definition.
 */
export interface PaperSize {
  /** Display name */
  name: string;
  /** Width in millimeters */
  width: number;
  /** Height in millimeters */
  height: number;
}

/**
 * Available paper size presets.
 * Sizes are in millimeters.
 */
export const PAPER_SIZES: Record<string, PaperSize> = {
  'A4': { name: 'A4 (297 x 210 mm)', width: 297, height: 210 },
  'A4_portrait': { name: 'A4 Portrait (210 x 297 mm)', width: 210, height: 297 },
  'A3': { name: 'A3 (420 x 297 mm)', width: 420, height: 297 },
  'A3_portrait': { name: 'A3 Portrait (297 x 420 mm)', width: 297, height: 420 },
  'A2': { name: 'A2 (594 x 420 mm)', width: 594, height: 420 },
  'A1': { name: 'A1 (841 x 594 mm)', width: 841, height: 594 },
  'A0': { name: 'A0 (1189 x 841 mm)', width: 1189, height: 841 },
  'Letter': { name: 'Letter (279 x 216 mm)', width: 279, height: 216 },
  'Legal': { name: 'Legal (356 x 216 mm)', width: 356, height: 216 },
  'Tabloid': { name: 'Tabloid (432 x 279 mm)', width: 432, height: 279 },
  'custom': { name: 'Custom', width: 400, height: 400 }
};

/**
 * Configuration options for generating a golden ratio spiral.
 */
export interface SpiralConfig {
  /** Selected paper size key */
  paperSize: string;
  
  /** Paper width in millimeters (used when paperSize is 'custom') */
  paperWidth: number;
  
  /** Paper height in millimeters (used when paperSize is 'custom') */
  paperHeight: number;
  
  /** Margin from paper edge in millimeters */
  margin: number;
  
  /** Width of the spiral line when drawn (in millimeters) */
  lineWidth: number;
  
  /** Number of complete 360° rotations */
  turns: number;
  
  /** Resolution for raster output (dots per inch) */
  dpi: number;
  
  /** Whether to display the alignment grid for printing */
  showGrid: boolean;
  
  /** Spacing between grid lines (in millimeters) */
  gridSpacingMM: number;
  
  /** Whether to display guide circles at golden ratio intervals */
  showGuideCircles: boolean;
  
  /** Whether to display nested golden rectangles */
  showGoldenRectangles: boolean;
  
  /** Whether to display radial lines from center */
  showRadialLines: boolean;
}

/**
 * Default configuration values for a new spiral.
 */
export const DEFAULT_CONFIG: SpiralConfig = {
  paperSize: 'custom',    // Custom paper size by default
  paperWidth: 1000,       // 1000mm width
  paperHeight: 1000,      // 1000mm height
  margin: 10,             // 10mm margin from edges
  lineWidth: 2,           // 2mm line width
  turns: 7,               // 7 complete rotations
  dpi: 300,               // Standard print quality
  showGrid: false,        // Hide alignment grid by default
  gridSpacingMM: 50,      // 5cm grid spacing
  showGuideCircles: true, // Show guide circles
  showGoldenRectangles: true,  // Show nested golden rectangles
  showRadialLines: true   // Show radial lines from center
};

/**
 * Available DPI options for export quality.
 */
export const DPI_OPTIONS = [
  { value: 150, label: '150 DPI (Draft)' },
  { value: 300, label: '300 DPI (Standard)' },
  { value: 600, label: '600 DPI (High Quality)' }
] as const;

/**
 * Get effective paper dimensions based on config.
 */
export function getEffectivePaperSize(config: SpiralConfig): { width: number; height: number } {
  if (config.paperSize === 'custom') {
    return { width: config.paperWidth, height: config.paperHeight };
  }
  const paper = PAPER_SIZES[config.paperSize];
  return paper ? { width: paper.width, height: paper.height } : { width: config.paperWidth, height: config.paperHeight };
}
