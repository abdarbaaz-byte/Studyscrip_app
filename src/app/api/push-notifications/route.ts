
import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging, adminDb, adminAuth } from '@/lib/firebase-admin';

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

    // 1. Fetch relevant tokens based on target
    let tokens: string[] = [];

    if (broadcast) {
      // Current broadcast behavior: fetch ALL tokens
      const tokensSnapshot = await adminDb.collection('fcmTokens').get();
      tokens = tokensSnapshot.docs.map(doc => doc.id);
    } else if (targetUid) {
      // Specific user targeting
      const tokensSnapshot = await adminDb.collection('fcmTokens').where('uid', '==', targetUid).get();
      tokens = tokensSnapshot.docs.map(doc => doc.id);
    } else if (targetRole === 'admin') {
      // Admin targeting (for verification requests)
      // Find all user UIDs with 'admin' role first
      const adminUsersSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
      const adminUids = adminUsersSnapshot.docs.map(doc => doc.id);
      
      if (adminUids.length > 0) {
        const tokensSnapshot = await adminDb.collection('fcmTokens').where('uid', 'in', adminUids).get();
        tokens = tokensSnapshot.docs.map(doc => doc.id);
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No active tokens found for this target' });
    }

    // 2. Prepare Direct Push Messages
    const messages = tokens.map(token => ({
      token: token,
      data: {
        title: title,
        body: body,
        link: link || '/',
      }
    }));

    // 3. Send notifications via Admin SDK
    const response = await adminMessaging.sendEach(messages);
    console.log(`FCM: Sent ${response.successCount} messages to ${targetUid || targetRole || 'broadcast'}.`);

    // 4. Cleanup stale tokens if any failed
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
