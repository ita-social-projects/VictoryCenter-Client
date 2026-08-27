import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { contactUsPageEn } from '@/locales/en';
import { render, screen } from '@testing-library/react';
import { ContactFormCard } from './ContactFormCard';
import userEvent from '@testing-library/user-event';
import { CONTACT_FORM_LIMITS } from '@/const/public/contact-form';

jest.mock('@/hooks/public/use-turnstile', () => ({
    useTurnstile: () => ({
        token: 'mock-token',
        containerRef: { current: null },
        reset: jest.fn(),
    }),
}));

jest.mock('@/services/api/public/contact-us/contact-us-api', () => ({
    submitContactUsForm: jest.fn(),
}));

jest.mock(
    './contact-form-card.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

const i18nTestInstance = i18n.createInstance();

i18nTestInstance.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['contactUsPage'],
    defaultNS: 'contactUsPage',
    resources: {
        en: {
            contactUsPage: contactUsPageEn,
        },
    },
    interpolation: {
        escapeValue: false,
    },
});

const DEFAULT_PROPS = {
    title: 'Contact form',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'E-mail',
    subjectPlaceholder: 'Subject',
    messagePlaceholder: 'Write your message',
    submitLabel: 'Send',
};

describe('ContactFormCard localization', () => {
    const renderForm = () => {
        return render(
            <I18nextProvider i18n={i18nTestInstance}>
                <ContactFormCard {...DEFAULT_PROPS} />
            </I18nextProvider>,
        );
    };

    it('should display the plural form when multiple characters are remaining', async () => {
        renderForm();

        const subjectInput = screen.getByPlaceholderText('Subject');

        await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX - 5));

        expect(screen.getByText('5 characters remaining')).toBeInTheDocument();
    });

    it('should display the singular form when exactly 1 character is remaining', async () => {
        renderForm();

        const subjectInput = screen.getByPlaceholderText('Subject');

        await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX - 1));

        expect(screen.getByText('1 character remaining')).toBeInTheDocument();
    });

    it('should display the limit reached message when max length is met', async () => {
        renderForm();

        const subjectInput = screen.getByPlaceholderText('Subject');

        await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX));

        expect(screen.getByText('Character limit reached')).toBeInTheDocument();
    });
});
