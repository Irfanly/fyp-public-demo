'use client';

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import AuthForm from "@/components/Authenticate";

export default function LoginPage() {
  
  return (
    <>
      <Head>
        <title>Sign In - My App</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <AuthForm />
      </div>
    </>
  );
}