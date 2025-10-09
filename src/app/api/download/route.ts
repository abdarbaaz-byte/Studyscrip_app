
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'certificate.jpg';

  if (!fileUrl) {
    return NextResponse.json({ error: "File URL is required" }, { status: 400 });
  }

  try {
    // Fetch the image from the provided URL.
    // The server can do this without CORS restrictions.
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the image data as a blob.
    const blob = await response.blob();

    // Create a new response to send the image data back to the client.
    const headers = new Headers();
    headers.set('Content-Type', blob.type);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(blob, { status: 200, headers });

  } catch (error: any) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: `Failed to download file: ${error.message}` }, { status: 500 });
  }
}
