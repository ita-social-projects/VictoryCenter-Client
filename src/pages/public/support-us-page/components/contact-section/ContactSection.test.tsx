import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ContactSection } from './ContactSection';
import { CONTACT_FORM_LIMITS, CONTACT_FORM_MESSAGES } from '@/const/public/contact-form';
import { submitContactUsForm } from '@/services/api/public/contact-us/contact-us-api';

const mockResetTurnstile = jest.fn();
let mockTurnstileToken: string | null = 'mock-token';

jest.mock('@/hooks/public/use-turnstile', () => ({
    useTurnstile: () => ({ token: mockTurnstileToken, containerRef: { current: null }, reset: mockResetTurnstile }),
}));

jest.mock('@/services/api/public/contact-us/contact-us-api', () => ({
    submitContactUsForm: jest.fn(),
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

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) =>
            ({
                'SUPPORT_INQUIRY.TITLE': 'Як підтримати',
                'SUPPORT_INQUIRY.DESCRIPTION.FIRST_TEXT': 'Перший текст | Другий рядок',
                'SUPPORT_INQUIRY.DESCRIPTION.SECOND_BOLD_TEXT': 'Важливий текст | Другий важливий рядок',
                'SUPPORT_INQUIRY.FORM.NAME': "Ваше ім'я",
                'SUPPORT_INQUIRY.FORM.EMAIL': 'E-mail',
                'SUPPORT_INQUIRY.FORM.SUBJECT': 'Тема звернення',
                'SUPPORT_INQUIRY.FORM.MESSAGE': 'Напишіть ваше повідомлення',
                'SUPPORT_INQUIRY.FORM.SUBMIT_BUTTON': 'Надіслати',
            })[key],
    }),
}));

describe('ContactSection', () => {
    const submitMock = submitContactUsForm as jest.MockedFunction<typeof submitContactUsForm>;
    const NAME_FIELD = 'contact-field-name';
    const EMAIL_FIELD = 'contact-field-email';
    const SUBJECT_FIELD = 'contact-field-subject';
    const MESSAGE_FIELD = 'contact-field-message';
    type FormValues = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;
    const getField = (fieldId: string) => screen.getByTestId(fieldId);
    const setFieldValue = (fieldId: string, value: string) => {
        fireEvent.change(getField(fieldId), { target: { value } });
    };
    const clickSubmit = () => fireEvent.click(screen.getByRole('button', { name: 'Надіслати' }));
    const fillForm = (overrides: FormValues = {}, shouldBlur = false) => {
        const values = {
            name: 'Ім’я',
            email: 'user@example.com',
            subject: 'Тема1',
            message: 'Текст повідомлення',
            ...overrides,
        };

        setFieldValue(NAME_FIELD, values.name);
        setFieldValue(EMAIL_FIELD, values.email);
        setFieldValue(SUBJECT_FIELD, values.subject);
        setFieldValue(MESSAGE_FIELD, values.message);

        if (shouldBlur) {
            [NAME_FIELD, EMAIL_FIELD, SUBJECT_FIELD, MESSAGE_FIELD].forEach((fieldId) => {
                fireEvent.blur(getField(fieldId));
            });
        }
    };
    const submitForm = (overrides: FormValues = {}, shouldBlur = false) => {
        fillForm(overrides, shouldBlur);
        clickSubmit();
    };

    beforeEach(() => {
        jest.useFakeTimers();
        submitMock.mockReset();
        mockResetTurnstile.mockReset();
        mockTurnstileToken = 'mock-token';
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the support inquiry form', () => {
        render(<ContactSection />);

        expect(screen.getByTestId('title-section')).toHaveTextContent('Як підтримати');
        expect(getField(NAME_FIELD)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Надіслати' })).toBeInTheDocument();
        expect(screen.getByRole('form', { name: 'Як підтримати' })).toBeInTheDocument();
        expect(screen.getByText('Перший текст')).toBeInTheDocument();
        expect(screen.getByText('Другий рядок')).toBeInTheDocument();
        expect(screen.getByText('Важливий текст')).toBeInTheDocument();
        expect(screen.getByText('Другий важливий рядок')).toBeInTheDocument();
    });

    it('renders the correct field types, limits and CAPTCHA state', () => {
        render(<ContactSection />);

        expect(getField(EMAIL_FIELD)).toHaveAttribute('type', 'email');
        expect(getField(SUBJECT_FIELD)).toHaveAttribute('maxlength', String(CONTACT_FORM_LIMITS.SUBJECT.MAX));
        expect(getField(MESSAGE_FIELD)).toHaveAttribute('maxlength', String(CONTACT_FORM_LIMITS.MESSAGE.MAX));
        expect(getField(MESSAGE_FIELD).tagName).toBe('TEXTAREA');
        expect(screen.getByRole('button', { name: 'Надіслати' })).toBeEnabled();
    });

    it('disables submission and does not call the API when CAPTCHA has no token', async () => {
        mockTurnstileToken = null;
        render(<ContactSection />);

        const submitButton = screen.getByRole('button', { name: 'Надіслати' });
        expect(submitButton).toBeDisabled();
        submitForm();

        await act(async () => undefined);
        expect(submitMock).not.toHaveBeenCalled();
        expect(mockResetTurnstile).not.toHaveBeenCalled();
    });

    it('shows required messages and highlights invalid fields', async () => {
        render(<ContactSection />);
        clickSubmit();

        expect(await screen.findByText(CONTACT_FORM_MESSAGES.NAME.REQUIRED)).toBeInTheDocument();
        expect(await screen.findByText("Введіть E-mail для зв'язку")).toBeInTheDocument();
        expect(await screen.findByText('Тема звернення')).toBeInTheDocument();
        expect(await screen.findByText('Напишіть Ваше повідомлення')).toBeInTheDocument();
        expect(getField(NAME_FIELD).parentElement).toHaveClass('field--error');
        expect(getField(EMAIL_FIELD).parentElement).toHaveClass('field--error');
        expect(getField(SUBJECT_FIELD).parentElement).toHaveClass('field--error');
        expect(getField(MESSAGE_FIELD).parentElement).toHaveClass('field--error');
    });

    it('shows the required email message when email is empty', async () => {
        render(<ContactSection />);
        clickSubmit();

        expect(await screen.findByText("Введіть E-mail для зв'язку")).toBeInTheDocument();
        expect(screen.queryByText(CONTACT_FORM_MESSAGES.EMAIL.INVALID)).not.toBeInTheDocument();
    });

    it('shows the existing minimum-length errors for subject and message', async () => {
        render(<ContactSection />);

        setFieldValue(SUBJECT_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MIN - 1));
        setFieldValue(MESSAGE_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.MIN - 1));
        const subjectInput = getField(SUBJECT_FIELD);
        const messageInput = getField(MESSAGE_FIELD);
        fireEvent.blur(subjectInput);
        fireEvent.blur(messageInput);

        expect(await screen.findByText(CONTACT_FORM_MESSAGES.SUBJECT.MIN_ERROR)).toBeInTheDocument();
        expect(await screen.findByText(CONTACT_FORM_MESSAGES.MESSAGE.MIN_ERROR)).toBeInTheDocument();
    });

    it('shows warning and reached-limit hints at their boundaries', () => {
        render(<ContactSection />);
        setFieldValue(SUBJECT_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.WARN_AT));
        setFieldValue(MESSAGE_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.WARN_AT));

        expect(screen.getByText(CONTACT_FORM_MESSAGES.SUBJECT.getWarnMessage(20))).toBeInTheDocument();
        expect(screen.getByText(CONTACT_FORM_MESSAGES.MESSAGE.getWarnMessage(200))).toBeInTheDocument();

        setFieldValue(SUBJECT_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX));
        setFieldValue(MESSAGE_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.MAX));

        expect(screen.getAllByText(CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED)).toHaveLength(1);
        expect(screen.getAllByText(CONTACT_FORM_MESSAGES.MESSAGE.LIMIT_REACHED)).toHaveLength(1);
    });

    describe('email format validation', () => {
        it.each([
            ['missing @', 'userexample.com'],
            ['domain without dot', 'user@localhost'],
            ['spaces', 'us er@mail.com'],
            ['empty local part', '@mail.com'],
            ['TLD shorter than 2 characters', 'user@mail.c'],
        ])('shows an error and highlights an invalid email: %s', async (_, email) => {
            render(<ContactSection />);
            submitForm({ email });

            expect(await screen.findByText(CONTACT_FORM_MESSAGES.EMAIL.INVALID)).toBeInTheDocument();
            expect(getField(EMAIL_FIELD).parentElement).toHaveClass('field--error');
            expect(submitMock).not.toHaveBeenCalled();
        });

        it('accepts a valid email format', async () => {
            render(<ContactSection />);
            submitForm({ email: 'user@mail.com' });

            await waitFor(() => expect(submitMock).toHaveBeenCalled());
            expect(screen.queryByText(CONTACT_FORM_MESSAGES.EMAIL.INVALID)).not.toBeInTheDocument();
        });
    });

    it('treats whitespace-only values as empty', async () => {
        render(<ContactSection />);
        for (const fieldId of [NAME_FIELD, EMAIL_FIELD, SUBJECT_FIELD, MESSAGE_FIELD]) {
            setFieldValue(fieldId, '   ');
        }
        clickSubmit();

        expect(await screen.findByText(CONTACT_FORM_MESSAGES.NAME.REQUIRED)).toBeInTheDocument();
    });

    it('trims leading and trailing spaces when a field loses focus', () => {
        render(<ContactSection />);
        const nameInput = getField(NAME_FIELD);
        setFieldValue(NAME_FIELD, '  Ім’я  ');
        fireEvent.blur(nameInput);

        expect(nameInput).toHaveValue('Ім’я');
    });

    it('submits trimmed data, clears the form and shows a success message for five seconds', async () => {
        submitMock.mockResolvedValue(undefined);
        render(<ContactSection />);
        submitForm(
            {
                name: '  Ім’я  ',
                email: '  user@example.com  ',
                subject: '  Тема1  ',
                message: '  Текст повідомлення  ',
            },
            true,
        );
        await waitFor(() =>
            expect(submitMock).toHaveBeenCalledWith({
                captchaResponseToken: 'mock-token',
                fromName: 'Ім’я',
                fromEmail: 'user@example.com',
                subject: 'Тема1',
                message: 'Текст повідомлення',
            }),
        );
        expect(mockResetTurnstile).toHaveBeenCalled();
        expect(getField(NAME_FIELD)).toHaveValue('');
        expect(screen.getByText('Ваш запит надіслано успішно. Очікуйте на відповідь')).toBeInTheDocument();

        act(() => jest.advanceTimersByTime(5000));
        expect(screen.queryByText('Ваш запит надіслано успішно. Очікуйте на відповідь')).not.toBeInTheDocument();
    });

    it('shows an error message for three seconds when submission fails', async () => {
        submitMock.mockRejectedValue(new Error('request failed'));
        render(<ContactSection />);
        submitForm();

        expect(await screen.findByText('Сталася помилка. Спробуйте пізніше')).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(3000));
        expect(screen.queryByText('Сталася помилка. Спробуйте пізніше')).not.toBeInTheDocument();
    });
});
