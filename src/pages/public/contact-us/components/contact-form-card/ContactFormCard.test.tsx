import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactFormCard } from './ContactFormCard';
import { CONTACT_FORM_LIMITS, CONTACT_FORM_MESSAGES } from '@/const/public/contact-form';

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

const DEFAULT_PROPS = {
    title: 'Contact form',
    namePlaceholder: "Ваше ім'я",
    emailPlaceholder: 'E-mail',
    subjectPlaceholder: 'Тема звернення',
    messagePlaceholder: 'Напишіть ваше повідомлення',
    submitLabel: 'Надіслати',
};

const renderForm = () => render(<ContactFormCard {...DEFAULT_PROPS} />);

describe('ContactFormCard', () => {
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
        it('shows warn hint when subject reaches WARN_AT characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.WARN_AT));

            const remaining = CONTACT_FORM_LIMITS.SUBJECT.MAX - CONTACT_FORM_LIMITS.SUBJECT.WARN_AT;
            expect(screen.getByText(CONTACT_FORM_MESSAGES.SUBJECT.getWarnMessage(remaining))).toBeInTheDocument();
        });

        it('shows limit-reached message when subject hits MAX characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.MAX));

            expect(screen.getByText(CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED)).toBeInTheDocument();
        });

        it('shows min-length error on blur when subject < MIN characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            fireEvent.change(subjectInput, { target: { value: 'ab' } });
            fireEvent.blur(subjectInput);

            expect(await screen.findByText(CONTACT_FORM_MESSAGES.SUBJECT.MIN_ERROR)).toBeInTheDocument();
        });

        it('does not show hint below WARN_AT characters', async () => {
            renderForm();
            const subjectInput = screen.getByPlaceholderText('Тема звернення');

            await userEvent.type(subjectInput, 'a'.repeat(CONTACT_FORM_LIMITS.SUBJECT.WARN_AT - 1));

            expect(screen.queryByText(CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED)).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    CONTACT_FORM_MESSAGES.SUBJECT.getWarnMessage(
                        CONTACT_FORM_LIMITS.SUBJECT.MAX - (CONTACT_FORM_LIMITS.SUBJECT.WARN_AT - 1),
                    ),
                ),
            ).not.toBeInTheDocument();
        });
    });

    describe('Message field', () => {
        it('shows warn hint when message reaches WARN_AT characters', () => {
            renderForm();
            const messageTextarea = screen.getByPlaceholderText('Напишіть ваше повідомлення');

            fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.WARN_AT) } });

            const remaining = CONTACT_FORM_LIMITS.MESSAGE.MAX - CONTACT_FORM_LIMITS.MESSAGE.WARN_AT;
            expect(screen.getByText(CONTACT_FORM_MESSAGES.MESSAGE.getWarnMessage(remaining))).toBeInTheDocument();
        });

        it('shows limit-reached message when message hits MAX characters', () => {
            renderForm();
            const messageTextarea = screen.getByPlaceholderText('Напишіть ваше повідомлення');

            fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(CONTACT_FORM_LIMITS.MESSAGE.MAX) } });

            expect(screen.getByText(CONTACT_FORM_MESSAGES.MESSAGE.LIMIT_REACHED)).toBeInTheDocument();
        });

        it('shows min-length error on blur when message < MIN characters', async () => {
            renderForm();
            const messageTextarea = screen.getByPlaceholderText('Напишіть ваше повідомлення');

            fireEvent.change(messageTextarea, { target: { value: 'short' } });
            fireEvent.blur(messageTextarea);

            expect(await screen.findByText(CONTACT_FORM_MESSAGES.MESSAGE.MIN_ERROR)).toBeInTheDocument();
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

            expect(await screen.findByText(CONTACT_FORM_MESSAGES.EMAIL.INVALID)).toBeInTheDocument();
        });

        it('does not show error for valid email', async () => {
            renderForm();
            fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'user@mail.com' } });
            submitForm();

            expect(screen.queryByText(CONTACT_FORM_MESSAGES.EMAIL.INVALID)).not.toBeInTheDocument();
        });
    });
});
