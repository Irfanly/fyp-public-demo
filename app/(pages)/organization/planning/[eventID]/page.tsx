'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, PlusCircle } from "lucide-react";
import firestore from "@/services/firestore";
import firestorage from "@/services/firestorage";
import { events, EVENT_CATEGORIES, EVENT_TYPES, MYCSD_CORES, EVENT_LEVELS } from "@/lib/type";
import TeamMembers from "./TeamMembers";
import TaskDashboard from "./TaskDashboard";
import RichTextEditor from "@/components/richTextEditor";
import { toast } from "@/hooks/use-toast";
import ChangeStatusModal from "./changeStageModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import parser from "html-react-parser";

const EventPlanningPage = () => {
  const [eventDetails, setEventDetails] = useState<events | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [changeStatusModal, setChangeStatusModal] = useState(false);
  const [formData, setFormData] = useState<Partial<events>>({});
  const { eventID } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await firestore.getEventByID(eventID);
        setEventDetails(eventData as events);
        setFormData(eventData as events);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventID]);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await firestore.updateEvent(eventID, formData);
      toast({
        title: "Event Updated",
        description: "The event details have been updated successfully.",
        variant: "default",
      });
      setEventDetails(formData as events); // Update eventDetails state after successful update
      router.refresh();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleUpdatePoster = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const posterUrl = await firestorage.uploadEventPicture(file, eventID);
        setFormData((prev) => ({ ...prev, poster: posterUrl }));
        toast({
          title: "Event Poster Updated",
          description: "The event poster has been updated successfully.",
          variant: "default",
        });
        router.refresh();
      } catch (error) {
        console.error("Error updating event poster:", error);
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setEventDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
    console.log(eventDetails);
  };

  if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="space-y-6 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 text-lg font-medium">Loading Event Details...</p>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-6 w-64 mx-auto" />
                        <Skeleton className="h-6 w-40 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

  if (!eventDetails) {
    return <div className="min-h-screen flex justify-center items-center">Event not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <div className="flex max-w-7xl mx-auto justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Planning</h1>
            <p className="text-gray-500 mt-1">Edit and Plan Your Events</p>
            <p className="text-gray-500 mt-1">
              Current Status: <strong>{eventDetails.status}</strong>
            </p>
          </div>
          <Button onClick={() => setChangeStatusModal(true)} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Change Event Status
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="min-w-[1000px] max-w-full overflow-x-auto">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
              <TabsTrigger value="task">Tasks</TabsTrigger>
            </TabsList>

            {/* Event Details Tab */}
            <div className="min-h-[600px] w-full">
              <TabsContent value="details" className="mt-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Poster Section */}
                  <div className="lg:col-span-1">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Event Poster</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center">
                          {formData.poster ? (
                            <img
                              src={formData.poster}
                              alt="Event Poster"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <ImageIcon className="w-12 h-12 text-gray-500" />
                              <p className="text-gray-500">No poster uploaded</p>
                            </div>
                          )}
                        </div>
                        <Input
                          id="poster-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUpdatePoster}
                        />
                        <Label
                          htmlFor="poster-upload"
                          className="mt-4 p-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 flex justify-center"
                        >
                          Change Poster
                        </Label>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Event Details Section */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Overview</CardTitle>
                        <CardDescription>Edit the detailed information about the event.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div>
                            <Label htmlFor="title">Event Title</Label>
                            <RichTextEditor
                              content={formData.title || ""}
                              onChange={(value) => handleChange("title", value)}
                              variant="single-line"
                              placeholder="Event Title"
                            />
                          </div>

                          <div>
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <RichTextEditor
                              content={formData.shortDescription || ""}
                              onChange={(value) => handleChange("shortDescription", value)}
                              variant="single-line"
                              placeholder="Short Description"
                            />
                          </div>

                          <div>
                            <Label htmlFor="longDescription">Detailed Description</Label>
                            <RichTextEditor
                              content={formData.longDescription || ""}
                              onChange={(value) => handleChange("longDescription", value)}
                              variant="multi-line"
                              placeholder="Detailed Description"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="eventDate">Date</Label>
                              <Input
                                id="eventDate"
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={(e) => handleChange("eventDate", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="eventTime">Time</Label>
                              <Input
                                id="eventTime"
                                type="time"
                                name="eventTime"
                                value={formData.eventTime}
                                onChange={(e) => handleChange("eventTime", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="eventType">Event Type</Label>
                              <Select
                                name="eventType"
                                value={formData.eventType}
                                onValueChange={(value) => handleSelectChange("eventType", value)}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an event type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EVENT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="eventCategory">MyCSD Core</Label>
                              <Select
                                name="eventCategory"
                                value={formData.category}
                                onValueChange={(value) => handleSelectChange("category", value)}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select MyCSD Core" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MYCSD_CORES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="eventLevel">Event Level</Label>
                              <Select
                                name="eventLevel"
                                value={formData.eventLevel}
                                onValueChange={(value) => {
                                  handleSelectChange("eventLevel", value);
                                  setFormData((prev) => ({
                                    ...prev,
                                    MyCSDPoints: EVENT_LEVELS[value as keyof typeof EVENT_LEVELS], // Update MyCSDPoints
                                  }));
                                }}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an event level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(EVENT_LEVELS).map(([key]) => (
                                    <SelectItem key={key} value={key}>
                                      {key}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="MyCSDPoints">MyCSD Points</Label>
                              <Input
                                id="MyCSDPoints"
                                type="number"
                                name="MyCSDPoints"
                                value={formData.MyCSDPoints}
                                disabled
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="eventLocation">Location</Label>
                            <Input
                              id="eventLocation"
                              name="eventLocation"
                              value={formData.eventLocation}
                              onChange={(e) => handleChange("eventLocation", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="attendancePassword">Attendance Code</Label>
                            <Input
                              id="attendancePassword"
                              name="attendancePassword"
                              value={formData.attendancePassword}
                              onChange={(e) => handleChange("attendancePassword", e.target.value)}
                            />
                          </div>

                          <Button type="submit" className="w-full">
                            Save Changes
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Team Members Tab */}
              <TabsContent value="team" className="mt-6 w-full">
                <TeamMembers eventID={eventID as string} />
              </TabsContent>

              {/* Task Tab */}
              <TabsContent value="task" className="mt-6 w-full">
                <TaskDashboard eventID={eventID as string} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      {changeStatusModal && (
        <ChangeStatusModal
          eventID={eventID as string}
          currentStatus={eventDetails.status || ""}
          onClose={() => setChangeStatusModal(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default EventPlanningPage;