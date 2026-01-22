"use client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useUser } from "@clerk/nextjs";
import React from "react";
import BreadCrumbs from "./BreadCrumbs";

const Navbar = () => {
  const { user } = useUser();

  return (
    <div
      className="relative font-serif flex items-center justify-between px-6 md:px-10 py-4 
      bg-gradient-to-r from-orange-400 to-red-600 backdrop-blur-md border-b border-gray-300 
      shadow-lg text-white z-50 rounded-b-lg"
    >
      {user && (
        <h1
          className="text-2xl font-bold tracking-wide text-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.4)] 
          hover:scale-105 transition-transform duration-200"
        >
          {user?.firstName}
          {`'s `} Space
        </h1>
      )}

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <BreadCrumbs />
      </div>

      <div className="flex items-center space-x-4">
        <SignedOut>
          <div
            className="px-4 py-2 bg-white text-orange-500 font-medium rounded-lg shadow-md 
            hover:bg-gray-100 transition-all cursor-pointer"
          >
            <SignInButton />
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center space-x-2">
            <p className="hidden md:block text-sm font-medium">
              {user?.fullName}
            </p>
            <div className="hover:scale-110 transition-transform duration-200">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Navbar;
