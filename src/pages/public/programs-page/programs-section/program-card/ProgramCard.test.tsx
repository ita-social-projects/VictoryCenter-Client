import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramCard } from './ProgramCard';
import { PublishedProgramDto } from '../../../../../types/public/programs-page';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';

jest.mock('../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64', () => ({
    mapImageToBase64: jest.fn(),
}));

jest.mock('../../../../../assets/icons/arrow-up-right.svg', () => 'arrowBlack.svg');
jest.mock('../../../../../assets/icons/arrow-up-right-yellow.svg', () => 'arrowYellow.svg');

describe('ProgramCard', () => {
    const program: PublishedProgramDto = {
        id: 1,
        image: null,
        name: 'Program A',
        description: 'Description A',
        categories: [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ],
    };

    beforeEach(() => {
        (mapImageToBase64 as jest.Mock).mockReturnValue('mocked-image');
    });

    it('renders program name, categories, and description', () => {
        render(<ProgramCard program={program} />);
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Category 1, Category 2')).toBeInTheDocument();
        expect(screen.getByText('Description A')).toBeInTheDocument();
    });

    it('renders program image using mapImageToBase64', () => {
        render(<ProgramCard program={program} />);
        expect(mapImageToBase64).toHaveBeenCalledWith(program.image);
        const img = screen.getByAltText('Program A') as HTMLImageElement;
        expect(img).toHaveAttribute('src', 'mocked-image');
    });

    it('renders arrow images', () => {
        render(<ProgramCard program={program} />);
        const arrows = screen.getAllByAltText('');
        expect(arrows).toHaveLength(2);
        expect(arrows[0]).toHaveAttribute('src', 'arrowYellow.svg');
        expect(arrows[1]).toHaveAttribute('src', 'arrowBlack.svg');
    });
});
