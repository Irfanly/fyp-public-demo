"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { events, students } from "@/lib/type/index";
import firestore from "@/services/firestore";
import helper from '@/lib/helper/function';
import { auth } from "@/conf/firebase";
import { Calendar, Clock, ChevronLeft, ChevronRight, Edit2, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import parser from 'html-react-parser';

const RegisteredList = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [registeredList, setRegisteredList] = useState<events[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState<events[]>([]);

    const router = useRouter();

    // Fetch registered events
    const fetchRegistered = async () => {
        const studentData = await firestore.readStudentDatabase() as students;
        const eventIDs = studentData.registeredEvents;

        const eventsData = [];
        for (let i = 0; i < eventIDs.length; i++) {
            const event = await firestore.getEventByID(eventIDs[i]) as events;
            eventsData.push(event);
        }

        setRegisteredList(eventsData);
        
        // If today has any events, select today by default
        const today = new Date();
        const todayFormatted = today.toDateString();
        const eventsToday = eventsData.filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate.toDateString() === todayFormatted;
        });
        
        if (eventsToday.length > 0) {
        setSelectedDate(today);
        setEventsOnSelectedDate(eventsToday);
        }
    };

    useEffect(() => {
        // Only run after user object fully loaded
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            fetchRegistered();
        } else {
            console.log("User not logged in");
            router.push('/login'); // Redirect to login if not authenticated
        }
        setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    // Update events when a date is selected
    useEffect(() => {
        if (selectedDate) {
            const selectedDateStr = selectedDate.toDateString();
            const filteredEvents = registeredList.filter(event => {
                const eventDate = new Date(event.eventDate);
                return eventDate.toDateString() === selectedDateStr;
            });
            setEventsOnSelectedDate(filteredEvents);
            } else {
            setEventsOnSelectedDate([]);
        }
    }, [selectedDate, registeredList]);

    // Calendar navigation functions
    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Helper functions for calendar rendering
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Function to check if a date has events
    const hasEvents = (date: Date) => {
        const dateString = date.toDateString();
        return registeredList.some(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate.toDateString() === dateString;
        });
    };

    // Render an event card
    const renderEventCard = (event: events) => (
        <div
            key={event.eventID}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3"
        >
            <div className="space-y-2">
                <h3 className="font-semibold">
                    {parser(event.title)}
                </h3>
                <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {helper.formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {helper.formatTime(event.eventTime)}
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.eventLocation}
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/student/details/${event.eventID}`)}
                >
                    View Details
                </Button>
            </div>
        </div>
    );

    // Render calendar
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        
        const days = [];
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="p-2 h-12"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const dateHasEvents = hasEvents(date);
            
            days.push(
                <div 
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 h-12 flex items-center justify-center cursor-pointer relative rounded-md
                        ${isToday ? 'border border-blue-400' : ''}
                        ${isSelected ? 'bg-blue-100' : ''}
                        ${dateHasEvents ? 'font-bold' : ''}
                    `}
                >
                    {day}
                    {dateHasEvents && 
                        <div className="absolute bottom-1 w-2 h-2 bg-blue-500 rounded-full">
                        </div>}
                </div>
            );
        }

        return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{monthNames[month]} {year}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            const today = new Date();
                            setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                        }}
                    >
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-500">
                    {day}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
        );
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Registered Events</h1>
            
            {renderCalendar()}
            
            <Card>
                <CardContent className="p-4">
                {selectedDate ? (
                    <div>
                    <h2 className="text-lg font-semibold mb-4">
                        Events on {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                        })}
                    </h2>
                    
                    {eventsOnSelectedDate.length > 0 ? (
                        <div className="space-y-2">
                            {eventsOnSelectedDate.map(event => renderEventCard(event))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No events scheduled for this date.</p>
                    )}
                    </div>
                ) : (
                    <p className="text-gray-500">Select a date to view events.</p>
                )}
                </CardContent>
            </Card>
            
            {registeredList.length === 0 && (
                <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No Registered Events</h3>
                    <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                    <Button onClick={() => router.push('/student')}>
                        Browse Events
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RegisteredList;