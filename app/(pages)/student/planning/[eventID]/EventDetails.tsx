"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon, Calendar, Clock, MapPin, Tag, Key } from "lucide-react";
import { events } from "@/lib/type/index";
import firestore from "@/services/firestore";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import parser from "html-react-parser";
import helper from "@/lib/helper/function";

const EventDetails = ({ eventID } : { eventID : string}) => {
    const router = useRouter();
    const [event, setEvent] = useState<events>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const event = await firestore.getEventByID(eventID);
                setEvent(event as events);
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventID]);

    if (loading || !event) {
        return <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading event details...</p>
            </div>
        </div>;
    }

    return(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster Section - Keeping the same column width */}
            <div className="lg:col-span-1">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ImageIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            Event Poster
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-96 bg-muted rounded-lg overflow-hidden flex justify-center items-center">
                            {event?.poster ? (
                                <img
                                    src={event.poster}
                                    alt={event.title}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">No poster uploaded</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Details Section - Keeping the same column width */}
            <div className="lg:col-span-2">
                <Card>
                    <ScrollArea className="h-[calc(100vh-200px)] max-h-[600px]">
                        <CardHeader>
                            <CardTitle>Event Overview</CardTitle>
                            <CardDescription>Only organizer may edit the details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-bold">Title:</Label>
                                    <div className="mt-1 text-lg font-semibold">{parser(event?.title) || "Still not updated"}</div>
                                </div>
                                
                                <div>
                                    <Label className="text-base font-bold">Short Description:</Label>
                                    <div className="mt-1 text-muted-foreground">{parser(event?.shortDescription) || "Still not updated"}</div>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                    <Label className="text-base font-bold">Detailed Description:</Label>
                                    <div className="mt-2 bg-muted/10 rounded-md whitespace-pre-line">
                                        {parser(event?.longDescription) || "Still not updated"}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start">
                                        <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <Label className="block">Date:</Label>
                                            <div>{helper.formatDate(event.eventDate) || "Still not updated"}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <Clock className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <Label className="block">Time:</Label>
                                            <div>{helper.formatTime(event?.eventTime) || "Still not updated"}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <Tag className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <Label className="block">Category:</Label>
                                            <Badge variant="outline">{event?.category || "Still not updated" }</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <Tag className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <Label className="block">Type:</Label>
                                            <Badge variant="outline">{event?.eventType || "Still not updated" }</Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                    <div>
                                        <Label className="block">Location:</Label>
                                        <div>{event?.eventLocation || "Still not updated" }</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <Key className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                    <div>
                                        <Label className="block">Attendance Code:</Label>
                                        <code className="px-2 py-1 bg-muted rounded text-sm">{event?.attendancePassword ||  "Still not updated" }</code>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
};

export default EventDetails;