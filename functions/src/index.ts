
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Triggered when a new notification is created in the 'notifications' collection.
 * Sends a DATA-ONLY payload to FCM so the Service Worker can handle display.
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
      const tokensSnapshot = await db.collection("fcmTokens").get();

      if (tokensSnapshot.empty) {
        console.log("No FCM tokens found.");
        return;
      }

      const tokens: string[] = [];
      tokensSnapshot.forEach((doc) => {
        tokens.push(doc.id);
      });

      // Data-only payload (No 'notification' key at the top level)
      // This ensures the Service Worker has full control and avoids duplicate browser alerts.
      const messages = tokens.map(token => ({
        token: token,
        android: {
          priority: 'high' as const, // CRITICAL: Triggers Heads-Up notification on Android
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
        },
        data: {
          title: notificationData.title || "StudyScript Update",
          body: notificationData.description || "You have a new message",
          link: notificationData.link || "/",
          icon: "/icons/icon-192x192.png",
          click_action: notificationData.link || "/", // Fallback for some clients
          vibrate: "200,100,200", // Signal pattern for Service Worker
          priority: "high",
        }
      }));

      const response = await messaging.sendEach(messages);
      console.log(`Sent ${response.successCount} high-priority data-push messages.`);
      
      // Cleanup stale tokens
      if (response.failureCount > 0) {
        const tokensToRemove: Promise<any>[] = [];
        response.responses.forEach((resp, index) => {
          if (!resp.success && resp.error) {
            if (
              resp.error.code === 'messaging/registration-token-not-registered' ||
              resp.error.code === 'messaging/invalid-registration-token'
            ) {
              tokensToRemove.push(db.collection("fcmTokens").doc(tokens[index]).delete());
            }
          }
        });
        await Promise.all(tokensToRemove);
      }
    } catch (error) {
      console.error("Error in sendPushNotifications:", error);
    }
  });

/**
 * Secure API to send manual push notifications via Firebase Callable Function.
 */
export const sendManualPush = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { title, body, link, targetToken } = data;

  if (!targetToken) {
    throw new functions.https.HttpsError('invalid-argument', 'Target token is required');
  }

  const message = {
    token: targetToken,
    android: {
      priority: 'high' as const,
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
    },
    data: {
      title: title || "StudyScript",
      body: body || "",
      link: link || "/",
      icon: "/icons/icon-192x192.png",
      vibrate: "200,100,200",
      priority: "high",
    }
  };

  try {
    await messaging.send(message);
    return { success: true };
  } catch (error) {
    console.error("Manual push failed:", error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

/**
 * Cleanup read notifications logic.
 */
export const cleanupReadNotifications = functions.firestore
  .document("notifications/{notificationId}")
  .onDelete(async (snapshot, context) => {
    const notificationId = context.params.notificationId;
    const usersRef = db.collection("users");
    try {
      const querySnapshot = await usersRef.where("readNotifications", "array-contains", notificationId).get();
      if (querySnapshot.empty) return;
      
      const docs = querySnapshot.docs;
      for (let i = 0; i < docs.length; i += 500) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + 500);
        chunk.forEach((userDoc) => {
          batch.update(userDoc.ref, {
            readNotifications: admin.firestore.FieldValue.arrayRemove(notificationId)
          });
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error in cleanupReadNotifications:", error);
    }
  });
