'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { users } from "@/lib/type/index";
import Link from "next/link";
import fireauth from "@/services/fireauth";
import firestore from "@/services/firestore";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await fireauth.signIn(email, password);
      if (await fireauth.isUserLoggedIn()) {
        //check if user is student or organization
        const user = await firestore.readUserDatabase() as users;
        if (user.role === "student") 
          window.location.href = "/student";
        else 
          window.location.href = "/organization";
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-[480px] m-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="h-12 w-12 bg-black rounded flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold">MyCSD Event Hub</h1>
        </div>
        
        {/* Sign In Card */}
        <Card className="w-full bg-white shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to your account</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSignIn}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-gray-500 hover:text-gray-800"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-black/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="space-y-4 pt-2">
                <div className="text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-black hover:underline">
                    Sign up now
                  </Link>
                </div>
                
                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-gray-700 hover:text-black">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-gray-700 hover:text-black">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}