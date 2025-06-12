'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { events } from "@/lib/type/index";
import firestore from "@/services/firestore";
import { CalendarClock, CheckCircle, Clock, Users, ArrowBigRight } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/conf/firebase";
import { set } from "date-fns";
import helper from "@/lib/helper/function";
import parser from "html-react-parser";

const EventPlanningPage = () => {
    const [planningEvents, setPlanningEvents] = useState<events[]>([]);
    const [completeEvents, setCompleteEvents] = useState<events[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {

        // const fetchEvents = async () => {
        //     const eventsData = await firestore.getEventsByUserIDForTeamMembers();
        //     const planning = eventsData.filter(event => event && event.status === "Planning");
        //     const complete = eventsData.filter(event => event && event.status === "Complete");
        //     setPlanningEvents(planning as events[]);
        //     setCompleteEvents(complete as events[]);
        // };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const eventsData = await firestore.getEventsByUserIDForTeamMembers() as events[];
                    const planning = eventsData.filter(event => event && event.status && ["Planning", "Upcoming", "Ongoing"].includes(event.status));
                    const complete = eventsData.filter(event => event && event.status === "Past");
                    console.log(eventsData);
                    setPlanningEvents(planning as events[]);
                    setCompleteEvents(complete as events[]);
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.log("No user is signed in");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderEventCard = (event: events) => (
        <Card key={event.eventID} className="hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02]">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{parser(event.title)}</h3>
                            <p className="text-gray-600 mt-2">{parser(event.shortDescription)}</p>
                        </div>
                        <Badge 
                            variant={event.status === "Planning" ? "default" : "secondary"}
                            className="flex items-center gap-1"
                        >
                            {event.status === "Planning" ? (
                                <Clock className="w-3 h-3" />
                            ) : (
                                <CheckCircle className="w-3 h-3" />
                            )}
                            {event.status}
                        </Badge>
                    </div>
                    

                    <div className="flex justify-end">
                        <button
                            onClick={() => router.push(`/student/planning/${event.eventID}`)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                            Task Page
                            <ArrowBigRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderEmptyState = (type: 'planning' | 'complete') => (
        <div className="text-center py-12">
            <div className="flex justify-center mb-4">
                {type === 'planning' ? (
                    <Clock className="w-12 h-12 text-gray-400" />
                ) : (
                    <CheckCircle className="w-12 h-12 text-gray-400" />
                )}
            </div>
            <h3 className="text-lg font-medium text-gray-900">
                No {type === 'planning' ? 'planning' : 'complete'} events found
            </h3>
            <p className="mt-1 text-gray-500">
                {type === 'planning' 
                    ? 'You currently have no events in planning stage.' 
                    : 'You have no completed events yet.'}
            </p>
        </div>
    );

    return (

        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Event Planning</h1>
                <p className="mt-2 text-gray-600">Manage and track your event planning progress</p>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-xl font-semibold">Events Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="planning" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="planning" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Planning ({planningEvents.length})
                            </TabsTrigger>
                            <TabsTrigger value="complete" className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Complete ({completeEvents.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="planning">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ) : planningEvents.length === 0 ? (
                                renderEmptyState('planning')
                            ) : (
                                <div className="space-y-4">
                                    {planningEvents.map(event => renderEventCard(event))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="complete">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ) : completeEvents.length === 0 ? (
                                renderEmptyState('complete')
                            ) : (
                                <div className="space-y-4">
                                    {completeEvents.map(event => renderEventCard(event))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default EventPlanningPage;