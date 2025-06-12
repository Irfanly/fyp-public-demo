'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  UserCircle, 
  BookOpen,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Award,
  MessagesSquare
} from 'lucide-react';
import Logo from "@/app/icon.png"
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import fireauth from '@/services/fireauth';
import firestore from '@/services/firestore';
import { auth } from '@/conf/firebase';
import { users } from '@/lib/type/index';
import { useUser } from '@/context/UserContext';

interface SidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const Sidebar = ({ onCollapsedChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userData, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
      onCollapsedChange?.(JSON.parse(savedState));
    }
  }, [onCollapsedChange]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    onCollapsedChange?.(newState);
  };
  //based on users role we can show different menu item
  const studentItems = [
    { icon: Home, label: 'Dashboard', href: '/student' },
    { icon: Calendar,  label: 'Planning', href: '/student/planning'},
    { icon: BookOpen, label: 'My Registrations', href: '/student/registered' },
    { icon : Award, label: 'MyCSD', href: '/student/mycsd'},
    { icon: MessagesSquare, label: 'Chat', href: '/student/chatroom' },
    { icon: UserCircle, label: 'Profile', href: '/student/profile' },
  ];

  const organizerItems = [
    { icon: Home, label: 'Dashboard', href: '/organization' },
    { icon: Calendar,  label: 'Planning', href: '/organization/planning'},
    { icon: BookOpen, label: 'Analytics', href: '/organization/analytics' },
    { icon: MessagesSquare, label: 'Chat', href: '/organization/chatroom' },
    { icon: UserCircle, label: 'Profile', href: '/organization/profile' },
  ];

  const roleBasedMenu = () => {
    if(userData?.role === "student"){
      return studentItems;
    } else if(userData?.role === "organization"){
      return organizerItems;
    }
  }

  const handleLogout = () => {
    fireauth.signOut();
    router.push('/');
  };
  
  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50",
      isCollapsed ? "w-12" : "w-48"
    )}>
      {/* Rest of the component remains the same */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 top-4 bg-white border rounded-full shadow-md hover:bg-gray-100 w-4 h-4"
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className={cn(
          "p-2 overflow-hidden whitespace-nowrap",
          isCollapsed ? "text-center" : "pl-2"
        )}>
          {isCollapsed ? (
            <div className="flex justify-center items-center">
              <Image 
                src={Logo} 
                alt="MyCSD Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>
          ) : (
            <h2 className="text-lg font-bold text-blue-600">MyCSD Event Hub</h2>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow p-2 space-y-1">
          {roleBasedMenu()?.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg transition-colors group",
                isCollapsed ? "p-1.5 justify-center" : "p-2 hover:bg-gray-100"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "w-4 h-4 text-gray-700 group-hover:text-blue-600",
                !isCollapsed && "mr-2"
              )} />
              {!isCollapsed && (
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className={cn(
          "border-t p-2",
          isCollapsed ? "text-center" : ""
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : ""
          )}>
            <Avatar className={cn(
              "w-6 h-6 rounded-full",
              !isCollapsed && "mr-2"
            )}>
              <AvatarImage src={userData?.profilePicture} alt="Profile" />
              <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div>
                <div className="font-bold text-xs">{userData?.name}</div>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            className={cn(
              "text-red-600 hover:text-red-700 hover:bg-red-50 mt-2",
              isCollapsed ? "p-1.5 w-6 h-6" : "w-full justify-start"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn(
              "w-4 h-4",
              !isCollapsed && "mr-2"
            )} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;