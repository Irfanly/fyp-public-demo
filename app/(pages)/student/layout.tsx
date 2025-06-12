'use client';

import { UserProvider } from "@/context/UserContext";
import { ReactNode, useState, useEffect, useRef } from "react";
import SideBar from "@/components/sideBar";
import Chatbot from "@/components/chatbot";
import RouteGuard from "@/components/RouteGuard";
import ProfileCompletionPrompt from "@/components/ProfileCompletionPrompt";

export default function RootLayout({ children }: { children: ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <UserProvider>
            <RouteGuard requiredRole="student">
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <SideBar onCollapsedChange={setIsSidebarCollapsed} />
                    <main
                        className={`transition-all duration-300 p-8 flex-1 ${
                        isSidebarCollapsed ? "lg:pl-20" : "lg:pl-56"
                        }`}
                    >
                        {/* Profile Completion Prompt */}
                        <ProfileCompletionPrompt />
                        {children}
                    </main>

                    {/* Chatbot Component */}
                    <Chatbot /> 
                </div>
            </RouteGuard>
        </UserProvider>
    );
}