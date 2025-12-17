import { mapLocalizationDtoToModel, mapEntityWithLocalizations } from './localization-mappers';
import { EntityLocalizationDto, EntityWithDtoLocalizations } from '../../../../../types/common/language';
import { TranslationStatus } from '../../../../../types/common/language';

describe('mapLocalizationDtoToModel', () => {
    it('maps localizationInfoDto to language and keeps other fields', () => {
        const dto: EntityLocalizationDto = {
            localizationInfoDto: {
                id: 1,
                code: 'en',
            },
            translationStatus: TranslationStatus.Relevant,
        };

        const result = mapLocalizationDtoToModel(dto);

        expect(result).toEqual({
            language: {
                id: 1,
                code: 'en',
            },
            translationStatus: TranslationStatus.Relevant,
        });

        expect((result as any).localizationInfoDto).toBeUndefined();
    });
});

describe('mapEntityWithLocalizations', () => {
    it('maps entity with localization DTOs to model structure', () => {
        const dto: EntityWithDtoLocalizations<EntityLocalizationDto> & { id: number } = {
            id: 100,
            localizations: [
                {
                    localizationInfoDto: { id: 1, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                },
                {
                    localizationInfoDto: { id: 2, code: 'es' },
                    translationStatus: TranslationStatus.Outdated,
                },
            ],
        };

        const result = mapEntityWithLocalizations(dto);

        expect(result).toEqual({
            id: 100,
            localizations: [
                {
                    language: { id: 1, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                },
                {
                    language: { id: 2, code: 'es' },
                    translationStatus: TranslationStatus.Outdated,
                },
            ],
        });
    });

    it('returns empty localization array when dto.localizations is empty', () => {
        const dto: EntityWithDtoLocalizations<EntityLocalizationDto> & { id: number } = {
            id: 200,
            localizations: [],
        };

        const result = mapEntityWithLocalizations(dto);

        expect(result.localizations).toEqual([]);
    });

    it('preserves other entity fields', () => {
        const dto: EntityWithDtoLocalizations<EntityLocalizationDto> & {
            id: number;
            name: string;
            isActive: boolean;
        } = {
            id: 300,
            name: 'Test Entity',
            isActive: true,
            localizations: [],
        };

        const result = mapEntityWithLocalizations(dto);

        expect(result.id).toBe(300);
        expect(result.name).toBe('Test Entity');
        expect(result.isActive).toBe(true);
    });
});
