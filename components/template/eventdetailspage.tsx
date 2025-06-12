//TEMPLATE USAGE ONLY
//DO NOT USE IN PRODUCTION

'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Tag, Building2, QrCode, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import firestore from "@/services/firestore";
import firestorage from "@/services/firestorage";
import { events } from "@/lib/type";
import { Separator } from "@/components/ui/separator";

const EventPlanningPage = () => {
  const [eventDetails, setEventDetails] = useState<events | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      await firestore.updateEvent(eventID, formData);
      alert("Event updated successfully!");
      router.push(`/events/${eventID}`);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleUpdatePoster = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        if (eventDetails?.poster) {
          try {
            await firestorage.deleteEventPicture(eventDetails.poster);
          } catch (error) {
            console.error("Error deleting event poster:", error);
          }
        }
        const posterUrl = await firestorage.uploadEventPicture(file, eventID);
        await firestore.updateEvent(eventID, { poster: posterUrl });
        setFormData((prev) => ({ ...prev, poster: posterUrl }));
      } catch (error) {
        console.error("Error updating event poster:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!eventDetails) {
    return <div className="min-h-screen flex justify-center items-center">Event not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-500 mt-1">Update the details of your event.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-1 w-full">
            <TabsTrigger value="details">Event Details</TabsTrigger>
          </TabsList>

          {/* Event Details Tab */}
          <TabsContent value="details" className="mt-6">
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
                    <Input id="poster-upload" type="file" accept="image/*" className="hidden" onChange={handleUpdatePoster} />
                    <Label htmlFor="poster-upload" className="mt-4 p-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 flex justify-center">
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
                        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                      </div>

                      <div>
                        <Label htmlFor="longDescription">Detailed Description</Label>
                        <Textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="eventDate">Date</Label>
                          <Input id="eventDate" type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
                        </div>
                        <div>
                          <Label htmlFor="eventTime">Time</Label>
                          <Input id="eventTime" type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} required />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input id="eventLocation" name="eventLocation" value={formData.eventLocation} onChange={handleChange} required />
                      </div>

                      <div>
                        <Label htmlFor="attendancePassword">Attendance Code</Label>
                        <Input id="attendancePassword" name="attendancePassword" value={formData.attendancePassword} onChange={handleChange} />
                      </div>

                      <Button type="submit" className="w-full">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventPlanningPage;