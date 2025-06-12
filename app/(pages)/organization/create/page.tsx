'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";
import { EVENT_CATEGORIES, EVENT_TYPES, MYCSD_CORES, EVENT_LEVELS } from "@/lib/type";
import firestore from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/richTextEditor";
import { format } from "date-fns";
import { generateEventDescription } from "@/services/google/gemini";
import { auth } from "@/conf/firebase";
import DOMPurify from "dompurify";
import { marked } from "marked";
import  firestoreChatroom from "@/services/firestoreChatroom";

const EventCreationPage = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [eventData, setEventData] = useState({
        title: "",
        shortDescription: "",
        longDescription: "",
        eventDate: "",
        eventTime: "",
        eventLocation: "",
        eventType: "",
        category: "",
        maxParticipants: 0,
        attendancePassword: "",
        posterPreview: "",
        eventLevel: "",
        MyCSDPoints: 0,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isSubmitting]);

    const getEventOrganizer = () => {
        const user = auth.currentUser;
        if (user) {
            return user.displayName;
        }
    }

    const [posterFile, setPosterFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEventData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const formattedDate = format(new Date(value), "yyyy-MM-dd");
        setEventData((prev) => ({ ...prev, [name]: formattedDate }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
        const file = e.target.files[0];
        setPosterFile(file);
        const previewURL = URL.createObjectURL(file);
        setEventData((prev) => ({ ...prev, posterPreview: previewURL }));
        }

        //Revoke the object URL to prevent memory leaks
        if (eventData.posterPreview) {
            URL.revokeObjectURL(eventData.posterPreview);
        }
    };

    const validateForm = () => {
        console.log("In validate form");
        if (!eventData.title.trim()) return "Title is required.";
        if (!eventData.shortDescription.trim()) return "Short description is required.";
        if (!eventData.longDescription.trim()) return "Long description is required.";
        if (!eventData.eventDate) return "Event date is required.";
        if (!eventData.eventTime) return "Event time is required.";
        if (!eventData.eventLocation.trim()) return "Event location is required.";
        if (!eventData.eventType) return "Please select an event type.";
        if (!eventData.category) return "Please select a category.";
        if (!eventData.maxParticipants || isNaN(Number(eventData.maxParticipants))) return "Max participants must be a number.";
        return null;
    };

    const stripHtml = (html: string) => {
        const cleanText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }); // Remove all HTML tags
        return cleanText.trim();
    };

    const generateDescription = async () => {
        setIsGenerating(true);
        const data = {
            event_title: stripHtml(eventData.title),
            event_type: stripHtml(eventData.eventType),
            event_date: stripHtml(eventData.eventDate),
            event_location: stripHtml(eventData.eventLocation),
            mycsd_core: stripHtml(eventData.category),
            event_level: stripHtml(eventData.eventLevel),
            event_organizer: getEventOrganizer(),
            existing_description: stripHtml(eventData.longDescription),
        };

        //check if any event details are missing
        if (!data.event_title || !data.event_type || !data.event_date || !data.event_location || !data.event_organizer) {
            toast({ title: "Error", description: "Please fill out all event details before generating description.", variant: "destructive" });
            setIsGenerating(false);
            return;
        }
        
        try {
            const response = await generateEventDescription(data);
            //convert markdown into HTML
            const htmlResponse = await marked(response);
            //sanitize the HTML
            const sanitizedResponse = DOMPurify.sanitize(htmlResponse);
            console.log("Sanitized response:", sanitizedResponse);
            //set the sanitized HTML as the long description
            setEventData(prev => ({ ...prev, longDescription: sanitizedResponse }));
            toast({ title: "Success", description: "Description generated and applied successfully." });
        } catch (error) {
            console.error("Error generating description:", error);
            toast({ title: "Error", description: "Failed to generate description. Please try again.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateEvent = async () => {
        const formError = validateForm();
        if (formError) {
            console.log("In error");
            toast({ 
                title: "Error", 
                description: formError, 
                variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("In create event");

            const eventID = await firestore.createEvent(eventData, posterFile);
            toast({ 
                title: "Success", 
                description: "Event created successfully." });

            // Create a chatroom for the event
            if (eventID && auth.currentUser) {
                try {
                    const chatroomData = {
                        organizerID: auth.currentUser.uid,
                        eventID: eventID,
                        title: `${stripHtml(eventData.title)} Announcements`,
                        participants: [auth.currentUser.uid], // Start with the organizer as participant
                        messages: []
                    };
                    
                    await firestoreChatroom.createChatroom(chatroomData);
                    console.log("Announcement board created for event:", eventID);
                    
                    toast({ 
                        title: "Success", 
                        description: "Event created successfully with announcement board." 
                    });
                } catch (chatroomError) {
                    console.error("Error creating announcement board:", chatroomError);
                    
                    toast({ 
                        title: "Success", 
                        description: "Event created successfully, but announcement board creation failed." 
                    });
                }
            } else {
                toast({ 
                    title: "Success", 
                    description: "Event created successfully." 
                });
            }
            
            router.push("/organization");
        } catch (error) {
            setIsSubmitting(false);
            console.log(error)
            toast({ title: "Error", description: "Failed to create event. Please try again.", variant: "destructive" });
        }
        setIsSubmitting(false);
    };

    //test if the eventData is being set correctly when create event is clicked
    const handleCreateEventTest = () => {
        console.log("Event Data:", eventData);
        console.log("Poster File:", posterFile);
        toast({ title: "Event Data", description: JSON.stringify(eventData, null, 2) });
    }

    return (
        <main className="flex-1 overflow-hidden">
            <div className="p-6 bg-white border-b">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                        <p className="text-gray-500 mt-1">Fill out the details to create an event. You can edit it later.</p>
                    </div>
                    <Button 
                        className="shadow-sm" 
                        onClick={handleCreateEvent}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                Creating Event...
                            </>
                        ) : (
                            "Move to Planning Stage"
                        )}
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-6">
                <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Event Details</TabsTrigger>
                    <TabsTrigger value="poster">Event Poster</TabsTrigger>
                    </TabsList>
                    <div className="h-[calc(100vh-200px)] overflow-y-auto pb-6">
                    <TabsContent value="details" className="mt-6">
                        <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Event Information</CardTitle>
                            <CardDescription>Provide the necessary details for your event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <RichTextEditor
                                content={eventData.title}
                                onChange={(content) => setEventData(prev => ({ ...prev, title: content }))}
                                variant="single-line"
                                placeholder="Event Title"
                            />
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <RichTextEditor
                                content={eventData.shortDescription}
                                onChange={(content) => setEventData(prev => ({ ...prev, shortDescription: content }))}
                                variant="single-line"
                                placeholder="Short Description"
                            />
                            </div>
                            <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="longDescription">Long Description</Label>
                                    <Button 
                                        onClick={generateDescription} 
                                        size="sm" 
                                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="h-4 w-4" />
                                                <span>AI Generate</span>
                                            </>
                                        )}
                                    </Button>
                            </div>
                            <RichTextEditor
                                content={eventData.longDescription}
                                onChange={(content) => setEventData(prev => ({ ...prev, longDescription: content }))}
                                variant="multi-line"
                                placeholder="Long Description"
                            />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Event Date</Label>
                                <Input type="date" id="eventDate" name="eventDate" value={eventData.eventDate} onChange={handleDateChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventTime">Event Time</Label>
                                <Input type="time" id="eventTime" name="eventTime" value={eventData.eventTime} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventLocation">Location</Label>
                                <Input id="eventLocation" name="eventLocation" value={eventData.eventLocation} onChange={handleChange} placeholder="Location" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxParticipants">Max Participants</Label>
                                <Input id="participants" type="number" min="1" name="maxParticipants" value={eventData.maxParticipants} onChange={handleChange} placeholder="Participants" />
                            </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="eventType">Event Type</Label>
                                    <Select name="eventType" value={eventData.eventType} onValueChange={(value) => setEventData((prev) => ({ ...prev, eventType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Event Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVENT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">MyCSD Core</Label>
                                    <Select name="category" value={eventData.category} onValueChange={(value) => setEventData((prev) => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select MyCSD Core" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MYCSD_CORES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="eventLevel">Event Level</Label>
                                    <Select
                                        name="eventLevel"
                                        value={eventData.eventLevel}
                                        onValueChange={(value) =>
                                            setEventData((prev) => ({
                                                ...prev,
                                                eventLevel: value,
                                                MyCSDPoints: EVENT_LEVELS[value as keyof typeof EVENT_LEVELS], // Update MyCSDPoints
                                            }))
                                        }
                                    >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Event Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(EVENT_LEVELS).map((level) => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="MyCSDPoints">MyCSD Points</Label>
                                    <Input id="MyCSDPoints" name="MyCSDPoints" value={eventData.MyCSDPoints} onChange={handleChange} placeholder="MyCSD Points" disabled />
                                </div>
                            </div>
                        </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="poster">
                        <Card className="mt-6 shadow-sm">
                        <CardHeader>
                            <CardTitle>Event Poster</CardTitle>
                            <CardDescription>Upload a poster for your event.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                            <Label htmlFor="poster">Upload Poster</Label>
                            <input type="file" id="poster" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            {eventData.posterPreview && (
                            <div className="mt-4">
                                <img src={eventData.posterPreview} alt="Preview" className="w-full rounded-lg shadow-sm" />
                            </div>
                            )}
                        </CardContent>
                        </Card>
                    </TabsContent>
                    </div>
                </Tabs>
                </div>
            </div>
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            <h3 className="text-lg font-semibold text-gray-900">Creating Your Event</h3>
                            <p className="text-gray-500">Please wait while we set everything up for your event.</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default EventCreationPage;