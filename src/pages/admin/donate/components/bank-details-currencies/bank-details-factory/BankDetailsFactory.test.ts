import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { createBankDetailsForm, CorrespondentBankDetailsForm } from './BankDetailsFactory';
import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/bank-details-schema/bank-details-schema';

jest.mock('../../../../../../validation/admin/bank-details-schema/bank-details-schema', () => ({
    BANK_DETAILS_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(),
        validateReceiver: jest.fn(),
        validateEdrpou: jest.fn(),
        validateUkrainianIban: jest.fn(),
        validateForeignIban: jest.fn(),
        validatePaymentPurpose: jest.fn(),
        validateSwift: jest.fn(),
        validateAddress: jest.fn(),
        validateAccount: jest.fn(),
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

    const testFieldValidation = (fieldName: string, validator: jest.Mock, value: string) => {
        const input = getTextareaByName(fieldName);
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);
        expect(validator).toHaveBeenCalledWith(value);
    };

    const createDefaultProps = (overrides = {}) => ({
        initialMode: 'create' as const,
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        ...overrides,
    });

    const renderFormWithRef = (FormComponent: any, initialData: any, mode = 'edit') => {
        const testRef = React.createRef<any>();
        render(
            React.createElement(FormComponent, {
                ref: testRef,
                initialData,
                ...createDefaultProps({ initialMode: mode }),
            }),
        );
        return testRef;
    };

    const createUahData = (overrides = {}) => ({
        id: 1,
        name: 'Test',
        receiver: 'Receiver',
        edrpou: '12345678',
        iban: 'UA123',
        paymentPurpose: 'Purpose',
        ...overrides,
    });

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
            testFieldValidation(
                'iban',
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban as any,
                'UA123456789012345678',
            );
            testFieldValidation(
                'paymentPurpose',
                BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose as any,
                'Test Purpose',
            );
        });

        it('validates form with different data types in initialData', () => {
            const view = renderFormWithRef(createBankDetailsForm('UAH'), createUahData({ edrpou: 12345678 }));

            view.current?.isValid();
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou).toHaveBeenCalledWith('12345678');
        });

        it('validates form with Date type in initialData', () => {
            const testDate = new Date('2025-01-01T00:00:00.000Z');
            const view = renderFormWithRef(createBankDetailsForm('UAH'), createUahData({ name: testDate }));

            view.current?.isValid();
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateName).toHaveBeenCalledWith('2025-01-01T00:00:00.000Z');
        });

        it('validates form with object type in initialData', () => {
            const view = renderFormWithRef(createBankDetailsForm('UAH'), createUahData({ name: { nested: 'object' } }));

            view.current?.isValid();
            expect(BANK_DETAILS_VALIDATION_FUNCTIONS.validateName).toHaveBeenCalledWith('');
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
                    ['name', 'receiver', 'iban', 'swift', 'address'].forEach((name) => {
                        expect(getTextareaByName(name)).toBeInTheDocument();
                    });
                });

                it('calls validators for all fields', () => {
                    testFieldValidation('name', BANK_DETAILS_VALIDATION_FUNCTIONS.validateName as any, 'Bank Name');
                    testFieldValidation(
                        'receiver',
                        BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver as any,
                        'Test Receiver',
                    );
                    testFieldValidation(
                        'iban',
                        BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban as any,
                        'UA9876543210',
                    );
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

        it('calls validators for all fields', () => {
            testFieldValidation('name', BANK_DETAILS_VALIDATION_FUNCTIONS.validateName as any, 'Test Bank');
            testFieldValidation('swift', BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift as any, 'SWIFT123');
            testFieldValidation('account', BANK_DETAILS_VALIDATION_FUNCTIONS.validateAccount as any, 'ACC123');
            testFieldValidation('iban', BANK_DETAILS_VALIDATION_FUNCTIONS.validateForeignIban as any, 'IBAN456');
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
});
