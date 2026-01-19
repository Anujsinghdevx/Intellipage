"use client";
import React, { useEffect, useRef } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import NewDocument from "@/components/NewDocument";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  collectionGroup,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Files, FileText, Rocket } from "lucide-react";

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

const Sidebar = () => {
  const { user } = useUser();
  const [, setGroupedData] = React.useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({ owner: [], editor: [] });
  const [data] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("userId", "==", user.emailAddresses[0].toString())
      )
  );

  useEffect(() => {
    if (!data) return;

    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;

        if (roomData.role === "owner") {
          acc.owner.push({
            id: curr.id,
            ...roomData,
          });
        } else {
          acc.editor.push({
            id: curr.id,
            ...roomData,
          });
        }
        return acc;
      },
      {
        owner: [],
        editor: [],
      }
    );
    setGroupedData(grouped);
  }, [data]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const maxBubbles = 140;

  useEffect(() => {
    if (!containerRef.current) return;

    for (let i = 0; i < maxBubbles; i++) {
      const bubble = document.createElement("span");

      const size = 4 + 6 * Math.random(); // Reduce max size further
      if (size > 30) continue; // Prevent large bubbles

      const positionX = 100 * Math.random();
      const positionY = 100 * Math.random();
      const visibility = 0.2 + Math.random();
      const animeDuration = 4 + 4 * Math.random();
      const animeDelay = 4 * Math.random();
      const distance = 16 + 24 * Math.random();

      bubble.style.setProperty("--size", `${size}px`);
      bubble.style.setProperty("--position-x", `${positionX}%`);
      bubble.style.setProperty("--position-y", `${positionY}%`);
      bubble.style.setProperty("--visibility", `${visibility}`);
      bubble.style.setProperty("--anime-duration", `${animeDuration}s`);
      bubble.style.setProperty("--anime-delay", `${animeDelay}s`);
      bubble.style.setProperty("--distance", `${distance}px`);

      bubble.classList.add("bubble");
      containerRef.current.appendChild(bubble);
    }
  }, []);

  return (
    <div ref={containerRef} className="bubbles fixed inset-0 z-10">
      <div className="relative z-50 flex items-center -mt-10 justify-center min-h-[97vh] px-4 pb-20">
        <div className="max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-lg border border-gray-300 rounded-2xl shadow-2xl text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to IntelliPage
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Create, collaborate, and enhance your documents effortlessly.
            IntelliPage gives you the flexibility of Notion—plus more.
          </p>

          {/* Feature List */}
          <div className="space-y-4 text-gray-700">
            {[
              {
                icon: Rocket,
                color: "text-blue-500",
                title: "Live Collaboration",
                desc: "Work with your team in real-time.",
              },
              {
                icon: BrainCircuit,
                color: "text-purple-500",
                title: "AI Assistance",
                desc: "Get smart summaries on the go.",
              },
              {
                icon: Files,
                color: "text-green-500",
                title: "Seamless Organization",
                desc: "Keep your work structured with an intuitive document system.",
              },
            ].map(({ icon: Icon, color, title, desc }, index) => (
              <div key={index} className="flex items-start gap-3">
                <Icon className={`${color} w-6 h-6 flex-shrink-0`} />
                <div className="text-base leading-relaxed">
                  <strong className="font-semibold">{title}</strong> – {desc}
                </div>
              </div>
            ))}
          </div>

          {/* If User is Logged In */}
          {user ? (
            <>
              {/* Primary Action Button */}
              <div className="flex flex-col items-center space-y-3">
                <p className="text-gray-700 text-m">
                  Get started by creating a new document.
                </p>
                <NewDocument />
              </div>

              {/* Secondary Action Button */}
              <div className="flex flex-col items-center space-y-3">
                <p className="text-gray-700 text-sm">
                  Or go to your created docs
                </p>
                <Link href="/doc">
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md">
                    <FileText className="w-5 h-5" /> Documents
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            /* If User is NOT Logged In */
            <div className="text-center space-y-3">
              <p className="text-gray-700 text-m font-semibold">
                Login to create new documents or edit existing ones.
              </p>
              <div
                className="px-4 py-2 text-white bg-orange-500 font-medium rounded-lg shadow-md 
            hover:bg-gray-100 transition-all cursor-pointer"
              >
                <SignInButton />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Divider */}
        <div className="custom-shape-divider-bottom-1741448917 relative z-10">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="gradient-fill"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="url(#gradient-fill)"
            ></path>
          </svg>
        </div>
      </div>
      <div
        className='className=" text-white p-6 flex justify-center  bg-gradient-to-r from-red-600 to-orange-400 font-medium rounded-lg shadow-md 
            hover:bg-gray-100 transition-all cursor-pointer h-20'
      >
        All rights are reserved © 2025
      </div>
    </div>
  );
};

export default Sidebar;
