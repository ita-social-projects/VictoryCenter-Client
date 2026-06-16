import { mapHistorySectionContentDtoToModel, mapHistorySectionDtoToModel } from './history-mappers';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { HistorySectionContentDto, HistorySectionDto } from '@/types/common/history-sections';

// Мокаємо зовнішній мапер для локалізацій
jest.mock('@/utils/functions/mappers/common/localization/localization-mappers', () => ({
    mapLocalizationDtoToModel: jest.fn(),
}));

describe('History Sections Mappers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('mapHistorySectionContentDtoToModel', () => {
        it('should correctly map HistorySectionContentDto to HistorySectionContent', () => {
            // Arrange
            const mockLocalizationDto = {
                id: 'loc-1',
                language: 'en',
                title: 'Translated Title',
            } as any; // Використовуємо as any для спрощення або вказуємо точний тип

            const mockDto: HistorySectionContentDto = {
                id: 'content-1',
                sectionId: 'section-1',
                contentType: 'text',
                order: 1,
                title: 'Original Title',
                description: 'Original Description',
                image: 'image-url.png',
                imageId: 'img-id-123',
                localizations: [mockLocalizationDto],
            } as any;

            const mockMappedLocalization = {
                id: 'loc-1',
                language: 'en',
                title: 'Translated Title',
                // ... інші поля моделі
            };

            // Задаємо значення, яке буде повертати мок
            (mapLocalizationDtoToModel as jest.Mock).mockReturnValue(mockMappedLocalization);

            // Act
            const result = mapHistorySectionContentDtoToModel(mockDto);

            // Assert
            expect(result).toEqual({
                id: 'content-1',
                sectionId: 'section-1',
                contentType: 'text',
                order: 1,
                title: 'Original Title',
                description: 'Original Description',
                image: 'image-url.png',
                imageId: 'img-id-123',
                localizations: [mockMappedLocalization],
            });

            // Перевіряємо, чи був викликаний зовнішній мапер з правильними аргументами
            expect(mapLocalizationDtoToModel).toHaveBeenCalledTimes(1);
            expect(mapLocalizationDtoToModel).toHaveBeenCalledWith(mockLocalizationDto);
        });

        it('should handle empty localizations array', () => {
            // Arrange
            const mockDto: HistorySectionContentDto = {
                id: 'content-2',
                sectionId: 'section-1',
                contentType: 'image',
                order: 2,
                title: 'Image Title',
                description: 'Image Description',
                image: 'image2.png',
                imageId: 'img-id-456',
                localizations: [],
            } as any;

            // Act
            const result = mapHistorySectionContentDtoToModel(mockDto);

            // Assert
            expect(result.localizations).toEqual([]);
            expect(mapLocalizationDtoToModel).not.toHaveBeenCalled();
        });
    });

    describe('mapHistorySectionDtoToModel', () => {
        it('should correctly map HistorySectionDto to HistorySection', () => {
            // Arrange
            const mockContentDto: HistorySectionContentDto = {
                id: 'content-1',
                sectionId: 'section-1',
                contentType: 'text',
                order: 1,
                title: 'Title',
                description: 'Desc',
                image: null,
                imageId: null,
                localizations: [],
            } as any;

            const mockDto: HistorySectionDto = {
                id: 'section-1',
                programId: 'prog-1',
                template: 'template-A',
                order: 5,
                contents: [mockContentDto],
            } as any;

            // Act
            const result = mapHistorySectionDtoToModel(mockDto);

            // Assert
            expect(result).toEqual({
                id: 'section-1',
                programId: 'prog-1',
                template: 'template-A',
                order: 5,
                contents: [
                    {
                        id: 'content-1',
                        sectionId: 'section-1',
                        contentType: 'text',
                        order: 1,
                        title: 'Title',
                        description: 'Desc',
                        image: null,
                        imageId: null,
                        localizations: [],
                    },
                ],
            });
        });

        it('should handle empty contents array', () => {
            // Arrange
            const mockDto: HistorySectionDto = {
                id: 'section-2',
                programId: 'prog-1',
                template: 'template-B',
                order: 6,
                contents: [],
            } as any;

            // Act
            const result = mapHistorySectionDtoToModel(mockDto);

            // Assert
            expect(result.contents).toEqual([]);
        });
    });
});
