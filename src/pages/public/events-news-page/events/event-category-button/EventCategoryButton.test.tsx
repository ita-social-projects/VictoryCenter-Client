import { render, screen, fireEvent } from '@testing-library/react';
import { EventCategoryButton } from './EventCategoryButton';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { Tag } from '@/types/public/events-news';

jest.mock('@/hooks/common/use-get-localization/useGetLocalization');

const mockTag: Tag = {
    id: '1',
    name: 'Default Title',
    localizations: [
        {
            language: { id: 2, code: 'en' },
            name: 'Translated Title',
        } as any,
    ],
};

describe('EventCategoryButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the button with the localized name', () => {
        (useGetLocalization as jest.Mock).mockReturnValue({ name: 'Translated Title' });

        render(<EventCategoryButton tag={mockTag} isActive={false} onClick={jest.fn()} />);

        expect(screen.getByText('Translated Title')).toBeInTheDocument();
    });

    it('applies the black-button class when isActive is true', () => {
        (useGetLocalization as jest.Mock).mockReturnValue({ name: 'Default Title' });

        render(<EventCategoryButton tag={mockTag} isActive={true} onClick={jest.fn()} />);

        const button = screen.getByText('Default Title');
        expect(button).toHaveClass('black-button');
        expect(button).not.toHaveClass('white-button');
    });

    it('applies the white-button class when isActive is false', () => {
        (useGetLocalization as jest.Mock).mockReturnValue({ name: 'Default Title' });

        render(<EventCategoryButton tag={mockTag} isActive={false} onClick={jest.fn()} />);

        const button = screen.getByText('Default Title');
        expect(button).toHaveClass('white-button');
        expect(button).not.toHaveClass('black-button');
    });

    it('calls the onClick handler when clicked', () => {
        (useGetLocalization as jest.Mock).mockReturnValue({ name: 'Default Title' });
        const handleClick = jest.fn();

        render(<EventCategoryButton tag={mockTag} isActive={false} onClick={handleClick} />);

        fireEvent.click(screen.getByText('Default Title'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
