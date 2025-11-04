
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
    
    // Fetch headers first to get content length and type
    const headResponse = await fetch(fileUrl, { method: 'HEAD' });
    if (!headResponse.ok) {
        // Fallback to GET if HEAD fails for some reason
        const getResponse = await fetch(fileUrl);
        if(!getResponse.ok) {
            // If even GET fails, return the error
            return new NextResponse(getResponse.body, { status: getResponse.status, statusText: getResponse.statusText });
        }
        // If GET works, stream the full content
        return new NextResponse(getResponse.body, {
            status: getResponse.status,
            statusText: getResponse.statusText,
            headers: {
                'Content-Disposition': `inline; filename="${fileName}"`,
                'Content-Type': getResponse.headers.get('Content-Type') || 'application/octet-stream',
            },
        });
    }

    const contentLength = headResponse.headers.get('Content-Length');
    const contentType = headResponse.headers.get('Content-Type') || 'application/octet-stream';
    
    // Check if range requests are supported by the source
    const acceptRanges = headResponse.headers.get('Accept-Ranges');

    if (isAudio && acceptRanges === 'bytes' && request.headers.has('range') && contentLength) {
      const range = request.headers.get('range')!;
      
      const response = await fetch(fileUrl, {
          headers: {
              'Range': range
          }
      });
      
      if (!response.ok) {
          // If range request fails, it might return a 200 with the full content.
          // Or it could be an actual error.
          return new NextResponse(response.body, { status: response.status, statusText: response.statusText });
      }

      const headers = new Headers(response.headers);
      headers.set('Content-Disposition', `inline; filename="${fileName}"`);
      // Important: These headers are set by the fetch response itself when range is requested
      // We just need to ensure they are passed through.
      
      return new NextResponse(response.body, {
        status: 206, // Partial Content
        headers: headers,
      });

    } else {
        // Full content request (for non-audio or if range not supported/requested)
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return new NextResponse(response.body, { status: response.status, statusText: response.statusText });
        }
        
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Content-Disposition', `inline; filename="${fileName}"`);
        // We set Content-Type and Length from the original response headers
        if (contentType) responseHeaders.set('Content-Type', contentType);
        if (contentLength) responseHeaders.set('Content-Length', contentLength);
        
        return new NextResponse(response.body, {
            status: 200, // OK
            headers: responseHeaders,
        });
    }

  } catch (error: any) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: `Failed to download file: ${error.message}` }, { status: 500 });
  }
}
