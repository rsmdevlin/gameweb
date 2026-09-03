# 3D Assets and Licenses

This document lists all 3D models and assets used in GameWeb, along with their sources and licenses.

## Asset Sources

All assets used in this project are either:
- Created specifically for this project
- Licensed under CC0 (Public Domain) from reputable sources
- Licensed under Creative Commons with proper attribution

## Current Assets

### Environment Objects

1. **Basic Geometric Props** (Generated in-code)
   - Boxes, Spheres, Cones, Cylinders
   - License: Project original, no external dependencies
   - Used for: Prop transformations and basic map objects

### Recommended Free Asset Sources

For production deployment, we recommend sourcing additional assets from:

1. **Poly Haven** (https://polyhaven.com/)
   - License: CC0 (Public Domain)
   - 3D models, HDRIs, and textures
   - No attribution required

2. **Kenney Assets** (https://www.kenney.nl/)
   - License: CC0 (Public Domain)
   - Game-ready 3D models
   - No attribution required

3. **Quaternius** (https://quaternius.com/)
   - License: CC0 (Public Domain)
   - Low-poly game assets
   - No attribution required

4. **Sketchfab** (https://sketchfab.com/)
   - Various licenses (check each model)
   - Filter by "Downloadable" and license type
   - Always verify license before use

## Asset Requirements

When adding new assets:
1. Verify the license allows commercial use
2. Check if attribution is required
3. Ensure file formats are .glb or .gltf
4. Optimize for web (< 5MB per model recommended)
5. Update this file with proper attribution

## Current Asset List

### Characters

1. **SimplePerson Character Model**
   - Source: Quaternius (https://quaternius.com)
   - License: CC0 1.0 Universal (Public Domain)
   - Format: .glb
   - Features: Rigged with idle/walk/run/jump animations
   - Path: `/public/assets/models/character.glb`
   - Attribution: Not required (CC0)
   - Fallback: Procedural capsule + sphere geometry

### Props

1. **Barrel**
   - Source: Quaternius (https://quaternius.com)
   - License: CC0 1.0 Universal (Public Domain)
   - Format: .glb
   - Path: `/public/assets/models/barrel.glb`
   - Fallback: Procedural cylinder

2. **Crate**
   - Source: Quaternius (https://quaternius.com)
   - License: CC0 1.0 Universal (Public Domain)
   - Format: .glb
   - Path: `/public/assets/models/crate.glb`
   - Fallback: Procedural box

3. **Box**
   - Source: Quaternius (https://quaternius.com)
   - License: CC0 1.0 Universal (Public Domain)
   - Format: .glb
   - Path: `/public/assets/models/box.glb`
   - Fallback: Procedural box

### Map: Default Arena

- **Ground Plane**: Generated geometry (Project original)
- **Props Collection**: 
  - Uses models listed above when available
  - Falls back to procedural geometry if models not loaded
  - Material: Brown wood-like standard material

## Future Asset Plans

To enhance the game, we plan to add:
- Detailed building interiors
- Furniture sets (chairs, tables, lamps)
- Outdoor objects (trees, rocks, fences)
- Character models with animations
- Particle effects and VFX assets

## License Compliance

This project respects all licensing requirements. If you use external assets:
- CC0: No attribution needed, but we list sources for transparency
- CC-BY: Attribution provided in this file and in-game credits
- Custom licenses: Terms followed as specified by creator

## Contact

For questions about asset licensing, please open an issue on GitHub.
