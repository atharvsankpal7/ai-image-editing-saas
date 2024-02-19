"use client";

import { useToast } from "@/components/ui/use-toast";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { dataUrl, getImageSize } from "@/lib/utils";
import Image from "next/image";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    setImage: React.Dispatch<any>;
    image: any;
    publicId: string;
    type: string;
};

const MediaUploader = ({
    onValueChange,
    setImage,
    image,
    publicId,
    type,
}: MediaUploaderProps) => {
    const { toast } = useToast();

    const onUploadSuccessHandler = (result: any) => {
        //result object is given by the cloudinary
        setImage((prev: any) => ({
            ...prev,
            publicId: result?.info?.public_id,
            width: result?.info?.width,
            height: result?.info?.height,
            secureURL: result?.info?.secure_url,
        }));

        onValueChange(result?.info?.public_id);

        toast({
            title: "Upload Success",
            description: "Credit was deducted from account",
            duration: 2500,
            className: "success-toast",
        });
    };
    const onUploadErrorHandler = () => {
        toast({
            title: "Upload failed",
            description: "Please try again",
            duration: 2500,
            className: "error-toast",
        });
    };

    return (
        <CldUploadWidget
            uploadPreset="jsm_imaginify"
            options={{
                multiple: false,
                resourceType: "image",
            }}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
            {/* open is the function provided by cloudinary which opens the upload gallery for the user */}
            {({ open }) => (
                <div className="flex flex-col gap-4">
                    <h3 className="h3-bold text-dark-600">Original</h3>

                    {/* showing the image if it is uploaded by the user or showing the upload image div */}
                    {publicId ? (
                        <div className="cursor-pointer overflow-hidden rounded-[10px]">
                            <CldImage
                                width={getImageSize(type, image, "width")}
                                height={getImageSize(type, image, "height")}
                                src={publicId}
                                alt="image"
                                sizes={"(max-width: 767px) 100vw,50vw"}
                                placeholder={dataUrl as PlaceholderValue} // to show the loading effect
                                className="media-uploader_cldImage"
                            />
                        </div>
                    ) : (
                        <div
                            className="media-uploader_cta"
                            onClick={() => open()}
                        >
                            <div className="media-uploader_cta-image">
                                <Image
                                    src="/assets/icons/add.svg"
                                    alt="Add Image"
                                    width={24}
                                    height={24}
                                />
                            </div>

                            <p className="p-14-medium text-dark-600">
                                Click here to upload the image
                            </p>
                        </div>
                    )}
                </div>
            )}
        </CldUploadWidget>
    );
};

export default MediaUploader;
