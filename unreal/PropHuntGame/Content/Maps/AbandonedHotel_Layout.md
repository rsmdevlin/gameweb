# Abandoned Hotel - Map Structure

## Layout

```
                  [Rooms 201-202] (Second Floor)
                         |
    [Kitchen] ----  [Corridor]  ---- [Reception]
         |              |                 |
   [Storage]        [Lobby]          [Entrance]
                        |
                   [Basement]
                        |
                  [Boiler Room]
```

## Dimensions
- Total Map Size: 50m x 50m
- Lobby: 10m x 10m
- Corridors: 15m x 3m
- Rooms: 6m x 8m each
- Kitchen: 8m x 6m
- Storage: 5m x 5m
- Basement: 10m x 10m

## Props Count by Area

### Lobby (20 props)
- Chairs: 6
- Tables: 2
- Plants: 4
- Lamps: 3
- Reception Desk: 1
- Trash Bins: 2
- Wall Decorations: 2

### Corridors (15 props)
- Small Tables: 3
- Vases: 4
- Lamps: 4
- Chairs: 2
- Paintings: 2

### Rooms 101, 102, 201, 202 (40 props total, 10 per room)
- Bed: 1
- Nightstands: 2
- Lamp: 2
- Chair: 1
- Desk: 1
- Trash Bin: 1
- Paintings: 1
- Books/Decorations: 1

### Kitchen (15 props)
- Pots: 3
- Pans: 2
- Utensils: 4
- Plates: 3
- Cups: 2
- Trash Bin: 1

### Storage (10 props)
- Boxes: 5
- Crates: 3
- Barrels: 2

### Basement (12 props)
- Boxes: 4
- Barrels: 3
- Pipes: 2
- Old Furniture: 3

### Reception (8 props)
- Desk: 1
- Chair: 1
- Bell: 1
- Books: 2
- Decorations: 3

**Total Props: 120**

## Lighting Setup

### Lobby
- Main chandelier (point light, warm)
- 4 wall lamps (spot lights)
- Ambient light from windows

### Corridors
- Ceiling lights every 5m
- Flickering lights for atmosphere

### Rooms
- Ceiling light (central)
- Bedside lamps (2 per room)
- Window light (during day)

### Kitchen
- Overhead fluorescent lights
- Under-cabinet lighting

### Basement
- Single hanging bulbs
- Dim, eerie lighting
- Shadows for hiding

### Storage
- Single overhead bulb
- Dark corners

## Collision & Navigation

- All walls: Blocking collision
- Props: Query & Physics collision
- NavMesh: Generated for walkable areas
- Doors: Can be opened (optional)

## Assets Needed (CC0/Licensed)

### Architecture
- Walls (modular)
- Floors (wood, tile, concrete)
- Ceilings
- Doors
- Windows
- Stairs

### Furniture
- Beds (basic hotel style)
- Chairs (various)
- Tables (dining, side, desk)
- Desks
- Nightstands
- Shelves

### Decorative
- Lamps (floor, table, ceiling)
- Paintings/Pictures
- Plants (potted)
- Books
- Vases
- Trash bins

### Kitchen
- Counter
- Pots/Pans
- Utensils
- Plates/Cups
- Cabinets

### Prop Hunt Props
- Boxes (various sizes)
- Crates (wood)
- Barrels (metal/wood)
- Chairs (multiple types)
- Small objects

## Asset Sources

1. **Quixel Megascans** (Free with UE5)
   - Architecture materials
   - Furniture
   - Decorations

2. **Poly Haven** (CC0)
   - Additional props
   - Materials

3. **Kenney Assets** (CC0)
   - Simple geometric props
   - Basic furniture

4. **Unreal Marketplace - Free Assets**
   - Free building packs
   - Free prop collections

## Implementation Notes

1. Create modular walls for easy layout
2. Use instanced static meshes for repeated props
3. Optimize with LODs
4. Use Lumen for global illumination
5. Bake lighting for better performance
6. Add fog for atmosphere
7. Sound: creaky floor sounds, ambient hotel sounds
8. Particle effects: dust, light rays

## Map Boundaries

- Invisible walls at edges
- Kill zone below basement floor
- Ceiling collision to prevent climbing

## Vertical Layout

```
Second Floor (+5m):  Rooms 201-202
Ground Floor (0m):   Lobby, Corridor, Kitchen, Storage, Reception
Basement (-3m):      Basement, Boiler Room
```

## Strategic Hiding Spots

### For Props:
- Behind reception desk
- Under beds
- In storage boxes
- Behind kitchen counters
- Dark basement corners
- Behind curtains
- On shelves (small props)

### Hunter Advantages:
- Open corridors for visibility
- Central lobby for monitoring
- High ground on stairs
- Kitchen corner camping

## Performance Targets

- Draw calls: <500
- Tris on screen: <2M
- Texture memory: <2GB
- 60 FPS on mid-range GPU

## Next Steps for UE5 Editor

1. Create new level: AbandonedHotel
2. Block out layout with BSP or primitives
3. Import modular assets
4. Place spawn points
5. Add props (120 total)
6. Setup lighting
7. Build NavMesh
8. Add fog/atmosphere
9. Test spawn points
10. Optimize performance
