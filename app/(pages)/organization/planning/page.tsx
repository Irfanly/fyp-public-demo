'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events } from "@/lib/type/index";
import firestore from "@/services/firestore";
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, CalendarCheck, XCircle, ArrowRight, Search } from "lucide-react";
import { auth } from "@/conf/firebase";
import parser from "html-react-parser";

const OrganizationPlanningPage = () => {
    const [events, setEvents] = useState<events[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const { toast } = useToast();

    const router = useRouter();

    // Status options for filtering
    const statusOptions = ["All", "Planning", "Ongoing", "Active", "Past"];

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await fetchEvents();
            } else {
                console.log("No user found");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchEvents = async () => {
        try {
            const fetchedEvents = await firestore.getEventsByUserID();
            setEvents(fetchedEvents as events[]);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    //Function to delete event
    const handleDeleteEvent = async (eventID: string) => {
        try {
            await firestore.deleteEvent(eventID);
            console.log("Event deleted successfully.");
            toast({
                title: "Event Deleted",
                description: "The event has been successfully deleted.",
                variant: "default"
            });
        // Refresh events
            fetchEvents();
        } catch (err) {
            console.error("Failed to delete event:", err);
            toast({
                title: "Error",
                description: "An error occurred. Please try again later.",
                variant: "destructive"
            });
        }
    };


    const statusColors = {
        "Planning": "bg-blue-500",
        "Ongoing": "bg-yellow-500",
        "Active": "bg-green-500",
        "Past": "bg-gray-500"
    };

    const statusIcons = {
        "Planning": <Clock className="w-3 h-3" />,
        "Ongoing": <CalendarCheck className="w-3 h-3" />,
        "Active": <CheckCircle className="w-3 h-3" />,
        "Past": <Clock className="w-3 h-3" />
    };

    const getStatusBadge = (status: keyof typeof statusColors) => {
        return (
            <Badge className={`text-white ${statusColors[status] || "bg-gray-400"} flex items-center gap-1 px-2 py-1`}>
                {statusIcons[status] || <Clock className="w-3 h-3" />}
                {status}
            </Badge>
        );
    };

    // Filter events based on search term and status
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (statusFilter === "All" || event.status === statusFilter)
    );

    const renderEventCard = (event: events) => (
        <Card key={event.eventID} className="hover:bg-gray-50 shadow-sm transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{parser(event.title)}</h3>
                        <div className="text-sm text-gray-600 mt-1">{parser(event.shortDescription)}</div>
                    </div>
                    {getStatusBadge(event.status as keyof typeof statusColors || "Planning")}
                </div>

                <div className="flex justify-end mt-4 gap-2">
                {/* View Details Button (Always Visible) */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/organization/details/${event.eventID}`)}
                    className="flex items-center gap-2"
                >
                    View Details <ArrowRight className="w-4 h-4" />
                </Button>

                {/* Plan Event Button (Always Visible) */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/organization/planning/${event.eventID}`)}
                    className="flex items-center gap-2"
                >
                    Plan Event <ArrowRight className="w-4 h-4" />
                </Button>

                {/* Delete Button (Only for "Planning" status) */}
                {event.status === "Planning" && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.eventID)}
                        className="flex items-center gap-2"
                    >
                        Delete <XCircle className="w-4 h-4" />
                    </Button>
                )}
            </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="my-8">
                <h1 className="text-3xl font-bold text-gray-900">Organization Events</h1>
                <p className="mt-2 text-gray-600">Manage and track your organization’s events</p>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search events by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-lg border p-2 rounded-md"
                    />
                </div>
                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    <p className="text-sm font-medium text-gray-700 mr-2 self-center">Filter by status:</p>
                    {statusOptions.map((status) => (
                        <Button 
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={`${
                                statusFilter === status ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"
                            }`}
                        >
                            {status}
                            {status !== "All" && statusFilter === status && (
                                <span className="ml-2 rounded-full bg-white text-blue-600 w-4 h-4 flex items-center justify-center text-xs">
                                    {events.filter(event => event.status === status).length}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-xl font-semibold">All Events</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : filteredEvents.length === 0 ? ( // Show filtered events
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                            <p className="mt-1 text-gray-500">
                                {searchTerm ? 
                                    `No matching events for "${searchTerm}"` : 
                                    `No ${statusFilter !== "All" ? statusFilter : ""} events found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEvents.map(event => renderEventCard(event))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrganizationPlanningPage;
