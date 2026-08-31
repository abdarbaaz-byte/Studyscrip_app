
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
      const tokenDocIds: string[] = [];
      tokensSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          tokens.push(data.token);
          tokenDocIds.push(doc.id);
        }
      });

      const messages = tokens.map(token => ({
        token: token,
        android: {
          priority: 'high' as const,
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
          vibrate: "200,100,200",
          priority: "high",
        }
      }));

      const response = await messaging.sendEach(messages);
      console.log(`Sent ${response.successCount} high-priority messages.`);
      
      // Cleanup stale tokens
      if (response.failureCount > 0) {
        const batch = db.batch();
        response.responses.forEach((resp, index) => {
          if (!resp.success && resp.error) {
            const code = resp.error.code;
            if (
              code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token'
            ) {
              // Delete by Document ID (which is the deviceId)
              batch.delete(db.collection("fcmTokens").doc(tokenDocIds[index]));
            }
          }
        });
        await batch.commit();
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
  } catch (error: any) {
    console.error("Manual push failed:", error);
    if (error.code === 'messaging/registration-token-not-registered') {
        // Find and delete the stale token
        const q = await db.collection("fcmTokens").where("token", "==", targetToken).get();
        q.forEach(doc => doc.ref.delete());
    }
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
