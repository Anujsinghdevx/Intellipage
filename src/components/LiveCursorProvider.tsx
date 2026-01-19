"use client";
import { useMyPresence, useOthers } from "@liveblocks/react";
import React from "react";
import FollowPointer from "./FollowPointer";

const LiveCursorProvider = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = { x: Math.floor(e.pageX), y: Math.floor(e.pageY) };
    updateMyPresence({ cursor });
  }

  function handlePointerLeave() {
    updateMyPresence({ cursor: null });
  }

  return (
    <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {others
        .filter(
          (other) =>
            other.presence?.cursor !== undefined &&
            other.presence?.cursor !== null
        )
        .map(({ connectionId, presence, info }) => (
          <FollowPointer
            key={connectionId}
            info={info}
            x={presence.cursor?.x ?? 0}
            y={presence.cursor?.y ?? 0}
          />
        ))}
      {children}
    </div>
  );
};

export default LiveCursorProvider;
