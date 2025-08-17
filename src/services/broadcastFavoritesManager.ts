
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface BroadcastFavoriteEvent {
  type: 'restaurant_favorite_toggled' | 'dish_favorite_toggled' | 'favorites_sync';
  restaurantId?: number;
  dishId?: number;
  isFavorite?: boolean;
  userId: string;
  timestamp: number;
}

class BroadcastFavoritesManager {
  private static instance: BroadcastFavoritesManager;
  private channels: Map<string, RealtimeChannel> = new Map();

  private constructor() {}

  static getInstance(): BroadcastFavoritesManager {
    if (!BroadcastFavoritesManager.instance) {
      BroadcastFavoritesManager.instance = new BroadcastFavoritesManager();
    }
    return BroadcastFavoritesManager.instance;
  }

  // Setup broadcast channel for user favorites sync
  setupUserFavoritesChannel(userId: string, handlers: {
    onRestaurantFavoriteToggled?: (restaurantId: number, isFavorite: boolean) => void;
    onDishFavoriteToggled?: (dishId: number, isFavorite: boolean) => void;
    onFavoritesSync?: () => void;
  }): RealtimeChannel {
    console.log(`BroadcastFavoritesManager: Setting up favorites channel for user ${userId}`);
    
    const channelName = `user-favorites-${userId}`;
    
    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.removeChannel(channelName);
    }

    // Create new channel for favorites broadcasts
    const channel = supabase.channel(channelName);

    // Listen to broadcast events
    channel.on('broadcast', { event: 'favorite_update' }, (payload) => {
      console.log('BroadcastFavoritesManager: Received favorite update:', payload);
      
      const event = payload.payload as BroadcastFavoriteEvent;
      
      // Only process events from the same user (cross-tab sync)
      if (event.userId === userId) {
        switch (event.type) {
          case 'restaurant_favorite_toggled':
            if (event.restaurantId !== undefined && event.isFavorite !== undefined) {
              handlers.onRestaurantFavoriteToggled?.(event.restaurantId, event.isFavorite);
            }
            break;
          case 'dish_favorite_toggled':
            if (event.dishId !== undefined && event.isFavorite !== undefined) {
              handlers.onDishFavoriteToggled?.(event.dishId, event.isFavorite);
            }
            break;
          case 'favorites_sync':
            handlers.onFavoritesSync?.();
            break;
        }
      }
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`BroadcastFavoritesManager: Channel ${channelName} status:`, status);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Broadcast restaurant favorite toggle
  broadcastRestaurantFavorite(userId: string, restaurantId: number, isFavorite: boolean): void {
    const channelName = `user-favorites-${userId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      console.log(`BroadcastFavoritesManager: Broadcasting restaurant favorite ${restaurantId}:`, isFavorite);
      
      const event: BroadcastFavoriteEvent = {
        type: 'restaurant_favorite_toggled',
        restaurantId,
        isFavorite,
        userId,
        timestamp: Date.now()
      };

      channel.send({
        type: 'broadcast',
        event: 'favorite_update',
        payload: event
      });
    }
  }

  // Broadcast dish favorite toggle
  broadcastDishFavorite(userId: string, dishId: number, isFavorite: boolean): void {
    const channelName = `user-favorites-${userId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      console.log(`BroadcastFavoritesManager: Broadcasting dish favorite ${dishId}:`, isFavorite);
      
      const event: BroadcastFavoriteEvent = {
        type: 'dish_favorite_toggled',
        dishId,
        isFavorite,
        userId,
        timestamp: Date.now()
      };

      channel.send({
        type: 'broadcast',
        event: 'favorite_update',
        payload: event
      });
    }
  }

  // Broadcast favorites sync request
  broadcastFavoritesSync(userId: string): void {
    const channelName = `user-favorites-${userId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      console.log(`BroadcastFavoritesManager: Broadcasting favorites sync`);
      
      const event: BroadcastFavoriteEvent = {
        type: 'favorites_sync',
        userId,
        timestamp: Date.now()
      };

      channel.send({
        type: 'broadcast',
        event: 'favorite_update',
        payload: event
      });
    }
  }

  // Remove channel
  removeChannel(channelName: string): void {
    console.log(`BroadcastFavoritesManager: Removing channel ${channelName}`);
    
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Cleanup all channels
  cleanup(): void {
    console.log('BroadcastFavoritesManager: Cleaning up all channels');
    
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const broadcastFavoritesManager = BroadcastFavoritesManager.getInstance();
