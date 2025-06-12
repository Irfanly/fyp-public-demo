import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Building2,
  Tag,
  Bookmark,
  Circle,
  QrCode,
  Wallet,
  Mail,
  UserCheck,
  UserPlus,
  ImagePlus,
  Image as ImageIcon,
} from "lucide-react";

const EventPlanningPage = () => {
  const eventDetails = {
    title: "Community Clean-Up",
    description: "Join us in cleaning the nearby community areas.",
    eventDate: "12/02/2024",
    eventTime: "07:30 AM - 10:30 AM",
    eventType: "Volunteering",
    category: "Community",
    location: "Off-Campus Area, USM",
    organization: "Volunteer Club",
    maxParticipants: 80,
    status: "Ongoing",
    attendanceCode: "CLEAN2024",
    budget: 1500,
    posterUrl: "https://scontent-kul2-2.xx.fbcdn.net/v/t39.30808-6/469965545_1098341592302347_582099157100183047_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=XTuHOGoTFTYQ7kNvgHLtds_&_nc_zt=23&_nc_ht=scontent-kul2-2.xx&_nc_gid=ArXDSWXDZ0n4fmilDci2rmF&oh=00_AYBb0lL8Th8-By1xi8Q7ivKAxRYS4-G_bBjnvcwxAqRNKQ&oe=676E9B1F" // Updated to square format
  };

  const registrationList = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];

  const attendanceList = [
    { id: 1, name: "Alice", email: "alice@example.com" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="p-6 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-500 mt-1">Manage your event details and participants</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="shadow-sm">
                <Circle className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button className="shadow-sm">
                <UserCheck className="mr-2 h-4 w-4" />
                Publish Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs defaultValue="details" className="h-full">
            <div className="sticky top-0 bg-gray-50 pt-6 pb-2 z-10">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="registration">Registration List</TabsTrigger>
                <TabsTrigger value="attendance">Attendance List</TabsTrigger>
              </TabsList>
            </div>

            <div className="h-[calc(100vh-220px)] overflow-y-auto pb-6">
              <TabsContent value="details" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Event Info Card */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Event Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Event Title and Description */}
                      <div className="space-y-4">
                        <Input
                          type="text"
                          value={eventDetails.title}
                          className="text-2xl font-bold"
                          placeholder="Event Title"
                        />
                        <Textarea
                          value={eventDetails.description}
                          className="h-24 resize-none"
                          placeholder="Event Description"
                        />
                      </div>

                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { icon: Calendar, label: "Date", value: eventDetails.eventDate, type: "text" },
                          { icon: Clock, label: "Time", value: eventDetails.eventTime, type: "text" },
                          { icon: Tag, label: "Event Type", value: eventDetails.eventType, type: "text" },
                          { icon: Bookmark, label: "Category", value: eventDetails.category, type: "text" },
                          { icon: MapPin, label: "Location", value: eventDetails.location, type: "text" }
                        ].map((field, index) => (
                          <div key={index} className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <field.icon className="h-4 w-4" /> {field.label}
                            </label>
                            <Input type={field.type || "text"} value={field.value} className="bg-white" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Event Poster Card */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Event Poster
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed rounded-lg overflow-hidden">
                        {eventDetails.posterUrl ? (
                          <div className="relative group aspect-square">
                            <img 
                              src={eventDetails.posterUrl} 
                              alt="Event poster" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="sm" className="gap-2">
                                <ImagePlus className="h-4 w-4" />
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square flex flex-col items-center justify-center bg-gray-50">
                            <ImagePlus className="h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Click to upload event poster</p>
                            <p className="text-xs text-gray-400">Recommended size: 600x600px</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Details Card */}
                  <Card className="shadow-sm md:col-span-2">
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          { icon: Building2, label: "Organization", value: eventDetails.organization },
                          { icon: Users, label: "Max Participants", value: eventDetails.maxParticipants, type: "number" },
                          { icon: QrCode, label: "Attendance Code", value: eventDetails.attendanceCode },
                          { icon: Wallet, label: "Budget", value: eventDetails.budget, type: "number" }
                        ].map((field, index) => (
                          <div key={index} className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <field.icon className="h-4 w-4" /> {field.label}
                            </label>
                            <Input type={field.type || "text"} value={field.value} className="bg-white" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="registration">
                <Card className="mt-6 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Registration List</CardTitle>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {registrationList.length} Registered
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {registrationList.map((person) => (
                        <Card key={person.id} className="hover:bg-gray-50 transition-colors">
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{person.name}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {person.email}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card className="mt-6 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Attendance List</CardTitle>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {attendanceList.length} Attended
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attendanceList.map((person) => (
                        <Card key={person.id} className="hover:bg-gray-50 transition-colors">
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{person.name}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {person.email}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};