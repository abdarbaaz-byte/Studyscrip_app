import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGoogleDriveImageUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return "https://placehold.co/600x400.png"; // Return a default placeholder
  }
  
  // Improved Regex to find file ID from various Google Drive URL formats
  // Supports /file/d/ID, uc?id=ID, open?id=ID, etc.
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|uc\?id=|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    // Using lh3.googleusercontent.com/d/ID is much more reliable for direct embedding than uc?export=view
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // If it's not a recognized Google Drive link, return it as is, assuming it's a direct image URL.
  return url;
}

export function getGoogleDriveAudioUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return "";
  }
  
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|uc\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    // Use the uc?export=download link for direct audio access
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // If it's not a google drive link, assume it's a direct public URL
  return url;
}
