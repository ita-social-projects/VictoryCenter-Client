import React from 'react';
import { Program } from '../../../../types/ProgramPage';
import { ProgramSection } from './ProgramSection';
import { render, screen, waitFor } from '@testing-library/react';
import * as ProgramPageFetchModule from '../../../../services/data-fetch/program-page-data-fetch/programPageDataFetch';

const spyProgramPageDataFetch = jest.spyOn(ProgramPageFetchModule, "programPageDataFetch");

const mockPrograms = [
    {
        image: "https://via.placeholder.com/200x200?text=Ponys",
        title: "titletest1",
        subtitle: "subtitletest1",
        description: "descriptiontest1"
    },
    {
        image: "https://via.placeholder.com/200x200?text=Ponys",
        title: "titletest2",
        subtitle: "subtitletest2",
        description: "descriptiontest2"
    },
    {
        image: "https://via.placeholder.com/200x200?text=Ponys",
        title: "titletest3",
        subtitle: "subtitletest3",
        description: "descriptiontest3"
    }
];
jest.mock('./program-card/ProgramCard', () => ({
    ProgramCard: ({program}: {program: Program}) => (
        <div data-testid="test-card-content">
            <img src={program.image} alt={program.title}/>
            <h2>{program.title}</h2>
            <h4>{program.subtitle}</h4>
            <p>{program.description}</p>
        </div>
    )
}));
describe('test program section', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    test('should render correctly', async () => {
        spyProgramPageDataFetch.mockResolvedValue({programData: mockPrograms});
        render(<ProgramSection/>);
        expect(spyProgramPageDataFetch).toHaveBeenCalledTimes(1);
        
        await waitFor(() => {
            expect(screen.getByText('titletest1')).toBeInTheDocument();
            expect(screen.getByRole('heading', {name: 'subtitletest1'})).toBeInTheDocument();
            
            expect(screen.getByText('titletest2')).toBeInTheDocument();
            expect(screen.getByRole('heading', {name: 'subtitletest2'})).toBeInTheDocument();
            
            expect(screen.getByText('titletest3')).toBeInTheDocument();
            expect(screen.getByRole('heading', {name: 'subtitletest3'})).toBeInTheDocument();
            
            expect(screen.getByAltText('titletest1')).toBeInTheDocument();
            expect(screen.getByAltText('titletest1'))
                .toHaveAttribute("src", 
                    "https://via.placeholder.com/200x200?text=Ponys");
            
            const cards = screen.queryAllByTestId("test-card-content");
            expect(cards.length).toEqual(3);
        });
    });
    test('should render with no cards', async () => {
        spyProgramPageDataFetch.mockResolvedValue({programData: []});
        render(<ProgramSection/>)
        expect(spyProgramPageDataFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            const cards = screen.queryAllByTestId("test-card-content");
            expect(cards.length).toEqual(0);
        });
    });
    test('should render without crashing', async () => {
        spyProgramPageDataFetch.mockRejectedValueOnce(new Error("Fetch failed"));
        render(<ProgramSection/>);
        expect(spyProgramPageDataFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            const cards = screen.queryAllByTestId("test-card-content");
            expect(cards.length).toEqual(0);
            const errorMessage = document.querySelector('.error-message');
            expect(errorMessage).toBeInTheDocument();
        });
    });
});