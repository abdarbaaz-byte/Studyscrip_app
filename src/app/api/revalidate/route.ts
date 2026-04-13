
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * API Route for manual cache revalidation.
 * Called when content is updated in the Admin Dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();

    // Security check: Match the secret token
    // In a real app, this should be in an environment variable REVALIDATION_SECRET
    const VALID_SECRET = 'studyscript-revalidate-secret';

    if (secret !== VALID_SECRET) {
      return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: 'Path is required' }, { status: 400 });
    }

    // Revalidate the specific path
    revalidatePath(path);
    
    // Also revalidate the home page as it often contains lists of courses/batches
    revalidatePath('/');
    
    // Revalidate sitemap just in case new items were added
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ 
      revalidated: true, 
      path,
      now: Date.now() 
    });
  } catch (err: any) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
  }
}
