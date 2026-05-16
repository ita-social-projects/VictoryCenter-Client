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
    title: string;
    tags: Tag[];
}

export interface EventsNewsPageData {
    description: string;
    chooseProgram: chooseProgramData;
    eventsData: EventsData;
}

export interface EventsNews {
    id: string;
    title: string;
    resource?: string;
    description: string;
    date: string;
    tags: Tag[];
    imageURL: string;
}
