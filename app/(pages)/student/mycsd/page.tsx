"use client";

import { useEffect, useState } from "react";
import { auth } from "@/conf/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import MyCSDList from "@/components/MyCSDList";

export default function MyCSDPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/auth/signin");
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto p-4">
        <MyCSDList />
      </div>
    </div>
  );
}