import { render, screen } from '@testing-library/react';

import { EventItemComponent } from './EventItemComponent';
import { VisibilityStatus } from '@/types/admin/common';
import { EventItemDto } from '@/types/admin/events-news';

jest.mock('@/components/admin/visibility-status-label/VisibilityStatusLabel', () => ({
    VisibilityStatusLabel: ({ status }: { status: number }) => (
        <div data-testid="visibility-status-label">{String(status)}</div>
    ),
}));

jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({
        'area-label': areaLabel,
        type,
    }: {
        'area-label': string;
        type?: 'button' | 'submit' | 'reset';
    }) => (
        <button aria-label={areaLabel} type={type}>
            {areaLabel}
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
        render(<EventItemComponent item={item} />);

        expect(screen.getByText(item.title)).toBeInTheDocument();
    });

    it('renders the event description', () => {
        render(<EventItemComponent item={item} />);

        expect(screen.getByText(item.description)).toBeInTheDocument();
    });

    it('renders the published date in Ukrainian locale', () => {
        render(<EventItemComponent item={item} />);

        const expectedDate = new Date(item.publishedAt).toLocaleDateString('uk-UA');

        expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });

    it('renders the visibility status', () => {
        render(<EventItemComponent item={item} />);

        expect(screen.getByTestId('visibility-status-label')).toHaveTextContent(
            String(VisibilityStatus.Published),
        );
    });

    it('renders the edit and delete buttons', () => {
        render(<EventItemComponent item={item} />);

        expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
    });

    it('renders both buttons with type button', () => {
        render(<EventItemComponent item={item} />);

        expect(screen.getByRole('button', { name: 'edit' })).toHaveAttribute(
            'type',
            'button',
        );

        expect(screen.getByRole('button', { name: 'delete' })).toHaveAttribute(
            'type',
            'button',
        );
    });
});