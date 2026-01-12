import { VisibilityStatus } from './common';
import { Image, ImageValues } from '../common/image';
import { ProgramSectionTemplate } from '../common/program-sections';

export interface ProgramCategory {
    id: number;
    name: string;
    programsCount: number;
}

export enum ContentType {
    Title = 0,
    Description = 1,
    Image = 2,
}

export interface ProgramSectionContent {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
}

export interface ProgramSection {
    id?: number;
    programId?: number;
    template: ProgramSectionTemplate;
    order: number;
    contents: ProgramSectionContent[];
}

export interface Program {
    id: number;
    name: string;
    description: string;
    categories: ProgramCategory[];
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    backgroundImage: Image | ImageValues | null;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    sections: ProgramSection[];
}

export interface ProgramSearchItemData {
    id: number;
    name: string;
    categories: string[];
}

export interface ProgramCreateUpdate {
    id: number | null;
    name: string;
    description: string;
    categoryIds: number[];
    status: VisibilityStatus;
    previewImage: Image | ImageValues | null;
    previewImageId: number | null;
    backgroundImage: Image | ImageValues | null;
    backgroundImageId: number | null;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    sections: ProgramSection[];
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}
