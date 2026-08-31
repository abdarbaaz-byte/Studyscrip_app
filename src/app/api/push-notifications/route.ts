
import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '@/lib/firebase-admin';

/**
 * API Route to send Targeted FCM Push Notifications.
 * Supports: broadcast (all), targeted UID, or targeted ROLE.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, link, targetUid, targetRole, broadcast = false } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and Body are required' }, { status: 400 });
    }

    // 1. Fetch relevant tokens and their doc IDs
    let tokens: string[] = [];
    let docIds: string[] = [];

    let snapshot;
    if (broadcast) {
      snapshot = await adminDb.collection('fcmTokens').get();
    } else if (targetUid) {
      snapshot = await adminDb.collection('fcmTokens').where('uid', '==', targetUid).get();
    } else if (targetRole === 'admin') {
      const adminUsersSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
      const adminUids = adminUsersSnapshot.docs.map(doc => doc.id);
      if (adminUids.length > 0) {
        snapshot = await adminDb.collection('fcmTokens').where('uid', 'in', adminUids).get();
      }
    }

    if (snapshot && !snapshot.empty) {
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.token) {
                tokens.push(data.token);
                docIds.push(doc.id);
            }
        });
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No active tokens found' });
    }

    // 2. Prepare Direct Push Messages
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
        title: title,
        body: body,
        link: link || '/',
        vibrate: "200,100,200",
        priority: "high",
      }
    }));

    // 3. Send
    const response = await adminMessaging.sendEach(messages);

    // 4. Cleanup stale documents using the docId (deviceId)
    if (response.failureCount > 0) {
      const batch = adminDb.batch();
      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            batch.delete(adminDb.collection('fcmTokens').doc(docIds[index]));
          }
        }
      });
      await batch.commit();
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
