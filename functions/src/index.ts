import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Triggered when a new notification is created in the 'notifications' collection.
 * Uses the modern FCM HTTP v1 API for reliable delivery.
 */
export const sendPushNotifications = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snapshot) => {
    const notificationData = snapshot.data();

    if (!notificationData) {
      console.log("No data associated with the notification.");
      return;
    }

    try {
      // Get all active FCM tokens
      const tokensSnapshot = await db.collection("fcmTokens").get();

      if (tokensSnapshot.empty) {
        console.log("No FCM tokens found in the database.");
        return;
      }

      const tokens: string[] = [];
      tokensSnapshot.forEach((doc) => {
        tokens.push(doc.id);
      });

      console.log(`Attempting to send notification to ${tokens.length} tokens.`);

      // Modern FCM sendEach API (replaces legacy sendToDevice)
      const messages = tokens.map(token => ({
        token: token,
        notification: {
          title: notificationData.title,
          body: notificationData.description,
        },
        webpush: {
          notification: {
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-192x192.png",
            click_action: notificationData.link || "/",
          },
          fcm_options: {
            link: notificationData.link || "/",
          }
        },
        // Data payload for background processing if needed
        data: {
          title: notificationData.title,
          body: notificationData.description,
          link: notificationData.link || "/",
        }
      }));

      // Firebase Admin SDK v12+ uses sendEach for multicast
      const response = await messaging.sendEach(messages);

      console.log(`Successfully sent ${response.successCount} notifications.`);
      
      // Cleanup invalid/expired tokens
      if (response.failureCount > 0) {
        const tokensToRemove: Promise<any>[] = [];
        response.responses.forEach((resp, index) => {
          if (!resp.success && resp.error) {
            const error = resp.error;
            // Common codes for stale tokens
            if (
              error.code === 'messaging/registration-token-not-registered' ||
              error.code === 'messaging/invalid-registration-token'
            ) {
              console.log(`Removing invalid token: ${tokens[index]}`);
              tokensToRemove.push(
                db.collection("fcmTokens").doc(tokens[index]).delete()
              );
            }
          }
        });
        await Promise.all(tokensToRemove);
        console.log(`Cleaned up ${tokensToRemove.length} invalid tokens.`);
      }

    } catch (error) {
      console.error("Error in sendPushNotifications function:", error);
    }
  });
