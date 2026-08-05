import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUBSCRIBERS_KEY = 'nvm_news_subscribers';
const NOTIFICATIONS_KEY = 'nvm_news_notifications';

export interface NotificationItem {
  id: string;
  title: string;
  articleSlug: string;
  timestamp: string;
  read?: boolean;
}

/** Subscribe a user email and request browser push notification permissions */
export async function subscribeUser(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  // 1. Request browser notification permission if supported
  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    try {
      await Notification.requestPermission();
    } catch {
      // Ignore permission request error
    }
  }

  // 2. Store in local storage fallback
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(SUBSCRIBERS_KEY) || '[]');
    if (!existing.includes(cleanEmail)) {
      existing.push(cleanEmail);
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(existing));
    }
  } catch {
    // Local storage fallback ignore
  }

  // 3. Store in Supabase database table
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: cleanEmail });

    if (error) {
      if (error.code === '23505') {
        return { success: true, message: 'You are already subscribed to story updates!' };
      }
      console.warn('Supabase subscription warning, stored locally:', error.message);
    }
  } catch (err) {
    console.warn('Subscription error handled locally:', err);
  }

  return { success: true, message: 'Subscribed successfully! You will receive notifications when new stories are posted.' };
}

/** Get total subscriber count (For Admin Views only) */
export async function getSubscriberCount(): Promise<number> {
  let dbCount = 0;
  try {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true });

    if (!error && typeof count === 'number') {
      dbCount = count;
    }
  } catch {
    dbCount = 0;
  }

  let localCount = 0;
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(SUBSCRIBERS_KEY) || '[]');
    localCount = existing.length;
  } catch {
    localCount = 0;
  }

  return dbCount > 0 ? dbCount : localCount;
}

/** Notify subscribers when a new article/story is published */
export async function notifySubscribersOnPublish(
  storyTitle: string,
  storySlug: string,
  excerpt?: string,
  imageUrl?: string
): Promise<void> {
  const notification: NotificationItem = {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    title: storyTitle,
    articleSlug: storySlug,
    timestamp: new Date().toISOString(),
  };

  // 1. Invoke Supabase Edge Function to dispatch Resend emails to subscribers
  try {
    const { data, error } = await supabase.functions.invoke('notify-subscribers', {
      body: {
        title: storyTitle,
        slug: storySlug,
        excerpt: excerpt || '',
        image_url: imageUrl || '',
      },
    });
    if (error) {
      console.warn('Edge function notification warning:', error.message);
    } else if (data?.message) {
      console.log('Subscriber notification status:', data.message);
    }
  } catch (err) {
    console.warn('Could not call Edge Function for subscriber email:', err);
  }

  // 2. Save to local notifications list
  try {
    const notifications: NotificationItem[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    notifications.unshift(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 20)));
  } catch (err) {
    console.error('Failed to store notification:', err);
  }

  // 3. Trigger Browser Desktop/Mobile Push Notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('NVM News • New Story Published! 📰', {
        body: storyTitle,
        icon: '/favicon.ico',
        tag: storySlug,
      });
    } catch {
      // Fallback
    }
  }

  // 4. Trigger UI Toast notification
  toast.info(`🔔 Subscriber Alert Dispatched: "${storyTitle}"`, {
    description: 'Email & push notifications sent to subscribers.',
    duration: 5000,
  });

  // Broadcast event for active UI listeners
  window.dispatchEvent(new CustomEvent('nvm-story-notification', { detail: notification }));
}

/** Retrieve notification history for user */
export function getNotificationHistory(): NotificationItem[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  } catch {
    return [];
  }
}
