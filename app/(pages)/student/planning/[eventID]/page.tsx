'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { events } from "@/lib/type/index";
import firestore from "@/services/firestore";
import EventDetails from "./EventDetails";
import TaskDashboard from "./TaskDashboard";
import TeamMembers from "./TeamMembers";

const EventPlanningPage = () => {
    const router = useRouter();
    const { eventID } = useParams();
    const [loading, setLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState<events>();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const event = await firestore.getEventByID(eventID as string) as events;
                setEventDetails(event);
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, []);

    const handleSidebarCollapse = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="space-y-6 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 text-lg font-medium">Loading Event Details...</p>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-6 w-64 mx-auto" />
                        <Skeleton className="h-6 w-40 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    if (!eventDetails) {
        return <div>Event not found</div>;
    }
    
    return (
        <div className="max-w-6xl mx-auto">
            {/*Header*/}
            <div className="p-6 bg-white border-b">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Event Planning</h1>
                    <p className="text-gray-500 mt-1">Edit and Plan Your Events</p>
                    <p className="text-gray-500 mt-1">Current Status: <strong>{eventDetails.status}</strong></p>
                </div>
            </div>
            {/*Main content*/}
            <div className="mx-w-7xl mx-auto px-6 py-8 flex-1">
                <div className="min-w-[1000px] max-w-full overflow-x-auto">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Event Details</TabsTrigger>
                            <TabsTrigger value="team">Team Members</TabsTrigger>
                            <TabsTrigger value="task">Tasks</TabsTrigger>
                        </TabsList>
                        <div className="min-h-[600px] w-full">
                            <TabsContent value="details" className="mt-6 w-full">
                                <div>
                                    <EventDetails eventID={eventID as string} />
                                </div>
                            </TabsContent>
                            <TabsContent value="team" className="mt-6 w-full">
                                <div>
                                    <TeamMembers eventID={eventID as string} />
                                </div>
                            </TabsContent>
                            <TabsContent value="task" className="mt-6 w-full">
                                <div>
                                    <TaskDashboard eventID={eventID as string} />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default EventPlanningPage;