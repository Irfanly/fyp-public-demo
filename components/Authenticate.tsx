'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import fireauth from "@/services/fireauth";
import firestore from "@/services/firestore";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await fireauth.signUp(email, password);
        await fireauth.updateDisplayName(name);
        await firestore.addUserToDatabase();
      } else {
        await fireauth.signIn(email, password);
      }
      if (await fireauth.isUserLoggedIn()) {
        window.location.href = "/student";
      } else {
        console.log("User not signed in");
      }
    } catch (error) {
      console.error(`${isSignUp ? "Sign up" : "Sign in"} error:`, error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-between p-4 relative">
      {/* Top right switch button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => setIsSignUp(!isSignUp)}
          className=" text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </Button>
      </div>

      {/* Left testimonial section */}
      <div className="hidden lg:flex w-1/2 bg-black text-white p-12 min-h-screen flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="currentColor" d="M8 2v4H4v16h16v-4h4V2H8zm8 16H8v-4h8v4zm4-4h-2v-4H6V6h2V4h12v10z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold">myCSD Event Hub</span>
          </div>
        </div>
        
        <div>
          <blockquote className="text-2xl font-light mb-4">
            "Promoting any events has never been more easier with myCSD Event Hub. It's a one-stop solution for all your event management needs."
          </blockquote>
          <p className="text-lg">-Khawarizmi Jefri</p>
        </div>
      </div>

      {/* Right auth section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {isSignUp ? "Create an account" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAuth}>
              {isSignUp && (
                <div>
                  <Label htmlFor="name" className="font-medium text-gray-700">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-medium text-gray-700">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full py-3 px-4 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-600">
            <p className="text-xs text-gray-500 text-center mt-4">
              By clicking continue, you agree to our{' '}
              <a href="#" className="underline hover:text-gray-800">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-gray-800">
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}