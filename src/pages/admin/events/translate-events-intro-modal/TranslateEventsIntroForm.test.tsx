import '@testing-library/jest-dom';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EVENTS_TEXT } from '@/const/admin/events';
import { EventsIntroTranslationField, TranslateEventsIntroForm } from './TranslateEventsIntroForm';

const TranslateEventsIntroFormHarness = ({
    field,
    error,
    initialValue = '',
}: {
    field: EventsIntroTranslationField;
    error?: string;
    initialValue?: string;
}) => {
    const [value, setValue] = useState(initialValue);

    return (
        <>
            <TranslateEventsIntroForm
                field={field}
                value={value}
                onChange={setValue}
                onBlur={jest.fn()}
                error={error}
            />
            <output data-testid="controlled-value">{value}</output>
        </>
    );
};

describe('TranslateEventsIntroForm', () => {
    it.each([
        [
            'page description',
            'pageDescription',
            EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE,
            'Description translation',
            '23/1000',
        ],
        [
            'events block title',
            'eventsBlockTitle',
            EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE,
            'Title translation',
            '17/100',
        ],
    ] as const)(
        'renders a controlled textarea with a counter below for the %s',
        (_, fieldName, label, value, counter) => {
            render(<TranslateEventsIntroFormHarness field={fieldName} />);

            const field = screen.getByRole('textbox', { name: new RegExp(label) });

            expect(field).toBeInstanceOf(HTMLTextAreaElement);
            fireEvent.change(field, { target: { value } });
            expect(screen.getByTestId('controlled-value')).toHaveTextContent(value);
            expect(screen.getByText(counter)).toBeInTheDocument();
        },
    );

    it('normalizes leading and consecutive spaces before updating the counter', () => {
        render(<TranslateEventsIntroFormHarness field="eventsBlockTitle" />);
        const field = screen.getByRole('textbox', {
            name: new RegExp(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE),
        });

        fireEvent.change(field, { target: { value: '   Hello   world' } });

        expect(screen.getByTestId('controlled-value')).toHaveTextContent('Hello world');
        expect(screen.getByText('11/100')).toBeInTheDocument();
    });

    it('prevents input past the configured character limit', async () => {
        const user = userEvent.setup();
        render(<TranslateEventsIntroFormHarness field="eventsBlockTitle" />);
        const field = screen.getByRole('textbox', {
            name: new RegExp(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE),
        });

        await user.type(field, 'a'.repeat(EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE + 1));

        expect(field).toHaveValue('a'.repeat(EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE));
        expect(screen.getByText('100/100')).toBeInTheDocument();
    });

    it('shows the clean-up icon only while focused and clears only its field with error styling', async () => {
        const user = userEvent.setup();
        render(
            <TranslateEventsIntroFormHarness
                field="eventsBlockTitle"
                error="Validation error"
                initialValue="Translation text"
            />,
        );
        const field = screen.getByRole('textbox', {
            name: new RegExp(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE),
        });

        await user.click(field);
        const clearButton = screen.getByRole('button', { name: 'Clear input' });
        expect(clearButton).toHaveClass('char-limit-textarea__clear-button--error');

        await user.tab();
        expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();

        await user.click(field);
        await user.click(screen.getByRole('button', { name: 'Clear input' }));

        expect(screen.getByTestId('controlled-value')).toBeEmptyDOMElement();
        expect(screen.getByText('0/100')).toBeInTheDocument();
    });
});
