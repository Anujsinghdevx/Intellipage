"use client";
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Avatars = () => {
  const others = useOthers(); // Get other users editing the doc
  const self = useSelf(); // Get current user
  const all = [self, ...others]; // Combine self + others

  return (
    <div className="flex gap-2 items-center">
      <p className="font-light bg-white p-2 border rounded-xl shadow-md text-sm">
        Users currently editing this page
      </p>

      <div className="flex -space-x-5">
        {all.map((other, i) => (
          <TooltipProvider key={other?.id + i}>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="border-2 hover:z-50">
                  <AvatarImage src={other?.info.avatar} />
                  <AvatarFallback>{other?.info.name}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{self?.id === other?.id ? "You" : other?.info.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default Avatars;
