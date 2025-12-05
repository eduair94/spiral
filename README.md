# Golden Ratio Spiral Generator

A web application that generates printable golden ratio (Fibonacci) spiral templates. Based on Robert Edward Grant's "Golden Mean Ratio Spiral" from Code X.

![Golden Ratio Spiral](https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Fibonacci_spiral_34.svg/220px-Fibonacci_spiral_34.svg.png)

##  Live Demo

**[Try it now on GitHub Pages](https://eduair94.github.io/spiral/)**

## Mathematical Foundation

### The Golden Spiral Equation

The spiral follows the polar form equation:

$$r(\theta) = r_0 \times \varphi^{\frac{2\theta}{\pi}}$$

Where:
- $r(\theta)$ = radius at angle θ
- $r_0$ = initial radius (at θ = 0)
- $\varphi$ (phi) = the golden ratio ≈ 1.6180339887
- $\theta$ = angle in radians

This is mathematically equivalent to the logarithmic spiral:

$$r(\theta) = r_0 \times e^{b\theta}$$

Where $b = \frac{\ln(\varphi)}{\pi/2} \approx 0.3063$

### Key Property

**The radius multiplies by φ every quarter turn (90°).**

This is what makes it a TRUE Fibonacci spiral - it perfectly inscribes quarter-circle arcs within Fibonacci-sized squares arranged as nested golden rectangles.

| Quarter-turns | Multiplier | Approximate Value |
|---------------|------------|-------------------|
| 1 (90°) | φ¹ | 1.618× |
| 4 (360°) | φ⁴ | 6.854× |
| 8 (720°) | φ⁸ | 46.98× |
| 28 (7 turns) | φ²⁸ | 710,647× |

### Default Configuration

The application defaults to:
- **Paper size:** 1000mm × 1000mm (1m × 1m square)
- **Turns:** 7 complete rotations (28 quarter-turns)
- **Final radius:** ~450mm (fits within 90% of the 1m paper)

Using the formula, the initial radius is calculated as:

$$r_0 = \frac{r_{final}}{\varphi^{28}} = \frac{450mm}{710,647} \approx 0.00063mm$$

That's approximately **0.63 micrometers** - an incredibly small starting point that grows by φ every 90° to reach the final radius after 7 turns!

### Fibonacci Spiral Construction

The spiral is constructed using the classic Fibonacci method:
1. Start with two 1×1 squares
2. Add a 2×2 square adjacent to them (forming a 2×3 rectangle)
3. Add a 3×3 square (forming a 3×5 rectangle)
4. Continue with 5×5, 8×8, 13×13, 21×21, 34×34, 55×55...
5. Draw quarter-circle arcs in each square

The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...) converges to the golden ratio:

$$\lim_{n \to \infty} \frac{F_{n+1}}{F_n} = \varphi$$

## Features

-  **Configurable paper sizes** - From A4 to custom sizes up to 2m
-  **Adjustable turns** - 1 to 20+ complete rotations
-  **Show/hide golden rectangles** - Visualize the Fibonacci construction
- ️ **Print-ready export** - PNG, SVG, and direct print
-  **Zoom & pan** - Navigate large spirals with ease
- ↻ **Rotate view** - View the spiral from any angle
-  **Auto-save settings** - Your configuration persists in localStorage

## Usage

### Installation

```bash
git clone https://github.com/eduair94/spiral.git
cd spiral
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploying to GitHub Pages

The project automatically deploys to GitHub Pages when pushing to the `master` branch via GitHub Actions.

## Project Structure

```
src/
├── main.ts              # Application entry point
├── style.css            # Global styles
├── components/
│   ├── handlers.ts      # Event handlers
│   ├── styles.ts        # Component styles
│   └── template.ts      # HTML templates
└── lib/
    ├── config.ts        # Configuration types & defaults
    ├── constants.ts     # Mathematical constants (φ, b, etc.)
    ├── export.ts        # PNG/SVG/print export
    ├── math.ts          # Spiral calculations
    ├── renderer.ts      # Canvas rendering
    ├── state.ts         # Application state management
    └── zoom.ts          # Zoom & pan controls
```

## Technical Details

### Technologies

- **Vite** - Build tool & dev server
- **TypeScript** - Type-safe JavaScript
- **Canvas API** - High-performance 2D rendering
- **Tailwind CSS** - Utility-first styling

### Rendering Approach

The spiral is rendered using the TRUE Fibonacci method:
1. Generate Fibonacci sequence for the required number of quarter-turns
2. Place squares according to the golden rectangle construction
3. Draw quarter-circle arcs inscribed in each square
4. Arc centers are at corners of squares, sweeping 90° each

This produces a mathematically accurate golden spiral that perfectly matches the nested golden rectangle construction.

## License

MIT License - feel free to use this for any purpose.

## Acknowledgments

- Mathematical foundation based on Robert Edward Grant's research
- Inspired by the beauty of φ in nature and art
