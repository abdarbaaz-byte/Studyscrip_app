
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
    const headers = new Headers();
    if (request.headers.has('range')) {
      headers.set('Range', request.headers.get('range')!);
    }
    
    const response = await fetch(fileUrl, { headers });

    if (!response.ok) {
      // If the initial request fails, it might be a server error or a bad URL.
      return new NextResponse(response.body, { status: response.status, statusText: response.statusText });
    }
    
    // Create new headers for the response, copying from the upstream response
    const responseHeaders = new Headers(response.headers);

    // Set Content-Disposition based on file type
    if (isAudio) {
      // 'inline' suggests the browser should try to play it.
      responseHeaders.set('Content-Disposition', `inline; filename="${fileName}"`);
    } else {
      // 'attachment' forces a download, good for certificates etc.
      responseHeaders.set('Content-Disposition', `attachment; filename="${fileName}"`);
    }

    // Ensure content type is set
    responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: `Failed to download file: ${error.message}` }, { status: 500 });
  }
}
