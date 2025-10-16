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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('calls client.get with correct parameters', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 1,
                        name: 'ПриватБанк',
                        receiver: 'ТОВ "Тест"',
                        iban: '1234567890123456789012345678',
                        edrpou: '12345678',
                        paymentPurpose: 'Благодійна допомога',
                    },
                    {
                        id: 2,
                        name: 'Монобанк',
                        receiver: 'ФОП Іванов',
                        iban: '9876543210987654321098765432',
                        edrpou: '87654321',
                        paymentPurpose: 'Допомога ЗСУ',
                    },
                ],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await BankDetailsUahApi.getAll(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_UAH);
            expect(result).toEqual(mockResponse.data);
        });

        it('returns empty array when no bank details exist', async () => {
            const mockResponse = {
                data: [],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await BankDetailsUahApi.getAll(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_UAH);
            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('calls client.post with correct payload', async () => {
            const mockResponse = {
                data: {
                    id: 10,
                    name: 'Новий банк',
                    receiver: 'ТОВ "Новий"',
                    iban: '1111222233334444555566667777',
                    edrpou: '11112222',
                    paymentPurpose: 'Благодійність',
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const bankDetails: Omit<UahBankDetailsType, 'id'> = {
                name: 'Новий банк',
                receiver: 'ТОВ "Новий"',
                iban: '1111222233334444555566667777',
                edrpou: '11112222',
                paymentPurpose: 'Благодійність',
            };

            const result = await BankDetailsUahApi.create(mockClient, bankDetails);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_UAH, bankDetails);
            expect(result).toEqual(mockResponse.data);
        });

        it('creates bank details without id in request', async () => {
            const mockResponse = {
                data: {
                    id: 15,
                    name: 'Тестовий банк',
                    receiver: 'Тест',
                    iban: '5555666677778888999900001111',
                    edrpou: '55556666',
                    paymentPurpose: 'Тест',
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const bankDetails: Omit<UahBankDetailsType, 'id'> = {
                name: 'Тестовий банк',
                receiver: 'Тест',
                iban: '5555666677778888999900001111',
                edrpou: '55556666',
                paymentPurpose: 'Тест',
            };

            const result = await BankDetailsUahApi.create(mockClient, bankDetails);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_UAH, bankDetails);
            expect(result.id).toBe(15);
        });
    });

    describe('update', () => {
        it('calls client.put with correct URL and payload', async () => {
            const mockResponse = {
                data: {
                    id: 5,
                    name: 'Оновлений банк',
                    receiver: 'ТОВ "Оновлений"',
                    iban: '2222333344445555666677778888',
                    edrpou: '22223333',
                    paymentPurpose: 'Оновлена мета',
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails: Partial<UahBankDetailsType> = {
                name: 'Оновлений банк',
                paymentPurpose: 'Оновлена мета',
            };

            const result = await BankDetailsUahApi.update(mockClient, 5, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/5`, bankDetails);
            expect(result).toEqual(mockResponse.data);
        });

        it('updates bank details with id 1', async () => {
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Перший оновлений',
                    receiver: 'ТОВ "Перший"',
                    iban: '3333444455556666777788889999',
                    edrpou: '33334444',
                    paymentPurpose: 'Перша мета',
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails: Partial<UahBankDetailsType> = {
                name: 'Перший оновлений',
            };

            const result = await BankDetailsUahApi.update(mockClient, 1, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/1`, bankDetails);
            expect(result.id).toBe(1);
        });

        it('updates bank details with large id', async () => {
            const mockResponse = {
                data: {
                    id: 9999,
                    name: 'Великий ID',
                    receiver: 'ТОВ "Великий"',
                    iban: '4444555566667777888899990000',
                    edrpou: '44445555',
                    paymentPurpose: 'Велика мета',
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails: Partial<UahBankDetailsType> = {
                receiver: 'ТОВ "Великий"',
                edrpou: '44445555',
            };

            const result = await BankDetailsUahApi.update(mockClient, 9999, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/9999`, bankDetails);
            expect(result.id).toBe(9999);
        });

        it('updates only specific fields', async () => {
            const mockResponse = {
                data: {
                    id: 7,
                    name: 'Стара назва',
                    receiver: 'Новий отримувач',
                    iban: '5555666677778888999900001111',
                    edrpou: '55556666',
                    paymentPurpose: 'Стара мета',
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails: Partial<UahBankDetailsType> = {
                receiver: 'Новий отримувач',
            };

            const result = await BankDetailsUahApi.update(mockClient, 7, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/7`, bankDetails);
            expect(result.receiver).toBe('Новий отримувач');
        });
    });

    describe('delete', () => {
        it('calls client.delete with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await BankDetailsUahApi.delete(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/42`);
        });

        it('deletes bank details with id 1', async () => {
            mockClient.delete.mockResolvedValue({});

            await BankDetailsUahApi.delete(mockClient, 1);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/1`);
        });

        it('deletes bank details with large id', async () => {
            mockClient.delete.mockResolvedValue({});

            await BankDetailsUahApi.delete(mockClient, 8888);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/8888`);
        });

        it('returns void on successful delete', async () => {
            mockClient.delete.mockResolvedValue({});

            const result = await BankDetailsUahApi.delete(mockClient, 100);

            expect(result).toBeUndefined();
        });
    });
});
