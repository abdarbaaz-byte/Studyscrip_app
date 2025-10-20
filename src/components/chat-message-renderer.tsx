
"use client";

import React from 'react';
import { LinkIcon } from 'lucide-react';

interface ChatMessageRendererProps {
  text: string;
}

export function ChatMessageRenderer({ text }: ChatMessageRendererProps) {
  const linkify = (text: string) => {
    // Regex to find URLs (http, https, www)
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    
    let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return processedText.replace(urlRegex, (url) => {
      let href = url;
      if (url.startsWith('www.')) {
        href = 'http://' + url;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                Click to view
              </a>`;
    });
  };

  const html = linkify(text);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
