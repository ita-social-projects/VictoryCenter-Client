import { Image, ImageValues } from '../common/image';
import { ContextType } from 'react';

export type WhoWeAreCategory = {
    id: number;
    sectionType: SectionType;
    title: string;
};

export type WhoWeAreSection = {
    id: number;
    sectionType: SectionType;
    title: string;
    contents: Content[];
};

export type Content = {
    id: number;
    contentType: ContentType;
    image: Image | ImageValues;
    description: string;
    title: string;
};

export enum ContentType {
    Title,
    Description,
    Image,
    Card,
}

export enum SectionType {
    Main,
    WhatWeDo,
    WhoWeSupport,
    Team,
    People,
}
