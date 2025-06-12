"use client";

import React from "react";
import Chatroom from "@/components/chatRoomList";
import { MessageSquareText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ChatroomPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto py-6 px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquareText className="h-6 w-6 text-blue-600" />
                Event Communications
              </h1>
              <p className="text-gray-500 mt-1">
                Stay connected with your event organizers and community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-medium">Student View:</span> Participate in event discussions and receive announcements from organizers. You can send messages and delete your own messages if needed.
          </AlertDescription>
        </Alert>

        <Card className="bg-white shadow-sm border">
          <CardContent className="p-0">
            <Chatroom />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatroomPage;