"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Building, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { studentOrganizationsDetails } from "@/lib/type/index";
import firestore from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

const SearchOrganization = () => {
  const [organizations, setOrganizations] = useState<studentOrganizationsDetails[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<studentOrganizationsDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useUser();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  // Handle search term changes with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if term is empty
    if (searchTerm.trim() === "") {
      setFilteredOrgs([]);
      setIsLoading(false);
      return;
    }

    // Show loading state immediately
    setIsLoading(true);

    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Only fetch if we have a search term
        const orgsData = await firestore.searchOrganizations(searchTerm);
        setOrganizations(orgsData);
        setFilteredOrgs(orgsData);
      } catch (error) {
        console.error("Error searching organizations:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to search organizations",
        });
      } finally {
        setIsLoading(false);
      }
    }, 200); // 5200ms debounce

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, toast]);

  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  const handleOrgClick = (orgID: string) => {
    router.push(`/student/organizationDetail/${orgID}`);
    setIsSearchActive(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredOrgs([]);
    setIsSearchActive(false);
  };

  // const handleViewAll = () => {
  //   router.push("/student/organizations");
  //   setIsSearchActive(false);
  // };

  return (
    <div className="relative w-full md:w-80" ref={searchRef}>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            className="pl-10 pr-8"
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <Building className="ml-4 h-4 w-4" />
      </div>

      {/* Search Results Dropdown - only show if search is active AND we have search term */}
      {isSearchActive && searchTerm.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-sm">Searching organizations...</span>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No organizations found
            </div>
          ) : (
            <>
              <div className="p-2 border-b text-xs font-medium text-gray-500">
                Organizations
              </div>
              {filteredOrgs.slice(0, 5).map((org) => (
                <div
                  key={org.userID}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleOrgClick(org.userID)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={org.photoURL} alt={org.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {org.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{org.name}</div>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs h-4 px-1">
                          {org.hostedEvents?.length || 0} events
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                </div>
              ))}
              
              {/* {filteredOrgs.length > 5 && (
                <div 
                  className="p-2 text-center text-xs text-blue-600 hover:bg-gray-50 cursor-pointer border-t"
                  onClick={handleViewAll}
                >
                  View all {filteredOrgs.length} organizations
                </div>
              )} */}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchOrganization;