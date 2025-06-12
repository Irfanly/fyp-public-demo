"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth } from "@/conf/firebase";
import { FirestoreChatbot } from "@/services/firestoreChatbot";
import { generateChatbotReply } from "@/services/google/gemini";
import { chatbot } from "@/lib/type/index";
import { 
    Bot, Send, User, Loader2, X, 
    MessageSquare, HelpCircle, 
    PanelRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<chatbot[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [userID, setUserID] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatService, setChatService] = useState<FirestoreChatbot | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const chatbotRef = useRef<HTMLDivElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    const suggestedQuestions = [
        "How do I earn MyCSD points?",
        "What events are happening this month?",
        "How do I register for an event?",
        "What are the MyCSD cores?"
    ];

    // Close chatbot when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                chatbotRef.current &&
                !chatbotRef.current.contains(event.target as Node) &&
                isOpen
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged( async (user) => {
            if (user) {
                setUserID(user.uid);
                const service = new FirestoreChatbot();
                setChatService(service);
            } else {
                setUserID(null);
                setChatService(null);
            }
        });
        
        return () => unsubscribe();
    }, []);

    // Load messages for the first time
    useEffect(() => {
        if (chatService && userID) {
            console.log("Im in use effect")
            loadMessages(chatService);
            listenForMessages(chatService);
        }
    } , [chatService, userID]);

    // Scroll to the bottom of the chat when messages change
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 10);

        return () => clearTimeout(timer);
    }, [messages]);

    const loadMessages = async (service: FirestoreChatbot) => {
        try {
            console.log("Loading messages for user:", userID);
            const loadedMessages = await service.getMessages(userID!);
            const formattedMessages = loadedMessages.map((msg: any) => ({
                sender: msg.type,
                message: msg.message,
                timestamp: msg.timestamp.toDate(), // Convert Firestore Timestamp to Date
            }));
            setMessages(formattedMessages);
            setShowSuggestions(formattedMessages.length === 0);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    const listenForMessages = (service: FirestoreChatbot) => {
        console.log("Listening for messages for user:");
        service.listenToMessages(userID!, (newMessages: any[]) => {
            const formattedMessages = newMessages.map((msg: any) => ({
                sender: msg.type,
                message: msg.message,
                timestamp: msg.timestamp.toDate(), // Convert Firestore Timestamp to Date
            }));
            setMessages(formattedMessages); // Replace the entire state with the latest messages
            setShowSuggestions(formattedMessages.length === 0);
        });
    };

    const handleSendMessage = async (messageText: string = newMessage) => {
        if (messageText.trim() !== "" && chatService && !isLoading) {
            try {
                setIsLoading(true);
                setShowSuggestions(false);
                
                // Save the user message to Firestore
                await chatService.saveUserMessage(userID!, messageText);

                // // Optimistically update the local state with the user message
                // setMessages((prevMessages) => [
                //     ...prevMessages,
                //     { sender: "user", message: messageText, timestamp: new Date() },
                // ]);

                // Clear input immediately if it's from the input field
                if (messageText === newMessage) {
                    setNewMessage(""); 
                }

                // Generate AI reply using Gemini
                const aiReply = await generateChatbotReply(messageText);

                // Save the AI reply to Firestore
                await chatService.saveBotMessage(userID!, aiReply);

                // // Optimistically update the local state with the AI reply
                // setMessages((prevMessages) => [
                //     ...prevMessages,
                //     { sender: "bot", message: aiReply, timestamp: new Date() },
                // ]);

                // Scroll to the bottom after sending a message
                scrollToBottom();
            } catch (error) {
                console.error("Error sending message or generating AI reply:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = async () => {
        if (chatService && userID) {
            try {
                await chatService.deleteMessage(userID);
                setMessages([]);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error clearing chat:", error);
            }
        }
    };

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div ref={chatbotRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chatbot Window */}
            {isOpen && (
                <div className="mb-4 w-full max-w-[350px] h-[450px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between border-b border-blue-700">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-5 w-5 text-white" />
                            <h3 className="font-medium text-white">MyCSD Assistant</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={clearChat}
                                            className="h-7 w-7 text-white/90 hover:bg-blue-700/50 hover:text-white"
                                        >
                                            <Loader2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p className="text-xs">Clear chat</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white/90 hover:bg-blue-700/50 hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 p-3 bg-slate-50">
                        <div ref={chatContainerRef} className="space-y-3 pb-2">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                                    <Bot className="h-8 w-8 mb-2 text-blue-500 opacity-80" />
                                    <p className="text-sm text-slate-600">
                                        Ask me about MyCSD events, points, and activities!
                                    </p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div 
                                        key={index}
                                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-1`}
                                    >
                                        <div className={`flex ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[85%]`}>
                                            <Avatar className={`h-7 w-7 ${message.sender === "user" ? "bg-blue-600" : "bg-slate-100 border border-slate-200"}`}>
                                                <AvatarFallback className={message.sender === "user" ? "text-white" : "text-blue-600"}>
                                                    {message.sender === "user" 
                                                        ? <User className="h-3.5 w-3.5" /> 
                                                        : <Bot className="h-3.5 w-3.5" />
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div 
                                                    className={`px-3 py-2 text-xs leading-relaxed ${
                                                        message.sender === "user" 
                                                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                                                            : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none"
                                                    }`}
                                                >
                                                    {message.message}
                                                </div>
                                                <p className={`text-[10px] text-slate-400 ${
                                                    message.sender === "user" ? "text-right mr-1" : "text-left ml-1"
                                                }`}>
                                                    {formatTime(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {isLoading && (
                                <div className="flex justify-start mt-2">
                                    <div className="flex flex-row items-start gap-2 max-w-[85%]">
                                        <Avatar className="h-7 w-7 bg-slate-100 border border-slate-200">
                                            <AvatarFallback className="text-blue-600">
                                                <Bot className="h-3.5 w-3.5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-none">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {showSuggestions && (
                                <div className="mt-8 mb-2">
                                    <p className="text-xs flex items-center justify-center text-slate-500 mb-3">
                                        <HelpCircle className="h-3 w-3 mr-1" />
                                        Try asking one of these
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {suggestedQuestions.map((question, index) => (
                                            <Button 
                                                key={index}
                                                variant="outline"
                                                className="text-xs py-1.5 px-3 h-auto justify-start bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                                                onClick={() => handleSendMessage(question)}
                                            >
                                                <PanelRight className="h-3 w-3 mr-2 text-slate-400" />
                                                {question}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-2 bg-white border-t">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="flex items-center gap-2"
                        >
                            <Input
                                className="flex-1 h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-blue-400"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isLoading}
                            />
                            <Button 
                                type="submit" 
                                size="icon"
                                disabled={isLoading || !newMessage.trim()}
                                className={`h-8 w-8 ${!newMessage.trim() ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <Button
                variant="default"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all"
                aria-label="Chat with MyCSD Assistant"
            >
                <MessageSquare className="h-5 w-5" />
            </Button>
        </div>
    );
};

export default Chatbot;