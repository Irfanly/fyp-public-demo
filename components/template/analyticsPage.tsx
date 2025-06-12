"use client";

import React from 'react';
import { useState } from "react";
import SideBar from "@/components/sideBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("last30");

  // Sample data - replace with actual data from your backend
  const attendanceData = [
    { month: 'Jan', attendees: 120 },
    { month: 'Feb', attendees: 150 },
    { month: 'Mar', attendees: 180 },
    { month: 'Apr', attendees: 170 },
    { month: 'May', attendees: 200 },
    { month: 'Jun', attendees: 220 }
  ];

  const eventTypeData = [
    { name: 'Workshop', value: 35 },
    { name: 'Seminar', value: 25 },
    { name: 'Social', value: 20 },
    { name: 'Career Fair', value: 15 },
    { name: 'Other', value: 5 }
  ];

  const categoryEngagementData = [
    { category: 'Technology', attendance: 450 },
    { category: 'Business', attendance: 380 },
    { category: 'Arts', attendance: 300 },
    { category: 'Science', attendance: 280 },
    { category: 'Sports', attendance: 220 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 min-w-0 border-l border-gray-200">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-gray-500">Track your organization's performance and engagement</p>
              </div>
              <div className="flex gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7">Last 7 days</SelectItem>
                    <SelectItem value="last30">Last 30 days</SelectItem>
                    <SelectItem value="last90">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-auto h-[calc(100vh-73px)]">
          <main className="max-w-7xl mx-auto px-6 py-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold mt-1">48</p>
                      <div className="flex items-center mt-1 text-green-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>12% vs last period</span>
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Total Attendees</p>
                      <p className="text-2xl font-bold mt-1">1,240</p>
                      <div className="flex items-center mt-1 text-green-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>8% vs last period</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Attendance</p>
                      <p className="text-2xl font-bold mt-1">26</p>
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                        <span>3% vs last period</span>
                      </div>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold mt-1">85%</p>
                      <div className="flex items-center mt-1 text-green-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span>5% vs last period</span>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                  <CardDescription>Monthly attendance across all events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="attendees" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Event Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Type Distribution</CardTitle>
                  <CardDescription>Breakdown of events by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={eventTypeData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {eventTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {eventTypeData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-600">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Engagement */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Category Engagement</CardTitle>
                  <CardDescription>Total attendance by event category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="attendance" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;