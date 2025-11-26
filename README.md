# ÌºÄ Golden Ratio Spiral Generator

A precision SPA for generating printable golden ratio spiral templates, specifically designed for creating 3.33-meter copper wire implosion coils.

![Golden Spiral Preview](https://img.shields.io/badge/œÜ-1.6180339887-gold)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## ÌæØ Features

- **Mathematically Precise**: Golden spiral with œÜ = 1.6180339887 growth factor per 360¬∞ turn
- **Customizable Parameters**: Adjust initial radius, path length, line width, and DPI
- **Print-Ready Output**: Export as PNG or SVG at 1:1 scale for direct printing
- **Guide Circles**: Faint concentric circles at œÜ intervals with 90¬∞ marker dots
- **Real-time Preview**: Interactive canvas with calculated values display
- **Responsive UI**: Modern dark theme with Tailwind CSS

## Ì≥ê Default Specifications

| Property | Value |
|----------|-------|
| Golden Ratio (œÜ) | 1.6180339887 |
| Initial Radius | 15 mm |
| Total Path Length | 3.33 meters (3330 mm) |
| Line Width | 2 mm |
| Final Radius | ~25.3 cm |
| Total Diameter | ~50.6 cm |
| Turns | 7.5 (7 full + half of 8th) |
| Start Position | 3 o'clock (pointing right) |
| Direction | Clockwise when viewed from above |

## Ì∫Ä Live Demo

Visit the live application: **[https://eduair94.github.io/spiral/](https://eduair94.github.io/spiral/)**

## Ìª†Ô∏è Installation

```bash
# Clone the repository
git clone https://github.com/eduair94/spiral.git
cd spiral

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Ì≥ñ Usage

1. **Configure**: Adjust parameters in the left panel (initial radius, path length, line width, DPI)
2. **Regenerate**: Click "Regenerate Spiral" to update the preview
3. **Export**: 
   - **Print**: Opens print dialog with 1:1 scale
   - **PNG**: Downloads high-resolution raster image
   - **SVG**: Downloads vector file (recommended for large-format printing)

## Ì∂®Ô∏è Printing Instructions

1. Download the **SVG file** for best quality at large sizes
2. Open in a vector editor (Inkscape, Illustrator) or print directly
3. Set paper size to at least **55cm √ó 55cm**
4. Ensure **"Scale: 100%"** or **"Actual Size"** is selected
5. Verify the center dot measures approximately 4mm diameter
6. The spiral line should be exactly 2mm wide
7. Trace the 3.33m copper wire directly on the black line

## Ì≥Å Project Structure

```
spiral/
‚îú‚îÄ‚îÄ src/
‚îÇ   ‚îú‚îÄ‚îÄ main.ts          # Main application logic & spiral mathematics
‚îÇ   ‚îî‚îÄ‚îÄ style.css        # Tailwind CSS imports & print styles
‚îú‚îÄ‚îÄ index.html           # Entry HTML file
‚îú‚îÄ‚îÄ vite.config.ts       # Vite configuration with Tailwind & GitHub Pages
‚îú‚îÄ‚îÄ package.json         # Project dependencies
‚îú‚îÄ‚îÄ tsconfig.json        # TypeScript configuration
‚îî‚îÄ‚îÄ .github/
    ‚îî‚îÄ‚îÄ workflows/
        ‚îî‚îÄ‚îÄ deploy.yml   # GitHub Actions deployment workflow
```

## Ì∑Æ Mathematical Foundation

### Golden Spiral Equation

The golden spiral follows the polar equation:

$$r(\theta) = a \cdot \varphi^{\theta / 2\pi}$$

Where:
- $r$ = radius at angle Œ∏
- $a$ = initial radius (15 mm)
- $\varphi$ = golden ratio (1.6180339887)
- $\theta$ = angle in radians

### Arc Length Calculation

The arc length is computed using numerical integration:

$$L = \int_0^{\theta_{max}} \sqrt{r^2 + \left(\frac{dr}{d\theta}\right)^2} \, d\theta$$

For a golden spiral:

$$\frac{dr}{d\theta} = \frac{r \cdot \ln(\varphi)}{2\pi}$$

## Ìæ® Prompt Used

This application was created based on the following specification:

> Top-down photograph of a perfect golden ratio implosion coil template printed on a large white sheet of paper on the floor, precisely calibrated so the total length of the spiral path is exactly 3.33 meters when traced with a single continuous wire.
>
> **Specifications:**
> - Center point: small black dot with letter "O"
> - The spiral is a perfectly smooth, solid black line exactly 2 mm wide (representing 1.5‚Äì2 mm bare copper wire) along its entire 3.33-meter length
> - Mathematically accurate golden spiral (growth factor œÜ = 1.6180339887 per 360¬∞ turn)
> - Starts with initial radius 15 mm (first small loop)
> - Begins pointing exactly to the right of the center dot (3 o'clock position) and curves clockwise when viewed from above
> - Completes exactly 7 full turns + half of the 8th turn
> - Final radius ‚âà 25.3 cm, total diameter ‚âà 50.6 cm
> - Very faint light-gray concentric guide circles at exact radii: 1.5 cm, 2.4 cm, 3.9 cm, 6.3 cm, 10.2 cm, 16.5 cm, 26.7 cm, and final radius 25.3 cm
> - Tiny black dots every 90¬∞ on each guide circle
> - The 2 mm black line is perfectly centered on the true golden spiral trajectory
> - Clean, high-contrast, realistic paper texture, soft overhead lighting, shot perfectly perpendicular from above
> - No text or labels except the center "O"
> - Ultra-precise, ready to print 1:1 and glue the 3.33 m copper wire directly on the black line

## ÔøΩÔøΩ Deploying to GitHub Pages

### Automatic Deployment

This project includes a GitHub Actions workflow for automatic deployment:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy to GitHub Pages
3. Enable GitHub Pages in your repository settings:
   - Go to **Settings** ‚Üí **Pages**
   - Source: **GitHub Actions**

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains the static files
# Upload to any static hosting service
```

### Configuration

Update the `base` path in `vite.config.ts` to match your repository name:

```typescript
export default defineConfig({
  base: "/your-repo-name/",
  // ...
});
```

## Ì¥ß Technologies

- **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with syntax for types
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **Canvas API** - For precise spiral rendering
- **SVG Export** - For vector-quality output

## ÔøΩÔøΩ License

MIT License - feel free to use this for your implosion coil projects!

## Ì¥ù Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**œÜ = 1.6180339887** | Golden Ratio Spiral Generator | Implosion Coil Template
