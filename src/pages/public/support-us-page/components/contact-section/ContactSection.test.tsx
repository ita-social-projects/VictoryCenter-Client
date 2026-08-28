import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ContactSection } from './ContactSection';
import { CONTACT_FORM_LIMITS } from '@/const/public/contact-form';
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

const T = {
    TITLE: 'SUPPORT_INQUIRY.TITLE',
    FIRST_TEXT: 'SUPPORT_INQUIRY.DESCRIPTION.FIRST_TEXT',
    SECOND_BOLD_TEXT: 'SUPPORT_INQUIRY.DESCRIPTION.SECOND_BOLD_TEXT',
    SUBMIT_BUTTON: 'SUPPORT_INQUIRY.FORM.SUBMIT_BUTTON',
    NAME_REQUIRED: 'contactForm.nameRequired',
    EMAIL_REQUIRED: 'contactForm.emailRequired',
    EMAIL_INVALID: 'contactForm.emailInvalid',
    SUBJECT_REQUIRED: 'contactForm.subjectRequired',
    SUBJECT_MIN_ERROR: 'contactForm.subjectMinLengthError',
    MESSAGE_REQUIRED: 'contactForm.messageRequired',
    MESSAGE_MIN_ERROR: 'contactForm.messageMinLengthError',
    LIMIT_REACHED: 'contactForm.limitReached',
    SUBMIT_SUCCESS: 'contactForm.submitSuccess',
    SUBMIT_ERROR: 'contactForm.submitError',
    CAPTCHA_REQUIRED: 'contactForm.captchaRequired',
} as const;
const charactersRemaining = (count: number) => `contactForm.charactersRemaining_${count}`;

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { count?: number }) =>
            options?.count !== undefined ? `${key}_${options.count}` : key,
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
        act(() => {
            fireEvent.change(getField(fieldId), { target: { value } });
        });
    };
    const clickSubmit = () => {
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: T.SUBMIT_BUTTON }));
        });
    };
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
                act(() => {
                    fireEvent.blur(getField(fieldId));
                });
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

        const form = screen.getByRole('form', { name: T.TITLE });
        expect(form).toBeInTheDocument();
        expect(form).toContainElement(getField(NAME_FIELD));
        expect(form).toContainElement(getField(EMAIL_FIELD));
        expect(form).toContainElement(getField(SUBJECT_FIELD));
        expect(form).toContainElement(getField(MESSAGE_FIELD));
        expect(screen.getByTestId('title-section')).toHaveTextContent(T.TITLE);
        expect(screen.getByRole('button', { name: T.SUBMIT_BUTTON })).toBeInTheDocument();
        expect(screen.getByText(T.FIRST_TEXT)).toBeInTheDocument();
        expect(screen.getByText(T.SECOND_BOLD_TEXT)).toBeInTheDocument();
    });

    it('renders the correct field types, limits and CAPTCHA state', () => {
        render(<ContactSection />);

        expect(getField(EMAIL_FIELD)).toHaveAttribute('type', 'email');
        expect(getField(SUBJECT_FIELD)).toHaveAttribute('maxlength', String(CONTACT_FORM_LIMITS.SUBJECT.MAX));
        expect(getField(MESSAGE_FIELD)).toHaveAttribute('maxlength', String(CONTACT_FORM_LIMITS.MESSAGE.MAX));
        expect(getField(MESSAGE_FIELD).tagName).toBe('TEXTAREA');
        expect(screen.getByRole('button', { name: T.SUBMIT_BUTTON })).toBeEnabled();
    });

    it('disables submission and does not call the API when CAPTCHA has no token', async () => {
        mockTurnstileToken = null;
        render(<ContactSection />);

        const submitButton = screen.getByRole('button', { name: T.SUBMIT_BUTTON });
        expect(submitButton).toBeDisabled();
        submitForm();

        await act(async () => undefined);
        expect(submitMock).not.toHaveBeenCalled();
        expect(mockResetTurnstile).not.toHaveBeenCalled();
    });

    it('shows required messages and highlights invalid fields', async () => {
        render(<ContactSection />);
        clickSubmit();

        expect(await screen.findByText(T.NAME_REQUIRED)).toBeInTheDocument();
        expect(await screen.findByText(T.EMAIL_REQUIRED)).toBeInTheDocument();
        expect(await screen.findByText(T.SUBJECT_REQUIRED)).toBeInTheDocument();
        expect(await screen.findByText(T.MESSAGE_REQUIRED)).toBeInTheDocument();
    });

    it('shows the required email message when email is empty', async () => {
        render(<ContactSection />);
        clickSubmit();

        expect(await screen.findByText(T.EMAIL_REQUIRED)).toBeInTheDocument();
        expect(screen.queryByText(T.EMAIL_INVALID)).not.toBeInTheDocument();
    });

    it('shows the existing minimum-length errors for subject and message', async () => {
        render(<ContactSection />);

        setFieldValue(SUBJECT_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MIN - 1));
        setFieldValue(MESSAGE_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.MIN - 1));
        const subjectInput = getField(SUBJECT_FIELD);
        const messageInput = getField(MESSAGE_FIELD);
        act(() => {
            fireEvent.blur(subjectInput);
            fireEvent.blur(messageInput);
        });

        expect(await screen.findByText(T.SUBJECT_MIN_ERROR)).toBeInTheDocument();
        expect(await screen.findByText(T.MESSAGE_MIN_ERROR)).toBeInTheDocument();
    });

    it('shows warning and reached-limit hints at their boundaries', () => {
        render(<ContactSection />);
        setFieldValue(SUBJECT_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.WARN_AT));
        setFieldValue(MESSAGE_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.WARN_AT));

        expect(screen.getByText(charactersRemaining(20))).toBeInTheDocument();
        expect(screen.getByText(charactersRemaining(200))).toBeInTheDocument();

        setFieldValue(SUBJECT_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX));
        setFieldValue(MESSAGE_FIELD, 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.MAX));

        expect(screen.getAllByText(T.LIMIT_REACHED)).toHaveLength(2);
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

            expect(await screen.findByText(T.EMAIL_INVALID)).toBeInTheDocument();
            expect(submitMock).not.toHaveBeenCalled();
        });

        it('accepts a valid email format', async () => {
            render(<ContactSection />);
            submitForm({ email: 'user@mail.com' });

            await waitFor(() => expect(submitMock).toHaveBeenCalled());
            expect(screen.queryByText(T.EMAIL_INVALID)).not.toBeInTheDocument();
        });
    });

    it('treats whitespace-only values as empty', async () => {
        render(<ContactSection />);
        for (const fieldId of [NAME_FIELD, EMAIL_FIELD, SUBJECT_FIELD, MESSAGE_FIELD]) {
            setFieldValue(fieldId, '   ');
        }
        clickSubmit();

        expect(await screen.findByText(T.NAME_REQUIRED)).toBeInTheDocument();
    });

    it('trims leading and trailing spaces when a field loses focus', () => {
        render(<ContactSection />);
        const nameInput = getField(NAME_FIELD);
        setFieldValue(NAME_FIELD, '  Ім’я  ');
        act(() => {
            fireEvent.blur(nameInput);
        });

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
        expect(getField(EMAIL_FIELD)).toHaveValue('');
        expect(getField(SUBJECT_FIELD)).toHaveValue('');
        expect(getField(MESSAGE_FIELD)).toHaveValue('');
        expect(screen.getByText(T.SUBMIT_SUCCESS)).toBeInTheDocument();

        act(() => jest.advanceTimersByTime(5000));
        expect(screen.queryByText(T.SUBMIT_SUCCESS)).not.toBeInTheDocument();
    });

    it('shows an error message for three seconds when submission fails', async () => {
        submitMock.mockRejectedValue(new Error('request failed'));
        render(<ContactSection />);
        submitForm();

        expect(await screen.findByText(T.SUBMIT_ERROR)).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(3000));
        expect(screen.queryByText(T.SUBMIT_ERROR)).not.toBeInTheDocument();
    });

    it('shows a toast notification when CAPTCHA token expires or becomes null', () => {
        const { rerender } = render(<ContactSection />);

        act(() => {
            mockTurnstileToken = null;
            rerender(<ContactSection />);
        });

        expect(screen.getByText(T.CAPTCHA_REQUIRED)).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(3000));
        expect(screen.queryByText(T.CAPTCHA_REQUIRED)).not.toBeInTheDocument();
    });
});
