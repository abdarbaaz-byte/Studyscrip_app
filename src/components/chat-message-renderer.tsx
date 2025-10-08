
"use client";

import React from 'react';

interface ChatMessageRendererProps {
  text: string;
}

export function ChatMessageRenderer({ text }: ChatMessageRendererProps) {
  const linkify = (text: string) => {
    // Regex to find URLs (http, https, www)
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    
    // Add bolding for markdown-like syntax
    let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return processedText.replace(urlRegex, (url) => {
      let href = url;
      if (url.startsWith('www.')) {
        href = 'http://' + url;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
    });
  };

  const html = linkify(text);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
