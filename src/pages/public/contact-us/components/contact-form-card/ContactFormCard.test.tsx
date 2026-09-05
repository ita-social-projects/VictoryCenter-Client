import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactFormCard } from './ContactFormCard';
import { useTurnstile } from '@/hooks/public/use-turnstile';
import { submitContactUsForm } from '@/services/api/public/contact-us/contact-us-api';
import { CONTACT_FORM_LIMITS } from '@/const/public/contact-form';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'uk',
        },
    }),
}));

jest.mock('@/hooks/public/use-turnstile', () => ({
    useTurnstile: jest.fn(),
}));

jest.mock('@/services/api/public/contact-us/contact-us-api', () => ({
    submitContactUsForm: jest.fn(),
}));

jest.mock('./ContactFormCard.module.scss', () => ({
    __esModule: true,
    default: new Proxy(
        {},
        {
            get: (_, key) => key,
        },
    ),
}));

const DEFAULT_PROPS = {
    isPopup: false,
    title: 'Contact form',
    namePlaceholder: "Ваше ім'я",
    emailPlaceholder: 'E-mail',
    subjectPlaceholder: 'Тема звернення',
    messagePlaceholder: 'Напишіть ваше повідомлення',
    submitLabel: 'Надіслати',
};

const renderForm = () => render(<ContactFormCard {...DEFAULT_PROPS} />);

describe('ContactFormCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useTurnstile as jest.Mock).mockReturnValue({
            token: 'mock-token',
            containerRef: { current: null },
            reset: jest.fn(),
        });
    });

    describe('Styles and isPopup prop', () => {
        it('applies popup class when isPopup is true', () => {
            render(<ContactFormCard {...DEFAULT_PROPS} isPopup={true} />);
            const form = screen.getByRole('form', { name: 'Contact form' });

            expect(form).toHaveClass('contact-form-card--popup');
        });

        it('does not apply popup class when isPopup is false', () => {
            render(<ContactFormCard {...DEFAULT_PROPS} isPopup={false} />);
            const form = screen.getByRole('form', { name: 'Contact form' });

            expect(form).not.toHaveClass('contact-form-card--popup');
        });
    });

    it('renders all placeholders and submit label', () => {
        renderForm();

        expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Ваше ім'я")).toBeInTheDocument();
        expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Тема звернення')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Напишіть ваше повідомлення')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Надіслати' })).toBeInTheDocument();
    });

    describe('Subject field', () => {
        it('shows info hint when subject reaches INFO_AT characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.INFO_AT));

            expect(screen.getByText('contactForm.charactersRemaining')).toBeInTheDocument();
        });

        it('shows limit-reached message when subject hits MAX characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX));

            expect(screen.getByText('contactForm.limitReached')).toBeInTheDocument();
        });

        it('shows min-length error on blur when subject < MIN characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            fireEvent.change(subjectInput, { target: { value: 'ab' } });
            fireEvent.blur(subjectInput);

            expect(await screen.findByText('contactForm.subjectMinLengthError')).toBeInTheDocument();
        });

        it('does not show hint below INFO_AT characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.INFO_AT - 1));

            expect(screen.queryByText('contactForm.limitReached')).not.toBeInTheDocument();
            expect(screen.queryByText('contactForm.charactersRemaining')).not.toBeInTheDocument();
        });
    });

    describe('Message field', () => {
        it('shows warn hint when message reaches INFO_AT characters', () => {
            renderForm();
            const messageTextarea = screen.getByPlaceholderText('Напишіть ваше повідомлення');

            fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.INFO_AT) } });

            expect(screen.getByText('contactForm.charactersRemaining')).toBeInTheDocument();
        });

        it('shows limit-reached message when message hits MAX characters', () => {
            renderForm();
            const messageTextarea = screen.getByPlaceholderText('Напишіть ваше повідомлення');

            fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.MAX) } });

            expect(screen.getByText('contactForm.limitReached')).toBeInTheDocument();
        });

        it('shows min-length error on blur when message < MIN characters', async () => {
            renderForm();
            const messageTextarea = screen.getByPlaceholderText('Напишіть ваше повідомлення');

            fireEvent.change(messageTextarea, { target: { value: 'short' } });
            fireEvent.blur(messageTextarea);

            expect(await screen.findByText('contactForm.messageMinLengthError')).toBeInTheDocument();
        });
    });

    describe('Email field', () => {
        const submitForm = () => fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

        it.each([
            ['missing @', 'userexample.com'],
            ['domain without dot', 'user@localhost'],
            ['spaces', 'us er@mail.com'],
            ['empty local part', '@mail.com'],
            ['TLD shorter than 2 chars', 'user@mail.c'],
        ])('shows error for invalid email: %s', async (_, invalidEmail) => {
            renderForm();
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: invalidEmail } });
            submitForm();

            expect(await screen.findByText('contactForm.emailInvalid')).toBeInTheDocument();
        });

        it('does not show error for valid email', async () => {
            renderForm();
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@mail.com' } });
            submitForm();

            expect(screen.queryByText('contactForm.emailInvalid')).not.toBeInTheDocument();
        });
    });

    describe('Turnstile behavior', () => {
        it('disables submit button if turnstileToken is not present', () => {
            (useTurnstile as jest.Mock).mockReturnValue({
                token: null,
                containerRef: { current: null },
                reset: jest.fn(),
            });

            renderForm();
            const submitButton = screen.getByRole('button', { name: 'Надіслати' });

            expect(submitButton).toBeDisabled();
        });

        it('enables submit button if turnstileToken is present', () => {
            renderForm();
            const submitButton = screen.getByRole('button', { name: 'Надіслати' });

            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('Form Submission', () => {
        const fillValidForm = async () => {
            await userEvent.type(screen.getByPlaceholderText("Ваше ім'я"), 'Іван');
            await userEvent.type(screen.getByPlaceholderText('E-mail'), 'ivan@example.com');
            await userEvent.type(screen.getByPlaceholderText('Тема звернення'), 'Важливе питання');
            await userEvent.type(
                screen.getByPlaceholderText('Напишіть ваше повідомлення'),
                'Це тестове повідомлення достатньої довжини.',
            );
        };

        it('submits form successfully and shows success toast', async () => {
            (submitContactUsForm as jest.Mock).mockResolvedValueOnce(undefined);

            renderForm();
            await fillValidForm();

            fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

            await waitFor(() => {
                expect(submitContactUsForm).toHaveBeenCalledWith({
                    captchaResponseToken: 'mock-token',
                    fromName: 'Іван',
                    fromEmail: 'ivan@example.com',
                    subject: 'Важливе питання',
                    message: 'Це тестове повідомлення достатньої довжини.',
                });
            });

            expect(await screen.findByText('contactForm.submitSuccess')).toBeInTheDocument();
        });

        it('shows error toast if submission fails', async () => {
            (submitContactUsForm as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

            renderForm();
            await fillValidForm();

            fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

            expect(await screen.findByText('contactForm.submitError')).toBeInTheDocument();
        });
    });
});
