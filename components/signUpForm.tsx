'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, User, Building2 } from "lucide-react";
import Link from "next/link";
import fireauth from "@/services/fireauth";
import firestore from "@/services/firestore";
import { USER_ROLES } from "@/lib/type/index";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<typeof USER_ROLES[number]>("");
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password || !role) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    if (error) {
      setIsLoading(false);
      return;
    }
    
    try {
      await fireauth.signUp(email, password);
      await fireauth.updateDisplayName(name);
      const docID = await firestore.addUserToDatabase(role.toLowerCase());
      
      if(role === "Student") {
        await firestore.addStudentToDatabase(docID);
      } else if(role === "Organization") {
        await firestore.addStudentOrganizationToDatabase(docID);
      } else {
        throw new Error("Invalid user role.");
      }
      if (await fireauth.isUserLoggedIn()) {
        if (role === "Student") 
          window.location.href = "/student";
        else if (role === "Organization") 
          window.location.href = "/organization";
      } else {
        setError("Sign up failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const emailValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmail(email);
    // Basic email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format. Please enter a valid email.");
      return;
    }
    setError("");
  }

  const passwordValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);
    // Password validation rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, and a number."
      );
      return;
    }
    setError("");
  }

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
        
        {/* Sign Up Card */}
        <Card className="w-full bg-white shadow-sm">
          <CardContent className="p-6 space-y-6 min-w-[480px] min-h-[500px]">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold">Create an account</h2>
              <p className="text-sm text-gray-500">Sign up to get started</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSignUp}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={emailValidation}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={passwordValidation}
                  disabled={isLoading}
                />
                <ul className="text-sm text-gray-500 mt-1">
                  <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                    {password.length >= 8 ? "✔" : "✖"} At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                    {/[A-Z]/.test(password) ? "✔" : "✖"} At least one uppercase letter
                  </li>
                  <li className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                    {/[a-z]/.test(password) ? "✔" : "✖"} At least one lowercase letter
                  </li>
                  <li className={/\d/.test(password) ? "text-green-600" : "text-gray-500"}>
                    {/\d/.test(password) ? "✔" : "✖"} At least one number
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as typeof USER_ROLES[number])}
                  className="grid grid-cols-2 gap-4 pt-2"
                >
                  <Label
                    htmlFor="student"
                    className={`flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer ${
                      role === "Student" 
                        ? "bg-blue-50 border-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem value="Student" id="student" />
                    <User className={`h-6 w-6 ${role === "Student" ? "text-blue-500" : ""}`} />
                    <span className={role === "Student" ? "text-blue-500 font-semibold" : ""}>
                      Student
                    </span>
                  </Label>

                  <Label
                    htmlFor="organization"
                    className={`flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer ${
                      role === "Organization" 
                        ? "bg-blue-50 border-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem value="Organization" id="organization" />
                    <Building2 className={`h-6 w-6 ${role === "Organization" ? "text-blue-500" : ""}`} />
                    <span className={role === "Organization" ? "text-blue-500 font-semibold" : ""}>
                      Organization
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-black/90"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <div className="space-y-4 pt-2">
                <div className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-black hover:underline">
                    Sign in
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