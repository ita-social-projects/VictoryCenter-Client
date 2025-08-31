import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramsSection } from './ProgramsSection';
import { programPageDataFetch } from '../../../../services/api/public/programs/programs-api';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';

jest.mock('./program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: any) => <div data-testid="program-card">{program.name}</div>,
}));

jest.mock('../../../../services/api/public/programs/programs-api');

describe('ProgramsSection', () => {
    const mockPrograms = {
        programsCategories: [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' },
        ],
        programsData: [
            {
                id: 1,
                image: null,
                name: 'Program A',
                description: 'Description A',
                categories: [{ id: 1, name: 'Category 1' }],
            },
            {
                id: 2,
                image: null,
                name: 'Program B',
                description: 'Description B',
                categories: [{ id: 2, name: 'Category 2' }],
            },
        ],
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        (programPageDataFetch as jest.Mock).mockImplementation(
            () => new Promise(() => {}), // never resolves
        );

        render(<ProgramsSection />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders programs after successful fetch', async () => {
        (programPageDataFetch as jest.Mock).mockResolvedValue(mockPrograms);

        render(<ProgramsSection />);

        expect(await screen.findAllByTestId('program-card')).toHaveLength(2);
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();

        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
        expect(screen.getByText('Усі')).toBeInTheDocument();
    });

    it('filters programs by category', async () => {
        (programPageDataFetch as jest.Mock).mockResolvedValue(mockPrograms);

        render(<ProgramsSection />);

        await screen.findAllByTestId('program-card');

        fireEvent.click(screen.getByText('Category 1'));

        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.queryByText('Program B')).not.toBeInTheDocument();
    });

    it('resets filter when clicking "Усі"', async () => {
        (programPageDataFetch as jest.Mock).mockResolvedValue(mockPrograms);

        render(<ProgramsSection />);

        await screen.findAllByTestId('program-card');

        fireEvent.click(screen.getByText('Category 2'));
        expect(screen.getByText('Program B')).toBeInTheDocument();
        expect(screen.queryByText('Program A')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Усі'));
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();
    });

    it('renders error message when fetch fails', async () => {
        (programPageDataFetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        render(<ProgramsSection />);

        expect(await screen.findByRole('alert')).toHaveTextContent(FAILED_TO_LOAD_THE_PROGRAMS);
    });
});
