
import { broadcastManager } from './broadcastManager';

interface NotificationPayload {
  title: string;
  message: string;
  data?: any;
}

class NotificationBroadcaster {
  private static instance: NotificationBroadcaster;

  private constructor() {}

  static getInstance(): NotificationBroadcaster {
    if (!NotificationBroadcaster.instance) {
      NotificationBroadcaster.instance = new NotificationBroadcaster();
    }
    return NotificationBroadcaster.instance;
  }

  // Send favorite added notification
  notifyFavoriteAdded(userId: string, restaurantName: string, restaurantId: number) {
    const payload: NotificationPayload = {
      title: "¡Nuevo favorito!",
      message: `${restaurantName} ha sido guardado como favorito`,
      data: { restaurantId, restaurantName }
    };

    broadcastManager.sendBroadcast(
      `user-notifications-${userId}`, 
      'favorite_added', 
      payload
    );
  }

  // Send menu published notification
  notifyMenuPublished(userId: string, restaurantName: string, restaurantId: number) {
    const payload: NotificationPayload = {
      title: "¡Nuevo menú disponible!",
      message: `${restaurantName} ha publicado su menú del día`,
      data: { restaurantId, restaurantName }
    };

    broadcastManager.sendBroadcast(
      `user-notifications-${userId}`, 
      'menu_published', 
      payload
    );
  }

  // Send promotion active notification
  notifyPromotionActive(userId: string, restaurantName: string, promotionTitle: string, restaurantId: number) {
    const payload: NotificationPayload = {
      title: "¡Nueva promoción!",
      message: `${restaurantName}: ${promotionTitle}`,
      data: { restaurantId, restaurantName, promotionTitle }
    };

    broadcastManager.sendBroadcast(
      `user-notifications-${userId}`, 
      'promotion_active', 
      payload
    );
  }

  // Send event reminder notification
  notifyEventReminder(userId: string, eventName: string, restaurantName: string, eventId: number) {
    const payload: NotificationPayload = {
      title: "Recordatorio de evento",
      message: `${eventName} en ${restaurantName} es mañana`,
      data: { eventId, eventName, restaurantName }
    };

    broadcastManager.sendBroadcast(
      `user-notifications-${userId}`, 
      'event_reminder', 
      payload
    );
  }

  // Send bulk notifications to multiple users
  notifyMultipleUsers(userIds: string[], eventType: string, payload: NotificationPayload) {
    userIds.forEach(userId => {
      broadcastManager.sendBroadcast(
        `user-notifications-${userId}`, 
        eventType, 
        payload
      );
    });
  }
}

export const notificationBroadcaster = NotificationBroadcaster.getInstance();
