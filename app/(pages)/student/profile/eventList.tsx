'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Trash2 } from "lucide-react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { events, students } from "@/lib/type";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import firestore from "@/services/firestore";
import firestoreChatroom from "@/services/firestoreChatroom";
import SideBar from "@/components/sideBar";
import { set } from "date-fns";
import { auth } from "@/conf/firebase";
import helper from "@/lib/helper/function";
import parser from "html-react-parser";

const EventList = ({ events: eventIDs }: { events: string[] }) => {
    const [registeredEvents, setRegisteredEvents] = useState<events[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);
    const [attendancePassword, setAttendancePassword] = useState("");
    const [attendanceEventID, setAttendanceEventID] = useState("");
    const [selectedEventID, setSelectedEventID] = useState<string | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<events[]>([]);
    const [pastEvents, setPastEvents] = useState<events[]>([]);
    const [ongoingEvents, setOngoingEvents] = useState<events[]>([]);
    const router = useRouter();
    const {toast} = useToast();

    const fetchRegisteredEvents = async () => {
        //fetch event details for each eventID
        const eventsData = [];
        for (let i = 0; i < eventIDs.length; i++) {
            const event = await firestore.getEventByID(eventIDs[i]);
            if (!event) {
                console.log(`Event with ID ${eventIDs[i]} not found`);
                continue; // Skip to the next iteration if event is not found
            }
            eventsData.push(event);
        }
        //If any event data is undefined, remove it from the array
        const validEventsData = eventsData.filter(event => event !== undefined);
        console.log("events data:", validEventsData);
        setRegisteredEvents(eventsData as events[]);
        console.log("Registered events:", registeredEvents);
        setIsLoading(false);
    }

    const fetchAttendedEvents = async () => {
        //fetch event details for each eventID
        const studentResult = await  firestore.readStudentDatabase() as students;
        const attendedEventIDs = studentResult.attendedEvents;
        setAttendedEvents(attendedEventIDs);
    }

    const filterRegisteredEvents = () => {
        //change it to filter event based on status of the event
        const upcoming = registeredEvents.filter(event => event.status === "Active");
        const past = registeredEvents.filter(event => event.status === "Past");
        const ongoing = registeredEvents.filter(event => event.status === "Ongoing");

        console.log("Registered events:", registeredEvents);
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setOngoingEvents(ongoing);

        console.log("Upcoming events:", upcoming);
        console.log("Past events:", past);
        console.log("Ongoing events:", ongoing);
    }

    const handleOpenUnregisterModal = (eventID: string) => {
        setSelectedEventID(eventID);
        setIsUnregisterModalOpen(true);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                fetchRegisteredEvents();
                fetchAttendedEvents();
            }
        });
        //fetchRegisteredEvents();
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        filterRegisteredEvents();
    }, [registeredEvents]);

    const confirmUnregister = async () => {
        if(!selectedEventID) return;

        try {
            await firestore.removeRegisteredEvents(selectedEventID);
            //update the registered events
            setRegisteredEvents(prevEvents => prevEvents.filter(event => event.eventID !== selectedEventID));
            await firestoreChatroom.removeChatroomParticipantByEventID(selectedEventID, auth.currentUser?.uid || "");
            toast({
                title: "Remove Registration",
                description: "You no longer registered for this event.",
                variant: "default"
                });
            
        } catch (err) {
            console.error("Failed to remove event:", err);
            toast({
            title: "Error",
            description: "An error occurred. Please try again later.",
            variant: "destructive"
            });
        }

        setIsUnregisterModalOpen(false);
        setSelectedEventID(null);
    }

    const handleTakeAttendance = (eventID: string) => {
        setAttendanceEventID(eventID);
        setIsAttendanceModalOpen(true);
    }

    const handleAttendanceSubmit = async () => {
        if (!attendanceEventID) return;
        try {
            const event = await firestore.getEventByID(attendanceEventID) as events;
            if (event.attendancePassword === attendancePassword) {
                // Record attendance logic here
                await firestore.recordAttendance(attendanceEventID);

                // Update the attended events
                setAttendedEvents(prev => [...prev, attendanceEventID]);

                toast({
                    title: "Attendance Taken",
                    description: "Your attendance has been recorded.",
                    variant: "default"
                });
                setIsAttendanceModalOpen(false);
                setAttendancePassword("");
            } else {
                toast({
                    title: "Invalid Password",
                    description: "The password you entered is incorrect.",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error("Failed to take attendance:", err);
            toast({
                title: "Error",
                description: "An error occurred. Please try again later.",
                variant: "destructive"
            });
        }
    }
    const getCategoryColor = (category: string | number) => {
        const colors: { [key: string]: string } = {
          Technical: "bg-blue-100 text-blue-800",
          Community: "bg-green-100 text-green-800",
          Workshop: "bg-purple-100 text-purple-800",
        };
        return colors[category] || "bg-gray-100 text-gray-800";
      };

    const renderEventCard = (  event: events, isUpcoming: boolean=false, isOngoing: boolean=false,  isPast: boolean=false ) => {
        const hasAttended = attendedEvents.includes(event.eventID);
        
        return(
            <Card key={event.eventID} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                            {parser(event.title)}
                            </h4>
                            <Badge className={`mt-2 ${getCategoryColor(event.category)}`}>
                            {event.category}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{helper.formatDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formatTime(event.eventTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{event.eventLocation}</span>
                        </div>
                    </div>
                    {isUpcoming && (
                        <Button 
                            variant="outline" 
                            className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                            onClick={() => handleOpenUnregisterModal(event.eventID)}
                        >
                            <Trash2 className="w-5 h-5" />
                            Unregister
                        </Button>
                    )}
                    {isOngoing && (
                        <Button 
                            className="w-full mt-4 bg-green-600 hover:bg-green-700" 
                            onClick={() => handleTakeAttendance(event.eventID)}
                            disabled={hasAttended}
                        >
                            {hasAttended ? "Attended" : "Take Attendance"}
                        </Button>
                    )}
                    {isPast && (
                        <Badge className="mt-4 bg-gray-100 text-gray-800">
                            {hasAttended ? "Attended" : "Missed"}
                        </Badge>
                    )}
                    <Button 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
                        onClick={() => router.push(`/student/details/${event.eventID}`)}>
                            View Details
                    </Button>
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
    return (
        <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
            <div className="mb-6">
            <div className="w-[400px] h-10 bg-gray-100 rounded-md mb-6 animate-pulse"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white border rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                        {/* Title */}
                        <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                        {/* Badge */}
                        <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                    </div>
                    </div>
                    
                    {/* Event details */}
                    <div className="space-y-3 my-4">
                    {[1, 2, 3].map((line) => (
                        <div key={line} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                        </div>
                    ))}
                    </div>
                    
                    {/* Buttons */}
                    <div className="space-y-2 mt-4">
                    <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
                    <div className="h-10 bg-blue-200 rounded-md w-full animate-pulse"></div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </CardContent>
        </Card>
    );
    }

    return (
    <>
        <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
                <Tabs defaultValue="upcoming" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] p-1 bg-gray-100">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-6">
                        {upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingEvents.map(event => (
                                    renderEventCard(event, true, false, false)
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900">No Upcoming Events</h3>
                                <p className="text-gray-500 mt-2">Check back later for new events.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ongoing">
                        {ongoingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ongoingEvents.map(event => (
                                    renderEventCard(event, false, true, false)
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900">No Ongoing Events</h3>
                                <p className="text-gray-500 mt-2">Check back later for live events.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-6">
                        {pastEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pastEvents.map(event => (
                                    renderEventCard(event, false, false, true)
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900">No Past Events</h3>
                                <p className="text-gray-500 mt-2">You have not attended any events yet.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Take Attendance</DialogTitle>
                    <DialogDescription>Enter the event password to record your attendance.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="attendance-password" className="text-sm font-medium">Event Password</label>
                        <Input
                            id="attendance-password"
                            type="text"
                            placeholder="Enter event password"
                            value={attendancePassword}
                            onChange={(e) => setAttendancePassword(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAttendanceSubmit}>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={isUnregisterModalOpen} onOpenChange={setIsUnregisterModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Unregistration</DialogTitle>
                        <DialogDescription>Are you sure you want to unregister from this event?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUnregisterModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmUnregister}>Unregister</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </>
    );

}

export default EventList;