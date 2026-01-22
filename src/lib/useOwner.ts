import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react";
import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";

const useOwner = () => {
  const { user } = useUser();
  const room = useRoom();
  const [isOwner, setIsOwner] = useState(false);

  const email = user?.emailAddresses?.[0]?.emailAddress;

  const [roomData, loading] = useDocumentData(
    email && room?.id ? doc(db, "users", email, "rooms", room.id) : null
  );

  useEffect(() => {
    if (loading) return;

    if (roomData) {
      setIsOwner(roomData.role === "owner");
      console.log(
        "useOwner - User role:",
        roomData.role,
        "isOwner:",
        roomData.role === "owner"
      );
    } else {
      setIsOwner(false);
      console.log(" useOwner - No room data found, user is not owner");
    }
  }, [roomData, loading]);

  return isOwner;
};

export default useOwner;
