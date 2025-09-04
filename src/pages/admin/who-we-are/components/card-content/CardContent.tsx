import {COMMON_TEXT_ADMIN} from "../../../../../const/admin/common";
import {
    TextAreaWithCharacterLimit
} from "../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit";
import React from "react";
import {ImageInput} from "../../../../../components/admin/image-input/ImageInput";
import {Content} from "../../../../../types/admin/who-we-are";
import {Image, ImageValues} from "../../../../../types/common/image";
import {WHO_WE_ARE_TEXT} from "../../../../../const/admin/who-we-are";
interface CardContentProps {
    content: Content,
    onImageChange: (value: Image | ImageValues) => void
    onChange:<K extends keyof Content>(field: K, value: Content[K]) => void;
    descriptionLimit: number
}
export const CardContent = ({content, onImageChange, onChange, descriptionLimit}: CardContentProps)=>{
    return(
        <div>
           <ImageInput value={content.image} onChange={(image) => onImageChange(image ?? content.image)} label={WHO_WE_ARE_TEXT.IMAGE.INPUT} />
        <TextAreaWithCharacterLimit
        onChange={(e) => onChange("description", e.target.value)}
        value={content.description ?? ""}
        maxLength={descriptionLimit}
        name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
        id={content.id.toString()}
        ></TextAreaWithCharacterLimit></div>)
}