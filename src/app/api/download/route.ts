
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'file'; // Generic name

  if (!fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }

  try {
    const isAudio = fileName.endsWith('.mp3');
    
    // For audio, we need to support range requests for streaming
    const headers = isAudio ? { 'Range': request.headers.get('range') || 'bytes=0-' } : {};
    
    const response = await fetch(fileUrl, { headers });

    if (!response.ok && response.status !== 206) { // 206 is Partial Content for range requests
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Content-Type', blob.type);

    if (!isAudio) {
      // For non-audio files like certificates, force download
      responseHeaders.set('Content-Disposition', `attachment; filename="${fileName}"`);
    } else {
      // For audio, allow inline playback
      responseHeaders.set('Content-Disposition', `inline`);
      responseHeaders.set('Accept-Ranges', 'bytes');
    }
    
    return new NextResponse(blob, { status: response.status, statusText: response.statusText, headers: responseHeaders });

  } catch (error: any) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: `Failed to download file: ${error.message}` }, { status: 500 });
  }
}
