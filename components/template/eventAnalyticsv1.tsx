"use client";

import React, { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { events, userDetailsList } from '@/lib/type/index'
import { auth } from '@/conf/firebase';
import firestore from '@/services/firestore';
import { set } from 'date-fns';
import { Button } from '@/components/ui/button';
import helper from '@/lib/helper/function';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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


const EventCharts = ({eventID} : {eventID: string}) => {
    const [registrationList, setRegistrationList] = useState<userDetailsList[]>([]);
    const [attendanceList, setAttendanceList] = useState<userDetailsList[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //For alll the charts
    const registrationVsAttendanceData = [
        {
            name: "Registered",
            value: registrationList.length,
        },
        {
            name: "Attended",
            value: attendanceList.length,
        },
    ];
    
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

    useEffect(() => {
        //Only start fetching after user has intialized
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user) {
                //Fetch data
                fetchParticipantsList();
                fetchAttendanceList();
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
            console.log(attendanceData);
        } catch (error) {
            console.error("Error fetching attendance list:", error);
            setAttendanceList([]);
        }
    };
    
    if (isLoading){
        return (
            <div className="flex justify-center items-center h-96">
                <div className="flex flex-col items-center">
                    <Download size={48} className="text-gray-400" />
                    <p className="text-gray-400 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6 ">
            <Card>
                <CardHeader>
                    <CardTitle>Registration vs Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={registrationVsAttendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Participants by Year</CardTitle>
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
                                label
                            >
                                {pieChartDataByYear.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Participants by Programme</CardTitle>
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
                                label
                            >
                                {pieChartDataByProgramme.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default EventCharts;
