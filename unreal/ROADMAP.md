# Unreal Engine 5 Prop Hunt - Development Roadmap

## Project Overview
Building a high-quality 3D Multiplayer Prop Hunt game using Unreal Engine 5 with Pixel Streaming for browser delivery.

## Architecture
- **Unreal Engine 5**: Full 3D game, graphics, physics, gameplay
- **Node.js Backend**: Auth, rooms, lobby, matchmaking (existing, adapted)
- **Pixel Streaming**: WebRTC delivery to browser
- **Web Launcher**: Cinematic UI for login, server browser, lobby

---

## Phase 1: UE5 Project Setup ✓ IN PROGRESS
**Goal**: Create base UE5 project with multiplayer foundation

### Tasks
- [ ] Create new UE5 project (Third Person template)
- [ ] Enable required plugins:
  - Pixel Streaming
  - Online Subsystem (Steam/EOS or NULL for testing)
  - Enhanced Input
  - Networking
- [ ] Configure project settings:
  - Dedicated server support
  - Client/Server architecture
  - Pixel Streaming configuration
- [ ] Setup Git LFS for UE5 assets
- [ ] Create basic GameMode, GameState, PlayerState classes
- [ ] Setup dedicated server build configuration

**Duration**: 2-3 days
**Output**: Working UE5 project that can build as Client + Server

---

## Phase 2: Character & Movement
**Goal**: Third-person character with polished movement

### Tasks
- [ ] Import high-quality character model (CC0/licensed)
  - Sources: Mixamo, Adobe Fuse, ReadyPlayerMe
  - Required animations: Idle, Walk, Run, Jump, Fall, Land, Attack, Death
- [ ] Setup character Blueprint/C++:
  - Third-person camera with smooth follow
  - Camera collision and rotation
  - WASD movement with acceleration
  - Sprint mechanic
  - Jump with physics
- [ ] Enhanced Input system:
  - Desktop: WASD + Mouse
  - Mobile: Touch input support (for future Pixel Streaming mobile)
- [ ] Replicate movement to all clients
- [ ] Animation Blueprint with blend spaces

**Duration**: 3-4 days
**Output**: Smooth, replicated third-person character

---

## Phase 3: Core Map - Abandoned Hotel
**Goal**: One beautiful, atmospheric map

### Tasks
- [ ] Map design:
  - Size: Small/medium (focus on quality, not size)
  - Layout: Hotel lobby, corridors, 6-8 rooms, reception, kitchen, storage, basement
  - Spawn points: 8-12 locations
- [ ] Asset sourcing (CC0/licensed):
  - Quixel Megascans
  - Unreal Marketplace free assets
  - Poly Haven
  - Kenney Assets
- [ ] Lighting:
  - Lumen global illumination
  - Atmospheric lighting
  - Point lights for rooms
  - Shadows and fog
- [ ] Props placement (100+ interactive objects):
  - Furniture: chairs, tables, beds, desks
  - Kitchen: pots, pans, utensils
  - Decorative: plants, paintings, lamps
  - Gameplay props: boxes, barrels, crates
- [ ] Collision setup
- [ ] Optimization: LODs, culling, Nanite where appropriate

**Duration**: 5-7 days
**Output**: Production-quality small map

---

## Phase 4: Prop Hunt Gameplay - Props
**Goal**: Transform system and prop mechanics

### Tasks
- [ ] Prop selection system:
  - UI wheel or list for choosing props
  - 8-12 different prop types from map assets
  - Preview before transforming
- [ ] Prop transformation:
  - Replace player mesh with prop mesh
  - Maintain collision
  - Hide player nameplate
  - Cooldown system (10-20 seconds)
- [ ] Prop movement:
  - Same physics as character
  - Rotation controls
  - Smaller props = faster, less HP
  - Larger props = slower, more HP
- [ ] Prop blending:
  - Ability to "freeze" in place
  - Blend with environment objects
- [ ] Network replication:
  - Sync transformation state
  - Sync prop position/rotation
  - Sync prop type to all clients

**Duration**: 4-5 days
**Output**: Working prop transformation with movement

---

## Phase 5: Prop Hunt Gameplay - Hunters
**Goal**: Hunter mechanics and combat

### Tasks
- [ ] Weapon system:
  - Pistol or rifle (single weapon for vertical slice)
  - Aim down sights
  - Shoot with raytrace/projectile
  - Muzzle flash VFX
  - Weapon sound effects
  - Reload/cooldown
- [ ] Hit detection:
  - Server-authoritative
  - Damage to props
  - Health system (100 HP)
  - Death state
- [ ] Penalty system:
  - Damage for shooting non-prop objects
  - Visual feedback (red flash)
- [ ] Hunter UI:
  - Crosshair
  - Ammo counter
  - Cooldown indicator

**Duration**: 3-4 days
**Output**: Working hunter combat system

---

## Phase 6: Round System
**Goal**: Complete game loop with phases and win conditions

### Tasks
- [ ] Game phases:
  - Lobby: Waiting for players
  - Preparation: 10 seconds countdown
  - Hiding: 30 seconds for props to transform and hide
  - Hunting: 5 minutes for hunters to find props
  - Round End: 10 seconds result screen
- [ ] Team assignment:
  - Automatic balancing (1 Hunter per 3-4 players)
  - Random assignment
  - Team colors (red for hunters, blue for props)
- [ ] Timer system:
  - Server-authoritative countdown
  - UI display
  - Phase transitions
- [ ] Win conditions:
  - Props win: Survive until timer ends
  - Hunters win: Eliminate all props
- [ ] Score system:
  - Track kills, deaths, survival time
  - Round winner announcement
  - Leaderboard

**Duration**: 3-4 days
**Output**: Full playable round loop

---

## Phase 7: Multiplayer Infrastructure
**Goal**: Rock-solid multiplayer with 4-8 players

### Tasks
- [ ] Server-authoritative architecture:
  - Position reconciliation
  - Client prediction
  - Server validation
  - Anti-cheat basics (server checks)
- [ ] Player spawning:
  - Team-based spawn points
  - Safe spawn (no overlap)
- [ ] Network optimization:
  - Replication graph
  - Relevancy settings
  - Update frequencies
  - Bandwidth optimization
- [ ] Dedicated server:
  - Linux server build
  - Headless mode
  - Command-line server launch
  - Server heartbeat to Node.js backend
- [ ] Integration with Node.js backend:
  - Game server registration
  - Player auth token validation
  - Match state sync
  - Chat relay (optional)

**Duration**: 4-5 days
**Output**: Stable 4-8 player multiplayer

---

## Phase 8: Pixel Streaming Integration
**Goal**: Stream UE5 to browser via WebRTC

### Tasks
- [ ] Enable Pixel Streaming plugin
- [ ] Configure Pixel Streaming settings:
  - Resolution: 1920x1080 (scalable)
  - Bitrate: 5-20 Mbps
  - FPS: 30-60
  - Codec: H.264/VP9
- [ ] Signaling server setup:
  - Use UE5's Cirrus signaling server
  - Or integrate with Node.js backend
- [ ] Input forwarding:
  - Keyboard/mouse from browser
  - Touch input for mobile
  - Map to UE5 input actions
- [ ] Web launcher integration:
  - Allocate UE5 instance on "Start Game"
  - Pass player token to UE5
  - Embed video stream in browser
  - Overlay HUD/UI on stream
- [ ] Multiple instance management:
  - Pool of UE5 server instances
  - Auto-scaling (manual for MVP)
  - Instance cleanup after matches

**Duration**: 5-6 days
**Output**: Working browser-to-UE5 streaming

---

## Phase 9: Mobile Controls
**Goal**: Touch-friendly controls for mobile browsers

### Tasks
- [ ] Virtual joystick:
  - Left: Movement
  - Right: Camera rotation
- [ ] Action buttons:
  - Jump
  - Sprint
  - Attack (Hunter)
  - Transform (Prop)
  - Interact
- [ ] Responsive HUD:
  - Landscape orientation optimized
  - Portrait: "Rotate device" message
  - Touch-friendly button sizes (44x44px minimum)
- [ ] Input mapping:
  - Touch events → Pixel Streaming input
  - Gesture support (pinch to zoom, etc.)

**Duration**: 3-4 days
**Output**: Playable on mobile browsers

---

## Phase 10: Audio & VFX
**Goal**: Polish with sound and visual effects

### Tasks
- [ ] Sound effects:
  - Footsteps (different materials)
  - Weapon fire
  - Hit sounds (metal, wood, flesh)
  - Transformation sound
  - UI sounds (button clicks)
  - Ambient hotel sounds
  - Round start/end stingers
- [ ] Music:
  - Lobby music (low tension)
  - Hiding phase (medium tension)
  - Hunting phase (high tension)
  - Victory/defeat themes
- [ ] Visual effects:
  - Muzzle flash
  - Bullet impacts
  - Hit markers
  - Transformation effect (particles, glow)
  - Death effects
  - Prop "suspicion" indicator
- [ ] Camera effects:
  - Screen shake on damage
  - FOV kick on sprint
  - Death camera (slow-mo optional)

**Duration**: 3-4 days
**Output**: Polished audio/visual experience

---

## Phase 11: UI/UX Polish
**Goal**: Beautiful in-game UI

### Tasks
- [ ] In-game HUD:
  - Health bar
  - Timer
  - Team score
  - Kill feed
  - Minimap (optional)
- [ ] Phase transitions:
  - Countdown overlays
  - Team assignment reveal
  - Round end scoreboard
- [ ] Settings menu:
  - Graphics quality (for Pixel Streaming)
  - Audio volume
  - Controls sensitivity
- [ ] Spectator mode:
  - After death, cycle through alive players
  - Ghost camera with collision

**Duration**: 2-3 days
**Output**: Complete, polished UI

---

## Phase 12: Testing & Optimization
**Goal**: Stable, performant vertical slice

### Tasks
- [ ] Performance optimization:
  - Target: 60 FPS on mid-range GPU server
  - Profiling: CPU, GPU, Network
  - LOD optimization
  - Texture streaming
  - Shadow quality balance
- [ ] Multiplayer testing:
  - 4-8 players in same match
  - Latency testing (50-200ms)
  - Packet loss handling
  - Reconnection logic
- [ ] Bug fixing:
  - Collision issues
  - Animation glitches
  - Networking desync
  - Input lag
- [ ] QA checklist:
  - Full game loop (login → game → lobby)
  - All props transformable
  - All weapons functional
  - Win conditions trigger correctly
  - Mobile controls work

**Duration**: 4-5 days
**Output**: Stable, bug-free build

---

## Phase 13: Deployment
**Goal**: Live, playable demo

### Tasks
- [ ] Server infrastructure:
  - GPU-enabled server (AWS g4dn, Paperspace, etc.)
  - Linux dedicated server build
  - Pixel Streaming instance management
  - Auto-scaling (basic)
- [ ] Web deployment:
  - Frontend: Vercel/Netlify
  - Backend: Render/Railway
  - Database: MySQL (existing)
- [ ] CI/CD:
  - Automated UE5 builds
  - Server deployment scripts
  - Rollback procedures
- [ ] Monitoring:
  - Server health checks
  - Player count tracking
  - Error logging
  - Performance metrics

**Duration**: 3-4 days
**Output**: Live playable demo

---

## Total Timeline Estimate
**Optimistic**: 50-60 days (7-8 weeks)
**Realistic**: 70-80 days (10-11 weeks)
**With unknowns/polish**: 90-100 days (13-14 weeks)

---

## Success Criteria for Vertical Slice

### Must Have
- ✅ Beautiful, atmospheric Abandoned Hotel map
- ✅ Smooth third-person character with animations
- ✅ 8+ transformable props with movement
- ✅ Working hunter weapon with hit detection
- ✅ Complete round loop (Lobby → Hiding → Hunting → End)
- ✅ 4-8 player multiplayer (stable)
- ✅ Pixel Streaming to browser
- ✅ Mobile touch controls
- ✅ Basic audio (footsteps, weapon, UI)
- ✅ Polished HUD and menus

### Nice to Have
- Spectator mode
- Multiple maps
- More weapon types
- Prop abilities (decoy, speed boost)
- Leaderboards
- Player progression
- Cosmetics

---

## Asset Licenses (Document in ASSETS.md)

### Character
- Source: (Mixamo, ReadyPlayerMe, etc.)
- License: CC0 / Commercial

### Map Assets
- Quixel Megascans: Free with UE5
- Poly Haven: CC0
- Kenney Assets: CC0
- Unreal Marketplace: Check license per asset

### Audio
- Freesound.org: CC0/CC-BY
- Epidemic Sound: Licensed
- Original: Custom

---

## Tech Stack Summary

### Unreal Engine 5
- Third-person character
- Prop Hunt gameplay
- Multiplayer replication
- Pixel Streaming
- Lumen + Nanite

### Node.js Backend (Existing)
- Express + WebSocket
- MySQL
- JWT auth
- Game server coordination

### Web Frontend
- TypeScript + Vite
- Pixel Streaming client (WebRTC)
- Cinematic launcher UI
- Mobile controls

### Infrastructure
- GPU servers for UE5
- Web hosting (Render/Vercel)
- MySQL database
- CDN for assets

---

## Current Status
**Date**: 2026-09-04

**Completed**:
- ✅ Backend adapted for UE5 coordination
- ✅ Pixel Streaming client created
- ✅ Launcher UI with cinematic design
- ✅ UnrealServerManager for instance management
- ✅ API endpoints for UE5 allocation

**Next Steps**:
1. Create UE5 project
2. Setup character and movement
3. Build Abandoned Hotel map
4. Implement Prop Hunt mechanics

**Current Phase**: Phase 1 - UE5 Project Setup
