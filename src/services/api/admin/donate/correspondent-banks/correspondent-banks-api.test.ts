import { AxiosInstance } from 'axios';
import { CorrespondentBankDetailsApi } from './correspondent-banks-api';
import { API_ROUTES } from '@const/common/api-routes/main-api';

describe('CorrespondentBankDetailsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('calls client.post with correct payload', async () => {
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Correspondent Bank',
                    swift: 'ABCDEF12',
                    account: '123456789',
                    iban: 'UA123456789012345678901234567',
                    foreignBankDetailsId: 10,
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'Correspondent Bank',
                swift: 'ABCDEF12',
                account: '123456789',
                iban: 'UA123456789012345678901234567',
                foreignBankDetailsId: 10,
            };

            const result = await CorrespondentBankDetailsApi.create(mockClient, bankDetails);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS, bankDetails);
            expect(result).toEqual(mockResponse.data);
        });

        it('creates correspondent bank without iban', async () => {
            const mockResponse = {
                data: {
                    id: 2,
                    name: 'Bank Without IBAN',
                    swift: 'XYZABC99',
                    account: '987654321',
                    foreignBankDetailsId: 20,
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'Bank Without IBAN',
                swift: 'XYZABC99',
                account: '987654321',
                foreignBankDetailsId: 20,
            };

            const result = await CorrespondentBankDetailsApi.create(mockClient, bankDetails);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS, bankDetails);
            expect(result.foreignIban).toBeUndefined();
        });
    });

    describe('update', () => {
        it('calls client.put with correct URL and payload', async () => {
            const mockResponse = {
                data: {
                    id: 5,
                    name: 'Updated Bank',
                    swift: 'UPDATED11',
                    account: '111111111',
                    foreignBankDetailsId: 15,
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'Updated Bank',
                swift: 'UPDATED11',
                account: '111111111',
                foreignBankDetailsId: 15,
            };

            const result = await CorrespondentBankDetailsApi.update(mockClient, 5, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/5`,
                bankDetails,
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('updates correspondent bank with large id', async () => {
            const mockResponse = {
                data: {
                    id: 9999,
                    name: 'Large ID Bank',
                    swift: 'LARGE999',
                    account: '999999999',
                    foreignBankDetailsId: 100,
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'Large ID Bank',
                swift: 'LARGE999',
                account: '999999999',
                foreignBankDetailsId: 100,
            };

            const result = await CorrespondentBankDetailsApi.update(mockClient, 9999, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/9999`,
                bankDetails,
            );
            expect(result.id).toBe(9999);
        });
    });

    describe('delete', () => {
        it('calls client.delete with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await CorrespondentBankDetailsApi.delete(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/42`);
        });

        it('deletes correspondent bank with id 1', async () => {
            mockClient.delete.mockResolvedValue({});

            await CorrespondentBankDetailsApi.delete(mockClient, 1);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/1`);
        });

        it('deletes correspondent bank with large id', async () => {
            mockClient.delete.mockResolvedValue({});

            await CorrespondentBankDetailsApi.delete(mockClient, 8888);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/8888`);
        });

        it('returns void on successful delete', async () => {
            mockClient.delete.mockResolvedValue({});

            const result = await CorrespondentBankDetailsApi.delete(mockClient, 100);

            expect(result).toBeUndefined();
        });
    });
});
