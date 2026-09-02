# Render Deployment Guide

## Prerequisites

1. Render account (https://render.com)
2. MySQL database (can use Render's managed database)
3. GitHub repository connected to Render

## Steps to Deploy

### 1. Create MySQL Database on Render

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL" or use external MySQL provider
3. Note down the connection string (DATABASE_URL)

### 2. Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository `rsmdevlin/gameweb`
3. Configure:
   - **Name**: gameweb
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Starter (or higher for production)

### 3. Environment Variables

Add these in Render Dashboard → Environment:

```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app-name.onrender.com
PORT=10000
```

**Important**: Replace values with your actual credentials.

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically deploy from your main branch
3. Wait for build to complete (5-10 minutes first time)
4. Your app will be available at `https://your-app-name.onrender.com`

## Build Commands Reference

### Backend (Server)
```bash
npm install
npm run build --workspace=server
```

### Frontend (Client)
```bash
npm install
npm run build --workspace=client
```

### Full Build
```bash
npm install
npm run build
```

### Start Server
```bash
npm start
```

## Environment Variables Explained

- `DATABASE_URL`: MySQL connection string from your database provider
- `JWT_SECRET`: Random secret key for JWT token signing (generate with `openssl rand -base64 32`)
- `NODE_ENV`: Set to `production` for production deployment
- `ALLOWED_ORIGINS`: Your frontend URL (Render provides this after deploy)
- `PORT`: Render automatically sets this to 10000

## Post-Deployment

### Update Frontend API URL

Create `.env` file in `client/` directory (local development only):
```
VITE_API_URL=https://your-app-name.onrender.com
VITE_WS_URL=wss://your-app-name.onrender.com/ws
```

For production, update `client/src/main.ts`:
```typescript
const API_URL = 'https://your-app-name.onrender.com';
const WS_URL = 'wss://your-app-name.onrender.com/ws';
```

### Database Setup

On first deployment, tables will be created automatically by the backend.

### Test Your Deployment

1. Visit your Render URL
2. Register a new account
3. Create a game server
4. Test multiplayer in two browser tabs

## Troubleshooting

### "Cannot connect to database"
- Verify DATABASE_URL is correct
- Check database is running and accessible
- Ensure IP allowlist includes Render's IPs

### "WebSocket connection failed"
- Verify WS_URL uses `wss://` not `ws://`
- Check ALLOWED_ORIGINS includes your frontend URL

### "Build failed"
- Check build logs in Render dashboard
- Verify all dependencies in package.json
- Ensure Node version compatibility (18+)

### "Application Error"
- Check runtime logs in Render
- Verify all environment variables are set
- Check PORT is set to 10000

## Scaling

For production traffic:
- Upgrade to Professional plan ($25/mo)
- Add more instances for load balancing
- Consider Redis for session storage
- Use CDN for static assets

## Monitoring

Render provides:
- Real-time logs
- Metrics dashboard
- Auto-deploy on git push
- Health checks

## Cost Estimate

Free Tier:
- 750 hours/month
- Spins down after 15 min inactivity
- Good for testing

Paid Plans:
- Starter: $7/mo (always on)
- Professional: $25/mo (better performance)
- MySQL: $7-15/mo depending on provider

## Support

For issues:
- Check Render docs: https://render.com/docs
- GitHub issues: https://github.com/rsmdevlin/gameweb/issues
- Render community: https://community.render.com
