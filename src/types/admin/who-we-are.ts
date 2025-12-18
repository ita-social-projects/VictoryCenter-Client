import React from 'react';
import { ContentType, SectionType } from '../common/about-us';
import { Image, ImageValues } from '../common/image';

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
    image: Image | ImageValues | null;
    imageId: number | null;
    description: string | null;
    title: string | null;
};

export interface CardImageConfig {
    style: React.CSSProperties;
    subText: string;
    cropWidth: number;
    cropHeight: number;
    minWidth: number;
    minHeight: number;
}
