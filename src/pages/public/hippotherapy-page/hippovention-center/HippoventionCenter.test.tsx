import { render, screen } from '@testing-library/react';
import { HippoventionCenter } from './HippoventionCenter';
import { useMediaQuery } from '@/hooks/common/use-media-query/useMediaQuery';

jest.mock('@/hooks/common/use-media-query/useMediaQuery', () => ({
    useMediaQuery: jest.fn(),
}));

const mockedUseMediaQuery = useMediaQuery as jest.Mock;

describe('HippoventionCenter', () => {
    const title = 'Test Title';
    const imgURL = 'test-image.jpg';
    const imgAlternativeText = 'Test Image';
    const text = 'Test Text';
    const pros = ['Pro 1', 'Pro 2', 'Pro 3'];

    beforeEach(() => {
        mockedUseMediaQuery.mockReturnValue(false);
    });

    it('should render title, text and pros list', () => {
        render(<HippoventionCenter {...{ title, imgURL, imgAlternativeText, text, pros }} />);
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByAltText(imgAlternativeText)).toBeInTheDocument();
        expect(screen.getByText(text)).toBeInTheDocument();
        pros.forEach((pro) => {
            expect(screen.getByText(pro)).toBeInTheDocument();
        });
    });

    it('should not render image on desktop', () => {
        mockedUseMediaQuery.mockReturnValue(true);
        render(<HippoventionCenter {...{ title, imgURL, imgAlternativeText, text, pros }} />);
        expect(screen.queryByAltText(imgAlternativeText)).not.toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
    });
});
