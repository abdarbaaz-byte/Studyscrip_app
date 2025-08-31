import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// This function is triggered when a new notification is created in the 'notifications' collection.
export const sendPushNotifications = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snapshot) => {
    const notificationData = snapshot.data();

    if (!notificationData) {
      console.log("No data associated with the notification.");
      return;
    }

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: notificationData.title,
        body: notificationData.description,
        icon: "/icons/icon-192x192.png", // The icon that will be shown
      },
    };

    try {
      // Get all documents from the fcmTokens collection
      const tokensSnapshot = await db.collection("fcmTokens").get();

      if (tokensSnapshot.empty) {
        console.log("No FCM tokens found.");
        return;
      }

      const tokens: string[] = [];
      tokensSnapshot.forEach((doc) => {
        tokens.push(doc.id); // The document ID is the token itself
      });

      console.log(`Sending notification to ${tokens.length} tokens.`);

      // Send notifications to all tokens.
      // Note: sendToDevice has a limit of 1000 tokens per call.
      // For larger audiences, you would need to batch these requests.
      const response = await messaging.sendToDevice(tokens, payload);

      // Clean up invalid tokens
      const tokensToRemove: Promise<any>[] = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error(
            "Failure sending notification to",
            tokens[index],
            error
          );
          // Cleanup the tokens that are not registered anymore.
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            tokensToRemove.push(
              db.collection("fcmTokens").doc(tokens[index]).delete()
            );
          }
        }
      });

      await Promise.all(tokensToRemove);
      console.log("Invalid tokens cleaned up.");
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  });
