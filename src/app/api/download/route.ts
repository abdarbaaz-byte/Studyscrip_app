
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
        // Fallback to GET if HEAD fails
        const getResponse = await fetch(fileUrl);
        if(!getResponse.ok) {
            return new NextResponse(getResponse.body, { status: getResponse.status, statusText: getResponse.statusText });
        }
        // If GET works, we can proceed but might not support range requests fully
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
    const acceptRanges = headResponse.headers.get('Accept-Ranges');

    // If range requests are supported and requested
    if (isAudio && acceptRanges === 'bytes' && request.headers.has('range') && contentLength) {
      const range = request.headers.get('range')!;
      const bytes = range.replace(/bytes=/, "").split("-");
      const start = parseInt(bytes[0], 10);
      const end = bytes[1] ? parseInt(bytes[1], 10) : parseInt(contentLength) - 1;
      const chunksize = (end - start) + 1;
      
      const response = await fetch(fileUrl, {
          headers: {
              'Range': `bytes=${start}-${end}`
          }
      });
      
      if (!response.ok) {
          return new NextResponse(response.body, { status: response.status, statusText: response.statusText });
      }

      const headers = new Headers(response.headers);
      headers.set('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      headers.set('Content-Length', chunksize.toString());
      headers.set('Content-Type', contentType);
      headers.set('Accept-Ranges', 'bytes');
      
      return new NextResponse(response.body, {
        status: 206, // Partial Content
        headers: headers,
      });

    } else {
        // Full content request
        const response = await fetch(fileUrl);

        if (!response.ok) {
            return new NextResponse(response.body, { status: response.status, statusText: response.statusText });
        }
        
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Content-Disposition', `inline; filename="${fileName}"`);
        responseHeaders.set('Content-Type', contentType);
        if (contentLength) {
            responseHeaders.set('Content-Length', contentLength);
        }

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
