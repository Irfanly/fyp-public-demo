'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, Monitor, Search, Bell, User } from "lucide-react";
import { events, EVENT_CATEGORIES, EVENT_TYPES, MYCSD_CORES, EVENT_LEVELS } from "@/lib/type/index";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import firestore from "@/services/firestore";
import parser from "html-react-parser";
import helper from "@/lib/helper/function";
import SearchOrganization from "@/components/searchOrganization";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const StudentPage = () => {
  const [events, setEvents] = useState<events[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<events[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEventLevel, setSelectedEventLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  
  const handleEventClick = (eventID: string) => {
    router.push(`/student/details/${eventID}`);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        //Only display active events
        const eventsData = await firestore.getActiveEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load events. Please try again.");
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "" || selectedType === "All" || event.eventType === selectedType;

      const matchesCategory =
        selectedCategory === "" || selectedCategory === "All" || event.category === selectedCategory;

      const matchesEventLevel =
        selectedEventLevel === "" || selectedEventLevel === "All" || event.eventLevel === selectedEventLevel;

      return matchesSearch && matchesType && matchesCategory && matchesEventLevel;
    });

    setFilteredEvents(filtered);
  }, [searchTerm, selectedType, selectedCategory, selectedEventLevel, events]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          <p className="mt-2 text-gray-600">Discover and join campus activities</p>
        </div>
        <SearchOrganization />
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="MyCSD Cores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {MYCSD_CORES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedEventLevel}
                onValueChange={setSelectedEventLevel}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Event Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {Object.keys(EVENT_LEVELS).map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-xl font-semibold">Available Events</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No events found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card 
                  key={event.eventID} 
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleEventClick(event.eventID)}
                >
                  <div className="relative h-48 w-full">
                    {event.poster ? (
                      <Image 
                        src={event.poster} 
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={`${
                        event.eventType === "Online" ? "bg-blue-500" : "bg-green-500"
                      } text-white hover:bg-opacity-90`}>
                        {event.eventType}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2 text-sm text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      <span className="truncate">{event.organizer}</span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                      {parser(event.title)}
                    </h3>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      {helper.formatDate(event.eventDate)} • {helper.formatTime(event.eventTime)}
                    </div>
                    
                    <div className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {parser(event.shortDescription)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-gray-50">
                        {event.category}
                      </Badge>
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="truncate max-w-[100px]">{event.eventLocation}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPage;