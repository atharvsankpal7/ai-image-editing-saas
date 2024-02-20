"use server";

import { revalidatePath } from "next/cache";
import { connectToMongoDB } from "../database/connectToDb";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from "cloudinary";
import { AddImageParams, UpdateImageParams } from "@/types";

/**
 * Populates the author field of the query with the
 * User model, selecting only the _id, firstName, and
 * lastName fields.
 */
const populateUser = async (query: any) =>
    query.populate({
        path: "author",
        model: User,
        select: "_id firstName lastName clerkId",
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

// GET ALL IMAGES
/**
 * Retrieves a list of images based on specified parameters.
 *
 * @param limit - The maximum number of images to retrieve.
 * @param page - The page number of the images to retrieve.
 * @param searchQuery - The search query to filter images.
 *
 * @returns An object containing the retrieved images, total pages, and saved images count.
 */
export async function getAllImages({
    limit = 9,
    page = 1,
    searchQuery = "",
}: {
    limit?: number;
    page: number;
    searchQuery?: string;
}) {
    try {
        await connectToMongoDB();

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });

        let expression = "folder=imaginify";

        if (searchQuery) {
            expression += ` AND ${searchQuery}`;
        }

        const { resources } = await cloudinary.search
            .expression(expression)
            .execute();

        const resourceIds = resources.map(
            (resource: any) => resource.public_id
        );

        let query = {};

        if (searchQuery) {
            query = {
                publicId: {
                    $in: resourceIds,
                },
            };
        }

        const skipAmount = (Number(page) - 1) * limit;

        const images = await populateUser(
            Image.find(query)
                .sort({ updatedAt: -1 })
                .skip(skipAmount)
                .limit(limit)
        );

        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages / limit),
            savedImages,
        };
    } catch (error) {
        handleError(error);
    }
}

/**
 * Gets a paginated list of images uploaded by a user.
 *
 * @param limit - Number of images to return per page. Default is 9.
 * @param page - Page number to retrieve.
 * @param userId - ID of the user to get images for.
 * @returns Object with image data and pagination info.
 */
export async function getUserImages({
    limit = 9,
    page = 1,
    userId,
}: {
    limit?: number;
    page: number;
    userId: string;
}) {
    try {
        await connectToMongoDB();

        const skipAmount = (Number(page) - 1) * limit;

        const images = await populateUser(
            Image.find({ author: userId })
                .sort({ updatedAt: -1 })
                .skip(skipAmount)
                .limit(limit)
        );

        const totalImages = await Image.find({
            author: userId,
        }).countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPages: Math.ceil(totalImages / limit),
        };
    } catch (error) {
        handleError(error);
    }
}
