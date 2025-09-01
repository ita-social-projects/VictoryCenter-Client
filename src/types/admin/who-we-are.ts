import {Image} from "../common/image";
import {ContextType} from "react";

export type WhoWeAreCategory = {

    id: number
    sectionType : string
    title: string
}

export type WhoWeAreSection = {
    id: number
    sectionType: number
    title: string
    contents: Content[]
}

export type Content = {
    id: number
    contentType: ContentType
    image: Image
    description: string
    title: string
}

export enum ContentType {
    Title,
    Description,
    Image,
    Card

}