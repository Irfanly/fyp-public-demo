"use client";

import React, { useState, useEffect } from 'react';
import { userDetailsList, registeredLog } from '@/lib/type/index';
import { auth } from '@/conf/firebase';
import firestore from '@/services/firestore';
import { generateAnalyticsReport } from '@/services/google/gemini';
import { 
    ChartBar, 
    ChartPie, 
    UserCheck, 
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


const EventCharts = ({eventID} : {eventID: string}) => {
    const [registrationList, setRegistrationList] = useState<userDetailsList[]>([]);
    const [attendanceList, setAttendanceList] = useState<userDetailsList[]>([]);
    const [registrationLog, setRegistrationLog] = useState<registeredLog[]>([]);
    const [analyticsReport, setAnalyticsReport] = useState<string>('');
    const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //For alll the charts
    const registrationVsAttendanceData = [
        {   
            icon: <UserCheck size={16} className="mr-1"/>,
            name: "Registered",
            value: registrationList.length,
        },
        {   
            icon: <UserCheck size={16} className="mr-1"/>,
            name: "Attended",
            value: attendanceList.length,
        },
    ];

    const processedRegistrationLog = registrationLog.reduce((acc: { [key: string]: number }, curr) => {
        const date = curr.registeredOn.toDate().toISOString().split('T')[0]; // Get YYYY-MM-DD format
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    
    const participantsByYear = registrationList.reduce((acc: { [key: string]: number }, curr) => {
        if (curr.year) {
            acc[curr.year] = (acc[curr.year] || 0) + 1;
        }
        return acc;
    }, {});

    const participantsByProgramme = registrationList.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.programme] = (acc[curr.programme] || 0) + 1;
        return acc;
    }, {});

    const pieChartDataByYear = Object.keys(participantsByYear).map((year) => ({
        name: year,
        value: participantsByYear[year],
    }));

    const pieChartDataByProgramme = Object.keys(participantsByProgramme).map((programme) => ({
        name: programme,
        value: participantsByProgramme[programme],
    }));

    const lineChartRegistrationOverTime = Object.keys(processedRegistrationLog)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Ensure chronological order
    .map((date) => ({
        name: date, // Show exact date instead of month
        value: processedRegistrationLog[date],
    }));

    const attendaceRate = (attendanceList.length / registrationList.length) * 100;

    const generateAnalysis = async () => {
        setIsLoadingReport(true);
        const data = {
            totalRegistrations: registrationList.length,
            totalAttendance: attendanceList.length,
            attendanceRate: attendaceRate,
            registrationsOverTime: lineChartRegistrationOverTime,
            participantsByYear: participantsByYear,
            participantsByProgramme: participantsByProgramme
        };
        const result = await generateAnalyticsReport(data);
        setAnalyticsReport(result);
        setIsLoadingReport(false);
        console.log(result);
    };

    useEffect(() => {
        //Only start fetching after user has intialized
        setIsLoading(true);
        
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user) {
                //Fetch data
                fetchParticipantsList();
                fetchAttendanceList();
                fetchRegistrationLog();
            } else {
                console.log("No user found");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchParticipantsList = async () => {
        try {
            const participantsData = await firestore.getParticipantsList(eventID);
            setRegistrationList(participantsData);
        } catch (error) {
            console.error("Error fetching participants list:", error);
            setRegistrationList([]);
        }
    };
  
    const fetchAttendanceList = async () => {
        try {
            const attendanceData = await firestore.getAttendanceList(eventID);
            setAttendanceList(attendanceData);
        } catch (error) {
            console.error("Error fetching attendance list:", error);
            setAttendanceList([]);
        }
    };

    const fetchRegistrationLog = async () => {
        try {
            const registrationLog = await firestore.getRegistrationLog(eventID) as registeredLog[];
            setRegistrationLog(registrationLog);
        } catch (error) {
            console.error("Error fetching registration log:", error);
            setRegistrationLog([]);
        }
    }

    const COLORS = [
        '#3b82f6',  // Blue
        '#10b981',  // Green
        '#f43f5e',  // Rose
        '#8b5cf6',  // Purple
        '#f97316'   // Orange
    ];

    // Enhanced Chart Configurations
    const chartConfig = {
        registrationVsAttendance: {
            gradient: {
                start: 'from-blue-500',
                end: 'to-blue-700'
            }
        },
        registrationOverTime: {
            gradient: {
                start: 'from-green-500',
                end: 'to-green-700'
            }
        }
    };

    // Render loading state
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

    // Render no data state
    if (!registrationList.length && !attendanceList.length && !registrationLog.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">No Data Available</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    Participant data will appear here once registrations and attendance are recorded.
                </p>
                <Button variant="outline" className="mt-4">
                    Refresh Data
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 bg-gray-50">
            {/* Participation Summary Card */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-gray-800">
                        <ChartBar className="mr-3 h-6 w-6 text-blue-600" />
                        Event Participation Overview
                    </CardTitle>
                    <CardDescription>
                        Comprehensive insights into event participation metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { 
                                icon: <Users className="mr-2 h-5 w-5 text-blue-500" />, 
                                label: "Registered", 
                                value: registrationList.length 
                            },
                            { 
                                icon: <UserCheck className="mr-2 h-5 w-5 text-green-500" />, 
                                label: "Attended", 
                                value: attendanceList.length 
                            },
                            { 
                                icon: <TrendingUp className="mr-2 h-5 w-5 text-indigo-500" />, 
                                label: "Participation Rate", 
                                value: `${(attendaceRate.toFixed(2))}%` 
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
                {/* Registration vs Attendance Bar Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-gray-800">
                            <ChartBar className="mr-2 h-5 w-5 text-blue-600" />
                            Registration vs Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={registrationVsAttendanceData}>
                                <defs>
                                    <linearGradient id="registrationVsAttendanceGradient" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#registrationVsAttendanceGradient)" 
                                    className="hover:opacity-80 transition-opacity"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Registration Over Time Line Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-gray-800">
                            <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                            Registration Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartRegistrationOverTime}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                                <XAxis dataKey="name" className="text-sm" />
                                <YAxis className="text-sm" />
                                <Tooltip 
                                    cursor={{stroke: '#10b981', strokeWidth: 2}} 
                                    contentStyle={{
                                        backgroundColor: 'white', 
                                        borderRadius: '8px', 
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2}}
                                    activeDot={{r: 8, fill: '#10b981', stroke: 'white', strokeWidth: 2}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Participants by Year Pie Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-gray-800">
                            <ChartPie className="mr-2 h-5 w-5 text-purple-600" />
                            Participants by Year
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartDataByYear}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({ name, percent }) => (
                                        <text style={{ fontSize: '0.75rem', fill: 'gray' }}>
                                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                                        </text>
                                    )}
                                >
                                    {pieChartDataByYear.map((entry, index) => (
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

                {/* Participants by Programme Pie Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-gray-800">
                            <ChartPie className="mr-2 h-5 w-5 text-pink-600" />
                            Participants by Programme
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartDataByProgramme}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({ name, percent }) => (
                                        <text style={{ fontSize: '0.75rem', fill: 'gray' }}>
                                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                                        </text>
                                    )}
                                >
                                    {pieChartDataByProgramme.map((entry, index) => (
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

                {/* Analytics Report Card */}
                <Card className="col-span-1 md:col-span-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="flex items-center text-lg text-gray-800">
                                <ChartBar className="mr-2 h-5 w-5 text-blue-600" />
                                Analytics Report
                            </CardTitle>
                            <CardDescription>
                                AI-generated insights based on your event data
                            </CardDescription>
                        </div>
                        <Button 
                            onClick={generateAnalysis} 
                            disabled={isLoadingReport}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        >
                            {isLoadingReport ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>Generate Report</>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingReport ? (
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="pt-2">
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
                                <div className="prose max-w-none space-y-4">
                                    <div className="whitespace-pre-line text-gray-700">
                                        {analyticsReport.split('\n\n').map((paragraph, idx) => (
                                            <p key={idx}>{paragraph}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default EventCharts;
