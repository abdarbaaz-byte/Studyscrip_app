
import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '@/lib/firebase-admin';

/**
 * API Route to send FCM Push Notifications.
 * This replaces Cloud Functions for users on the Firebase Spark plan.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, link } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and Body are required' }, { status: 400 });
    }

    // 1. Fetch all FCM tokens from Firestore
    const tokensSnapshot = await adminDb.collection('fcmTokens').get();
    
    if (tokensSnapshot.empty) {
      return NextResponse.json({ success: true, message: 'No tokens found' });
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      tokens.push(doc.id);
    });

    // 2. Prepare Data-only payloads (No 'notification' key to avoid duplicates)
    // This allows the Service Worker to have full control over display.
    const messages = tokens.map(token => ({
      token: token,
      data: {
        title: title,
        body: body,
        link: link || '/',
      }
    }));

    // 3. Send via FCM
    const response = await adminMessaging.sendEach(messages);
    console.log(`Sent ${response.successCount} push messages.`);

    // 4. Cleanup stale tokens
    if (response.failureCount > 0) {
      const tokensToRemove: Promise<any>[] = [];
      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          ) {
            tokensToRemove.push(adminDb.collection('fcmTokens').doc(tokens[index]).delete());
          }
        }
      });
      await Promise.all(tokensToRemove);
    }

    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });

  } catch (error: any) {
    console.error('Push notification error:', error);
    return NextResponse.json({ error: 'Failed to send notifications', details: error.message }, { status: 500 });
  }
}
