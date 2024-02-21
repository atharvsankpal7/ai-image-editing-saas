import React from "react";
import { Control } from "react-hook-form";
import { z } from "zod";

import {
    FormField,
    FormItem,
    FormControl,
    FormMessage,
    FormLabel,
} from "@/components/ui/form";


import { formSchema } from "./TransformationFormd";

type CustomFieldProps = {
    control: Control<z.infer<typeof formSchema>> | undefined;
    render: (props: { field: any }) => React.ReactNode;
    name: keyof z.infer<typeof formSchema>;
    formLabel?: string;
    className?: string;
};

/**
 * CustomField component renders a form field with label, control and message.
 * It takes in control, render function, name, label and className props.
 * Renders FormField with provided control, name, and render function.
 * Render function returns FormItem with label, control and message.
 */
export const CustomField = ({
    control,
    render,
    name,
    formLabel,
    className,
}: CustomFieldProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {formLabel && <FormLabel>{formLabel}</FormLabel>}
                    <FormControl>{render({ field })}</FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
