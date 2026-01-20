"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  removeUserFromDocument,
  migrateDocumentCollaborators,
} from "@/actions/actions";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import useOwner from "@/lib/useOwner";
import { useRoom } from "@liveblocks/react/suspense";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { Crown, UserMinus } from "lucide-react";

interface Collaborator {
  role: "owner" | "editor";
  email: string;
  addedAt?: Timestamp;
}

const ManageUsers = () => {
  const { user } = useUser();
  const isOwner = useOwner();
  const room = useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const [data, loading] = useDocumentData(
    room?.id ? doc(db, "documents", room.id) : null
  );

  const collaborators = React.useMemo(() => {
    if (!data || !data.collaborators) return [];

    return Object.entries(
      data.collaborators as Record<string, Collaborator>
    ).map(([, value]) => ({
      email: value.email,
      role: value.role,
      addedAt: value.addedAt,
    }));
  }, [data]);

  const handleDelete = (userId: string) => {
    setDeletingUser(userId);
    startTransition(async () => {
      if (!user) return;

      try {
        const { success } = await removeUserFromDocument(room.id, userId);

        if (success) {
          toast.success("User removed from the room");
        } else {
          toast.error("Error removing user from the room");
        }
      } catch (error) {
        console.error("Error removing user:", error);
        toast.error("Error removing user");
      } finally {
        setDeletingUser(null);
      }
    });
  };

  const currentUserEmail = user?.emailAddresses?.[0]?.emailAddress;

  const handleMigrate = () => {
    startTransition(async () => {
      try {
        const result = await migrateDocumentCollaborators(room.id);
        if (result.success) {
          toast.success(
            `Migration complete! Found ${
              result.collaboratorCount || 0
            } collaborators`
          );
        } else {
          toast.error(result.error || "Migration failed");
        }
      } catch (error) {
        toast.error("Migration failed");
        console.error("Error migrating document collaborators:", error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          Users ({loading ? "..." : collaborators.length})
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with Access</DialogTitle>
          <DialogDescription>
            List of the users that have access to this document.
          </DialogDescription>
        </DialogHeader>
        <hr className="my-2" />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Loading users...
            </p>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-gray-500">No collaborators found</p>
              <p className="text-xs text-gray-400">
                This document may need migration
              </p>
              <Button
                onClick={handleMigrate}
                disabled={isPending}
                variant="outline"
                size="sm"
              >
                {isPending ? "Migrating..." : "Migrate Document"}
              </Button>
            </div>
          ) : (
            collaborators.map((collaborator) => {
              const isCurrentUser = collaborator.email === currentUserEmail;
              const canRemove =
                isOwner && collaborator.role !== "owner" && !isCurrentUser;

              return (
                <div
                  key={collaborator.email}
                  className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-light text-sm">
                      {isCurrentUser
                        ? `You (${collaborator.email})`
                        : collaborator.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {collaborator.role === "owner" && (
                        <Crown className="w-3 h-3" />
                      )}
                      {collaborator.role}
                    </Button>

                    {canRemove && (
                      <Button
                        variant="destructive"
                        className="bg-red-500 text-white hover:bg-red-600"
                        onClick={() => handleDelete(collaborator.email)}
                        disabled={
                          isPending || deletingUser === collaborator.email
                        }
                        size="sm"
                      >
                        {deletingUser === collaborator.email ? (
                          "Removing..."
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageUsers;
