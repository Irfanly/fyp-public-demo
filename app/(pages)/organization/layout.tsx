'use client';

import { UserProvider } from "@/context/UserContext";
import { ReactNode, useState } from "react";
import SideBar from "@/components/sideBar";
import RouteGuard from "@/components/RouteGuard";

export default function RootLayout({ children }: { children: ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <UserProvider>
            <RouteGuard requiredRole="organization">
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <SideBar onCollapsedChange={setIsSidebarCollapsed} />
                    <main
                        className={`transition-all duration-300 flex-1 ${
                        isSidebarCollapsed ? "lg:pl-20" : "lg:pl-56"
                        }`}
                    >
                        {children}
                    </main>
                </div>
            </RouteGuard>
        </UserProvider>
    );
}