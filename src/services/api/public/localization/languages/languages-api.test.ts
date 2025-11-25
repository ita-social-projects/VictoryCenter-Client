import { localizationLanguagesDataFetch } from './languages-api';
import { axiosInstance } from '../../../axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { LocalizationLanguage } from '../../../../../types/common/language';

jest.mock('../../../axios', () => ({
    axiosInstance: {
        get: jest.fn(),
    },
}));

describe('localizationLanguagesDataFetch', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch localization languages and return data', async () => {
        const mockLanguages: LocalizationLanguage[] = [
            { id: 1, code: 'ua', name: 'Українська' },
            { id: 2, code: 'en', name: 'Англійська' },
        ];

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: mockLanguages });

        const result = await localizationLanguagesDataFetch();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);
        expect(result).toEqual(mockLanguages);
    });

    it('should return empty array when api returns empty response', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [] });

        const result = await localizationLanguagesDataFetch();

        expect(result).toEqual([]);
    });

    it('should throw error when axios request fails', async () => {
        const error = new Error('Network failure');

        (axiosInstance.get as jest.Mock).mockRejectedValueOnce(error);

        await expect(localizationLanguagesDataFetch()).rejects.toThrow('Network failure');
    });
});
