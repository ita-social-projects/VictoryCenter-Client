import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramCard } from './ProgramCard';
import { PublishedProgramDto } from '@/types/public/programs-page';

jest.mock('@/assets/icons/arrow-up-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-up-right" {...props} />,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

jest.mock('@/const/public/routes', () => ({
    PUBLIC_ROUTES: {
        PROGRAM_DETAIL: {
            getPath: (slug: string) => `/programs/${slug}`,
        },
    },
}));

describe('ProgramCard', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });
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
        slug: 'program-a',
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

    it('navigates to program detail page when card is clicked and slug exists', async () => {
        const user = userEvent.setup();
        render(<ProgramCard program={program} className={''} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/programs/program-a');
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not navigate when card is clicked and slug is missing', async () => {
        const user = userEvent.setup();
        const programWithoutSlug = { ...program, slug: undefined } as unknown as PublishedProgramDto;
        render(<ProgramCard program={programWithoutSlug} className={''} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates when Enter key is pressed on the card', async () => {
        const user = userEvent.setup();
        render(<ProgramCard program={program} className={''} />);

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard('{Enter}');

        expect(mockNavigate).toHaveBeenCalledWith('/programs/program-a');
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('navigates when Space key is pressed on the card', async () => {
        const user = userEvent.setup();
        render(<ProgramCard program={program} className={''} />);

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard(' ');

        expect(mockNavigate).toHaveBeenCalledWith('/programs/program-a');
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not navigate when other keys are pressed', async () => {
        const user = userEvent.setup();
        render(<ProgramCard program={program} className={''} />);

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard('{Escape}');
        await user.keyboard('a');

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('has tabIndex 0 when slug exists', () => {
        render(<ProgramCard program={program} className={''} />);
        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('has tabIndex -1 when slug is missing', () => {
        const programWithoutSlug = { ...program, slug: undefined } as unknown as PublishedProgramDto;
        render(<ProgramCard program={programWithoutSlug} className={''} />);
        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('tabIndex', '-1');
    });
});
