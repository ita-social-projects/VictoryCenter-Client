import { VisibilityStatus } from './common';
import { Image, ImageValues } from '../common/image';
import { ProgramSection } from '../common/program-sections';

export interface ProgramCategory {
    id: number;
    name: string;
    programsCount: number;
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
    slug: string;
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
    slug?: string;
}

export interface ProgramCategoryCreateUpdate {
    id: number | null;
    name: string;
}

export enum SectionCancelActionType {
    RemoveSection,
    RevertSection,
    RevertAfterReplace,
}
