import { mapEventCategoryDtoToModel } from './event-category-mapper';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

jest.mock('@/utils/functions/mappers/common/localization/localization-mappers', () => ({
    mapLocalizationDtoToModel: jest.fn(),
}));

const mockedMapLocalizationDtoToModel = mapLocalizationDtoToModel as jest.Mock;

describe('mapEventCategoryDtoToModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedMapLocalizationDtoToModel.mockImplementation((loc) => ({
            entityId: loc.entityId,
            language: loc.localizationInfoDto,
            name: loc.name,
            translationStatus: loc.translationStatus,
        }));
    });

    it('maps localizations containing localizationInfoDto using mapLocalizationDtoToModel', () => {
        const dto = {
            id: 1,
            name: 'Іпотерапія',
            relatedEventNewsCount: 1,
            localizations: [
                {
                    entityId: 1,
                    localizationInfoDto: { id: 2, code: 'en' },
                    name: 'hippotherapy',
                    translationStatus: 1,
                },
            ],
        };

        const result = mapEventCategoryDtoToModel(dto);

        expect(mapLocalizationDtoToModel).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            id: 1,
            name: 'Іпотерапія',
            relatedEventNewsCount: 1,
            localizations: [
                {
                    entityId: 1,
                    language: { id: 2, code: 'en' },
                    name: 'hippotherapy',
                    translationStatus: 1,
                },
            ],
        });
    });

    it('keeps localizations as-is when language property is already present', () => {
        const dto = {
            id: 1,
            name: 'Іпотерапія',
            relatedEventNewsCount: 1,
            localizations: [
                {
                    entityId: 1,
                    language: { id: 2, code: 'en' },
                    name: 'hippotherapy',
                    translationStatus: 1,
                },
            ],
        };

        const result = mapEventCategoryDtoToModel(dto);

        expect(mapLocalizationDtoToModel).not.toHaveBeenCalled();
        expect(result.localizations).toEqual(dto.localizations);
    });

    it('defaults relatedEventNewsCount to 0 and leaves localizations undefined when omitted', () => {
        const dto = {
            id: 2,
            name: 'Походи',
        };

        const result = mapEventCategoryDtoToModel(dto);

        expect(result).toEqual({
            id: 2,
            name: 'Походи',
            relatedEventNewsCount: 0,
        });
    });
});
