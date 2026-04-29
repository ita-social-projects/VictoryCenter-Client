import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContactDetailsSection } from './ContactDetailsSection';

jest.mock(
    './contact-details-section.module.scss',
    () =>
        new Proxy(
            {},
            {
                get: (_, key) => key,
            },
        ),
);

jest.mock('@/assets/icons/mail.svg', () => ({
    ReactComponent: () => <svg data-testid="mail-icon" />,
}));

jest.mock('@/assets/icons/phone.svg', () => ({
    ReactComponent: () => <svg data-testid="phone-icon" />,
}));

jest.mock('@/assets/icons/map-pin.svg', () => ({
    ReactComponent: () => <svg data-testid="map-pin-icon" />,
}));

jest.mock('@/assets/icons/copy.svg', () => ({
    ReactComponent: () => <svg data-testid="copy-icon" />,
}));

describe('ContactDetailsSection', () => {
    it('renders contact, requisites and social information', () => {
        render(
            <ContactDetailsSection
                title="We are always open for you"
                description="Victory starts with you"
                contactsTitle="Our contacts"
                socialLinksTitle="Social links"
                email="victorycenter@gmail.com"
                phone="+380 50 334 4448"
                address="Kyiv, Khreshchatyk str., 2"
                motto="VICTORY STARTS WITH YOU"
                socialLinks={[{ label: 'Instagram', url: 'https://instagram.com/victorycenterua' }]}
                copyEmailLabel="Copy email"
                copyPhoneLabel="Copy phone"
                onCopyEmail={jest.fn()}
                onCopyPhone={jest.fn()}
            />,
        );

        expect(screen.getByRole('heading', { name: 'We are always open for you' })).toBeInTheDocument();
        expect(screen.getByText('Victory starts with you')).toBeInTheDocument();
        expect(screen.getByText('Our contacts')).toBeInTheDocument();
        expect(screen.getByText('Social links')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
            'href',
            'https://instagram.com/victorycenterua',
        );
        expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Copy phone' })).toBeInTheDocument();
    });
});
