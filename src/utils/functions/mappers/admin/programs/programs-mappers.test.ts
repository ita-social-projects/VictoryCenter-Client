import { mapHippotherapyProgramDtoToModel } from './programs-mappers';
import { VisibilityStatus } from '@/types/admin/common';
import { HippotherapyProgramDto } from '@/types/admin/programs';
import { TranslationStatus } from '@/types/common/language';

describe('mapHippotherapyProgramDtoToModel', () => {
    const createMockDto = (overrides: Partial<HippotherapyProgramDto> = {}): HippotherapyProgramDto => ({
        id: 10,
        name: 'Adaptive Riding',
        description: 'Program description',
        categories: [{ id: 1, name: 'Rehabilitation', programsCount: 5 }],
        status: VisibilityStatus.Published,
        previewImage: { id: 11, url: '/preview.jpg', mimeType: 'image/jpeg' },
        backgroundImage: { id: 12, url: '/man-facing-horse-forehead.jpg', mimeType: 'image/jpeg' },
        location: 'Stable A',
        participantsCount: '8',
        meetingsCount: '12',
        sections: [],
        slug: 'adaptive-riding',
        localizations: [],
        ...overrides,
    });

    it('maps dto to model with transformed localizations', () => {
        const dto = createMockDto({
            localizations: [
                {
                    entityId: 10,
                    localizationInfoDto: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                    name: 'Name EN',
                    description: 'Desc EN',
                    location: 'Loc EN',
                    participantsCount: '8 EN',
                    meetingsCount: '12 EN',
                },
            ],
        });

        const result = mapHippotherapyProgramDtoToModel(dto);

        expect(result.localizations[0]).toEqual({
            entityId: 10,
            translationStatus: TranslationStatus.Relevant,
            language: { id: 2, code: 'en' },
            name: 'Name EN',
            description: 'Desc EN',
            location: 'Loc EN',
            participantsCount: '8 EN',
            meetingsCount: '12 EN',
        });

        expect(result).toMatchObject({
            id: dto.id,
            name: dto.name,
            slug: dto.slug,
        });
    });

    it('returns empty localizations array when dto localizations are empty', () => {
        const dto = createMockDto({ localizations: [] });
        const result = mapHippotherapyProgramDtoToModel(dto);
        expect(result.localizations).toEqual([]);
    });
});
