"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Download, Info } from "lucide-react";
import { events, students } from "@/lib/type";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import firestore from "@/services/firestore";
import { auth } from "@/conf/firebase";
import parser from "html-react-parser";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Define MyCSD Core colors for consistency
const CORE_COLORS: Record<string, string> = {
  "Reka Cipta & Inovasi": "#2563EB", // darker blue
  "Khidmat Masyrakat": "#059669", // darker green
  "Pengucapan Awam": "#D97706", // darker amber
  "Kesukarelawanan": "#DC2626", // slightly darker red
  "Keusahawanan": "#7C3AED", // slightly darker purple
  "Kepimpinan": "#DB2777", // slightly darker pink
  "Kebudayaan": "#0891B2", // darker cyan
  "Sukan": "#EA580C", // darker orange
  "default": "#4B5563", // darker gray
};

// Helper to get color for a category
const getCoreColor = (category: string) => {
  return CORE_COLORS[category] || CORE_COLORS.default;
};

const MyCSDList = () => {
  const [attendedEvents, setAttendedEvents] = useState<events[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [chartData, setChartData] = useState<{name: string, value: number, color: string}[]>([]);
  const { toast } = useToast();

  const fetchAttendedEventsDetails = async () => {
    try {
      setIsLoading(true);
      const studentResult = await firestore.readStudentDatabase() as students;
      const attendedEventIDs = studentResult.attendedEvents || [];

      if (attendedEventIDs.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch event details for each attended event ID
      const eventPromises = attendedEventIDs.map(async (eventID) => {
        const eventDetails = await firestore.getEventByID(eventID);
        return eventDetails;
      });

      const events = (await Promise.all(eventPromises)).filter((event): event is events => event !== undefined);
      setAttendedEvents(events);

      // Calculate total points and prepare chart data
      let points = 0;
      const categoryPoints: Record<string, number> = {};

      events.forEach(event => {
        const eventPoints = event.MyCSDPoints || 0;
        points += eventPoints;
        
        // Add to category totals
        const category = event.category || "Other";
        categoryPoints[category] = (categoryPoints[category] || 0) + eventPoints;
      });

      setTotalPoints(points);
      
      // Convert category points to chart data
      const chartData = Object.entries(categoryPoints).map(([name, value]) => ({
        name,
        value,
        color: getCoreColor(name)
      }));
      
      setChartData(chartData);
    } catch (error) {
      console.error("Error fetching attended events:", error);
      toast({
        variant: "destructive",
        title: "Error loading MyCSD data",
        description: "There was a problem loading your events. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    // Generate CSV header row
    const headers = ["Event Title", "Category", "Event Level", "MyCSD Points"];
    
    // Convert event data to CSV rows
    const eventData = attendedEvents.map(event => [
      event.title.replace(/<[^>]*>/g, ''), // Remove HTML tags
      event.category,
      event.eventLevel,
      event.MyCSDPoints || 0
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...eventData.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'mycsd_events.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Your MyCSD events have been exported to CSV."
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        fetchAttendedEventsDetails();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] col-span-1" />
          <Skeleton className="h-[300px] col-span-1 lg:col-span-2" />
        </div>
        <Skeleton className="h-64 mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">MyCSD Portfolio</h1>
        <p className="text-muted-foreground">
          Track your progress across different MyCSD cores and manage your attended events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              MyCSD Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Points</span>
                  <span className="text-2xl font-bold">{totalPoints}</span>
                </div>
                <Progress value={Math.min((totalPoints / 100) * 100, 100)} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Events Attended</span>
                <p className="text-2xl font-bold">{attendedEvents.length}</p>
              </div>

              {/* Quick stat badges */}
              <div className="pt-4">
                <span className="text-sm font-medium mb-2 block">Core Distribution</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {chartData.map((item, index) => (
                    <Badge key={index} style={{backgroundColor: item.color}} variant="secondary" className="text-white">
                      {item.name}: {item.value} pts
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>MyCSD Core Distribution</CardTitle>
            <CardDescription>
              Breakdown of your MyCSD points by core category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} points`, 'Points']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    iconType="circle"
                    wrapperStyle={{ paddingLeft: '20px' }}
                    payload={
                      chartData.map(item => ({
                        value: `${item.name} (${item.value} pts)`,
                        type: 'circle',
                        color: item.color,
                        id: item.name
                      }))
                    }
                  />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No events attended yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Attended Events
            </CardTitle>
            <CardDescription>
              List of events you've attended and points earned
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={attendedEvents.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {attendedEvents.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3">Event Title</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Event Level</th>
                    <th scope="col" className="px-4 py-3 text-right">MyCSD Points</th>
                  </tr>
                </thead>
                <tbody>
                  {attendedEvents.map((event) => (
                    <tr key={event.eventID} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        {parser(event.title)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge style={{ backgroundColor: getCoreColor(event.category) }} variant="secondary" className="text-white">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{event.eventLevel}</td>
                      <td className="px-4 py-3 text-right font-bold">{event.MyCSDPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right">Total Points:</td>
                    <td className="px-4 py-3 text-right">{totalPoints}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No events attended yet</h3>
              <p className="text-muted-foreground">
                Your attended events will appear here once you start participating.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCSDList;