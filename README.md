# Golden Ratio Spiral Generator

A web application that generates printable golden ratio (Fibonacci) spiral templates. Based on Robert Edward Grant's "Golden Mean Ratio Spiral" from Code X and Dan Winter's phase conjugate implosion research.

![Golden Ratio Spiral](https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Fibonacci_spiral_34.svg/220px-Fibonacci_spiral_34.svg.png)

## 🌐 Live Demo

**[Try it now on GitHub Pages](https://eduair94.github.io/spiral/)**

## 📐 Mathematical Foundation

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

### Default Configuration & Scaling

The application defaults to:
- **Paper size:** 1000mm × 1000mm (1m × 1m square)
- **Turns:** 7 complete rotations (28 quarter-turns)
- **θ range:** 0 to 14π radians (7 × 2π)
- **Final radius:** ~450mm (fits within 90% of the 1m paper, bounding box ~1m diameter)

Using the formula, the initial radius is calculated as:

$$r_0 = \frac{r_{final}}{\varphi^{28}} = \frac{450mm}{710,647} \approx 0.000633mm \approx 0.633 \mu m$$

That's approximately **0.63 micrometers** (or **6.33 × 10⁻⁷ m**) - an incredibly small starting point that grows by φ every 90° to reach ~0.5m after 7 turns!

> **Note:** The specification mentions r₀ ≈ 0.7μm for a 0.5m final radius. Our implementation uses 0.45m (90% margin) resulting in 0.63μm. Both follow the same φ^28 scaling.

### Fibonacci Spiral Construction Method

The spiral is constructed using the classic Fibonacci/golden rectangle method:

1. **Start with a 1×φ rectangle** fitting within the square paper
2. **Divide into a square and smaller rectangle** (the smaller rectangle is also a golden rectangle)
3. **Repeat inward** - each division creates a new square
4. **Draw quarter-circle arcs** in each square (each arc = one quarter-turn)
5. **Iterate 28 times** for 7 complete turns

The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...) converges to the golden ratio:

$$\lim_{n \to \infty} \frac{F_{n+1}}{F_n} = \varphi$$

**Construction sequence for 7 turns (28 quarter-circles):**
```
Squares: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 
         1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 
         121393, 196418, 317811
```

> **Note:** Inner segments (the first few squares) become sub-millimeter, necessitating digital tools for accurate construction and printing.

## 🔬 Advanced Theory: Phase Conjugate Implosion

### Winter's 1D Compression Model

Dan Winter's research extends the golden spiral into a model for phase conjugate implosion - the idea that φ-based compression creates the conditions for:

- **Constructive wave interference** at all scales
- **Charge implosion** toward center
- **The physics of consciousness and life force**

The 1D compression follows solutions to the Klein-Gordon equation with φ-exponent scaling:

$$\psi_n = A \cdot \varphi^n$$

Where each nested wave compresses by exactly φ, allowing perfect non-destructive interference.

### 3D Extension: Dodecahedral/Icosahedral Coordinates

The golden spiral extends to 3D via the vertices of the dodecahedron and icosahedron, which are defined by φ:

**Icosahedron vertices:** $(0, \pm 1, \pm \varphi)$ and cyclic permutations

**Dodecahedron vertices:** $(\pm 1, \pm 1, \pm 1)$, $(0, \pm \varphi, \pm 1/\varphi)$, $(\pm 1/\varphi, 0, \pm \varphi)$, $(\pm \varphi, \pm 1/\varphi, 0)$

These Platonic solids allow spiral paths along symmetry axes, creating 3D phase conjugate geometries used in:
- **Implosion vortex design**
- **Harmonic architecture**
- **Biofield technologies**

### The Sacred Foot Unit

The "sacred foot" connects the golden ratio to Planck-scale physics:

$$l_{sacred} = l_P \times \varphi^{164} \approx 0.3084m$$

Where $l_P$ is the Planck length (~1.616 × 10⁻³⁵ m).

This unit appears in sacred architecture and is theorized to create resonance conditions for biological coherence. Practical builds incorporating this ratio use biologic materials (wood, stone, natural fibers) for enhanced resonance effects.

## ✨ Features

- 📏 **Configurable paper sizes** - From A4 to custom sizes up to 2m
- 🔄 **Adjustable turns** - 1 to 20+ complete rotations
- 📐 **Show/hide golden rectangles** - Visualize the Fibonacci construction
- 🖨️ **Print-ready export** - PNG, SVG, and direct print
- 🔍 **Zoom & pan** - Navigate large spirals with ease (up to 10000%)
- ↻ **Rotate view** - View the spiral from any angle
- 💾 **Auto-save settings** - Your configuration persists in localStorage

## 🚀 Usage

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

## 📁 Project Structure

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

## 🔧 Technical Details

### Technologies

- **Vite** - Build tool & dev server
- **TypeScript** - Type-safe JavaScript
- **Canvas API** - High-performance 2D rendering
- **Tailwind CSS** - Utility-first styling

### Implementation Details

The spiral is rendered using the TRUE Fibonacci method:

1. **Generate Fibonacci sequence** for the required number of quarter-turns (28 for 7 turns)
2. **Calculate scale factor** so the largest square fits within 90% of the paper
3. **Place squares** according to the golden rectangle construction pattern:
   - Direction cycles: right → down → left → up → repeat
4. **Draw quarter-circle arcs** inscribed in each square:
   - Arc center at corner of square
   - Radius = side length of square
   - Sweep = 90° (π/2 radians)

### Mathematical Verification

For the default 7 turns on 1m × 1m paper:

| Parameter | Value |
|-----------|-------|
| Quarter-turns | 28 |
| θ max | 14π radians |
| Final radius | 450mm |
| φ^28 | 710,647.07 |
| Initial radius | 0.000633mm |
| Initial radius | 6.33 × 10⁻⁷ m |
| Initial radius | 0.633 μm |

The spiral path length is the sum of 28 quarter-circle arcs:
$$L = \sum_{i=1}^{28} \frac{\pi}{2} \times r_i = \frac{\pi}{2} \times r_0 \times \sum_{i=0}^{27} \varphi^i$$

## 📚 References

- Robert Edward Grant - "Code X" and Golden Mean research
- Dan Winter - Phase conjugate implosion and fractal physics
- [Fibonacci Spiral - Wikipedia](https://en.wikipedia.org/wiki/Golden_spiral)
- [Golden Ratio - Wolfram MathWorld](https://mathworld.wolfram.com/GoldenRatio.html)

## 📄 License

MIT License - feel free to use this for any purpose.

## 🙏 Acknowledgments

- Mathematical foundation based on Robert Edward Grant's research
- Phase conjugate theory from Dan Winter's work
- Inspired by the beauty of φ in nature, art, and consciousness
