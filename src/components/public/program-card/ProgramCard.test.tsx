import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramCard } from './ProgramCard';
import { PublishedProgramDto } from '@/types/public/programs-page';

jest.mock('@/assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-up-right" {...props} />,
}));

describe('ProgramCard', () => {
    const program: PublishedProgramDto = {
        id: 1,
        previewImage: {
            id: 1,
            url: 'mocked-image',
            mimeType: 'mocked-mime-type',
        },
        name: 'Program A',
        description: 'Description A',
        categories: [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ],
    };

    it('renders program name, categories, and description', () => {
        render(<ProgramCard program={program} className={''} />);
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Category 1, Category 2')).toBeInTheDocument();
        expect(screen.getByText('Description A')).toBeInTheDocument();
    });

    it('renders program image using mapImageToBase64', () => {
        render(<ProgramCard program={program} className={''} />);
        const img = screen.getByAltText('Program A') as HTMLImageElement;
        expect(img).toHaveAttribute('src', 'mocked-image');
    });

    it('renders arrow icons', () => {
        render(<ProgramCard program={program} className={''} />);
        const arrows = screen.getAllByTestId('arrow-up-right');
        expect(arrows).toHaveLength(1);
    });
});
