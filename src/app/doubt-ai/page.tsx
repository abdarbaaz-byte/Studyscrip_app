
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Bot, BrainCircuit, Loader2 } from "lucide-react";
import { chat } from "@/ai/flows/chat-flow";
import { useAuth } from "@/hooks/use-auth";

interface Message {
    role: "user" | "model";
    content: {text: string}[];
}

export default function DoubtAiPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
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
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content,
            }));
            
            const response = await chat({
                messages: history,
                prompt: currentInput
            });

            const aiMessage: Message = { role: "model", content: [{ text: response.text }] };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: Message = { role: "model", content: [{ text: "Sorry, something went wrong. Please try again." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-3xl h-[70vh] flex flex-col shadow-2xl">
                <CardHeader className="text-center">
                     <div className="flex justify-center mb-4">
                        <BrainCircuit className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl md:text-4xl">AI Doubt Solver</CardTitle>
                    <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                        Ask any question related to your studies, and I'll do my best to help!
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                     <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                       <p className="text-sm whitespace-pre-wrap">{msg.content[0].text}</p>
                                    </div>
                                    {msg.role === 'user' && (
                                        <Avatar className="h-9 w-9 border">
                                            {user?.photoURL ? <AvatarImage src={user.photoURL} alt="User"/> : <AvatarFallback><User /></AvatarFallback>}
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4 justify-start">
                                     <Avatar className="h-9 w-9 border">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                     <div className="max-w-[80%] rounded-lg px-4 py-3 bg-secondary flex items-center">
                                       <Loader2 className="h-5 w-5 animate-spin"/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <div className="flex w-full items-center gap-2">
                         <Input
                          placeholder="Type your question here..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={isLoading}
                        />
                        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                          <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
