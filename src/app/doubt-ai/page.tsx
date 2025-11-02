
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { chat, ChatInput, ChatOutput } from '@/ai/flows/chat-flow';
import { type Content, type Part } from '@genkit-ai/ai';

type Message = {
  role: 'user' | 'model';
  content: Content;
};


export default function AiDoubtSolverPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        setTimeout(() => scrollViewport.scrollTop = scrollViewport.scrollHeight, 100);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: [{ text: input }],
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const chatInput: ChatInput = {
        messages: newMessages.map(msg => ({
          role: msg.role,
          content: msg.content as Part[],
        })),
        prompt: input,
      };

      const result: ChatOutput = await chat(chatInput);

      const botMessage: Message = {
        role: 'model',
        content: [{ text: result.text }],
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: [{ text: "Sorry, I'm having trouble connecting. Please try again later." }],
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="max-w-2xl mx-auto">
         <Card className="shadow-lg">
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <Bot className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl">AI Doubt Solver</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                    Aapka personal AI study partner.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
               <div className="flex flex-col h-[500px] border rounded-lg">
                  <div className="flex-1 p-6">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                      <div className="space-y-6">
                        
                         <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src="/icons/icon-192x192.png" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className="bg-secondary p-3 rounded-lg rounded-tl-none max-w-[80%]">
                            <p className="font-bold text-sm mb-1">StudyScript AI</p>
                            <p className="text-sm">Namaste! Main aapka AI Doubt Solver hoon. Padhai se juda koi bhi sawaal puchiye.</p>
                          </div>
                        </div>

                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-4 ${
                              message.role === "user" ? "justify-end" : ""
                            }`}
                          >
                            {message.role === "model" && (
                              <Avatar>
                                <AvatarImage src="/icons/icon-192x192.png" />
                                <AvatarFallback>AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`p-3 rounded-lg max-w-[80%] ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-secondary rounded-tl-none"
                              }`}
                            >
                              <p className="font-bold text-sm mb-1">
                                {message.role === 'user' ? 'You' : 'StudyScript AI'}
                              </p>
                               <p className="text-sm whitespace-pre-wrap">{(message.content[0] as Part).text}</p>
                            </div>
                             {message.role === "user" && (
                              <Avatar>
                                <AvatarFallback><User/></AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                         {isLoading && (
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src="/icons/icon-192x192.png" />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-secondary p-3 rounded-lg rounded-tl-none max-w-[80%]">
                              <Loader2 className="h-5 w-5 animate-spin"/>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSubmit} className="flex items-center gap-4">
                      <Textarea
                        placeholder="Yahan apna sawaal likhein..."
                        className="flex-1 resize-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        rows={1}
                      />
                      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
                      </Button>
                    </form>
                  </div>
                </div>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
