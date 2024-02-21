"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { updateCredits } from "@/lib/actions/user.actions"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "@/components/shared/InsufficientCreditsModal";
import { TransformationFormProps, Transformations } from "@/types"

 
export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
})

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data)
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const initialValues = data && action === 'Update' ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId,
  } : defaultValues

   // 1. Define your form.
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })
 
  // 2. Define a submit handler.
    /**
     * Handles form submission.
     *
     * Sets isSubmitting to true, then checks if there is existing image data.
     * If so, generates a transformation URL using the image data and form values.
     *
     * Creates an imageData object with the form values and image data.
     *
     * If adding a new image, calls addImage with the imageData.
     * On success, resets form and updates component state.
     *
     * If updating an existing image, calls updateImage with imageData.
     * On success, navigates to the updated image page.
     *
     * Handles any errors.
     *
     * Sets isSubmitting to false when done.
     */
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        if (data || image) {
            const transformationUrl = getCldImageUrl({
                width: image?.width,
                height: image?.height,
                src: image?.publicId,
                ...transformationConfig,
            });

            const imageData = {
                title: values.title,
                publicId: image?.publicId,
                transformationType: type,
                width: image?.width,
                height: image?.height,
                config: transformationConfig,
                secureURL: image?.secureURL,
                transformationURL: transformationUrl,
                aspectRatio: values.aspectRatio,
                prompt: values.prompt,
                color: values.color,
            };

            if (action === "Add") {
                try {
                    const newImage = await addImage({
                        image: imageData,
                        userId,
                        path: "/",
                    });

                    if (newImage) {
                        form.reset();
                        setImage(data);
                        router.push(`/transformations/${newImage._id}`);
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (action === "Update") {
                try {
                    const updatedImage = await updateImage({
                        image: {
                            ...imageData,
                            _id: data._id,
                        },
                        userId,
                        path: `/transformations/${data._id}`,
                    });

                    if (updatedImage) {
                        router.push(`/transformations/${updatedImage._id}`);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        setIsSubmitting(false);
    }

    /**
     * Handles selecting a value from the aspect ratio dropdown.
     * Updates the image state with the new aspect ratio, width and height.
     * Sets the transformation type to the new config.
     * Calls the onChangeField callback with the selected value.
     */
    const onSelectFieldHandler = (
        value: string,
        onChangeField: (value: string) => void
    ) => {
        const imageSize = aspectRatioOptions[value as AspectRatioKey];

        setImage((prevState: any) => ({
            ...prevState,
            aspectRatio: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height,
        }));

        setNewTransformation(transformationType.config);

        return onChangeField(value);
    };

    /**
     * Handles input change events for the transformation form fields.
     * Debounces updating the transformation state.
     * Calls the onChangeField callback with the new value.
     *
     * @param fieldName - The name of the field that was changed
     * @param value - The new value of the field
     * @param type - The transformation type
     * @param onChangeField - The callback to call with the new value
     */
    const onInputChangeHandler = (
        fieldName: string,
        value: string,
        type: string,
        onChangeField: (value: string) => void
    ) => {
        debounce(() => {
            setNewTransformation((prevState: any) => ({
                ...prevState,
                [type]: {
                    ...prevState?.[type],
                    [fieldName === "prompt" ? "prompt" : "to"]: value,
                },
            }));
        }, 1000)();

        return onChangeField(value);
    };

    /**
     * Handles when the user clicks the transform button.
     * Sets the isTransforming state to true to show a loading indicator.
     * Merges the newTransformation state into the existing transformationConfig.
     * Clears the newTransformation state.
     * Starts the transform transition.
     * Calls updateCredits to deduct credits for the transform.
     */
    const onTransformHandler = async () => {
        setIsTransforming(true);

        setTransformationConfig(
            deepMergeObjects(newTransformation, transformationConfig)
        );

        setNewTransformation(null);

        startTransition(async () => {
            await updateCredits(userId, creditFee);
        });
    };

  useEffect(() => {
    if(image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformationType.config)
    }
  }, [image, transformationType.config, type])

    /**
   * Renders a form for applying image transformations.
   * 
   * The form contains fields for:
   * - Image title 
   * - Aspect ratio (for 'fill' type)
   * - Object to remove/recolor prompt (for 'remove' and 'recolor' types) 
   * - Replacement color (for 'recolor' type)
   * - Image uploader
   * - Transformed image preview
   * - Transform and Save buttons
   * 
   * Handles input changes to update newTransformation state. 
   * On transform, applies newTransformation and transitions the image.
   * On submit, saves the transformed image.
   */
return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomField 
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}  
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField 
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove' ? 'Object to remove' : 'Object to recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input 
                  value={field.value}
                  className="input-field"
                  onChange={(e) => onInputChangeHandler(
                    'prompt',
                    e.target.value,
                    type,
                    field.onChange
                  )}
                />
              )}
            />

            {type === 'recolor' && (
              <CustomField 
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input 
                    value={field.value}
                    className="input-field"
                    onChange={(e) => onInputChangeHandler(
                      'color',
                      e.target.value,
                      'recolor',
                      field.onChange
                    )}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
          <CustomField 
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader 
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />

          <TransformedImage 
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? 'Transforming...' : 'Apply Transformation'}
          </Button>
          <Button 
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm