import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactUsPage } from './ContactUsPage';
import { CONTACT_US_PAGE_DATA } from '@/utils/mock-data/public';
import { MemoryRouter } from 'react-router-dom';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';

jest.mock('react-i18next', () => ({
    ...jest.requireActual('react-i18next'),
    useLocation: () => ({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'testKey',
    }),
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: () => ({
        address: 'вул. Шулявська, буд. 20/22, кв. 41.',
        motto: 'Україна, 04116. (юридична адреса)',
    }),
}));

jest.mock(
    './ContactUsPage.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

jest.mock('./components/contact-details-section/ContactDetailsSection', () => ({
    ContactDetailsSection: (props: Record<string, unknown>) => {
        const onCopyEmail = props.onCopyEmail as (() => void) | undefined;
        const onCopyPhone = props.onCopyPhone as (() => void) | undefined;

        return (
            <div data-testid="contact-details-section" data-props={JSON.stringify(props)}>
                <button type="button" onClick={onCopyEmail}>
                    trigger-copy-email
                </button>
                <button type="button" onClick={onCopyPhone}>
                    trigger-copy-phone
                </button>
            </div>
        );
    },
}));

jest.mock('./components/contact-form-card/ContactFormCard', () => ({
    ContactFormCard: (props: Record<string, unknown>) => (
        <div data-testid="contact-form-card" data-props={JSON.stringify(props)} />
    ),
}));

describe('ContactUsPage', () => {
    beforeEach(() => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: CONTACT_US_PAGE_DATA,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });
    });

    it('renders composed sections using mock data', () => {
        render(
            <MemoryRouter>
                <ContactUsPage />
            </MemoryRouter>,
        );

        const detailsSection = screen.getByTestId('contact-details-section');
        const formCard = screen.getByTestId('contact-form-card');

        expect(detailsSection).toBeInTheDocument();
        expect(formCard).toBeInTheDocument();

        expect(detailsSection.getAttribute('data-props')).toContain(CONTACT_US_PAGE_DATA.contacts.email);
        expect(detailsSection.getAttribute('data-props')).toContain('Україна, 04116. (юридична адреса)');
        expect(formCard.getAttribute('data-props')).toContain("Ваше ім'я");
    });

    it('copies email and phone via contact details callbacks', async () => {
        const user = userEvent.setup();
        const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

        render(
            <MemoryRouter>
                <ContactUsPage />
            </MemoryRouter>,
        );

        await user.click(screen.getByRole('button', { name: 'trigger-copy-email' }));
        await user.click(screen.getByRole('button', { name: 'trigger-copy-phone' }));

        await waitFor(() => {
            expect(writeTextSpy).toHaveBeenNthCalledWith(1, CONTACT_US_PAGE_DATA.contacts.email);
            expect(writeTextSpy).toHaveBeenNthCalledWith(2, CONTACT_US_PAGE_DATA.contacts.phone);
        });

        writeTextSpy.mockRestore();
    });

    it('renders loader when data is fetching', () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(
            <MemoryRouter>
                <ContactUsPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByTestId('contact-details-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('contact-form-card')).not.toBeInTheDocument();
    });

    it('still renders contact info and form when profile fetch fails', () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            error: 'Failed to fetch data',
            refetch: jest.fn(),
            setData: jest.fn(),
        });

        render(
            <MemoryRouter>
                <ContactUsPage />
            </MemoryRouter>,
        );

        expect(screen.queryByText('downloadError')).not.toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByTestId('contact-details-section')).toBeInTheDocument();
        expect(screen.getByTestId('contact-form-card')).toBeInTheDocument();
    });
});
