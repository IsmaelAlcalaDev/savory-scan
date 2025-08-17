
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  private channels: Map<string, RealtimeChannel> = new Map();

  private constructor() {}

  static getInstance(): BroadcastManager {
    if (!BroadcastManager.instance) {
      BroadcastManager.instance = new BroadcastManager();
    }
    return BroadcastManager.instance;
  }

  // Setup broadcast channel for custom events
  setupBroadcastChannel(config: BroadcastChannelConfig): RealtimeChannel {
    console.log(`BroadcastManager: Setting up broadcast channel ${config.name}`);
    
    // Remove existing channel if it exists
    if (this.channels.has(config.name)) {
      this.removeBroadcastChannel(config.name);
    }

    // Create new channel for broadcasts
    const channel = supabase.channel(config.name);

    // Listen to broadcast events
    config.events.forEach(eventType => {
      channel.on('broadcast', { event: eventType }, (payload) => {
        console.log(`BroadcastManager: Received broadcast ${eventType}:`, payload);
        
        const broadcastEvent: BroadcastEvent = {
          type: eventType,
          payload: payload.payload,
          timestamp: Date.now()
        };
        
        config.handler(broadcastEvent);
      });
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`BroadcastManager: Channel ${config.name} status:`, status);
    });

    this.channels.set(config.name, channel);
    return channel;
  }

  // Send broadcast event
  sendBroadcast(channelName: string, eventType: string, payload: any): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      console.log(`BroadcastManager: Sending broadcast ${eventType} to ${channelName}:`, payload);
      
      channel.send({
        type: 'broadcast',
        event: eventType,
        payload: {
          payload,
          timestamp: Date.now()
        }
      });
    } else {
      console.warn(`BroadcastManager: Channel ${channelName} not found`);
    }
  }

  // Remove broadcast channel
  removeBroadcastChannel(channelName: string): void {
    console.log(`BroadcastManager: Removing broadcast channel ${channelName}`);
    
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Cleanup all channels
  cleanup(): void {
    console.log('BroadcastManager: Cleaning up all broadcast channels');
    
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Get channel status
  getChannelStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.channels.forEach((channel, name) => {
      status[name] = channel.state;
    });
    return status;
  }
}

export const broadcastManager = BroadcastManager.getInstance();
