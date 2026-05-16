import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '@/lib/firebase-admin';

/**
 * API Route to send FCM Push Notifications.
 * This works on Spark plan because it uses Firebase Admin SDK.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, link } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and Body are required' }, { status: 400 });
    }

    // 1. Fetch all tokens from the 'fcmTokens' collection
    const tokensSnapshot = await adminDb.collection('fcmTokens').get();
    
    if (tokensSnapshot.empty) {
      return NextResponse.json({ success: true, message: 'No tokens found in Firestore' });
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      tokens.push(doc.id);
    });

    // 2. Prepare Data-only payloads for the Unified Service Worker
    const messages = tokens.map(token => ({
      token: token,
      data: {
        title: title,
        body: body,
        link: link || '/',
      }
    }));

    // 3. Send notifications
    const response = await adminMessaging.sendEach(messages);
    console.log(`Sent ${response.successCount} push messages.`);

    // 4. Cleanup invalid tokens
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
