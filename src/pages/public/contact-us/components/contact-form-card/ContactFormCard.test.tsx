import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

    describe('Space management', () => {
        const getName = () => screen.getByPlaceholderText("Ваше ім'я");
        const getEmail = () => screen.getByPlaceholderText('E-mail');
        const getSubject = () => screen.getByPlaceholderText('Тема звернення');
        const getMessage = () => screen.getByPlaceholderText('Напишіть ваше повідомлення');

        describe('while typing (real time)', () => {
            it.each([
                ['name', getName],
                ['subject', getSubject],
                ['message', getMessage],
            ])('collapses consecutive spaces into one in %s', (_, getField) => {
                renderForm();
                const field = getField();

                fireEvent.change(field, { target: { value: 'John          Doe' } });

                expect(field).toHaveValue('John Doe');
            });

            it.each([
                ['name', getName],
                ['subject', getSubject],
                ['message', getMessage],
            ])('removes leading spaces in %s', (_, getField) => {
                renderForm();
                const field = getField();

                fireEvent.change(field, { target: { value: '     John' } });

                expect(field).toHaveValue('John');
            });

            it('keeps a single trailing space so the next word can be typed', async () => {
                renderForm();
                const nameInput = getName();

                await userEvent.type(nameInput, 'John ');
                expect(nameInput).toHaveValue('John ');

                await userEvent.type(nameInput, 'Doe');
                expect(nameInput).toHaveValue('John Doe');
            });

            it('allows only one space when the spacebar is pressed repeatedly', async () => {
                renderForm();
                const nameInput = getName();

                await userEvent.type(nameInput, 'John     Doe');

                expect(nameInput).toHaveValue('John Doe');
            });

            it('strips all spaces from email', () => {
                renderForm();
                const emailInput = getEmail();

                fireEvent.change(emailInput, { target: { value: 'us er@ma il.com' } });

                expect(emailInput).toHaveValue('user@mail.com');
            });

            it('preserves line breaks in message', () => {
                renderForm();
                const messageTextarea = getMessage();

                fireEvent.change(messageTextarea, { target: { value: 'Line one\n\nLine   two' } });

                expect(messageTextarea).toHaveValue('Line one\n\nLine two');
            });

            it('does not count collapsed spaces in the subject character hint', () => {
                renderForm();
                const subjectInput = getSubject();
                const manySpaces = ' '.repeat(CONTACT_FORM_LIMITS.SUBJECT.INFO_AT + 5);

                fireEvent.change(subjectInput, { target: { value: `a${manySpaces}b` } });

                expect(subjectInput).toHaveValue('a b');
                expect(screen.queryByText('contactForm.charactersRemaining')).not.toBeInTheDocument();
                expect(screen.queryByText('contactForm.limitReached')).not.toBeInTheDocument();
            });

            it('does not count collapsed spaces in the message character hint', () => {
                renderForm();
                const messageTextarea = getMessage();
                const manySpaces = ' '.repeat(CONTACT_FORM_LIMITS.MESSAGE.INFO_AT + 5);

                fireEvent.change(messageTextarea, { target: { value: `a${manySpaces}b` } });

                expect(messageTextarea).toHaveValue('a b');
                expect(screen.queryByText('contactForm.charactersRemaining')).not.toBeInTheDocument();
                expect(screen.queryByText('contactForm.limitReached')).not.toBeInTheDocument();
            });
        });

        describe('on blur', () => {
            it.each([
                ['name', getName, '  John   Doe  ', 'John Doe'],
                ['subject', getSubject, '  General   Question  ', 'General Question'],
                ['message', getMessage, '  I   have   a   question  ', 'I have a question'],
            ])('trims leading and trailing spaces in %s', (_, getField, input, expected) => {
                renderForm();
                const field = getField();

                fireEvent.change(field, { target: { value: input } });
                fireEvent.blur(field);

                expect(field).toHaveValue(expected);
            });

            it('removes spaces from email', () => {
                renderForm();
                const emailInput = getEmail();

                fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
                fireEvent.blur(emailInput);

                expect(emailInput).toHaveValue('test@example.com');
            });

            it('trims message but preserves line breaks', () => {
                renderForm();
                const messageTextarea = getMessage();

                fireEvent.change(messageTextarea, { target: { value: '  First line\nSecond   line  ' } });
                fireEvent.blur(messageTextarea);

                expect(messageTextarea).toHaveValue('First line\nSecond line');
            });
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

        it('does not call onSubmitSuccess if the card unmounts before the request completes', async () => {
            let resolveRequest: () => void = () => undefined;
            (submitContactUsForm as jest.Mock).mockReturnValueOnce(
                new Promise<void>((resolve) => {
                    resolveRequest = resolve;
                }),
            );
            const onSubmitSuccess = jest.fn();

            const { unmount } = render(<ContactFormCard {...DEFAULT_PROPS} onSubmitSuccess={onSubmitSuccess} />);
            await fillValidForm();
            fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));
            await waitFor(() => expect(submitContactUsForm).toHaveBeenCalledTimes(1));

            unmount();
            await act(async () => {
                resolveRequest();
            });

            expect(onSubmitSuccess).not.toHaveBeenCalled();
        });

        it('calls onSubmitSuccess after successful submission', async () => {
            (submitContactUsForm as jest.Mock).mockResolvedValueOnce(undefined);
            const onSubmitSuccess = jest.fn();

            render(<ContactFormCard {...DEFAULT_PROPS} onSubmitSuccess={onSubmitSuccess} />);
            await fillValidForm();
            fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

            await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledTimes(1));
        });

        it('does not call onSubmitSuccess if submission fails', async () => {
            (submitContactUsForm as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
            const onSubmitSuccess = jest.fn();

            render(<ContactFormCard {...DEFAULT_PROPS} onSubmitSuccess={onSubmitSuccess} />);
            await fillValidForm();
            fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

            await screen.findByText('contactForm.submitError');
            expect(onSubmitSuccess).not.toHaveBeenCalled();
        });

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

        it('sends normalized values even if fields were never blurred (e.g. Enter-submit)', async () => {
            (submitContactUsForm as jest.Mock).mockResolvedValueOnce(undefined);

            renderForm();

            fireEvent.change(screen.getByPlaceholderText("Ваше ім'я"), { target: { value: '  Іван   Петренко  ' } });
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: ' ivan@example.com ' } });
            fireEvent.change(screen.getByPlaceholderText('Тема звернення'), {
                target: { value: '  Важливе   питання  ' },
            });
            fireEvent.change(screen.getByPlaceholderText('Напишіть ваше повідомлення'), {
                target: { value: '  Це тестове   повідомлення достатньої довжини.  ' },
            });

            fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));

            await waitFor(() => {
                expect(submitContactUsForm).toHaveBeenCalledWith({
                    captchaResponseToken: 'mock-token',
                    fromName: 'Іван Петренко',
                    fromEmail: 'ivan@example.com',
                    subject: 'Важливе питання',
                    message: 'Це тестове повідомлення достатньої довжини.',
                });
            });
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
