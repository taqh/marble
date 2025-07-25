"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@marble/ui/components/alert-dialog";
import { Button } from "@marble/ui/components/button";
import { toast } from "@marble/ui/components/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ButtonLoader } from "../ui/loader";

export const DeletePostModal = ({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}) => {
  const queryClient = useQueryClient();
  const params = useParams<{ workspace: string }>();

  const { mutate: deletePost, isPending } = useMutation({
    mutationFn: (postId: string) =>
      fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({
        queryKey: ["posts", params.workspace],
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete post.");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the post and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                deletePost(id);
              }}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? <ButtonLoader variant="destructive" /> : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
