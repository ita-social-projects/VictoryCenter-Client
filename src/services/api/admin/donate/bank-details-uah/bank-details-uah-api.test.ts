import { AxiosInstance } from 'axios';
import { BankDetailsUahApi } from './bank-details-uah-api';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { UahBankDetailsType } from '../../../../../types/admin/donate';

describe('BankDetailsUahApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    const mockUahBankDetails: UahBankDetailsType = {
        id: 1,
        name: 'ПриватБанк',
        receiver: 'ТОВ "Тест"',
        ukrainianIban: '1234567890123456789012345678',
        edrpou: '12345678',
        paymentPurpose: 'Благодійна допомога',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('calls client.get with correct parameters', async () => {
            const mockResponse = {
                data: [mockUahBankDetails, { ...mockUahBankDetails, id: 2, name: 'Монобанк' }],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await BankDetailsUahApi.getAll(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_UAH);
            expect(result).toEqual(mockResponse.data);
        });

        it('returns empty array when no bank details exist', async () => {
            mockClient.get.mockResolvedValue({ data: [] });

            const result = await BankDetailsUahApi.getAll(mockClient);

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        const bankDetailsWithoutId: Omit<UahBankDetailsType, 'id'> = {
            name: 'Новий банк',
            receiver: 'ТОВ "Новий"',
            ukrainianIban: '1111222233334444555566667777',
            edrpou: '11112222',
            paymentPurpose: 'Благодійність',
        };

        it('calls client.post with correct payload', async () => {
            const mockResponse = { data: { id: 10, ...bankDetailsWithoutId } };
            mockClient.post.mockResolvedValue(mockResponse);

            const result = await BankDetailsUahApi.create(mockClient, bankDetailsWithoutId);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_UAH, bankDetailsWithoutId);
            expect(result).toEqual(mockResponse.data);
        });

        it('creates bank details without id in request', async () => {
            const mockResponse = { data: { id: 15, ...bankDetailsWithoutId } };
            mockClient.post.mockResolvedValue(mockResponse);

            const result = await BankDetailsUahApi.create(mockClient, bankDetailsWithoutId);

            expect(result.id).toBe(15);
        });
    });

    describe('update', () => {
        const testCases = [
            {
                description: 'updates with multiple fields',
                id: 5,
                updates: { name: 'Оновлений банк', paymentPurpose: 'Оновлена мета' },
            },
            {
                description: 'updates with id 1',
                id: 1,
                updates: { name: 'Перший оновлений' },
            },
            {
                description: 'updates with large id',
                id: 9999,
                updates: { receiver: 'ТОВ "Великий"', edrpou: '44445555' },
            },
            {
                description: 'updates only specific fields',
                id: 7,
                updates: { receiver: 'Новий отримувач' },
            },
        ];

        testCases.forEach(({ description, id, updates }) => {
            // eslint-disable-next-line jest/valid-title
            it(description, async () => {
                const mockResponse = { data: { ...mockUahBankDetails, id, ...updates } };
                mockClient.put.mockResolvedValue(mockResponse);

                const result = await BankDetailsUahApi.update(mockClient, id, updates);

                expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/${id}`, updates);
                expect(result.id).toBe(id);
            });
        });
    });

    describe('delete', () => {
        const testCases = [42, 1, 8888, 100];

        testCases.forEach((id) => {
            it(`deletes bank details with id ${id}`, async () => {
                mockClient.delete.mockResolvedValue({});

                const result = await BankDetailsUahApi.delete(mockClient, id);

                expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/${id}`);
                expect(result).toBeUndefined();
            });
        });
    });
});
