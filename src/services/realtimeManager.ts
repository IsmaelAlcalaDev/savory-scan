
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChannelConfig {
  name: string;
  subscriptions: SubscriptionConfig[];
}

interface SubscriptionConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  handler: (payload: any) => void;
}

interface ViewportTracker {
  elementIds: Set<number>;
  observer: IntersectionObserver | null;
  callback: (visibleIds: number[]) => void;
}

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, RealtimeChannel> = new Map();
  private viewportTrackers: Map<string, ViewportTracker> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  // Create or update a channel with consolidated subscriptions
  setupChannel(config: ChannelConfig): RealtimeChannel {
    console.log(`RealtimeManager: Setting up channel ${config.name}`);
    
    // Remove existing channel if it exists
    if (this.channels.has(config.name)) {
      this.removeChannel(config.name);
    }

    // Create new channel
    let channel = supabase.channel(config.name);

    // Add all subscriptions to the channel
    config.subscriptions.forEach(sub => {
      console.log(`RealtimeManager: Adding subscription for ${sub.table} ${sub.event}`);
      
      const subscriptionConfig: any = {
        event: sub.event,
        schema: 'public',
        table: sub.table
      };

      if (sub.filter) {
        subscriptionConfig.filter = sub.filter;
      }

      channel = channel.on(
        'postgres_changes',
        subscriptionConfig,
        (payload) => {
          console.log(`RealtimeManager: Received ${sub.event} for ${sub.table}:`, payload);
          sub.handler(payload);
        }
      );
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`RealtimeManager: Channel ${config.name} status:`, status);
    });

    this.channels.set(config.name, channel);
    return channel;
  }

  // Update filter for existing channel (for viewport changes)
  updateChannelFilters(channelName: string, newConfig: ChannelConfig): void {
    console.log(`RealtimeManager: Updating filters for channel ${channelName}`);
    
    // Re-create the channel with new filters
    this.setupChannel(newConfig);
  }

  // Setup viewport tracking for dynamic filtering
  setupViewportTracking(
    trackerId: string,
    containerSelector: string,
    itemSelector: string,
    getItemId: (element: Element) => number,
    onVisibleIdsChange: (visibleIds: number[]) => void
  ): void {
    console.log(`RealtimeManager: Setting up viewport tracking for ${trackerId}`);

    // Cleanup existing tracker
    if (this.viewportTrackers.has(trackerId)) {
      const tracker = this.viewportTrackers.get(trackerId)!;
      tracker.observer?.disconnect();
    }

    const visibleIds = new Set<number>();
    
    const observer = new IntersectionObserver(
      (entries) => {
        let hasChanges = false;
        
        entries.forEach(entry => {
          const id = getItemId(entry.target);
          
          if (entry.isIntersecting) {
            if (!visibleIds.has(id)) {
              visibleIds.add(id);
              hasChanges = true;
            }
          } else {
            if (visibleIds.has(id)) {
              visibleIds.delete(id);
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          console.log(`RealtimeManager: Viewport changed for ${trackerId}, visible IDs:`, Array.from(visibleIds));
          onVisibleIdsChange(Array.from(visibleIds));
        }
      },
      {
        root: document.querySelector(containerSelector),
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    // Observe existing items
    const items = document.querySelectorAll(itemSelector);
    items.forEach(item => observer.observe(item));

    this.viewportTrackers.set(trackerId, {
      elementIds: visibleIds,
      observer,
      callback: onVisibleIdsChange
    });
  }

  // Observe new elements for existing viewport tracker
  observeElements(trackerId: string, elements: Element[]): void {
    const tracker = this.viewportTrackers.get(trackerId);
    if (tracker?.observer) {
      elements.forEach(element => tracker.observer!.observe(element));
    }
  }

  // Remove a channel and cleanup
  removeChannel(channelName: string): void {
    console.log(`RealtimeManager: Removing channel ${channelName}`);
    
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Remove viewport tracker
  removeViewportTracking(trackerId: string): void {
    console.log(`RealtimeManager: Removing viewport tracking for ${trackerId}`);
    
    const tracker = this.viewportTrackers.get(trackerId);
    if (tracker) {
      tracker.observer?.disconnect();
      this.viewportTrackers.delete(trackerId);
    }
  }

  // Cleanup all channels and trackers
  cleanup(): void {
    console.log('RealtimeManager: Cleaning up all channels and trackers');
    
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();

    this.viewportTrackers.forEach((tracker, id) => {
      tracker.observer?.disconnect();
    });
    this.viewportTrackers.clear();
  }

  // Get current channel status
  getChannelStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.channels.forEach((channel, name) => {
      status[name] = channel.state;
    });
    return status;
  }
}

export const realtimeManager = RealtimeManager.getInstance();
