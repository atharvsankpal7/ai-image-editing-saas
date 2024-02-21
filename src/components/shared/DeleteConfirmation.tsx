"use client";

import { useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteImage } from "@/lib/actions/image.actions";

import { Button } from "../ui/button";

/**
 * DeleteConfirmation component renders a confirmation dialog
 * before deleting an image.
 *
 * It takes an imageId prop and uses the deleteImage action
 * to delete the image on confirmation.
 *
 * Renders a Button trigger that opens the dialog.
 * Dialog contains title, description, cancel and delete actions.
 *
 * Handles pending state and transition for delete action.
 */
export const DeleteConfirmation = ({ imageId }: { imageId: string }) => {
    const [isPending, startTransition] = useTransition();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild className="w-full rounded-full">
                <Button
                    type="button"
                    className="button h-[44px] w-full md:h-[54px]"
                    variant="destructive"
                >
                    Delete Image
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="flex flex-col gap-10">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete this image?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="p-16-regular">
                        This will permanently delete this image
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="border bg-red-500 text-white hover:bg-red-600"
                        onClick={() =>
                            startTransition(async () => {
                                await deleteImage(imageId);
                            })
                        }
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
