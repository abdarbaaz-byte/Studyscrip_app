
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'certificate.jpg';

  if (!fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }

  try {
    // Fetch the file from the provided URL.
    // The server can do this without CORS restrictions.
    const response = await fetch(fileUrl, {
      headers: {
        'Range': request.headers.get('range') || 'bytes=0-',
      },
    });

    if (!response.ok && response.status !== 206) { // 206 is Partial Content
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const headers = new Headers(response.headers);
    headers.set('Content-Type', blob.type);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(blob, { status: response.status, statusText: response.statusText, headers });

  } catch (error: any) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: `Failed to download file: ${error.message}` }, { status: 500 });
  }
}
