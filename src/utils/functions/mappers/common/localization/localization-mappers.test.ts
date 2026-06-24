import {
    getLocalizationLanguageCode,
    getLocalizationLanguageId,
    mapLocalizationDtoToModel,
    mapEntityWithLocalizations,
    resolveLocaleCode,
} from './localization-mappers';
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

describe('localization language helpers', () => {
    it('resolves language id from direct, domain, and dto-shaped sources', () => {
        expect(getLocalizationLanguageId({ languageId: 2 })).toBe(2);
        expect(getLocalizationLanguageId({ language: { id: 3, code: 'en' } })).toBe(3);
        expect(getLocalizationLanguageId({ localizationInfoDto: { id: 4, code: 'en' } })).toBe(4);
    });

    it('prefers direct language id before domain and dto sources', () => {
        expect(
            getLocalizationLanguageId({
                languageId: 2,
                language: { id: 3, code: 'en' },
                localizationInfoDto: { id: 4, code: 'en' },
            }),
        ).toBe(2);
    });

    it('resolves language code from domain, dto-shaped, and direct sources', () => {
        expect(getLocalizationLanguageCode({ language: { id: 2, code: 'en' } })).toBe('en');
        expect(getLocalizationLanguageCode({ localizationInfoDto: { id: 1, code: 'uk' } })).toBe('uk');
        expect(getLocalizationLanguageCode({ code: 'en' })).toBe('en');
    });

    it('prefers direct language code before domain and dto sources', () => {
        expect(
            getLocalizationLanguageCode({
                code: 'en',
                language: { id: 1, code: 'uk' },
                localizationInfoDto: { id: 1, code: 'uk' },
            }),
        ).toBe('en');
    });

    it('uses language id and provided languages as resolveLocaleCode fallback', () => {
        expect(
            resolveLocaleCode({ localizationInfoDto: { id: 2 } }, [
                { id: 1, code: 'uk', name: 'Ukrainian' },
                { id: 2, code: 'en', name: 'English' },
            ]),
        ).toBe('en');
    });

    it('keeps direct language code priority before id-based language fallback', () => {
        expect(
            resolveLocaleCode(
                {
                    languageId: 2,
                    language: { id: 1, code: 'uk' },
                    localizationInfoDto: { id: 2, code: 'en' },
                },
                [
                    { id: 1, code: 'uk', name: 'Ukrainian' },
                    { id: 2, code: 'en', name: 'English' },
                ],
            ),
        ).toBe('uk');
    });
});
