'use client';

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import SignInForm from "@/components/signInForm";

export default function SignUpPage() {

  return (
    <>
      <Head>
        <title>Sign In - My App</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <SignInForm />
      </div>
    </>
  );
}