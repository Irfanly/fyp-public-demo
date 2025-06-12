"use client";

import React from "react";
import Chatbot from "@/components/chatbot";
import { MessageSquare, Info } from "lucide-react";

const ChatbotPage = () => {
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b py-4 px-6 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold text-slate-800">MyCSD Assistant</h1>
                    </div>
                    <div className="hidden md:flex items-center text-sm text-slate-500">
                        <Info className="h-4 w-4 mr-2" />
                        <span>Ask questions about MyCSD events, points and activities</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 md:p-8 gap-6">
                {/* Sidebar - only visible on larger screens */}
                <div className="hidden lg:block w-64 shrink-0">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="font-medium text-slate-800 mb-4">About MyCSD Assistant</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            This AI-powered assistant can help you with questions about MyCSD events, 
                            student activities, registration, and more.
                        </p>
                        <h3 className="font-medium text-slate-700 text-sm mt-4 mb-2">Try asking about:</h3>
                        <ul className="space-y-1.5 text-sm">
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span> 
                                <span className="text-slate-600">MyCSD point system</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span> 
                                <span className="text-slate-600">Upcoming events</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span> 
                                <span className="text-slate-600">Registration process</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span> 
                                <span className="text-slate-600">Different MyCSD cores</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Chatbot - takes full width on mobile, centered on larger screens */}
                <div className="flex-1 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
                    <Chatbot />
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;