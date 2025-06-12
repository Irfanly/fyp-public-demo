"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { users } from "@/lib/type/index";
import { auth } from "@/conf/firebase";
import firestore from "@/services/firestore";

interface UserContextType {
    userData: users | null;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
    userData: null,
    isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [userData, setUserData] = useState<users | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                setIsLoading(true);
                const userResult = await firestore.readUserDatabase() as users;
                setUserData(userResult);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

  return (
        <UserContext.Provider value={{ userData, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
