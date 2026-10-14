import { Image } from '../common/image';
import { HippotherapyProgramSectionDto } from '../common/program-sections';
import { EntityLocalization } from '@/types/common/language';

export interface chooseProgramData {
    title: string;
    description: string;
    imgURL?: string;
}

export interface Tag {
    id: string;
    name: string;
    localizations?: EntityLocalization[];
}

export interface EventsData {
    title?: string;
    tags: Tag[];
}

export interface EventsNewsPageData {
    description: string;
    isPageDescriptionHidden?: boolean;
    chooseProgram: chooseProgramData;
    eventsData: EventsData;
    isEventsBlockTitleHidden?: boolean;
}

export interface EventsNews {
    id: string;
    name: string;
    resource?: string;
    description: string;
    date: string;
    tags: Tag[];
    previewImage: Image | string | { url?: string } | null;
    backgroundImage: Image | string | null;
    slug: string;
    sections: HippotherapyProgramSectionDto[];
    localizations?: EntityLocalization[];
}
