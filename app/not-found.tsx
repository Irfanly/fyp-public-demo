'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Home, 
  Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);

  // Function to go back to the previous page
  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    // Redirect after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        setProgress(((5 - countdown + 1) / 5) * 100);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      goBack();
    }
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="pt-10 pb-8 flex flex-col items-center space-y-2">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mt-6">404</h1>
          <p className="text-xl text-gray-600 text-center">Page not found</p>
        </CardHeader>
        
        <CardContent className="text-center pb-6">
          <p className="text-gray-500 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 text-blue-600 mr-2" />
            <p className="text-sm text-gray-600">
              Redirecting in <span className="font-semibold">{countdown}</span> seconds...
            </p>
          </div>
          
          <Progress 
            value={progress} 
            className="h-1.5 w-full bg-gray-100" 
          />
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
          <Button 
            variant="outline" 
            onClick={goBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}