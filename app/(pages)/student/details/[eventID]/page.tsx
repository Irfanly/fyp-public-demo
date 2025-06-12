'use client';

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Info,
  Calendar, 
  MapPin, 
  Clock, 
  Monitor, 
  Check, 
  Users, 
  Tag, 
  Maximize2,
  Brain,
  ChevronLeft
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import firestore from "@/services/firestore";
import fireauth from "@/services/fireauth";
import firestoreChatroom from "@/services/firestoreChatroom";
import { events } from "@/lib/type/index";
import { generateEventSummary } from "@/services/google/gemini";
import parser from "html-react-parser";
import helper from "@/lib/helper/function";
import { max, set } from "date-fns";

const EventDetailsContent = () => {
  const [event, setEvent] = useState<events | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [eventParticipants, setEventParticipants] = useState<number>(0);
  const [maxParticipants, setMaxParticipants] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { eventID } = useParams();

  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true);
      try {
        const userData = await fireauth.checkAuthState();
        setUser(userData);
      } catch (err) {
        console.error("Auth error:", err);
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchAISummary = async (text: string) => {
        setIsFetchingSummary(true);
        try{
            setAiSummary("Currently generating summary...");
            const response = await generateEventSummary(text);
            setAiSummary(response);
            toast({
                title: "AI Summary Generated",
                description: "We've created a concise summary of this event for you.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "AI Summary Failed",
                description: "Failed to generate a summary for this event. Please try again.",
            });
        }
        setIsFetchingSummary(false);
  };

  //Get number of registered participants for the current event
  const fetchRegisteredParticipants = async () => {
    try {
      const registeredParticipants = await firestore.getTotalRegisteredStudents(eventID as string);
      setEventParticipants(registeredParticipants);
    } catch (err) {
      console.error("Error fetching registered participants:", err);
    }
  }

  useEffect(() => {
    if (!eventID || authLoading) return;

    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const eventData = await firestore.getEventByID(eventID as string);
        setEvent(eventData as events);
      } catch (err) {
        setError("Failed to load event details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    //Check if user is already registered for the event
    const fetchRegisteredEvents = async () => {
      try {
        const studentData = await firestore.readStudentDatabase();
        if (studentData) {
          setRegisteredEvents(studentData.registeredEvents);
          if (studentData.registeredEvents.includes(eventID as string)) {
            setIsRegistered(true);
          }
        }
      } catch (err) {
        console.error("Error fetching registered events:", err);
      }
    };
    
    fetchEventDetails();
    fetchRegisteredParticipants();

    if (!authLoading && user) {
      fetchRegisteredEvents();
    }
  }, [eventID, authLoading, user]);

  useEffect(() => {
    if (event && eventParticipants >= event.maxParticipants) {
      setMaxParticipants(true);
    } else {
      setMaxParticipants(false);
    }
  }, [event, eventParticipants]);

  const handleRegister = async () => {
    //Refetch to see if event is full
    await fetchRegisteredParticipants();
    setIsRegistering(true);
    if (event && eventParticipants >= event.maxParticipants ) {
      setMaxParticipants(true);
      toast({
        variant: "destructive",
        title: "Event Full",
        description: "This event has reached maximum capacity.",
      });
      return;
    } else {
      setMaxParticipants(false);
    }

    if(isRegistered) {
      toast({
        variant: "destructive",
        title: "Already Registered",
        description: "You are already registered for this event.",
      });
      return;
    }

    if (!maxParticipants) {
      try {
        await firestore.registeredEvents(eventID as string);
        setIsRegistered(true);
        await firestoreChatroom.addChatroomParticipantByEventID(eventID as string, user.uid);
        setEventParticipants(prev => prev + 1);
        setShowSuccessDialog(true);
      } catch (err) {
        console.log("Error registering for event:", err);
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Failed to register for the event. Please try again.",
        });
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getTimeUntilEvent = () => {
    if (!event?.eventDate) return null;
    
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    if (eventDate < now) return "Event has passed";
    
    const diffTime = Math.abs(eventDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} away`;
    }
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    }
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    }
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} away`;
  };

  if (isLoading || authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] w-full rounded-lg md:col-span-1" />
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-50 p-8 rounded-lg max-w-md">
        <h3 className="text-xl font-semibold mb-4">Error Loading Event</h3>
        <p className="mb-6">{error}</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center text-gray-700 bg-gray-100 p-8 rounded-lg max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-4">Event Not Found</h3>
        <p className="mb-6">The event you are looking for does not exist or has been removed.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const timeUntilEvent = getTimeUntilEvent();
  const isEventPassed = timeUntilEvent === "Event has passed";

  return (
    <>
      <main className="max-w-6xl mx-auto py-8">
        {/* Back button and event time indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-600 w-fit"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Events
          </Button>
          
          {timeUntilEvent && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">{timeUntilEvent}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Poster Column */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                    {event?.poster ? (
                      <img 
                        src={event.poster} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <img 
                          src="https://t3.ftcdn.net/jpg/02/48/42/64/240_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg" 
                          alt="Event placeholder" 
                          className="w-full h-full object-cover opacity-50"
                        />
                      </div>
                    )}
                    
                    {event?.poster && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="icon"
                            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh]">
                          <DialogTitle>Event Poster</DialogTitle>
                          <div className="h-[calc(100%-6rem)] overflow-hidden">
                            <img
                              src={event.poster}
                              alt={event.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button>Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4 p-4">
                {/* Registration progress bar */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Participants</span>
                    <span>{eventParticipants} / {event.maxParticipants}</span>
                  </div>
                  <Progress 
                    value={(eventParticipants / event.maxParticipants) * 100} 
                    className="h-2" 
                  />
                </div>

                {/* Registration button */}
                <Button 
                  onClick={handleRegister}
                  className="w-full"
                  disabled={isRegistering || isRegistered || maxParticipants || isEventPassed}
                  variant={isRegistering || isRegistered ? "outline" : maxParticipants ? "secondary" : "default"}
                >
                  {isRegistering ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Registering...
                    </>
                  ) : isRegistered ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Registered
                    </>
                  ) : maxParticipants ? (
                    <>
                      <Info className="w-4 h-4 mr-2" />
                      Event Full
                    </>
                  ) : isEventPassed ? (
                    <>
                      <Info className="w-4 h-4 mr-2" />
                      Event Passed
                    </>                  
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Register for Event
                    </>
                  )}
                </Button>

                {/* Notice when event is full */}
                {maxParticipants && !isRegistered && (
                  <div className="text-center text-sm text-amber-600 bg-amber-50 p-2 rounded-md mt-2">
                    <p>This event has reached maximum capacity.</p>
                  </div>
                )}
                {/* Notice when event is passed */}
                {isEventPassed && (
                  <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded-md mt-2">
                    <p>This event has already passed.</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="text-sm">
                    {event?.eventType === "Online" ? (
                      <Monitor className="w-3 h-3 mr-1" />
                    ) : (
                      <MapPin className="w-3 h-3 mr-1" />
                    )}
                    {event?.eventType}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <Tag className="w-3 h-3 mr-1" />
                    {event?.category}
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  {parser(event.title)}
                </CardTitle>
                
                <CardDescription>
                  {event.shortDescription && parser(event.shortDescription)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Date</span>
                      <span className="font-medium">{helper.formatDate(event?.eventDate || "")}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Time</span>
                      <span className="font-medium">{event?.eventTime ? formatTime(event?.eventTime) : "TBA"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Location</span>
                      <span className="font-medium">{event?.eventLocation || "TBA"}</span>
                    </div>
                  </div>
                </div>

                {/* Add Event Level and MyCSD Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Tag className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Event Level</span>
                      <span className="font-medium">{event?.eventLevel || "Not specified"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <div className="w-5 h-5 text-gray-500 flex items-center justify-center font-bold">P</div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">MyCSD Points</span>
                      <span className="font-medium">{event?.MyCSDPoints || 0} points</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="prose max-w-none">
                        <div className="text-gray-700 whitespace-pre-line">
                          {parser(event.longDescription)}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ai-summary" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      AI-Generated Summary
                    </CardTitle>
                    <CardDescription>
                      Get a concise summary of this event generated by AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] flex flex-col">
                      {aiSummary ? (
                        <div className="prose">
                          <p className="text-gray-700">{aiSummary}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-grow gap-4 py-8">
                          <div className="text-center max-w-md">
                            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700">Generate AI Summary</h3>
                            <p className="text-gray-500 mb-6">
                              Let our AI create a concise summary of this event's description.
                            </p>
                          </div>
                          <Button 
                            onClick={() => fetchAISummary(event.longDescription)}
                            disabled={isFetchingSummary}
                            className="flex items-center gap-2"
                          >
                            {isFetchingSummary ? (
                              "Generating Summary..."
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                Generate Summary
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {aiSummary && (
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => fetchAISummary(event.longDescription)}
                        disabled={isFetchingSummary}
                        size="sm"
                      >
                        {isFetchingSummary ? "Regenerating..." : "Regenerate Summary"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Successfully Registered!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-gray-70 mb-4">
              Check your profile and the event chatroom for more details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it, thanks!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const EventDetailsPage = () => {
  return(
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    }>
      <EventDetailsContent />
    </Suspense>
  );
};

export default EventDetailsPage;