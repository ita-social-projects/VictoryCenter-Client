import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactUsPage } from './ContactUsPage';
import { CONTACT_US_PAGE_DATA } from '@/utils/mock-data/public';

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
    it('renders composed sections using mock data', () => {
        render(<ContactUsPage />);

        const detailsSection = screen.getByTestId('contact-details-section');
        const formCard = screen.getByTestId('contact-form-card');

        expect(detailsSection).toBeInTheDocument();
        expect(formCard).toBeInTheDocument();

        expect(detailsSection.getAttribute('data-props')).toContain(CONTACT_US_PAGE_DATA.contacts.email);
        expect(formCard.getAttribute('data-props')).toContain("Ваше ім'я");
    });

    it('copies email and phone via contact details callbacks', async () => {
        const user = userEvent.setup();
        const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

        render(<ContactUsPage />);

        await user.click(screen.getByRole('button', { name: 'trigger-copy-email' }));
        await user.click(screen.getByRole('button', { name: 'trigger-copy-phone' }));

        await waitFor(() => {
            expect(writeTextSpy).toHaveBeenNthCalledWith(1, CONTACT_US_PAGE_DATA.contacts.email);
            expect(writeTextSpy).toHaveBeenNthCalledWith(2, CONTACT_US_PAGE_DATA.contacts.phone);
        });

        writeTextSpy.mockRestore();
    });
});
