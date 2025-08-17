
interface BroadcastEvent {
  type: string;
  payload: any;
  timestamp: number;
}

interface BroadcastChannelConfig {
  name: string;
  events: string[];
  handler: (event: BroadcastEvent) => void;
}

class BroadcastManager {
  private static instance: BroadcastManager;
  private channels: Map<string, BroadcastChannel> = new Map();
  private handlers: Map<string, (event: BroadcastEvent) => void> = new Map();

  private constructor() {}

  static getInstance(): BroadcastManager {
    if (!BroadcastManager.instance) {
      BroadcastManager.instance = new BroadcastManager();
    }
    return BroadcastManager.instance;
  }

  setupBroadcastChannel(config: BroadcastChannelConfig): void {
    console.log(`BroadcastManager: Setting up channel ${config.name}`);
    
    // Create broadcast channel
    const channel = new BroadcastChannel(config.name);
    
    // Setup message handler
    const handler = (event: MessageEvent) => {
      const broadcastEvent = event.data as BroadcastEvent;
      
      if (config.events.includes(broadcastEvent.type)) {
        console.log(`BroadcastManager: Received event ${broadcastEvent.type}:`, broadcastEvent.payload);
        config.handler(broadcastEvent);
      }
    };

    channel.addEventListener('message', handler);
    
    // Store references
    this.channels.set(config.name, channel);
    this.handlers.set(config.name, config.handler);
  }

  sendBroadcast(channelName: string, eventType: string, payload: any): void {
    const channel = this.channels.get(channelName);
    
    if (channel) {
      const event: BroadcastEvent = {
        type: eventType,
        payload,
        timestamp: Date.now()
      };
      
      console.log(`BroadcastManager: Sending broadcast ${eventType} on ${channelName}:`, payload);
      channel.postMessage(event);
    } else {
      console.warn(`BroadcastManager: Channel ${channelName} not found`);
    }
  }

  removeBroadcastChannel(channelName: string): void {
    console.log(`BroadcastManager: Removing broadcast channel ${channelName}`);
    
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.close();
      this.channels.delete(channelName);
      this.handlers.delete(channelName);
    }
  }

  cleanup(): void {
    console.log('BroadcastManager: Cleaning up all channels');
    
    this.channels.forEach((channel, name) => {
      channel.close();
    });
    
    this.channels.clear();
    this.handlers.clear();
  }
}

export const broadcastManager = BroadcastManager.getInstance();
