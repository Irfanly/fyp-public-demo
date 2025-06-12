'use client';

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import firestore from "@/services/firestore";
import { userDetailsList } from "@/lib/type";
import { toast } from "@/hooks/use-toast";

const TeamMembers = ({ eventID }: { eventID: string }) => {
  const [teamMembers, setTeamMembers] = useState<userDetailsList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<userDetailsList[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await firestore.getTeamMembers(eventID);
        setTeamMembers(members as userDetailsList[]);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamMembers();
  }, [eventID]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await firestore.searchUsers(searchQuery);
          //filter result to only show students who are not already in the team
          const filteredResults = results.filter(
            results => !teamMembers.find(member => member.userID === results.userID)
          );
          setSearchResults(filteredResults);
        } catch (error) {
          toast({title: "Error", description: "Error searching users", variant: "destructive"});
          console.error("Error searching users:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, teamMembers]);

  const handleAddTeamMember = async (user: userDetailsList) => {
    try {
      await firestore.addTeamMembers(eventID, user.userID);
      setTeamMembers([...teamMembers, user]);
      setSearchResults(searchResults.filter(result => result.userID !== user.userID));
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  const handleRemoveTeamMember = async (userID: string) => {
    try {
      await firestore.removeTeamMembers(eventID, userID);
      setTeamMembers(teamMembers.filter(member => member.userID !== userID));
    } catch (error) {
      console.error("Error removing team member:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="space-y-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 text-lg font-medium">Loading Team Members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex flex-col gap-6">
        {/* Header with Icon and Search */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-gray-500" />
              <CardTitle>Team Members</CardTitle>
            </div>
            <CardDescription>Manage your event team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or matric number..."
                className="pl-10 pr-4 h-12 text-base w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {searchQuery && (
                <button
                    type="button"
                    className="absolute right-3 top-3 h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => {
                        setSearchQuery(""); // Clear the query
                        setSearchResults([]); // Clear the search results
                    }}
                >
                    <X className="h-4 w-4" />
                </button>
              )}

              {searchQuery.length >= 2 && (
                <Card className="absolute z-50 w-full mt-2 border shadow-xl">
                  <ScrollArea className="h-64">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-pulse">Searching...</div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((student) => (
                          <div
                            key={student.userID}
                            className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.photoURL} />
                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                  {student.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-gray-500">{student.matricNo}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleAddTeamMember(student)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No matching students found
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Team</CardTitle>
              <CardDescription>{teamMembers.length} members</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.userID}
                      className="group flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={member.photoURL} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.matricNo}</p>
                          <p className="text-sm text-gray-500">{member.programme}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveTeamMember(member.userID)}
                      >
                        <X className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No team members added yet</p>
                  <p className="text-sm text-gray-400">Use the search bar above to add members</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamMembers;