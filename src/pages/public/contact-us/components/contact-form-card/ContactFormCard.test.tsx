import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContactFormCard } from './ContactFormCard';

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

describe('ContactFormCard', () => {
    it('renders all placeholders and submit label', () => {
        render(
            <ContactFormCard
                title="Contact form"
                namePlaceholder="Your name"
                emailPlaceholder="E-mail"
                subjectPlaceholder="Subject"
                messagePlaceholder="Write your message"
                submitLabel="Send"
            />,
        );

        expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Write your message')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });
});
