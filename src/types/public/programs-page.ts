import { Image } from '../common/image';
import { HippotherapyProgramSectionDto } from '../common/program-sections';

export interface ProgramCategoryDto {
    id: number;
    name: string;
}

export interface PublishedProgramDto {
    id: number;
    slug: string;
    previewImage: Image | null;
    name: string;
    description: string;
    categories: ProgramCategoryDto[];
}

export interface ProgramsPageData {
    programsCategories: ProgramCategoryDto[];
    programsData: PublishedProgramDto[];
}

export interface DetailedProgram {
    id: number;
    name: string;
    description: string;
    previewImage: Image | null;
    backgroundImage: Image | null;
    location: string;
    participantsCount: string;
    meetingsCount: string;
    sections: HippotherapyProgramSectionDto[];
    slug: string;
}
