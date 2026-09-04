# PropHuntGame - Asset List

All assets must be CC0 or have appropriate licenses for commercial use.

## Character Model (Required for UE5 Editor)

### Primary Character
- **Source**: Mixamo (https://www.mixamo.com)
- **License**: Free for commercial use with attribution
- **Model**: Y Bot or similar rigged humanoid
- **Animations Required**:
  - Idle
  - Walk
  - Run
  - Sprint
  - Jump_Start
  - Jump_Loop
  - Jump_Land
  - Death
  - Hit_Reaction

**Alternative Sources**:
- ReadyPlayerMe (https://readyplayer.me) - Custom avatars
- Adobe Fuse (Discontinued, but models available)
- Free Unreal Marketplace mannequin

**Format**: FBX with skeleton and animations

---

## Map Assets (Abandoned Hotel)

### Architecture - Quixel Megascans (Free with UE5)
**URL**: https://quixel.com/megascans

**Needed**:
- Modular walls (interior)
- Floors (wood planks, tiles, concrete)
- Ceilings
- Doors (hotel room style)
- Windows (with frames)
- Stairs
- Baseboards/Trim

**Search Terms**:
- "interior wall"
- "wooden floor"
- "tile floor"
- "door"
- "window"
- "stairs"

### Furniture - Kenney Assets (CC0)
**URL**: https://www.kenney.nl/assets

**Furniture Pack**:
- Beds (single, double)
- Chairs (dining, office, lounge)
- Tables (dining, coffee, side)
- Desks
- Shelves/Bookcases
- Nightstands

**Format**: FBX, OBJ, GLTF

### Decorative Props - Poly Haven (CC0)
**URL**: https://polyhaven.com/models

**Needed**:
- Lamps (table, floor, ceiling)
- Plants (potted)
- Vases
- Paintings/Frames
- Books
- Trash bins

### Kitchen Props

**Sources**:
1. **Kenney Assets** - Kitchen Pack
   - Pots, pans, utensils
   - Plates, cups, bowls
   
2. **Free3D** (https://free3d.com)
   - Search: kitchen props
   - Verify license: CC0 or royalty-free

### Transformable Props (Prop Hunt)

**Required Props** (8-12 types):

1. **Chair** (Kenney Assets)
2. **Box/Crate** (Kenney Assets)
3. **Barrel** (Poly Haven)
4. **Plant** (Poly Haven)
5. **Lamp** (Poly Haven)
6. **Trash Bin** (Kenney Assets)
7. **Small Table** (Kenney Assets)
8. **Bucket** (Free3D/Kenney)
9. **Bottle** (Free3D)
10. **Book** (Free3D)

**Requirements**:
- LOD levels: 0, 1, 2
- Collision mesh
- Pivot at base
- Reasonable polycount (500-5000 tris)

---

## Materials & Textures

### Quixel Megascans
- Wall materials (plaster, paint, wallpaper)
- Floor materials (wood, tile, concrete)
- Metal materials (doors, fixtures)
- Fabric materials (curtains, beds)

### Poly Haven
**URL**: https://polyhaven.com/textures

- Additional materials
- PBR textures (Albedo, Normal, Roughness, Metallic)

**Resolution**: 2K (4K for floors/walls)

---

## Weapon (Hunter)

### Pistol Model
**Sources**:
1. **Free3D** - Search "pistol low poly"
2. **Sketchfab** - Filter: Free, Downloadable
3. **Kenney Assets** - Gun pack

**Requirements**:
- Rigged for animations
- Muzzle socket for effects
- 2K textures

**Alternative**: Use UE5 starter content weapon

---

## Audio Assets

### Sound Effects - Freesound.org (CC0)
**URL**: https://freesound.org

**Needed**:
1. **Character**:
   - Footsteps (wood, tile, carpet) - 6 variations
   - Jump/Land sounds
   - Breathing

2. **Weapon**:
   - Gunshot
   - Reload
   - Empty click

3. **Hit Effects**:
   - Bullet impact (wood, metal, flesh)
   - Damage grunt

4. **Transformation**:
   - Transform sound (whoosh + magic)

5. **Ambient**:
   - Hotel ambience
   - Wind
   - Creaking floors
   - Distant sounds

6. **UI**:
   - Button clicks
   - Countdown beep
   - Round start/end stinger

### Music - Free Options

**Sources**:
1. **Purple Planet Music** (https://www.purple-planet.com)
   - Royalty free
   - Attribution required

2. **Incompetech** (https://incompetech.com)
   - CC BY license
   - Attribution required

**Tracks Needed**:
- Lobby: Low tension
- Hiding Phase: Medium tension
- Hunting Phase: High tension
- Victory/Defeat themes

---

## Visual Effects

### Niagara Particles (Built-in UE5)

**Create in UE5**:
- Muzzle flash
- Bullet tracer
- Hit sparks
- Transformation particle effect
- Dust particles (ambient)
- Light rays (god rays)

**Tutorial**: UE5 Niagara documentation

---

## Asset Integration Checklist

### Per Asset:
- [ ] Download/acquire asset
- [ ] Verify license
- [ ] Import to UE5
- [ ] Set up materials
- [ ] Create LODs (if needed)
- [ ] Setup collision
- [ ] Test in-game
- [ ] Add to ASSETS.md with attribution

### Character:
- [ ] Import FBX with skeleton
- [ ] Retarget animations to UE5 mannequin skeleton
- [ ] Create Animation Blueprint
- [ ] Test all animations
- [ ] Setup IK (inverse kinematics) for feet

### Props:
- [ ] Import all static meshes
- [ ] Generate collision (or import custom)
- [ ] Setup LODs
- [ ] Assign materials
- [ ] Create prop actor Blueprints
- [ ] Add to PropComponent available props

### Map:
- [ ] Import all modular pieces
- [ ] Setup materials with proper tiling
- [ ] Build initial level layout
- [ ] Place all props
- [ ] Setup lighting
- [ ] Build NavMesh
- [ ] Add spawn points
- [ ] Performance test

---

## Quick Start Asset Pack

For immediate testing, use **UE5 Starter Content**:
- Mannequin character (temporary)
- Basic shapes for props
- Starter materials
- Simple weapon mesh

Then replace with quality assets incrementally.

---

## Asset Budget

**Target**:
- Character: 20K-40K tris
- Props: 500-5K tris each
- Map: 2M tris total on screen
- Textures: 2-4K resolution
- Total project size: <10GB

---

## License Summary

### CC0 (Public Domain)
- Kenney Assets
- Poly Haven
- Many Freesound.org sounds
- **Can use commercially without attribution** (but attribution is appreciated)

### CC BY (Attribution Required)
- Some Freesound.org sounds
- Some free music
- **Must credit in game credits/ASSETS.md**

### Mixamo
- Free for commercial use
- Attribution required
- Cannot redistribute raw assets

### Quixel Megascans
- Free with UE5
- Can only use in Unreal Engine projects
- Cannot extract and use elsewhere

---

## Asset Documentation

**All assets must be documented in**:
`/ASSETS.md` with:
- Asset name
- Source URL
- License type
- Author/Creator
- Date acquired

**Example**:
```markdown
## Character Model
- **Asset**: Y Bot
- **Source**: https://www.mixamo.com
- **License**: Mixamo Free License (attribution required)
- **Author**: Adobe
- **Date**: 2026-09-04
```

---

## Next Steps

1. Download Mixamo Y Bot + animations
2. Acquire Kenney Furniture pack
3. Download 8-12 props for Prop Hunt
4. Get basic weapon model
5. Collect essential sounds (footsteps, weapon, UI)
6. Start with UE5 starter content for rapid prototyping
7. Replace with quality assets incrementally

---

## Estimated Asset Acquisition Time

- Character + animations: 2 hours
- Map architecture assets: 4 hours
- Props (120 total): 6 hours
- Audio: 3 hours
- Materials: 2 hours
- **Total**: ~17 hours

But can start testing with placeholder assets immediately.
