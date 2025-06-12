"use client";

import { useUser } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, XCircle } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: "student" | "organization" ;
  fallbackPath?: string;
}

export default function RouteGuard({ 
  children, 
  requiredRole, 
  fallbackPath = "/" 
}: RouteGuardProps) {
  const { userData, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Auth check on route change or initial load
    authCheck();
  }, [userData, isLoading, pathname]);

  function authCheck() {
    // If still loading, wait
    if (isLoading) return;

    // If no user data, redirect to login
    if (!userData) {
      setAuthorized(false);
      setAccessDenied(false); // Not denied, just not logged in
      router.push(fallbackPath);
      return;
    }

    // If requiredRole is specified, check for role match
    if (requiredRole && userData.role !== requiredRole) {
      setAuthorized(false);
      setAccessDenied(true); // Access denied due to incorrect role
      
      // Set a timeout before redirecting to allow user to see the message
      setTimeout(() => {
        // Redirect to appropriate dashboard based on role
        if (userData.role === "student") {
          router.push("/student");
        } else if (userData.role === "organization") {
          router.push("/organization");
        } else {
          router.push(fallbackPath);
        }
      }, 3000); // Show message for 3 seconds
      return;
    }

    setAuthorized(true);
    setAccessDenied(false);
  }

  // Show loading indicator or access denied message
  if (isLoading || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg shadow-md bg-white">
          {isLoading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600">Verifying access...</p>
            </>
          ) : accessDenied ? (
            <>
              <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-red-600">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access this page.</p>
              <p className="text-gray-500 text-sm">Redirecting you to an appropriate page...</p>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600">Preparing your content...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // If authorized, show the protected content
  return <>{children}</>;
}