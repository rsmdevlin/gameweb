# Prop Hunt - Unreal Engine 5 Project

This directory contains the Unreal Engine 5 project for the browser-based multiplayer Prop Hunt game.

## Quick Start

### Prerequisites
- Unreal Engine 5.3+ (download from Epic Games Launcher)
- Visual Studio 2022 (for C++ compilation)
- Git LFS (for large assets)
- 16GB+ RAM, GPU with 6GB+ VRAM

### Create UE5 Project

1. Open Epic Games Launcher → Unreal Engine
2. Create New Project:
   - Template: **Third Person**
   - Project Type: **C++** or **Blueprint** (C++ recommended for performance)
   - Project Location: `C:\Users\myteg\Desktop\gameweb\unreal\PropHuntGame`
   - Name: `PropHuntGame`

3. Enable Required Plugins:
   - Edit → Plugins:
     - ✅ Pixel Streaming
     - ✅ Enhanced Input
     - ✅ Online Subsystem (NULL for testing)

4. Configure Project Settings:
   - Edit → Project Settings:
     - **Maps & Modes**: Set default GameMode
     - **Input**: Enable Enhanced Input
     - **Pixel Streaming**: Configure quality settings
     - **Networking**: Enable dedicated server support

### Build Configurations

#### Development (Client)
```bash
# Build client for testing
"C:\Program Files\Epic Games\UE_5.3\Engine\Build\BatchFiles\RunUAT.bat" BuildCookRun -project="PropHuntGame.uproject" -platform=Win64 -clientconfig=Development -cook -stage -pak
```

#### Dedicated Server (Linux)
```bash
# Build dedicated server for deployment
"C:\Program Files\Epic Games\UE_5.3\Engine\Build\BatchFiles\RunUAT.bat" BuildCookRun -project="PropHuntGame.uproject" -platform=Linux -serverconfig=Development -server -noclient -cook -stage -pak
```

## Project Structure

```
PropHuntGame/
├── Content/
│   ├── Characters/          # Player character assets
│   ├── Maps/
│   │   └── AbandonedHotel/  # Main map
│   ├── Props/               # Transformable props
│   ├── Weapons/             # Hunter weapons
│   ├── UI/                  # In-game HUD
│   ├── Audio/               # Sound effects & music
│   └── GameModes/           # Prop Hunt game logic
├── Source/
│   └── PropHuntGame/
│       ├── GameModes/
│       ├── Characters/
│       ├── Gameplay/
│       └── Networking/
└── Config/
    ├── DefaultEngine.ini
    ├── DefaultGame.ini
    └── DefaultInput.ini
```

## Pixel Streaming Setup

1. **Enable Plugin**: Edit → Plugins → Pixel Streaming
2. **Configure Settings**: Edit → Project Settings → Pixel Streaming:
   - Encoder: H.264 or VP9
   - Resolution: 1920x1080
   - Max Bitrate: 20000 kbps
   - Target FPS: 60

3. **Run with Pixel Streaming**:
```bash
PropHuntGame.exe -RenderOffScreen -PixelStreamingIP=localhost -PixelStreamingPort=8888
```

4. **Signaling Server** (already in Node.js backend):
   - Uses WebRTC for streaming
   - Integrated with existing WebSocket server

## Integration with Backend

The UE5 server communicates with Node.js backend via:
- **HTTP**: Instance registration, heartbeats
- **WebSocket**: Real-time game state, player actions

```cpp
// Example: Send heartbeat to backend
void AGameServerActor::SendHeartbeat()
{
    FString URL = "http://localhost:3000/api/unreal/heartbeat";
    FString InstanceId = GetInstanceId();
    
    TSharedRef<IHttpRequest> Request = Http->CreateRequest();
    Request->SetVerb("POST");
    Request->SetURL(URL);
    Request->SetHeader("Content-Type", "application/json");
    Request->SetContentAsString(FString::Printf(TEXT("{\"instanceId\":\"%s\"}"), *InstanceId));
    Request->ProcessRequest();
}
```

## Development Workflow

### 1. Character Setup
- Import character model (Mixamo/ReadyPlayerMe)
- Setup Animation Blueprint
- Implement movement replication

### 2. Map Creation
- Design Abandoned Hotel layout
- Import assets (Quixel Megascans)
- Setup lighting (Lumen)
- Place props and spawn points

### 3. Gameplay Implementation
- Create Prop Hunt GameMode
- Implement prop transformation
- Add hunter weapon system
- Setup round phases

### 4. Multiplayer
- Enable dedicated server
- Setup replication
- Test with multiple clients

### 5. Pixel Streaming
- Package with Pixel Streaming
- Deploy to GPU server
- Connect from browser

## Testing

### Local Multiplayer Test
1. Launch server:
```bash
PropHuntGameServer.exe -log
```

2. Launch 2 clients:
```bash
PropHuntGame.exe 127.0.0.1
PropHuntGame.exe 127.0.0.1
```

### Pixel Streaming Test
1. Start signaling server (Node.js backend already has it)
2. Launch UE5 with Pixel Streaming
3. Open browser to `http://localhost:5173`
4. Click PLAY → should stream UE5

## Performance Targets

- **Server FPS**: 60+ (headless)
- **Client FPS**: 60+ (1080p on mid-range GPU)
- **Network Latency**: <100ms
- **Pixel Streaming Latency**: <150ms
- **Max Players**: 8 per instance

## Asset Guidelines

### Character
- Polycount: 20k-40k tris
- Textures: 2K
- Animations: 30-60 FPS

### Props
- Polycount: 500-5k tris per prop
- Textures: 1K-2K
- Total props on map: 100-150

### Map
- Size: 100m x 100m (small/medium)
- Lighting: Lumen GI
- Optimization: LODs, Nanite for static meshes

## Troubleshooting

**Issue**: Pixel Streaming not working
- Check firewall allows WebRTC ports
- Verify signaling server is running
- Check browser console for errors

**Issue**: Multiplayer desync
- Verify replication is enabled on Actors
- Check server authority on movement
- Enable network profiling

**Issue**: Low FPS
- Enable stat commands: `stat fps`, `stat unit`
- Profile GPU: `profilegpu`
- Reduce shadow quality or distance

## Resources

- [UE5 Documentation](https://docs.unrealengine.com/5.3/)
- [Pixel Streaming Guide](https://docs.unrealengine.com/5.3/pixel-streaming-in-unreal-engine/)
- [Multiplayer Programming](https://docs.unrealengine.com/5.3/networking-and-multiplayer-in-unreal-engine/)
- [Quixel Megascans](https://quixel.com/megascans)

## Next Steps

See [ROADMAP.md](./ROADMAP.md) for detailed development plan.

**Current Phase**: Phase 1 - UE5 Project Setup
