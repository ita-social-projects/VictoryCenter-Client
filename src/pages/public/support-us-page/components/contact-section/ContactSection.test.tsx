import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { ContactSection } from './ContactSection';
import { CONTACT_FORM_LIMITS, CONTACT_FORM_MESSAGES } from '@/const/public/contact-form';
import * as contactApi from '@/services/api/public/contact/contact-api';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock(
    './ContactSection.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

jest.mock('@/services/api/public/contact/contact-api');

const mockedSubmit = contactApi.submitContactInquiry as jest.Mock;

const fillValidForm = async () => {
    await userEvent.type(screen.getByPlaceholderText('namePlaceholder'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('emailPlaceholder'), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText('subjectPlaceholder'), 'Test subject text');
    await userEvent.type(screen.getByPlaceholderText('messagePlaceholder'), 'Test message body text here');
};

describe('ContactSection', () => {
    const mockUseTranslation = useTranslation as jest.Mock;

    beforeEach(() => {
        mockUseTranslation.mockReturnValue({ t: (key: string) => key });
        mockedSubmit.mockReset();
    });

    it('renders all form fields and submit button', () => {
        render(<ContactSection />);
        expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('emailPlaceholder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('subjectPlaceholder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('messagePlaceholder')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'submitButton' })).toBeInTheDocument();
    });

    describe('name field validation', () => {
        it('shows required error when name is empty on submit', async () => {
            render(<ContactSection />);
            fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));
            expect(await screen.findByText('nameRequired')).toBeInTheDocument();
        });

        it('shows required error when name contains only spaces', async () => {
            render(<ContactSection />);
            fireEvent.change(screen.getByPlaceholderText('namePlaceholder'), { target: { value: '   ' } });
            fireEvent.blur(screen.getByPlaceholderText('namePlaceholder'));
            expect(await screen.findByText('nameRequired')).toBeInTheDocument();
        });
    });

    describe('email field validation', () => {
        it.each([
            ['missing @', 'userexample.com'],
            ['domain without dot', 'user@localhost'],
            ['spaces', 'us er@mail.com'],
            ['empty local part', '@mail.com'],
            ['TLD shorter than 2 chars', 'user@mail.c'],
        ])('shows error for invalid email: %s', async (_, invalidEmail) => {
            render(<ContactSection />);
            fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), { target: { value: invalidEmail } });
            fireEvent.blur(screen.getByPlaceholderText('emailPlaceholder'));
            expect(await screen.findByText(CONTACT_FORM_MESSAGES.EMAIL.INVALID)).toBeInTheDocument();
        });

        it('shows required error when email is empty on submit', async () => {
            render(<ContactSection />);
            fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));
            expect(await screen.findByText('emailRequired')).toBeInTheDocument();
        });
    });

    describe('subject field validation', () => {
        it('shows min-length error on blur when subject < MIN characters', async () => {
            render(<ContactSection />);
            fireEvent.change(screen.getByPlaceholderText('subjectPlaceholder'), { target: { value: 'ab' } });
            fireEvent.blur(screen.getByPlaceholderText('subjectPlaceholder'));
            expect(await screen.findByText(CONTACT_FORM_MESSAGES.SUBJECT.MIN_ERROR)).toBeInTheDocument();
        });

        it('shows warn hint when subject reaches WARN_AT characters', async () => {
            render(<ContactSection />);
            await userEvent.type(
                screen.getByPlaceholderText('subjectPlaceholder'),
                'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.WARN_AT),
            );
            const remaining = CONTACT_FORM_LIMITS.SUBJECT.MAX - CONTACT_FORM_LIMITS.SUBJECT.WARN_AT;
            expect(screen.getByText(CONTACT_FORM_MESSAGES.SUBJECT.getWarnMessage(remaining))).toBeInTheDocument();
        });

        it('shows limit-reached when subject hits MAX characters', async () => {
            render(<ContactSection />);
            await userEvent.type(
                screen.getByPlaceholderText('subjectPlaceholder'),
                'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX),
            );
            expect(screen.getByText(CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED)).toBeInTheDocument();
        });
    });

    describe('message field validation', () => {
        it('shows min-length error on blur when message < MIN characters', async () => {
            render(<ContactSection />);
            fireEvent.change(screen.getByPlaceholderText('messagePlaceholder'), { target: { value: 'short' } });
            fireEvent.blur(screen.getByPlaceholderText('messagePlaceholder'));
            expect(await screen.findByText(CONTACT_FORM_MESSAGES.MESSAGE.MIN_ERROR)).toBeInTheDocument();
        });

        it('shows warn hint when message reaches WARN_AT characters', () => {
            render(<ContactSection />);
            fireEvent.change(screen.getByPlaceholderText('messagePlaceholder'), {
                target: { value: 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.WARN_AT) },
            });
            const remaining = CONTACT_FORM_LIMITS.MESSAGE.MAX - CONTACT_FORM_LIMITS.MESSAGE.WARN_AT;
            expect(screen.getByText(CONTACT_FORM_MESSAGES.MESSAGE.getWarnMessage(remaining))).toBeInTheDocument();
        });
    });

    describe('form submission', () => {
        it('shows success snackbar and resets form on successful submission', async () => {
            mockedSubmit.mockResolvedValue(undefined);
            render(<ContactSection />);

            await fillValidForm();
            fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

            await waitFor(() => {
                expect(screen.getByText('successMessage')).toBeInTheDocument();
            });
            expect(screen.getByPlaceholderText('namePlaceholder')).toHaveValue('');
        });

        it('shows error snackbar on failed submission', async () => {
            mockedSubmit.mockRejectedValue(new Error('API error'));
            render(<ContactSection />);

            await fillValidForm();
            fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

            await waitFor(() => {
                expect(screen.getByText('errorMessage')).toBeInTheDocument();
            });
        });

        it('trims whitespace from fields before submitting', async () => {
            mockedSubmit.mockResolvedValue(undefined);
            render(<ContactSection />);

            fireEvent.change(screen.getByPlaceholderText('namePlaceholder'), { target: { value: '  John  ' } });
            fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), {
                target: { value: 'john@example.com' },
            });
            fireEvent.change(screen.getByPlaceholderText('subjectPlaceholder'), {
                target: { value: '  Test subject  ' },
            });
            fireEvent.change(screen.getByPlaceholderText('messagePlaceholder'), {
                target: { value: '  Test message body  ' },
            });

            fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

            await waitFor(() => {
                expect(mockedSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'John',
                        subject: 'Test subject',
                        message: 'Test message body',
                    }),
                );
            });
        });
    });
});
