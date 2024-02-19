"use server";

import { revalidatePath } from "next/cache";
import { connectToMongoDB } from "../database/connectToDb";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";


/**
 * Populates the author field of the query with the
 * User model, selecting only the _id, firstName, and
 * lastName fields.
 */
const populateUser = async (query: any) =>
    query.populate({
        path: "author",
        model: "User",
        select: "_id firstName lastName ",
    });

// ADD IMAGE

/**
 * Adds a new image to the database.
 *
 * @param image - The image object to add
 * @param userId - The ID of the user adding the image
 * @param path - The path to revalidate after adding the image
 *
 * @returns A promise that resolves to the added image object
 */
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await connectToMongoDB();

        const author = await User.findById(userId);

        if (!author) {
            throw new Error("Author not found");
        }

        const newImage = await Image.create({
            ...image,
            author: author._id,
        });

        // reload the content of page to show the new image
        revalidatePath(path);

        return JSON.parse(JSON.stringify(newImage));
    } catch (e) {
        handleError(e);
    }
}

// UPDATE IMAGE
/**
 * Updates an existing image in the database.
 *
 * @param image - The updated image object.
 * @param userId - The ID of the user updating the image.
 * @param path - The path to revalidate after updating the image.
 *
 * @returns A promise that resolves to the updated image object.
 */
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await connectToMongoDB();

        const imageToUpdate = await Image.findById(image._id);

        if (!imageToUpdate) {
            throw new Error("Image not found");
        }

        if (imageToUpdate.author.toString() !== userId) {
            throw new Error("You are not the author of this image");
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            { new: true }
        );
        // reload the content of page to show the new image
        revalidatePath(path);

        return JSON.parse(JSON.stringify(updatedImage));
    } catch (e) {
        handleError(e);
    }
}

// DELETE IMAGE
/**
 * Deletes an image by ID.
 *
 * @param imageId - The ID of the image to delete.
 */
export async function deleteImage(imageId: string) {
    try {
        await connectToMongoDB();
        await Image.findByIdAndDelete(imageId);
    } catch (e) {
        handleError(e);
    } finally {
        redirect("/");
    }
}

// GET IMAGE
/**
 * Gets an image by ID.
 *
 * @param imageId - The ID of the image to get.
 *
 * @returns The image document if found, otherwise throws an error.
 */
export async function getImageById(imageId: string) {
    try {
        await connectToMongoDB();

        const image = await populateUser(await Image.findById(imageId));

        if (!image) {
            throw new Error("Image not found");
        }

        return JSON.parse(JSON.stringify(image));
    } catch (e) {
        handleError(e);
    }
}
