import {
    mapToCreateUahBankDetails,
    mapToUpdateUahBankDetails,
    mapToCreateForeignBankDetails,
    mapToUpdateForeignBankDetails,
    mapToCreateCorrespondentBankDetails,
    mapToUpdateCorrespondentBankDetails,
} from './donate-mappers';
import {
    UahBankDetailsDto,
    ForeignBankDetailsDto,
    CorrespondentBankDetailsDto,
    BankCurrency,
} from '../../../../types/admin/donate';

describe('UAH Bank Details Mappers', () => {
    describe('mapToCreateUahBankDetails', () => {
        it('maps dto to create model by removing id', () => {
            const dto: UahBankDetailsDto = {
                id: 1,
                name: 'Test Bank',
                receiver: 'John Doe',
                edrpou: '12345678',
                ukrainianIban: 'UA123456789012345678901234567',
                paymentPurpose: 'Donation',
            };

            const result = mapToCreateUahBankDetails(dto);

            expect(result).toEqual({
                name: 'Test Bank',
                receiver: 'John Doe',
                edrpou: '12345678',
                ukrainianIban: 'UA123456789012345678901234567',
                paymentPurpose: 'Donation',
            });
            expect(result).not.toHaveProperty('id');
        });

        it('preserves all fields except id', () => {
            const dto: UahBankDetailsDto = {
                id: 999,
                name: 'Another Bank',
                receiver: 'Jane Smith',
                edrpou: '87654321',
                ukrainianIban: 'UA987654321098765432109876543',
                paymentPurpose: 'Support',
            };

            const result = mapToCreateUahBankDetails(dto);

            expect(Object.keys(result)).toEqual(['name', 'receiver', 'edrpou', 'ukrainianIban', 'paymentPurpose']);
        });
    });

    describe('mapToUpdateUahBankDetails', () => {
        it('maps dto to update model by removing id', () => {
            const dto: UahBankDetailsDto = {
                id: 5,
                name: 'Updated Bank',
                receiver: 'Updated Receiver',
                edrpou: '11223344',
                ukrainianIban: 'UA111222333444555666777888999',
                paymentPurpose: 'Updated Purpose',
            };

            const result = mapToUpdateUahBankDetails(dto);

            expect(result).toEqual({
                name: 'Updated Bank',
                receiver: 'Updated Receiver',
                edrpou: '11223344',
                ukrainianIban: 'UA111222333444555666777888999',
                paymentPurpose: 'Updated Purpose',
            });
            expect(result).not.toHaveProperty('id');
        });
    });
});

describe('Foreign Bank Details Mappers', () => {
    describe('mapToCreateForeignBankDetails', () => {
        it('maps dto to create model by removing id and transforming correspondentBanks', () => {
            const dto: ForeignBankDetailsDto = {
                id: 1,
                name: 'Foreign Bank',
                receiver: 'International Corp',
                ukrainianIban: 'UA123456789012345678901234567',
                swift: 'ABCDEFGH',
                address: '123 Main St',
                currency: BankCurrency.Usd,
                correspondentBanks: [
                    {
                        id: 10,
                        name: 'Correspondent Bank',
                        swift: 'CORRSWFT',
                        account: '123456',
                        foreignBankDetailsId: 1,
                    },
                ],
            };

            const result = mapToCreateForeignBankDetails(dto);

            expect(result).toEqual({
                name: 'Foreign Bank',
                receiver: 'International Corp',
                ukrainianIban: 'UA123456789012345678901234567',
                swift: 'ABCDEFGH',
                address: '123 Main St',
                currency: BankCurrency.Usd,
                correspondentBanks: [
                    {
                        name: 'Correspondent Bank',
                        swift: 'CORRSWFT',
                        account: '123456',
                    },
                ],
            });

            expect(result).not.toHaveProperty('id');
            expect(result.correspondentBanks).toBeDefined();
            result.correspondentBanks!.forEach((bank) => {
                expect(bank).not.toHaveProperty('id');
                expect(bank).not.toHaveProperty('foreignBankDetailsId');
            });
        });

        it('handles empty correspondentBanks array', () => {
            const dto: ForeignBankDetailsDto = {
                id: 2,
                name: 'Bank EUR',
                receiver: 'EU Receiver',
                ukrainianIban: 'UA987654321098765432109876543',
                swift: 'EURSWIFT',
                address: '456 Euro St',
                currency: BankCurrency.Eur,
                correspondentBanks: [],
            };

            const result = mapToCreateForeignBankDetails(dto);

            expect(result).toEqual({
                name: 'Bank EUR',
                receiver: 'EU Receiver',
                ukrainianIban: 'UA987654321098765432109876543',
                swift: 'EURSWIFT',
                address: '456 Euro St',
                currency: BankCurrency.Eur,
                correspondentBanks: [],
            });

            expect(result).not.toHaveProperty('id');
            expect(result.correspondentBanks).toEqual([]);
        });
    });

    describe('mapToUpdateForeignBankDetails', () => {
        it('maps dto to update model by removing id, correspondentBanks, and currency', () => {
            const dto: ForeignBankDetailsDto = {
                id: 3,
                name: 'Updated Foreign Bank',
                receiver: 'Updated Corp',
                ukrainianIban: 'UA111222333444555666777888999',
                swift: 'UPDSWIFT',
                address: '789 Update Rd',
                currency: BankCurrency.Usd,
                correspondentBanks: [],
            };

            const result = mapToUpdateForeignBankDetails(dto);

            expect(result).toEqual({
                name: 'Updated Foreign Bank',
                receiver: 'Updated Corp',
                ukrainianIban: 'UA111222333444555666777888999',
                swift: 'UPDSWIFT',
                address: '789 Update Rd',
            });
            expect(result).not.toHaveProperty('id');
            expect(result).not.toHaveProperty('correspondentBanks');
            expect(result).not.toHaveProperty('currency');
        });

        it('preserves only allowed update fields', () => {
            const dto: ForeignBankDetailsDto = {
                id: 4,
                name: 'Test Bank',
                receiver: 'Test Receiver',
                ukrainianIban: 'UA000111222333444555666777888',
                swift: 'TESTSWFT',
                address: 'Test Address',
                currency: BankCurrency.Eur,
                correspondentBanks: [
                    {
                        id: 20,
                        name: 'Test Correspondent',
                        swift: 'TESTCORR',
                        account: '999888',
                        foreignBankDetailsId: 4,
                    },
                ],
            };

            const result = mapToUpdateForeignBankDetails(dto);

            expect(Object.keys(result)).toEqual(['name', 'receiver', 'ukrainianIban', 'swift', 'address']);
        });
    });
});

describe('Correspondent Bank Details Mappers', () => {
    describe('mapToCreateCorrespondentBankDetails', () => {
        it('maps dto to create model by removing id and adding foreignBankDetailsId', () => {
            const dto: CorrespondentBankDetailsDto = {
                id: 1,
                name: 'Correspondent Bank',
                swift: 'CORRSWFT',
                account: '123456',
                foreignIban: 'GB123456789012345678901234',
                foreignBankDetailsId: 99,
            };

            const result = mapToCreateCorrespondentBankDetails(dto, 42);

            expect(result).toEqual({
                name: 'Correspondent Bank',
                swift: 'CORRSWFT',
                account: '123456',
                foreignIban: 'GB123456789012345678901234',
                foreignBankDetailsId: 42,
            });
            expect(result).not.toHaveProperty('id');
        });

        it('uses provided foreignBankDetailsId parameter', () => {
            const dto: CorrespondentBankDetailsDto = {
                id: 2,
                name: 'Test Correspondent',
                swift: 'TESTSWFT',
                account: '654321',
                foreignBankDetailsId: 100,
            };

            const result = mapToCreateCorrespondentBankDetails(dto, 25);

            expect(result.foreignBankDetailsId).toBe(25);
        });

        it('handles optional foreignIban field', () => {
            const dtoWithoutIban: CorrespondentBankDetailsDto = {
                id: 3,
                name: 'No IBAN Bank',
                swift: 'NOIBANSW',
                account: '999888',
                foreignBankDetailsId: 50,
            };

            const result = mapToCreateCorrespondentBankDetails(dtoWithoutIban, 30);

            expect(result).toEqual({
                name: 'No IBAN Bank',
                swift: 'NOIBANSW',
                account: '999888',
                foreignBankDetailsId: 30,
            });
            expect(result).not.toHaveProperty('foreignIban');
        });
    });

    describe('mapToUpdateCorrespondentBankDetails', () => {
        it('maps dto to update model by removing id and foreignBankDetailsId', () => {
            const dto: CorrespondentBankDetailsDto = {
                id: 5,
                name: 'Updated Correspondent',
                swift: 'UPDTSWFT',
                account: '111222',
                foreignIban: 'FR333444555666777888999000111',
                foreignBankDetailsId: 10,
            };

            const result = mapToUpdateCorrespondentBankDetails(dto);

            expect(result).toEqual({
                name: 'Updated Correspondent',
                swift: 'UPDTSWFT',
                account: '111222',
                foreignIban: 'FR333444555666777888999000111',
            });
            expect(result).not.toHaveProperty('id');
            expect(result).not.toHaveProperty('foreignBankDetailsId');
        });

        it('preserves only allowed update fields', () => {
            const dto: CorrespondentBankDetailsDto = {
                id: 6,
                name: 'Bank Name',
                swift: 'SWIFT123',
                account: '789456',
                foreignBankDetailsId: 15,
            };

            const result = mapToUpdateCorrespondentBankDetails(dto);

            expect(Object.keys(result)).toEqual(['name', 'swift', 'account']);
        });

        it('includes optional foreignIban when present', () => {
            const dto: CorrespondentBankDetailsDto = {
                id: 7,
                name: 'IBAN Bank',
                swift: 'IBANSWFT',
                account: '123123',
                foreignIban: 'DE123456789012345678',
                foreignBankDetailsId: 20,
            };

            const result = mapToUpdateCorrespondentBankDetails(dto);

            expect(result.foreignIban).toBe('DE123456789012345678');
            expect(Object.keys(result)).toEqual(['name', 'swift', 'account', 'foreignIban']);
        });
    });
});
