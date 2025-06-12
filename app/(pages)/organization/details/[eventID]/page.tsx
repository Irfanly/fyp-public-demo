'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Book, MapPin, Building2, Tag, QrCode, UserCheck, UserPlus, Download } from "lucide-react";
import { events, userDetailsList } from "@/lib/type";
import firestore from "@/services/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import helper from "@/lib/helper/function";
import parser from "html-react-parser";
import { ScrollArea } from "@/components/ui/scroll-area";

const EventDetailsPage = () => {
    const [eventDetails, setEventDetails] = useState<events | null>(null);
    const [registrationList, setRegistrationList] = useState<userDetailsList[]>([]);
    const [attendanceList, setAttendanceList] = useState<userDetailsList[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { eventID } = useParams();

    useEffect(() => {
        const fetchEventDetails = async () => {
        try {
            const eventData = await firestore.getEventByID(eventID);
            setEventDetails(eventData as events);
        } catch (error) {
            console.error("Error fetching event details:", error);
        } finally {
            setIsLoading(false);
        }
        };

        const fetchParticipantsList = async () => {
        try {
            const participantsData = await firestore.getParticipantsList(eventID);
            setRegistrationList(participantsData);
        } catch (error) {
            console.error("Error fetching participants list:", error);
            setRegistrationList([]);
        }
        };

        const fetchAttendanceList = async () => {
        try {
            const attendanceData = await firestore.getAttendanceList(eventID);
            setAttendanceList(attendanceData);
        } catch (error) {
            console.error("Error fetching attendance list:", error);
            setAttendanceList([]);
        }
        };

        fetchEventDetails();
        fetchParticipantsList();
        fetchAttendanceList();
    }, [eventID]);

    const exportData = (data: userDetailsList[], filename: string) => {
        const csvContent = [
            ["Name", "Email", "Matric No"],
            ...data.map(person => [person.name, person.email, person.matricNo])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="space-y-4">
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            </div>
        </div>
        );
    }

    if (!eventDetails) {
        return <div className="min-h-screen flex justify-center items-center">Event not found.</div>;
    }

    return (
        <main className="flex-1 min-w-screen border-l border-gray-200 bg-gray-50">
            {/* Header */}
            <div className="p-6 bg-white border-b">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">{parser(eventDetails.title)}</h1>
                    <div className="text-gray-500 mt-1">{parser(eventDetails.shortDescription)}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="details">Event Details</TabsTrigger>
                        <TabsTrigger value="registration">Registration List</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance List</TabsTrigger>
                    </TabsList>

                    {/* Event Details Tab */}
                    <TabsContent value="details" className="w-full mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Poster Section */}
                            <div className="lg:col-span-1">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle>Event Poster</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {eventDetails.poster && (
                                            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center">
                                                <img
                                                    src={eventDetails.poster}
                                                    alt="Event Poster"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Event Details Section */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Event Overview</CardTitle>
                                        <CardDescription>Detailed information about the event.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="text-gray-700 whitespace-pre-line">{parser(eventDetails.longDescription)}</div>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-center space-x-4">
                                                <Calendar className="w-6 h-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Date & Time</p>
                                                    <p className="font-medium">
                                                        {helper.formatDate(eventDetails.eventDate)} •{" "}
                                                        {helper.formatTime(eventDetails.eventTime)} {" "}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <MapPin className="w-6 h-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Location</p>
                                                    <p className="font-medium">{eventDetails.eventLocation}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Tag className="w-6 h-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Event Type</p>
                                                    <p className="font-medium">{eventDetails.eventType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Book className="w-6 h-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">MyCSD Cores</p>
                                                    <p className="font-medium">{eventDetails.category}</p>
                                                </div>
                                            </div>                                          
                                            <div className="flex items-center space-x-4">
                                                <Building2 className="w-6 h-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Organizer</p>
                                                    <p className="font-medium">{eventDetails.organizer}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <QrCode className="w-6 h-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Attendance Code</p>
                                                    <p className="font-medium">{eventDetails.attendancePassword || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Registration List Tab */}
                    <TabsContent value="registration" className="w-full mt-6">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Registration List</CardTitle>
                                <CardDescription>
                                    <Badge className="mt-2">{registrationList.length} Registered</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-y-auto">
                                <ScrollArea className="h-96">
                                    {registrationList.length === 0 ? (
                                    <p className="text-gray-500">No registered participants yet.</p>
                                    ) : (
                                    <div className="space-y-4">
                                        {registrationList.map((person) => (
                                        <div key={person.userID} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={person.photoURL} />
                                                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{person.name}</p>
                                                    <p className="text-sm text-gray-500">Email: {person.email}</p>
                                                    <p className="text-sm text-gray-500">Matric No: {person.matricNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="flex items-center gap-2" onClick={() => exportData(registrationList, 'registration_list.csv')}>
                                    <Download className="w-4 h-4" />
                                    Export Registration Data
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Attendance List Tab */}
                    <TabsContent value="attendance" className="w-full mt-6">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Attendance List</CardTitle>
                                <CardDescription>
                                    <Badge className="mt-2">{attendanceList.length} Attended</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-y-auto">
                                <ScrollArea className="h-96">
                                    {attendanceList.length === 0 ? (
                                    <p className="text-gray-500">No attendance yet.</p>
                                    ) : (
                                    <div className="space-y-4">
                                        {attendanceList.map((person) => (
                                        <div key={person.userID} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={person.photoURL} />
                                                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{person.name}</p>
                                                    <p className="text-sm text-gray-500">Email: {person.email}</p>
                                                    <p className="text-sm text-gray-500">Matric No: {person.matricNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="flex items-center gap-2" onClick={() => exportData(attendanceList, 'attendance_list.csv')}>
                                    <Download className="w-4 h-4" />
                                    Export Attendance Data
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
};

export default EventDetailsPage;