/**
 * Server-side Push Notification Service
 * Handles sending push notifications via FCM (Android) and APNs (iOS)
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (for FCM)
let firebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized) {
    return;
  }

  try {
    // Initialize Firebase Admin SDK
    // You need to download your Firebase service account key and set the path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (!serviceAccountPath) {
      console.warn('Firebase service account path not set. Push notifications for Android will not work.');
      return;
    }

    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    firebaseAdminInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
  }
}

/**
 * Send push notification to a single device
 * @param {string} deviceToken - Device push token
 * @param {string} platform - 'ios' or 'android'
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data payload
 */
async function sendPushNotification(deviceToken, platform, notification, data = {}) {
  try {
    if (platform === 'android') {
      return await sendFCMNotification(deviceToken, notification, data);
    } else if (platform === 'ios') {
      return await sendAPNsNotification(deviceToken, notification, data);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error(`Error sending push notification to ${platform}:`, error);
    throw error;
  }
}

/**
 * Send FCM notification (Android)
 */
async function sendFCMNotification(deviceToken, notification, data = {}) {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }

  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  const message = {
    token: deviceToken,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      ...data,
      click_action: data.route || 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'default',
        priority: 'high',
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ FCM notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending FCM notification:', error);
    throw error;
  }
}

/**
 * Send APNs notification (iOS)
 * Note: This is a basic implementation. For production, you should use
 * a proper APNs library like node-apn or use Firebase Cloud Messaging
 * which supports both iOS and Android.
 */
async function sendAPNsNotification(deviceToken, notification, data = {}) {
  // For iOS, you can use Firebase Cloud Messaging which supports iOS
  // Or use a dedicated APNs library like node-apn
  
  // Using FCM for iOS (simpler approach)
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }

  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  const message = {
    token: deviceToken,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      ...data,
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: notification.title,
            body: notification.body,
          },
          sound: 'default',
          badge: data.badge || 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ APNs notification sent via FCM:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending APNs notification:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data payload
 */
async function sendPushNotificationToUsers(userIds, notification, data = {}) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get all device tokens for these users
    const { data: tokens, error } = await supabase
      .from('user_push_tokens')
      .select('device_token, platform')
      .in('user_id', userIds);

    if (error) {
      throw error;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found for users');
      return;
    }

    // Send notifications to all devices
    const promises = tokens.map(token =>
      sendPushNotification(token.device_token, token.platform, notification, data)
        .catch(err => {
          console.error(`Error sending to device ${token.device_token}:`, err);
          return null;
        })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Sent ${successful}/${tokens.length} notifications successfully`);

    return results;
  } catch (error) {
    console.error('Error sending push notifications to users:', error);
    throw error;
  }
}

/**
 * Send push notification to a single user (all their devices)
 * @param {string} userId - User ID
 * @param {object} notification - Notification payload
 * @param {object} data - Additional data payload
 */
async function sendPushNotificationToUser(userId, notification, data = {}) {
  return sendPushNotificationToUsers([userId], notification, data);
}

module.exports = {
  initializeFirebaseAdmin,
  sendPushNotification,
  sendPushNotificationToUser,
  sendPushNotificationToUsers,
  sendFCMNotification,
  sendAPNsNotification,
};
