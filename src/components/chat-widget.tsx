
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, MessageSquare, X, Bot, Loader2 } from "lucide-react";
import type { ChatMessage, Chat, AdminProfile } from "@/lib/chat";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { sendMessage, listenToChat } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
import { ChatMessageRenderer } from "@/components/chat-message-renderer";


const adminProfile: AdminProfile = {
  id: 'admin-1',
  name: 'StudyScript Support',
  avatar: '/logo-icon.svg'
};

const emptyChat: Chat = {
    id: '',
    userId: '',
    userName: '',
    admin: adminProfile,
    messages: [],
    lastMessageTimestamp: ''
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const chatWidgetRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Close chat on route change
  useEffect(() => {
    if (isOpen) {
        setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close chat on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatWidgetRef.current && !chatWidgetRef.current.contains(event.target as Node)) {
        // Make sure not to close if the click is on the toggle button itself
        const toggleButton = document.getElementById('chat-widget-toggle');
        if (toggleButton && toggleButton.contains(event.target as Node)) {
            return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!user || !isOpen) {
        setActiveChat(null); // Reset chat when closed or logged out
        return;
    };

    setIsLoading(true);
    // User's chat document ID is their UID
    const chatId = user.uid; 
    
    const unsubscribe = listenToChat(chatId, (chatData) => {
        if (chatData) {
            setActiveChat(chatData);
        } else {
            // No chat history, set up a new chat object
            setActiveChat({
                ...emptyChat,
                id: chatId,
                userId: user.uid,
                userName: user.email || 'New User',
            });
        }
        setIsLoading(false);
        scrollToBottom();
    });

    return () => unsubscribe();

  }, [user, isOpen]);


  // Effect to handle back press for closing the widget
  useEffect(() => {
    const handleHashChange = () => {
      // If hash is removed (back press), close the widget
      if (window.location.hash === '') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Add a hash to the URL when the widget opens
      window.location.hash = 'chat';
      window.addEventListener('hashchange', handleHashChange);
    } else {
      // If the widget is closed, but the hash is still there, go back
      if (window.location.hash === '#chat') {
        window.history.back();
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isOpen]);



  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
      }
    }, 100);
  };
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, activeChat?.messages]);


  const handleSendMessage = async () => {
    if (!message.trim() || !user || !activeChat || isSending) return;

    setIsSending(true);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: message,
      timestamp: new Date().toISOString(),
    };
    
    setMessage("");
    
    try {
       await sendMessage(activeChat.id, userMessage, { userId: user.uid, userName: user.email || 'New User' });
       scrollToBottom();
    } catch (error) {
       console.error("Failed to send message:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Could not send message. Please try again."
       })
       // Re-add message to input if sending fails
       setMessage(message);
    } finally {
        setIsSending(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !activeChat) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'user',
          text: `Image: ${file.name}`,
          timestamp: new Date().toISOString(),
          attachment: {
            type: 'image',
            url: e.target?.result as string,
          },
        };
        try {
            await sendMessage(activeChat.id, newMessage, { userId: user.uid, userName: user.email || 'New User' });
            scrollToBottom();
        } catch(error) {
             console.error("Failed to send image:", error);
             toast({ variant: "destructive", title: "Failed to send image" });
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  if (!isMounted) return null;

  const authPages = ["/login", "/signup", "/forgot-password", "/verify-email"];
  if (authPages.includes(pathname)) {
    return null;
  }

  return (
    <div ref={chatWidgetRef}>
      <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
        <Button id="chat-widget-toggle" onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full h-14 w-14 shadow-lg">
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-[148px] right-4 z-50 md:bottom-20">
          <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
             {!user ? (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <CardTitle>Chat with Support</CardTitle>
                    <CardDescription className="mt-2">Please log in to start a conversation.</CardDescription>
                </div>
             ) : (
                <>
                 <CardHeader className="flex flex-row items-center gap-3">
                   <Avatar>
                    <AvatarImage src={adminProfile.avatar} alt={adminProfile.name} />
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{adminProfile.name}</CardTitle>
                    <CardDescription>Support</CardDescription>
                  </div>
                </CardHeader>
                 <Separator />
                <CardContent className="flex-1 p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] p-4" ref={scrollAreaRef}>
                      <div className="space-y-4">
                        {activeChat?.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${
                              msg.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {msg.sender === "admin" && (
                               <Avatar className="h-8 w-8">
                                <AvatarImage src={adminProfile.avatar} alt={adminProfile.name} />
                                 <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                                msg.sender === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary"
                              }`}
                            >
                              {msg.attachment?.type === 'image' ? (
                                <img src={msg.attachment.url} alt="attachment" className="rounded-md max-w-full h-auto" />
                              ) : (
                                <div className="text-sm whitespace-pre-wrap">
                                  <ChatMessageRenderer text={msg.text} />
                                </div>
                              )}
                              <p className={`text-xs mt-1 ${
                                msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
                <CardFooter className="p-2 border-t">
                  <div className="flex w-full items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                      <Paperclip className="h-5 w-5" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || isSending}
                    />
                    <Button onClick={handleSendMessage} size="icon" disabled={isLoading || isSending}>
                      {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </CardFooter>
                </>
             )}
          </Card>
        </div>
      )}
    </div>
  );
}
