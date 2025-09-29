import { Image } from '../common/image';

export interface ProgramCategoryDto {
    id: number;
    name: string;
}

export interface PublishedProgramDto {
    id: number;
    image: Image | null;
    name: string;
    description: string;
    categories: ProgramCategoryDto[];
}

export interface ProgramsPageData {
    programsCategories: ProgramCategoryDto[];
    programsData: PublishedProgramDto[];
}
