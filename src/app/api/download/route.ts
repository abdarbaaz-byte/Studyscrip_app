
// This proxy is no longer needed as we are using direct download links from Google Drive.
// Clearing the file to prevent confusion.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "This endpoint is deprecated." }, { status: 410 });
}
