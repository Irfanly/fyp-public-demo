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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCharts from './EventCharts';
import TaskChart from './TaskChart';
import parser from 'html-react-parser';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalyticsPage = () => {

    const [event, setEvent] = useState<events | null>(null);
    const [registrationList, setRegistrationList] = useState<userDetailsList[]>([]);
    const [attendanceList, setAttendanceList] = useState<userDetailsList[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const { eventID } = useParams();
    const contentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        //Only start fetching after user has intialized
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if(user) {
                //Fetch data
                fetchEventData();
            } else {
                console.log("No user found");
            }
        });

        const fetchEventData = async () => {
            setIsLoading(true);
            const eventData = await firestore.getEventByID(eventID);
            setEvent(eventData as events);
            console.log(eventData);
            setIsLoading(false);
        }

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
        
        return () => unsubscribe();
    }, [eventID]);

    const exportToPDF = async () => {
        if (contentRef.current) {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Prevents issues with external images
                logging: false, // Reduce console noise
                backgroundColor: '#ffffff' // Ensure white background
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            //strip HTML tags from the title
            const eventTitle = event?.title.replace(/<[^>]+>/g, '').trim() || 'analytics';
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${eventTitle || 'analytics'}_report.pdf`);
        }
    };
    
    if (isLoading){
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 font-medium">Loading event data...</p>
                </div>
            </div>
        );
    }

    if (!event){
        return <div className="min-h-screen flex justify-center items-center">Event not found.</div>
    }

    return (
        <div className="flex-1 min-w-screen border-l border-gray-200">
            {/* Page Header */}
            <div className='p-6 bg-white border-b border-gray-200'>
                <div className='max-w-7xl mx-auto'>
                    <h1 className='text-2xl font-bold text-gray-900'>{parser(event.title)}</h1>
                    <p className='text-gray-500 mt-1'>View and analyze your event data</p>
                </div>
                <div className="max-w-7xl mx-auto flex gap-4 mt-4">
                    <Button variant="outline" className="flex items-center gap-2" onClick={exportToPDF}>
                        <Download className="w-4 h-4" />
                        Export Data
                    </Button>
                </div>
            </div>
            <div className="flex-1 bg-gray-50" ref={contentRef}>
                <main className="max-w-7xl mx-auto px-6 py-10">
                    {/* Charts */}
                     <Tabs defaultValue="event">
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="event">Event Charts</TabsTrigger>
                            <TabsTrigger value="management">Task Charts</TabsTrigger>
                        </TabsList>
                        <TabsContent value="event" className="mt-6">
                            <div className="grid w-full">
                                <EventCharts eventID={eventID as string}  />
                            </div>
                        </TabsContent>
                        <TabsContent value="management" className="mt-6">
                            <div className="grid w-full">
                                <TaskChart eventID={eventID as string} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
    
}

export default AnalyticsPage;