'use client';

import React from 'react';
import { useState, useEffect } from "react";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  PlusCircle,
  Bell,
  Calendar as CalendarIcon,
  BarChart3,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import firestore from "@/services/firestore";
import { auth } from "@/conf/firebase";
import { events } from "@/lib/type/index";
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import firestoreChatroom from "@/services/firestoreChatroom";
import parser from 'html-react-parser';
import helper from '@/lib/helper/function';

const OrganizationDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<events[]>([]);
  const [pastEvents, setPastEvents] = useState<events[]>([]);
  const [planningEvents, setPlanningEvents] = useState<events[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<events[]>([]);
  const [filteredPastEvents, setFilteredPastEvents] = useState<events[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  //Function to delete event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      setIsDeleting(eventToDelete);
      
      // Find and delete the associated chatroom first
      try {
        const chatrooms = await firestoreChatroom.getEventChatrooms(eventToDelete);
        if (chatrooms && chatrooms.length > 0) {
          // Delete each chatroom associated with the event
          for (const chatroom of chatrooms) {
            await firestoreChatroom.deleteChatroom(chatroom.chatroomID);
            console.log("Deleted associated chatroom:", chatroom.chatroomID);
          }
        }
      } catch (chatroomErr) {
        console.error("Error deleting associated chatrooms:", chatroomErr);
      }
      
      // Now delete the event itself
      await firestore.deleteEvent(eventToDelete);
      
      toast({
        title: "Event Deleted",
        description: "The event and its associated chatrooms have been successfully deleted.",
        variant: "destructive"
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
    } finally {
      setIsDeleting(null);
      setEventToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Function to trigger the delete confirmation dialog
  const confirmDeleteEvent = (eventID: string) => {
    setEventToDelete(eventID);
    setShowDeleteDialog(true);
  };

  const filterEventByStatus = (eventData: events[], status: string) => {
      const filteredEvents = eventData.filter(event => event.status === status);
      return filteredEvents;
  }

  // Fetch organization's events
  useEffect(() => {
    // Wait for authentication state before fetching events
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            const eventsData = await firestore.getEventsByUserID() as events[];
            console.log(eventsData);

            const upcoming = eventsData.filter(event => event.status === "Active");
            const past = eventsData.filter(event => event.status === "Past");
            const ongoing = eventsData.filter(event => event.status === "Ongoing");
            const planning = eventsData.filter(event => event.status === "Planning");
            
            setPlanningEvents(planning);
            setUpcomingEvents(upcoming);
            setOngoingEvents(ongoing);
            setPastEvents(past);

            console.log("planing", planning);   
        } catch (err) {
            console.error("Failed to fetch events:", err);
        }
      } else {
            console.log("No user found");
      }
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const fetchEvents = async () => {
    try {
        const eventsData = await firestore.getEventsByUserID() as events[];
        console.log(eventsData);
    
        const upcoming = eventsData.filter(event => event.status === "Active");
        const past = eventsData.filter(event => event.status === "Past");
        const ongoing = eventsData.filter(event => event.status === "Ongoing");
        const planning = eventsData.filter(event => event.status === "Planning");
        
        setPlanningEvents(planning);
        setUpcomingEvents(upcoming);
        setOngoingEvents(ongoing);
        setPastEvents(past);
    
        console.log("planing", planning);
    } catch (err) {
        console.error("Failed to fetch events:", err);
    }
    }

  // Filter and sort past events
  useEffect(() => {
    let filtered = [...pastEvents];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      
      switch (sortBy) {
        case "date-desc":
          return dateB.getTime() - dateA.getTime();
        case "date-asc":
          return dateA.getTime() - dateB.getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    setFilteredPastEvents(filtered);
  }, [searchTerm, sortBy, pastEvents]);

  const stats = {
    totalEvents: planningEvents.length + upcomingEvents.length + ongoingEvents.length + pastEvents.length,
    upcomingEvents: upcomingEvents.length,
    pastEvents: pastEvents.length,
  };

  const renderEventCard = (event: events, isPlaning: boolean = false, isUpcoming: boolean = false, isOngoing: boolean = false, isPast: boolean = false) => (
    <div
      key={event.eventID}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
        <div className="space-y-2">
            <h3 className="font-semibold">
                {parser(event.title)}
            </h3>
            <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {helper.formatDate(event.eventDate)}
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
        <div className="flex gap-2">
            {isPlaning && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/organization/planning/${event.eventID}`)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                  <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDeleteEvent(event.eventID)}
                      disabled={isDeleting === event.eventID}
                    >
                      {isDeleting === event.eventID ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                </>
            )}

            {isUpcoming && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/organization/planning/${event.eventID}`)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                </>
            )}

            {isOngoing && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/organization/planning/${event.eventID}`)}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/organization/details/${event.eventID}`)}
            >
                View Details
            </Button>
            
        </div>
    </div>
  );

  return (
        
        <div className="flex-1 overflow-auto  bg-gray-50">
            {/* Header */}
            {/* Stretch the bg white entire screen*/}
            <div className="bg-white border-b mb-8">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Organization Dashboard</h1>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => router.push('/organization/create')}
                                className="flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Create Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Calendar className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-gray-600">Total Events</p>
                            <p className="text-2xl font-bold">{stats.totalEvents}</p>
                        </div>
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-600">Upcoming Events</p>
                            <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                        </div>
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="w-8 h-8 text-purple-500" />
                        <div>
                            <p className="text-sm text-gray-600">Past Events</p>
                            <p className="text-2xl font-bold">{stats.pastEvents}</p>
                        </div>
                    </div>
                </CardContent>
                </Card>
            </div>

            {/* Events Tabs */}
            <Tabs defaultValue="planning" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="planning">Planning</TabsTrigger>
                    <TabsTrigger value="upcoming">Active Events</TabsTrigger>
                    <TabsTrigger value="ongoing">Ongoing Events</TabsTrigger>
                    <TabsTrigger value="past">Past Events</TabsTrigger>
                </TabsList>

                <TabsContent value="planning">
                <Card>
                    <CardHeader>
                    <CardTitle>Planning Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : planningEvents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No planning events found.</div>
                    ) : (
                        <div className="space-y-4">
                        {planningEvents.map((event) => renderEventCard(event, true, false, false, false))}
                        </div>
                    )}
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="upcoming">
                <Card>
                    <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No upcoming events. Create one now!</div>
                    ) : (
                        <div className="space-y-4">
                        {upcomingEvents.map((event) => renderEventCard(event, false, true, false, false))}
                        </div>
                    )}
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="ongoing">
                <Card>
                    <CardHeader>
                    <CardTitle>Ongoing Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : ongoingEvents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No ongoing events. Create one now!</div>
                    ) : (
                        <div className="space-y-4">
                        {ongoingEvents.map((event) => renderEventCard(event, false, false, true, false))}
                        </div>
                    )}
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="past">
                <Card>
                    <CardHeader>
                    <CardTitle>Past Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : filteredPastEvents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No past events found.</div>
                    ) : (
                        <div className="space-y-4">
                        {filteredPastEvents.map((event) => renderEventCard(event, false, false, false, true))}
                        </div>
                    )}
                    </CardContent>
                </Card>
                </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card className="mt-6">
                <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/organization/create')}
                    >
                    <PlusCircle className="w-6 h-6" />
                    Create New Event
                    </Button>
                    <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/organization/planning')}
                    >
                    <BarChart3 className="w-6 h-6" />
                    View Event List
                    </Button>
                    <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.push('/organization/analytics')}
                    >
                    <BarChart3 className="w-6 h-6" />
                    View Analytics
                    </Button>
                </div>
                </CardContent>
            </Card>
            </main>
            {/* Delete Event Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this event? This action will also delete all associated chatrooms and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEventToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteEvent} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting !== null}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Event"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OrganizationDashboard;