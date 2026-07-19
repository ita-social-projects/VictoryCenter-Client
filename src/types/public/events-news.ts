import { Image } from '../common/image';
import { HippotherapyProgramSectionDto } from '../common/program-sections';
export interface chooseProgramData {
    title: string;
    description: string;
    imgURL?: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface EventsData {
    title?: string;
    tags: Tag[];
}

export interface EventsNewsPageData {
    description: string;
    chooseProgram: chooseProgramData;
    eventsData: EventsData;
}

export interface EventsNews {
    id: string;
    name: string;
    resource?: string;
    description: string;
    date: string;
    tags: Tag[];
    previewImage: Image | string | null; // string для моків, Image для реальних даних
    backgroundImage: Image | string | null; // string для моків, Image для реальних даних
    slug: string;
    sections: HippotherapyProgramSectionDto[];
}
