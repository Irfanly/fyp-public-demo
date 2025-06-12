// components/ProfileCompletionPrompt.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { students } from '@/lib/type/index';
import firestore  from '@/services/firestore';
import { auth } from '@/conf/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ProfileCompletionPrompt() {
  const { userData } = useUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [studentData, setStudentData] = useState<students | null>(null);
  const { toast } = useToast();

        
  useEffect(() => {
    // Fetch student-specific data when component mounts
    const currentUser = auth.currentUser;
    const fetchStudentData = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const studentInfo = await firestore.readStudentDatabaseByUserID(currentUser.uid);
          setStudentData(studentInfo?.data() as students);
          
          // Check if profile needs completion after a short delay
          setTimeout(() => {
            if (isProfileIncomplete(studentInfo?.data() as students)) {
              setOpen(true);
            }
          }, 1000);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch student data. Please try again later.',
                variant: 'destructive',
            });
            console.log('Error fetching student data:', error);
        }
      }
    };
    
    fetchStudentData();
  }, [userData]);

  // Check if required student fields are missing
  const isProfileIncomplete = (data: students | null) => {
    if (!data) return false;
    
    // Check required student fields based on the type definition
    return !data.matricNo || 
           !data.programme || 
           !data.year || 
           !data.phone;
  };

  const handleCompleteProfile = () => {
    setOpen(false);
    router.push('/student/profile');
  };

  const handleRemindLater = () => {
    setOpen(false);
    // Save reminder dismissal timestamp
    localStorage.setItem('profileReminder', new Date().toISOString());
  };

  // Don't render anything if no data yet or if reminder was recently dismissed
  const lastReminder = localStorage.getItem('profileReminder');
  const shouldShowReminder = !lastReminder || 
    (new Date().getTime() - new Date(lastReminder).getTime() > 24 * 60 * 60 * 1000);
  
  if (!userData || !shouldShowReminder) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
            <UserCircle className="h-10 w-10 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Please complete your student information to fully access all features.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 px-6 bg-gray-50 rounded-lg my-2">
          <h4 className="font-medium mb-2">Required information:</h4>
          <ul className="space-y-1 text-sm list-disc pl-4">
            {!studentData?.matricNo && <li>Matric Number</li>}
            {!studentData?.programme && <li>Programme</li>}
            {!studentData?.year && <li>Year of Study</li>}
            {!studentData?.phone && <li>Phone Number</li>}
          </ul>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleRemindLater}>
            Remind Me Later
          </Button>
          <Button onClick={handleCompleteProfile}>
            Complete Profile Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}