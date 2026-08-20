import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ContactDetailsSection } from './ContactDetailsSection';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

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

const DEFAULT_PROPS = {
    title: 'We are always open for you',
    description: 'Victory starts with you',
    contactsTitle: 'Our contacts',
    socialLinksTitle: 'Social links',
    email: 'victorycenter@gmail.com',
    phone: '+380 50 334 4448',
    address: 'Kyiv, Khreshchatyk str., 2',
    motto: 'VICTORY STARTS WITH YOU',
    socialLinks: [{ label: 'Instagram', url: 'https://instagram.com/victorycenterua' }],
    copyEmailLabel: 'Copy email',
    copyPhoneLabel: 'Copy phone',
    onCopyEmail: jest.fn(),
    onCopyPhone: jest.fn(),
};

describe('ContactDetailsSection', () => {
    it('renders contact, requisites and social information', () => {
        render(<ContactDetailsSection {...DEFAULT_PROPS} />);

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

    describe('copy snackbar', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('shows snackbar and calls callback on email copy click', () => {
            const onCopyEmail = jest.fn();
            render(<ContactDetailsSection {...DEFAULT_PROPS} onCopyEmail={onCopyEmail} />);

            fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));

            expect(onCopyEmail).toHaveBeenCalledTimes(1);
            expect(screen.getByRole('status')).toHaveTextContent('COPIED_GLOBAL_MESSAGE');
        });

        it('shows snackbar and calls callback on phone copy click', () => {
            const onCopyPhone = jest.fn();
            render(<ContactDetailsSection {...DEFAULT_PROPS} onCopyPhone={onCopyPhone} />);

            fireEvent.click(screen.getByRole('button', { name: 'Copy phone' }));

            expect(onCopyPhone).toHaveBeenCalledTimes(1);
            expect(screen.getByRole('status')).toHaveTextContent('COPIED_GLOBAL_MESSAGE');
        });

        it('hides snackbar after 2 seconds', () => {
            render(<ContactDetailsSection {...DEFAULT_PROPS} />);

            fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
            expect(screen.getByRole('status')).toBeInTheDocument();

            act(() => jest.advanceTimersByTime(2000));

            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        it('shows only one snackbar on rapid clicks of different buttons', () => {
            render(<ContactDetailsSection {...DEFAULT_PROPS} />);

            fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
            fireEvent.click(screen.getByRole('button', { name: 'Copy phone' }));

            expect(screen.getAllByRole('status')).toHaveLength(1);
        });
    });
});
