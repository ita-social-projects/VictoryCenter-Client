import { mapHippotherapyProgramDtoToModel } from './programs-mappers';
import { VisibilityStatus } from '@/types/admin/common';
import { HippotherapyProgramDto } from '@/types/admin/programs';
import { TranslationStatus } from '@/types/common/language';

describe('mapHippotherapyProgramDtoToModel', () => {
    it('maps dto to model with transformed localizations', () => {
        const dto: HippotherapyProgramDto = {
            id: 10,
            name: 'Adaptive Riding',
            description: 'Program description',
            categories: [
                { id: 1, name: 'Rehabilitation', programsCount: 5 },
                { id: 2, name: 'Therapy', programsCount: 4 },
            ],
            status: VisibilityStatus.Published,
            previewImage: { id: 11, url: '/preview.jpg', mimeType: 'image/jpeg' },
            backgroundImage: { id: 12, url: '/background.jpg', mimeType: 'image/jpeg' },
            location: 'Stable A',
            participantsCount: '8',
            meetingsCount: '12',
            sections: [],
            slug: 'adaptive-riding',
            localizations: [
                {
                    entityId: 10,
                    localizationInfoDto: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    name: 'Adaptive Riding EN',
                    description: 'Program description EN',
                    location: 'Stable A EN',
                    participantsCount: '8 EN',
                    meetingsCount: '12 EN',
                },
            ],
        };

        const result = mapHippotherapyProgramDtoToModel(dto);

        expect(result).toEqual({
            id: 10,
            name: 'Adaptive Riding',
            description: 'Program description',
            categories: [
                { id: 1, name: 'Rehabilitation', programsCount: 5 },
                { id: 2, name: 'Therapy', programsCount: 4 },
            ],
            status: VisibilityStatus.Published,
            previewImage: { id: 11, url: '/preview.jpg', mimeType: 'image/jpeg' },
            backgroundImage: { id: 12, url: '/background.jpg', mimeType: 'image/jpeg' },
            location: 'Stable A',
            participantsCount: '8',
            meetingsCount: '12',
            sections: [],
            slug: 'adaptive-riding',
            localizations: [
                {
                    entityId: 10,
                    translationStatus: TranslationStatus.Relevant,
                    language: { id: 2, code: 'en' },
                    name: 'Adaptive Riding EN',
                    description: 'Program description EN',
                    location: 'Stable A EN',
                    participantsCount: '8 EN',
                    meetingsCount: '12 EN',
                },
            ],
        });
    });

    it('returns empty localizations array when dto localizations are empty', () => {
        const dto: HippotherapyProgramDto = {
            id: 11,
            name: 'Horse Care',
            description: 'Care description',
            categories: [],
            status: VisibilityStatus.Draft,
            previewImage: null,
            backgroundImage: null,
            location: '',
            participantsCount: '',
            meetingsCount: '',
            sections: [],
            slug: 'horse-care',
            localizations: [],
        };

        const result = mapHippotherapyProgramDtoToModel(dto);

        expect(result.localizations).toEqual([]);
    });
});
