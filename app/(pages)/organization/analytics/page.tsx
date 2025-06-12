'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { events } from '@/lib/type/index'
import { auth } from '@/conf/firebase';
import firestore from '@/services/firestore';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowRight, Search, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import helper from '@/lib/helper/function';
import parser from 'html-react-parser';

const EventAnalyticsPage = () => {
    const [events, setEvents] = useState<events[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const router = useRouter();

    // Status options for filtering
    const statusOptions = ["All", "Planning", "Ongoing", "Active", "Past"];

    useEffect(() => {
        // Only start fetching after user has initialized
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // Fetch data
                fetchEventData();
            } else {
                console.log("No user found");
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchEventData = async () => {
        try {
            setIsLoading(true);
            const eventData = await firestore.getEventsByUserID();
            setEvents(eventData as events[]);
            console.log(eventData);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Status colors and icons (same as planning page)
    const statusColors = {
        "Planning": "bg-blue-500",
        "Ongoing": "bg-yellow-500",
        "Active": "bg-green-500",
        "Past": "bg-gray-500"
    };

    const getStatusBadge = (status: keyof typeof statusColors) => {
        return (
            <Badge className={`text-white ${statusColors[status] || "bg-gray-400"} flex items-center gap-1 px-2 py-1`}>
                {status}
            </Badge>
        );
    };

    // Filter events based on search term and status
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (statusFilter === "All" || event.status === statusFilter)
    );

    // Render event card
    const renderEventCard = (event: events) => (
        <Card key={event.eventID} className="hover:bg-gray-50 shadow-sm transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{parser(event.title)}</h3>
                        <div className="text-sm text-gray-600 mt-1">{parser(event.shortDescription || "")}</div>
                        
                        {/* Event metadata */}
                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.eventDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {helper.formatTime(event.eventTime)}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.eventLocation}
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(event.status as keyof typeof statusColors || "Planning")}
                </div>

                <div className="flex justify-end mt-4 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/organization/analytics/${event.eventID}`)}
                        className="flex items-center gap-2"
                    >
                        View Analytics <BarChart2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="my-8">
                <h1 className="text-3xl font-bold text-gray-900">Events Analytics</h1>
                <p className="mt-2 text-gray-600">View and analyze your event data</p>
            </div>

            <div className="mb-4">
                {/* Search Bar */}
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
                    <CardTitle className="text-xl font-semibold">Event Analytics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <BarChart2 className="w-12 h-12 text-gray-400 mx-auto" />
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

export default EventAnalyticsPage;