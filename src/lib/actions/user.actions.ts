"use server";

import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToMongoDB } from "../database/connectToDb";
import { handleError } from "../utils";

// CREATE
/**
 * Creates a new user in the database.
 *
 * @param user - The user data to create.
 * @returns The created user object.
 */
export async function createUser(user: CreateUserParams) {
    try {
        await connectToMongoDB();

        const newUser = await User.create(user);

        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        handleError(error);
    }
}

// READ
/**
 * Gets a user by their ID.
 *
 * @param userId - The ID of the user to find.
 * @returns The user with the given ID.
 * @throws Error if no user found with the given ID.
 */
export async function getUserById(userId: string) {
    try {
        await connectToMongoDB();

        const user = await User.findOne({ clerkId: userId });

        if (!user) throw new Error("User not found");

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        handleError(error);
    }
}

// UPDATE
/**
 * Updates a user in the database by their Clerk ID.
 *
 * @param clerkId - The Clerk ID of the user to update.
 * @param user - The user data to update.
 * @returns The updated user object.
 */
export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        await connectToMongoDB();

        const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
            new: true,
        });

        if (!updatedUser) throw new Error("User update failed");

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        handleError(error);
    }
}

// DELETE
/**
 * Deletes a user by their Clerk ID.
 *
 * @param clerkId - The Clerk ID of the user to delete.
 * @returns The deleted user object if successful, null if not found.
 * @throws Error if delete fails.
 */
export async function deleteUser(clerkId: string) {
    try {
        await connectToMongoDB();

        // Find user to delete
        const userToDelete = await User.findOne({ clerkId });

        if (!userToDelete) {
            throw new Error("User not found");
        }

        // Delete user
        const deletedUser = await User.findByIdAndDelete(userToDelete._id);
        revalidatePath("/");

        return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
    } catch (error) {
        handleError(error);
    }
}

// USE CREDITS
/**
 * Updates the credit balance for a user by the provided credit fee amount.
 *
 * @param userId - The ID of the user to update credits for.
 * @param creditFee - The number of credits to decrement the user's balance by.
 * @returns The updated user object with the new credit balance.
 */
export async function updateCredits(userId: string, creditFee: number) {
    try {
        await connectToMongoDB();

        const updatedUserCredits = await User.findOneAndUpdate(
            { _id: userId },
            { $inc: { creditBalance: creditFee } }, // deducting the credit fee from the user's balance
            { new: true }
        );

        if (!updatedUserCredits) throw new Error("User credits update failed");

        return JSON.parse(JSON.stringify(updatedUserCredits));
    } catch (error) {
        handleError(error);
    }
}
