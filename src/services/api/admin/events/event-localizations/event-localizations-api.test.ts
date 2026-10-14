import { AxiosInstance } from 'axios';
import { EventLocalizationsApi } from './event-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateEventLocalizationDto, EventLocalizationDto, UpdateEventLocalizationDto } from '@/types/admin/events';
import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

describe('EventLocalizationsApi.create', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.post with correct url and payload and return response data', async () => {
        const mockClient = {
            post: jest.fn(),
        };

        const payload: CreateEventLocalizationDto = {
            entityId: 1,
            languageId: 2,
            title: 'English Title',
            description: 'English description',
            additionalDescription: 'Short text',
        };

        const mockResponseData: EventLocalizationDto = {
            entityId: 1,
            title: 'English Title',
            description: 'English description',
            additionalDescription: 'Short text',
            localizationInfoDto: {
                id: 2,
                code: 'en',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.post.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await EventLocalizationsApi.create(mockClient as unknown as AxiosInstance, payload);

        expect(mockClient.post).toHaveBeenCalledTimes(1);
        expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.EVENT_LOCALIZATIONS.BASE, payload);
        expect(result).toEqual(mockResponseData);
    });
});

describe('EventLocalizationsApi.update', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call client.put with correct url and payload and return response data', async () => {
        const mockClient = {
            put: jest.fn(),
        };

        const entityId = 1;
        const languageId = 2;

        const payload: UpdateEventLocalizationDto = {
            title: 'Updated English Title',
            description: 'Updated English description',
            additionalDescription: null,
        };

        const mockResponseData: EventLocalizationDto = {
            entityId,
            title: 'Updated English Title',
            description: 'Updated English description',
            additionalDescription: null,
            localizationInfoDto: {
                id: languageId,
                code: 'en',
            } as LocalizationInfo,
            translationStatus: TranslationStatus.Relevant,
        };

        mockClient.put.mockResolvedValueOnce({
            data: mockResponseData,
        });

        const result = await EventLocalizationsApi.update(
            mockClient as unknown as AxiosInstance,
            entityId,
            languageId,
            payload,
        );

        expect(mockClient.put).toHaveBeenCalledTimes(1);
        expect(mockClient.put).toHaveBeenCalledWith(
            `${API_ROUTES.EVENT_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toEqual(mockResponseData);
    });
});
