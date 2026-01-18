import { Image } from '../common/image';

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
