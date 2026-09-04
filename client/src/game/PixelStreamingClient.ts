export interface PixelStreamingConfig {
  signalServerUrl: string;
  autoConnect?: boolean;
  autoPlay?: boolean;
}

export interface PixelStreamingStats {
  fps: number;
  bitrate: number;
  latency: number;
  packetsLost: number;
}

export class PixelStreamingClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private signalServerUrl: string;
  private videoElement: HTMLVideoElement;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private config: PixelStreamingConfig;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onStatsCallback?: (stats: PixelStreamingStats) => void;

  constructor(videoElement: HTMLVideoElement, config: PixelStreamingConfig) {
    this.videoElement = videoElement;
    this.config = config;
    this.signalServerUrl = config.signalServerUrl;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.signalServerUrl);

        this.ws.onopen = () => {
          console.log('Pixel Streaming: Connected to signaling server');
          this.setupPeerConnection();
          resolve();
        };

        this.ws.onmessage = async (event) => {
          await this.handleSignalingMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('Pixel Streaming: WebSocket error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Pixel Streaming: Disconnected from signaling server');
          this.handleDisconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupPeerConnection() {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ],
      sdpSemantics: 'unified-plan'
    };

    this.peerConnection = new RTCPeerConnection(config);

    // Handle incoming tracks (video/audio from UE5)
    this.peerConnection.ontrack = (event) => {
      console.log('Pixel Streaming: Received track', event.track.kind);
      if (event.track.kind === 'video') {
        this.videoElement.srcObject = event.streams[0];
        if (this.config.autoPlay) {
          this.videoElement.play().catch(e => console.warn('Autoplay prevented', e));
        }
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.sendSignalingMessage({
          type: 'iceCandidate',
          candidate: event.candidate
        });
      }
    };

    // Handle connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Pixel Streaming: Connection state:', state);

      if (state === 'connected') {
        this.isConnected = true;
        this.onConnectedCallback?.();
        this.startStatsMonitoring();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.handleDisconnect();
      }
    };

    // Create data channel for input
    this.dataChannel = this.peerConnection.createDataChannel('inputChannel', {
      ordered: true
    });

    this.dataChannel.onopen = () => {
      console.log('Pixel Streaming: Data channel opened');
    };

    this.dataChannel.onclose = () => {
      console.log('Pixel Streaming: Data channel closed');
    };

    // Create and send offer
    this.createOffer();
  }

  private async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });

      await this.peerConnection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        sdp: offer.sdp
      });
    } catch (error) {
      console.error('Pixel Streaming: Failed to create offer', error);
    }
  }

  private async handleSignalingMessage(data: string) {
    const message = JSON.parse(data);

    switch (message.type) {
      case 'answer':
        if (this.peerConnection) {
          await this.peerConnection.setRemoteDescription({
            type: 'answer',
            sdp: message.sdp
          });
        }
        break;

      case 'iceCandidate':
        if (this.peerConnection && message.candidate) {
          await this.peerConnection.addIceCandidate(message.candidate);
        }
        break;

      case 'config':
        console.log('Pixel Streaming: Received config', message);
        break;

      default:
        console.warn('Pixel Streaming: Unknown message type', message.type);
    }
  }

  private sendSignalingMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Send input events to UE5
  sendInput(descriptor: number, data: ArrayBuffer | string) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return;
    }

    const payload = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

    const message = new Uint8Array(1 + payload.length);
    message[0] = descriptor;
    message.set(payload, 1);

    this.dataChannel.send(message);
  }

  // Input descriptors matching UE5 Pixel Streaming protocol
  sendKeyDown(keyCode: number) {
    const data = new ArrayBuffer(2);
    const view = new DataView(data);
    view.setUint16(0, keyCode, true);
    this.sendInput(0x01, data); // KeyDown descriptor
  }

  sendKeyUp(keyCode: number) {
    const data = new ArrayBuffer(2);
    const view = new DataView(data);
    view.setUint16(0, keyCode, true);
    this.sendInput(0x02, data); // KeyUp descriptor
  }

  sendMouseMove(x: number, y: number, deltaX: number, deltaY: number) {
    const data = new ArrayBuffer(8);
    const view = new DataView(data);
    view.setUint16(0, x, true);
    view.setUint16(2, y, true);
    view.setInt16(4, deltaX, true);
    view.setInt16(6, deltaY, true);
    this.sendInput(0x03, data); // MouseMove descriptor
  }

  sendMouseDown(button: number, x: number, y: number) {
    const data = new ArrayBuffer(5);
    const view = new DataView(data);
    view.setUint8(0, button);
    view.setUint16(1, x, true);
    view.setUint16(3, y, true);
    this.sendInput(0x04, data); // MouseDown descriptor
  }

  sendMouseUp(button: number, x: number, y: number) {
    const data = new ArrayBuffer(5);
    const view = new DataView(data);
    view.setUint8(0, button);
    view.setUint16(1, x, true);
    view.setUint16(3, y, true);
    this.sendInput(0x05, data); // MouseUp descriptor
  }

  sendTouchStart(x: number, y: number, touchIndex: number) {
    const data = new ArrayBuffer(9);
    const view = new DataView(data);
    view.setUint16(0, x, true);
    view.setUint16(2, y, true);
    view.setUint8(4, touchIndex);
    view.setFloat32(5, 1.0, true); // Force
    this.sendInput(0x0B, data); // TouchStart descriptor
  }

  sendTouchMove(x: number, y: number, touchIndex: number) {
    const data = new ArrayBuffer(9);
    const view = new DataView(data);
    view.setUint16(0, x, true);
    view.setUint16(2, y, true);
    view.setUint8(4, touchIndex);
    view.setFloat32(5, 1.0, true);
    this.sendInput(0x0C, data); // TouchMove descriptor
  }

  sendTouchEnd(x: number, y: number, touchIndex: number) {
    const data = new ArrayBuffer(5);
    const view = new DataView(data);
    view.setUint16(0, x, true);
    view.setUint16(2, y, true);
    view.setUint8(4, touchIndex);
    this.sendInput(0x0D, data); // TouchEnd descriptor
  }

  private statsInterval?: number;

  private startStatsMonitoring() {
    this.statsInterval = window.setInterval(async () => {
      if (!this.peerConnection) return;

      const stats = await this.peerConnection.getStats();
      let fps = 0;
      let bitrate = 0;
      let latency = 0;
      let packetsLost = 0;

      stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          fps = report.framesPerSecond || 0;
          bitrate = report.bytesReceived || 0;
          packetsLost = report.packetsLost || 0;
        }
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          latency = report.currentRoundTripTime || 0;
        }
      });

      this.onStatsCallback?.({
        fps: Math.round(fps),
        bitrate: Math.round(bitrate / 1000), // KB/s
        latency: Math.round(latency * 1000), // ms
        packetsLost
      });
    }, 1000);
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.onDisconnectedCallback = callback;
  }

  onStats(callback: (stats: PixelStreamingStats) => void) {
    this.onStatsCallback = callback;
  }

  private handleDisconnect() {
    this.isConnected = false;
    this.onDisconnectedCallback?.();

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    this.isConnected = false;
    this.videoElement.srcObject = null;
  }

  isStreamConnected(): boolean {
    return this.isConnected;
  }
}
