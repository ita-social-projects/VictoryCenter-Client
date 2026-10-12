import { VisibilityStatus } from '@/types/admin/common';
import { EventDetailsDto } from '@/types/admin/events';
import { EventFormValues } from '@/validation/admin/event-schema/event-schema';

import { getEventImageId, mapEventFormValuesToCreateUpdateRequest } from './event-request-mapper';

const formValues: EventFormValues = {
    title: ' Event title ',
    description: ' Event description ',
    additionalDescription: ' Additional description ',
    publishDate: '2026-10-07',
    image: null,
    linkUkr: ' Ukrainian resource ',
    linkEng: ' English resource ',
};

describe('event request mapper', () => {
    it('maps new event form values to a request with the active category', () => {
        expect(
            mapEventFormValuesToCreateUpdateRequest({
                formValues,
                status: VisibilityStatus.Draft,
                currentEvent: null,
                currentCategoryId: 7,
                fallbackBackgroundImage: null,
            }),
        ).toEqual({
            title: 'Event title',
            description: 'Event description',
            additionalDescription: 'Additional description',
            resource: 'Ukrainian resource',
            resourceEn: 'English resource',
            publishedAt: '2026-10-07T00:00:00.000Z',
            status: VisibilityStatus.Draft,
            previewImageId: null,
            backgroundImageId: null,
            categoryId: 7,
            localizations: [
                {
                    languageId: 1,
                    title: 'Event title',
                    description: 'Event description',
                    additionalDescription: 'Additional description',
                },
            ],
        });
    });

    it('preserves the event category and non-Ukrainian localizations when editing', () => {
        const currentEvent = {
            id: 1,
            resource: '',
            resourceEn: '',
            publishedAt: '2026-10-07T00:00:00.000Z',
            title: 'Previous title',
            description: 'Previous description',
            additionalDescription: null,
            status: VisibilityStatus.Draft,
            previewImage: { id: 14, url: 'https://example.com/preview.png', mimeType: 'image/png' },
            backgroundImage: { id: 15, url: 'https://example.com/background.png', mimeType: 'image/png' },
            priority: 1,
            category: { id: 7 },
            localizations: [
                {
                    language: { id: 1 },
                    title: 'Previous title',
                    description: 'Previous description',
                    additionalDescription: null,
                },
                {
                    language: { id: 2 },
                    title: 'English title',
                    description: 'English description',
                    additionalDescription: 'English additional description',
                },
            ],
        } satisfies EventDetailsDto;

        const request = mapEventFormValuesToCreateUpdateRequest({
            formValues,
            status: VisibilityStatus.Published,
            currentEvent,
            currentCategoryId: 7,
            fallbackBackgroundImage: null,
        });

        expect(request.categoryId).toBe(7);
        expect(request.backgroundImageId).toBe(15);
        expect(request.localizations).toEqual([
            {
                languageId: 1,
                title: 'Event title',
                description: 'Event description',
                additionalDescription: 'Additional description',
            },
            {
                languageId: 2,
                title: 'English title',
                description: 'English description',
                additionalDescription: 'English additional description',
            },
        ]);
    });

    it('returns an image identifier only for persisted images', () => {
        expect(getEventImageId({ id: 14, url: 'https://example.com/image.png', mimeType: 'image/png' })).toBe(14);
        expect(getEventImageId({ base64: 'image-data', mimeType: 'image/png' })).toBeNull();
        expect(getEventImageId(null)).toBeNull();
    });
});
