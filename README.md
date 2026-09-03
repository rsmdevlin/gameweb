# GameWeb - 3D Multiplayer Prop Hunt

A full-featured browser-based 3D multiplayer Prop Hunt game built with Three.js and WebSocket.

## 🎮 Features

### Core Gameplay
- **Real-time Multiplayer**: Server-authoritative game state with 60 tick/sec synchronization
- **Professional UI/UX**: 
  - Beautiful main menu with gradient animations
  - Server browser with create/join functionality
  - Pre-game lobby with player list and chat
  - In-game HUD with health, timer, team info
- **3D Graphics**: 
  - Third-person camera system with smooth controls
  - Atmospheric lighting (sun, ambient, hemisphere, point lights)
  - Enhanced terrain with height variation and vertex colors
  - Shadows and fog for depth
  - Structures for tactical gameplay (tower, walls, platforms)

### Prop Hunt Gameplay
- **Team System**: 
  - Automatic team assignment (Hunters vs Props)
  - 1 Hunter per 4 players
- **Game Phases**:
  - Lobby phase (waiting for players)
  - Hiding phase (30 seconds for props to transform and hide)
  - Hunting phase (5 minutes for hunters to find props)
  - Round end with winner announcement
- **Prop Mechanics**:
  - Transform into 8+ different prop types
  - Movement as props
  - Transform cooldown system
  - Prop selection with mouse wheel
- **Hunter Mechanics**:
  - Attack system with range and cone detection
  - Friendly fire penalty
  - Prop detection with suspicion levels
  - Health system with damage
- **Round System**:
  - Timer with phase transitions
  - Score tracking (kills, deaths, wins)
  - Leaderboard with K/D ratios
  - Round history
  - Spectator mode after death

### Technical Features
- **Character System**: 
  - Support for GLB/GLTF models with animations
  - Fallback to procedural geometry
  - Idle/Walk/Run/Jump animations
  - Character controller with physics
- **User System**: Registration, login, JWT authentication, profiles
- **Server Management**: Create custom servers with passwords and player limits
- **Rich UI**: HUD with health, timer, score, player list, real-time chat
- **Cross-Platform Controls**: 
  - Desktop: WASD + mouse (pointer lock)
  - Mobile: Touch joystick with action buttons
- **Asset System**: 
  - Asset manager with model caching
  - Lazy loading for optimization
  - CC0 license compliance tracking

## 🛠 Tech Stack

### Frontend
- **TypeScript** - Type safety
- **Three.js** - 3D rendering
- **Vite** - Build tool and dev server
- **Custom Systems**:
  - CharacterModel - 3D character with animations
  - CharacterController - Third-person controls
  - PropTransformSystem - Prop mechanics
  - HunterSystem - Attack and detection
  - RoundSystem - Game flow and scoring
  - PropHuntGameMode - Team logic and phases
  - AssetManager - Model loading and caching

### Backend
- **Node.js + TypeScript** - Server runtime
- **Express** - REST API
- **WebSocket (ws)** - Real-time communication
- **MySQL** - User data and stats
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Architecture
- **Monorepo** with npm workspaces
- **Shared types** package for client/server
- **ESM modules** throughout
- **Server-authoritative** game state

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rsmdevlin/gameweb.git
cd gameweb
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root:
```env
DATABASE_URL=mysql://user:password@localhost:3306/gameweb
PORT=3000
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

4. Initialize database:
```bash
# Database tables are created automatically on first run
```

5. Start development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

6. Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🎯 How to Play

### Getting Started
1. **Register/Login**: Create an account with username, email, and password
2. **Main Menu**: Navigate to Server Browser
3. **Create/Join Server**: 
   - Create your own server (set name, map, max players, optional password)
   - Or join an existing server from the list
4. **Lobby**: Wait for other players to join
5. **Start Game**: Host clicks "START GAME" (requires 2+ players)

### Gameplay
1. **Team Assignment**: Automatically assigned as Hunter or Prop
2. **Hiding Phase** (30 seconds):
   - Props: Press E to cycle through prop types, click to transform
   - Hunters: Wait, plan your search strategy
3. **Hunting Phase** (5 minutes):
   - Props: Stay still or move carefully to avoid detection
   - Hunters: Search for suspicious props, left-click to attack
4. **Win Conditions**:
   - **Hunters win**: Eliminate all props before time runs out
   - **Props win**: Survive until timer reaches 0

### Controls

**Desktop:**
- WASD - Movement
- Shift - Run
- Space - Jump
- Mouse Move - Camera rotation (pointer lock)
- E - Transform / Cycle props (Props only)
- Left Click - Attack (Hunters only)
- Enter - Toggle chat
- ESC - Release pointer lock

**Mobile:**
- Left joystick - Movement
- Screen drag - Camera rotation
- Attack button - Attack (Hunters)
- Transform button - Transform (Props)

## 📁 Project Structure

```
gameweb/
├── client/                      # Frontend
│   ├── src/
│   │   ├── auth/               # Authentication manager
│   │   ├── game/
│   │   │   ├── GameClient.ts   # WebSocket client
│   │   │   ├── CharacterModel.ts        # 3D character with animations
│   │   │   ├── CharacterController.ts   # Third-person controls
│   │   │   ├── AssetManager.ts          # Model loading
│   │   │   ├── PropManager.ts           # Prop creation
│   │   │   ├── MapManager.ts            # Map/terrain system
│   │   │   ├── PropTransformSystem.ts   # Prop transformation
│   │   │   ├── PropHuntGameMode.ts      # Game mode logic
│   │   │   ├── HunterSystem.ts          # Hunter mechanics
│   │   │   └── RoundSystem.ts           # Round management
│   │   ├── render/
│   │   │   └── GameRenderer.ts # Three.js rendering
│   │   ├── ui/
│   │   │   ├── MainMenu.ts     # Main menu screen
│   │   │   ├── ServerBrowser.ts # Server list and creation
│   │   │   ├── Lobby.ts        # Pre-game lobby
│   │   │   └── GameHUD.ts      # In-game HUD
│   │   ├── controls/
│   │   │   └── MobileControls.ts # Touch controls
│   │   └── main.ts             # Entry point
│   └── index.html
├── server/                      # Backend
│   └── src/
│       ├── database/
│       │   └── init.ts         # Database setup
│       ├── game/
│       │   └── GameManager.ts  # Game state management
│       ├── routes/
│       │   ├── auth.ts         # Auth endpoints
│       │   └── servers.ts      # Server list API
│       ├── websocket/
│       │   └── handler.ts      # WebSocket handler
│       ├── middleware/
│       │   └── auth.ts         # JWT middleware
│       └── index.ts            # Server entry
├── shared/                      # Shared types
│   └── src/
│       └── types.ts            # TypeScript interfaces
├── ASSETS.md                    # Asset licenses
├── DEPLOYMENT.md                # Deployment guide
└── README.md                    # This file
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Render deployment instructions.

### Quick Deploy to Render

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS`
4. Deploy with:
   - Build: `npm install && npm run build`
   - Start: `npm start`

## 🎨 Assets

All 3D assets and their licenses are documented in [ASSETS.md](./ASSETS.md).

Currently using procedurally generated geometric props. For production, we recommend:
- Poly Haven (CC0)
- Kenney Assets (CC0)
- Quaternius (CC0)

## 🧪 Testing

### Local Testing

1. Start servers: `npm run dev`
2. Open two browser tabs at http://localhost:5173
3. Register two accounts
4. Create a server in one tab
5. Join the server from the other tab
6. Test multiplayer synchronization

### What to Test

- ✅ User registration/login
- ✅ Server creation and joining
- ✅ Real-time player movement sync
- ✅ Prop transformation
- ✅ Hunter attacks and damage
- ✅ Chat messages
- ✅ Round timer
- ✅ Win conditions
- ✅ Mobile controls (use browser DevTools device emulation)

## 📝 Available Scripts

- `npm run dev` - Start both client and server in dev mode
- `npm run build` - Build both client and server
- `npm start` - Start production server
- `npm run dev:server` - Start only server
- `npm run dev:client` - Start only client
- `npm run build:server` - Build only server
- `npm run build:client` - Build only client

## 🐛 Troubleshooting

**"Cannot connect to WebSocket"**
- Check server is running on port 3000
- Verify firewall allows WebSocket connections
- Check ALLOWED_ORIGINS includes your client URL

**"Database connection failed"**
- Verify DATABASE_URL is correct
- Ensure MySQL is running
- Check database exists and user has permissions

**"Module not found errors"**
- Run `npm install` in root directory
- Clear node_modules: `rm -rf node_modules && npm install`

**"Build fails"**
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check for TypeScript errors: `npx tsc --noEmit`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- Repository: https://github.com/rsmdevlin/gameweb
- Issues: https://github.com/rsmdevlin/gameweb/issues

## 👥 Credits

Developed as a full-stack 3D multiplayer game demonstration.

Assets: See [ASSETS.md](./ASSETS.md) for all attributions and licenses.
