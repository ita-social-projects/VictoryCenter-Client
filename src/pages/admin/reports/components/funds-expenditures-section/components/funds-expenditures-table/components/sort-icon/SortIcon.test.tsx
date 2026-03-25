import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SortIcon } from './SortIcon';

jest.mock('./SortIcon.module.scss', () => ({
    'sort-icons': 'sort-icons',
    'sort-icon': 'sort-icon',
    'sort-icon-active': 'sort-icon-active',
}));

jest.mock('@/assets/icons/chevron-up.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="chevron-up" className={className} />,
}));

jest.mock('@/assets/icons/chevron-down.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="chevron-down" className={className} />,
}));

describe('SortIcon', () => {
    it('shows neutral state icons when not active', () => {
        render(<SortIcon isActive={false} direction={null} />);

        expect(screen.getByTestId('chevron-up')).toHaveClass('sort-icon');
        expect(screen.getByTestId('chevron-down')).toHaveClass('sort-icon');
    });

    it('shows active up icon for ascending direction', () => {
        render(<SortIcon isActive={true} direction="asc" />);

        expect(screen.getByTestId('chevron-up')).toHaveClass('sort-icon-active');
        expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument();
    });

    it('shows active down icon for descending direction', () => {
        render(<SortIcon isActive={true} direction="desc" />);

        expect(screen.getByTestId('chevron-down')).toHaveClass('sort-icon-active');
        expect(screen.queryByTestId('chevron-up')).not.toBeInTheDocument();
    });
});
