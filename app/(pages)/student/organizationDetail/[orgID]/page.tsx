'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Monitor, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import firestore from "@/services/firestore";
import helper from "@/lib/helper/function";
import { users, studentOrganizations, events } from "@/lib/type/index";
import { useToast } from "@/hooks/use-toast";
import parser from "html-react-parser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function OrganizationDetailsPage() {
  const { orgID } = useParams();
  const [organization, setOrganization] = useState<studentOrganizations>();
  const [hostedEvents, setHostedEvents] = useState<events[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<events[]>([]);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<users>();
  const router = useRouter();
  const { toast } = useToast();
  
  // Counts for event status tabs
  const [eventCounts, setEventCounts] = useState({
    all: 0,
    active: 0,
    ongoing: 0,
    past: 0
  });
  
  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        // Get organization details
        const org = await firestore.readStudentOrganizationDatabaseByUserID(orgID);
        setOrganization(org as studentOrganizations);
        
        // Get user data for the organization
        const user = await firestore.readUserDatabaseByUserID(orgID as string);
        setUserData(user as users);
        
        // Get hosted events
        if (org?.hostedEvents?.length) {
          const eventsData = await Promise.all(
            org.hostedEvents.map((eventId: string) => firestore.getEventByID(eventId))
          );
          
          // Filter out null/undefined events and planning events
          const validEvents = eventsData.filter(Boolean).filter(event => event.status !== "Planning");
          setHostedEvents(validEvents);
          
          // Count events by status (excluding planning events)
          const counts = {
            all: validEvents.length,
            active: validEvents.filter(e => e.status === "Active").length,
            ongoing: validEvents.filter(e => e.status === "Ongoing").length,
            past: validEvents.filter(e => e.status === "Past").length
          };
          setEventCounts(counts);
          
          // Set initial filtered events based on active tab
          const initialFiltered = validEvents.filter(event => 
            event.status === "Active"
          );
          setFilteredEvents(initialFiltered);
        }
      } catch (error) {
        console.error("Error fetching organization details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load organization details."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizationDetails();
  }, [orgID, toast]);
  
  // Apply filters when tab, type or category changes
  useEffect(() => {
    if (!hostedEvents.length) return;
    
    let filtered = [...hostedEvents];
    
    // Filter by status tab
    if (activeTab !== "all") {
      if (activeTab === "active") {
        filtered = filtered.filter(event => event.status === "Active");
      } else if (activeTab === "ongoing") {
        filtered = filtered.filter(event => event.status === "Ongoing");
      } else if (activeTab === "past") {
        filtered = filtered.filter(event => event.status === "Past");
      }
    }
    
    // Apply type filter if selected
    if (selectedType && selectedType !== "all") {
      // If "all" is selected, we don't filter by type
      filtered = filtered.filter(event => event.eventType === selectedType);
    }
    
    // Apply category filter if selected
    if (selectedCategory && selectedCategory !== "all") {
      // If "all" is selected, we don't filter by category
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    setFilteredEvents(filtered);
  }, [activeTab, selectedType, selectedCategory, hostedEvents]);
  
  const handleEventClick = (event: events) => {
    router.push(`/student/details/${event.eventID}`);
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const clearFilters = () => {
    setSelectedType("all");
    setSelectedCategory("all");
  };
  
  // Extract unique event types and categories for filters
  const eventTypes = [...new Set(hostedEvents.map(event => event.eventType))];
  const eventCategories = [...new Set(hostedEvents.map(event => event.category))];
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-start">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!organization || !userData) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Organization not found</h2>
            <p className="text-gray-500 mb-6">The organization you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Homepage
      </Button>
      
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData?.profilePicture} alt={userData.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {userData.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <CardTitle className="text-2xl font-bold">{userData.name}</CardTitle>
              <p className="text-gray-600 mt-2">{userData.email}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {organization.descriptions && (
            <>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700 mb-6">{organization.descriptions}</p>
              <Separator className="my-6" />
            </>
          )}
          
          {/* Event Tabs and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs md:text-sm">
                  All ({eventCounts.all})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs md:text-sm">
                  Active ({eventCounts.active})
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="text-xs md:text-sm">
                  Ongoing ({eventCounts.ongoing})
                </TabsTrigger>
                <TabsTrigger value="past" className="text-xs md:text-sm">
                  Past ({eventCounts.past})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {eventCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(selectedType || selectedCategory) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearFilters}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Events Display */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No events found matching your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div 
                  key={event.eventID}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{parser(event.title)}</h4>
                    <Badge className={
                      event.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                      event.status === "Ongoing" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                      "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {parser(event.shortDescription)}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {helper.formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {helper.formatTime(event.eventTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      {event.eventType === "Virtual" ? (
                        <Monitor className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      {event.eventLocation}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      event.eventType === "Virtual" 
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {event.eventType}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {event.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}