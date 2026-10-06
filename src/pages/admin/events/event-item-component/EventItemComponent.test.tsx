import { render, screen, fireEvent } from '@testing-library/react';

import { EventItemComponent } from './EventItemComponent';
import { VisibilityStatus } from '@/types/admin/common';
import { EventItemDto } from '@/types/admin/events';
import { EVENT_ITEMS_TEXT } from '@/const/admin/events';

jest.mock('@/components/admin/visibility-status-label/VisibilityStatusLabel', () => ({
    VisibilityStatusLabel: ({ status }: { status: number }) => (
        <div data-testid="visibility-status-label">{String(status)}</div>
    ),
}));

jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({
        'aria-label': ariaLabel,
        type,
        onClick,
    }: {
        'aria-label': string;
        type?: 'button' | 'submit' | 'reset';
        onClick?: () => void;
    }) => (
        <button aria-label={ariaLabel} type={type} onClick={onClick}>
            {ariaLabel}
        </button>
    ),
}));

describe('EventItemComponent', () => {
    const item = {
        id: 1,
        title: 'Test event',
        description: 'Test event description',
        publishedAt: '2024-01-15T00:00:00.000Z',
        status: VisibilityStatus.Published,
    } as EventItemDto;

    it('renders the event title', () => {
        render(<EventItemComponent item={item} onEdit={jest.fn()} />);

        expect(screen.getByText(item.title)).toBeInTheDocument();
    });

    it('renders the event description', () => {
        render(<EventItemComponent item={item} onEdit={jest.fn()} />);

        expect(screen.getByText(item.description)).toBeInTheDocument();
    });

    it('renders the published date in Ukrainian locale', () => {
        render(<EventItemComponent item={item} onEdit={jest.fn()} />);

        const expectedDate = new Date(item.publishedAt).toLocaleDateString('uk-UA');

        expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });

    it('renders the visibility status', () => {
        render(<EventItemComponent item={item} onEdit={jest.fn()} />);

        expect(screen.getByTestId('visibility-status-label')).toHaveTextContent(String(VisibilityStatus.Published));
    });

    it('renders the edit and delete buttons', () => {
        render(<EventItemComponent item={item} onEdit={jest.fn()} />);

        expect(
            screen.getByRole('button', {
                name: EVENT_ITEMS_TEXT.ACTIONS.EDIT,
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: EVENT_ITEMS_TEXT.ACTIONS.DELETE,
            }),
        ).toBeInTheDocument();
    });

    it('renders both buttons with type button', () => {
        render(<EventItemComponent item={item} onEdit={jest.fn()} />);

        expect(
            screen.getByRole('button', {
                name: EVENT_ITEMS_TEXT.ACTIONS.EDIT,
            }),
        ).toHaveAttribute('type', 'button');

        expect(
            screen.getByRole('button', {
                name: EVENT_ITEMS_TEXT.ACTIONS.DELETE,
            }),
        ).toHaveAttribute('type', 'button');
    });

    it('calls onEdit with the item when the edit icon is clicked', () => {
        const onEdit = jest.fn();
        render(<EventItemComponent item={item} onEdit={onEdit} />);

        fireEvent.click(screen.getByLabelText(EVENT_ITEMS_TEXT.ACTIONS.EDIT));

        expect(onEdit).toHaveBeenCalledWith(item);
    });
});
