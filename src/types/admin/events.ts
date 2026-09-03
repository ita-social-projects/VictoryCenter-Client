// this is a test type most probably will need adjustments in the future
export type EventsErrorType = 'categories' | 'events' | 'search';
export interface ErrorState {
    message: string | null;
    type: EventsErrorType | null;
}
// this is a test interface and most probably will need adjustments in the future
export interface EventSearchItemData {
    id: number;
    name: string;
    categories: string[];
}
// this is a test interface and most probably will need adjustments in the future
export interface EventsLocalizableFields {
    name: string;
    description: string;
    location: string;
    participantsCount: string;
    meetingsCount: string;
}
// this is a test interface and most probably will need adjustments in the future
export interface EventsDto {
    id: number;
    name: string;
    description: string;
}
