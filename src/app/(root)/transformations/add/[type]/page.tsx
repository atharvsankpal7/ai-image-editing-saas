import Header from "@/components/shared/Header";

import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { SearchParamProps, TransformationTypeKey } from "@/types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import TransformationForm from "@/components/shared/TransformationForm";

const AddTransformationTypePage = async ({
    params: { type }, //params are provided in the url after the `/add/`
}: SearchParamProps) => {
    const { userId } = auth();
    const transformation = transformationTypes[type];

    if (!userId) {
        redirect("/sign-in");
    }
    const user = await getUserById(userId);

    return (
        <>
            <Header
                title={transformation.title}
                subTitle={transformation.subTitle}
            />
            <section className="mt-10">
                <TransformationForm
                    action="Add"
                    userId={user._id}
                    type={transformation.type as TransformationTypeKey}
                    creditBalance={user.creditBalance}
                />
            </section>
        </>
    );
};

export default AddTransformationTypePage;
