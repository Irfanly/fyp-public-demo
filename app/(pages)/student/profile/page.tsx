'use client';
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, School, Calendar, MapPin, Clock, User, BookOpen, Building2, PenSquare, AlertCircle, Camera, GraduationCap } from "lucide-react";
import { users, students} from "@/lib/type/index";
import { events } from "@/lib/type/index";
import firestore from "@/services/firestore";
import firestorage from "@/services/firestorage";
import EventList from "./eventList";
import EditProfileModal from "@/components/editProfileModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { auth } from "@/conf/firebase";

const UserProfile = () => {
  const [userData, setUserData] = useState<users>();
  const [studentData, setStudentData] = useState<students>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const studentResult = await firestore.readStudentDatabase() as students;
        
        setUserData(userResult);
        setStudentData(studentResult);
      } catch (err : any) {
        setError(err.message);
        console.error("Error fetching data:", err);
      }
    };

    return () => unsubscribe();

    //rerun this after user update profile
  }, [profileUpdated]);

  const handleEditProfile = () => {
    console.log("Edit profile clicked");
    setIsEditModalOpen(true);
  };

  const handleUpdateProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file);
    if (file != null) {
      try {
        const profilePictureUrl = await firestorage.uploadProfilePicture(file, studentData?.userID);
        await firestore.updateUserPicture(profilePictureUrl);
        setProfileUpdated(prev => !prev);
      } catch (error) {
        console.error("Error updating profile picture:", error);
      }
    }
  };

  const handleUpdateProfile = async (userUpdateData: Partial<users>, studentUpdateData: Partial<students>) => {
    try {
      await firestore.updateUserDatabase(userUpdateData);
      await firestore.updateStudentDatabase(studentUpdateData);
      console.log("Profile updated successfully");

    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    setProfileUpdated(prev => !prev)
  };

  const getCategoryColor = (category: string | number) => {
    const colors: { [key: string]: string } = {
      Technical: "bg-blue-100 text-blue-800",
      Community: "bg-green-100 text-green-800",
      Workshop: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const ProfileField = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-3 ${value ? 'bg-blue-50' : 'bg-gray-50'} rounded-full`}>
          <Icon className={`w-5 h-5 ${value ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {value ? (
            <p className="text-base font-semibold text-gray-800">{value}</p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-orange-500">
              <AlertCircle className="w-4 h-4" />
              <span>Please update your {label.toLowerCase()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading || !userData || !studentData) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading profile information...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-600">Error: {error}</p>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-white">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 z-50"
          onClick={handleEditProfile}
        >
          <PenSquare className="w-4 h-4 text-white" />
        </Button>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white/50 shadow-xl">
                <AvatarImage src={userData?.profilePicture} />
                <AvatarFallback className="bg-blue-700">{userData?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <Input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpdateProfilePicture}
              />
              <Label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 p-2 bg-white/20 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white/30 transition-colors"
              >
                <Camera className="w-5 h-5 text-white" />
              </Label>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold">
                {userData?.name || "Update Your Name"}
              </h2>
              <div className="flex items-center gap-2 mt-2 justify-center">
                <GraduationCap className="w-5 h-5" />
                <p className="text-white/90">
                  {studentData?.programme || "Update Your Programme"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <ProfileField 
              icon={Mail} 
              label="Email" 
              value={userData?.email}
            />
            <ProfileField 
              icon={Phone} 
              label="Phone" 
              value={studentData?.phone}
            />
            <ProfileField 
              icon={User} 
              label="Matric No." 
              value={studentData?.matricNo}
            />
            <ProfileField 
              icon={BookOpen} 
              label="Year" 
              value={studentData?.year ? `${studentData.year} Year` : undefined}
            />
          </div>
        </div>

          {/* Events Section */}
          {studentData && <EventList events={studentData.registeredEvents || []} />}
        </div>
          {/* Profile Section */}
        {userData && studentData && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            userData={userData}
            studentData={studentData}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
    </div>
  );
};

export default UserProfile;