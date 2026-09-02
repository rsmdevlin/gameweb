# GameWeb - 3D Multiplayer Prop Hunt

A full-featured browser-based 3D multiplayer Prop Hunt game built with Three.js and WebSocket.

## 🎮 Features

- **Real-time Multiplayer**: Server-authoritative game state with WebSocket synchronization
- **3D Graphics**: Third-person 3D view powered by Three.js
- **Prop Hunt Gameplay**: 
  - Hunter vs Prop teams
  - Prop transformation mechanic
  - HP/damage system
  - Round timer with hiding/hunting phases
  - Win conditions and scoring
  - Spectator mode after death
- **User System**: Registration, login, and profiles
- **Server Browser**: Create and join custom game servers
- **Rich UI**: HUD with health, timer, score, player list, and chat
- **Cross-Platform**: Desktop (WASD + mouse) and mobile (touch joystick) controls
- **Mobile Optimized**: Landscape mode with rotation warning
- **100+ Interactive Props**: Diverse objects on detailed map

## 🛠 Tech Stack

- **Frontend**: TypeScript + Three.js + Vite
- **Backend**: Node.js + TypeScript + WebSocket (ws)
- **Database**: MySQL
- **Deployment**: Render

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

4. Start development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

5. Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🎯 How to Play

1. **Register/Login**: Create an account or login
2. **Create Server**: Click "Create Server" in the main menu
3. **Wait for Players**: Other players can join your server
4. **Start Game**: Host clicks "Start Game"
5. **Hiding Phase** (30 sec): Props transform into objects and hide
6. **Hunting Phase** (3 min): Hunters search and attack props
7. **Win Conditions**: 
   - Hunters win if all props are eliminated
   - Props win if they survive the timer

### Controls

**Desktop:**
- WASD - Movement
- Mouse - Camera control
- E - Transform (Props only)
- Left Click - Attack (Hunters only)
- Enter - Open chat

**Mobile:**
- Left joystick - Movement
- Touch drag - Camera
- Buttons - Actions

## 📁 Project Structure

```
gameweb/
├── client/          # Frontend (Vite + Three.js)
│   ├── src/
│   │   ├── auth/    # Authentication
│   │   ├── game/    # Game logic, PropManager, MapManager
│   │   ├── render/  # Three.js renderer
│   │   ├── ui/      # HUD components
│   │   └── controls/# Input handling
│   └── index.html
├── server/          # Backend (Node.js + WebSocket)
│   └── src/
│       ├── database/# Database setup
│       ├── game/    # GameManager
│       ├── routes/  # REST API
│       └── websocket/# WebSocket handler
├── shared/          # Shared types
└── DEPLOYMENT.md    # Deployment guide
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
