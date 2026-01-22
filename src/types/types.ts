import type { DocumentData } from "firebase/firestore";

export type User = {
  fullName: string;
  email: string;
  image: string;
};

export type RoomRole = "owner" | "editor";

export type RoomDocument = DocumentData & {
  id?: string;
  createdAt: string;
  role: RoomRole;
  roomId: string;
  userId: string;
};
