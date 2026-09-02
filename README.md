# GameWeb - 3D Multiplayer Prop Hunt

A full-featured browser-based 3D multiplayer Prop Hunt game built with Three.js and WebSocket.

## Tech Stack

- **Frontend**: TypeScript + Three.js + Vite
- **Backend**: Node.js + TypeScript + WebSocket
- **Database**: MySQL
- **Deployment**: Render

## Features

- User authentication and profiles
- Server browser with custom servers
- Real-time multiplayer gameplay
- 3D third-person characters
- Prop Hunt game mode (Hunters vs Props)
- Interactive 3D maps
- Real-time chat
- Desktop (WASD + mouse) and mobile controls
- Responsive landscape/portrait handling

## Local Development

### Prerequisites

- Node.js 18+
- MySQL database
- npm or yarn

### Setup

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
DATABASE_URL=mysql://user:password@host:port/database
PORT=3000
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

4. Run development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

## Deployment (Render)

### Environment Variables

Set these in Render dashboard:

- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Auto-set by Render
- `NODE_ENV=production`
- `ALLOWED_ORIGINS` - Your frontend URL

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

## Project Structure

```
gameweb/
├── client/          # Frontend (Vite + Three.js)
├── server/          # Backend (Node.js + WebSocket)
├── shared/          # Shared types and interfaces
└── assets/          # 3D models and resources
```

## Game Controls

### Desktop
- **WASD** - Movement
- **Mouse** - Camera control
- **Space** - Jump
- **E** - Transform (Props)
- **Left Click** - Attack (Hunters)

### Mobile
- **Virtual joystick** - Movement
- **Swipe** - Camera control
- **On-screen buttons** - Actions

## License

See ASSETS.md for 3D model licenses and attributions.
