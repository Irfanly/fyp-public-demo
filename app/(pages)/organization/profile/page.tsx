'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  School, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  BookOpen, 
  Building2, 
  PenSquare, 
  AlertCircle, 
  Camera, 
  GraduationCap,
  X,
  FileText,
  Info,
  Users,
  CalendarDays,
  BarChart3,
  Edit,
  Clipboard,
  ChevronRight
} from "lucide-react";
import { users, studentOrganizations, events } from "@/lib/type/index";
import firestore from "@/services/firestore";
import firestorage from "@/services/firestorage";
import SideBar from "@/components/sideBar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auth } from "@/conf/firebase";
import parser from "html-react-parser";
import helper from "@/lib/helper/function";
import { useToast } from "@/hooks/use-toast";

const OrganizationProfile = () => {
    const { toast } = useToast();
    const [userData, setUserData] = useState<users>();
    const [organizerData, setOrganizerData] = useState<studentOrganizations>();
    const [events, setEvents] = useState<events[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profileUpdated, setProfileUpdated] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        descriptions: ''
    });

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                fetchData();
            } else {
                console.log("No user is signed in");
            }
            setIsLoading(false);
        });
    
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const userResult = await firestore.readUserDatabase() as users;
                const organizerResult = await firestore.readStudentOrganizationDatabase() as studentOrganizations;
                
                // Fetch events if there are any hosted events
                let eventsList: events[] = [];
                if (organizerResult?.hostedEvents && organizerResult.hostedEvents.length > 0) {
                    eventsList = await Promise.all(
                        organizerResult.hostedEvents.map(async (eventId: string) => {
                            return await firestore.getEventByID(eventId) as events;
                        })
                    );
                }
                
                setUserData(userResult);
                setOrganizerData(organizerResult);
                setEvents(eventsList);
                
                setFormData({
                    name: userResult?.name || '',
                    email: userResult?.email || '',
                    descriptions: organizerResult?.descriptions || ''
                });
            } catch (err: any) {
                setError(err.message);
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };
    
        return () => unsubscribe();
    }, [profileUpdated]);
    
    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };

    const handleUpdateProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const profilePictureUrl = await firestorage.uploadProfilePicture(file, organizerData?.userID);
                await firestore.updateUserPicture(profilePictureUrl);
                setProfileUpdated(prev => !prev);
                toast({ 
                    title: "Success", 
                    description: "Profile picture updated successfully." 
                });
            } catch (error) {
                toast({ 
                    title: "Error", 
                    description: "Error updating profile picture: " + error,
                    variant: "destructive"
                });
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitProfileUpdate = async () => {
        try {
            const userUpdateData: Partial<users> = {
                name: formData.name,
                email: formData.email
            };
            
            const studentUpdateData: Partial<studentOrganizations> = {
                descriptions: formData.descriptions
            };
            
            await handleUpdateProfile(userUpdateData, studentUpdateData);
            setIsEditModalOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Error updating profile: " + error,
                variant: "destructive"
            });
        }
    };

    const handleUpdateProfile = async (userUpdateData: Partial<users>, organizationUpdateData: Partial<studentOrganizations>) => {
        try {
            await firestore.updateUserDatabase(userUpdateData);
            await firestore.updateStudentOrganizationDatabase(organizationUpdateData);
            setProfileUpdated(prev => !prev);
            toast({ 
                title: "Success", 
                description: "Profile updated successfully." 
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Error updating profile: " + error,
                variant: "destructive"
            });
        }
    };

    const ProfileField = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
        <div className="bg-white rounded-lg border border-gray-100 p-4 transition-all hover:border-blue-100 hover:shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 ${value ? 'bg-blue-50' : 'bg-gray-50'} rounded-full`}>
                    <Icon className={`w-5 h-5 ${value ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    {value ? (
                        <p className="text-base font-medium text-gray-800 mt-1">{value}</p>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-orange-500 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Please update your {label.toLowerCase()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const StatusBadge = ({status}: {status: string}) => {
        const getStatusColor = (status: string) => {
            switch(status.toLowerCase()) {
                case 'active':
                    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
                case 'upcoming':
                    return 'bg-amber-50 text-amber-600 border-amber-200';
                case 'completed':
                    return 'bg-blue-50 text-blue-600 border-blue-200';
                default:
                    return 'bg-gray-50 text-gray-600 border-gray-200';
            }
        };
        
        return (
            <Badge variant="outline" className={`${getStatusColor(status)} text-xs font-medium px-2 py-1`}>
                {status}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-red-50 p-3 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <CardTitle>Unable to Load Profile</CardTitle>
                        <CardDescription>We encountered an error while loading your data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-center text-slate-600 mb-6">{error}</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    //Wait until the data is loaded before rendering the component
    if (!userData || !organizerData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Hero Section with Profile Info */}
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute bottom-4 right-4">
                        <Button variant="secondary" size="sm" className="gap-1.5">
                            <Camera className="h-4 w-4" />
                            <span>Update Cover</span>
                        </Button>
                    </div>
                </div>
                
                {/* Profile Information */}
                <div className="px-6 pt-0 pb-6 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-14">
                        <div className="relative group z-10">
                            <Avatar className="h-28 w-28 border-4 border-white shadow-md">
                                <AvatarImage src={userData?.profilePicture} alt={userData?.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-3xl font-bold">
                                    {userData?.name?.charAt(0) || "O"}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-2 cursor-pointer shadow-md transition-all opacity-90 hover:opacity-100 hover:bg-blue-700 group-hover:scale-105">
                                <Camera className="h-4 w-4 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpdateProfilePicture}
                                />
                            </label>
                        </div>
                        
                        <div className="flex-1 pt-6 md:pt-0">
                            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-2xl font-bold text-gray-800">{userData?.name || "Organization Name"}</h1>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                            {userData?.role || "Organization"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{userData?.email || "Email not available"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4 md:mt-0">
                                    <Button 
                                        onClick={handleEditProfile} 
                                        className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Tabs */}
            <Tabs defaultValue="about" className="w-full">
                <div className="bg-white rounded-lg p-1 shadow-sm mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="about" className="text-sm font-medium py-2.5">
                            <Info className="w-4 h-4 mr-2" />
                            About
                        </TabsTrigger>
                        <TabsTrigger value="events" className="text-sm font-medium py-2.5">
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Hosted Events
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* About Tab Content */}
                <TabsContent value="about" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Organization Details Card */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center">
                                        <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                                        Organization Details
                                    </CardTitle>
                                    <CardDescription>
                                        Basic information about your organization
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <ProfileField 
                                            icon={User} 
                                            label="Organization Name" 
                                            value={userData?.name}
                                        />
                                        <ProfileField 
                                            icon={Mail} 
                                            label="Contact Email" 
                                            value={userData?.email}
                                        />
                                    </div>
                                    
                                    <Card className="border-dashed">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-md flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                                About Us
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {organizerData?.descriptions ? (
                                                <div className="text-gray-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    {organizerData.descriptions}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 py-6 text-center">
                                                    <div className="bg-amber-50 p-3 rounded-full">
                                                        <AlertCircle className="w-6 h-6 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-1">Description Missing</h4>
                                                        <p className="text-sm text-gray-600 max-w-md">
                                                            Add a description to help students understand what your organization is about.
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="mt-2"
                                                        onClick={handleEditProfile}
                                                    >
                                                        Add Description
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center">
                                        <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                                        Quick Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Events</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-slate-800">{events.length}</span>
                                                <Calendar className="h-5 w-5 text-blue-500" />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Upcoming Events</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-slate-800">
                                                    {events.filter(e => new Date(e.eventDate) > new Date()).length}
                                                </span>
                                                <CalendarDays className="h-5 w-5 text-emerald-500" />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Completed Events</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-slate-800">
                                                    {events.filter(e => new Date(e.eventDate) < new Date()).length}
                                                </span>
                                                <Clipboard className="h-5 w-5 text-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => router.push('/organization/analytics')}
                                        >
                                            View Full Analytics
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Events Tab Content */}
                <TabsContent value="events">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg flex items-center">
                                    <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
                                    Hosted Events
                                </CardTitle>
                                <CardDescription>
                                    Manage all your organization's events
                                </CardDescription>
                            </div>
                            <Button className="gap-1.5" onClick={() => router.push('/organization/create')}>
                                <Calendar className="h-4 w-4" />
                                Create Event
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {events.map((event, index) => (
                                        <Card key={index} className="overflow-hidden group hover:border-blue-200 transition-all">
                                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                                {event.poster ? (
                                                    <img 
                                                        src={event.poster} 
                                                        alt={event.title} 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                                        <Calendar className="h-16 w-16 text-slate-300" />
                                                    </div>
                                                )}
                                                
                                                {/* Status badge */}
                                                <div className="absolute top-3 right-3">
                                                    <StatusBadge 
                                                        status={
                                                            new Date(event.eventDate) > new Date() 
                                                                ? "Upcoming" 
                                                                : "Completed"
                                                        } 
                                                    />
                                                </div>
                                            </div>
                                            
                                            <CardContent className="p-5">
                                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                                                    {parser(event.title)}
                                                </h3>
                                                
                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <CalendarDays className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                        <span>{helper.formatDate(event.eventDate) || "Date not set"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                        <span className="line-clamp-1">{event.eventLocation || "Location not set"}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-2">
                                                    <div className="text-sm text-gray-600 line-clamp-2 h-10 mb-4">
                                                        {parser(event.shortDescription) || "No description available"}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between gap-2 mt-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex-1"
                                                        onClick={() => router.push(`/organization/analytics/${event.eventID}`)}
                                                    >
                                                        <BarChart3 className="h-4 w-4 mr-1" />
                                                        Analytics
                                                    </Button>
                                                    <Button
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700" 
                                                        size="sm" 
                                                        onClick={() => router.push(`/organization/planning/${event.eventID}`)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center bg-slate-50 rounded-lg py-16 px-4 border border-dashed border-slate-200">
                                    <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-full mb-4">
                                        <Calendar className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Events Yet</h3>
                                    <p className="text-slate-600 max-w-md mx-auto mb-6">
                                        Your organization hasn't hosted any events yet. Create your first event to engage with students on campus.
                                    </p>
                                    <Button>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Create Your First Event
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Organization Profile</DialogTitle>
                        <DialogDescription>
                            Update your organization's information
                        </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4 py-4 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Organization Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Organization name"
                                    className="border-slate-200"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="organization@example.com"
                                    className="border-slate-200"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="descriptions" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="descriptions"
                                    name="descriptions"
                                    value={formData.descriptions}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about your organization, mission, and activities..."
                                    rows={8}
                                    className="border-slate-200 resize-none"
                                />
                                <p className="text-xs text-slate-500">
                                    This description will be visible to all students browsing organizations.
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                    
                    <DialogFooter className="flex items-center space-x-2 sm:justify-between border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                            className="border-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            onClick={handleSubmitProfileUpdate}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrganizationProfile;