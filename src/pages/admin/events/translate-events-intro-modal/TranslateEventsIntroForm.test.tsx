import '@testing-library/jest-dom';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { EVENTS_TEXT } from '@/const/admin/events';
import { EventsIntroTranslationField, TranslateEventsIntroForm } from './TranslateEventsIntroForm';

const TranslateEventsIntroFormHarness = ({ field }: { field: EventsIntroTranslationField }) => {
    const [value, setValue] = useState('');

    return (
        <>
            <TranslateEventsIntroForm field={field} value={value} onChange={setValue} onBlur={jest.fn()} />
            <output data-testid="controlled-value">{value}</output>
        </>
    );
};

describe('TranslateEventsIntroForm', () => {
    it('renders a controlled textarea for the page description', () => {
        render(<TranslateEventsIntroFormHarness field="pageDescription" />);

        const field = screen.getByRole('textbox', {
            name: new RegExp(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE),
        });

        expect(field).toBeInstanceOf(HTMLTextAreaElement);
        fireEvent.change(field, { target: { value: 'Description translation' } });
        expect(screen.getByTestId('controlled-value')).toHaveTextContent('Description translation');
        expect(screen.getByText('23/1000')).toBeInTheDocument();
    });

    it('renders a controlled textarea with a counter below for the events block title', () => {
        render(<TranslateEventsIntroFormHarness field="eventsBlockTitle" />);

        const field = screen.getByRole('textbox', {
            name: new RegExp(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE),
        });

        expect(field).toBeInstanceOf(HTMLTextAreaElement);
        fireEvent.change(field, { target: { value: 'Title translation' } });
        expect(screen.getByTestId('controlled-value')).toHaveTextContent('Title translation');
        expect(screen.getByText('17/100')).toBeInTheDocument();
    });
});
