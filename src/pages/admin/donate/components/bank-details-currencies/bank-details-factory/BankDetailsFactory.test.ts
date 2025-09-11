import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { createBankDetailsForm, CorrespondentBankDetailsForm } from './BankDetailsFactory';
import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/bank-details-schema/bank-details-schema';

jest.mock('../../../../../../validation/admin/bank-details-schema/bank-details-schema', () => ({
    BANK_DETAILS_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(),
        validateReceiver: jest.fn(),
        validateEdrpou: jest.fn(),
        validateIban: jest.fn(),
        validatePaymentPurpose: jest.fn(),
        validateSwift: jest.fn(),
        validateAddress: jest.fn(),
    },
}));

describe('BankDetailsFactory', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const getTextareaByName = (name: string) => {
        const el = screen.getAllByRole('textbox').find((el) => el.getAttribute('name') === name);
        if (!el) throw new Error(`Textarea with name="${name}" not found`);
        return el;
    };

    const expectValidatorCalledWithEmpty = (name: string, validator: jest.Mock) => {
        fireEvent.blur(getTextareaByName(name));
        expect(validator).toHaveBeenCalledWith('');
    };

    const testFieldValidation = (fieldName: string, validator: jest.Mock, value: string) => {
        const input = getTextareaByName(fieldName);
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
        expect(validator).toHaveBeenCalledWith(value);
    };

    it('creates form for USD', () => {
        const Form = createBankDetailsForm('USD');
        expect(Form).toBeTruthy();
    });

    it('creates form for EUR', () => {
        const Form = createBankDetailsForm('EUR');
        expect(Form).toBeTruthy();
    });

    describe('UAH fields', () => {
        beforeEach(() => {
            // eslint-disable-next-line testing-library/no-render-in-setup
            render(
                React.createElement(createBankDetailsForm('UAH') as any, {
                    initialMode: 'create',
                    onSubmit: jest.fn(),
                    onClose: jest.fn(),
                }),
            );
        });

        it('renders all fields right', () => {
            ['name', 'receiver', 'edrpou', 'iban', 'paymentPurpose'].forEach((name) => {
                expect(getTextareaByName(name)).toBeInTheDocument();
            });
        });

        it('calls validators for all fields', () => {
            testFieldValidation('name', BANK_DETAILS_VALIDATION_FUNCTIONS.validateName as any, 'Test Name');
            testFieldValidation('receiver', BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver as any, 'Test Receiver');
            testFieldValidation('edrpou', BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou as any, '12345678');
            testFieldValidation('iban', BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban as any, 'UA123456789012345678');
            testFieldValidation(
                'paymentPurpose',
                BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose as any,
                'Test Purpose',
            );
        });
    });

    describe('Foreign fields (USD/EUR)', () => {
        ['USD', 'EUR'].forEach((currency) => {
            describe(`${currency} fields`, () => {
                beforeEach(() => {
                    // eslint-disable-next-line testing-library/no-render-in-setup
                    render(
                        React.createElement(createBankDetailsForm(currency as 'USD' | 'EUR') as any, {
                            initialMode: 'create',
                            onSubmit: jest.fn(),
                            onClose: jest.fn(),
                        }),
                    );
                });

                it('renders all fields', () => {
                    ['name', 'iban', 'swift', 'address'].forEach((name) => {
                        expect(getTextareaByName(name)).toBeInTheDocument();
                    });
                });

                it('calls validators for all fields', () => {
                    testFieldValidation('name', BANK_DETAILS_VALIDATION_FUNCTIONS.validateName as any, 'Bank Name');
                    testFieldValidation('iban', BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban as any, 'UA9876543210');
                    testFieldValidation('swift', BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift as any, 'SWIFT123');
                    testFieldValidation(
                        'address',
                        BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress as any,
                        'Test Address',
                    );
                });
            });
        });
    });

    describe('CorrespondentBankDetailsForm', () => {
        beforeEach(() => {
            // eslint-disable-next-line testing-library/no-render-in-setup
            render(
                React.createElement(CorrespondentBankDetailsForm as any, {
                    initialMode: 'create',
                    onSubmit: jest.fn(),
                    onClose: jest.fn(),
                }),
            );
        });

        it('contains all fields', () => {
            ['name', 'swift', 'account', 'iban'].forEach((name) => {
                expect(getTextareaByName(name)).toBeInTheDocument();
            });
        });

        it('allows entering values', () => {
            const nameInput = getTextareaByName('name');
            fireEvent.change(nameInput, { target: { value: 'Test Bank' } });
            expect(nameInput).toHaveValue('Test Bank');

            const swiftInput = getTextareaByName('swift');
            fireEvent.change(swiftInput, { target: { value: 'TESTSWIFT' } });
            expect(swiftInput).toHaveValue('TESTSWIFT');
        });
    });

    it('returns undefined for unknown type', () => {
        // @ts-expect-error
        expect(createBankDetailsForm('GBP')).toBeUndefined();
    });

    it('returns undefined for no type presented', () => {
        // @ts-expect-error
        expect(createBankDetailsForm()).toBeUndefined();
    });

    it('calls validators with empty string when value is undefined (UAH)', () => {
        const Form = createBankDetailsForm('UAH') as any;

        render(
            React.createElement(Form, {
                initialMode: 'create',
                onSubmit: jest.fn(),
                onClose: jest.fn(),
            }),
        );

        expectValidatorCalledWithEmpty('name', BANK_DETAILS_VALIDATION_FUNCTIONS.validateName as any);
        expectValidatorCalledWithEmpty('receiver', BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver as any);
        expectValidatorCalledWithEmpty('edrpou', BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou as any);
        expectValidatorCalledWithEmpty('iban', BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban as any);
        expectValidatorCalledWithEmpty(
            'paymentPurpose',
            BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose as any,
        );
    });

    it('calls validators with empty string when value is undefined (USD)', () => {
        const Form = createBankDetailsForm('USD') as any;

        render(
            React.createElement(Form, {
                initialMode: 'create',
                onSubmit: jest.fn(),
                onClose: jest.fn(),
            }),
        );

        expectValidatorCalledWithEmpty('name', BANK_DETAILS_VALIDATION_FUNCTIONS.validateName as any);
        expectValidatorCalledWithEmpty('receiver', BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver as any);
        expectValidatorCalledWithEmpty('iban', BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban as any);
        expectValidatorCalledWithEmpty('swift', BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift as any);
        expectValidatorCalledWithEmpty('address', BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress as any);
    });
});
