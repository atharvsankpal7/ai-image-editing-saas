"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

/**
 * Search component that allows searching the site.
 * Uses a debounced input to update the URL query param.
 * Renders an input with search icon, captures text changes,
 * debounces updates to avoid too many re-renders, constructs
 * new URL with updated query param, and pushes new URL to router.
 */
export const Search = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query) {
                const newUrl = formUrlQuery({
                    searchParams: searchParams.toString(),
                    key: "query",
                    value: query,
                });

                router.push(newUrl, { scroll: false });
            } else {
                const newUrl = removeKeysFromQuery({
                    searchParams: searchParams.toString(),
                    keysToRemove: ["query"],
                });

                router.push(newUrl, { scroll: false });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [router, searchParams, query]);

    return (
        <div className="search">
            <Image
                src="/assets/icons/search.svg"
                alt="search"
                width={24}
                height={24}
            />

            <Input
                className="search-field"
                placeholder="Search"
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
};
