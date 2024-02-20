import { getAllImages } from "@/lib/actions/image.actions";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import React from "react";
import { Collection } from "./Collection";

const CollectionUtils = async ({
    page,
    searchQuery,
}: {
    page: number;
    searchQuery: string;
}) => {
    const user = auth();

    if (!user.userId) {
        redirect("/sign-in");
    }
    const images = await getAllImages({
        page,
        searchQuery,
        userId: user.userId,
    });
    return (
        <Collection
            hasSearch={true}
            images={images?.data}
            totalPages={images?.totalPages}
            page={page}
        />
    );
};

export default CollectionUtils;
