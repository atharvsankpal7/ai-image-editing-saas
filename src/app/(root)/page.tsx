import { navLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SearchParamProps } from "@/types";
import CollectionUtils from "@/components/shared/CollectionUtils";
const Home = async ({ searchParams }: SearchParamProps) => {
    const page = Number(searchParams?.page) || 1;
    const searchQuery = (searchParams?.query as string) || "";

    return (
        <div>
            <section className="home">
                <h1 className="home-heading">
                    AI powered Image Aleration with Imaginify
                </h1>
                <ul className="flex-center w-full gap-20">
                    {navLinks.slice(1, 5).map((link) => (
                        <Link
                            key={link.route}
                            href={link.route}
                            className="flex-center flex-col gap-2"
                        >
                            <li>
                                <Image
                                    src={link.icon}
                                    alt={link.label}
                                    width={24}
                                    height={24}
                                    className="flex-center w-fit rounded-full bg-white p-4"
                                />
                            </li>
                            <p className="p-15-medium text-center text-white">
                                {link.label}
                            </p>
                        </Link>
                    ))}
                </ul>
            </section>
            <SignedIn>
                <section className="sm:mt-12">
                    <CollectionUtils searchQuery={searchQuery} page={page} />
                </section>
            </SignedIn>
            <SignedOut>
                <h1 className="mt-10 text-4xl font-extrabold leading-none tracking-tight text-dark-600 md:text-5xl lg:text-7xl dark:text-white text-center ">
                    Log In to see the magic
                </h1>

                <Button
                    asChild
                    className="button bg-purple-gradient w-64 m-auto mt-5"
                >
                    <Link href="/sign-in">Sign In</Link>
                </Button>
            </SignedOut>
        </div>
    );
};

export default Home;
