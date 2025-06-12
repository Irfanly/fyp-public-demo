"use client";

import React, { useState, useEffect } from 'react';
import { tasks, userDetailsList } from '@/lib/type/index';
import firestore from '@/services/firestore';
import { auth } from '@/conf/firebase';
import { 
    ChartBar, 
    ChartPie, 
    Users, 
    TrendingUp, 
    AlertTriangle 
} from 'lucide-react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
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
    Cell, 
    Legend 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Tooltip as ShadcnTooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from "@/components/ui/tooltip";

const TaskChart = ({eventID} : {eventID: string}) => {
    const [taskData, setTaskData] = useState<tasks[]>([]);
    const [teamMembers, setTeamMembers] = useState<userDetailsList[]>([]);
    const [taskCompletionRate, setTaskCompletionRate] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Stylish color palette
    const COLORS = [
        '#3b82f6',  // Blue
        '#10b981',  // Green
        '#f43f5e',  // Rose
        '#8b5cf6',  // Purple
        '#f97316'   // Orange
    ];

    const completedTasks = taskData.filter(task => task.status === "completed").length;
    const incompleteTasks = taskData.length - completedTasks;    

    const taskCompletionData = [
        { name: 'Completed', value: completedTasks },
        { name: 'Incomplete', value: incompleteTasks }
    ];

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user) {
                fetchTaskData();
                fetchTeamMembers();
                setTaskCompletionRate((completedTasks / taskData.length) * 100);
            } else {
                console.log("No user found");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchTaskData = async () => {
        const data = await firestore.getTasks(eventID) as tasks[];
        setTaskData(data);
    }

    const fetchTeamMembers = async () => {
        const data = await firestore.getTeamMembers(eventID);
        setTeamMembers(data);
    }

    // Loading State
    if (isLoading){
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // No Data State
    if (!taskData.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">No Tasks Available</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    No tasks have been created for this event yet.
                </p>
                <Button variant="outline" className="mt-4">
                    Create Task
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 bg-gray-50">
            {/* Task Summary Card */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-gray-800">
                        <ChartBar className="mr-3 h-6 w-6 text-blue-600" />
                        Task Management Overview
                    </CardTitle>
                    <CardDescription>
                        Comprehensive insights into task performance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { 
                                icon: <Users className="mr-2 h-5 w-5 text-blue-500" />, 
                                label: "Team Members", 
                                value: teamMembers.length 
                            },
                            { 
                                icon: <TrendingUp className="mr-2 h-5 w-5 text-green-500" />, 
                                label: "Total Tasks", 
                                value: taskData.length 
                            },
                            { 
                                icon: <ChartBar className="mr-2 h-5 w-5 text-indigo-500" />, 
                                label: "Completion Rate", 
                                value: `${taskCompletionRate.toFixed(2)}%` 
                            }
                        ].map((item, index) => (
                            <TooltipProvider key={index}>
                                <ShadcnTooltip>
                                    <TooltipTrigger>
                                        <div className="w-full bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {item.icon}
                                                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                                </div>
                                                <Badge variant="secondary" className="text-base font-bold">
                                                    {item.value}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {item.label} breakdown for the event
                                    </TooltipContent>
                                </ShadcnTooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Completion Bar Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-gray-800">
                            <ChartBar className="mr-2 h-5 w-5 text-blue-600" />
                            Task Completion Status
                        </CardTitle>
                        <CardDescription>
                            Breakdown of completed and incomplete tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={taskCompletionData}>
                                <defs>
                                    <linearGradient id="taskCompletionGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                <XAxis dataKey="name" className="text-sm" />
                                <YAxis className="text-sm" />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{
                                        backgroundColor: 'white', 
                                        borderRadius: '8px', 
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }} 
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="url(#taskCompletionGradient)" 
                                    className="hover:opacity-80 transition-opacity"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Task Completion Pie Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-gray-800">
                            <ChartPie className="mr-2 h-5 w-5 text-purple-600" />
                            Task Completion Distribution
                        </CardTitle>
                        <CardDescription>
                            Proportion of completed and incomplete tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={taskCompletionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent, value }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {taskCompletionData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white', 
                                        borderRadius: '8px', 
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }} 
                                />
                                <Legend 
                                    layout="horizontal" 
                                    verticalAlign="bottom" 
                                    align="center"
                                    wrapperStyle={{fontSize: '0.75rem'}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default TaskChart;