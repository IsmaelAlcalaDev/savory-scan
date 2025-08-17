
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
  debounceTimer?: NodeJS.Timeout;
}

interface ChannelCache {
  channel: RealtimeChannel;
  config: ChannelConfig;
  createdAt: number;
  lastUsed: number;
  subscriptionCount: number;
}

class EnhancedRealtimeManager {
  private static instance: EnhancedRealtimeManager;
  private channelCache: Map<string, ChannelCache> = new Map();
  private viewportTrackers: Map<string, ViewportTracker> = new Map();
  private readonly CHANNEL_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly DEBOUNCE_DELAY = 400; // 400ms debounce
  private cleanupInterval?: NodeJS.Timeout;
  private reconnectionCount = 0;
  private filterUpdateCount = 0;

  private constructor() {
    this.startCleanupInterval();
    this.setupGlobalCleanup();
  }

  static getInstance(): EnhancedRealtimeManager {
    if (!EnhancedRealtimeManager.instance) {
      EnhancedRealtimeManager.instance = new EnhancedRealtimeManager();
    }
    return EnhancedRealtimeManager.instance;
  }

  // Setup channel with reuse and TTL
  setupChannel(config: ChannelConfig): RealtimeChannel {
    console.log(`EnhancedRealtimeManager: Setting up channel ${config.name}`);
    
    const now = Date.now();
    const existingCache = this.channelCache.get(config.name);

    // Check if we can reuse existing channel
    if (existingCache && this.canReuseChannel(existingCache, now)) {
      console.log(`EnhancedRealtimeManager: Reusing existing channel ${config.name}`);
      
      // Update usage stats
      existingCache.lastUsed = now;
      existingCache.subscriptionCount++;
      
      // Check if filters need updating
      if (this.filtersChanged(existingCache.config, config)) {
        console.log(`EnhancedRealtimeManager: Updating filters for channel ${config.name}`);
        this.updateChannelFilters(existingCache, config);
        this.filterUpdateCount++;
      }
      
      return existingCache.channel;
    }

    // Remove old channel if exists
    if (existingCache) {
      console.log(`EnhancedRealtimeManager: Removing expired channel ${config.name}`);
      this.removeChannelFromCache(config.name);
      this.reconnectionCount++;
    }

    // Create new channel
    const channel = this.createNewChannel(config);
    
    // Cache the channel
    this.channelCache.set(config.name, {
      channel,
      config,
      createdAt: now,
      lastUsed: now,
      subscriptionCount: 1
    });

    return channel;
  }

  // Setup viewport tracking with debounce
  setupViewportTracking(
    trackerId: string,
    containerSelector: string,
    itemSelector: string,
    getItemId: (element: Element) => number,
    onVisibleIdsChange: (visibleIds: number[]) => void
  ): void {
    console.log(`EnhancedRealtimeManager: Setting up viewport tracking for ${trackerId}`);

    // Cleanup existing tracker
    if (this.viewportTrackers.has(trackerId)) {
      const tracker = this.viewportTrackers.get(trackerId)!;
      tracker.observer?.disconnect();
      if (tracker.debounceTimer) {
        clearTimeout(tracker.debounceTimer);
      }
    }

    const visibleIds = new Set<number>();
    
    // Debounced callback
    const debouncedCallback = (newVisibleIds: number[]) => {
      const tracker = this.viewportTrackers.get(trackerId);
      if (tracker?.debounceTimer) {
        clearTimeout(tracker.debounceTimer);
      }
      
      if (tracker) {
        tracker.debounceTimer = setTimeout(() => {
          console.log(`EnhancedRealtimeManager: Debounced viewport change for ${trackerId}:`, newVisibleIds);
          onVisibleIdsChange(newVisibleIds);
        }, this.DEBOUNCE_DELAY);
      }
    };

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
          debouncedCallback(Array.from(visibleIds));
        }
      },
      {
        root: document.querySelector(containerSelector),
        rootMargin: '100px',
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

  // Remove channel and cleanup
  removeChannel(channelName: string): void {
    console.log(`EnhancedRealtimeManager: Removing channel ${channelName}`);
    this.removeChannelFromCache(channelName);
  }

  // Remove viewport tracker
  removeViewportTracking(trackerId: string): void {
    console.log(`EnhancedRealtimeManager: Removing viewport tracking for ${trackerId}`);
    
    const tracker = this.viewportTrackers.get(trackerId);
    if (tracker) {
      tracker.observer?.disconnect();
      if (tracker.debounceTimer) {
        clearTimeout(tracker.debounceTimer);
      }
      this.viewportTrackers.delete(trackerId);
    }
  }

  // Private helper methods
  private canReuseChannel(cache: ChannelCache, now: number): boolean {
    const age = now - cache.createdAt;
    const timeSinceLastUse = now - cache.lastUsed;
    
    return age < this.CHANNEL_TTL && 
           timeSinceLastUse < this.CHANNEL_TTL && 
           cache.channel.state === 'joined';
  }

  private filtersChanged(oldConfig: ChannelConfig, newConfig: ChannelConfig): boolean {
    if (oldConfig.subscriptions.length !== newConfig.subscriptions.length) {
      return true;
    }
    
    return oldConfig.subscriptions.some((oldSub, index) => {
      const newSub = newConfig.subscriptions[index];
      return oldSub.filter !== newSub.filter;
    });
  }

  private updateChannelFilters(cache: ChannelCache, newConfig: ChannelConfig): void {
    // For now, we recreate the channel if filters change significantly
    // In a more advanced implementation, we could try to update subscriptions dynamically
    console.log(`EnhancedRealtimeManager: Filters changed significantly, will recreate on next setup`);
    cache.config = newConfig;
  }

  private createNewChannel(config: ChannelConfig): RealtimeChannel {
    console.log(`EnhancedRealtimeManager: Creating new channel ${config.name}`);
    
    let channel = supabase.channel(config.name);

    // Add all subscriptions to the channel
    config.subscriptions.forEach(sub => {
      console.log(`EnhancedRealtimeManager: Adding subscription for ${sub.table} ${sub.event}`);
      
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
          console.log(`EnhancedRealtimeManager: Received ${sub.event} for ${sub.table}:`, payload);
          sub.handler(payload);
        }
      );
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`EnhancedRealtimeManager: Channel ${config.name} status:`, status);
    });

    return channel;
  }

  private removeChannelFromCache(channelName: string): void {
    const cache = this.channelCache.get(channelName);
    if (cache) {
      supabase.removeChannel(cache.channel);
      this.channelCache.delete(channelName);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredChannels();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private cleanupExpiredChannels(): void {
    const now = Date.now();
    console.log('EnhancedRealtimeManager: Running cleanup for expired channels');
    
    this.channelCache.forEach((cache, name) => {
      if (!this.canReuseChannel(cache, now)) {
        console.log(`EnhancedRealtimeManager: Cleaning up expired channel ${name}`);
        this.removeChannelFromCache(name);
      }
    });
  }

  private setupGlobalCleanup(): void {
    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  // Cleanup all channels and trackers
  cleanup(): void {
    console.log('EnhancedRealtimeManager: Cleaning up all channels and trackers');
    
    this.channelCache.forEach((cache, name) => {
      supabase.removeChannel(cache.channel);
    });
    this.channelCache.clear();

    this.viewportTrackers.forEach((tracker, id) => {
      tracker.observer?.disconnect();
      if (tracker.debounceTimer) {
        clearTimeout(tracker.debounceTimer);
      }
    });
    this.viewportTrackers.clear();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Get current channel status and metrics
  getStatus(): {
    channels: Record<string, string>;
    metrics: {
      channelCount: number;
      reconnectionCount: number;
      filterUpdateCount: number;
      oldestChannelAge: number;
    };
  } {
    const channels: Record<string, string> = {};
    let oldestAge = 0;
    const now = Date.now();
    
    this.channelCache.forEach((cache, name) => {
      channels[name] = cache.channel.state;
      const age = now - cache.createdAt;
      if (age > oldestAge) {
        oldestAge = age;
      }
    });

    return {
      channels,
      metrics: {
        channelCount: this.channelCache.size,
        reconnectionCount: this.reconnectionCount,
        filterUpdateCount: this.filterUpdateCount,
        oldestChannelAge: oldestAge
      }
    };
  }
}

export const enhancedRealtimeManager = EnhancedRealtimeManager.getInstance();
